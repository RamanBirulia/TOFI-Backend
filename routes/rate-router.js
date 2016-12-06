/**
 * Created by wanfranck on 01.12.16.
 */
var express = require('express');
var router = express.Router();

var Rate = require('../models/rate');

router.get('/', (req, res) => {
    Rate.find().sort({ date: -1 }).exec((err, rates) => {
        if (err) res.send(err);
        res.json({ success: true, rates: rates });
    });
});

router.post('/', (req, res) => {
    let rate = new Rate();
    Object.assign(rate, req.body);

    rate.save((err) =>{
        if (err) res.send(err);
        res.json({ success: true, message: 'New rate added.', rate: rate });
    });
});

router.get('/:count', (req, res) => {
    Rate.find({}).sort({ date: -1 }).limit(req.params.count).exec((err, rates) => {
        if (err) res.send(err);
        res.json({ success: true, rates: rates });
    });
});

module.exports = router;