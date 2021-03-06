/**
 * Created by wanfranck on 01.12.16.
 */
let express = require('express');
let router = express.Router();

let Deal = require('../models/deal');
let Account = require('../models/account');
let Rate = require('../models/rate');

const buySide = 'BUY';
const sellSide = 'SELL';

const openedStatus = 'OPENED';
const closedStatus = 'CLOSED';

const defaultResult = {success: true, errors: {}};
const defaultOptions = {limit: 50, page: 1};

router.get('/my', (req, res) => {
    const user = req.decoded._doc;
    const options = Object.assign({}, defaultOptions, req.body || {});
    const { limit, dateTill, dateFrom } = options;

    let query = {$and: [{$or: [{buyerId: user._id}, {sellerId: user._id}]}]};
    if (dateFrom) query.$and.push({dateOpened: {$gte: dateFrom}});
    if (dateTill) query.$and.push({dateOpened: {$lte: dateTill}});

    let result = Object.assign({}, {}, defaultResult);

    if (user) {
        if (query.$and.length > 1){
            Deal.find(query).sort({dateOpened:-1}).exec((err, deals) => {
                if (err) {
                    res.status(502).send(err);
                } else {
                    Object.assign(result, {results: deals, count: deals.length});
                    res.status(200).send(result);
                }
            });
        } else {
            Deal.find(query).sort({dateOpened:-1}).limit(+limit).exec((err, deals) => {
                if (err) {
                    res.status(502).send(err);
                } else {
                    Object.assign(result, {results: deals, count: deals.length});
                    res.status(200).send(result);
                }
            });
        }
    } else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.status(401).send(result);
    }
});

