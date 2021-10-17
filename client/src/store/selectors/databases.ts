import { State } from "../reducers";

export const getDatabases = ({databases}: State) => databases.databases;
export const getCurrentDatabase = ({databases}: State) => databases.current;
