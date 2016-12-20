/**
 * Created by wanfranck on 30.11.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var AccountSchema = new Schema({
    userId: ObjectId,
    currency: String,
    amount: Number
});

module.exports = mongoose.model('Account', AccountSchema);