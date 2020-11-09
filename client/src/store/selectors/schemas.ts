import {createSelector} from 'reselect';
import {State} from '../rootReducer';

export const getSchemas = ({schemas}: State) => schemas.schemas;
export const getSchemasStatus = ({schemas}: State) => schemas.schemasStatus;

