/**
 * Created by wanfranck on 08.12.16.
 */
let spawn = require('child_process').spawn;
let fs = require('fs');


console.log('Spawning trading bots');

spawn('node', ['bots/frank-bot.js', 42], {
    stdio: [
        0,
        fs.openSync('logs/frank-bot-' + 42 + '-log.out', 'w'),
        fs.openSync('logs/frank-bot-' + 42 + '-log.out', 'w')
    ]
});
spawn('node', ['bots/edward-bot.js', 73], {
    stdio: [
        0,
        fs.openSync('logs/edward-bot-' + 73 + '-log.out', 'w'),
        fs.openSync('logs/edward-bot-' + 73 + '-log.out', 'w')
    ]});

console.log('How to send something to mongo from bots');