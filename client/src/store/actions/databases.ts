
import { simpleActionOf } from "./actionUtil";

const NAMESPACE = 'Databases';

export const { 
    type: setCurrentDatabaseAction, 
    creator: setCurrentDatabase
} = simpleActionOf<string>(NAMESPACE, "setCurrentDatabase");