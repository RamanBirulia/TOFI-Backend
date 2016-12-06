/**
 * Created by wanfranck on 01.12.16.
 */
var express = require('express');
var router = express.Router();

var Account = require('../models/account');

router.get('/', (req, res) => {
    let user = req.decoded._doc;

    Account.find({ userId: user._id }, (err, accounts) => {
        if (err) res.send(err);
        res.json({ success: true, account: accounts });
    });
});

router.post('/', (req, res) => {
    let user = req.decoded._doc;
    let account = new Account();
    Object.assign(account, { userId: user._id, blocked: 0 });
    Object.assign(account, req.body);

    account.save((err) => {
        if (err) res.send(err);
        res.json({ success: true, message: 'Account created.', account: account });
    });
});

router.get('/:id', (req, res) => {
    let user = req.decoded._doc;

    Account.findById(req.params.id, (err, account) => {
        if (err) res.send(err);
        if (user._id != account.userId){
            res.json({ success: false, message: 'Permission denied.' });
        }

        res.json({ success: true, account: account });
    });
});

router.put('/:id', (req, res) => {
    let user = req.decoded._doc;

    Account.findById(req.params.id, (err, account) => {
        if (err) res.send(err);
        if (user._id != account.userId){
            res.json({ success: false, message: 'Permission denied.' });
        }

        Object.assign(account, req.body);
        account.save((err) => {
            if (err) res.send(err);
            res.json({ success: true, message: 'Account modified.' });
        });
    });
});

router.delete('/:id', (req, res) => {
    res.send("Investigating this part.");
});

module.exports = router;