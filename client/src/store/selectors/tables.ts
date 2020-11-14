import { State } from "../reducers";

export const getTables = ({ tables }: State) => tables.tables || [];
export const getTablesStatus = ({ tables }: State) => tables.tablesStatus;
export const getFocusTable = ({ tables }: State) => tables.focusTable;
export const getFocusTableStatus = ({ tables }: State) =>
  tables.focusTableStatus;
export const getQuery = ({ tables }: State) => tables.query;
