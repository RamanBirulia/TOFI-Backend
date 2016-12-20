/**
 * Created by wanfranck on 30.11.16.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

let DealSchema = new Schema({
    units: Number,
    granted: Number,
    instrument: String,

    sellerId: ObjectId,
    sellPrice: Number,

    checked: Boolean,

    buyerId: ObjectId,
    buyPrice: Number,
    buyFunds: Number,

    side: String,
    status: String,
    dateOpened: Date,
    dateClosed: Date
});

module.exports = mongoose.model('Deal', DealSchema);