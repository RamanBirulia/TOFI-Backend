/**
 * Created by wanfranck on 01.12.16.
 */
var express = require('express');
var router = express.Router();

var Rate = require('../models/rate');

const defaultResult = {success: true, errors: {}};
const defaultOptions = {limit: 15, page: 1};

router.get('/', (req, res) => {
    let result = Object.assign({}, {}, defaultResult);

    const options = Object.assign({}, req.body || {}, defaultOptions);
    const { limit, dateFrom, dateTill } = options;

    const query = { dateFrom, dateTill };
    query.$and = [];
    if (dateFrom) query.$and.push({date: {$gte: dateFrom}});
    if (dateTill) query.$and.push({date: {$lte: dateTill}});
    delete query.dateFrom;
    delete query.dateTill;

    console.log(query);

    if (query.dateFrom || query.dateTill){
        Rate.find(query).sort({date:-1}).limit(limit).exec((err, rates) => {
            if (err) {
                res.status(502).send(err);
            } else {
                Object.assign(result, {success: true, results: rates});
                res.status(200).send(result);
            }
        });
    } else {
        Rate.find(query, (err, rates) => {
            if (err) {
                res.status(502).send(err);
            } else {
                Object.assign(result, {success: true, results: rates});
                res.status(200).send(result);
            }
        });
    }

});

router.post('/', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user.role == 'admin'){
        let rate = new Rate();
        Object.assign(rate, req.body);

        rate.save((err) => {
            if (err) {
                res.status(502).send(err);
            } else {
                res.status(200).send(rate);
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }

});

router.get('/last', (req, res) => {
    Rate.findOne().sort({date: -1}).exec((err, rate) => {
        if (err) {
            res.status(502).send(err);
        } else {
            res.status(200).send(rate);
        }
    });
});

module.exports = router;