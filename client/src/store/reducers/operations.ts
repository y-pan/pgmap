import { OpFailurePayload, OpPayload, OpStatus, OpTypes } from "../../types/opTypes";
import { Action } from "../actions/actionUtil";
import { setOpPendingAction, setOpSuccessAction, setOpFailureAction } from "../actions/operations";


export interface OperationsState {
    [opType: string]: OpStatus | Error;
}

const initialState: OperationsState = {};

const operationsReducer = (
    state = initialState,
    {type, payload}: Action<OpPayload>
): OperationsState => {
    switch(type) {
        case setOpPendingAction:
            return {
                ...state,
                [payload as OpTypes]: OpStatus.pending,
            }
        case setOpSuccessAction:
            return {
                ...state,
                [payload as OpTypes]: OpStatus.success,
            }
        case setOpFailureAction:
            const [opType, error] = payload as OpFailurePayload
            return {
                ...state,
                [opType]: error
            }
        default:
            return state;
    }
}

export default operationsReducer;