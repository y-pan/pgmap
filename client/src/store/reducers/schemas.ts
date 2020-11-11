import { SchemaItem } from "../../api/type";
import { Action } from "../actions/actionTypes";
import {
  getSchemasActionFailed,
  getSchemasActionRequested,
  getSchemasActionSucceeded,
  setCurrentSchemaActionFailed,
  setCurrentSchemaActionRequested,
  setCurrentSchemaActionSucceeded,
} from "../actions/schemas";
import { LoadingStatus } from "./types";

export interface SchemasState {
  schemas?: SchemaItem[];
  schemasStatus: LoadingStatus;
  // It makes more sense to show tables/columns for a specific schema
  current?: SchemaItem;
  setCurrentStatus: LoadingStatus;
}

const initialState: SchemasState = {
  schemas: undefined,
  schemasStatus: LoadingStatus.INITIAL,
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
    case getSchemasActionRequested:
      return {
        ...state,
        schemas: undefined,
        schemasStatus: LoadingStatus.REQUESTED,
      };
    case getSchemasActionFailed:
      return {
        ...state,
        schemas: undefined,
        schemasStatus: LoadingStatus.FAILED,
      };
    case getSchemasActionSucceeded:
      return {
        ...state,
        schemas: action.payload,
        schemasStatus: LoadingStatus.SUCCEEDED,
      };
    default:
      return state;
  }
};

export default schemasReducer;
