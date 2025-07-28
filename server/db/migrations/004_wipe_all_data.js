exports.up = function(knex) {
  return knex('tasks').del()
    .then(() => knex('users').del())
    .then(() => knex('default_tasks').del())
    .then(() => {
      console.log('🗑️ All data wiped successfully');
    });
};

exports.down = function(knex) {
  // This migration only deletes data, so down migration does nothing
  return Promise.resolve();
}; 