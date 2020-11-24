import { ConstraintItem } from "../../api/type";
import { Action } from "../actions/actionUtil";
import {
  getConstraintsActionFailed,
  getConstraintsActionRequested,
  getConstraintsActionSucceeded,
} from "../actions/constraints";
import { LoadingStatus } from "./types";

export interface ConstraintsState {
  constraints?: ConstraintItem[];
  constraintsStatus: LoadingStatus;
}

const initialState: ConstraintsState = {
  constraints: undefined,
  constraintsStatus: LoadingStatus.INITIAL,
};

const constraintsReducer = (
  state = initialState,
  action: Action<any>
): ConstraintsState => {
  switch (action.type) {
    case getConstraintsActionRequested:
      return {
        ...state,
        constraints: undefined,
        constraintsStatus: LoadingStatus.REQUESTED,
      };
    case getConstraintsActionFailed:
      return {
        ...state,
        constraints: undefined,
        constraintsStatus: LoadingStatus.FAILED,
      };
    case getConstraintsActionSucceeded:
      return {
        ...state,
        constraints: action.payload,
        constraintsStatus: LoadingStatus.SUCCEEDED,
      };
    default:
      return state;
  }
};

export default constraintsReducer;
