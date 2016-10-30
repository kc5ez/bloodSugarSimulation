import { calculate } from '../controllers/calculation';
import { calculateGlycation } from '../controllers/glycation';
import express from 'express';
import db from '../queries';
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/bloodSugar', db.getAllBloodSugar, calculate, calculateGlycation);
router.post('/api/bloodSugar', db.createBloodSugar);

module.exports = router;
