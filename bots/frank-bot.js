/**
 * Created by wanfranck on 08.12.16.
 */
let request = require('request');

let name = 'Frank', surname = 'Cowperwood';
let login = name + process.argv[2], password = surname + process.argv[2];

let buySide = 'BUY';
let sellSide = 'SELL';

let min = (a, b) => {return a < b ? a: b};
let max = (a, b) => {return a > b ? a: b};

let randomInteger = (min, max) => {
    let rand = Math.random() * (max - min) + min;
    return Math.round(rand);
};

let randomFloat = (min, max) => {
    return Math.random() * (max - min) + min;
};

class FrankBot{
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

                    let makeDeal = () => {
                        setTimeout(() => {
                            let range = randomInteger(5, 35);
                            this.getRates(range, (rates) => {
                                let predictable = FrankBot.calcMovingAverage(rates);
                                this.getLastRate((rate) => {
                                    const
                                        side = predictable >= rate.rate ? buySide : sellSide,
                                        units = randomInteger(50, 100),
                                        minRate = min(rate.rate, predictable),
                                        maxRate = max(rate.rate, predictable),
                                        price = randomFloat(minRate, maxRate);

                                    if (side == buySide){
                                        this.postDeal(side, units, price, makeDeal);
                                    } else if (side == sellSide) {
                                        this.postDeal(side, units, price, makeDeal);
                                    }
                                });
                            });
                        }, this.delay);
                    };

                    this.getAccounts(() => {
                        if (this.accounts.length == 0){
                            this.createAccounts();
                        }
                        makeDeal();
                    });
                },
                () => this.register(authenticate)
            );
        };

        authenticate();
    }

    static calcMovingAverage(rates){
        let result = rates.reduce((init, rate) => {
            init.sum += rate.rate;
            init.count++;
            return init;
        }, { count: 0, sum: 0});
        return result.sum / result.count;
    }

    getDelay(cb = () => {}){
        request({
            method:'GET',
            headers: {
                'x-access-token': this.token
            },
            url: 'http://localhost:3000/api/variables/deal-interval'
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
            headers: {
                'x-access-token': this.token
            },
            url: 'http://localhost:3000/api/bots',
            form: {botId: this.login, pid: process.pid}
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            if (response._id) cb();
        });
    }

    register(cb = () => {}){
        request({
            method: 'POST',
            url: 'http://localhost:3000/api/register',
            form: {
                login: this.login,
                password: this.password,
                name: this.name,
                surname: this.surname,
                email: this.email,
                role: 'trader'
            }
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            if (response._id) cb();
        });
    }

    authenticate(resolve = () => {}, reject = () => {}){
        request({
            method: 'POST',
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

    getAccounts(cb = () => {}){
        request({
            method:'GET',
            headers: {
                'x-access-token': this.token
            },
            url: 'http://localhost:3000/api/accounts/my'
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            if (response.success){
                this.accounts = response.results;
            }
            cb();
        })
    }

    getRates(range, cb = () => {}){
        request({
            method:'GET',
            url: 'http://localhost:3000/api/rates/',
            headers: {
                'x-access-token': this.token
            },
            form: {
                limit: range
            }
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

    getLastRate(cb = (rate) => {}){
        request({
            method:'GET',
            headers: {
                'x-access-token': this.token
            },
            url: 'http://localhost:3000/api/rates/last'
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            if (response._id){
                cb(response);
            }
        });
    }

    postDeal(side, units, rate, cb = () => {}){
        let body = {};
        body['side'] = side;
        body['units'] = units;
        if (side == buySide) {
            body['buyPrice'] = rate;
        } else if (side == sellSide) {
            body['sellPrice'] = rate;
        }

        request({
            method:'POST',
            url: 'http://localhost:3000/api/deals',
            headers: {
                'x-access-token': this.token
            },
            form: body
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            console.log(response.dateOpened, response.units, response.side, response.status);
            cb();
        })
    }

    createAccounts(){
        request({
            url: 'http://localhost:3000/api/accounts/my',
            method: 'POST',
            form: {
                amountUSD: 1000,
                amountEUR: 1000
            },
            headers: {
                'x-access-token': this.token
            }
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            this.accounts = response;
        });
    }

    addFunds(currency, amount){
        for (let i = 0; i < this.accounts.length; i++){
            let account = this.accounts[i];
            if (account.currency == currency){
                request({
                    url: 'http://localhost:3000/api/accounts/' + account._id,
                    method: 'PUT',
                    form: {amount: amount},
                    headers: {'x-access-token': this.token}
                }, (err, res) => {

                });
            }
        }
    }
}

let frank = new FrankBot(login, password, name, surname);
frank.onStart();

process.on('SIGHUP', (err, res) => {
    frank.getDelay(() => {});
});