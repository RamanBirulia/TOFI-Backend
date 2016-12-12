/**
 * Created by wanfranck on 01.12.16.
 */
var express = require('express');
var router = express.Router();

var Deal = require('../models/deal');
var Account = require('../models/account');

const buySide = 'BUY';
const sellSide = 'SELL';

const openedStatus = 'OPENED';
const closedStatus = 'CLOSED';

const defaultResult = {success: true, errors: {}};

router.get('/', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user) {
        Deal.find({
            $or: [
                {buyerId: user._id},
                {sellerId: user._id}
            ]
        }, (err, deals) => {
            if (err) {
                res.send(err);
                return;
            }
            Object.assign(result, {results: deals});
            res.json(result);
        });
    } else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.json(result);
    }
});

router.get('/opened', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user) {
        Deal.find({
            $or: [
                {buyerId: user._id},
                {sellerId: user._id}
            ],
            status: openedStatus
        }, (err, deals) => {
            if (err) {
                res.send(err);
                return;
            }
            Object.assign(result, {results: deals});
            res.json(result);
        });
    } else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.json(result);
    }
});

router.get('/closed', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user) {
        Deal.find({
            $or: [
                {buyerId: user._id},
                {sellerId: user._id}
            ],
            status: closedStatus
        }, (err, deals) => {
            if (err) {
                res.send(err);
                return;
            }
            Object.assign(result, {results: deals});
            res.json(result);
        });
    } else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.json(result);
    }
});

