import React from 'react';
import { render } from 'react-dom';
import Root from './components/Root';

import 'semantic-ui-css/semantic.min.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

render(<Root />, document.getElementById('root'));
