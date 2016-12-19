/**
 * Created by wanfranck on 08.12.16.
 */
let spawn = require('child_process').spawn;

console.log('Spawning trading bots');

let frankChild = spawn('node', ['bots/frank-bot.js', 42]);
frankChild.on('exit', () => console.log('Frank exited ' + frankChild.pid));
frankChild.stdout.on('data', (data) => console.log(frankChild.pid + '-stdout: ' + data));
frankChild.stderr.on('data', (data) => console.log(frankChild.pid + '-stderr: ' + data));


let edwardChild = spawn('node', ['bots/edward-bot.js', 73]);
edwardChild.on('exit', () => console.log('Edward exited ' + edwardChild.pid));
edwardChild.stdout.on('data', (data) => console.log(edwardChild.pid + '-stdout: ' + data));
edwardChild.stderr.on('data', (data) => console.log(edwardChild.pid + '-stderr: ' + data));

console.log('How to send something to mongo from bots');