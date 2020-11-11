import {combineReducers} from 'redux';
import schemas from './schemas';
import tables from './tables';
import columns from './columns';
import constraints from './constraints';

const rootReducer = combineReducers({
  schemas,
  tables,
  columns,
  constraints,
});

export type State = ReturnType<typeof rootReducer>

export default rootReducer;
