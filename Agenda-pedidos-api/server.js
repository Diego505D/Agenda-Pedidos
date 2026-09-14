const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);

const PORT = 3002;

server.listen(PORT, () => {
  console.log(`API de pedidos funcionando en http://localhost:${PORT}`);
});