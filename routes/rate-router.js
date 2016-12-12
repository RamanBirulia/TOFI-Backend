/**
 * Created by wanfranck on 01.12.16.
 */
var express = require('express');
var router = express.Router();

var Rate = require('../models/rate');
let defaultResult = {success: true, errors: {}};

router.get('/', (req, res) => {
    let result = defaultResult;
    Rate.find().sort({ date: -1 }).exec((err, rates) => {
        if (err) res.send(err);
        Object.assign(result, {success: true, results: rates});
        res.json(result);
    });
});

router.post('/', (req, res) => {
    let rate = new Rate();
    Object.assign(rate, req.body);
    let result = defaultResult;

    rate.save((err) =>{
        if (err) res.send(err);
        res.json(rate);
    });
});

router.get('/:count', (req, res) => {
    let result = defaultResult;
    Rate.find().sort({ date: -1 }).limit(+req.params.count).exec((err, rates) => {
        if (err) res.send(err);
        Object.assign(result, {success: true, results: rates});
        res.json(result);
    });
});

module.exports = router;