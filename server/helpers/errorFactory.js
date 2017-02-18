
var customError = require('./customError');

module.exports = {

    createServerError: function (message) {
        return new customError.ServerError(message);
    }
}
