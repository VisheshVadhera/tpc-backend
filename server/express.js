var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');

module.exports = function(app) {

  var env = app.get('env');
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(bodyParser.json());

  if ('production' === env) {
    app.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    // app.use(require('connect-livereload')());
    app.use(morgan('dev'));
    // app.use(errorHandler()); // Error handler - has to be last
  }
};
