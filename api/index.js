const fastify = require("fastify");
const cors = require("@fastify/cors");
const mongoist = require("mongoist");

const server = fastify({ logger: true });
server.register(cors);

function start() {
  server
    .listen(8070)
    .then(function () {
      console.log("Server is running");
    })
    .catch(function (err) {
      console.log("Server is not running", err);
    });
}
start();
console.log(process.env.MONGO_URL);
const db = mongoist(process.env.MONGO_URL);
db.runCommand({ ping: 1 });
db.on("connect", () => {
  console.log("Database connected");
});
db.on("error", (err) => {
  console.log("Database not connected", err);
});

server.get("/", (request, reply) => {
  reply.send("Welcome on Alain Llorca's concerts API !");
});

server.post("/concerts", (request, reply) => {
  const concert = request.body;
  concert.date = new Date(concert.date);
  db.concerts
    .insert(concert)
    .then(() => {
      reply.code(201).send();
    })
    .catch((error) => {
      console.log(error);
      reply.code(500).send();
    });
});

server.get("/concerts", (request, reply) => {
  const limitDate = new Date();
  limitDate.setUTCHours(0, 0, 0, 0);
  db.concerts
    .find({ date: { $gte: limitDate } })
    .then((res) => {
      reply.send(res);
    })
    .catch(() => {
      reply.code(500).send();
    });
});

server.put("/concerts/:id", (request, reply) => {
  const concertId = request.params.id;
  const concert = request.body;
  db.concerts
    .update(
      { _id: mongoist.ObjectId(concertId) },
      {
        $set: {
          date: new Date(concert.date),
          city: concert.city,
          depNum: concert.depNum,
          place: concert.place,
          ticketsLink: concert.ticketsLink,
        },
      }
    )
    .then(() => {
      reply.code(204).send();
    })
    .catch((error) => {
      console.log(error);
      reply.code(500).send();
    });
});

server.delete("/concerts/:id", (request, reply) => {
  const concertId = request.params.id;
  db.concerts
    .remove({ _id: mongoist.ObjectId(concertId) })
    .then(() => {
      reply.code(204).send();
    })
    .catch((error) => {
      console.log(error);
      reply.code(500).send();
    });
});
