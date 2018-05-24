import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {invert} from 'lodash';
import {v4 as uuid} from 'uuid';

import Modal from 'react-modal';

import { createDefaultResource } from '../../helpers/schemaUtils';

import * as duck from './duck';
import * as connectionsDuck from '../ConnectionsManager/duck';

// Modal.setAppElement('#mount');

@connect(
  state => ({
    // ...duck.selector(state.sections),
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
  }
  createResource() {
    const {storyId, userId} = this.props;
    const id = uuid();
    const defaultResource = createDefaultResource();
    const resource = {
      ...defaultResource,
      id,
    };
    this.props.actions.createResource({
      resourceId: id,
      storyId,
      userId,
      resource,
      lastUpdateAt: new Date().getTime(),
    });
  }
  render() {
    const {storyId, userId, resources, lockingMap} = this.props;
    const { locks } = lockingMap[storyId];
    const locksList = Object.keys(locks)
                      .map((id) => {
                        return {userId: id, ...locks[id]}
                      })
                      .filter((d) => d.location === 'resource');

    const resourcesMap = locksList.reduce((result, lock) => ({...result, [lock.blockId]: lock}), {});

    return (
      <div style={{border: '1px solid', float: 'left', marginRight: '20px'}}>
        <button onClick={this.createResource}>add resource</button>
        {
          Object.keys(resources).map((id, index) => {
            const deleteResource = () => {
              this.props.actions.deleteResource({
                resourceId: id, storyId, userId,
                lastUpdateAt: new Date().getTime()});
            }
            const updateResource = () => {
              this.props.actions.updateResource({sectionId: id, storyId, lastUpdateAt: new Date().getTime()})
            }
            const openResourceModal = () => {
              this.props.actions.openResourceModal();
              this.props.actions.enterBlock({blockId: id, storyId, userId, location: 'resource'});
            }
            const closeResourceModal = () => {
              this.props.actions.closeResourceModal();
              this.props.actions.leaveBlock({blockId: id, storyId, userId});
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
                      <button onClick={openResourceModal}>edit resource</button>
                      <button onClick={deleteResource}>delete resource</button>
                    </span>
                }
                <Modal
                  onRequestClose={closeResourceModal}
                  isOpen={this.props.isResourceModalOpen}>
                  <button onClick={updateResource}>update resource</button>
                </Modal>
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default ResourcesManager;