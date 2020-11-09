import {State} from '../reducers';

export const getTables = ({tables}: State) => tables.tables;
export const getTablesStatus  = ({tables}: State) => tables.tablesStatus;
