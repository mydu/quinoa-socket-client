import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as storiesDuck from '../StoriesManager/duck';
import * as connectionsDuck from '../ConnectionsManager/duck';
import SectionsManager from '../SectionsManager/SectionsManagerContainer';
import ResourcesManager from '../ResourcesManager/ResourcesManagerContainer';

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
    this.editLocation = this.editLocation.bind(this);
    this.leaveLocation = this.leaveLocation.bind(this);
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

  editLocation (location) {
    const {id} = this.props.match.params;
    const {userId} = this.props;
    this.props.actions.enterBlock({blockId: location, storyId: id, userId, location});
  }

  leaveLocation (location) {
    const {id} = this.props.match.params;
    const {userId} = this.props;
    this.props.actions.leaveBlock({blockId: location, storyId: id, userId, location});
  }

  render() {
    const {match, userId, lockingMap, activedStory} = this.props;
    const locks = (lockingMap[match.params.id] && lockingMap[match.params.id].locks) || {};

    const sectionBlocksList = Object.keys(locks)
                      .filter((id) => locks[id].sections !== undefined)
                      .map((id) => {
                          return {userId: id, ...locks[id].sections}
                      });
    const resourceBlocksList = Object.keys(locks)
                  .filter((id) => locks[id].resources !== undefined)
                  .map((id) => {
                      return {userId: id, ...locks[id].resources}
                  });

    const cssLock = Object.keys(locks)
                      .filter((id) => locks[id].settings !== undefined)
                      .map((id) => {
                        return {userId: id, ...locks[id].settings}
                      })
    const metadataLock = Object.keys(locks)
                          .filter((id) => locks[id].metadata !== undefined)
                          .map((id) => {
                            return {userId: id, ...locks[id].metadata}
                          })
    const metadataMap = metadataLock.reduce((result, lock) => ({...result, [lock.location]: lock}), {});
    const cssMap = cssLock.reduce((result, lock) => ({...result, [lock.location]: lock}), {});
    return (
        activedStory.id?
          <div>
            <div><button onClick={this.saveStory}>save story</button></div>
            <div style={{border: '1px solid', width: '30%', float: 'left', marginRight: '20px'}}>
              <li>userId - location - blockId</li>
              <div>sections</div>
              {
                sectionBlocksList.map((d, index) => {
                  return <li key={index}>{d.userId} - {d.blockId}</li>
                })
              }
              <div>resources</div>
              {
                resourceBlocksList.map((d, index) => {
                  return <li key={index}>{d.userId} - {d.blockId}</li>
                })
              }
              <div>css</div>
              {
                cssLock.map((d, index) => {
                  return <li key={index}>{d.userId} - {d.blockId}</li>
                })
              }
              <div>metadata</div>
              {
                metadataLock.map((d, index) => {
                  return <li key={index}>{d.userId} - {d.blockId}</li>
                })
              }
            </div>
            {
              activedStory.sections &&
                <SectionsManager storyId={match.params.id} sections={activedStory.sections} />
            }
            {
              activedStory.resources &&
                <ResourcesManager storyId={match.params.id} resources={activedStory.resources} />
            }
            {
              activedStory.metadata &&
                <div style={{border: '1px solid', width: '30%', float: 'left', marginRight: '20px'}}>
                  <span>metadata settings</span>
                  {
                    metadataMap.metadata === undefined &&
                      <button onClick={() => this.editLocation('metadata')}>edit metadata</button>
                  }
                  {
                    metadataMap['metadata'] &&
                    metadataMap['metadata'].userId !== userId &&
                    <span style={{color: 'red'}}>-{metadataMap['metadata'].status}
                    </span>
                  }
                  {
                    metadataMap['metadata'] &&
                    metadataMap['metadata'].userId === userId &&
                    <button onClick={() => this.leaveLocation('metadata')}>leave metadata</button>
                  }
                </div>
            }
            {
              activedStory.settings &&
                <div style={{border: '1px solid', width: '30%', float: 'left', marginRight: '20px'}}>
                  <span>css settings</span>
                  {
                    cssMap.settings === undefined &&
                      <button onClick={() => this.editLocation('settings')}>edit css</button>
                  }
                  {
                    cssMap['settings'] && cssMap['settings'].userId !== userId &&
                    <span style={{color: 'red'}}>-{cssMap['settings'].status}
                    </span>
                  }
                  {
                    cssMap['settings'] && cssMap['settings'].userId === userId &&
                    <button onClick={() => this.leaveLocation('settings')}>leave metadata</button>
                  }
                </div>
            }
          </div> :
          <span>story not exist</span>
    )
  }
}

export default StoryView;
