
var config = require('config');

var knex = require('knex') ({
  client: config.get('db.client'),
  connection: config.get('db.connection')
});

var bookshelf = require('bookshelf')(knex);

bookshelf.plugin('visibility');

module.exports = bookshelf;
