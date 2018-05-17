// import { combineReducers } from 'redux';
// import { createStructuredSelector } from 'reselect';

export const CREATE_SECTION = 'CREATE_SECTION';
export const UPDATE_SECTION = 'UPDATE_SECTION';
export const DELETE_SECTION = 'DELETE_SECTION';
export const ENTER_SECTION = 'ENTER_SECTION';
export const LEAVE_SECTION = 'LEAVE_SECTION';
export const REQUEST_SECTION = 'REQUEST_SECTION';
export const RELEASE_SECTION = 'RELEASE_SECTION';

export const createSection = payload => ({
  type: CREATE_SECTION,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
  },
});

export const updateSection = payload => ({
  type: UPDATE_SECTION,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
  },
});

export const enterSection = payload => ({
  type: ENTER_SECTION,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
  },
});

export const leaveSection = payload => ({
  type: LEAVE_SECTION,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
  },
});

export const requestSection = payload => ({
  type: REQUEST_SECTION,
  payload,
  meta: {
    remote: true,
    broadcast: false,
    socketId: payload.receiverId,
  },
});

export const releaseSection = payload => ({
  type: RELEASE_SECTION,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
  },
});

export const deleteSection = payload => ({
  type: DELETE_SECTION,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
  },
});

// export default combineReducers({
// });

// export const selector = createStructuredSelector({
// });