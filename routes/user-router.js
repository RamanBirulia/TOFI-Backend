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

    if (user.role == 'admin'){
        User.find({}, (err, users) => {
            if (err) {
                res.status(502).send(err);
            } else {
                Object.assign(result, {results: users});
                res.status(200).send(result);
            }
        });
    } else if (user.role == 'trader'){
        User.findOne({_id: user.id}, (err, user) => {
            if (err) {
                res.status(502).send(err);
            } else {
                res.status(200).send(user);
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.get('/:id', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user.role == 'admin' || (user.role == 'trader' && user._id == req.params.id)){
        User.findById(req.params.id, (err, user) => {
            if (err) {
                res.status(502).send(err);
            } else {
                res.status(200).send(user);
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.put('/:id', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user.admin || user._id == req.params.id){
        User.findById(req.params.id, (err, user) => {
            if (err) {
                res.status(502).send(err);
            } else {
                Object.assign(user, req.body);
                user.save((err) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        res.status(200).send(user);
                    }
                });
            }
        });
    }
    else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
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
                res.status(502).send(err);
            } else {
                res.status(200).send(result);
            }
        });
    }
    else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

module.exports = router;