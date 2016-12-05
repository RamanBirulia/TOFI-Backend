/**
 * Created by wanfranck on 30.11.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var DealSchema = new Schema({
    instrument: String,
    units: Number,
    granted: Number,

    sellerId: ObjectId,
    sellPrice: Number,
    buyerId: ObjectId,
    buyPrice: Number,

    side: String,
    status: String,
    dateOpened: Date,
    dateClosed: Date
});

module.exports = mongoose.model('Deal', DealSchema);