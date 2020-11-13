import { all, put, takeEvery, call, take } from "redux-saga/effects";
import {
  getSchemasActionSaga,
  getSchemasFailed,
  getSchemasRequested,
  getSchemasSucceeded,
  setCurrentSchemaActionSaga,
  setCurrentSchemaSucceeded,
  setCurrentSchemaFailed,
} from "../actions/schemas";
import { fetchSchemas } from "../../api/Api";
import { SchemaResponse } from "../../api/type";
import { getTablesSaga } from "../actions/tables";
import { getColumnsSaga } from "../actions/columns";
import { getConstraintsSaga } from "../actions/constraints";
import { Action } from "../actions/actionTypes";

function* getSchemasSaga() {
  try {
    yield put(getSchemasRequested());
    const schemasReponse: SchemaResponse = yield call(fetchSchemas); // all schemas
    yield put(getSchemasSucceeded(schemasReponse.items));
  } catch (e) {
    console.error(e);
    yield put(getSchemasFailed());
  }
}

function* watchGetSchemaSage() {
  yield takeEvery(getSchemasActionSaga, getSchemasSaga);
}

function* setCurrentSchemaSaga(schema: string) {
  try {
    if (schema) {
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
  yield all([watchGetSchemaSage(), watchSetCurrentSchemaSaga()]);
}

export default rootSaga;
