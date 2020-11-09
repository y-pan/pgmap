import {all} from "redux-saga/effects";
import schemasSaga from './schemas';

function* rootSaga() {
  yield all([
    schemasSaga()
  ])
}

export default rootSaga;