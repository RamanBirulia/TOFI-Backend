/**
 * Created by wanfranck on 01.12.16.
 */
var express = require('express');
var router = express.Router();

var Rate = require('../models/rate');

const defaultResult = {success: true, errors: {}};

router.get('/', (req, res) => {
    let result = Object.assign({}, {}, defaultResult);
    Rate.find().sort({date: -1}).exec((err, rates) => {
        if (err) {
            res.status(502).send(err);
        } else {
            Object.assign(result, {success: true, results: rates});
            res.status(200).send(result);
        }
    });
});

router.post('/', (req, res) => {
    let result = Object.assign({}, {}, defaultResult);
    let rate = new Rate();
    Object.assign(rate, req.body);

    rate.save((err) => {
        if (err) {
            res.status(502).send(err);
        } else {
            res.status(200).send(rate);
        }
    });
});

router.get('/:count', (req, res) => {
    let result = Object.assign({}, {}, defaultResult);
    Rate.find().sort({date: -1}).limit(parseInt(req.params.count)).exec((err, rates) => {
        if (err) {
            res.status(502).send(err);
        } else {
            Object.assign(result, {success: true, results: rates});
            res.status(200).send(result);
        }
    });
});

module.exports = router;