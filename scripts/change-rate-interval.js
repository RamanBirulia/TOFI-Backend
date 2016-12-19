/**
 * Created by wanfranck on 18.12.16.
 */
let request = require('request');

if (process.argv[2] == 'u'){
    request({
        method:'GET',
        url: 'http://localhost:3000/api/variables/rate-interval/speedup'
    }, (err, res) => {
        if (err) throw err;
        let response = JSON.parse(res.body);
        console.log(response);
    });
} else if (process.argv[2] == 'd'){
    request({
        method:'GET',
        url: 'http://localhost:3000/api/variables/rate-interval/slowdown'
    }, (err, res) => {
        if (err) throw err;
        let response = JSON.parse(res.body);
        console.log(response);
    });
}
