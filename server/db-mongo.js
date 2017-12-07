const config = require('../config.json').mongo;
const MongoClient = require('mongodb').MongoClient;

let db = null;

module.exports = {
  getInstance: () => db,
  connect: async () => {
    if (db) {
      return db;
    }

    return new Promise((resolve, reject) => {
      MongoClient.connect(
        `mongodb://${config.host}:${config.port}/${config.database}`,
        (err, database) => {
          if (err) {
            return reject(err);
          }

          db = database;
          return resolve(db);
        });
    });
  }
};