/**
 * Created by wanfranck on 21.11.16.
 */
let jwt = require('jsonwebtoken');
let config = require('../config/index');

let express = require('express');
let router = express.Router();

let userRouter = require('./user-router');
let dealRouter = require('./deal-router');
let rateRouter = require('./rate-router');
let accountRouter = require('./account-router');
let instrumentRouter = require('./instrument-router');
let botRouter = require('./bot-router');
let variableRouter = require('./variable-router');

let User = require('../models/user');

const defaultResult = {success: true, errors: {}};

router.use('/bots', botRouter);
router.use('/rates', rateRouter);
router.use('/instruments', instrumentRouter);
router.use('/variables', variableRouter);

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
                    Object.assign(errors, {login: 'Login is already used.'});
                if (user.email == req.body.email)
                    Object.assign(errors, {email: 'E-mail is already used.'});
            });

            Object.assign(result, {errors: errors});

            if (!result.success) {
                res.status(401).send(result);
            } else {
                let user = new User();
                Object.assign(user, req.body);

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
                Object.assign(result, {success: false, errors: {user: 'User not found.'}});
                res.status(401).send(result);
            } else {
                if (user.password != req.body.password) {
                    Object.assign(result, {success: false, errors: {password: 'Wrong password.'}});
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