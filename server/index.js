const Hapi = require('hapi');
const config = require('../config.json');
const pkg = require('../package.json');
const owting = require('owting');
const router = require('./router');

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

  try {
    await server.start();
  }
  catch (ex) {
    return console.error(ex);
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
  