import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import {Form, Text} from 'react-form';

import {
  Link,
} from 'react-router-dom';

import {v4 as uuid} from 'uuid';

import * as duck from './duck';
import * as connectionsDuck from '../ConnectionsManager/duck';
import {
  createDefaultStory,
} from '../../helpers/schemaUtils';

Modal.setAppElement('#mount');

@connect(
  state => ({
    ...duck.selector(state.stories),
    ...connectionsDuck.selector(state.connections)
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      ...connectionsDuck,
    }, dispatch)
  })
)

class StoriesManager extends Component {

  constructor(props) {
    super(props);
    this.createStory = this.createStory.bind(this);
  }

  componentWillMount() {
    this.props.actions.fetchStories();
  }

  createStory = (password) => {
    const {userId} = this.props;
    const {createStory} = this.props.actions;
    const payload = createDefaultStory();

    createStory({
      payload,
      password
    });
  }

  createSubmit = values => {
    this.createStory(values.password);
  }

  render() {
    const {allStories, connectionsMap, userId} = this.props;
    const storiesList = Object.keys(allStories).map((id) => allStories[id]);
    return (
      <div>
        <button onClick={this.props.actions.openCreateStoryModal}>add story</button>
        <Modal
          onRequestClose={this.props.actions.closeCreateStoryModal}
          isOpen={this.props.isCreateStoryModalOpen}>
          <div>
            <Form onSubmit={this.createSubmit}>
              {formApi => (
                <form onSubmit={formApi.submitForm} id="create-form" className="fonio-form">
                  <div className="modal-row ">
                    <div className="input-group">
                      <label htmlFor="password" className="label">set a password</label>
                      <Text field="password" id="password" type="password" />
                    </div>
                  </div>
                  <div>
                    <button className="valid-btn" type="submit">
                      create
                    </button>
                  </div>
                </form>
              )}
            </Form>
          </div>
        </Modal>
        <div>
          {
            storiesList.map((story, index) => {
              const deleteStory = () => {
                const token = localStorage.getItem(story.id);
                this.props.actions.deleteStory({id: story.id, token});
              }
              return (
                <div key={index}>
                  <span>{story.id}</span>
                  <Link to={`/story/${story.id}`}><button>enter story</button></Link>
                  <button onClick={deleteStory}>delete story</button>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default StoriesManager;