

var express = require('express');
var controller = require('./user.controller.js');

var router = express.Router();

router.post('/users/emailLogin', controller.emailLogin);
routes.put('/users/:id', controller.updateUser);

module.exports = router;