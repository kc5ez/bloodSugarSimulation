// HELPER FUNCTIONS

function getAllWithinHour(timestamp, entries) {
    let entriesWithinHour = [];

    let oneHourBefore = new Date(timestamp);
    let twoHoursBefore = new Date(timestamp);

    oneHourBefore.setHours(oneHourBefore.getHours() - 1);
    twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);

    entries.map((entry) => {
        if(entry.time_stamp >= oneHourBefore && entry.time_stamp < timestamp){
            entriesWithinHour.push(entry);
        }
        if(entry.time_stamp >= twoHoursBefore && entry.time_stamp < oneHourBefore && entry.type === 'food'){
            entriesWithinHour.push(entry);
        }
    });
    return entriesWithinHour;
}

function finish(resultObj, lastTimestamp) {
    let time = lastTimestamp;
    while(resultObj[time] > 80) {
        let nextHour = new Date(time);
        nextHour.setHours(nextHour.getHours() + 1);
        let bloodSugar = resultObj[time];
        let unitsTo80 = Math.abs(80 - bloodSugar);
        if(unitsTo80 < 60) {
            resultObj[nextHour] = 80
        } else {
            if (bloodSugar < 80) {
                resultObj[nextHour] = bloodSugar + unitsTo80;
            } else {
                resultObj[nextHour] = bloodSugar - 80;
            }
        }
        time = nextHour;
    }
    return resultObj;
}

function getNormalization(previousResult, minutesSinceLastCalculation) {
    const unitsFrom80 = Math.abs(80 - previousResult);

    if (minutesSinceLastCalculation < unitsFrom80) {
        if (previousResult < 80) {
            return previousResult + minutesSinceLastCalculation;
        } else {
            return previousResult - minutesSinceLastCalculation
        }
    } else {
        return 80;
    }
}

function getChanges(previousResult, minutesSinceLastCalculation, activityPrior) {
    let ratio = minutesSinceLastCalculation/60;
    let accumulator = 0;

    activityPrior.map((activity) => {
        if(activity.type === 'exercise') {
            accumulator = accumulator - (activity.gi_index * ratio);
        } else {
            accumulator = accumulator + (activity.gi_index * ratio);
        }  
    })

    return previousResult + accumulator;
}

// MAIN FUNCTIONS
function getRelevantTimes(entries) {
    let time = [];

    entries.map((entry) => {
        let date = new Date(entry.time_stamp);
        let oneHourLater = new Date(entry.time_stamp);
        let twoHoursLater = new Date(entry.time_stamp);

        if (!time.includes(date)) {
            time.push(date);
        }
        oneHourLater.setHours(oneHourLater.getHours() + 1);
        twoHoursLater.setHours(twoHoursLater.getHours() + 2);

        if (!time.includes(oneHourLater)) {
            time.push(oneHourLater);
        }

        if (entry.type === 'food' && !time.includes(twoHoursLater)) {
            time.push(twoHoursLater);
        }
    });

    time = time.sort((a, b) => Date.parse(a) - Date.parse(b));
    return Promise.resolve(time);
}

function generateMeasurements(time, entries) {
    let resultObj = {};

    for(let i=0; i< time.length; i++) {
        let timeStamp = time[i];

        if (i === 0) {
            resultObj[timeStamp] = 80;
        } else {
            let activityPrior = getAllWithinHour(timeStamp, entries);
            let minutesSinceLastCalculation = (timeStamp - time[i-1])/60000;
            let previousTimestamp = time[i-1];
            let previousResult = resultObj[previousTimestamp];

            if (activityPrior.length === 0) {
                let unitsFrom80;
                resultObj[timeStamp] = getNormalization(previousResult, minutesSinceLastCalculation);
            } else {
                resultObj[timeStamp] = getChanges(previousResult, minutesSinceLastCalculation, activityPrior);
            }
        }
    }

    resultObj = finish(resultObj, time[time.length -1]);   
    return Promise.resolve(resultObj); 
}

export function calculate(req, res, next) {
    const entries = req.data;

    let time = [];

    getRelevantTimes(entries)
        .then((time) => 
            generateMeasurements(time, entries)
        ).then((result) => 
            req.resultObj = result
        ).then(() => next()
        ).catch((err) => console.log(err));
}
