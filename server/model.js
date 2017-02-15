var config = require('config');

var knex = require('knex') ({
  client: 'mysql',
  connection: config.get('database.mysql')
});

var bookshelf = require('bookshelf')(knex);

bookshelf.plugin('virtuals');
bookshelf.plugin('visibility');
bookshelf.plugin('pagination');

bookshelf.plugin(require('bookshelf-modelbase').pluggable);

module.exports = bookshelf;
