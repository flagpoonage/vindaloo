module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: require('./handlers/default')
  },
  {
    method: 'GET',
    path: '/api/users',
    handler: require('./api/users').list
  },
  {
    method: 'GET',
    path: '/api/users/{id}',
    handler: require('./api/users').get
  },
  {
    method: 'PUT',
    path: '/api/users/{id}',
    handler: require('./api/users').update
  },
  {
    method: 'POST',
    path: '/api/users',
    handler: require('./api/users').create
  },
  {
    method: 'DELETE',
    path: '/api/users/{id}',
    handler: require('./api/users').remove
  }
];