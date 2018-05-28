import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';

import { get, put, post, delete as del } from 'axios';

import { serverUrl } from '../../../config.json';
import { LOGIN_STORY } from '../ConnectionsManager/duck';
import {
  CREATE_SECTION,
  UPDATE_SECTION,
  DELETE_SECTION,
} from '../SectionsManager/duck';

import {
  CREATE_RESOURCE,
  UPDATE_RESOURCE,
  DELETE_RESOURCE,
} from '../ResourcesManager/duck';

const CREATE_STORY = 'CREATE_STORY';
const SAVE_STORY = 'SAVE_STORY';
const DELETE_STORY = 'DELETE_STORY';
const FETCH_STORIES = 'FETCH_STORIES';
export const ACTIVATE_STORY = 'ACTIVATE_STORY';

const OPEN_CREATE_STORY_MODAL = 'OPEN_CREATE_STORY_MODAL';
const CLOSE_CREATE_STORY_MODAL = 'CLOSE_CREATE_STORY_MODAL';
const OPEN_LOGIN_STORY_MODAL = 'OPEN_LOGIN_STORY_MODAL';
const CLOSE_LOGIN_STORY_MODAL = 'CLOSE_LOGIN_STORY_MODAL';

export const createStory = ({ payload, password }) => ({
  type: CREATE_STORY,
  payload,
  promise: () => {
    const serverRequestUrl = `${serverUrl}/stories/`;
    return post(serverRequestUrl, { payload, password });
  },
});

export const deleteStory = ({ id, token }) => ({
  type: DELETE_STORY,
  promise: () => {
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    const serverRequestUrl = `${serverUrl}/stories/${id}`;
    return del(serverRequestUrl, options);
  },
});

export const fetchStories = () => ({
  type: FETCH_STORIES,
  promise: () => {
    const serverRequestUrl = `${serverUrl}/stories/`;
    return get(serverRequestUrl);
  },
});

export const saveStory = (id, story, token) => ({
  type: SAVE_STORY,
  promise: () => {
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    const serverRequestUrl = `${serverUrl}/stories/${id}`;
    return put(serverRequestUrl, story, options);
  },
});

export const activateStory = payload => ({
  type: ACTIVATE_STORY,
  payload,
  promise: () => {
    const { storyId, userId, token } = payload;
    const serverRequestUrl = `${serverUrl}/stories/${storyId}?userId=${userId}&edit=true`;
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    return get(serverRequestUrl, options);
  },
});

export const openCreateStoryModal = () => ({
  type: OPEN_CREATE_STORY_MODAL,
});

export const closeCreateStoryModal = () => ({
  type: CLOSE_CREATE_STORY_MODAL,
});

export const openLoginStoryModal = payload => ({
  type: OPEN_LOGIN_STORY_MODAL,
  payload,
});

export const closeLoginStoryModal = () => ({
  type: CLOSE_LOGIN_STORY_MODAL,
});

const STORIES_DEFAULT_STATE = {};
const ACTIVE_STORY_DEFAULT_STATE = {};

function stories(state = STORIES_DEFAULT_STATE, action) {
  const { payload, result } = action;
  switch (action.type) {
    case `${FETCH_STORIES}_SUCCESS`:
      return {
        ...state,
        ...result.data,
      };
    case `${CREATE_STORY}_SUCCESS`:
      localStorage.setItem(result.data.story.id, result.data.token);
      return state;
    case `${LOGIN_STORY}_SUCCESS`:
      localStorage.setItem(action.storyId, result.data.token);
      return state;
    case `${CREATE_STORY}_BROADCAST`:
      return {
        ...state,
        [payload.id]: payload,
      };
    // case `${DELETE_STORY}_SUCCESS`:
    case `${DELETE_STORY}_BROADCAST`:
      const newState = { ...state };
      delete newState[payload.id];
      return newState;
    default:
      return state;
  }
}

function activeStory(state = ACTIVE_STORY_DEFAULT_STATE, action) {
  const { result, payload } = action;
  switch (action.type) {
    case `${ACTIVATE_STORY}_SUCCESS`:
      return result.data;
    case CREATE_SECTION:
    case UPDATE_SECTION:
    case `${CREATE_SECTION}_BROADCAST`:
    case `${UPDATE_SECTION}_BROADCAST`:
      return {
        ...state,
        sections: {
          ...state.sections,
          [payload.sectionId]: payload.section,
        },
        lastUpdateAt: payload.lastUpdateAt,
      };
    case DELETE_SECTION:
    case `${DELETE_SECTION}_BROADCAST`:
      const newSections = { ...state.sections };
      delete newSections[payload.sectionId];
      return {
        ...state,
        sections: newSections,
        lastUpdateAt: payload.lastUpdateAt,
      };
    case CREATE_RESOURCE:
    case UPDATE_RESOURCE:
    case `${CREATE_RESOURCE}_BROADCAST`:
    case `${UPDATE_RESOURCE}_BROADCAST`:
      return {
        ...state,
        resources: {
          ...state.resources,
          [payload.resourceId]: payload.resource,
        },
        lastUpdateAt: payload.lastUpdateAt,
      };
    case DELETE_RESOURCE:
    case `${DELETE_RESOURCE}_BROADCAST`:
      const newResources = { ...state.resources };
      delete newResources[payload.resourceId];
      return {
        ...state,
        resources: newResources,
        lastUpdateAt: payload.lastUpdateAt,
      };
    default:
      return state;
  }
}

const STORIES_UI_DEFAULT_STATE = {
  isCreateStoryModalOpen: false,
  isLoginStoryModalOpen: false,
  loginStoryId: undefined,
};

function storiesUi(state = STORIES_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    case OPEN_CREATE_STORY_MODAL:
      return {
        ...state,
        isCreateStoryModalOpen: true,
      };
    case CLOSE_CREATE_STORY_MODAL:
    case `${CREATE_STORY}_SUCCESS`:
      return {
        ...state,
        isCreateStoryModalOpen: false,
      };
    // case `${ACTIVATE_STORY}_FAIL`:
    case `${LOGIN_STORY}_FAIL`:
    case OPEN_LOGIN_STORY_MODAL:
      return {
        ...state,
        loginStoryId: action.payload.storyId,
        isLoginStoryModalOpen: true,
      };
    case `${LOGIN_STORY}_SUCCESS`:
    case CLOSE_LOGIN_STORY_MODAL:
      return {
        ...state,
        isLoginStoryModalOpen: false,
      };
    default:
      return state;
  }
}

export default combineReducers({
  stories,
  storiesUi,
  activeStory,
});

const allStories = state => state.stories;
const isCreateStoryModalOpen = state => state.storiesUi.isCreateStoryModalOpen;
const isLoginStoryModalOpen = state => state.storiesUi.isLoginStoryModalOpen;
const loginStoryId = state => state.storiesUi.loginStoryId;
const activedStory = state => state.activeStory;


export const selector = createStructuredSelector({
  allStories,
  activedStory,
  isCreateStoryModalOpen,
  isLoginStoryModalOpen,
  loginStoryId,
});
