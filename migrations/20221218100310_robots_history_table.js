/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("robots_history", (table) => {
    table.uuid("id").primary()
    table.uuid("robotId").unsigned().references("id").inTable("robots")
    table.text("event").notNullable()
    table.jsonb("metadata").notNullable()
    table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {}
