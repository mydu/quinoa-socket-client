// import { combineReducers } from 'redux';
// import { createStructuredSelector } from 'reselect';

export const CREATE_SECTION = 'CREATE_SECTION';
export const UPDATE_SECTION = 'UPDATE_SECTION';
export const DELETE_SECTION = 'DELETE_SECTION';

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