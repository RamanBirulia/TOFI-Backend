/**
 * Created by wanfranck on 17.12.16.
 */
let express = require('express');
let router = express.Router();

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
            let child = spawn('node', ['bots/frank-bot.js', indicator]);
            child.on('exit', () => console.log('Frank exited ' + child.pid));
            child.stdout.on('data', (data) => console.log(child.pid + '-stdout: ' + data));
            child.stderr.on('data', (data) => console.log(child.pid + '-stderr: ' + data));
        });
    } else {
        Object.assign(result, {success: false, errors: { user: 'Permission denied.'} });
        res.status(401).send(result);
    }
});

router.get('/', (req, res) => {
});

router.delete('/:id', (req, res) => {

});

module.exports = router;