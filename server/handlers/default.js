module.exports = (rq, rp) => {
  return rp.view('default', {
    version: rq.server.app.version
  });
};