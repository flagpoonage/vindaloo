import thunk from 'redux-thunk';
import multi from 'redux-multi';
import StateMap from './default';
import Reducer from './reducer';
import { applyMiddleware, createStore } from 'redux';

export default createStore(
  Reducer,
  StateMap,
  applyMiddleware(thunk, multi)
);