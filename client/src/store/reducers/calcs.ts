import { ColumnItem } from "../../api/type";
import { ConstraintItemExtended } from "../../components/dbMap/DataUtil";
import { SMap } from "../../util/utils";
import { Action } from "../actions/actionUtil";
import {
  setQueryDataActionFailed,
  setQueryDataActionRequested,
  setQueryDataActionSucceeded,
} from "../actions/calcs";
import { LoadingStatus } from "./types";

export interface CalcsState {
  t2Cols: SMap<ColumnItem[]>;
  t2ColsStatus: LoadingStatus;
  focusConstraints: ConstraintItemExtended[];
  focusConstraintsStatus: LoadingStatus;
}

const initialState: CalcsState = {
  t2Cols: {},
  t2ColsStatus: LoadingStatus.INITIAL,
  focusConstraints: [],
  focusConstraintsStatus: LoadingStatus.INITIAL,
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
    default:
      return state;
  }
};

export default calcsReducer;
