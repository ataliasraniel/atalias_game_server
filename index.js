// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });
const path = require("path");
fastify.register(require("@fastify/websocket"));
const fastifyStatic = require("@fastify/static");
const { connect } = require("http2");

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "web"),
});

fastify.get("/", function (req, reply) {
  reply.sendFile("index.html");
});
// Declare a route
var teamsScore = [];
fastify.register(async function (fastify) {
  fastify.get(
    "/score",
    { websocket: true },
    (connection /* SocketStream */, req /* FastifyRequest */) => {
      connection.socket.send(JSON.stringify(teamsScore));
      console.log(teamsScore);
      connection.socket.on("message", (message) => {
        let team = JSON.parse(message);
        console.log(team);
        //check if teamsScore contains team, if not add it
        const containsTeam = teamsScore.some(
          (scoreTeam) => scoreTeam.team === team.team
        );
        console.log(containsTeam);
        if (!containsTeam) {
          teamsScore.push({ team: team.team, score: 0 });
        }
        //add score to team
        teamsScore.forEach((element) => {
          if (element.team == team.team) {
            element.score += team.score;
          }
        });

        fastify.websocketServer.clients.forEach((client) => {
          client.send(JSON.stringify(teamsScore));
        });
      });
    }
  );
});

fastify.register(async function (fastify) {
  fastify.get("/teams", { websocket: true }, (connection, req) => {
    //send teams when client connects
    connection.socket.send(JSON.stringify(teamsScore));
  });
});

// Run the server!
fastify.listen(
  {
    port: 8080,
    //host into my network
    host: "192.168.18.228",
  },
  (err) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  }
);

// let team = JSON.parse(message);
// teamsScore.forEach((element) => {
//   //check if theres a team, if not add it
//   const containsTeam = teamsScore.some(
//     (team) => team.team === element.team
//   );
//   if (!containsTeam) {
//     teamsScore.push({ team: element.team, score: 0 });
//   }
//   // if (element.team == team.team) {
//   //   console.log("AAAAAAAAAAAA");
//   // }
// });
