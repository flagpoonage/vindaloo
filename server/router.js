
// Error thrown when a route is not valid.
class RouteError extends Error {
  constructor (message, route) {
    super(message);

    this.route = route;
  }
}

// Verifies that the request contains the authenticated flag.
const checkAuthentication = request => {
  if (request.session) {
    return true;
  }
};

// Parse the string representation of the route handler
const fetchRouteHandler = (base_handler_path, route) => {
  let slash_split = route.handler.split('/').filter(a => !!a);
  let dot_split = slash_split[slash_split.length - 1].split('.');

  let handler_path = base_handler_path + slash_split.slice(0, slash_split.length - 1).join('/') + '/' + dot_split[0];
  
  let true_handler = null;

  try {
    true_handler = require(handler_path);

    if (dot_split[1]) {
      true_handler = true_handler[dot_split[1]];
    }
  }
  catch (exception) {
    throw new RouteError(`The file at the handler path [${handler_path}] could not be found`, route);
  }

  return true_handler;
};

// Unwraps the route and produces a single Hapi-friendly route
const unwrapRoute = (base_handler_path, base_route_path, route) => {
  
  if (route.authenticate && typeof route.authenticate !== 'boolean') {
    throw new RouteError('The `authenticate` property must be a boolean', route);
  }

  if (route.authorize && !Array.isArray(route.authorize)) {
    throw new RouteError('The `authorize` property must be an array of authorization flags', route);
  }

  if (typeof route.handler !== 'string') {
    throw new RouteError('Route is missing a handler location', route);
  }

  let handler = fetchRouteHandler(base_handler_path, route);

  const checkAuthorizationTokens = routes => {
    routes.forEach(token => {
      if (typeof token !== 'string' && !Array.isArray(token)) {
        throw new RouteError('The `authorize` property may only contain authorization flags and nested arrays', route);
      }

      if (Array.isArray(token)) {
        checkAuthorizationTokens(token);
      }
    });
  };

  if (route.authorize) {
    checkAuthorizationTokens(route.authorize);
  }

  let route_path = base_route_path 
    ? base_route_path
    : '/';

  if (route.path) {
    route_path += `/${route.path}`;
  }

  return {
    method: route.method,
    path: route_path,
    handler: (request, out) => {
      if (route.authenticate && !checkAuthentication(request)) {
        return out.response({
          message: 'You must be authenticated to perform this action'
        }).code(401);
      }

      if (route.validate) {
        let validation_result = route.validate(request);

        if (validation_result.failed) {
          return out.response({
            message: 'Your request was not valid',
            errors: validation_result.errors
          });
        }
      }

      return handler(request, out);
    }
  };
};

let route_table = [];

const generateRouteSet = (name, base, routes, handlers) => {
  let true_routes = [];

  routes.forEach(route => {
    let base_route_path = base ? `${base}/${route.base}` : `/${route.base}`;

    if (route.set) {
      true_routes = true_routes.concat(generateRouteSet(`${name}/${route.set}`, base_route_path, route.routes, handlers));
    }
    else {
      true_routes.push(unwrapRoute(handlers, base, route));
    }
  });
  
  return true_routes;
};

const generateRoutes = routes => {
  return generateRouteSet('root', null, routes.map, routes.handlers);
};

module.exports = {
  route_table: route_table,
  generateRoutes: generateRoutes
};