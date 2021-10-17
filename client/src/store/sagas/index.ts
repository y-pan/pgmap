import { all } from "redux-saga/effects";
import schemasSaga from "./schemas";
import tablesSaga from "./tables";
import constraintsSaga from "./constraints";
import columnsSaga from "./columns";
import search from "./search";
import databaseListSaga from "../../components/database/DatabaseList.saga";
import schemaListSaga from "../../components/schema/SchemaList.saga";

function* rootSaga() {
  yield all([
    databaseListSaga(),
    schemaListSaga(),
    schemasSaga(),
    tablesSaga(),
    constraintsSaga(),
    columnsSaga(),
    search(),
  ]);
}

export default rootSaga;
