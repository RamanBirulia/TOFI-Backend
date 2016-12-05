/**
 * Created by wanfranck on 01.12.16.
 */
var express = require('express');
var router = express.Router();

var User = require('../models/user');

router.get('/', (req, res) => {
    let user = req.decoded._doc;

    if (user.admin){
        User.find({}, (err, users) => {
            if (err) res.send(err);
            res.json(users);
        });
    }
    else if (user){
        User.findOne({ _id: user.id }, (err, user) => {
            if (err) res.send(err);
            res.json(user);
        });
    }
    else {
        res.json({ success: false, message: 'Permission denied.' });
    }
});

router.get('/:id', (req, res) => {
    let user = req.decoded._doc;

    if (user.admin || user._id == req.params.id){
        User.findById(req.params.id, (err, user) => {
            if (err) res.send(err);
            res.json(user);
        });
    }
    else {
        res.json({ success: false, message: 'Permission denied.' });
    }
});

router.put('/:id', (req, res) => {
    let user = req.decoded._doc;

    if (user.admin || user._id == req.params.id){
        User.findById(req.params.id, (err, user) => {
            if (err) res.send(err);
            Object.assign(user, req.body);

            user.save((err) => {
                if (err) res.send(err);
                res.json(user);
            });
        });
    }
    else {
        res.json({ success: false, message: 'Permission denied.' });
    }
});

router.delete('/:id', (req, res) => {
    let user = req.decoded._doc;

    if (user.admin){
        User.remove({
            _id: req.params.id
        }, (err) => {
            if (err) res.send(err);
            res.json({ success: true, message: 'User successfully deleted.' });
        });
    }
    else {
        res.json({ success: false, message: 'Permission denied.' });
    }
});

module.exports = router;