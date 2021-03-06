exports.up = function (knex, Promise) {
    return knex.schema.createTable('user', function (table) {
        table.increments('id').primary();
        table.string('firstName');
        table.string('lastName');
        table.string('accessToken');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('user');
};
