/**
 * Created by wanfranck on 22.11.16.
 */
var fs = require('fs');
var parseSync = require('csv-parse/lib/sync');
var http = require('http');
var request = require('request');
let spawn = require('child_process').spawn;

let formatString = (path, search) => {
    let str = fs.readFileSync(path, 'utf-8');
    let re = new RegExp(search, 'g');
    fs.writeFileSync(path, str.replace(re, ','));
};

let testCSVLoading = () => {
    let rates = parseSync(fs.readFileSync('./initials/rates', 'utf-8'), {
        columns: true, encoding: 'UTF-8', delimiter: ','
    });

    console.log(rates);
};

let testRequestToLocalhost = () => {
    request({
        method:'GET',
        url: 'http://localhost:3000/'
    }, (err, res) => {
        if (err) throw err;
        console.log(res.body);
    });

    request({
        method:'POST',
        url: 'http://localhost:3000/api/authenticate',
        form: {
            login: 'Petr.Mitrichev',
            password: 'password'
        }
    }, (err, res) => {
        if (err) throw err;
        console.log(res.body);
    })
};

let swapLines = () => {
    let lines = fs.readFileSync('./initials/rates', 'utf-8').split('\n');
    for (let i = 1; i < lines.length / 2; i++){
        lines[i] = [lines[lines.length - i], lines[lines.length - i] = lines[i]][0];
    }
    fs.writeFileSync('./initials/rates', lines.join('\n'), 'utf-8');
};

//testRequestToLocalhost();
//testRequestToLocalhost();
//swapLines();