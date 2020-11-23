import { all } from "redux-saga/effects";
import schemasSaga from "./schemas";
import tablesSaga from "./tables";
import constraintsSaga from "./constraints";
import columnsSaga from "./columns";
import search from "./search";

function* rootSaga() {
  yield all([
    schemasSaga(),
    tablesSaga(),
    constraintsSaga(),
    columnsSaga(),
    search(),
  ]);
}

export default rootSaga;
