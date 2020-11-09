import { SchemaItem } from "../../api/type";
import { Action, actionTypesOf } from "./ActionTypes";

const NAMESPACE = 'Schemas';

export const [
  getSchemasActionSaga,
  getSchemasActionRequested,
  getSchemasActionSucceeded,
  getSchemasActionFailed
] = actionTypesOf(NAMESPACE, 'getSchemas');

export const getSchemasSaga = (): Action<any> => ({
  type: getSchemasActionSaga,
});

export const getSchemasRequested = (): Action<any> => ({type: getSchemasActionRequested});
export const getSchemasFailed = (): Action<any> => ({type: getSchemasActionFailed});
export const getSchemasSucceeded = (payload: SchemaItem[]): Action<SchemaItem[]> => ({
  type: getSchemasActionSucceeded, payload
});

