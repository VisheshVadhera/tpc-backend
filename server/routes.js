var config = require('config');

module.exports = function(app) {
    app.use(config.get('apiPrefix'), require('./api/users'));
};
