
exports.up = function(knex, Promise) {
  return knex.schema.createTable('usuarios', (t) => {
        t.increments('id').primary();
        t.string('name').notNullable();
        t.string('email').notNullable();
        t.string('password').notNullable();
        t.string('salt').notNullable();
        t.string('encryptedPassword').notNullable();    
        t.timestamps(false, true);
  })
};

exports.down = function(knex, Promise) {
//Do not forget to add the "undo" function
};
