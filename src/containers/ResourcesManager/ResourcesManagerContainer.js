import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {invert} from 'lodash';
import { v4 as uuid } from 'uuid';

import Modal from 'react-modal';
import Dropzone from 'react-dropzone';

import * as duck from './duck';
import * as connectionsDuck from '../ConnectionsManager/duck';
import loadFile from '../../helpers/fileLoader';

// Modal.setAppElement('#mount');

@connect(
  state => ({
    ...duck.selector(state.resources),
    ...connectionsDuck.selector(state.connections)
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      ...connectionsDuck,
    }, dispatch)
  })
)

class ResourcesManager extends Component {

  constructor(props) {
    super(props);
    this.createResource = this.createResource.bind(this);
    this.updateResource = this.updateResource.bind(this);
    this.closeResourceModal = this.closeResourceModal.bind(this);
    this.onDropFiles = this.onDropFiles.bind(this);
    this.submitUploadResourceData = this.submitUploadResourceData.bind(this);
  }

  submitUploadResourceData (file) {
    return new Promise((resolve, reject) => {
      const { storyId, userId } = this.props;
      const { name } = file;
      const extension = name.split('.').pop();
      const id = uuid();
      let title = file.name.split('.');
      if (title) {
        title.pop();
        title = title.join('.');
      }
      let resource;
      let payload;
      const metadata = {
        title,
        ext: extension,
        fileName: file.name,
        mimeType: file.type,
      };
      const lastUpdateAt = new Date().getTime();
      switch (extension) {
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
          return loadFile('image', file)
            .then((base64) => {
              resource = {
                id,
                metadata: {
                  ...metadata,
                  type: 'image',
                },
                data: { base64 },
              };
              payload = {
                resourceId: id,
                resource,
                storyId,
                userId,
                lastUpdateAt,
              };
              // serverRequestUrl = `${serverUrl}/resources/${storyId}?userId=${userId}`;
              // return post(serverRequestUrl, resource, options);
              return this.props.actions.uploadResource(payload, 'create');
            })
            .then(() => resolve({ id, success: true }))
            .catch(() => resolve({ id, success: false }));
        case 'csv':
        case 'tsv':
          return loadFile('table', file)
            .then((json) => {
              resource = {
                id,
                metadata: {
                  ...metadata,
                  type: 'table',
                },
                data: { json },
              };
              payload = {
                resourceId: id,
                resource,
                storyId,
                userId,
                lastUpdateAt,
              };
              return this.props.actions.uploadResource(payload, 'create');
            })
            .then(() => resolve({ id, success: true }))
            .catch(() => resolve({ id, success: false }));
        default:
          return loadFile('text', file)
            .then((text) => {
              resource = {
                id,
                metadata: {
                  ...metadata,
                  type: 'bib',
                },
                data: { text },
              };
              payload = {
                resourceId: id,
                resource,
                storyId,
                userId,
                lastUpdateAt,
              };
              return this.props.actions.createResource(payload);
            })
            .then(() => resolve({ id, success: true }))
            .catch(() => resolve({ id, success: false }));
      }
    });
  }

  submitMultiResources(files) {
    // return new Promise((resolve, reject) => {
    //   const resourcesPromise = files.map(file => this.submitUploadResourceData(file));
    //   return Promise.all(resourcesPromise.map(p => p.catch(e => e)))
    //     .then(res => resolve(res.filter(result => !result.success)))
    //     .catch(err => reject(err));
    // });
    let errors = [];
    files.reduce((curr, next) => {
      return curr.then(() =>
        this.submitUploadResourceData(next)
        .then((res) => {
          if(res && !res.success) errors.push(res);
        })
      );
    }, Promise.resolve())
    .then(() => {
      if(errors.length > 0) {
        console.log("resource fail to upload")
      }
    })
    .catch(() => {
      console.log("resources fail to upload");
    })
  }

  onDropFiles (files) {
    const {resourceCandidateType} = this.props;
    if(files.length === 1)
      this.props.actions.submitResourceData({type:resourceCandidateType, file:files[0]});
    else {
      this.submitMultiResources(files);
    }
  };

