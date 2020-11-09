import {TableItem} from '../../api/type';
import {Action} from '../actions/actionTypes';
import { getTablesActionFailed, getTablesActionRequested, getTablesActionSucceeded } from '../actions/tables';
import { LoadingStatus } from './types';

export interface TablesState {
  tables?: TableItem[];
  tablesStatus?: LoadingStatus;
}

const initialState: TablesState = {
  tables: undefined,
  tablesStatus: LoadingStatus.INITIAL
}

const tablesReducer = (state = initialState, action: Action<any>): TablesState => {
  switch(action.type) {
    case getTablesActionRequested:
      return {
        ...state, 
        tables: undefined,
        tablesStatus: LoadingStatus.REQUESTED
      }
    case getTablesActionFailed:
      return {
        ...state,
        tables: undefined,
        tablesStatus: LoadingStatus.FAILED
      }
    case getTablesActionSucceeded:
      return {
        ...state,
        tables: action.payload,
        tablesStatus: LoadingStatus.SUCCEEDED
      }
    default:
      return state;
  }
}

export default tablesReducer;