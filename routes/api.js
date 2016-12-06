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

router.use('/instruments', instrumentRouter);
router.use('/rates', rateRouter);

router.post('/register', (req, res) => {
    // find users with same login or email
    User.find({
        $or: [
            { login: req.body.login },
            { email: req.body.email }
        ]
    }, (err, users) => {
        if (err) res.send(err);

        let result = { success: true, errors: {} };
        users.forEach((user) => {
            result.success &= !(user.login == req.body.login || user.email == req.body.email);
            if (user.login == req.body.login)
                Object.assign(result.errors, { login: 'Registration failed. Login is already used.'});
            if (user.email == req.body.email)
                Object.assign(result.errors, { email: 'Registration failed. E-mail is already used.'});
        });

        // if there is no users with same login or email
        if (!result.success){
            res.json(result);
        }
        else {
            let user = new User();
            Object.assign(user, req.body);
            user.admin = false;
            // TODO: hashing password here before save
            user.save((err) => {
                if (err) res.send(err);
                Object.assign(result, { message: 'Registration completed. You are free to log in now.' });
                res.json(result);
            });
        }
    });
});
router.post('/authenticate', (req, res) => {
    // find the user
    User.findOne({
        login: req.body.login
    }, (err, user) => {
        console.log(user);
        if (err) res.send(err);

        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        }
        else {

            // check if password matches
            if (user.password != req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {

                // if user is found and password is right create a token
                var token = jwt.sign(user, config.get('magicSecret'), {
                    expiresIn: '1440m' // expires in 24 hours
                });

                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token,
                    user: user
                });
            }

        }

    });
});

router.use((req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, config.get('magicSecret'), (err, decoded) => {
            if (err) return res.json({ success: false, message: 'Failed to authenticate token.' });
            else {
                req.decoded = decoded;
                next();
            }
        });

    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the coolest user API on earth!',
        user: req.decoded._doc
    });
});

router.use('/users', userRouter);
router.use('/accounts', accountRouter);
router.use('/deals', dealRouter);

module.exports = router;