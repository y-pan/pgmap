import { simpleActionOf } from "../../store/actions/actionUtil";

const namespace = 'DatabaseList';

export const {
    type: initializeAction, 
    creator: initialize
} = simpleActionOf(namespace, 'initialize');

export const { 
    type: setCurrentDatabaseAction, 
    creator: setCurrentDatabase
} = simpleActionOf<string>(namespace, "setCurrentDatabase");