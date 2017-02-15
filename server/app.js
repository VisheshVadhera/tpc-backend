
var express = require('express')

var app = express();
var server = require('http').createServer(app);
require('./express')(app);
require('./routes')(app);


app.listen(3000, function () {
  console.log('Tpc backend listening on port 3000!')
})

exports = module.exports = app;

