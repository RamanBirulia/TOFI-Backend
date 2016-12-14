/**
 * Created by wanfranck on 08.12.16.
 */
var request = require('request');

let count = 0;
let delay = (+process.argv[2] + 2) * 100 + 50;

process.on('SIGHUP', (err, res) => {
    console.log('Frank #%d Got SIGHUP', +process.argv[2]);
    delay += 75;
});

let buySide = 'BUY';
let sellSide = 'SELL';

let randomInteger = (min, max) => {
    let rand = Math.random() * (max - min) + min;
    return Math.round(rand);
};

class FrankBot{
    constructor(login, password){
        this.login = login;
        this.password = password;
    }

    onStart(){
        console.log('Hello, I am Frank #' + +process.argv[2]);
        this.authentificate(() => {
            if (this.token){
                console.log(this.token);
                let makeDeal = () => {
                    setTimeout(() => {
                        this.getAccounts(() => {
                            console.log(this.accounts);
                            let interval = randomInteger(5, 35);
                            this.getRates(interval, (rates) => {
                                console.log(rates.length);
                                console.log(FrankBot.calcMovingAverage(rates));
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
                                    console.log("Hm, It's pretty defficult to make a decision.");
                                }
                            });
                        })
                    }, delay);
                };

                makeDeal();
            }
            else {
                console.log('Hm, no token, I can not trade.');
            }
        });
    }

    static calcMovingAverage(rates){
        let result = rates.reduce((init, rate) => {
            init.sum += rate.rate;
            init.count++;
            return init;
        }, { count: 0, sum: 0});
        return result.sum / result.count;
    }

    authentificate(cb){
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
            }
            cb();
        })
    }

    getAccounts(cb){
        request({
            method:'GET',
            headers: {
                'x-access-token': this.token
            },
            url: 'http://localhost:3000/api/accounts'
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
            url: 'http://localhost:3000/api/rates/' + interval
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

let frank = new FrankBot('Vlad.Isenbaev', 'password');
frank.onStart();