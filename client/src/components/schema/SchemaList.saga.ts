import { call, takeEvery, select, put } from "@redux-saga/core/effects";
import { setCurrentSchemaSaga } from "../../store/actions/schemas";
import { getSchemas } from "../../store/Operation/Operations";
import { getCurrentDatabase } from "../../store/selectors/databases";
import { initializeAction } from "./SchemaList.actions";

function* onInitialize() {
    const currentDatabase: string = yield select(getCurrentDatabase);
    if (!currentDatabase) {
      return;
    }

    const schemasReponse = yield call([getSchemas, getSchemas.saga], currentDatabase);
    if (schemasReponse && !(schemasReponse instanceof Error)) {
        const {items} = schemasReponse;
        if (items && items.length) {
            const currentSchema =  items.includes("public") ? "public" : items[0];
            yield put(setCurrentSchemaSaga(currentSchema));
        }
    }
  }

  export default function* schemaListSaga() {
      yield takeEvery(initializeAction, onInitialize)
  }