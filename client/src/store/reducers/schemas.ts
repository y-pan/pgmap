import {SchemaItem} from '../../api/type';
import { Action } from '../actions/ActionTypes';
import { getSchemasActionFailed, getSchemasActionRequested, getSchemasActionSucceeded } from '../actions/schemas';
import { LoadingStatus } from './types';


export interface SchemaState {
  schemas?: SchemaItem[];
  schemasStatus?: LoadingStatus;
}

const initialState: SchemaState = {
  schemas: [],
  schemasStatus: LoadingStatus.INITIAL
}

const schemaReducer = (state = initialState, action: Action<any>): SchemaState  => {
  switch(action.type) {
    case getSchemasActionRequested:
      return {
        ...state,
        schemas: undefined,
        schemasStatus: LoadingStatus.REQUESTED
      }
    case getSchemasActionFailed:
      return {
        ...state,
        schemas: undefined,
        schemasStatus: LoadingStatus.FAILED
      }
    case getSchemasActionSucceeded:
      return {
        ...state,
        schemas: action.payload,
        schemasStatus: LoadingStatus.SUCCEEDED
      }
    default:
      return state;
  }
}

export default schemaReducer;