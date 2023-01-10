/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const {v4: uuid} = require('uuid');

  // Deletes ALL existing entries
  return knex('robots').del()
    .then(function () {
      // Inserts seed entries
      return knex('robots').insert([
        {id: uuid(), currentArea: 'Park', orientation: 'N', status: 'idle', battery: 100},
        {id: uuid(), currentArea: 'Street 1', orientation: 'E', status: 'cleaning', battery: 75},
        {id: uuid(), currentArea: 'Garden 1', orientation: 'S', status: 'needs-maintenance', battery: 50},
        {id: uuid(), currentArea: 'Square 2', orientation: 'W', status: 'charging', battery: 25},
        {id: uuid(), currentArea: 'Park', orientation: 'N', status: 'idle', battery: 100},
        {id: uuid(), currentArea: 'Street 1', orientation: 'E', status: 'cleaning', battery: 75},
        {id: uuid(), currentArea: 'Garden 1', orientation: 'S', status: 'needs-maintenance', battery: 50},
        {id: uuid(), currentArea: 'Square 2', orientation: 'W', status: 'charging', battery: 25},
        {id: uuid(), currentArea: 'Park', orientation: 'N', status: 'idle', battery: 100},
        {id: uuid(), currentArea: 'Street 1', orientation: 'E', status: 'cleaning', battery: 75},
      ]);
    });
};
