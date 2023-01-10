/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("robots", (table) => {
    table.uuid("id").primary()
    table.text("currentArea").notNullable()
    table.enu("orientation", ["N", "E", "S", "W"]).notNullable()
    table
      .enu("status", ["idle", "cleaning", "needs-maintenance", "charging"])
      .notNullable()
    table.integer("battery").notNullable()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {}
