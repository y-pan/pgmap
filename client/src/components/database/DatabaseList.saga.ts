import { call, takeEvery } from "@redux-saga/core/effects";
import { getDatabases } from "../../store/Operation/Operations";
import { initializeAction } from "./DatabaseList.actions";

function* onInitialize() {
    yield call([getDatabases, getDatabases.saga]);
}

export default function* databaseListSaga() {
    yield takeEvery(initializeAction, onInitialize);
}
