import { all } from "redux-saga/effects";
import schemasSaga from "./schemas";
import tablesSaga from "./tables";
import constraintsSaga from "./constraints";
import columnsSaga from "./columns";
import search from "./search";
import datasesSaga from "./databases";

function* rootSaga() {
  yield all([
    datasesSaga(),
    schemasSaga(),
    tablesSaga(),
    constraintsSaga(),
    columnsSaga(),
    search(),
  ]);
}

export default rootSaga;
