import { ColumnItem } from "../../api/type";
import {
  ConstraintItemExtended,
  WhereColumnValue,
} from "../../components/dbMap/DataUtil";
import { mergeDistinct } from "../../util/arrayUtil";
import { SMap } from "../../util/utils";
import { Action } from "../actions/actionUtil";
import {
  setQueryDataActionFailed,
  setQueryDataActionRequested,
  setQueryDataActionSucceeded,
  setTableWhereDataAction,
  setWhereDataAction,
  unsetWhereDataAction,
} from "../actions/calcs";
import { LoadingStatus } from "./types";

export interface CalcsState {
  whereableT2Cols: SMap<ColumnItem[]>; // It should only have focusTable & downsteamTables, and WhereBuilder relies on it.
  whereableT2ColsStatus: LoadingStatus;
  focusConstraints: ConstraintItemExtended[];
  focusConstraintsStatus: LoadingStatus;
  whereData: SMap<WhereColumnValue[]>;
}

const initialState: CalcsState = {
  whereableT2Cols: {},
  whereableT2ColsStatus: LoadingStatus.INITIAL,
  focusConstraints: [],
  focusConstraintsStatus: LoadingStatus.INITIAL,
  whereData: {},
};

const calcsReducer = (
  state = initialState,
  action: Action<any>
): CalcsState => {
  switch (action.type) {
    case setQueryDataActionRequested:
      return {
        ...state,
        whereableT2Cols: {},
        whereableT2ColsStatus: LoadingStatus.REQUESTED,
        focusConstraints: [],
        focusConstraintsStatus: LoadingStatus.REQUESTED,
      };
    case setQueryDataActionSucceeded:
      return {
        ...state,
        whereableT2Cols: action.payload.t2Cols,
        whereableT2ColsStatus: LoadingStatus.SUCCEEDED,
        focusConstraints: action.payload.focusConstraints,
        focusConstraintsStatus: LoadingStatus.SUCCEEDED,
      };
    case setQueryDataActionFailed:
      return {
        ...state,
        whereableT2Cols: {},
        whereableT2ColsStatus: LoadingStatus.FAILED,
        focusConstraints: [],
        focusConstraintsStatus: LoadingStatus.FAILED,
      };
    case setWhereDataAction:
      return {
        ...state,
        whereData: action.payload,
      };
    case setTableWhereDataAction:
      const tableWhereData: WhereColumnValue[] = action.payload;
      const table = tableWhereData[0].table;
      const mergedColumnData: WhereColumnValue[] = mergeDistinct<WhereColumnValue>(
        state.whereData[table],
        tableWhereData,
        (whereColumnValue) => whereColumnValue.column
      );

      return {
        ...state,
        whereData: {
          ...state.whereData,
          [table]: mergedColumnData,
        },
      };
    case unsetWhereDataAction:
      return {
        ...state,
        whereData: {},
      };
    default:
      return state;
  }
};

export default calcsReducer;
