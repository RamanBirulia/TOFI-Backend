/**
 * Created by wanfranck on 04.12.16.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var parseSync = require('csv-parse/lib/sync');

var User = require('../models/user');
var Rate = require('../models/rate');
var Instrument = require('../models/instrument');
var Deal = require('../models/deal');
var Account = require('../models/account');

router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the coolest managing API on earth!'
    });
});

router.get('/setup-users', (req, res) => {
    let nick = new User({
        email: 'nick.cerminara@sample.com',
        login: 'Nick.Cerminara',
        name: 'Nick',
        surname: 'Cerminara',
        password: 'password',
        admin: true
    });
    let petr = new User({
        email: 'petr.mitrichev@sample.com',
        login: 'Petr.Mitrichev',
        name: 'Petr',
        surname: 'Mitrichev',
        password: 'password'
    });
    let vlad = new User({
        email: 'vlad.isenbaev@sample.com',
        login: 'Vlad.Isenbaev',
        name: 'Vlad',
        surname: 'Isenbaev',
        password: 'password'
    });

    let createAccounts = (user, amountEUR, amountUSD, cb) => {
        let accountEUR = new Account();
        Object.assign(accountEUR, { userId: user._id, currency: 'EUR', amount: amountEUR, blocked: 0 });
        let accountUSD = new Account();
        Object.assign(accountUSD, { userId: user._id, currency: 'USD', amount: amountUSD, blocked: 0 });
        accountEUR.save((err) => {
            if (err) {
                res.send(err);
                return;
            }
            accountUSD.save((err) => {
                if (err) {
                    res.send(err);
                    return;
                }
                cb();
            });
        });
    };

    User.remove({}, (err) => {
        if (err) {
            res.send(err);
            return;
        }
        nick.save((err) => {
            if (err) {
                res.send(err);
                return;
            }
            petr.save((err) => {
                if (err) {
                    res.send(err);
                    return;
                }
                createAccounts(petr, 1000000, 1000000, () => {
                    vlad.save((err) => {
                        if (err) {
                            res.send(err);
                            return;
                        }
                        createAccounts(vlad, 120000, 120000, () => {
                            console.log('Users saved successfully.');
                            res.json({ success: true });
                        });
                    });
                });
            })
        });
    });
});

router.get('/setup-rates', (req, res) => {
    let rates = parseSync(fs.readFileSync('../initials/rates', 'utf-8'), {
        columns: true, encoding: 'UTF-8', delimiter: ','
    });

    Rate.remove({}, (err) => {
        Promise.all(rates.map((item) => {
            return new Promise((resolve, reject) => {
                let rate = new Rate();
                Object.assign(rate, item);
                rate.save((err) => {
                    if (err) reject(err);
                    resolve(rate);
                });
            });
        })).then(
            value => {
                console.log('Rates loaded.');
                res.json({ success: true });
            },
            reason => {
                console.log('Error during data initialization.');
                res.json({ success: false });
            }
        );
    });
});

router.get('/setup-instruments', (req, res) => {
    let instrument = new Instrument();
    Object.assign(instrument, { value: 'EUR/USD' });

    Instrument.remove({}, (err) => {
        instrument.save((err) => {
            if (err) {
                res.send(err);
                return;
            }
            console.log('Instrument added.');
            res.json({ success: true });
        });
    });
});

router.get('/setup-deals', (req, res) => {
    Deal.remove({}, (err) => {
        if (err) {
            res.send(err);
            return;
        }
        console.log('Deals dropped.');
        res.json({ success: true });
    });
});

module.exports = router;