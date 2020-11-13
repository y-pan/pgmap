import { TableItem } from "../../api/type";
import { Action } from "../actions/actionTypes";
import {
  getTablesActionFailed,
  getTablesActionRequested,
  getTablesActionSucceeded,
  setFocusTableActionFailed,
  setFocusTableActionRequested,
  setFocusTableActionSucceeded,
} from "../actions/tables";
import { LoadingStatus } from "./types";

export interface TablesState {
  tables?: TableItem[]; // All tables of 1 schema, at any monent.
  tablesStatus: LoadingStatus;
  focusTable?: TableItem;
  focusTableStatus: LoadingStatus;
}

const initialState: TablesState = {
  tables: undefined,
  tablesStatus: LoadingStatus.INITIAL,
  focusTable: undefined,
  focusTableStatus: LoadingStatus.INITIAL,
};

const tablesReducer = (
  state = initialState,
  action: Action<any>
): TablesState => {
  switch (action.type) {
    case getTablesActionRequested:
      return {
        ...state,
        tables: undefined,
        tablesStatus: LoadingStatus.REQUESTED,
      };
    case getTablesActionFailed:
      return {
        ...state,
        tables: undefined,
        tablesStatus: LoadingStatus.FAILED,
      };
    case getTablesActionSucceeded:
      return {
        ...state,
        tables: action.payload,
        tablesStatus: LoadingStatus.SUCCEEDED,
      };
    case setFocusTableActionRequested:
      return {
        ...state,
        focusTable: undefined,
        focusTableStatus: LoadingStatus.REQUESTED,
      };
    case setFocusTableActionSucceeded:
      return {
        ...state,
        focusTable: action.payload,
        focusTableStatus: LoadingStatus.SUCCEEDED,
      };
    case setFocusTableActionFailed:
      return {
        ...state,
        focusTable: undefined,
        focusTableStatus: LoadingStatus.FAILED,
      };

    default:
      return state;
  }
};

export default tablesReducer;
