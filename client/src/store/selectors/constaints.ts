import { State } from "../reducers";

export const getConstraints = ({ constraints }: State) =>
  constraints.constraints || [];
export const getConstraintsStatus = ({ constraints }: State) =>
  constraints.constraintsStatus;
