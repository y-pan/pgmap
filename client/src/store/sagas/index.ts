import {all} from "redux-saga/effects";
import schemasSaga from './schemas';
import tablesSaga from './tables';

function* rootSaga() {
  yield all([
    schemasSaga(),
    tablesSaga(),
  ])
}

export default rootSaga;