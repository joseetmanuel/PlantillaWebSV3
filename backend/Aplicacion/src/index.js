var http = require('http'),
    conf = require('../conf'),
    expressServer = require('./server/expressServer')

var Index = function (config) {
    config = config || {}


    console.log('Inicia conexión');

    var app = new expressServer(conf);
    this.server = http.createServer(app.expressServer);
}

Index.prototype.run = function () {
    this.server.listen(conf.port);
}

if (module.parent) {
    module.exports = Index;
} else {
    var index = new Index();
    index.run();
}