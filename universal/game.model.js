const { types } = require('mobx-state-tree');
const { model, string, optional, array, map, boolean, number } = types;

const turnSeconds = 5;

const Programmer = model('Programmer', {
  name: string,
  id: string,
});

const Game = model('Game', {
  programmers: optional(array(Programmer), []),
  input: optional(string, ''),
  currentProgrammerIndex: optional(number, 0),
  turnCountdown: optional(number, turnSeconds),
})
  .actions(self => ({
    addProgrammer(programmer) {
      self.programmers.push(programmer);
    },
    setCurrentProgrammerIndex(currentProgrammerIndex) {
      self.currentProgrammerIndex = currentProgrammerIndex;
    },
    setTurnCountdown(turnCountdown) {
      self.turnCountdown = turnCountdown;
    },
    setInput(input) {
      self.input = input;
    },
    resetTurnCountdown() {
      self.turnCountdown = turnSeconds;
    },
  }))
  .views(self => ({
    get currentProgrammer() {
      return self.programmers[self.currentProgrammerIndex];
    },
    getProgrammerById(id) {
      return _.find(self.programmers, { id });
    },
  }));

module.exports = { Game, Programmer };
