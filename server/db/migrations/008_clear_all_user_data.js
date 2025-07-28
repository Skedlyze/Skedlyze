exports.up = function(knex) {
  return Promise.all([
    knex('tasks').del(),
    knex('user_achievements').del(),
    knex('achievements').del()
  ]);
};

exports.down = function(knex) {
  // This migration is irreversible as we don't store the original data
  return Promise.resolve();
}; 