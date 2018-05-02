const _ = require('lodash');
const _eval = require('eval');

const puzzles = [
  {
    id: _.uniqueId(),
    description:
      'Create a function that accepts and array, and returns the average of all values',
    testCases: [
      {
        input: [1, 2, 3, 4, 5, 6],
        expected: 3.5,
      },
      {
        input: [1.2, 2.5, 4.5, 9.8, 10.5, 15.3, -9, 34],
        expected: 8.6,
      },
    ],
  },
  {
    id: _.uniqueId(),
    description:
      'Create a function that accepts a string and removes all of the vowels',
    testCases: [
      {
        input: 'The rain in spain falls mainly on the plain',
        expected: 'Th rn n spn flls mnly n th pln',
      },
      {
        input: 'The quick brown fox jumps over the lazy dog',
        expected: 'Th qck brwn fx jmps vr th lzy dg',
      },
    ],
  },
];

function checker(puzzleId, input) {
  const puzzle = _.find(puzzles, { id: puzzleId });

  let func;
  try {
    func = _eval(`module.exports = ${input}`);
  } catch (e) {
    return {
      error: true,
      message: e.message,
    };
  }

  const testCaseResults = _.map(puzzle.testCases, testCase => {
    let result;
    try {
      result = func(testCase.input);
    } catch (e) {
      return {
        error: true,
        message: e.message,
      };
    }

    const passing = result === testCase.expected;
    return {
      input: testCase.input,
      got: result,
      passing,
    };
  });

  return testCaseResults;
}

module.exports = {
  puzzles,
  checker,
};
