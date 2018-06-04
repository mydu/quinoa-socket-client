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
      lastUpdateAt: new Date().getTime(),
    });
  }
  render() {
    const {storyId, userId, sections, lockingMap} = this.props;
    const { locks } = lockingMap[storyId];
    const locksList = Object.keys(locks)
                      .map((id) => {
                        return {userId: id, ...locks[id]}
                      })
                      .filter((d) => d.location === 'sections');

    const sectionsMap = locksList.reduce((result, lock) => ({...result, [lock.blockId]: lock}), {});

    return (
      <div style={{border: '1px solid', float: 'left', marginRight: '20px'}}>
        <button onClick={this.createSection}>add section</button>
        {
          Object.keys(sections).map((id, index) => {
            const deleteSection = () => {
              this.props.actions.deleteSection({
                sectionId: id, storyId, userId,
                lastUpdateAt: new Date().getTime()});
            }
            const updateSection = () => {
              this.props.actions.updateSection({sectionId: id, storyId, lastUpdateAt: new Date().getTime()})
            }
            const enterSection = () => {
              this.props.actions.enterBlock({blockId: id, storyId, userId, location: 'sections'});
            }
            const idleSection = () => {
              this.props.actions.idleBlock({blockId: id, storyId, userId, location: 'sections'});
            }
            const leaveSection = () => {
              this.props.actions.leaveBlock({blockId: id, storyId, userId});
            }
            return (
              <div key={index}>
                <span>section: {id}</span>
                {
                  sectionsMap[id] &&
                  sectionsMap[id].userId === userId &&
                  <span>
                    <button onClick={leaveSection}>leave section</button>
                    <button onClick={updateSection}>update section</button>
                    <button onClick={deleteSection}>delete section</button>
                  </span>
                }
                {
                  sectionsMap[id] &&
                  sectionsMap[id].userId !== userId &&
                  <span style={{color: 'red'}}>-{sectionsMap[id].status}
                  </span>
                }
                {
                  sectionsMap[id] === undefined && <button onClick={enterSection}>enter section</button>
                }
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default SectionsManager;