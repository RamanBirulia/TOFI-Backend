/**
 * Created by wanfranck on 17.12.16.
 */
let express = require('express');
let router = express.Router();
let fs = require('fs');

let spawn = require('child_process').spawn;

let Bot = require('../models/bot');
let Log = require('../models/log');
let Rate = require('../models/rate');

const defaultResult = {success: true, errors: {}};
const defaultOptions = {limit: 50, page: 1};

router.post('/', (req, res) => {
    Bot.findOne({botId: req.body.botId}, (err, bot) => {
        if (err) {
            res.status(502).send(err);
        } else {
            if (bot){
                bot.pid = req.body.pid;
                bot.save((err) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        res.status(200).send(bot);
                    }
                });
            } else {
                let bot = new Bot();
                Object.assign(bot, req.body);
                bot.save((err) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        res.status(200).send(bot);
                    }
                });
            }
        }
    });
});

router.post('/create', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);
    let re = new RegExp('Frank');
    if (user.role == 'admin'){
        let indicator = 1;
        Bot.find({botId: re}, (err, bots) => {
            bots = bots.map(bot => bot.botId.split(re)[1]);
            while (bots.indexOf('' + indicator) != -1) {
                indicator++;
            }
            spawn('node', ['./bots/frank-bot.js', indicator]);
            res.status(200).send(result);
        });
    } else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.status(401).send(result);
    }
});

router.get('/', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user.role == 'admin'){
        Bot.find({}, (err, bots) => {
            if (err) {
                res.status(502).send(err);
            } else {
                Object.assign(result, {results: bots, count:bots.length});
                res.status(200).send(result);
            }
        });
    } else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.status(401).send(result);
    }
});

router.get('/:login/logs', (req, res) => {
    const
        user = req.decoded._doc,
        options = Object.assign({}, {}, defaultOptions),
        {limit} = options;

    let result = Object.assign({}, {}, defaultResult);
    console.log(req.params.login);
    console.log(user);

    if (user.role == 'admin') {
        Log.find({botId: req.params.login}).sort({date: -1}).limit(limit).exec((err, logs) => {
            if (err) {
                res.status(502).send(err);
            } else {
                Object.assign(result, {results: logs, count: logs.length});
                res.status(200).send(result);
            }
        });
    } else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.status(401).send(result);
    }
});

router.post('/logs', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user) {
        let log = new Log();
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

                Object.assign(log, {date: date, botId: user.login, log: req.body.log});
                log.save((err) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        res.status(200).send(log);
                    }
                });
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

module.exports = router;