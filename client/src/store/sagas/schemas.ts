import { all, put, call, take } from "redux-saga/effects";
import {
  setCurrentSchemaActionSaga,
  setCurrentSchemaSucceeded,
  setCurrentSchemaFailed,
} from "../actions/schemas";
import { getTablesSaga, unsetFocusTableSucceeded } from "../actions/tables";
import { getColumnsSaga } from "../actions/columns";
import { getConstraintsSaga } from "../actions/constraints";

function* setCurrentSchemaSaga(schema: string) {
  try {
    if (schema) {
      yield put(unsetFocusTableSucceeded());
      yield put(setCurrentSchemaSucceeded(schema));
      yield all([
        put(getTablesSaga()),
        put(getColumnsSaga()),
        put(getConstraintsSaga()),
      ]);
    } else {
      yield put(setCurrentSchemaFailed());
    }
  } catch (e) {
    console.log(e);
    yield put(setCurrentSchemaFailed());
  }
}

function* watchSetCurrentSchemaSaga() {
  while (true) {
    const action = yield take(setCurrentSchemaActionSaga);
    yield call(setCurrentSchemaSaga, action.payload);
  }
}

function* rootSaga() {
  yield all([watchSetCurrentSchemaSaga()]);
}

export default rootSaga;
