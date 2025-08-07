/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Clean up migration state by removing records for files that don't exist
  const fs = require('fs');
  const path = require('path');
  
  return knex('knex_migrations').select('name').then((existingMigrations) => {
    const migrationDir = path.join(__dirname);
    const existingFiles = fs.readdirSync(migrationDir).filter(file => file.endsWith('.js'));
    
    const invalidMigrations = existingMigrations.filter(migration => 
      !existingFiles.includes(migration.name)
    );
    
    if (invalidMigrations.length > 0) {
      console.log('Removing invalid migration records:', invalidMigrations.map(m => m.name));
      const invalidNames = invalidMigrations.map(m => m.name);
      return knex('knex_migrations').whereIn('name', invalidNames).del();
    }
    
    console.log('No invalid migration records found');
    return Promise.resolve();
  }).catch((error) => {
    console.log('Migration cleanup failed:', error.message);
    // Continue anyway - this is just cleanup
    return Promise.resolve();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return Promise.resolve();
};
