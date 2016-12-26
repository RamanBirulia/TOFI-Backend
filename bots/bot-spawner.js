/**
 * Created by wanfranck on 08.12.16.
 */
let spawn = require('child_process').spawn;
let fs = require('fs');


console.log('Spawning trading bots');

spawn('node', ['./bots/frank-bot.js', 42]);
spawn('node', ['./bots/edward-bot.js', 73]);
