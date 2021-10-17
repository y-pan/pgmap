
import store from '../index'
import { OpTypes } from '../../types/opTypes';
import { setOpFailure, setOpPending, setOpSuccess } from '../actions/operations';

export class Operation<T> {

    public success: string;
    public failure: string;
    public pending: string;
    private prevSagaTimeout;

    constructor(
        public opType: OpTypes,
        public api: (...args: any[]) => Promise<T>,
        public selector?: (state: any) => any,
    ) {
       this.success = `${this.opType}/success`;
       this.failure = `${this.opType}/failure`;
       this.pending = `${this.opType}/pending`;
    }

    async cacheSaga(...args: any[]): Promise<T> {
        if (this.selector) {
            const value = this.selector(store.getState());
            if (value !== null && value !== undefined) {
                return value;
            }
        }
        return this.saga(...args);
    }

    async saga(...args: any[]): Promise<T> {
        if (this.prevSagaTimeout) {
            clearTimeout(this.prevSagaTimeout);
        }

        return new Promise((resolve) => {
            this.prevSagaTimeout = setTimeout(() => {
                this.doSaga(...args)
                .then(resolve)
                .catch(resolve).finally(() => {
                    this.prevSagaTimeout = 0;
                });
            }, 200);
        })
    }

    async doSaga(...args: any[]): Promise<T> {
        try {
            store.dispatch(setOpPending(this.opType));              // => operations[opType]: pending
            store.dispatch({type: this.pending});                   // for mainState

            const value = await this.api(...args);
            
            store.dispatch(setOpSuccess(this.opType));              // => operations[opType]: success
            store.dispatch({type: this.success, payload: value});   // for mainState

            return value;
        } catch (e) {
            store.dispatch(setOpFailure([this.opType, e]));         // => operations[opType]: error
            store.dispatch({type: this.failure, payload: e});       // for mainState
            
            return e;
        }
    }
}