/**
 * Created by wanfranck on 01.12.16.
 */
var express = require('express');
var router = express.Router();

var Instrument = require('../models/instrument');
const defaultResult = {success: true, errors:{}};

router.get('/', (req, res) => {
    let result = Object.assign({}, {}, defaultResult);
    Instrument.find({}, (err, instruments) => {
        if (err) {
            res.status(502).send(err);
        } else {
            Object.assign(result, {results: instruments});
            res.status(200).send(result);
        }
    });
});

router.post('/', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user.role == 'admin'){
        let instrument = new Instrument();
        Object.assign(instrument, req.body);

        instrument.save((err) => {
            if (err) {
                res.status(502).send(err);
            } else {
                res.status(200).send(instrument);
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

module.exports = router;