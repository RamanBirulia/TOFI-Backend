/**
 * Created by wanfranck on 08.12.16.
 */
let request = require('request');

let name = 'Frank', surname = 'Cowperwood';
let login = name + process.argv[2], password = surname + process.argv[2];

let buySide = 'BUY';
let sellSide = 'SELL';

let randomInteger = (min, max) => {
    let rand = Math.random() * (max - min) + min;
    return Math.round(rand);
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
                    console.log('Authentication succeed');
                    this.sendPid(() => console.log('PID sent'));
                    this.getDelay(() => console.log('Got delay'));

                    let makeDeal = () => {
                        setTimeout(() => {
                            let interval = randomInteger(5, 35);
                            console.log('Interval', interval);
                            this.getRates(interval, (rates) => {
                                console.log('Rates', rates.length);
                                let rate = FrankBot.calcMovingAverage(rates);
                                let side = randomInteger(0, 1) == 1 ? buySide : sellSide;
                                if (side == buySide){
                                    console.log("Now I'm gonna buy some.");
                                    let units = randomInteger(50, 100);
                                    this.postDeal(side, units, rate, makeDeal);
                                } else if (side == sellSide) {
                                    console.log("Now I'm gonna sell some.");
                                    let units = randomInteger(50, 100);
                                    this.postDeal(side, units, rate, makeDeal);
                                } else {
                                    console.log("Hm, It's pretty difficult to make a decision.");
                                }
                            });
                        }, this.delay);
                    };

                    this.getAccounts(() => {
                        console.log(this.accounts);
                        if (this.accounts.length == 0){
                            let createAccounts = () => {
                                this.createAccount('USD', 1010);
                                this.createAccount('EUR', 980);
                            };
                            createAccounts();
                        } else {
                            console.log('All right, Now I can trade');
                        }
                        makeDeal();
                    });
                },
                () => {
                    console.log('Ooops, authentication failed, need to register first');
                    this.register(authenticate);
                }
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

    getDelay(cb){
        request({
            method:'GET',
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
                role: 'trader'
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

    getAccounts(cb){
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

    getRates(interval, cb){
        request({
            method:'GET',
            url: 'http://localhost:3000/api/rates/',
            form: {
                limit: interval
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

    getLastRate(cb){
        request({
            method:'GET',
            url: 'http://localhost:3000/api/rates/last'
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            if (response.success){
                cb(response.results);
            } else {
                cb({});
            }
        });
    }

    postDeal(side, units, rate, cb){
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
            console.log(res.body);
            cb();
        })
    }

    createAccount(currency, amount){
        request({
            url: 'http://localhost:3000/api/accounts/',
            method: 'POST',
            form: {
                amount: amount,
                currency: currency
            },
            headers: {
                'x-access-token': this.token
            }
        }, (err, res) => {
            if (err) throw err;
            let response = JSON.parse(res.body);
            console.log(response);
        });
    }

    addFunds(currency, amount){
        for (let i = 0; i < this.accounts.length; i++){
            let account = this.accounts[i];
            if (account.currency == currency){
                request({
                    url: 'http://localhost:3000/api/accounts/' + account._id,
                    method: 'PUT',
                    form: {
                        amount: amount
                    },
                    headers: {
                        'x-access-token': this.token
                    }
                }, (err, res) => {
                    console.log(res.body);
                });
            }
        }
    }
}

let frank = new FrankBot(login, password, name, surname);
frank.onStart();

process.on('SIGHUP', (err, res) => {
    console.log('Frank got SIGHUP');
    frank.getDelay(() => {});
});