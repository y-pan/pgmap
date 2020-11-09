import {combineReducers} from 'redux';
import schemas from './schemas';
import tables from './tables';
import constraints from './constraints';

const rootReducer = combineReducers({
  schemas,
  tables,
  constraints
});

export type State = ReturnType<typeof rootReducer>

export default rootReducer;
