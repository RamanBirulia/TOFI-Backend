/**
 * Created by wanfranck on 04.12.16.
 */
var fs = require('fs');
var parseSync = require('csv-parse/lib/sync');

var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Rate = require('../models/rate');
var Instrument = require('../models/instrument');
var Deal = require('../models/deal');
var Account = require('../models/account');
var Variable = require('../models/variable');

router.get('/', (req, res) => {
    res.json({message: 'Welcome to the coolest managing API on earth.'});
});

router.get('/setup-users', (req, res) => {
    let nick = new User({
        email: 'nick.cerminara@sample.com',
        login: 'Nick.Cerminara',
        name: 'Nick',
        surname: 'Cerminara',
        password: 'password',
        role: 'admin'
    });
    let petr = new User({
        email: 'petr.mitrichev@sample.com',
        login: 'Petr.Mitrichev',
        name: 'Petr',
        surname: 'Mitrichev',
        password: 'password',
        role: 'trader'
    });
    let vlad = new User({
        email: 'vlad.isenbaev@sample.com',
        login: 'Vlad.Isenbaev',
        name: 'Vlad',
        surname: 'Isenbaev',
        password: 'password',
        role: 'trader'
    });

    let users = [nick, petr, vlad];

    let createAccounts = (user, amountEUR, amountUSD, cb) => {
        let accountEUR = new Account();
        Object.assign(accountEUR, { userId: user._id, currency: 'EUR', amount: amountEUR, blocked: 0 });
        let accountUSD = new Account();
        Object.assign(accountUSD, { userId: user._id, currency: 'USD', amount: amountUSD, blocked: 0 });
        accountEUR.save((err) => {
            if (err) {
                res.status(502).send(err);
            } else {
                accountUSD.save((err) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        cb(user);
                    }
                });
            }
        });
    };

    User.remove({}, (err) => {
        if (err) {
            res.status(502).send(err);
        } else {
            Promise.all(users.map(user => {
                return new Promise((resolve, reject) => {
                    user.save((err) => {
                        if (err) {
                            reject(user);
                        } else {
                            if (user.role == 'admin'){
                                resolve(user);
                            } else {
                                createAccounts(user, 1000, 1000, resolve);
                            }
                        }
                    });
                });
            })).then(
                value => {
                    console.log('Users loaded.');
                    res.status(200).send({success: true});
                },
                reason => {
                    console.log('Errors during users setup.');
                    res.status(502).send({success: false});
                }
            )
        }
    });
});

router.get('/setup-rates', (req, res) => {
    let path = __dirname.split('/');
    path = path.splice(0, path.length - 1);
    path = path.join('/') + '/initials/rates';

    let rates = parseSync(fs.readFileSync(path, 'utf-8'), {
        columns: true, encoding: 'UTF-8', delimiter: ','
    }).map(rate => {
        rate.date = rate.date.split('.').reverse().join('-');
        return rate;
    });

    Rate.remove({}, (err) => {
        if (err) {
            res.status(502).send(err);
        } else {
            Promise.all(rates.map((item) => {
                return new Promise((resolve, reject) => {
                    let rate = new Rate();
                    Object.assign(rate, item);
                    rate.save((err) => {
                        if (err) reject(rate);
                        else resolve(rate);
                    });
                });
            })).then(
                value => {
                    console.log('Rates loaded.');
                    res.status(200).send({success: true});
                },
                reason => {
                    console.log('Error during rates setup.');
                    res.status(502).send({success: false});
                }
            );
        }
    });
});

router.get('/setup-instruments', (req, res) => {
    let instrument = new Instrument();
    Object.assign(instrument, {value: 'EUR/USD'});

    Instrument.remove({}, (err) => {
        instrument.save((err) => {
            if (err) {
                res.status(502).send(err);
            } else {
                console.log('Instrument loaded.');
                res.status(200).send({success: true});
            }
        });
    });
});

router.get('/setup-deals', (req, res) => {
    Deal.remove({}, (err) => {
        if (err) {
            res.status(502).send(err);
        } else {
            console.log('Deals dropped.');
            res.status(200).send({success: true});
        }
    });
});

router.get('/setup-variables', (req, res) => {
    let params = [
        ['interval', '1000'],
        ['path', 'maybe-once-but-not-now']
    ];

    Promise.all(params.map(param => {
        return new Promise((resolve, reject) => {
            let variable = new Variable();
            Object.assign(variable, { key: param[0], value: param[1]});
            variable.save((err) => {
                if (err) reject(variable);
                else resolve(variable);
            })
        })
    })).then(
        value => {
            console.log('Variables loaded.');
            res.status(200).send({success:true});
        },
        reason => {
            console.log('Errors during variables setup.');
            res.status(502).send({success:false});
        }
    )

});

module.exports = router;