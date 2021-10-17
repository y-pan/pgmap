import { simpleActionOf } from "../../store/actions/actionUtil";

const namespace = "SchemaList"

export const {
    type: initializeAction,
    creator: initialize,
} = simpleActionOf(namespace, 'initialize')