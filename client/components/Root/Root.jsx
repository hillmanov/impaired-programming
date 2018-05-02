import React from 'react';
import _ from 'lodash';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { Button, Checkbox, Form, Segment } from 'semantic-ui-react';
import {
  applySnapshot,
  getSnapshot,
  onPatch,
  applyPatch,
} from 'mobx-state-tree';

require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');
require('codemirror/mode/javascript/javascript.js');

import { Controlled as CodeMirror } from 'react-codemirror2';

import io from 'socket.io-client';
const cx = require('classnames/bind').bind(require('./root.scss'));

import { Game, Programmer } from '../../../universal/game.model';

const game = Game.create();
const socket = io();

socket.on('connect', function() {});

socket.on('game:patch', patch => {
  applyPatch(game, patch);
});

socket.on('game:snapshot', snapshot => {
  applySnapshot(game, snapshot);
});

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    };
  }

  register = () => {
    socket.emit('register', { name: this.state.name });
  };

  render() {
    return (
      <div className={cx('register')}>
        <Segment className={cx('content')}>
          <h2>Join the fun!</h2>
          <Form>
            <Form.Field>
              <label>Name: </label>
              <input
                placeholder="First Name"
                value={this.state.name}
                onChange={e => this.setState({ name: e.target.value })}
              />
            </Form.Field>
            <Button primary onClick={this.register}>
              Join
            </Button>
          </Form>
        </Segment>
      </div>
    );
  }
}

const TurnCountdown = observer(() => {
  const isMyTurn = _.get(game.currentProgrammer, 'id') === socket.id;
  return (
    <Segment className={cx('turnCountdown')}>
      {isMyTurn ? (
        <div className={cx('myTurn')}>It is YOUR turn!</div>
      ) : (
        <div className={cx('myTurn')}>
          It is {_.get(game.currentProgrammer, 'name', 'No one')}'s turn!
        </div>
      )}
      <div className={cx('countdown', `state${game.turnCountdown}`)}>
        {game.turnCountdown}
      </div>
    </Segment>
  );
});

const ProgrammersList = observer(() => (
  <Segment className={cx('programmersList')}>
    <h4>Programmers ({game.programmers.length})</h4>
    {_.map(game.programmers, programmer => (
      <div key={programmer.id}>
        {programmer.name} {programmer.isLead ? '(Lead)' : null}
      </div>
    ))}
  </Segment>
));

const ProgrammersStatusList = observer(() => (
  <Segment className={cx('programmersStatusList')}>
    <h4>Programmers ({game.programmers.length})</h4>
    {_.map(game.programmers, programmer => (
      <div
        key={programmer.id}
        className={cx('programmer', {
          active: game.currentProgrammer === programmer,
        })}
      >
        {programmer.name} {programmer.isLead ? '(Lead)' : null}
      </div>
    ))}
  </Segment>
));

const WriteInput = observer(() => (
  <CodeMirror
    className={cx('input')}
    value={game.input}
    options={{
      lineNumbers: true,
      mode: 'javascript',
      theme: 'material',
      autofocus: true,
    }}
    onBeforeChange={(editor, data, value) => {
      if (_.get(game.currentProgrammer, 'id') === socket.id) {
        socket.emit('game:updateInputValue', { value });
      }
    }}
  />
));

const ReadInput = observer(() => (
  <CodeMirror
    className={cx('input')}
    value={game.input}
    options={{
      lineNumbers: true,
      mode: 'javascript',
      theme: 'neat',
      readOnly: 'nocursor',
    }}
  />
));

const TestCaseResults = observer(({ nextPuzzle }) => {
  if (!game.testCaseResults) {
    return null;
  }
  const simpleError = _.has(game.testCaseResults, 'error');
  if (simpleError) {
    return (
      <div className={cx('testCaseResults')}>
        <div className={cx('simpleError')}>{game.testCaseResults.message}</div>
      </div>
    );
  } else {
    const iAmLead = _.get(game.leadProgrammer, 'id') === socket.id;
    return (
      <div className={cx('testCaseResults')}>
        <div className={cx('testCases')}>
          {_.map(game.testCaseResults, testCase => (
            <div className={cx('testCase')}>
              <div
                className={cx('status', {
                  passing: testCase.passing,
                  error: !testCase.passing,
                })}
              >
                {testCase.passing ? 'PASSED' : 'ERROR'}
              </div>
              <pre className={cx('code')}>{JSON.stringify(testCase.input)}</pre>
              <pre className={cx('code')}>{JSON.stringify(testCase.got)}</pre>
            </div>
          ))}
        </div>
        {game.allPassing &&
          iAmLead && (
            <Button primary onClick={nextPuzzle}>
              Next Puzzle
            </Button>
          )}
      </div>
    );
  }
  return null;
});

@observer
export default class Root extends React.Component {
  constructor(props) {
    super(props);
  }

  @computed
  get isMyTurn() {
    return _.get(game.currentProgrammer, 'id') === socket.id;
  }

  @computed
  get me() {
    return game.getProgrammerById(socket.id);
  }

  @computed
  get iAmLead() {
    return this.me.isLead;
  }

  startGame = () => {
    socket.emit('game:start');
  };

  nextPuzzle = () => {
    socket.emit('game:next');
  };

  @computed
  get content() {
    if (!game.getProgrammerById(socket.id)) {
      return <Register />;
    }

    if (!game.started) {
      return (
        <div>
          <ProgrammersList />
          {this.iAmLead ? (
            <Button primary onClick={this.startGame}>
              Start Game
            </Button>
          ) : (
            <div>
              Waiting on {game.leadProgrammer.name} to start the game...
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className={cx('game')}>
          <TurnCountdown />
          <div className={cx('content')}>
            <div className={cx('description')}>{game.puzzle.description}</div>
            <div className={cx('inputAndList')}>
              {this.isMyTurn ? <WriteInput /> : <ReadInput />}
              <ProgrammersStatusList />
            </div>
            <TestCaseResults nextPuzzle={this.nextPuzzle} />
          </div>
        </div>
      );
    }
  }

  render() {
    return <div className={cx('container')}>{this.content}</div>;
  }
}
