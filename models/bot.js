/**
 * Created by wanfranck on 12.12.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BotSchema = new Schema({
    pid: 'String'
});

module.exports = mongoose.model('Bot', BotSchema);