/**
 * Created by wanfranck on 01.12.16.
 */
var express = require('express');
var router = express.Router();

var Account = require('../models/account');

let defaultResult = {success: true, errors: {}};

router.get('/', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user) {
        Account.find({userId: user._id}, (err, accounts) => {
            if (err) {
                res.send(err);
                return;
            }
            Object.assign(result, {results: accounts});
            res.json(result);
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.' }});
        res.json(result);
    }
});

router.post('/', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user) {
        let account = new Account();
        Object.assign(account, { userId: user._id, blocked: 0 });
        Object.assign(account, req.body);

        account.save((err) => {
            if (err) {
                res.send(err);
                return;
            }
            res.json(account);
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.' }});
        res.json(result);
    }
});

router.get('/:id', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user) {
        Account.findById(req.params.id, (err, account) => {
            if (err) {
                res.send(err);
                return;
            }
            if (user._id != account.userId){
                Object.assign(result, {success: false, errors: {user: 'Permission denied.' }});
                res.json(result);
            } else res.json(account);
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.' }});
        res.json(result);
    }
});

router.put('/:id', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user) {
        Account.findById(req.params.id, (err, account) => {
            if (err) {
                res.send(err);
                return;
            }
            if (user._id != account.userId){
                Object.assign(result, {success: false, errors: {user: 'Permission denied.' }});
                res.json(result);
            } else {
                Object.assign(account, req.body);
                account.save((err) => {
                    if (err) {
                        res.send(err);
                        return;
                    }
                    res.json(account);
                });
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.' }});
        res.json(result);
    }
});

router.delete('/:id', (req, res) => {
    res.send('Investigating this part.');
});

module.exports = router;