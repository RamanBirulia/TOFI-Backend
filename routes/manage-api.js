/**
 * Created by wanfranck on 04.12.16.
 */
let fs = require('fs');
let parseSync = require('csv-parse/lib/sync');

let express = require('express');
let router = express.Router();

let User = require('../models/user');
let Rate = require('../models/rate');
let Instrument = require('../models/instrument');
let Deal = require('../models/deal');
let Account = require('../models/account');
let Variable = require('../models/variable');
let Bot = require('../models/bot');
let Log = require('../models/log');

router.get('/', (req, res) => {
    res.json({message: 'Welcome to the coolest managing API on earth.'});
});

router.get('/setup-users', (req, res) => {
    let admin = new User({
        email: 'admin@admin.admin',
        login: 'admin',
        name: 'Donald',
        surname: 'Trump',
        password: 'admin',
        role: 'admin'
    });
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

    let users = [admin, nick, petr, vlad];

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

    Bot.remove({}, (err) => {
        if (err) {
            res.status(502).send(err);
        } else {
            Account.remove({}, (err) => {
                if (err) {
                    err.status(502).send(err);
                } else {
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
                }
            });
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
    Log.remove({}, (err) => {
        if (err) {
            res.status(502).send(err);
        } else {
            Deal.remove({}, (err) => {
                if (err) {
                    res.status(502).send(err);
                } else {
                    console.log('Deals dropped.');
                    res.status(200).send({success: true});
                }
            });
        }
    });
});

router.get('/setup-variables', (req, res) => {
    let params = [
        ['deal-interval', '5000'],
        ['rate-interval', '60000'],
        ['path', 'maybe-once-but-not-now']
    ];
    Variable.remove({}, (err) => {
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
});

module.exports = router;