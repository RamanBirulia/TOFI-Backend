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

router.get('/', (req, res) => {
    let user = req.decoded._doc;
    if (user.admin){
        Deal.find({}, (err, deals) => {
            if (err) res.send(err);
            res.json(deals);
        });
    }
    else if (user){
        Deal.find({
            $or: [
                { buyerId: user._id },
                { sellerId: user._id }
            ]
        }, (err, deals) => {
            if (err) res.send(err);
            res.json(deals);
        });
    }
    else{
        res.json({ success: false, message: 'Permission denied.' });
    }
});

router.post('/', (req, res) => {
    let user = req.decoded._doc;
    let deal = new Deal();

    if (!user) res.json({ success: false, message: 'Permission denied.' });

    let result = { success: true, errors: {} };

    Object.assign(deal, req.body);
    Object.assign(deal, { dateOpened: new Date() });
    Object.assign(deal, { granted: 0, status: openedStatus });

    if (deal.side == buySide) {
        Object.assign(deal, { buyerId: user._id });
    } else if (deal.side == sellSide) {
        Object.assign(deal, { sellerId: user._id });
    } else {
        Object.assign(result.errors, { side: 'Invalid side value.' });
        res.json(result);
    }

    let checkAccount = (cb) => {
        let currency = deal.side == buySide ? 'USD' : 'EUR';
        Account.findOne({ userId: user._id, currency: currency }, (err, account) => {
            if (err) res.send(err);
            if (account.currency == 'USD'){
                if (deal.units * deal.buyPrice > account.amount) {
                    res.json({ success: false, message: 'Insufficient funds.' });
                } else {
                    cb();
                }
            } else {
                if (deal.units > account.amount) {
                    res.json({ success: false, message: 'Insufficient funds.' });
                } else {
                    cb();
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
                }).sort({ sellPrice: 1 }).exec((err, deals) => {
                    console.log(deals);
                    if (err) {
                        res.send(err);
                    } else {
                        let residue = deal.units - deal.granted;
                        let n = deals.length;
                        let toUpdate = [];
                        for (let i = 0; i < n; i++){
                            let possible = Math.min(deals[i].units - deals[i].granted, residue);
                            deals[i].granted += possible;
                            deal.granted += possible;
                            if (deals[i].granted == deals[i].units){
                                deals[i].status = closedStatus;
                                toUpdate.push(i);
                            }
                            if (deal.granted == deal.units) {
                                deal.status = closedStatus;
                                break;
                            }
                        }

                        if (toUpdate.length){
                            Promise.all(toUpdate.map(index => {
                                return new Promise((resolve, reject) => {
                                    deals[index].save((err) => {
                                        if (err) reject(err);
                                        resolve(index);
                                    });
                                });
                            })).then(
                                value => {
                                    cb();
                                },
                                reason => {
                                    res.send(reason);
                                }
                            );
                        } else {
                            cb();
                        }
                    }
                });
                return;
            case sellSide:
                Deal.find({
                    side: buySide,
                    status: openedStatus,
                    buyPrice: { $gte: deal.sellPrice }
                }, (err, deals) => {
                    if (err) {
                        res.send(err);
                    } else{
                        let residue = deal.units - deal.granted;
                        let n = deals.length;
                        let toUpdate = [];
                        for (let i = 0; i < n; i++){
                            let possible = Math.min(deals[i].units - deals[i].granted, residue);
                            deals[i].granted += possible;
                            deal.granted += possible;
                            if (deals[i].granted == deals[i].units){
                                deals[i].status = closedStatus;
                                toUpdate.push(i);
                            }
                            if (deal.granted == deal.units) {
                                deal.status = closedStatus;
                                break;
                            }
                        }

                        if (toUpdate.length){
                            Promise.all(toUpdate.map(index => {
                                return new Promise((resolve, reject) => {
                                    deals[index].save((err) => {
                                        if (err) reject(err);
                                        resolve(index);
                                    });
                                });
                            })).then(
                                value => {
                                    cb();
                                },
                                reason => {
                                    res.send(reason);
                                }
                            );
                        } else {
                            cb();
                        }
                    }
                });
                return;
            default:
                Object.assign(result.errors, { status: 'Invalid status value.' });
                res.json(result);
                return;
        }
    };

    let saveDeal = () => {
        deal.save((err) => {
            if (err) {
                Object.assign(result.errors, { save: err });
                Object.assign(result, { success: false });
            }
            else {
                Object.assign(result, { message: 'Deal successfully opened.', deal: deal });
            }
            res.json(result);
        });
    };

    checkAccount(() => {
        checkMarket(saveDeal);
    });
});

router.get('/:id', (req, res) => {
    let user = req.decoded._doc;

    Deal.findOne({
        _id: req.params.id,
        $or: [
            { buyerId: user._id },
            { sellerId: user._id }
        ]
    }, (err, deal) => {
        if (err) res.send(err);
        res.json(deal);
    });
});

router.put('/:id', (req, res) => {
    let user = req.decoded._doc;

    Deal.findOne({
        _id: req.params.id,
        $or: [
            { buyerId: user._id },
            { sellerId: user._id }
        ]
    }, (err, deal) => {
        if (err) res.send(err);
        Object.assign(deal, req.body);

        deal.save((err) => {
            if (err) res.send(err);
            res.json(deal);
        });
    });
});

router.delete('/:id', (req, res) => {
    let user = req.decoded._doc;

    Deal.remove({
        _id: req.params.id,
        $or: [
            { buyerId: user._id },
            { sellerId: user._id }
        ]
    }, (err) => {
        if (err) res.send(err);
        res.json({ message: 'Deal successfully deleted.' });
    })
});

module.exports = router;