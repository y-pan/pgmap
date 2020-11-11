import {State} from '../reducers';

export const getColumns = ({columns}: State) => columns.columns;
export const getColumnsStatus = ({columns}: State) => columns.columnsStatus;
