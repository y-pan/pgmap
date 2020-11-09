import {State} from '../rootReducer';

export const getConstraints = ({constraints}: State) => constraints.constraints;
export const getConstraintsStatus = ({constraints}: State) => constraints.constraintsStatus;
