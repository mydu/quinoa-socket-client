/**
 * Promise middleware
 * ===================================
 * If a promise is passed in an action,
 * this middleware will resolve it and dispatch related actions names
 * (ACTION_NAME when started, then ACTION_NAME_SUCCESS or ACTION_NAME_FAIL depending on promise outcome)
 */

export default () => ({ dispatch, getState }) => next => (action) => {
  // If the action is a function, execute it
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }

  const { promise, type, ...rest } = action;

  // If there is no promise in the action, ignore it
  if (!promise) {
    // pass the action to the next middleware
    return next(action);
  }
  // build constants that will be used to dispatch actions
  const REQUEST = type + '_PENDING';
  const SUCCESS = type + '_SUCCESS';
  const FAIL = type + '_FAIL';
  // const RESET = type + '_RESET';

  // Trigger the action once to dispatch
  // the fact promise is starting resolving (for loading indication for instance)
  next({ ...rest, type: REQUEST });
  // resolve promise
  return promise().then(
    (result) => {
      // setTimeout(() =>
      //   next({...rest, type: RESET})
      // , timers.long);
      return next({...rest, result, type: SUCCESS});
    })
    .catch((error) => {
      return next({ ...rest, error, type: FAIL });
    }
  );
};
