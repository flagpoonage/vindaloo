const db = require('./db-mongo').getInstance();
// const ObjectId = require('mongodb').ObjectId;

// console.log('oid', ObjectId);

const create = async (content) => {
  let result = await db.collection('sessions').insert(content);
  let token = result.insertedIds[0].toHexString();

  return token;
};

const read = async (token) => {

};

const update = async (token, content) => {

};

const remove = async (token) => {

};

module.exports = {
  create,
  read,
  update,
  remove
};