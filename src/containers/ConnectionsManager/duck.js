import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';
import { post } from 'axios';

import { serverUrl } from '../../../config.json';
import { ACTIVATE_STORY } from '../StoriesManager/duck';
import { CREATE_SECTION, DELETE_SECTION } from '../SectionsManager/duck';

const SET_SOCKET_ID = 'SET_SOCKET_ID';
const UPDATE_CONNECTIONS_NUMBER = 'UPDATE_CONNECTIONS_NUMBER';
const INIT_STATE = 'INIT_STATE';
const ENTER_STORY = 'ENTER_STORY';
const LEAVE_STORY = 'LEAVE_STORY';
const ENTER_BLOCK = 'ENTER_BLOCK';
const LEAVE_BLOCK = 'LEAVE_BLOCK';
const IDLE_BLOCK = 'IDLE_BLOCK';

const DISCONNECT = 'DISCONNECT';

export const LOGIN_STORY = 'LOGIN_STORY';

const USER_DEFAULT_STATE = {
  userId: undefined,
  connectionsNumber: 0,
};

const CONNECTIONS_DEFAULT_STATE = {};

export const enterStory = payload => ({
  type: ENTER_STORY,
  payload,
  meta: {
    remote: true,
    request: true,
    room: payload.storyId,
  },
});


export const leaveStory = payload => ({
  type: LEAVE_STORY,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
  },
});

export const enterBlock = payload => ({
  type: ENTER_BLOCK,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
  },
});

export const idleBlock = payload => ({
  type: IDLE_BLOCK,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
  },
});

export const leaveBlock = payload => ({
  type: LEAVE_BLOCK,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
  },
});

export const loginStory = payload => ({
  type: LOGIN_STORY,
  storyId: payload.storyId,
  promise: () => {
    const serverRequestUrl = `${serverUrl}/auth/login`;
    return post(serverRequestUrl, payload);
  },
});

function user(state = USER_DEFAULT_STATE, action) {
  switch (action.type) {
    case SET_SOCKET_ID:
      return {
        ...state,
        userId: action.payload,
      };
    case UPDATE_CONNECTIONS_NUMBER:
      return {
        ...state,
        connectionsNumber: action.number,
      };
    default:
      return state;
  }
}

function connections(state = CONNECTIONS_DEFAULT_STATE, action) {
  const { payload } = action;
  let users;
  const DEFAULT_LOCKING = {
    location: 'summary',
  };
  switch (action.type) {
    case INIT_STATE:
      return payload.connections;
    case ENTER_STORY:
    case `${ACTIVATE_STORY}_SUCCESS`:
    case `${ENTER_STORY}_BROADCAST`:
      users = (state[payload.storyId] && state[payload.storyId].users) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          users: {
            ...users,
            [payload.userId]: DEFAULT_LOCKING,
          },
        },
      };
    case LEAVE_STORY:
    case `${LEAVE_STORY}_BROADCAST`:
      users = (state[payload.storyId] && state[payload.storyId].users) || {};
      delete users[payload.userId];
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          users,
        },
      };
    case CREATE_SECTION:
    case `${CREATE_SECTION}_BROADCAST`:
      users = (state[payload.storyId] && state[payload.storyId].users) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          users: {
            ...users,
            [payload.userId]: {
              blockId: payload.sectionId,
              status: 'active',
              location: 'section',
            },
          },
        },
      };
    case ENTER_BLOCK:
    case `${ENTER_BLOCK}_BROADCAST`:
      users = (state[payload.storyId] && state[payload.storyId].users) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          users: {
            ...users,
            [payload.userId]: {
              ...payload,
              status: 'active',
            },
          },
        },
      };
    case IDLE_BLOCK:
    case `${IDLE_BLOCK}_BROADCAST`:
      users = (state[payload.storyId] && state[payload.storyId].users) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          users: {
            ...users,
            [payload.userId]: {
              ...payload,
              status: 'idle',
            },
          },
        },
      };
    case LEAVE_BLOCK:
    case `${LEAVE_BLOCK}_BROADCAST`:
    case DELETE_SECTION:
    case `${DELETE_SECTION}_BROADCAST`:
      users = (state[payload.storyId] && state[payload.storyId].users) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          users: {
            ...users,
            [payload.userId]: DEFAULT_LOCKING,
          },
        },
      };

    case DISCONNECT:
      const newState = { ...state };
      payload.rooms.forEach((room) => {
        delete newState[room].users[payload.userId];
      });
      return newState;
    default:
      return state;
  }
}

export default combineReducers({
  connections,
  user,
});

const userId = state => state.user.userId;
const connectionsNumber = state => state.user.connectionsNumber;
const connectionsMap = state => state.connections;

export const selector = createStructuredSelector({
  userId,
  connectionsNumber,
  connectionsMap,
});
