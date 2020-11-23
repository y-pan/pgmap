import { all, put, fork, take, select, race, delay } from "redux-saga/effects";
import { TableItem } from "../../api/type";
import {
  searchActionSaga,
  searchFailed,
  searchRequested,
  searchSucceeded,
} from "../actions/search";
import { getTables } from "../selectors/tables";

function searchRegExp(search: string): RegExp {
  return new RegExp(`\\.*${search}\\.*`);
}

function* doSearchSaga(searchBy: string) {
  try {
    yield put(searchRequested());

    // preprocessing and checks
    const cleanLowerSearchBy = searchBy
      ? String(searchBy).trim().toLowerCase()
      : "";
    if (!cleanLowerSearchBy) {
      yield put(searchSucceeded([]));
      return;
    }

    const tables: TableItem[] = yield select(getTables);
    if (!tables || tables.length === 0) {
      yield put(searchSucceeded([]));
      return;
    }

    // real business
    const regx = searchRegExp(cleanLowerSearchBy);
    const result = tables
      .map((ti) => ti.table_name)
      .filter((name) => {
        const lowerName = name.toLowerCase();
        return regx.test(lowerName) || lowerName.includes(cleanLowerSearchBy);
      });

    yield put(searchSucceeded(result));
  } catch (e) {
    console.error(e);
    yield put(searchFailed());
  }
}

function* watchSearchSaga() {
  while (true) {
    let action = yield take(searchActionSaga);

    while (true) {
      const { debounced, latestAction } = yield race({
        debounced: delay(500),
        latestAction: take(searchActionSaga),
      });

      if (debounced) {
        yield fork(doSearchSaga, action.payload); // invoke wroker saga
        break;
      }

      action = latestAction; // update action then awaiting another debounce
    }
  }
}

function* rootSaga() {
  yield all([watchSearchSaga()]);
}

export default rootSaga;
