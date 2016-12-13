/**
 * Created by wanfranck on 01.12.16.
 */
var express = require('express');
var router = express.Router();

var Instrument = require('../models/instrument');
let defaultResult = {success: true, errors:{}};

router.get('/', (req, res) => {
    let result = defaultResult;
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
    let result = defaultResult;
    let instrument = new Instrument();
    Object.assign(instrument, req.body);

    instrument.save((err) => {
        if (err) {
            res.status(502).send(err);
        } else {
            res.status(200).send(instrument);
        }
    });
});

router.get('/:id', (req, res) => {
    Instrument.findOne({_id: req.params.id}, (err, instrument) => {
        if (err){
            res.status(502).send(err);
        } else {
            res.status(200).send(instrument);
        }
    });
});

router.delete('/:id', (req, res) => {
    let result = defaultResult;
    Instrument.remove({ _id: req.params.id }, (err) => {
        if (err) {
            res.status(502).send(err);
        } else {
            res.status(200).send(result);
        }
    })
});

module.exports = router;