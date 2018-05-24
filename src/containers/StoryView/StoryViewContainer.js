import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as storiesDuck from '../StoriesManager/duck';
import * as connectionsDuck from '../ConnectionsManager/duck';
import SectionsManager from '../SectionsManager/SectionsManagerContainer';

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

class StoryView extends Component {

  constructor(props) {
    super(props);
    this.saveStory = this.saveStory.bind(this);
  }

  componentDidMount() {
    const {userId} = this.props;
    const {id} = this.props.match.params;
    const token = localStorage.getItem(id);
    this.props.actions.activateStory({storyId: id, userId, token})
    .then((res) => {
      if (res.error && res.error.response && res.error.response.data && res.error.response.data.auth === false) {
        this.props.actions.openLoginStoryModal({storyId: id});
      }
    });
  }

  componentWillUnmount() {
    const {userId} = this.props;
    const {id} = this.props.match.params;
    this.props.actions.leaveStory({storyId: id, userId});
  }
  saveStory () {
    const {activedStory} = this.props;
    const token = localStorage.getItem(activedStory.id);
    this.props.actions.saveStory(activedStory.id, activedStory, token);
  }
  render() {
    const {match, lockingMap, activedStory} = this.props;
    const locks = (lockingMap[match.params.id] && lockingMap[match.params.id].locks) || {};
    return (
        activedStory.id?
          <div>
            <div><button onClick={this.saveStory}>save story</button></div>
            <div style={{border: '1px solid', width: '30%', float: 'left', marginRight: '20px'}}>
              {
                Object.keys(locks).map((id, index) => {
                  return <li key={index}>{id} - {locks[id].location} - {locks[id].blockId}</li>
                })
              }
            </div>
            {
              activedStory.sections &&
                <SectionsManager storyId={match.params.id} sections={activedStory.sections} />
            }
            {
              /*activedStory.resources &&
                <div style={{border: '1px solid', float: 'left'}}>
                  <button>add resource</button>
                  {
                    Object.keys(activedStory.resources).map((id, index) => {
                      return <div key={index}>resource: {id}</div>
                    })
                  }
                </div>*/
            }
          </div> :
          <span>story not exist</span>
    )
  }
}

export default StoryView;
