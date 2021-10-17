export enum OpTypes {
    getTables = 'getTables',
    getDatabases = 'getDatabases',
    getSchemas = 'getSchemas',
    getColumns = 'getColumns',
    getConstraints = 'getConstraints'
}

export enum OpStatus {
    pending = 'pending',
    success = 'success',
    failure = 'failure',
}

export type OpSuccessPayload = OpTypes // [opType: OpTypes, data: any];
export type OpFailurePayload = [opType: OpTypes, error: Error];
export type OpPendingPayload = OpTypes // [opType: OpTypes];
export type OpPayload = OpSuccessPayload | OpPendingPayload | OpFailurePayload
