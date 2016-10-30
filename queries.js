import { exerciseDictionary } from './exercise';
import { foodDictionary } from './food';
var promise = require('bluebird');

var options = {
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://localhost:5432/bloodsugaractivity';
var db = pgp(connectionString);

module.exports = {
    getAllBloodSugar: getAllBloodSugar,
    createBloodSugar: createBloodSugar
};

function getAllBloodSugar(req, res, next) {
    db.any('select * from bloodsugarentries where time_stamp::date = now()::date and time_stamp::time <= now()::time')
        .then((data)=> { 
            req.data = data;
            next();
        }).catch((err) => next(err));
}

function createBloodSugar(req, res, next) {
    const {type, type_id, time_stamp} = req.body; 
    let name, gi_index;
    if (type === 'exercise') {
        name = exerciseDictionary[type_id]['Exercise'];
        gi_index = exerciseDictionary[type_id]['Exercise Index'];
    } else if(type === 'food') {
        name = foodDictionary[type_id]['Name'];
        gi_index = foodDictionary[type_id]['Glycemic Index'];
    }

    const data = {
        name,
        gi_index,
        type,
        type_id,
        time_stamp
    }
    db.none("insert into bloodsugarentries(type, name, type_id, time_stamp, gi_index) values(${type}, ${name}, ${type_id}, ${time_stamp}, ${gi_index})",
        data)
    .then(() => {
        res.status(200)
            .json({
                status: 'success',
                message: 'Inserted one blood sugar entry'
            });
    }).catch((err) => next(err));
}
