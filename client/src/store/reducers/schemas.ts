import { SchemaItem } from "../../api/type";
import { setCurrentDatabaseAction } from "../../components/database/DatabaseList.actions";
import { Action } from "../actions/actionUtil";
import {
  setCurrentSchemaActionFailed,
  setCurrentSchemaActionRequested,
  setCurrentSchemaActionSucceeded,
} from "../actions/schemas";
import { getSchemas } from "../Operation/Operations";
import { LoadingStatus } from "./types";

export interface SchemasState {
  schemas?: SchemaItem[];
  // It makes more sense to show tables/columns for a specific schema
  current?: SchemaItem;
  setCurrentStatus: LoadingStatus;
}

const initialState: SchemasState = {
  schemas: undefined,
  current: undefined,
  setCurrentStatus: LoadingStatus.INITIAL,
};

const schemasReducer = (
  state = initialState,
  action: Action<any>
): SchemasState => {
  switch (action.type) {
    case setCurrentSchemaActionRequested:
      return {
        ...state,
        current: undefined,
        setCurrentStatus: LoadingStatus.REQUESTED,
      };
    case setCurrentSchemaActionSucceeded:
      return {
        ...state,
        current: action.payload,
        setCurrentStatus: LoadingStatus.SUCCEEDED,
      };
    case setCurrentSchemaActionFailed:
      return {
        ...state,
        current: undefined,
        setCurrentStatus: LoadingStatus.FAILED,
      };
    case getSchemas.success:
      const schemas = action.payload.items;
      return {
        ...state,
        schemas,
      };
    case setCurrentDatabaseAction:
      return {
        ...state,
        schemas: undefined,
        current: undefined,
        setCurrentStatus: LoadingStatus.SUCCEEDED,
      }
    default:
      return state;
  }
};

export default schemasReducer;
