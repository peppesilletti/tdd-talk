const knex = require('knex')({
    client: 'pg',
    version: '14.4',
    connection: {
      host : '127.0.0.1',
      port : 5435,
      user : 'admin',
      password : 'password',
      database : 'robotland'
    }
})

module.exports = knex