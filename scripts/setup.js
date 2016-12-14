/**
 * Created by wanfranck on 14.12.16.
 */
var fs = require('fs');
var parseSync = require('csv-parse/lib/sync');
var request = require('request');

let getManageMessage = () => {
    request({
        method:'GET',
        url:'http://localhost:3000/manage/'
    }, (err, res) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log(res.body);
        }
    });
};

let setupRates = () => {
    request({
        method:'GET',
        url:'http://localhost:3000/manage/setup-rates'
    }, (err, res) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log(res.body);
        }
    });
};

let setupUsers = () => {
    request({
        method:'GET',
        url:'http://localhost:3000/manage/setup-users'
    }, (err, res) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log(res.body);
        }
    });
};

let setupDeals = () => {
    request({
        method:'GET',
        url:'http://localhost:3000/manage/setup-deals'
    }, (err, res) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log(res.body);
        }
    });
};

let setupInstruments = () => {
    request({
        method:'GET',
        url:'http://localhost:3000/manage/setup-instruments'
    }, (err, res) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log(res.body);
        }
    });
};

getManageMessage();
setupRates();
setupUsers();
setupDeals();
setupInstruments();