  createResource() {
    const {storyId, userId, resourceCandidate} = this.props;
    const id = uuid();
    const payload = {
      resourceId: id,
      storyId,
      userId,
      resource: {
        ...resourceCandidate,
        id
      },
      lastUpdateAt: new Date().getTime(),
    }
    if((resourceCandidate.metadata.type === 'image' && resourceCandidate.data.base64) || (resourceCandidate.metadata.type === 'table' && resourceCandidate.data.json)) {
      this.props.actions.uploadResource(payload, 'create');
    }
    else {
      this.props.actions.createResource(payload);
    }
  }
  updateResource() {
    const {resourceCandidate, storyId, userId} = this.props;
    const payload = {
      resourceId: resourceCandidate.id,
      storyId,
      userId,
      resource: resourceCandidate,
      lastUpdateAt: new Date().getTime(),
    }
    if((resourceCandidate.metadata.type === 'image' && resourceCandidate.data.base64) || (resourceCandidate.metadata.type === 'table' && resourceCandidate.data.json)) {
      this.props.actions.uploadResource(payload)
      .then(() => this.props.actions.leaveBlock({blockId: resourceCandidate.id, storyId, userId}));
    }
    else {
      this.props.actions.updateResource(payload);
      this.props.actions.leaveBlock({blockId: resourceCandidate.id, storyId, userId});
    }
  }

  closeResourceModal() {
    const {resourceCandidate, storyId, userId} = this.props;
    this.props.actions.closeResourceModal();
    if (resourceCandidate.id) {
      this.props.actions.leaveBlock({blockId: resourceCandidate.id, storyId, userId});
    }
  }
  render() {
    const {storyId, userId, resources, lockingMap, resourceCandidate, resourceCandidateType} = this.props;
    const { locks } = lockingMap[storyId];
    const locksList = Object.keys(locks)
                      .map((id) => {
                        return {userId: id, ...locks[id]}
                      })
                      .filter((d) => d.location === 'resource');

    const resourcesMap = locksList.reduce((result, lock) => ({...result, [lock.blockId]: lock}), {});
    return (
      <div style={{border: '1px solid', float: 'left', marginRight: '20px'}}>
        <button onClick={this.props.actions.startNewResource}>add resource</button>
        {
          Object.keys(resources).map((id, index) => {
            const deleteResource = () => {
              if(resources[id].metadata.type === 'image' || resources[id].metadata.type === 'table') {
                this.props.actions.deleteUploadedResource({
                  resourceId: id, storyId, userId,
                  lastUpdateAt: new Date().getTime()
                });
              }
              else {
                this.props.actions.deleteResource({
                  resourceId: id, storyId, userId,
                  lastUpdateAt: new Date().getTime()
                });
              }
            }
            const editResource = () => {
              this.props.actions.enterBlock({blockId: id, storyId, userId, location: 'resource', resource: resources[id]});
            }
            return (
              <div key={index}>
                <span>resource: {id}</span>
                {
                  resourcesMap[id] &&
                  resourcesMap[id].userId !== userId &&
                  <span style={{color: 'red'}}>-{resourcesMap[id].status}
                  </span>
                }
                {
                  resourcesMap[id] === undefined &&
                    <span>
                      <button onClick={editResource}>edit resource</button>
                      <button onClick={deleteResource}>delete resource</button>
                    </span>
                }
              </div>
            )
          })
        }
        <Dropzone
          activeClassName="active"
          onDrop={this.onDropFiles}>
          <p>submit multiple files</p>
        </Dropzone>
        <Modal
          onRequestClose={this.closeResourceModal}
          isOpen={this.props.isResourceModalOpen}>
            {resourceCandidate &&
              <div>
                { resourceCandidate.id && resourceCandidateType && <span>{resourceCandidateType}</span>}
                { !resourceCandidate.id &&
                  <div>
                    <label>
                      <input
                        type="radio"
                        value="bib"
                        onChange={()=>this.props.actions.setResoruceCandidateType('bib')}
                        checked={resourceCandidate && resourceCandidate.metadata.type === 'bib'}
                      />
                      bib
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="image"
                        onChange={()=>this.props.actions.setResoruceCandidateType('image')}
                        checked={resourceCandidate && resourceCandidate.metadata.type === 'image'}
                      />
                      image
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="table"
                        onChange={()=>this.props.actions.setResoruceCandidateType('table')}
                        checked={resourceCandidate && resourceCandidate.metadata.type === 'table'}
                      />
                      table
                    </label>
                  </div>
                }
                <Dropzone
                  activeClassName="active"
                  onDrop={this.onDropFiles}>
                  <p>submit single file</p>
                </Dropzone>
                {
                  resourceCandidate.id ?
                  <button onClick={this.updateResource}>update resource</button> :
                  <button onClick={this.createResource}>create resource</button>
                }
                <aside>
                  <h2>Preview file</h2>
                  {
                    resourceCandidate.metadata.type === 'bib' &&
                    <pre>{resourceCandidate.data.text}</pre>
                  }
                  {
                    resourceCandidate.metadata.type === 'image' &&
                    <img src={resourceCandidate.data.base64 || resourceCandidate.data.url}  />
                  }
                  {
                    resourceCandidate.metadata.type === 'table' &&
                    <pre>{JSON.stringify(resourceCandidate.data.json)}</pre>
                  }
                </aside>
              </div>
            }
        </Modal>
      </div>
    )
  }
}

export default ResourcesManager;