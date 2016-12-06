/**
 * Created by wanfranck on 20.11.16.
 */
/**
 * Training router
*/
var express = require('express');
var router = express.Router();

var Bear = require('../models/bear');

router.get('/', (req, res, next) => {
    res.json({ message: 'Welcome to Bear-API!' });
});

router.get('/bears', (req, res) => {
    Bear.find((err, bears) => {
        if (err) res.send(err);
        res.json(bears);
    });
});

router.post('/bears', (req, res) => {
    var bear = new Bear();
    bear.name = req.body.name;

    bear.save((err) => {
        if (err) res.send(err);
        res.json({ message: 'Bear created!' });
    });
});

router.get('/bears/:id', (req, res) => {
    Bear.findById(req.params.id, (err, bear) => {
        if (err) res.send(err);
        res.json(bear);
    });
});

router.put('/bears/:id', (req, res) => {
    Bear.findById(req.params.id, (err, bear) => {
        if (err) res.send(err);
        bear.name = req.body.name;

        bear.save((err) => {
            if (err) res.send(err);
            res.json({ message: 'Bear updated!' });
        });

    });
});

router.delete('/bears/:id', (req, res) => {
    Bear.remove({
        _id: req.params.id
    }, (err, bear) => {
        if (err) res.send(err);
        res.json({ message: 'Successfully deleted!' });
    });
});

module.exports = router;
