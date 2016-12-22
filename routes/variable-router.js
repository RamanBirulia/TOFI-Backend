/**
 * Created by wanfranck on 18.12.16.
 */
let express = require('express');
let router = express.Router();

let Bot = require('../models/bot');
let Variable = require('../models/variable');

const dealDelta = 1000;
const rateDelta = 10000;

router.get('/deal-interval', (req, res) => {
    Variable.findOne({key:'deal-interval'}, (err, variable) => {
        if (err) {
            res.status(502).send(err);
        } else {
            res.status(200).send(variable);
        }
    });
});

router.get('/rate-interval', (req, res) => {
    Variable.findOne({key:'rate-interval'}, (err, variable) => {
        if (err) {
            res.status(502).send(err);
        } else {
            res.status(200).send(variable);
        }
    });
});

router.get('/deal-interval/speedup', (req, res) => {
    Variable.findOne({key:'deal-interval'}, (err, variable) => {
        variable.value = '' + (+variable.value - dealDelta);
        variable.save((err) => {
            if (err) {
                res.status(502).send(err);
            } else {
                Bot.find({botId: /Frank/}, (err, bots) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        bots.forEach(bot => process.kill(+bot.pid, 'SIGHUP'));
                        res.status(200).send(variable);
                    }
                });
            }
        });
    });
});

router.get('/deal-interval/slowdown', (req, res) => {
    Variable.findOne({key:'deal-interval'}, (err, variable) => {
        variable.value = '' + (+variable.value + dealDelta);
        variable.save((err) => {
            if (err) {
                res.status(502).send(err);
            } else {
                Bot.find({botId: /Frank/}, (err, bots) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        bots.forEach(bot => process.kill(+bot.pid, 'SIGHUP'));
                        res.status(200).send(variable);
                    }
                });
            }
        });
    });
});

router.get('/rate-interval/speedup', (req, res) => {
    Variable.findOne({key:'rate-interval'}, (err, variable) => {
        variable.value = '' + (+variable.value - rateDelta);
        variable.save((err) => {
            if (err) {
                res.status(502).send(err);
            } else {
                Bot.find({botId: /Edward/}, (err, bots) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        bots.forEach(bot => process.kill(+bot.pid, 'SIGHUP'));
                        res.status(200).send(variable);
                    }
                });
            }
        });
    });
});

router.get('/rate-interval/slowdown', (req, res) => {
    Variable.findOne({key:'rate-interval'}, (err, variable) => {
        variable.value = '' + (+variable.value + rateDelta);
        variable.save((err) => {
            if (err) {
                res.status(502).send(err);
            } else {
                Bot.find({botId: /Edward/}, (err, bots) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        bots.forEach(bot => process.kill(+bot.pid, 'SIGHUP'));
                        res.status(200).send(variable);
                    }
                });
            }
        });
    });
});

module.exports = router;