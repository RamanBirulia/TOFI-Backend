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
                    console.log('Authentication succeed');
                    this.sendPid(() => console.log('PID sent'));
                    this.getDelay(() => console.log('Got delay'));
                    let controlMarket = () => {
                        setTimeout(() => {
                            this.getLastRate((rate) => {
                                let date = new Date(rate.date);
                                this.getDeals((deals) => {
                                    console.log(deals);
                                    controlMarket();
                                }, date);
                            });
                        }, this.delay);
                    };
                    controlMarket();
                },
                () => {
                    console.log('Ooops, authentication failed, need to register first');
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

    getDelay(cb){
        request({
            method:'GET',
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

    sendPid(cb){
        request({
            method:'POST',
            url: 'http://localhost:3000/api/bots',
            form: {
                botId: this.login,
                pid: process.pid
            }
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            console.log(response.botId, 'now has pid', response.pid);
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
            url: 'http://localhost:3000/api/rates/last'
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

    postRate(){

    }
}

let edward = new EdwardBot(login, password, name, surname);
edward.onStart();

process.on('SIGHUP', () => {
    console.log('Edward got SIGHUP');
    edward.getDelay(() => {});
});