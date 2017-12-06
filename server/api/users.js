const db = require('../db-postgres');
const bcrypt = require('bcrypt');

const create = async (request, out) => {
  let model = Object.assign({}, request.payload);

  try {
    model.password_hash = await bcrypt.hash(request.payload.password, 10);
  }
  catch (exception) {
    let exm = 'Unable to hash password';
    console.error(exm, exception);
    
    return out.response({
      message: exm,
      exception: exception.detail || exception.message
    }).code(500);
  }

  let response = null;

  try {
    response = await db.pool.query(
      db.squel.insert()
        .into('users')
        .set('username', model.username)
        .set('password', model.password_hash)
        .set('first_name', model.first_name)
        .set('last_name', model.last_name)
        .set('email', model.email)
        .returning('id')
        .toString()
    );
  }
  catch (exception) {
    let exm = 'Unable to create user';
    console.error(exm, exception);
    
    return out.response({
      message: exm,
      exception: exception.detail || exception.message
    }).code(exception.detail ? 400 : 500);
  }
  
  model.id = response.rows[0].id;
  
  delete model.password;
  delete model.password_hash;

  console.log('User created', model);

  return out.response(model);

};

const list = async (request, out) => {
  let response = null;

  try {
    response = await db.pool.query(
      db.squel.select()
        .from('users')
        .field('id')
        .field('username')
        .field('first_name')
        .field('last_name')
        .field('email')
        .toString()
    );
  }
  catch (exception) {
    let exm = 'Unable to list users';
    console.error(exm, exception);
    
    return out.response({
      message: exm,
      exception: exception.detail || exception.message
    }).code(exception.detail ? 400 : 500);
  }
  
  return out.response(response.rows);
};

const get = async (request, out) => {
  let response = null;

  try {
    response = await db.pool.query(
      db.squel.select()
        .from('users')
        .field('id')
        .field('username')
        .field('first_name')
        .field('last_name')
        .field('email')
        .where('id = ?', request.params.id)
        .toString()
    );
  }
  catch (exception) {
    let exm = `Unable to get user [${request.params.id}]`;
    console.error(exm, exception);
    
    return out.response({
      message: exm,
      exception: exception.detail || exception.message
    }).code(exception.detail ? 400 : 500);
  }
  
  return response.rows[0]
    ? out.response(response.rows[0])
    : out.response({
      message: `Unable to find user [${request.params.id}]`
    }).code(404);
};

const update = async (request, out) => {
  let model = Object.assign({}, request.payload);

  if (model.password) {
    try {
      model.password_hash = await bcrypt.hash(request.payload.password, 10);
    }
    catch (exception) {
      let exm = 'Unable to hash password';
      console.error(exm, exception);
      
      return out.response({
        message: exm,
        exception: exception.detail || exception.message
      }).code(500);
    }
  }

  try {
    let update_query = db.squel.update().table('users');

    model.first_name && update_query.set('first_name', model.first_name);
    model.last_name && update_query.set('last_name', model.last_name);
    model.email && update_query.set('email', model.email);

    let response = await db.pool.query(
      update_query
        .where('id = ?', request.params.id || model.id)
        .returning('*')
        .toString());

    model = Object.assign(model, response.rows[0]);
  }
  catch (exception) {
    let exm = `Unable to get user [${request.params.id}]`;
    console.error(exm, exception);
    
    return out.response({
      message: exm,
      exception: exception.detail || exception.message
    }).code(exception.detail ? 400 : 500);
  }
  
  delete model.password;

  return out.response(model);
};

const remove = async (request, out) => {
  let response = null;

  try {
    response = await db.pool.query(
      db.squel.delete()
        .from('users')
        .where('id = ?', request.params.id)
        .toString()
    );
  }
  catch (exception) {
    let exm = 'Unable to delete user';
    console.error(exm, exception);
    
    return out.response({
      message: exm,
      exception: exception.detail || exception.message
    }).code(exception.detail ? 400 : 500);
  }

  if (response.rowCount === 1) {
    return out.response().code(204);
  }
  else {
    return out.response({
      message: `Unable to find user [${request.params.id}]`
    }).code(404);
  }
};

module.exports = {
  create,
  list,
  get,
  update,
  remove
};