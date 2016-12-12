/**
 * Created by wanfranck on 21.11.16.
 */
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config/index');

var userRouter = require('./user-router');
var dealRouter = require('./deal-router');
var instrumentRouter = require('./instrument-router');
var rateRouter = require('./rate-router');
var accountRouter = require('./account-router');

var User = require('../models/user');

let defaultResult = {success: true, errors: {}};

router.use('/instruments', instrumentRouter);
router.use('/rates', rateRouter);

router.post('/register', (req, res) => {
    let result = defaultResult;

    User.find({
        $or: [
            { login: req.body.login },
            { email: req.body.email }
        ]
    }, (err, users) => {
        if (err) {
            res.send(err);
            return;
        }

        users.forEach((user) => {
            result.success &= !(user.login == req.body.login || user.email == req.body.email);
            if (user.login == req.body.login)
                Object.assign(result.errors, { login: 'Registration failed. Login is already used.'});
            if (user.email == req.body.email)
                Object.assign(result.errors, { email: 'Registration failed. E-mail is already used.'});
        });

        if (!result.success) {
            res.json(result);
        } else {
            let user = new User();
            Object.assign(user, req.body);
            user.admin = false;

            // TODO: hashing password here before save
            user.save((err) => {
                if (err) {
                    res.send(err);
                    return;
                }
                res.json(user);
            });
        }
    });
});

router.post('/authenticate', (req, res) => {
    let result = defaultResult;

    User.findOne({
        login: req.body.login
    }, (err, user) => {
        if (err) {
            res.send(err);
            return;
        }

        if (!user) {
            Object.assign(result, {success: false, errors: {user: 'Authentication failed. User not found.' }});
            res.json(result);
        } else {
            if (user.password != req.body.password) {
                Object.assign(result, {success: false, errors: {password: 'Authentication failed. Wrong password.' }});
                res.json(result);
            } else {
                var token = jwt.sign(user, config.get('magicSecret'), {expiresIn: '1440m'});
                Object.assign(result, {token: token});
                res.json(result);
            }
        }
    });
});

router.use((req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    let result = defaultResult;

    if (token) {
        jwt.verify(token, config.get('magicSecret'), (err, decoded) => {
            if (err) {
                Object.assign(result, {success: false, errors: {verification: 'Failed to authenticate token.' }});
                res.json(result);
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        Object.assign(result, {success: false, erros: {verification: 'No token provided.'}});
        res.status(403).send(result);
    }
});

router.get('/', (req, res) => {
    res.json(req.decoded._doc);
});

router.use('/users', userRouter);
router.use('/deals', dealRouter);
router.use('/accounts', accountRouter);

module.exports = router;