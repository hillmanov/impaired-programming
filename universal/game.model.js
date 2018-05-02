const _ = require('lodash');
const { types } = require('mobx-state-tree');
const { model, string, optional, array, map, boolean, number, frozen } = types;

const turnSeconds = 5;

const Programmer = model('Programmer', {
  name: string,
  id: string,
  isLead: optional(boolean, false),
}).actions(self => ({
  setIsLead(isLead) {
    self.isLead = isLead;
  },
}));

const Game = model('Game', {
  programmers: optional(array(Programmer), []),
  started: optional(boolean, false),
  input: optional(string, ''),
  currentProgrammerIndex: optional(number, 0),
  turnCountdown: optional(number, turnSeconds),
  puzzle: frozen,
  testCaseResults: frozen,
})
  .actions(self => ({
    addProgrammer(programmer) {
      if (self.programmers.length === 0) {
        programmer.setIsLead(true);
      }
      self.programmers.push(programmer);
    },
    reset() {
      self.input = '';
      self.testCaseResults = null;
    },
    setPuzzle(puzzle) {
      self.puzzle = puzzle;
    },
    setTestCaseResults(testCaseResults) {
      self.testCaseResults = testCaseResults;
    },
    setPassing(passing) {
      self.passing = passing;
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
    setStarted(started) {
      self.started = started;
    },
  }))
  .views(self => ({
    get currentProgrammer() {
      return self.programmers[self.currentProgrammerIndex];
    },
    get leadProgrammer() {
      const lead = _.find(self.programmers, { isLead: true });
      if (!lead && self.programmers.length) {
        self.programmers[0].isLead = true;
      }
      return lead;
    },
    getProgrammerById(id) {
      return _.find(self.programmers, { id });
    },
    get allPassing() {
      if (self.testCaseResult && self.testCaseResults.error) {
        return false;
      }
      return _.every(_.map(self.testCaseResults, 'passing'));
    },
  }));

module.exports = { Game, Programmer };
