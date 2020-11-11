import {all, put, takeEvery, call, select} from 'redux-saga/effects';
import { fetchTables } from '../../api/Api';
import { TableResponse } from '../../api/type';
import { getTablesActionSaga, getTablesFailed, getTablesRequested, getTablesSucceeded } from '../actions/tables';
import { getCurrent as getCurrentSchema } from '../selectors/schemas';

function* getTablesSaga() {
  try {
    yield put(getTablesRequested());
    const schema = yield select(getCurrentSchema);
    if (!schema) {
      console.error("Schema is required!");
      yield put(getTablesFailed())
      return
    }
    const tablesResponse: TableResponse = yield call(fetchTables, schema);
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