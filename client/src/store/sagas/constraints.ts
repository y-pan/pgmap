import { all, call, put, takeEvery } from "redux-saga/effects";
import { fetchConstraints } from "../../api/Api";
import { ConstraintResponse } from "../../api/type";
import { getConstraintsActionSaga, getConstraintsFailed, getConstraintsRequested, getConstraintsSucceeded } from "../actions/constraints";


function* getConstraintsSaga() {
  try {
    yield put(getConstraintsRequested());
    const res: ConstraintResponse = yield call(fetchConstraints); // all
    yield put(getConstraintsSucceeded(res.items));
  } catch(e) {
    console.error(e);
    yield put(getConstraintsFailed());
  }
}

function* watchGetConstraintsSaga() {
  yield takeEvery(getConstraintsActionSaga, getConstraintsSaga);
}

function* rootSaga() {
  yield all([
    watchGetConstraintsSaga()
  ]);
}

export default rootSaga;