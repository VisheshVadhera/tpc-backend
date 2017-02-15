/**
 * Created by vishesh on 15/2/17.
 */

var rp = require('request-promise');
var config = require('config');

var User = require('./user.model');


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
    }

    rp(options)
        .then(function (accountKitResponse) {

            if (!accountKitResponse.access_token) {
                //Error
            } else if (!accountKitResponse.error) {
                return accountKitResponse.access_token;
            }

        })
        .then(function (accessToken) {

            var hash = crypto.createHmac('sha256', config.get('keys.accountkit.appSecret'))
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
                    }

                })
        })
        .then(function (email) {

            return User
                .forge({
                    firstName: ' ',
                    lastName: ' ',
                    email: email
                })
                .save();
        })
        .catch(function (err) {

        });
}