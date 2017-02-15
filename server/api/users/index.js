

var express = require('express');
var controller = require('./users.controller');

var router = express.Router();

router.post('/users/emailLogin', controller.emailLogin);

module.exports = router;