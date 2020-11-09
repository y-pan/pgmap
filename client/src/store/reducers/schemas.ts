import {SchemaItem} from '../../api/type';
import { Action } from '../actions/actionTypes';
import { getSchemasActionFailed, getSchemasActionRequested, getSchemasActionSucceeded } from '../actions/schemas';
import { LoadingStatus } from './types';


export interface SchemasState {
  schemas?: SchemaItem[];
  schemasStatus?: LoadingStatus;
}

const initialState: SchemasState = {
  schemas: undefined,
  schemasStatus: LoadingStatus.INITIAL
}

const schemasReducer = (state = initialState, action: Action<any>): SchemasState  => {
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

export default schemasReducer;