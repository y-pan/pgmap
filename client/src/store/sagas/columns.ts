import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { fetchColumns } from "../../api/Api";
import { ColumnResponse } from "../../api/type";
import {
  getColumnsActionSaga,
  getColumnsFailed,
  getColumnsRequested,
  getColumnsSucceeded,
} from "../actions/columns";
import { getCurrent as getCurrentSchema } from "../selectors/schemas";

function* getColumnsSaga() {
  try {
    yield put(getColumnsRequested());
    const schema = yield select(getCurrentSchema);
    if (!schema) {
      console.error("Schema is required!");
      yield put(getColumnsFailed());
      return;
    }

    const columnsResponse: ColumnResponse = yield call(fetchColumns, schema);
    yield put(getColumnsSucceeded(columnsResponse.items));
  } catch (e) {
    console.error(e);
    yield put(getColumnsFailed());
  }
}

function* watchGetColumnsSaga() {
  yield takeEvery(getColumnsActionSaga, getColumnsSaga);
}

function* rootSaga() {
  yield all([watchGetColumnsSaga()]);
}

export default rootSaga;
