import {all} from "redux-saga/effects";
import schemasSaga from './schemas';
import tablesSaga from './tables';
import constraintsSaga from './constraints';

function* rootSaga() {
  yield all([
    schemasSaga(),
    tablesSaga(),
    constraintsSaga(),
  ])
}

export default rootSaga;