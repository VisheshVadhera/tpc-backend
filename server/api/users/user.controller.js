/**
 * Created by vishesh on 15/2/17.
 */

var rp = require('request-promise');
var config = require('config');
var Promise = require('bluebird');
var jwt = Promise.promisifyAll(require('jsonwebtoken'));
var crypto = require('crypto');
var _ = require('lodash');


var User = require('./user.model');

var errorHandler = require('../../helpers/errorHandler');
var errorFactory = require('../../helpers/errorFactory');
var errorStrings = require("../../constants/errors.json");

exports.emailLogin = function (req, res) {

    var authorizationCode = req.body.authorizationCode;
    var accessTokenParamVal = 'AA|'
        + config.get('keys.accountKit.appId')
        + '|'
        + config.get('keys.accountKit.appSecret');

    var options = {
        uri: config.get('keys.accountKit.accessTokenBaseUrl'),
        qs: {
            grant_type: 'authorization_code',
            code: authorizationCode,
            access_token: accessTokenParamVal
        },
        json: true
    };

    rp(options)
        .then(function (accountKitResponse) {

            if (!accountKitResponse.access_token) {
                //Error
                errorHandler(res, errorFactory.createServerError(errorStrings.api.SERVER_ERROR));
                return null;
            } else if (!accountKitResponse.error) {
                return accountKitResponse.access_token;
            }
        })
        .then(function (accessToken) {

            var hash = crypto.createHmac('sha256', config.get('keys.accountKit.appSecret'))
                .update(accessToken)
                .digest('hex');

            var options = {
                uri: config.get('keys.accountKit.accessTokenValidationUBaseUrl'),
                qs: {
                    access_token: accessToken,
                    appsecret_proof: hash
                },
                json: true
            }

            return options;
        })
        .then(function (options) {

            return rp(options)
                .then(function (userDetailsResponse) {

                    if (!userDetailsResponse.error) {
                        return userDetailsResponse.email.address;
                    } else {
                        errorHandler(res, errorFactory.createServerError(errorStrings.api.SERVER_ERROR));
                        return null;
                    }
                })
        })
        .then(function (email) {
            return User
                .forge({
                    email: email
                })
                .fetch()
                .then(function (user) {

                    if (user) {
                        return generateJwt(user.get('id'))
                            .then(function (accessToken) {
                                return saveAccessToken(accessToken, user);
                            });
                    } else {

                        return User
                            .forge({
                                firstName: ' ',
                                lastName: ' ',
                                email: email
                            })
                            .save()
                            .then(function (user) {
                                return generateJwt(user.get('id'))
                                    .then(function (accessToken) {
                                        return saveAccessToken(accessToken, user);
                                    });
                            })
                    }
                })
        })
        .then(function (accessToken) {
            res.status(200).json({accessToken: accessToken});
            return null;
        })
        .catch(function (err) {
            return errorHandler(res, err);
        })
};

exports.updateUser = function (req, res) {

    var params = _.pick(req.body, ['firstName', 'lastName']);

    User
        .where({id: req.params.id})
        .fetch({require: true})
        .then(function (user) {
            return user
                .save(params);
        })
        .then(function (user) {
            res.status(200).json(user);
        })
        .catch(function (err) {
            return errorHandler(res, err);
        })


}

function saveAccessToken(accessToken, user) {
    return user.save({
        accessToken: accessToken
    })
        .then(function (user) {
            return accessToken;
        })
}


function generateJwt(userId) {
    return jwt.signAsync({
            userId: userId
        },
        config.get("keys.jwt.jwtSecret"),
        {
            expiresIn: config.get("keys.jwt.expiresIn")
        })
}