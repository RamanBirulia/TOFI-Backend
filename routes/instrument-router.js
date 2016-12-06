/**
 * Created by wanfranck on 01.12.16.
 */
var express = require('express');
var router = express.Router();

var Instrument = require('../models/instrument');

router.get('/', (req, res) => {
    Instrument.find({}, (err, instruments) => {
        if (err) res.send(err);
        res.json(instruments);
    });
});

router.post('/', (req, res) => {
    let instrument = new Instrument();
    Object.assign(instrument, req.body);

    let result = { success: true, errors: {} };
    instrument.save((err) => {
        if (err) {
            Object.assign(result.errors, { save: err });
            Object.assign(result, { success: false });
        }
        else {
            Object.assign(result, { message: 'Instrument successfully opened.', instrument: instrument });
        }
        res.json(result);
    });
});

router.get('/:id', (req, res) => {
    Instrument.findOne({ _id: req.params.id }, (err, instrument) => {
        if (err) res.send(err);
        res.json(instrument);
    });
});

router.delete('/:id', (req, res) => {
    Instrument.remove({ _id: req.params.id }, (err) => {
        if (err) res.send(err);
        res.json({ message: 'Instrument successfully deleted.' });
    })
});

module.exports = router;