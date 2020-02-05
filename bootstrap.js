var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    var numCPUs = require('os').cpus().length;
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    Object.keys(cluster.workers).forEach(function (id) {
       // console.log(cluster.workers[id].process.pid);
    });

    cluster.on('exit', function (worker, code, signal) {
        cluster.fork();
    });
} else {


    //change this line to Your Node.js app entry point.
    require("./server/www.js");
}