router.get('/opened', (req, res) => {
    const user = req.decoded._doc;
    const options = Object.assign({}, defaultOptions, req.body || {});
    const { limit, dateFrom, dateTill } = options;

    let query = {$and: [{$or: [{buyerId: user._id}, {sellerId: user._id}]}, {status: openedStatus}]};
    if (dateFrom) query.$and.push({dateOpened: {$gte: dateFrom}});
    if (dateTill) query.$and.push({dateOpened: {$lte: dateTill}});

    let result = Object.assign({}, {}, defaultResult);

    if (user) {
        if (query.$and.length > 2){
            Deal.find(query).sort({dateOpened:-1}).exec((err, deals) => {
                if (err) {
                    res.status(502).send(err);
                } else {
                    Object.assign(result, {results: deals, count: deals.length});
                    res.status(200).send(result);
                }
            });
        } else {
            Deal.find(query).sort({dateOpened:-1}).limit(+limit).exec((err, deals) => {
                if (err) {
                    res.status(502).send(err);
                } else {
                    Object.assign(result, {results: deals, count: deals.length});
                    res.status(200).send(result);
                }
            });
        }
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.get('/closed', (req, res) => {
    const user = req.decoded._doc;
    const options = Object.assign({}, defaultOptions, req.body || {});
    const { limit, dateFrom, dateTill } = options;

    let query = {$and: [{$or: [{buyerId: user._id}, {sellerId: user._id}]}, {status: closedStatus}]};
    if (dateFrom) query.$and.push({dateClosed: {$gte: dateFrom}});
    if (dateTill) query.$and.push({dateClosed: {$lte: dateTill}});

    let result = Object.assign({}, {}, defaultResult);

    if (user) {
        if (query.$and.length > 2){
            Deal.find(query).sort({dateClosed:-1}).exec((err, deals) => {
                if (err) {
                    res.status(502).send(err);
                } else {
                    Object.assign(result, {results: deals, count: deals.length});
                    res.status(200).send(result);
                }
            });
        } else {
            Deal.find(query).sort({dateClosed:-1}).limit(+limit).exec((err, deals) => {
                if (err) {
                    res.status(502).send(err);
                } else {
                    Object.assign(result, {results: deals, count: deals.length});
                    res.status(200).send(result);
                }
            });
        }
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.get('/closed/new', (req, res) => {
    const
        user = req.decoded._doc,
        query = {$and: [
            {$or: [{buyerId: user._id}, {sellerId: user._id}]},
            {status: closedStatus},
            {checked: false}
        ]};

    let result = Object.assign({}, {}, defaultResult);

    if (user){
        Deal.find(query).sort({dateClosed:-1}).exec((err, deals) => {
            if (err) {
                res.status(502).send(err);
            } else {
                deals.forEach(deal => {
                    deal.checked = true;
                    deal.save((err) => {});
                });
                Account.find({userId: user._id}, (err, accounts) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        Object.assign(result, {results: deals, count: deals.length, accounts: accounts});
                        res.status(200).send(result);
                    }
                });
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.post('/', (req, res) => {
    let user = req.decoded._doc;
    let deal = new Deal();

    let result = Object.assign({}, {}, defaultResult);
    let amount = 0;

    if (!user){
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    } else {
        Rate.findOne().sort({date:-1}).exec((err, rate) => {
            if (err) {
                res.status(502).send(err);
            } else {

                let getDate = (date) => {
                    let newDate = new Date();
                    newDate.setDate(date.getDate());
                    newDate.setMonth(date.getMonth());
                    newDate.setFullYear(date.getFullYear());
                    newDate.setHours(newDate.getHours() + 3);
                    return newDate;
                };

                let date = getDate(rate.date);

                Object.assign(deal, req.body);
                Object.assign(deal, {dateOpened: date, granted: 0, status: openedStatus});

                if (deal.units <= 0) {
                    Object.assign(result, {success: false, errors: {deal: 'Non-positive units value.'}});
                    res.status(403).send(result);
                }

                if (deal.side == buySide) {
                    Object.assign(deal, {buyerId: user._id});
                    deal.buyPrice = parseFloat(deal.buyPrice.toFixed(4));
                } else if (deal.side == sellSide) {
                    Object.assign(deal, {sellerId: user._id});
                    deal.sellPrice = parseFloat(deal.sellPrice.toFixed(4));
                } else {
                    Object.assign(result, {success: false, errors: {side: 'Invalid side value.'}});
                    res.status(403).send(result);
                }

                let checkAccount = (cb) => {
                    let currency = deal.side == buySide ? 'USD' : 'EUR';
                    Account.findOne({userId: user._id, currency: currency}, (err, account) => {
                        if (err) {
                            res.status(502).send(err);
                        } else {
                            if (currency == 'USD'){
                                if (deal.units * deal.buyPrice > account.amount) {
                                    Object.assign(result, {success: false, errors: {account: 'Insufficient funds.'}});
                                    res.status(403).send(result);
                                } else {
                                    let fundsUSD = deal.units * deal.buyPrice;
                                    Object.assign(deal, {buyFunds: fundsUSD});
                                    account.amount -= parseFloat(fundsUSD.toFixed(4));
                                    account.save((err) => {
                                        if (err) {
                                            res.status(502).send(err);
                                        } else {
                                            cb();
                                        }
                                    });
                                }
                            } else {
                                if (deal.units > account.amount) {
                                    Object.assign(result, {success: false, errors: {account: 'Insufficient funds.'}});
                                    res.status(403).send(result);
                                } else {
                                    account.amount -= parseFloat(deal.units.toFixed(4));
                                    account.save((err) => {
                                        if (err) {
                                            res.status(502).send(err);
                                        } else {
                                            cb();
                                        }
                                    });
                                }
                            }
                        }
                    });
                };

                let checkMarket = (cb) => {
                    if (deal.side == buySide) {
                        Deal.find({
                            side: sellSide, status: openedStatus,
                            sellPrice: {$lte: deal.buyPrice},
                        }).sort({sellPrice: 1}).exec((err, deals) => {
                            if (err) {
                                res.status(502).send(err);
                            } else {
                                let checkDeal = (ind = 0) => {
                                    if (ind == deals.length) {
                                        cb();
                                    } else {
                                        let residue = deal.units - deal.granted;
                                        let possible = Math.min(deals[ind].units - deals[ind].granted, residue);

                                        deals[ind].granted += possible;
                                        deal.granted += possible;

                                        Account.findOne({
                                            userId: deals[ind].sellerId, currency: 'USD'
                                        }, (err, account) => {
                                            if (err) {
                                                res.status(502).send(err);
                                            } else {
                                                let actualFundsUSD = deals[ind].sellPrice * possible;
                                                account.amount += parseFloat(actualFundsUSD.toFixed(4));
                                                amount += actualFundsUSD;
                                                account.save((err) => {
                                                    if (err) {
                                                        res.status(502).send(err);
                                                    } else {
                                                        if (deals[ind].granted == deals[ind].units) {
                                                            deals[ind].status = closedStatus;
                                                            deals[ind].dateClosed = date;
                                                            deals[ind].checked = false;
                                                        }

                                                        deals[ind].save((err) => {
                                                            if (err) {
                                                                res.status(502).send(err);
                                                            } else {
                                                                if (deal.granted == deal.units) {
                                                                    deal.status = closedStatus;
                                                                    deal.dateClosed = date;
                                                                    deal.checked = false;
                                                                    cb();
                                                                } else {
                                                                    checkDeal(ind + 1);
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                };
                                checkDeal();
                            }
                        });
                    } else if (deal.side == sellSide) {
                        Deal.find({
                            side: buySide, status: openedStatus,
                            buyPrice: {$gte: deal.sellPrice}
                        }, (err, deals) => {
                            if (err) {
                                res.status(502).send(err);
                            } else {
                                let checkDeal = (ind = 0) => {
                                    if (ind == deals.length) {
                                        cb();
                                    } else {
                                        let residue = deal.units - deal.granted;
                                        let possible = Math.min(deals[ind].units - deals[ind].granted, residue);

                                        let actualFundsUSD = possible * deal.sellPrice;
                                        deal.granted += possible;
                                        deals[ind].granted += possible;
                                        deals[ind].buyFunds -= parseFloat(actualFundsUSD.toFixed(4));

                                        Account.findOne({
                                            userId: deals[ind].buyerId, currency: 'EUR'
                                        }, (err, account) => {
                                            if (err) {
                                                res.status(502).send(err);
                                            } else {
                                                account.amount += possible;
                                                account.save((err) => {
                                                    if (err) {
                                                        res.status(502).send(err);
                                                    } else {
                                                        if (deals[ind].granted == deals[ind].units){
                                                            deals[ind].status = closedStatus;
                                                            deals[ind].dateClosed = date;
                                                            deals[ind].checked = false;
                                                        }

                                                        deals[ind].save((err) => {
                                                            if (err) {
                                                                res.status(502).send(err);
                                                            } else {
                                                                Account.findOne({
                                                                    userId: deals[ind].buyerId, currency: 'USD'
                                                                }, (err, account) => {
                                                                    if (err) {
                                                                        res.status(502).send(err);
                                                                    } else {
                                                                        if (deals[ind].status == closedStatus){
                                                                            account.amount += parseFloat(deals[ind].buyFunds.toFixed(4));
                                                                        }
                                                                        account.save((err) => {
                                                                            if (deal.granted == deal.units) {
                                                                                deal.status = closedStatus;
                                                                                deal.dateClosed = date;
                                                                                deal.checked = false;
                                                                                cb();
                                                                            } else {
                                                                                checkDeal(ind + 1);
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                };
                                checkDeal();
                            }
                        });
                    } else {
                        Object.assign(result, {success: false, errors: {side: 'Invalid side value.'}});
                        res.status(403).send(result);
                    }
                };

                let saveDeal = () => {
                    deal.save((err) => {
                        if (err) {
                            res.status(502).send(err);
                        } else {
                            if (deal.side == buySide) {
                                Account.findOne({userId: user._id, currency: 'EUR'}, (err, account) => {
                                    if (err) {
                                        res.status(502).send(err);
                                    } else {
                                        account.amount += parseFloat(deal.granted.toFixed(4));
                                        account.save((err) => {
                                            if (err) {
                                                res.status(502).send(err);
                                            } else {
                                                Account.findOne({
                                                    userId: user._id, currency: 'USD'
                                                }, (err, account) => {
                                                    if (deal.status == closedStatus) {
                                                        account.amount += parseFloat((deal.buyFunds - amount).toFixed(4));
                                                    }
                                                    account.save((err) => {
                                                        if (err) {
                                                            res.status(502).send(err);
                                                        } else {
                                                            res.status(200).send(deal);
                                                        }
                                                    })
                                                });
                                            }
                                        });
                                    }
                                });
                            } else if (deal.side == sellSide) {
                                Account.findOne({userId: user._id, currency: 'USD'}, (err, account) => {
                                    if (err) {
                                        res.status(502).send(err);
                                    } else {
                                        account.amount += parseFloat((deal.granted * deal.sellPrice).toFixed(4));
                                        account.save((err) => {
                                            if (err) {
                                                res.status(502).send(err);
                                            } else {
                                                res.status(200).send(deal);
                                            }
                                        });
                                    }
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
            }
        });
    }
});

router.get('/', (req, res) => {
    const user = req.decoded._doc;
    const options = Object.assign({}, defaultOptions, req.body || {});
    const { limit, dateTill, dateFrom, side, status } = options;

    let query = { $and: [] };
    if (side) query.$and.push({side: side});
    if (status) query.$and.push({status: status});
    if (dateFrom) query.$and.push({dateClosed: {$gte: dateFrom}});
    if (dateTill) query.$and.push({dateClosed: {$lte: dateTill}});

    let result = Object.assign({}, {}, defaultResult);

    if (user.role == 'admin') {
        if (query.$and.length > 0){
            Deal.find(query).sort({dateOpened:-1}).exec((err, deals) => {
                if (err) {
                    res.status(502).send(err);
                } else {
                    Object.assign(result, {results: deals, count: deals.length});
                    res.status(200).send(result);
                }
            });
        } else {
            delete query.$and;
            Deal.find(query).sort({dateOpened:-1}).limit(+limit).exec((err, deals) => {
                if (err) {
                    res.status(502).send(err);
                } else {
                    Object.assign(result, {results: deals, count: deals.length});
                    res.status(200).send(result);
                }
            });
        }
    } else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.status(401).send(result);
    }
});

router.get('/:id', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user){
        Deal.findById(req.params.id, (err, deal) => {
            if (err) {
                res.status(502).send(err);
            } else {
                if (deal.buyerId == user._id || deal.sellerId == user._id){
                    res.status(200).send(deal);
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

router.put('/:id', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user){
        Deal.findById(req.params.id, (err, deal) => {
            if (err) {
                res.status(502).send(err);
            } else {
                if (deal.buyerId == user._id || deal.sellerId == user._id){
                    Object.assign(deal, req.body);
                    deal.save((err) => {
                        if (err) {
                            res.status(502).send(err);
                        } else {
                            res.status(200).send(deal);
                        }
                    });
                } else {
                    Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
                    res.status(401).send(result);
                }
            }
        });
    }
    else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.status(401).send(result);
    }
});

router.delete('/:id', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user) {
        Deal.findById(req.params.id, (err, deal) => {
            if (err) {
                res.status(502).send(err);
            } else {
                if (deal.buyerId == user._id || deal.sellerId == user._id){
                    Deal.findByIdAndRemove(req.params.id, (err) => {
                        if (err) {
                            res.status(502).send(err);
                        } else {
                            res.status(200).send(result);
                        }
                    });
                } else {
                    Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
                    res.status(401).send(result);
                }
            }
        });
    } else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

module.exports = router;