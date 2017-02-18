

module.exports = {

    ServerError: function (message) {
        Error._captureStackTrace(this, this.constructor);
        this.message = message;
    }
}


require('util').inherits(module.exports, Error);
