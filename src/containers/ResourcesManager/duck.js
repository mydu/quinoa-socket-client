import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';
import { post, put, delete as del } from 'axios';

import { serverUrl } from '../../../config.json';

import { ENTER_BLOCK } from '../ConnectionsManager/duck';
import { createDefaultResource } from '../../helpers/schemaUtils';
import loadFile from '../../helpers/fileLoader';

export const CREATE_RESOURCE = 'CREATE_RESOURCE';
export const UPDATE_RESOURCE = 'UPDATE_RESOURCE';
export const DELETE_RESOURCE = 'DELETE_RESOURCE';

export const UPLOAD_RESOURCE = 'UPLOAD_RESOURCE';
export const DELETE_UPLOADED_RESOURCE = 'DELETE_UPLOADED_RESOURCE';

const START_NEW_RESOURCE = 'START_NEW_RESOURCE';
const SET_RESOURCE_CANDIDATE_TYPE = 'SET_RESOURCE_CANDIDATE_TYPE';
const SUBMIT_RESOURCE_DATA = 'SUBMIT_RESOURCE_DATA';

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

export const uploadResource = (payload, mode) => ({
  type: UPLOAD_RESOURCE,
  payload,
  promise: () => {
    const token = localStorage.getItem(payload.storyId);
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    let serverRequestUrl;
    if (mode === 'create') {
      serverRequestUrl = `${serverUrl}/resources/${payload.storyId}?userId=${payload.userId}&lastUpdateAt=${payload.lastUpdateAt}`;
      return post(serverRequestUrl, payload.resource, options);
    }
    serverRequestUrl = `${serverUrl}/resources/${payload.storyId}/${payload.resource.id}?userId=${payload.userId}&lastUpdateAt=${payload.lastUpdateAt}`;
    return put(serverRequestUrl, payload.resource, options);
  },
});

export const deleteUploadedResource = payload => ({
  type: DELETE_UPLOADED_RESOURCE,
  payload,
  promise: () => {
    const token = localStorage.getItem(payload.storyId);
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    const serverRequestUrl = `${serverUrl}/resources/${payload.storyId}/${payload.resourceId}?userId=${payload.userId}&lastUpdateAt=${payload.lastUpdateAt}`;
    return del(serverRequestUrl, options);
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

export const startNewResource = payload => ({
  type: START_NEW_RESOURCE,
  payload,
});

export const setResoruceCandidateType = payload => ({
  type: SET_RESOURCE_CANDIDATE_TYPE,
  payload,
});

export const submitResourceData = payload => ({
  type: SUBMIT_RESOURCE_DATA,
  payload,
  promise: () =>
    new Promise((resolve, reject) => {
      const { type, file } = payload;
      switch (type) {
        case 'bib':
          return loadFile('text', file)
            .then(text => resolve({ text }))
            .catch(e => reject(e));
        case 'image':
          return loadFile('image', file)
            .then(base64 => resolve({ base64 }))
            .catch(e => reject(e));
        case 'table':
          return loadFile('table', file)
            .then(json => resolve({ json }))
            .catch(e => reject(e));
        default:
          return reject();
      }
    }),
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
  resourceCandidate: undefined,
  resourceCandidateType: 'bib',
};

function resourcesUi(state = RESOURCES_UI_DEFAULT_STATE, action) {
  const { payload } = action;
  switch (action.type) {
    case START_NEW_RESOURCE:
      const resourceCandidate = createDefaultResource();
      return {
        ...state,
        isResourceModalOpen: true,
        resourceCandidate,
      };
    case SET_RESOURCE_CANDIDATE_TYPE:
      return {
        ...state,
        resourceCandidateType: payload,
        resourceCandidate: {
          ...state.resourceCandidate,
          metadata: {
            ...state.resourceCandidate.metadata,
            type: payload,
          },
        },
      };
    case `${SUBMIT_RESOURCE_DATA}_SUCCESS`:
      let inferedMetadata = {};
      if (payload.type === 'image' || payload.type === 'table') {
        let title = payload && payload.file && payload.file.name && payload.file.name.split('.');
        if (title) {
          title.pop();
          title = title.join('.');
        }
        inferedMetadata = {
          title,
          ext: payload && payload.file && payload.file.name && payload.file.name.split('.')[1],
          fileName: payload && payload.file && payload.file.name && payload.file.name,
          mimeType: payload && payload.file && payload.file.type,
        };
      }
      return {
        ...state,
        resourceCandidate: {
          ...state.resourceCandidate,
          metadata: {
            ...state.resourceCandidate.metadata,
            ...inferedMetadata,
          },
          data: action.result,
        },
      };
    case `${ENTER_BLOCK}_SUCCESS`:
      if (payload.location === 'resources') {
        return {
          ...state,
          isResourceModalOpen: true,
          resourceCandidate: payload.resource,
          resourceCandidateType: payload.resource.metadata.type,
        };
      }
      return state;
    case CLOSE_RESOURCE_MODAL:
    case CREATE_RESOURCE:
    case UPDATE_RESOURCE:
    case `${UPLOAD_RESOURCE}_SUCCESS`:
      return {
        ...state,
        isResourceModalOpen: false,
        resourceCandidate: undefined,
        resourceCandidateType: 'bib',
      };
    default:
      return state;
  }
}

export default combineReducers({
  resourcesUi,
});

const isResourceModalOpen = state => state.resourcesUi.isResourceModalOpen;
const resourceCandidate = state => state.resourcesUi.resourceCandidate;
const resourceCandidateType = state => state.resourcesUi.resourceCandidateType;

export const selector = createStructuredSelector({
  isResourceModalOpen,
  resourceCandidate,
  resourceCandidateType,
});
