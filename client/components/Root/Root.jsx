import React from 'react';
import _ from 'lodash';
import { observer } from 'mobx-react';
import {
  applySnapshot,
  getSnapshot,
  onPatch,
  applyPatch,
} from 'mobx-state-tree';
import io from 'socket.io-client';
const cx = require('classnames/bind').bind(require('./root.scss'));

import { Game, Programmer } from '../../../universal/game.model';

const game = Game.create();
const socket = io();

socket.on('connect', function() {
  console.log('socket.id', socket.id);
});

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
      <div>
        Name:
        <input
          value={this.state.name}
          onChange={e => this.setState({ name: e.target.value })}
        />
        <button onClick={this.register}>Join</button>
      </div>
    );
  }
}

@observer
export default class Root extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!game.getProgrammerById(socket.id)) {
      return (
        <div>
          <div>Please register</div>
          <Register />
        </div>
      );
    }
    return <div className={cx('container')}>Hi</div>;
  }
}
