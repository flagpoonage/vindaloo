const config = require('../config.json');
const squel = require('squel');
const { Pool } = require('pg');

module.exports = {
  pool: new Pool(config.postgres),
  squel: squel.useFlavour('postgres')
};