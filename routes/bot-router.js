/**
 * Created by wanfranck on 17.12.16.
 */
var express = require('express');
var router = express.Router();

var Bot = require('../models/bot');

const defaultResult = {success: true, errors: {}};

router.post('/', (req, res) => {
    const result = defaultResult;

    Bot.find({botId: req.body.botId}, (err, bot) => {
        if (err) {
            res.status(502).send(err);
        } else {
            if (bot){
                bot.pid = req.body.pid;
                bot.save((err) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        res.status(200).send(result);
                    }
                });
            } else {
                let bot = new Bot();
                Object.assign(bot, req.body);
                bot.save((err) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        res.status(200).send(result);
                    }
                });
            }
        }

    });
});