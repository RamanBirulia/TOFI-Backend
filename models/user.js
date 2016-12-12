/**
 * Created by wanfranck on 21.11.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    login: String,
    password: String,
    email: String,
    role: String,
    name: String,
    surname: String
});

module.exports = mongoose.model('User', UserSchema);