// calculates when blood sugar hit above/below 150
function calculateTimeToGlycation(previousResult, currentResult, previousTimestamp, currentTimeStamp) {
    let glycationTime = new Date(previousTimestamp);

    const time = (new Date(currentTimeStamp) - new Date(previousTimestamp)) / 60000;
    const rate = (currentResult - previousResult) / time;

    glycationTime.setMinutes(glycationTime.getMinutes() + Math.abs((150 - previousResult) / rate));
    return new Date(glycationTime);
}

export function calculateGlycation(req, res, next) {
    let totalGlycation = 0;
    let timeToGlycation;
    const results = req.resultObj;
    const timeArray = Object.keys(results);

    for (let i = 1; i < timeArray.length; i++) {
        const previousTimestamp = timeArray[i-1];
        const timeStamp = timeArray[i];
        const previousResult = results[previousTimestamp];
        const currentResult = results[timeStamp];

                if (currentResult > 150 && previousResult < 150) { //entering glycation phase above 150
                    timeToGlycation = calculateTimeToGlycation(previousResult, currentResult, previousTimestamp, timeStamp);
                }
                else if (currentResult < 150 && previousResult > 150) { // going back to normal below 150
                    let timeToNonGlycation = calculateTimeToGlycation(previousResult, currentResult, previousTimestamp, timeStamp);
                    const totalGlycationMinutes = (timeToNonGlycation - timeToGlycation)/60000;
                    totalGlycation = totalGlycation + totalGlycationMinutes;
                    timeToGlycation = null;
                } else if (currentResult === 150 && previousResult > 150) { // going back to normal at 150
                    const totalGlycationMinutes = (new Date(timeStamp) - timeToGlycation)/60000;
                    totalGlycation = (totalGlycation + totalGlycationMinutes);
                    timeToGlycation = null;
                } else if (previousResult < 150 && currentResult === 150) { // entering glycation phase at 150
                    timeToGlycation = new Date(timeStamp);
                } 

    }
   return res.json({results, totalGlycation});
}
