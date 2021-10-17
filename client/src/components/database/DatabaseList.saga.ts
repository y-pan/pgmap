import { call, takeEvery } from "@redux-saga/core/effects";
import { getDatabases } from "../../store/Operation/Operations";
import { initializeType } from "./DatabaseList.actions";

function* onInitialize() {
    yield call([getDatabases, getDatabases.saga]);
}

export default function* databaseListSaga() {
    yield takeEvery(initializeType, onInitialize);
}
