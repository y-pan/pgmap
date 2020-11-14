import { Button, TextField } from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { unsetFocusTableSucceeded } from '../../store/actions/tables';
import { getFocusTable, getQuery } from '../../store/selectors/tables';

import SchemasList from '../schema/SchemaList';
import TableList from '../table/TableList';
import SchemaMap from './SchemaMap';

interface Props {
}

const DbMap: React.FC<Props> = (props) => {
    const dispatch = useDispatch();
    const focusTable = useSelector(getFocusTable);
    const query = useSelector(getQuery);
    const copyToClipboard = (): void => {
        if (!query) return;
        const queryElem: any = document.getElementById("query");
        if (!queryElem) return;
        queryElem.select();
        document.execCommand("copy");
    }

    return (
        <div style={{margin: 10}}>
            <SchemasList />
            <table>
                <thead>
                <tr>
                    <th><Button color={'primary'} disabled={!focusTable} onClick={()=> dispatch(unsetFocusTableSucceeded())}>Unselect</Button></th>
                    <th style={{textAlign: "start"}}>
                        <textarea 
                            id="query"
                            readOnly
                            style={{width: "80%"}}
                            value={query || ""} 
                            rows={3} 
                            onClick={copyToClipboard}
                            placeholder="-- Query --"
                        />

                        <Button 
                            disabled={!query}
                            onClick={copyToClipboard}
                            color="primary" 
                            style={{display: "inline", verticalAlign: "inherit"}}>Copy query</Button>
                    </th>
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