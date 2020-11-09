import {combineReducers} from 'redux';
import schemas from './reducers/schemas';
import tables from './reducers/tables';
import constraints from './reducers/constraints';

const rootReducer = combineReducers({
  schemas,
  tables,
  constraints
});

export type State = ReturnType<typeof rootReducer>

export default rootReducer;
