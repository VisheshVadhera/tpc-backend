/**
 * Created by vishesh on 15/2/17.
 */

var rp = require('request-promise');
var config = require('config');
var Promise = require('bluebird');
var jwt = Promise.promisifyAll(require('jsonwebtoken'));
var crypto = require('crypto');

var User = require('./user.model');
var errorHandler = require('../../helpers/errorHandler');


exports.emailLogin = function (req, res) {

    var authorizationCode = req.body.authorizationCode;
    var accessTokenParamVal = 'AA|'
        + config.get('keys.accountKit.appId')
        + '|'
        + config.get('keys.accountKit.appSecret');

    var options = {
        uri: 'https://graph.accountkit.com/v1.1/access_token',
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
                res.status(500);
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
                uri: 'https://graph.accountkit.com/v1.1/me',
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
                    }else{
                        res.status(500);
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