import { ColumnItem } from "../../api/type";
import { Action } from "../actions/actionUtil";
import {
  getColumnsActionFailed,
  getColumnsActionRequested,
  getColumnsActionSucceeded,
} from "../actions/columns";
import { LoadingStatus } from "./types";

export interface ColumnsState {
  // We'd like to see the whole relationship of all tables in a schema
  // Maybe expensive to show the whole schema.
  columns?: ColumnItem[]; // All columns of all tables of 1 schema, at any monent.
  columnsStatus: LoadingStatus;
}

const initialState: ColumnsState = {
  columns: undefined,
  columnsStatus: LoadingStatus.INITIAL,
};

const columnsReducer = (
  state = initialState,
  action: Action<any>
): ColumnsState => {
  switch (action.type) {
    case getColumnsActionRequested:
      return {
        ...state,
        columns: undefined,
        columnsStatus: LoadingStatus.REQUESTED,
      };
    case getColumnsActionSucceeded:
      return {
        ...state,
        columns: action.payload,
        columnsStatus: LoadingStatus.SUCCEEDED,
      };
    case getColumnsActionFailed:
      return {
        ...state,
        columns: undefined,
        columnsStatus: LoadingStatus.FAILED,
      };
    default:
      return state;
  }
};

export default columnsReducer;
