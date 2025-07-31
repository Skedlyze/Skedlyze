exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    // Add goal selection field
    table.enum('selected_goal', ['productivity', 'health', 'focus', 'learning', 'social', 'creativity']).nullable();
    table.boolean('onboarding_completed').defaultTo(false);
  })
  .then(() => {
    // Create default tasks table
    return knex.schema.createTable('default_tasks', function(table) {
      table.increments('id').primary();
      table.enum('goal', ['productivity', 'health', 'focus', 'learning', 'social', 'creativity']).notNullable();
      table.string('title').notNullable();
      table.text('description').nullable();
      table.enum('category', ['work', 'personal', 'health', 'learning', 'social', 'other']).defaultTo('other');
      table.enum('priority', ['low', 'medium', 'high']).defaultTo('medium');
      table.integer('experience_reward').defaultTo(10);
      table.integer('estimated_minutes').defaultTo(15);
      table.boolean('is_daily').defaultTo(true);
      table.boolean('is_weekly').defaultTo(false);
      table.jsonb('tags').defaultTo('[]');
      table.integer('sort_order').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('default_tasks')
    .then(() => {
      return knex.schema.alterTable('users', function(table) {
        table.dropColumn('selected_goal');
        table.dropColumn('onboarding_completed');
      });
    });
}; 