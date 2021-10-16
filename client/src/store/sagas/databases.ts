import { all, put, takeEvery, call, select, take } from "redux-saga/effects";
import { fetchDatabases } from "../../api/Api";
import { DatabaseResponse } from "../../api/type";
import { getDatabasesActionRequested, getDatabasesActionSaga, getDatabasesFailed, getDatabasesRequested, getDatabasesSucceeded } from "../actions/databases";

function* getDatabasesSaga() {
    try {
        yield put(getDatabasesRequested())
        const databasesResponse: DatabaseResponse = yield call(fetchDatabases);
        yield put(getDatabasesSucceeded(databasesResponse.items));
    } catch (e) {
        console.error(e);
        yield put(getDatabasesFailed());
    }
}

export default function* datasesSaga() {
    yield takeEvery(getDatabasesActionSaga, getDatabasesSaga)
}