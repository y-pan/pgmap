
import { Action, actionsOf, actionTypesOf, simpleActionOf } from "./actionUtil";

const NAMESPACE = 'Databases';

export const {
    types: [
        getDatabasesActionSaga,
        getDatabasesActionRequested,
        getDatabasesActionSucceeded,
        getDatabasesActionFailed,
    ], creators: [
        getDatabasesSaga,
        getDatabasesRequested,
        getDatabasesSucceeded,
        getDatabasesFailed,
    ] } = actionsOf<string[]>(NAMESPACE, "getDatabases");

export const { type: setCurrentDatabaseAction, creator: setCurrentDatabase
} = simpleActionOf<string>(NAMESPACE, "setCurrentDatabase");