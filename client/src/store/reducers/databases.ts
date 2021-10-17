import { setCurrentDatabaseAction } from "../../components/database/DatabaseList.actions";
import { getDatabases } from "../Operation/Operations";

export interface DatabasesState {
    databases?: string[];
    current?: string;
}

const initialState: DatabasesState = {
    databases: undefined,
    current: undefined
}

const databasesReducer = (
    state = initialState,
    {type, payload},
): DatabasesState => {
    switch (type) {
        case getDatabases.success:
            return {
                ...state,
                databases: payload.items
            }
        case setCurrentDatabaseAction:
            return {
                ...state,
                current: payload
            }
        default: 
            return state;
    }
}

export default databasesReducer;