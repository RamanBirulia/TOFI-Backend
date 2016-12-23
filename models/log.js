/**
 * Created by wanfranck on 12.12.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LogSchema = new Schema({
    botId: String,
    log: String,
    date: Date
});

module.exports = mongoose.model('Log', LogSchema);