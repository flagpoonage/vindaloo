import React from 'react';
import Window from 'components/Window';

import { render } from 'react-dom';
import Store from './state';

let state = Store.getState();

console.log('Initial store state:', state);

document.addEventListener('DOMContentLoaded', () => {
  render(
    <Window store={Store}/>,
    document.getElementById('window')
  );
});
