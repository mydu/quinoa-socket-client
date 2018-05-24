import { combineReducers } from 'redux';

import stories from './../containers/StoriesManager/duck';
import connections from './../containers/ConnectionsManager/duck';
import resources from './../containers/ResourcesManager/duck';

export default combineReducers({
  stories,
  connections,
  resources,
});
