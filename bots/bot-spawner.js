/**
 * Created by wanfranck on 08.12.16.
 */
var spawn = require('child_process').spawn;

console.log('Spawning trading bots');

/*
let children = [];
for (let i = 0; i < 4; i++){
    let child = spawn('node', ['frank-bot.js', i]);

    child.on('exit', () => {
        console.log('Child exited ' + i);
    });

    child.stdout.on('data', (data) => {
        console.log('stdout: ' + data);
    });

    child.stderr.on('data', (data) => {
        console.log('stderr: ' + data);
    });

    children.push(child.pid);
}

let slow = () => {
    setTimeout(() => {
        for (let i = 0; i < 4; i++){
            process.kill(children[i], 'SIGHUP');
        }
        slow();
    }, 4000);
};

slow();
*/

/*
let frankChild = spawn('node', ['frank-bot.js', 42]);
frankChild.on('exit', () => {
    console.log('Child exited ' + 42);
});

frankChild.stdout.on('data', (data) => {
    console.log('stdout: ' + data);
});

frankChild.stderr.on('data', (data) => {
    console.log('stderr: ' + data);
});
*/

let edwardChild = spawn('node', ['edward-bot.js', 42]);
edwardChild.on('exit', () => {
    console.log('Child exited ' + 42);
});

edwardChild.stdout.on('data', (data) => {
    console.log('stdout: ' + data);
});

edwardChild.stderr.on('data', (data) => {
    console.log('stderr: ' + data);
});