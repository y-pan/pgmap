import { Action } from "../actions/actionUtil";
import { getDatabasesActionFailed, getDatabasesActionRequested, getDatabasesActionSucceeded, setCurrentDatabaseAction } from "../actions/databases";
import { LoadingStatus } from "./types";

export interface DatabasesState {
    databases?: string[];
    databasesStatus: LoadingStatus;
    current?: string;
}

const initialState: DatabasesState = {
    databases: undefined,
    databasesStatus: LoadingStatus.INITIAL,
    current: undefined
}

const databasesReducer = (
    state = initialState,
    action: Action<any>
): DatabasesState => {
    switch (action.type) {
        case getDatabasesActionSucceeded:
            return {
                ...state,
                databases: action.payload,
                databasesStatus: LoadingStatus.SUCCEEDED,
            }
        case getDatabasesActionRequested:
            return {
                ...state,
                databasesStatus: LoadingStatus.REQUESTED,
            }
        case getDatabasesActionFailed:
            return {
                ...state,
                databasesStatus: LoadingStatus.FAILED,
            }
        case setCurrentDatabaseAction:
            return {
                ...state,
                current: action.payload
            }
        default: 
            return state;
    }
}

export default databasesReducer;