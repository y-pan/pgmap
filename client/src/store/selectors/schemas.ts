import { State } from "../reducers";

export const getSchemas = ({ schemas }: State) => schemas.schemas || [];
export const getCurrent = ({ schemas }: State) => schemas.current;
export const getSetCurrentSchemaStatus = ({ schemas }: State) =>
  schemas.setCurrentStatus;
