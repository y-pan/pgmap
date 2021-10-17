import { simpleActionOf } from "../../store/actions/actionUtil";

const namespace = 'DatabaseList'
export const {type: initializeType, creator: initialize} = simpleActionOf(namespace, 'initialize');