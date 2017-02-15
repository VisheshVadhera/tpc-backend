var config = require('config');
var connection = config.get('db.connection');

module.exports = {

    client: config.get('db.client'),
    connection: {
        host: connection.host,
        user: connection.user,
        password: connection.password,
        database: connection.database,
        charset: connection.charset
    }
};