exports.up = function(knex) {
  return knex.schema.createTable('achievements', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description').notNullable();
    table.string('icon').nullable();
    table.enum('type', ['task_completion', 'streak', 'level_up', 'special']).notNullable();
    table.integer('requirement_value').notNullable(); // e.g., 10 tasks, 7 day streak
    table.integer('experience_reward').defaultTo(0);
    table.boolean('is_hidden').defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('achievements');
}; 