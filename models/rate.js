/**
 * Created by wanfranck on 30.11.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RateSchema = new Schema({
    instrument: String,
    rate: Number,
    date: Date,
    min: Number,
    max: Number
});

module.exports = mongoose.model('Rate', RateSchema);