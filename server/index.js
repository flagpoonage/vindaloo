const Hapi = require('hapi');
const config = require('../config.json');
const pkg = require('../package.json');
const owting = require('owting');
const router = require('./router');
const mongo = require('./db-mongo');

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
  