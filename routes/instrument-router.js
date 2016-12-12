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
            res.send(err);
            return;
        }
        Object.assign(result, {results:instruments});
        res.json(result);
    });
});

router.post('/', (req, res) => {
    let instrument = new Instrument();
    Object.assign(instrument, req.body);

    let result = { success: true, errors: {} };
    instrument.save((err) => {
        if (err) {
            res.send(err);
        }
        else {
            res.json(instrument);
        }
    });
});

router.get('/:id', (req, res) => {
    Instrument.findOne({ _id: req.params.id }, (err, instrument) => {
        if (err){
            res.send(err);
            return;
        }

        res.json(instrument);
    });
});

router.delete('/:id', (req, res) => {
    let result = defaultResult;
    Instrument.remove({ _id: req.params.id }, (err) => {
        if (err) {
            res.send(err);
            return;
        }
        res.json(result);
    })
});

module.exports = router;