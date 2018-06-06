import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';
import { post } from 'axios';

import { serverUrl } from '../../../config.json';
import { ACTIVATE_STORY } from '../StoriesManager/duck';
import { CREATE_SECTION, DELETE_SECTION } from '../SectionsManager/duck';

const SET_SOCKET_ID = 'SET_SOCKET_ID';
const ENTER_STORY = 'ENTER_STORY';
const LEAVE_STORY = 'LEAVE_STORY';
export const ENTER_BLOCK = 'ENTER_BLOCK';
const LEAVE_BLOCK = 'LEAVE_BLOCK';
const IDLE_BLOCK = 'IDLE_BLOCK';

const USER_CONNECTED = 'USER_CONNECTED';
const USER_DISCONNECTING = 'USER_DISCONNECTING';
const USER_DISCONNECTED = 'USER_DISCONNECTED';


export const LOGIN_STORY = 'LOGIN_STORY';

const USERS_DEFAULT_STATE = {
  userId: undefined,
  count: 0,
};

const LOCKING_DEFAULT_STATE = {};

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

function users(state = USERS_DEFAULT_STATE, action) {
  const { payload } = action;
  switch (action.type) {
    case SET_SOCKET_ID:
      return {
        ...state,
        userId: action.payload,
      };
    case USER_CONNECTED:
    case USER_DISCONNECTED:
      return {
        ...state,
        ...payload.connections.users,
      };
    default:
      return state;
  }
}

function locking(state = LOCKING_DEFAULT_STATE, action) {
  const { payload } = action;
  let locks;
  const DEFAULT_LOCKS = {
    summary: true,
  };
  switch (action.type) {
    // case USER_CONNECTED:
    //   return payload.connections.locking;
    case `${ENTER_STORY}_INIT`:
      locks = (state[payload.storyId] && state[payload.storyId].locks) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          locks: {
            ...locks,
            ...payload.locks,
          },
        },
      };
    case ENTER_STORY:
    case `${ACTIVATE_STORY}_SUCCESS`:
    case `${ENTER_STORY}_BROADCAST`:
      locks = (state[payload.storyId] && state[payload.storyId].locks) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          locks: {
            ...locks,
            [payload.userId]: DEFAULT_LOCKS,
          },
        },
      };
    case LEAVE_STORY:
    case `${LEAVE_STORY}_BROADCAST`:
      locks = (state[payload.storyId] && state[payload.storyId].locks) || {};
      delete locks[payload.userId];
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          locks,
        },
      };
    case CREATE_SECTION:
    case `${CREATE_SECTION}_BROADCAST`:
      locks = (state[payload.storyId] && state[payload.storyId].locks) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          locks: {
            ...locks,
            [payload.userId]: {
              ...locks[payload.userId],
              sections: {
                blockId: payload.sectionId,
                status: 'active',
                location: 'sections',
              },
            },
          },
        },
      };
    case `${ENTER_BLOCK}_SUCCESS`:
    case `${ENTER_BLOCK}_BROADCAST`:
      locks = (state[payload.storyId] && state[payload.storyId].locks) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          locks: {
            ...locks,
            [payload.userId]: {
              ...locks[payload.userId],
              [payload.location]: {
                ...payload,
                status: 'active',
              },
            },
          },
        },
      };
    case IDLE_BLOCK:
    case `${IDLE_BLOCK}_BROADCAST`:
      locks = (state[payload.storyId] && state[payload.storyId].locks) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          locks: {
            ...locks,
            [payload.userId]: {
              ...locks[payload.userId],
              [payload.location]: {
                ...payload,
                status: 'idle',
              },
            },
          },
        },
      };
    case LEAVE_BLOCK:
    case `${LEAVE_BLOCK}_BROADCAST`:
    case DELETE_SECTION:
    case `${DELETE_SECTION}_BROADCAST`:
      locks = (state[payload.storyId] && state[payload.storyId].locks) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          locks: {
            ...locks,
            [payload.userId]: {
              ...locks[payload.userId],
              [payload.location]: undefined,
            },
          },
        },
      };

    case USER_DISCONNECTING:
      const newState = { ...state };
      payload.rooms.forEach((room) => {
        delete newState[room].locks[payload.userId];
      });
      return newState;
    default:
      return state;
  }
}

export default combineReducers({
  locking,
  users,
});

const userId = state => state.users.userId;
const usersNumber = state => state.users.count;
const lockingMap = state => state.locking;

export const selector = createStructuredSelector({
  userId,
  usersNumber,
  lockingMap,
});
