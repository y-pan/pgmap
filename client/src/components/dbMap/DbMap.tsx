import { Button } from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { unsetFocusTableSucceeded } from '../../store/actions/tables';
import { getFocusTable } from '../../store/selectors/tables';

import SchemasList from '../schema/SchemaList';
import TableList from '../table/TableList';
import SchemaMap from './SchemaMap';

interface Props {
}

const DbMap: React.FC<Props> = (props) => {
    const dispatch = useDispatch();
    const focusTable = useSelector(getFocusTable);

    return (
        <div style={{margin: 10}}>
            <SchemasList />
            <table>
                <thead>
                <tr>
                    <th><Button color={'primary'} disabled={!focusTable} onClick={()=> dispatch(unsetFocusTableSucceeded())}>Unselect</Button></th>
                    <th>{focusTable ? `${focusTable} & friends` : ""}</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td><TableList /></td>
                    <td><SchemaMap /></td>
                </tr>
                </tbody>
            </table>
        </div>
    )
}

export default DbMap;