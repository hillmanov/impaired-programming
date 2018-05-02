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
const { puzzles, checker } = require('./puzzles');

const game = Game.create();
const gameController = GameController.create({ game });
let puzzleIndex = 0;

game.setPuzzle(puzzles[puzzleIndex]);

let socketServer;

onPatch(game, patch => {
  socketServer.sockets.emit('game:patch', patch);
});

function run(server) {
  socketServer = socketIo(server);

  socketServer.sockets.on('connection', socket => {
    socket.emit('game:snapshot', getSnapshot(game));

    socket.on('game:start', () => {
      if (gameController.game.getProgrammerById(socket.id).isLead) {
        gameController.startTurnCycle();
      }
    });

    socket.on('game:updateInputValue', ({ value }) => {
      if (gameController.game.currentProgrammer.id !== socket.id) {
        return;
      }
      gameController.game.setInput(value);
      gameController.nextProgrammer();

      let testCaseResults = checker(gameController.game.puzzle.id, value);
      console.log('testCaseResults', testCaseResults);
      gameController.game.setTestCaseResults(testCaseResults);
      if (gameController.game.allPassing) {
        gameController.stopTurnCycle();
      }
    });

    socket.on('game:next', () => {
      if (gameController.game.leadProgrammer.id !== socket.id) {
        return;
      }
      puzzleIndex += 1;
      if (puzzleIndex >= puzzles.length) {
        puzzleIndex = 0;
      }

      gameController.game.reset();
      gameController.game.setPuzzle(puzzles[puzzleIndex]);
      gameController.startTurnCycle();
    });

    socket.on('register', ({ name }) => {
      gameController.addProgrammer(Programmer.create({ name, id: socket.id }));
    });

    socket.on('disconnect', () => {
      if (game.getProgrammerById(socket.id)) {
        gameController.removeProgrammerById(socket.id);
      }
    });
  });
}

module.exports = {
  run,
};
