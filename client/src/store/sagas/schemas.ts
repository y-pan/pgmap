import { all, put, takeEvery, call, take, select } from "redux-saga/effects";
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
import { getTablesSaga, unsetFocusTableSucceeded } from "../actions/tables";
import { getColumnsSaga } from "../actions/columns";
import { getConstraintsSaga } from "../actions/constraints";
import { getCurrentDatabase } from "../selectors/databases";

function* getSchemasSaga() {
  try {
    const currentDatabase: string = yield select(getCurrentDatabase);
    if (!currentDatabase) {
      console.error("A database must be selected for fetching schema.");
      return;
    }
    yield put(getSchemasRequested());
    const schemasReponse: SchemaResponse = yield call(fetchSchemas, currentDatabase); // all schemas
    yield put(getSchemasSucceeded(schemasReponse.items));
    // for convenient, select "public" schema automatically
    if (schemasReponse.items.find((schema) => schema === "public")) {
      yield setCurrentSchemaSaga("public");
    }
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
  yield all([watchGetSchemaSage(), watchSetCurrentSchemaSaga()]);
}

export default rootSaga;
