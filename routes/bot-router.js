/**
 * Created by wanfranck on 17.12.16.
 */
let express = require('express');
let router = express.Router();
let fs = require('fs');

let spawn = require('child_process').spawn;

let Bot = require('../models/bot');

const defaultResult = {success: true, errors: {}};
const defaultOptions = {limit: 15, page: 1};

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
    let re = new RegExp(req.body.botName);
    if (user.role == 'admin'){
        let indicator = 1;
        Bot.find({botId: re}, (err, bots) => {
            bots = bots.map(bot => bot.botId.split(re)[1]);
            while (bots.indexOf(indicator) != -1) indicator++;
            spawn('node', ['bots/frank-bot.js', indicator], {
                stdio: [
                    0,
                    fs.openSync('logs/frank-bot-' + indicator + '-log.out', 'w'),
                    fs.openSync('logs/frank-bot-' + indicator + '-log.out', 'w')
                ]
            });
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

router.get('/:id/logs', (req, res) => {
    const user = req.decoded._doc;
    let result = Object.assign({}, {}, defaultResult);

    if (user.role == 'admin') {
        Bot.findById(req.params.id, (err, bot) => {
            if (err) {
                res.status(502).send(err);
            } else {
                let indicator = bot.botId.match(/\d+/)[0];
                let name = bot.botId.split(indicator)[0];
                let filename = name.toLowerCase() + '-bot-' + indicator + '-log.out';
                fs.readFile(filename, 'utf-8', (logs) => {
                    Object.assign(result, {logs: logs});
                    res.status(200).send(result);
                });
            }
        });
    } else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.status(401).send(result);
    }
});

module.exports = router;