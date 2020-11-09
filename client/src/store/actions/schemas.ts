import { SchemaItem } from "../../api/type";
import { Action, actionTypesOf } from "./ActionTypes";

const NAMESPACE = 'Schemas';

export const [
  getSchemasActionSaga,
  getSchemasActionRequested,
  getSchemasActionSucceeded,
  getSchemasActionFailed
] = actionTypesOf(NAMESPACE, 'getSchemas');

export const getSchemasSaga = (): Action<void> => ({
  type: getSchemasActionSaga,
});

export const getSchemasRequested = (): Action<void> => ({type: getSchemasActionRequested});
export const getSchemasSucceeded = (payload: SchemaItem[]): Action<SchemaItem[]> => ({
  type: getSchemasActionSucceeded, payload
});
export const getSchemasFailed = (): Action<void> => ({type: getSchemasActionFailed});
