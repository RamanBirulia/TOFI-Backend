/**
 * Created by wanfranck on 21.11.16.
 */
var jwt = require('jsonwebtoken');
var config = require('../config/index');

var express = require('express');
var router = express.Router();

var userRouter = require('./user-router');
var dealRouter = require('./deal-router');
var rateRouter = require('./rate-router');
var accountRouter = require('./account-router');
var instrumentRouter = require('./instrument-router');

var User = require('../models/user');

const defaultResult = {success: true, errors: {}};

router.use('/rates', rateRouter);
router.use('/instruments', instrumentRouter);

router.post('/register', (req, res) => {
    let result = Object.assign({}, {}, defaultResult);

    User.find({$or: [{login: req.body.login}, {email: req.body.email}]}, (err, users) => {
        if (err) {
            res.status(502).send(err);
        } else {
            let errors = {};

            users.forEach((user) => {
                result.success &= !(user.login == req.body.login || user.email == req.body.email);
                if (user.login == req.body.login)
                    Object.assign(errors, {login: 'Registration failed. Login is already used.'});
                if (user.email == req.body.email)
                    Object.assign(errors, {email: 'Registration failed. E-mail is already used.'});
            });

            Object.assign(result, {errors: errors});

            if (!result.success) {
                res.status(401).send(result);
            } else {
                let user = new User();
                Object.assign(user, req.body);
                //Object.assign(user, {role:'trader'});

                //TODO: hashing password here before save
                user.save((err) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        res.status(200).send(user);
                    }
                });
            }
        }
    });
});

router.post('/authenticate', (req, res) => {
    let result = Object.assign({}, {}, defaultResult);

    User.findOne({login: req.body.login}, (err, user) => {
        if (err) {
            res.status(502).send(err);
        } else {
            if (!user) {
                Object.assign(result, {success: false, errors: {user: 'Authentication failed. User not found.'}});
                res.status(401).send(result);
            } else {
                if (user.password != req.body.password) {
                    Object.assign(result, {success: false, errors: {password: 'Authentication failed. Wrong password.'}});
                    res.status(401).send(result);
                } else {
                    let token = jwt.sign(user, config.get('magicSecret'), {expiresIn: '1440m'});
                    Object.assign(result, {token: token});
                    res.status(200).send(result);
                }
            }
        }
    });
});

router.use((req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    let result = Object.assign({}, {}, defaultResult);

    if (token) {
        jwt.verify(token, config.get('magicSecret'), (err, decoded) => {
            if (err) {
                Object.assign(result, {success: false, errors: {verification: 'Failed to authenticate token.'}});
                res.status(401).send(result);
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {verification: 'No token provided.'}});
        res.status(403).send(result);
    }
});

router.get('/', (req, res) => {
    res.status(200).send(req.decoded._doc);
});

router.use('/users', userRouter);
router.use('/deals', dealRouter);
router.use('/accounts', accountRouter);

module.exports = router;