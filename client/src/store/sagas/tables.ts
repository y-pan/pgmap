import { all, put, takeEvery, call, select, take } from "redux-saga/effects";
import { fetchTables } from "../../api/Api";
import { TableItem, TableResponse } from "../../api/type";
import { Action } from "../actions/actionTypes";
import {
  getTablesActionSaga,
  getTablesFailed,
  getTablesRequested,
  getTablesSucceeded,
  setFocusTableActionSaga,
  setFocusTableFailed,
  setFocusTableSucceeded,
} from "../actions/tables";
import { getCurrent as getCurrentSchema } from "../selectors/schemas";

function* getTablesSaga() {
  try {
    yield put(getTablesRequested());
    const schema = yield select(getCurrentSchema);
    if (!schema) {
      console.error("Schema is required!");
      yield put(getTablesFailed());
      return;
    }
    const tablesResponse: TableResponse = yield call(fetchTables, schema);
    yield put(getTablesSucceeded(tablesResponse.items));
  } catch (e) {
    console.error(e);
    yield put(getTablesFailed());
  }
}

function* setFocusTableSaga(table: TableItem) {
  try {
    if (table) {
      yield put(setFocusTableSucceeded(table));
    }
  } catch (e) {
    console.log(e);
    yield put(setFocusTableFailed());
  }
}

function* watchSetFocusTableSaga() {
  while (true) {
    const action = yield take(setFocusTableActionSaga);
    yield call(setFocusTableSaga, action.payload);
  }
}

function* watchGetTablesSaga() {
  yield takeEvery(getTablesActionSaga, getTablesSaga);
}

function* rootSaga() {
  yield all([watchGetTablesSaga(), watchSetFocusTableSaga()]);
}

export default rootSaga;
