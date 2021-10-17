import { SchemaItem } from "../../api/type";
import { actionTypesOf } from "./actionUtil";

const NAMESPACE = "Schemas";

export const [
  setCurrentSchemaActionSaga,
  setCurrentSchemaActionRequested,
  setCurrentSchemaActionSucceeded,
  setCurrentSchemaActionFailed,
] = actionTypesOf(NAMESPACE, "setCurrentSchema");

export const setCurrentSchemaSaga = (payload: SchemaItem) => ({
  type: setCurrentSchemaActionSaga,
  payload,
});

export const setCurrentSchemaSucceeded = (payload: SchemaItem) => ({
  type: setCurrentSchemaActionSucceeded,
  payload,
});

export const setCurrentSchemaFailed = () => ({
  type: setCurrentSchemaActionFailed,
});
