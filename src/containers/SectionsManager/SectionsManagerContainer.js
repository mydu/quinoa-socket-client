import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {invert} from 'lodash';
import {v4 as uuid} from 'uuid';

import { createDefaultSection } from '../../helpers/schemaUtils';

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

class SectionsManager extends Component {

  constructor(props) {
    super(props);
    this.createSection = this.createSection.bind(this);
  }
  createSection() {
    const {storyId, userId} = this.props;
    const id = uuid();
    const defaultSection = createDefaultSection();
    const section = {
      ...defaultSection,
      id,
    };
    this.props.actions.createSection({
      sectionId: id,
      storyId,
      userId,
      section,
    });
  }
  render() {
    const {storyId, userId, sections, connectionsMap} = this.props;
    const {users} = connectionsMap[storyId];
    const sectionUsers = invert(users);
    return (
      <div style={{border: '1px solid', float: 'left', marginRight: '20px'}}>
        <button onClick={this.createSection}>add section</button>
        {
          Object.keys(sections).map((id, index) => {
            const deleteSection = () => {
              this.props.actions.deleteSection({sectionId: id, storyId, userId});
            }
            const enterSection = () => {
              this.props.actions.enterSection({sectionId: id, storyId, userId});
            }
            const leaveSection = () => {
              this.props.actions.leaveSection({sectionId: id, storyId, userId});
            }
            return (
              <div key={index}>
                <span>section: {id}</span>
                {
                  sectionUsers[id] === userId &&
                  <span>
                    <button onClick={leaveSection}>leave section</button>
                    <button onClick={deleteSection}>delete section</button>
                  </span>
                }
                {
                  sectionUsers[id] !== userId &&
                  sectionUsers[id] !== undefined &&
                  <span style={{color: 'red'}}>-locked</span>
                }
                {sectionUsers[id] === undefined && <button onClick={enterSection}>enter section</button>}
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default SectionsManager;