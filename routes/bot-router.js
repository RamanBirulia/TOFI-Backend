/**
 * Created by wanfranck on 17.12.16.
 */
let express = require('express');
let router = express.Router();

let Bot = require('../models/bot');

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

});

router.get('/', (req, res) => {

});

router.delete('/:id', (req, res) => {

});

module.exports = router;