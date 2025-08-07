exports.up = function(knex) {
  return knex.schema.createTable('user_achievements', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('achievement_id').unsigned().references('id').inTable('achievements').onDelete('CASCADE');
    table.datetime('earned_at').notNullable().defaultTo(knex.fn.now());
    table.boolean('is_read').defaultTo(false);
    
    // Ensure a user can only earn an achievement once
    table.unique(['user_id', 'achievement_id']);
    
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_achievements');
}; 