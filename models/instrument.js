/**
 * Created by wanfranck on 30.11.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InstrumentSchema = new Schema({
    value: String
});

module.exports = mongoose.model('Instrument', InstrumentSchema);