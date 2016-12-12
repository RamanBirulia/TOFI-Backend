/**
 * Created by wanfranck on 01.12.16.
 */
var express = require('express');
var router = express.Router();

var User = require('../models/user');

let defaultResult = {success: true, errors: {}};

router.get('/', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user.admin){
        User.find({}, (err, users) => {
            if (err) {
                res.send(err);
                return;
            }
            Object.assign(result, {results: users});
            res.json(result);
        });
    } else if (user){
        User.findOne({_id: user.id}, (err, user) => {
            if (err) {
                res.send(err);
                return;
            }
            res.json(user);
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.' }});
        res.json(result);
    }
});

router.get('/:id', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user.admin || user._id == req.params.id){
        User.findById(req.params.id, (err, user) => {
            if (err) {
                res.send(err);
                return;
            }
            res.json(user);
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.' }});
        res.json(result);
    }
});

router.put('/:id', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user.admin || user._id == req.params.id){
        User.findById(req.params.id, (err, user) => {
            if (err) {
                res.send(err);
                return;
            }
            Object.assign(user, req.body);

            user.save((err) => {
                if (err) {
                    res.send(err);
                    return;
                }
                res.json(user);
            });
        });
    }
    else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.' }});
        res.json(result);
    }
});

router.delete('/:id', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user.admin){
        User.remove({
            _id: req.params.id
        }, (err) => {
            if (err) {
                res.send(err);
                return;
            }
            res.json(result);
        });
    }
    else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.' }});
        res.json(result);
    }
});

module.exports = router;