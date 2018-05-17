import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';
import { post } from 'axios';

import { serverUrl } from '../../../config.json';
import { ACTIVATE_STORY } from '../StoriesManager/duck';
import { CREATE_SECTION, DELETE_SECTION, ENTER_SECTION, LEAVE_SECTION } from '../SectionsManager/duck';

const SET_SOCKET_ID = 'SET_SOCKET_ID';
const UPDATE_CONNECTIONS_NUMBER = 'UPDATE_CONNECTIONS_NUMBER';
const INIT_STATE = 'INIT_STATE';
const ENTER_STORY = 'ENTER_STORY';
const LEAVE_STORY = 'LEAVE_STORY';
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
            [payload.userId]: 'summary',
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
    case ENTER_SECTION:
    case `${ENTER_SECTION}_BROADCAST`:
      users = (state[payload.storyId] && state[payload.storyId].users) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          users: {
            ...users,
            [payload.userId]: payload.sectionId,
          },
        },
      };
    case LEAVE_SECTION:
    case `${LEAVE_SECTION}_BROADCAST`:
    case DELETE_SECTION:
    case `${DELETE_SECTION}_BROADCAST`:
      users = (state[payload.storyId] && state[payload.storyId].users) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          users: {
            ...users,
            [payload.userId]: 'summary',
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
