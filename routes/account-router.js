/**
 * Created by wanfranck on 01.12.16.
 */
var express = require('express');
var router = express.Router();

var Account = require('../models/account');

const defaultResult = {success: true, errors: {}};

router.get('/', (req, res) => {
    let user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user) {
        Account.find({userId: user._id}, (err, accounts) => {
            if (err) {
                res.status(502).send(err);
            } else {
                Object.assign(result, {results: accounts});
                res.status(200).send(result);
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.post('/', (req, res) => {
    let user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user) {
        let account = new Account();
        Object.assign(account, {userId: user._id, blocked: 0});
        Object.assign(account, req.body);

        account.save((err) => {
            if (err) {
                res.status(502).send(err);
            } else {
                res.status(200).send(account);
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.get('/:id', (req, res) => {
    let user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user) {
        Account.findById(req.params.id, (err, account) => {
            if (err) {
                res.status(502).send(err);
            } else {
                if (user._id != account.userId){
                    Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
                    res.status(401).send(result);
                } else {
                    res.status(200).send(account);
                }
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.put('/:id', (req, res) => {
    let user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user) {
        Account.findById(req.params.id, (err, account) => {
            if (err) {
                res.status(502).send(err);
            } else {
                if (user._id != account.userId){
                    Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
                    res.status(401).send(result);
                } else {
                    account.amount += req.body.amount;
                    account.save((err) => {
                        if (err) {
                            res.status(502).send(err);
                        } else {
                            res.status(200).send(account);
                        }
                    });
                }
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.delete('/:id', (req, res) => {
    res.status(200).send('Keep calm and wait for it.');
});

module.exports = router;