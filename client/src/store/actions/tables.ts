import {TableItem} from '../../api/type';
import {Action, actionTypesOf} from './ActionTypes';

const NAMESPACE = 'Tables';

export const [
  getTablesActionSaga,
  getTablesActionRequested,
  getTablesActionSucceeded,
  getTablesActionFailed
] = actionTypesOf(NAMESPACE, 'getTables');

export const getTablesSaga = (): Action<void> => ({
  type: getTablesActionSaga
});
export const getTablesRequested = (): Action<void> => ({
  type: getTablesActionRequested
});
export const getTablesFailed = (): Action<void> => ({
  type: getTablesActionFailed
});
export const getTablesSucceeded = (payload: TableItem[]): Action<TableItem[]> => ({
  type: getTablesActionSucceeded,
  payload
})