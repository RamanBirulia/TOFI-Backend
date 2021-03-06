/**
 * Created by wanfranck on 01.12.16.
 */
let express = require('express');
let router = express.Router();

let User = require('../models/user');

const defaultResult = {success: true, errors: {}};
const defaultOptions = {limit: 15, page: 1};

router.get('/me', (req, res) => {
    let result = Object.assign({}, {}, defaultResult);
    const user = req.decoded._doc;

    if (user) {
        User.findById(user._id, (err, user) => {
            if (err) {
                res.status(502).send(err);
            } else {
                if (user) {
                    res.status(200).send(user);
                } else {
                    Object.assign(result, {success: false, errors: {user: 'User not found.'}});
                    res.status(403).send(result);
                }
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.put('/me', (req, res) => {
    let result = Object.assign({}, {}, defaultResult);
    let user = Object.assign({}, {}, req.decoded._doc);

    if (user){
        User.findById(user._id, (err, user) => {
            if (err) {
                res.status(502).send(err);
            } else {
                if (user){
                    Object.assign(user, req.body);
                    user.save((err) => {
                        if (err) {
                            res.status(502).send(err);
                        } else {
                            res.status(200).send(user);
                        }
                    });
                } else {
                    Object.assign(result, {success: false, errors: {user: 'User not found.'}});
                    res.status(403).send(result);
                }

            }
        });
    }
    else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.get('/', (req, res) => {
    let result = Object.assign({}, {}, defaultResult);

    const user = Object.assign({}, {}, req.decoded._doc);
    const options = Object.assign({}, defaultOptions, req.body || {});
    const { limit } = options;
    const query = {};

    if (user.role == 'admin') {
        User.find(query).limit(+limit).exec((err, users) => {
            if (err) {
                res.status(502).send(err);
            } else {
                User.count(query, (err, count) => {
                    if (err) {
                        res.status(502).send(err);
                    } else {
                        Object.assign(result, {results: users, count: count});
                        res.status(200).send(result);
                    }
                });
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.post('/', (req, res) => {
    let result = Object.assign({}, {}, defaultResult);
    const user = req.decoded._doc;

    if (user.role == 'admin'){
        let newUser = new User();
        Object.assign(newUser, req.body);
        newUser.save((err) => {
            if (err) {
                res.status(502).send(err);
            } else {
                res.status(200).send(user);
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.get('/:id', (req, res) => {
    let result = Object.assign({}, {}, defaultResult);
    const user = req.decoded._doc;

    if (user.role == 'admin'){
        User.findById(req.params.id, (err, user) => {
            if (err) {
                res.status(502).send(err);
            } else {
                if (user){
                    res.status(200).send(user);
                } else {
                    Object.assign(result, {success: false, errors:{user: 'User not found.'}});
                    res.status(403).send(result);
                }
            }
        });
    } else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.put('/:id', (req, res) => {
    let result = Object.assign({}, {}, defaultResult);
    const user = req.decoded._doc;

    if (user.role == 'admin'){
        User.findById(req.params.id, (err, user) => {
            if (err) {
                res.status(502).send(err);
            } else {
                if (user){
                    Object.assign(user, req.body);
                    user.save((err) => {
                        if (err) {
                            res.status(502).send(err);
                        } else {
                            res.status(200).send(user);
                        }
                    });
                } else {
                    Object.assign(result, {success: false, errors:{user: 'User not found.'}});
                    res.status(403).send(result);
                }

            }
        });
    }
    else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

router.delete('/:id', (req, res) => {
    let result = Object.assign({}, {}, defaultResult);
    let user = req.decoded._doc;

    if (user.role == 'admin'){
        User.findByIdAndRemove(req.params.id, (err) => {
            if (err) {
                res.status(502).send(err);
            } else {
                res.status(200).send(result);
            }
        });
    }
    else {
        Object.assign(result, {success: false, errors: {user: 'Permission denied.'}});
        res.status(401).send(result);
    }
});

module.exports = router;