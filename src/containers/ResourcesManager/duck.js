import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';

export const CREATE_RESOURCE = 'CREATE_RESOURCE';
export const UPDATE_RESOURCE = 'UPDATE_RESOURCE';
export const DELETE_RESOURCE = 'DELETE_RESOURCE';

const OPEN_RESOURCE_MODAL = 'OPEN_RESOURCE_MODAL';
const CLOSE_RESOURCE_MODAL = 'CLOSE_RESOURCE_MODAL';

export const createResource = payload => ({
  type: CREATE_RESOURCE,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
  },
});

export const updateResource = payload => ({
  type: UPDATE_RESOURCE,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
  },
});

export const deleteResource = payload => ({
  type: DELETE_RESOURCE,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
  },
});

export const openResourceModal = payload => ({
  type: OPEN_RESOURCE_MODAL,
  payload,
});

export const closeResourceModal = payload => ({
  type: CLOSE_RESOURCE_MODAL,
  payload,
});

const RESOURCES_UI_DEFAULT_STATE = {
  isResourceModalOpen: false,
};

function resourcesUi(state = RESOURCES_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    case OPEN_RESOURCE_MODAL:
      return {
        ...state,
        isResourceModalOpen: true,
      };
    case CLOSE_RESOURCE_MODAL:
    case `${CREATE_RESOURCE}_SUCCESS`:
      return {
        ...state,
        isResourceModalOpen: false,
      };
    default:
      return state;
  }
}

export default combineReducers({
  resourcesUi,
});

const isResourceModalOpen = state => state.resourcesUi.isResourceModalOpen;

export const selector = createStructuredSelector({
  isResourceModalOpen,
});
