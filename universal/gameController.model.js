const { Game, Programmer } = require('./game.model.js');
const _ = require('lodash');
const { types, destroy } = require('mobx-state-tree');
const { model, string, optional, array, map, boolean, number } = types;

const GameController = model('GameController', {
  game: Game,
})
  .volatile(self => ({
    io: null,
    programmerSocket: {},
    countdownUpdateInterval: null,
  }))
  .actions(self => ({
    addProgrammer(programmer, socket) {
      self.game.addProgrammer(programmer);
      self.programmerSocket[programmer.id] = socket;
    },
    removeProgrammerById(id) {
      destroy(self.game.getProgrammerById(id));
      if (self.game.programmers.length === 0) {
        self.stopTurnCycle();
        self.game.setStarted(false);
      }
    },
    setIo(io) {
      self.io = io;
    },
    startTurnCycle() {
      self.game.setStarted(true);
      self.countdownUpdateInterval = setInterval(() => {
        self.game.setTurnCountdown(self.game.turnCountdown - 1);
        if (self.game.turnCountdown < 0) {
          self.nextProgrammer();
        }
      }, 1000);
    },
    stopTurnCycle() {
      clearInterval(self.countdownUpdateInterval);
    },
    nextProgrammer() {
      let nextIndex = self.game.currentProgrammerIndex + 1;
      if (nextIndex >= self.game.programmers.length) {
        nextIndex = 0;
      }
      self.game.setCurrentProgrammerIndex(nextIndex);
      self.game.resetTurnCountdown();
    },
    setInput(input) {
      self.game.setInput(input);
      self.nextProgrammer();
      self.game.resetTurnCountdown();
    },
  }))
  .views(self => ({
    get currentProgrammerSocket() {
      return self.programmerSocket[self.game.currentProgrammer.id];
    },
  }));

module.exports = GameController;
