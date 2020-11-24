import { ConstraintItem } from "../../api/type";
import { actionTypesOf } from "./actionUtil";

const NAMESPACE = "Constraints";

export const [
  getConstraintsActionSaga,
  getConstraintsActionRequested,
  getConstraintsActionSucceeded,
  getConstraintsActionFailed,
] = actionTypesOf(NAMESPACE, "getConstraints");

export const getConstraintsSaga = () => ({
  type: getConstraintsActionSaga,
});
export const getConstraintsRequested = () => ({
  type: getConstraintsActionRequested,
});
export const getConstraintsSucceeded = (payload: ConstraintItem[]) => ({
  type: getConstraintsActionSucceeded,
  payload,
});
export const getConstraintsFailed = () => ({
  type: getConstraintsActionFailed,
});
