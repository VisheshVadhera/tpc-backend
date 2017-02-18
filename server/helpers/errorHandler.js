var customError = require('./customError');

module.exports = function (res, err) {

    var statusCode;

    if (err instanceof customError.ServerError) {
        statusCode = 500;
    }

    res.status(statusCode).json(err);
}