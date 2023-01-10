// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'pg',
    version: '14.4',
    connection: {
      host : '127.0.0.1',
      port : 5435,
      user : 'admin',
      password : 'password',
      database : 'robotland'
    }
  }
};
