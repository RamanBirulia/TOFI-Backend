/**
 * Created by wanfranck on 13.12.16.
 */
var request = require('request');

let count = 0;
let delay = ((+process.argv[2] + 2) * 100 + 50) * 24;

process.on('SIGHUP', (err, res) => {
    console.log('Edward #%d Got SIGHUP', +process.argv[2]);
    delay += 75;
});

class EdwardBot{
    constructor(login, password){
        this.login = login;
        this.password = password;
    }

    onStart(){
        this.authentificate(() => {
            console.log(this.token);
            let controlMarket = () => {

                let date = new Date();
                date.setMilliseconds(date.getMilliseconds() - delay);
                this.getDeals(date, (deals) => {
                    console.log(deals);
                });
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

    getDeals(date, cb){
        request({
            method:'GET',
            url: 'http://localhost:3000/api/deals',
            form:{
                date: date
            },
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