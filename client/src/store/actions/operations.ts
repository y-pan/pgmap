import { OpFailurePayload, OpPendingPayload, OpSuccessPayload } from "../../types/opTypes";
import { simpleActionOf } from "./actionUtil";

const NAMESPACE = 'Operations';

export const {
    type: setOpPendingAction, creator: setOpPending
} = simpleActionOf<OpPendingPayload>(NAMESPACE, "setOpPending");

export const {
    type: setOpSuccessAction, creator: setOpSuccess
} = simpleActionOf<OpSuccessPayload>(NAMESPACE, "setOpSuccess");

export const {
    type: setOpFailureAction, creator: setOpFailure
} = simpleActionOf<OpFailurePayload>(NAMESPACE, 'setOpFailure');
