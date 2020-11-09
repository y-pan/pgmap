import {all, put, takeEvery, call} from 'redux-saga/effects';
import { fetchTables } from '../../api/Api';
import { TableResponse } from '../../api/type';
import { getTablesActionSaga, getTablesFailed, getTablesRequested, getTablesSucceeded } from '../actions/tables';

function* getTablesSaga() {
  try {
    yield put(getTablesRequested());
    const tablesResponse: TableResponse = yield call(fetchTables);
    yield put(getTablesSucceeded(tablesResponse.items));
  } catch (e) {
    console.error(e);
    yield put(getTablesFailed())
  }
}

function* watchGetTablesSaga() {
  yield takeEvery(getTablesActionSaga, getTablesSaga);
}

function* rootSaga() {
  yield all([
    watchGetTablesSaga(),
  ])
}

export default rootSaga;