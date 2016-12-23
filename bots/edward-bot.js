/**
 * Created by wanfranck on 13.12.16.
 */
let request = require('request');

let name = 'Edward', surname = 'Batler';
let login = name + process.argv[2], password = surname + process.argv[2];

class EdwardBot{
    constructor(login, password, name, surname){
        this.login = login;
        this.password = password;
        this.name = name;
        this.surname = surname;
        this.email = this.name.toLowerCase() + '.' + this.surname.toLowerCase() + process.argv[2] + '@bot.org';
    }

    onStart(){
        let authenticate = () => {
            this.authenticate(
                () => {
                    this.sendPid();
                    this.getDelay();
                    let controlMarket = () => {
                        setTimeout(() => {
                            this.getLastRate((rate) => {
                                let date = new Date(rate.date);
                                date.setHours(date.getHours() + 24);
                                date = new Date(date);
                                this.getDeals((deals) => {
                                    if (deals.length) {
                                        let min = deals.reduce((min, val) => Math.min(val.sellPrice, min), deals[0].sellPrice);
                                        let max = deals.reduce((max, val) => Math.max(val.sellPrice, max), deals[0].sellPrice);
                                        let result = deals.reduce((init, val) => {
                                            init.sum += val.sellPrice * val.units;
                                            init.weight += val.units;
                                            return init;
                                        }, {sum: 0, weight: 0});
                                        let newRate = parseFloat((result.sum / result.weight).toFixed(4));
                                        min = parseFloat(min.toFixed(4));
                                        max = parseFloat(max.toFixed(4));
                                        this.postLog(date + ' ' + newRate + ' ' + min + ' ' + max + ' ');
                                        this.postRate(newRate, min, max, date, () => controlMarket());
                                    } else {
                                        controlMarket();
                                    }
                                }, rate.date);
                            });
                        }, this.delay);
                    };
                    controlMarket();
                },
                () => {
                    this.register(authenticate);
                }
            );
        };
        authenticate();
    }

    static calcWeightedAverage(deals){
        let result = deals.reduce((init, deal) => {
            result.sum += deal.units * deal.rate;
            result.units += deal.units;
        }, {sum: 0, units: 0});
        return result.sum / result.units;
    }

    getDelay(cb = () => {}){
        request({
            method:'GET',
            headers: {
                'x-access-token': this.token
            },
            url: 'http://localhost:3000/api/variables/rate-interval'
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            if (response._id) {
                this.delay = +response.value;
                cb();
            }
        });
    }

    sendPid(cb = () => {}){
        request({
            method:'POST',
            url: 'http://localhost:3000/api/bots',
            headers: {
                'x-access-token': this.token
            },
            form: {
                botId: this.login,
                pid: process.pid
            }
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            if (response._id) cb();
        });
    }

    register(cb){
        request({
            method:'POST',
            url: 'http://localhost:3000/api/register',
            form: {
                login: this.login,
                password: this.password,
                name: this.name,
                surname: this.surname,
                email: this.email,
                role: 'admin'
            }
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            if (response._id) cb();

        });
    }

    authenticate(resolve, reject){
        request({
            method:'POST',
            url: 'http://localhost:3000/api/authenticate',
            form: {
                login: this.login,
                password: this.password
            }
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            if (response.success){
                this.token = response.token;
                resolve();
            } else {
                reject();
            }
        });
    }

    getDeals(cb, dateFrom, dateTill){
        let options = { dateFrom, dateTill, status: 'CLOSED', side: 'SELL' };

        request({
            method:'GET',
            url: 'http://localhost:3000/api/deals',
            form: options,
            headers: {
                'x-access-token': this.token
            },
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            if (response.success){
                cb(response.results);
            } else {
                cb([]);
            }
        });
    }

    getRates(cb, dateFrom, dateTill){
        let options = { dateFrom, dateTill };

        request({
            method:'GET',
            url: 'http://localhost:3000/api/rates',
            form: options,
            headers: {
                'x-access-token': this.token
            },
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            if (response.success){
                cb(response.results);
            } else {
                cb([]);
            }
        });
    }

    getLastRate(cb){
        request({
            method:'GET',
            url: 'http://localhost:3000/api/rates/last',
            headers: {
                'x-access-token': this.token
            },
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            if (response._id){
                cb(response);
            } else {
                cb({});
            }
        });
    }

    postRate(rate, min, max, date, cb){
        let body = {rate, min, max, date};

        request({
            method:'POST',
            url: 'http://localhost:3000/api/rates',
            headers: {
                'x-access-token': this.token
            },
            form: body
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            cb();
        });
    }

    postLog(log){
        let body = {log};

        request({
            method:'POST',
            url: 'http://localhost:3000/api/bots/logs',
            headers: {
                'x-access-token': this.token
            },
            form: body
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
        });
    }
}





let edward = new EdwardBot(login, password, name, surname);
edward.onStart();

process.on('SIGHUP', () => {
    edward.getDelay(() => {});
});