router.post('/', (req, res) => {
    let user = req.decoded._doc;
    let deal = new Deal();

    let result = defaultResult;
    let amount = 0;

    if (!user){
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.json(result);
        return;
    }

    Object.assign(deal, req.body);
    Object.assign(deal, { dateOpened: new Date() });
    Object.assign(deal, { granted: 0, status: openedStatus });


    switch (deal.side){
        case buySide:
            Object.assign(deal, { buyerId: user._id });
            break;
        case sellSide:
            Object.assign(deal, { sellerId: user._id });
            break;
        default:
            Object.assign(result, { success: false, errors: { side: 'Invalid side value.' } });
            res.json(result);
            return;
    }

    let checkAccount = (cb) => {
        let currency = deal.side == buySide ? 'USD' : 'EUR';
        Account.findOne({ userId: user._id, currency: currency }, (err, account) => {
            if (err) {
                res.send(err);
                return;
            }
            if (account.currency == 'USD'){
                if (deal.units * deal.buyPrice > account.amount) {
                    Object.assign(result, {success: false, errors: { account: 'Insufficient funds.'} });
                    res.json(result);
                } else {
                    account.amount -= deal.units * deal.buyPrice;
                    account.blocked += deal.units * deal.buyPrice;
                    account.save((err) => {
                        if (err) {
                            res.send(err);
                            return;
                        }
                        cb();
                    });
                }
            } else {
                if (deal.units > account.amount) {
                    Object.assign(result, {success: false, errors: { account: 'Insufficient funds.'} });
                    res.json(result);
                } else {
                    account.amount -= deal.units;
                    account.blocked += deal.units;
                    account.save((err) => {
                       if (err) {
                           res.send(err);
                           return;
                       }
                        cb();
                    });
                }
            }
        });
    };

    let checkMarket = (cb) => {
        switch (deal.side){
            case buySide:
                Deal.find({
                    side: sellSide,
                    status: openedStatus,
                    sellPrice: { $lte: deal.buyPrice },
                }).sort({sellPrice: 1}).exec((err, deals) => {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        let n = deals.length;
                        let checkDeal = (ind = 0) => {
                            if (ind == n) {
                                cb();
                            } else {
                                let residue = deal.units - deal.granted;
                                let possible = Math.min(deals[ind].units - deals[ind].granted, residue);
                                deals[ind].granted += possible;
                                deal.granted += possible;

                                Account.findOne({
                                    userId: deals[ind].sellerId,
                                    currency: 'EUR'
                                }, (err, account) => {
                                    if (err) {
                                        res.send(err);
                                        return;
                                    }
                                    account.blocked -= possible;
                                    account.save((err) => {
                                        if (err) {
                                            res.send(err);
                                            return;
                                        }
                                        Account.findOne({
                                            userId: deals[ind].sellerId,
                                            currency: 'USD'
                                        }, (err, account) => {
                                            if (err) {
                                                res.send(err);
                                                return;
                                            }
                                            account.amount += deals[ind].sellPrice * possible;
                                            amount += deals[ind].sellPrice * possible;
                                            account.save((err) => {
                                                if (err) {
                                                    res.send(err);
                                                    return;
                                                }
                                                if (deals[ind].granted == deals[ind].units){
                                                    deals[ind].status = closedStatus;
                                                    deals[ind].save((err) => {
                                                        if (err) {
                                                            res.send(err);
                                                            return;
                                                        }
                                                        if (deal.granted == deal.units) {
                                                            deal.status = closedStatus;
                                                            cb();
                                                        } else {
                                                            checkDeal(ind + 1);
                                                        }
                                                    });
                                                } else {
                                                    deal.status = closedStatus;
                                                    cb();
                                                }
                                            });
                                        });
                                    });
                                });
                            }
                        };
                        checkDeal();
                    }
                });
                break;
            case sellSide:
                Deal.find({
                    side: buySide,
                    status: openedStatus,
                    buyPrice: { $gte: deal.sellPrice }
                }, (err, deals) => {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        let n = deals.length;
                        let checkDeal = (ind = 0) => {
                            if (ind == n) {
                                cb();
                            } else {
                                let residue = deal.units - deal.granted;
                                let possible = Math.min(deals[ind].units - deals[ind].granted, residue);
                                deals[ind].granted += possible;
                                deal.granted += possible;

                                Account.findOne({
                                    userId: deals[ind].buyerId,
                                    currency: 'USD'
                                }, (err, account) => {
                                    account.blocked -= possible * deal.sellPrice;
                                    account.blocked -= possible * (deals[ind].buyPrice - deal.sellPrice);
                                    account.amount += possible * (deals[ind].buyPrice - deal.sellPrice);
                                    account.save((err) => {
                                        if (err) res.send(err);
                                        Account.findOne({
                                            userId: deals[ind].buyerId,
                                            currency: 'EUR'
                                        }, (err, account) => {
                                            if (err) {
                                                res.send(err);
                                                return;
                                            }
                                            account.amount += possible;
                                            amount += possible;
                                            account.save((err) => {
                                                if (err) {
                                                    res.send(err);
                                                    return;
                                                }
                                                if (deals[ind].granted == deals[ind].units){
                                                    deals[ind].status = closedStatus;
                                                    deals[ind].save((err) => {
                                                        if (err) {
                                                            res.send(err);
                                                            return;
                                                        }
                                                        if (deal.granted == deal.units) {
                                                            deal.status = closedStatus;
                                                            cb();
                                                        } else {
                                                            checkDeal(ind + 1);
                                                        }
                                                    });
                                                } else {
                                                    deal.status = closedStatus;
                                                    cb();
                                                }
                                            });
                                        });
                                    });
                                });
                            }
                        };
                        checkDeal();
                    }
                });
                break;
            default:
                Object.assign(result, { success: false, errors: { side: 'Invalid side value.' } });
                res.json(result);
                return;
        }
    };

    let saveDeal = () => {
        deal.save((err) => {
            if (err) {
                res.send(err);
            }
            else {
                if (deal.side == buySide) {
                    Account.findOne({
                        userId: user._id,
                        currency: 'EUR'
                    }, (err, account) => {
                        if (err) {
                            res.send(err);
                            return;
                        }
                        account.amount += deal.granted;
                        account.save((err) => {
                            if (err) {
                                res.send(err);
                                return;
                            }
                            Account.findOne({
                                userId: user._id,
                                currency: 'USD'
                            }, (err, account) => {
                                account.blocked -= amount;
                                if (deal.status == closedStatus){
                                    account.amount += account.blocked;
                                    account.blocked = 0;
                                }
                                account.save((err) => {
                                    if (err) {
                                        res.send(err);
                                        return;
                                    }
                                    res.json(deal);
                                })
                            });
                        });
                    });
                } else {
                    Account.findOne({
                        userId: user._id,
                        currency: 'USD'
                    }, (err, account) => {
                        if (err) {
                            res.send(err);
                            return;
                        }
                        account.amount += deal.granted;
                        account.save((err) => {
                            if (err) {
                                res.send(err);
                                return;
                            }
                            Account.findOne({
                                userId: user._id,
                                currency: 'EUR'
                            }, (err, account) => {
                                account.blocked -= amount;
                                if (deal.status == closedStatus){
                                    account.amount += account.blocked;
                                    account.blocked = 0;
                                }
                                account.save((err) => {
                                    if (err) {
                                        res.send(err);
                                        return;
                                    }
                                    res.json(deal);
                                })
                            });
                        });
                    });
                }
            }
        });
    };

    checkAccount(() => {
        checkMarket(() => {
            saveDeal();
        });
    });
});

router.get('/:id', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user){
        Deal.findById(req.params.id, (err, deal) => {
            if (err) {
                res.send(err);
                return;
            }
            res.json(deal);
        });
    } else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.json(result);
    }
});

router.put('/:id', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user){
        Deal.findById(req.params.id, (err, deal) => {
            if (err) {
                res.send(err);
                return;
            }
            Object.assign(deal, req.body);

            deal.save((err) => {
                if (err) res.send(err);
                res.json(deal);
            });
        });
    }
    else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.json(result);
    }
});

router.delete('/:id', (req, res) => {
    let user = req.decoded._doc;
    let result = defaultResult;

    if (user) {
        Deal.remove({_id: req.params.id}, (err) => {
            if (err) {
                res.send(err);
                return;
            }
            res.json(result);
        });
    } else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.json(result);
    }
});

module.exports = router;