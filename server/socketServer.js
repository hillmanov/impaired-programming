const _ = require('lodash');

const Promise = require('bluebird');
const socketIo = require('socket.io');
const {
  onPatch,
  applyPatch,
  getSnapshot,
  applySnapshot,
} = require('mobx-state-tree');

const GameController = require('../universal/gameController.model');
const { Game, Programmer } = require('../universal/game.model');

const game = Game.create();
const gameController = Game.create({ game });

let socketServer;

onPatch(gameController, patch => {
  console.log('patch', patch);
  socketServer.sockets.emit('game:patch', patch);
});

function run(server) {
  socketServer = socketIo(server);

  socketServer.sockets.on('connection', socket => {
    console.log('Got a connection!!!!');
    console.log('socket.id', socket.id);

    console.log('Sending out current game:', getSnapshot(game));

    socket.emit('game:snapshot', { game: getSnapshot(game) });

    socket.on('register', ({ name }) => {
      gameController.addProgrammer(Programmer.create({ name, id: socket.id }));
    });

    socket.on('disconnect', () => {
      console.log('Goodbye!');
    });
  });
}

module.exports = {
  run,
};
