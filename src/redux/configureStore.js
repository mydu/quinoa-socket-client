import {
  applyMiddleware,
  createStore,
  compose,
} from 'redux';
// import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';

import promiseMiddleware from './promiseMiddleware';
import createSocketIoMiddleware from './socketIoMiddleware';

import rootReducer from './rootReducer';

const socket = io('http://localhost:3001');

// const socketIoMiddleware = createSocketIoMiddleware(socket, ['server/', 'request/']);
const socketIoMiddleware = createSocketIoMiddleware(socket);
/**
 * Configures store with a possible inherited state and appropriate reducers
 * @param initialState - the state to use to bootstrap the reducer
 * @return {object} store - the configured store
 */

export default function configureStore(initialState = {}) {
  // Compose final middleware with thunk and promises handling
  const middleware = applyMiddleware(socketIoMiddleware, promiseMiddleware());

  // Create final store and subscribe router in debug env ie. for devtools
  const createStoreWithMiddleware = window.__REDUX_DEVTOOLS_EXTENSION__ ?
    compose(
      // related middlewares
      middleware,
      // connection to redux dev tools
      window.__REDUX_DEVTOOLS_EXTENSION__(),
    )(createStore)
    :
    compose(middleware)(createStore);

  const store = createStoreWithMiddleware(
    rootReducer,
    initialState,
  );
  store.getSocket = () => socket;

  // live-reloading handling
  if (module.hot) {
    module.hot.accept('./rootReducer', () => {
      const nextRootReducer = require('./rootReducer').default;
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
