const Hapi = require('hapi');
const config = require('../config.json');
const pkg = require('../package.json');
const owting = require('owting');
const router = require('./router');
const mongo = require('./db-mongo');
const Crypto = require('crypto-js');
const sessions = require('./sessions');

owting.on();

const port = 9999;

const server = new Hapi.Server({ port: port });
server.app.version = `v${pkg.version}`;

(async () => {

  try {
    await server.register([
      require('inert'),
      require('vision')
    ]);    
  }
  catch (ex) {
    return console.error(ex);
  }
  
  server.views({
    engines: {
      hbs: require('handlebars')
    },
    path: './views'
  });
  
  server.state('session', {
    ttl: null,
    path: '/',
    isSecure: false,
    isHttpOnly: true,
    encoding: 'none',
    clearInvalid: true, // remove invalid cookies
    strictHeader: true // don't allow violations of RFC 6265
  });

  try {
    await mongo.connect();
  }
  catch (exception) {
    return console.error('Unable to open connection to mongo', exception);
  }

  server.ext({
    type: 'onRequest',
    method: (request, out) => {
      console.log(`${request.method.toUpperCase()} -> ${request.path}`);

      return out.continue;
    }
  });

  server.ext({
    type: 'onPreAuth',
    method: async (request, out) => {
      if (!request.state['session']) {
        return out.continue;
      }

      const clearSession = (request) => {
        delete request.session_id;
        delete request.session;

        out.unstate('session');
      };
      
      try {
        let decrypted = Crypto.AES.decrypt(request.state['session'], config.sessions.password).toString(Crypto.enc.Utf8);
        let session_id = decrypted.split(' ')[0];

        request.session_id = session_id;
        request.session = await sessions.read(session_id);

        if (!request.session) {
          clearSession(request);
        }
      }
      catch (error) {

        clearSession(request);

        console.error(
          'Cookie decryption error',
          error);
      }

      return out.continue;
    }
  });

  server.ext({
    type: 'onPreResponse',
    method: (request, out) => {
      // Won't handle updated sessions correctly.
      let session_id = request.session_id || (
        request._states['session'] && 
        request._states['session'].value);

      if (!session_id) {
        return out.continue;
      }
      
      try {
        let outbound = `${session_id} ${new Date().getTime()}`;
        let encrypted = Crypto.AES.encrypt(outbound, config.sessions.password).toString();

        out.unstate(config.sessions.name)
        out.state(config.sessions.name, encrypted);
      }
      catch (error) {
        console.error(
          'Cookie encryption error',
          error);
      }

      return out.continue;
    }
  });

  try {
    await server.start();
  }
  catch (ex) {
    return console.error('Unable to start web server', ex);
  }

  let routes = [];

  try {
    routes = router.generateRoutes(require('./routes.json'));
  }
  catch (exception) {
    console.error('Unable to create router', exception);
    process.exit(1);
  }

  console.log('Routes', routes.map(route => `${route.method} ${route.path}`));

  routes.forEach(route => server.route(route));

  console.log(`[${server.app.version}] Server is running on [${port}]`, config);

})();
  