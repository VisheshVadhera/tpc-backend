/**
 * Created by vishesh on 16/2/17.
 */

var bookshelf = require('../../model');

var timestampsName = ['createdAt', 'updatedAt'];

var User = bookshelf.Model.extend({
    tableName: 'user',
    hasTimeStamps: timestampsName,
    hidden: timestampsName
});

module.exports = User;