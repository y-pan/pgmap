import {all, put, takeEvery, call} from "redux-saga/effects";
import { getSchemasActionSaga, getSchemasFailed, getSchemasRequested, getSchemasSucceeded } from "../actions/schemas";
import {fetchSchemas} from '../../api/Api';
import { SchemaResponse } from "../../api/type";

function* getSchemasSaga() {
  try {
    yield put(getSchemasRequested());
    const schemasReponse: SchemaResponse = yield call(fetchSchemas); // all schemas
    yield put(getSchemasSucceeded(schemasReponse.items));
  } catch(e) {
    console.error(e);
    yield put(getSchemasFailed())
  }
}

function* watchGetSchemaSage() {
  yield takeEvery(getSchemasActionSaga, getSchemasSaga);
}

function* rootSaga() {
  yield all([
    watchGetSchemaSage()
  ])
}

export default rootSaga;