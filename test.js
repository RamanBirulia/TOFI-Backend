/**
 * Created by wanfranck on 22.11.16.
 */
var fs = require('fs');
var parseSync = require('csv-parse/lib/sync');

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