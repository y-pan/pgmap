import { ColumnItem } from "../../api/type";
import { actionTypesOf } from "./actionUtil";

const NAMESPACE = "Columns";

export const [
  getColumnsActionSaga,
  getColumnsActionRequested,
  getColumnsActionSucceeded,
  getColumnsActionFailed,
] = actionTypesOf(NAMESPACE, "getColumns");

export const getColumnsSaga = () => ({
  type: getColumnsActionSaga,
});

export const getColumnsRequested = () => ({
  type: getColumnsActionRequested,
});

export const getColumnsSucceeded = (payload: ColumnItem[]) => ({
  type: getColumnsActionSucceeded,
  payload,
});

export const getColumnsFailed = () => ({
  type: getColumnsActionFailed,
});
