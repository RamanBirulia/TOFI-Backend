/**
 * Created by wanfranck on 13.12.16.
 */
var request = require('request');

let count = 0;
let delay = (+process.argv[2] + 2) * 100 + 50;

process.on('SIGHUP', (err, res) => {
    console.log('Edward got SIGHUP');
});

class EdwardBot{
    constructor(login, password){
        this.login = login;
        this.password = password;
    }

    onStart(){
        this.authenticate(() => {
            let controlMarket = () => {
                let dateFrom = new Date('2016-11-06T00:00:00.000Z');
                let dateTill = new Date('2016-11-06T00:00:00.000Z');
                this.getRates((deals) => {
                    console.log(deals);
                }, dateFrom, dateTill);
            };
            controlMarket();
        });
    }

    static calcWeightedAverage(deals){
        let result = deals.reduce((init, deal) => {
            result.sum += deal.units * deal.rate;
            result.units += deal.units;
        }, {sum: 0, units: 0});
        return result.sum / result.units;
    }

    authenticate(cb){
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

    getDeals(cb, dateFrom, dateTill){
        let options = { dateFrom, dateTill };

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
            console.log(response);
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
            console.log(response);
            if (response.success){
                cb(response.results);
            } else {
                cb([]);
            }
        });
    }

    postRate(){

    }

    restartMarket(){

    }
}

let edward = new EdwardBot('Nick.Cerminara', 'password');
edward.onStart();