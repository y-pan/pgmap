import {combineReducers} from 'redux';
import schemas from './reducers/schemas';
import tables from './reducers/tables';

const rootReducer = combineReducers({
  schemas,
  tables,
});

export type State = ReturnType<typeof rootReducer>

export default rootReducer;
