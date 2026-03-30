import server from "./server";

const port = process.env.PORT;

server.listen(port, () => {
  console.log("REST API funcionando en el puerto: ", port);
});
