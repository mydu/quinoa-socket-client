import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Modal from 'react-modal';
import {Form, Text} from 'react-form';

import * as storiesDuck from '../StoriesManager/duck';
import * as connectionsDuck from '../ConnectionsManager/duck';

@connect(
  state => ({
    ...storiesDuck.selector(state.stories),
    ...connectionsDuck.selector(state.connections)
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...storiesDuck,
      ...connectionsDuck,
    }, dispatch)
  })
)

class GlobalUi extends Component {

  constructor(props) {
    super(props);
  }


  loginSubmit = values => {
    const {loginStoryId, userId} = this.props;
    const {loginStory} = this.props.actions;
    loginStory({
      storyId: loginStoryId,
      userId,
      password: values.password,
    })
    .then((res) => {
      const {token} = res.result.data;
      this.props.actions.activateStory({storyId: loginStoryId, userId, token});
    })
  }

  render() {
    return (
      <div>
        <Modal
          onRequestClose={this.props.actions.closeLoginStoryModal}
          isOpen={this.props.isLoginStoryModalOpen}>
          <div>
            <Form onSubmit={this.loginSubmit}>
              {formApi => (
                <form onSubmit={formApi.submitForm} id="login-form" className="fonio-form">
                  <div className="modal-row">
                    <div className="input-group">
                      <label htmlFor="password" className="label">login with password</label>
                      <Text field="password" id="password" type="password" />
                    </div>
                  </div>
                  <div>
                    <button className="valid-btn" type="submit">
                      login
                    </button>
                  </div>
                </form>
              )}
            </Form>
          </div>
        </Modal>
      </div>
    )
  }
}

export default GlobalUi;
