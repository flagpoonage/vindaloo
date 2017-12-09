const db = require('../db-postgres');
const sessions = require('../sessions');
const bcrypt = require('bcrypt');

const authenticate = async (request, out) => {
  let user = null;

  console.log('Current user session', request.session);

  try {
    let response = await db.pool.query(
      db.squel.select()
        .from('users')
        .field('id')
        .field('password')
        .field('username')
        .field('first_name')
        .field('last_name')
        .field('email')
        .where(
          db.squel.expr()
            .and('username = ?', request.payload.username)
            .or('email = ?', request.payload.username)
        )
        .toString()
    );

    user = response.rows[0];
  }
  catch (exception) {
    let exm = 'Unable to fetch user from database';
    console.error(exm, exception);
    
    return out.response({
      message: exm,
      exception: exception.detail || exception.message
    }).code(500);
  }

  let message_401 = 'Invalid username or password';

  if (!user) {
    // Timing attack prevention, always need a comparison. Don't know
    // how good of an idea this actually is, I should probably find out...
    await bcrypt.compare(request.payload.password, 'abcdef');

    return out.response({
      message: message_401
    }).code(401);
  }
  else {
    let result = await bcrypt.compare(request.payload.password, user.password);

    if (!result) {
      return out.response({
        message: message_401
      }).code(401);
    }
  }

  delete user.password;

  try {
    let token = await sessions.create(user);
    return out.response(user).code(200).state('session', token);
  }
  catch (exception) {
    let exm = 'Unable to create user session';
    console.error(exm, exception);
    
    return out.response({
      message: exm,
      exception: exception.detail || exception.message
    }).code(500);
  }
};

module.exports = {
  authenticate
};
