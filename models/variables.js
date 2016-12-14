/**
 * Created by wanfranck on 14.12.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VariableSchema = new Schema({
    key: String,
    value: String
});

module.exports = mongoose.model('Variable', VariableSchema);