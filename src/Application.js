import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch
} from 'react-router-dom';

import * as connectionsDuck from './containers/ConnectionsManager/duck';
import GlobalUi from './containers/GlobalUi/GlobalUiContainer';
import StoriesManager from './containers/StoriesManager/StoriesManagerContainer';
import StoryView from './containers/StoryView/StoryViewContainer';

@connect(
  state => ({
    ...connectionsDuck.selector(state.connections),
  })
)

class Application extends Component {
  constructor(props) {
    super(props);
  }
  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const {
      props: {
        usersNumber,
        userId
      }
    } = this;
    return (
      <Router>
        <div>
          <div>Active connections: {usersNumber}</div>
          <div>User Id: {userId}</div>
          <GlobalUi />
          {userId &&
            <Switch>
              <Route exact path='/' component={StoriesManager} />
              <Route path="/story/:id" render={(props) => (<StoryView {...props} />)} />
            </Switch>
          }
        </div>
      </Router>
    );
  }
}

// Application.propTypes = {
//   connectionsNumber: PropTypes.number
// };

export default Application;
