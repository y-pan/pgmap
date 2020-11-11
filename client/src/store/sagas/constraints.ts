import { all, call, put, takeEvery, select } from "redux-saga/effects";
import { fetchConstraints } from "../../api/Api";
import { ConstraintResponse } from "../../api/type";
import {
  getConstraintsActionSaga,
  getConstraintsFailed,
  getConstraintsRequested,
  getConstraintsSucceeded,
} from "../actions/constraints";
import { getCurrent as getCurrentSchema } from "../selectors/schemas";

function* getConstraintsSaga() {
  try {
    yield put(getConstraintsRequested());
    const schema = yield select(getCurrentSchema);
    if (!schema) {
      yield put(getConstraintsFailed());
      return;
    }
    const res: ConstraintResponse = yield call(fetchConstraints, schema);
    yield put(getConstraintsSucceeded(res.items));
  } catch (e) {
    console.error(e);
    yield put(getConstraintsFailed());
  }
}

function* watchGetConstraintsSaga() {
  yield takeEvery(getConstraintsActionSaga, getConstraintsSaga);
}

function* rootSaga() {
  yield all([watchGetConstraintsSaga()]);
}

export default rootSaga;
