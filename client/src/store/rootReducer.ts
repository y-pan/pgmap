import {combineReducers} from 'redux';
import schemas from './reducers/schemas';

const rootReducer = combineReducers({
  schemas
});

export type State = ReturnType<typeof rootReducer>

export default rootReducer;
