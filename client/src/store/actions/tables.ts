import { TableItem } from "../../api/type";
import { Action, actionsOf, actionTypesOf } from "./actionUtil";

const NAMESPACE = "Tables";

export const [
  getTablesActionSaga,
  getTablesActionRequested,
  getTablesActionSucceeded,
  getTablesActionFailed,
] = actionTypesOf(NAMESPACE, "getTables");

export const getTablesSaga = (): Action<void> => ({
  type: getTablesActionSaga,
});
export const getTablesRequested = (): Action<void> => ({
  type: getTablesActionRequested,
});
export const getTablesFailed = (): Action<void> => ({
  type: getTablesActionFailed,
});
export const getTablesSucceeded = (
  payload: TableItem[]
): Action<TableItem[]> => ({
  type: getTablesActionSucceeded,
  payload,
});

export const {
  types: [
    setFocusTableActionSaga,
    setFocusTableActionRequested,
    setFocusTableActionSucceeded,
    setFocusTableActionFailed,
  ],
  creators: [
    setFocusTableSaga,
    setFocusTableRequested,
    setFocusTableSucceeded,
    setFocusTableFailed,
  ],
} = actionsOf<string>(NAMESPACE, "setFocusTable");

export const {
  types: [
    unsetFocusTableActionSaga,
    unsetFocusTableActionRequested,
    unsetFocusTableActionSucceeded,
    unsetFocusTableActionFailed,
  ],
  creators: [
    unsetFocusTableSaga,
    unsetFocusTableRequested,
    unsetFocusTableSucceeded,
    unsetFocusTableFailed,
  ],
} = actionsOf<TableItem>(NAMESPACE, "unsetFocusTable");
