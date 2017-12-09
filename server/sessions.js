const mongo = require('./db-mongo');
const OWTJ = require('owtj');
const uuid = require('uuid/v4');

const db = () => mongo.getInstance();

const create = async (content) => {

  content.session_key = uuid();

  await db().collection('sessions').insert(content);

  return content.session_key;
};

const read = async (token) => {
  let result = db().collection('sessions').findOne({ session_key: token });
  return result;
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