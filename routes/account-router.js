/**
 * Created by wanfranck on 01.12.16.
 */
let express = require('express');
let router = express.Router();

let Account = require('../models/account');

const defaultResult = {success: true, errors: {}};
const defaultOptions = {limit: 15, page: 1};

router.get('/my', (req, res) => {
    const user = req.decoded._doc;
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

router.post('/my', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user) {
        let accountUSD = new Account();
        Object.assign(accountUSD, {userId: user._id, amount: +req.body.amountUSD, currency: 'USD'});
        accountUSD.save((err) => {
            if (err) {
                res.status(502).send(err);
            } else {
                let accountEUR = new Account();
                Object.assign(accountEUR, {userId: user._id, amount: +req.body.amountEUR, currency: 'EUR'});
                accountEUR.save((err) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        res.status(200).send([accountUSD, accountEUR]);
                    }
                });
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.put('/my/:id', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user) {
        Account.findById(req.params.id, (err, account) => {
            if (err) {
                res.status(502).send(err);
            } else {
                if (account.userId == user._id){
                    account.amount += +req.body.amount;
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
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.delete('/my/:id', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user) {
        Account.findById(req.params.id, (err, account) => {
            if (err) {
                res.status(502).send(err);
            } else {
                if (account.userId == user._id){
                    Account.findByIdAndRemove(req.params.id, (err) => {
                        if (err) {
                            res.status(502).send(err);
                        } else {
                            Object.assign(result);
                        }
                    });
                } else {
                    Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
                    res.status(401).send(result);
                }
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

    if (user.role == 'admin') {
        let account = new Account();
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

router.get('/', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    const options = Object.assign({}, req.body || {}, defaultOptions);
    const { limit } = options;

    if (user.role == 'admin') {
        Account.find().limit(+limit).exec((err, accounts) => {
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

router.get('/:id', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user.admin == 'admin') {
        Account.findById(req.params.id, (err, account) => {
            if (err) {
                res.status(502).send(err);
            } else {
                if (account){
                    res.status(200).send(account);
                } else {
                    Object.assign(result, {success: false, errors: {account: 'Account not found.'}});
                    res.status(401).send(result);
                }
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.put('/:id', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user.admin == 'admin') {
        Account.findById(req.params.id, (err, account) => {
            if (err) {
                res.status(502).send(err);
            } else {
                if (account){
                    account.amount += +req.body.amount;
                    account.save((err) => {
                        if (err) {
                            res.status(502).send(err);
                        } else {
                            res.status(200).send(account);
                        }
                    });
                } else {
                    Object.assign(result, {success: false, errors: {account: 'Account not found.'}});
                    res.status(401).send(result);
                }
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.delete('/:id', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user.admin == 'admin') {
        Account.findByIdAndRemove(req.params.id, (err) => {
            if (err) {
                res.status(502).send(err);
            } else {
                Object.assign(result);
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

module.exports = router;