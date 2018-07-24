'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_API: '"/api"',
  LOGIN_URL: '"https://www2.btclass.net/admin/sealtalk"',
  APP_KEY: '"sfci50a7s4woi"'
})
