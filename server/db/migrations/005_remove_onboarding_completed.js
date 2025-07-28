exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    // Remove the onboarding_completed field since we're using task count instead
    table.dropColumn('onboarding_completed');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    // Add back the onboarding_completed field if needed
    table.boolean('onboarding_completed').defaultTo(false);
  });
}; 