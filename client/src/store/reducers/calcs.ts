import { ColumnItem } from "../../api/type";
import {
  ConstraintItemExtended,
  WhereColumnValue,
} from "../../components/dbMap/DataUtil";
import { SMap } from "../../util/utils";
import { Action } from "../actions/actionUtil";
import {
  setQueryDataActionFailed,
  setQueryDataActionRequested,
  setQueryDataActionSucceeded,
  setWhereDataAction,
  unsetWhereDataAction,
} from "../actions/calcs";
import { LoadingStatus } from "./types";

export interface CalcsState {
  t2Cols: SMap<ColumnItem[]>;
  t2ColsStatus: LoadingStatus;
  focusConstraints: ConstraintItemExtended[];
  focusConstraintsStatus: LoadingStatus;
  whereData: SMap<WhereColumnValue[]>;
}

const initialState: CalcsState = {
  t2Cols: {},
  t2ColsStatus: LoadingStatus.INITIAL,
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
        t2Cols: {},
        t2ColsStatus: LoadingStatus.REQUESTED,
        focusConstraints: [],
        focusConstraintsStatus: LoadingStatus.REQUESTED,
      };
    case setQueryDataActionSucceeded:
      return {
        ...state,
        t2Cols: action.payload.t2Cols,
        t2ColsStatus: LoadingStatus.SUCCEEDED,
        focusConstraints: action.payload.focusConstraints,
        focusConstraintsStatus: LoadingStatus.SUCCEEDED,
      };
    case setQueryDataActionFailed:
      return {
        ...state,
        t2Cols: {},
        t2ColsStatus: LoadingStatus.FAILED,
        focusConstraints: [],
        focusConstraintsStatus: LoadingStatus.FAILED,
      };
    case setWhereDataAction:
      return {
        ...state,
        whereData: action.payload,
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
