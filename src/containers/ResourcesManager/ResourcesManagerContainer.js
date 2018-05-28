import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {invert} from 'lodash';

import Modal from 'react-modal';
import Dropzone from 'react-dropzone';

import * as duck from './duck';
import * as connectionsDuck from '../ConnectionsManager/duck';

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
  }
  onDropFiles (files) {
    const {resourceCandidateType} = this.props;
    this.props.actions.submitResourceData({type:resourceCandidateType, data:files[0]});
  };

  createResource() {
    const {storyId, userId, resourceCandidate} = this.props;
    const payload = {
      resourceId: resourceCandidate.id,
      storyId,
      userId,
      resource: resourceCandidate,
      lastUpdateAt: new Date().getTime(),
    }
    if(resourceCandidate.metadata.type === 'image' || resourceCandidate.metadata.type === 'table') {
      this.props.actions.uploadResource(payload);
    }
    else {
      this.props.actions.createResource(payload);
    }
  }
  updateResource() {
    const {resourceCandidateId} = this.props;
    this.props.actions.updateResource({resourceId: resourceCandidateId, storyId, lastUpdateAt: new Date().getTime()})
  }

  closeResourceModal() {
    const {resourceCandidateId, storyId, userId} = this.props;
    this.props.actions.closeResourceModal();
    if (resourceCandidateId) {
      this.props.actions.leaveBlock({blockId: resourceCandidateId, storyId, userId});
    }
  }
  render() {
    const {storyId, userId, resources, lockingMap, resourceCandidateId, resourceCandidate} = this.props;
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
              this.props.actions.deleteResource({
                resourceId: id, storyId, userId,
                lastUpdateAt: new Date().getTime()});
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
        <Modal
          onRequestClose={this.closeResourceModal}
          isOpen={this.props.isResourceModalOpen}>
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
          <Dropzone
            activeClassName="active"
            onDrop={this.onDropFiles}>
          </Dropzone>
          {
            resourceCandidateId ?
            <button onClick={this.updateResource}>update resource</button> :
            <button onClick={this.createResource}>create resource</button>
          }
          <aside>
            <h2>Preview file</h2>
            {
              resourceCandidate &&
              resourceCandidate.metadata.type === 'bib' &&
              <pre>{resourceCandidate.data.text}</pre>
            }
            {
              resourceCandidate &&
              resourceCandidate.metadata.type === 'image' &&
              <img src={resourceCandidate.data.base64}  />
            }
            {
              resourceCandidate &&
              resourceCandidate.metadata.type === 'table' &&
              <pre>{JSON.stringify(resourceCandidate.data.json)}</pre>
            }
          </aside>
        </Modal>
      </div>
    )
  }
}

export default ResourcesManager;