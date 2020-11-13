import React from 'react';

import SchemasList from '../schema/SchemaList';
import TableList from '../table/TableList';
import SchemaMap from './SchemaMap';

interface Props {
}

const DbMap: React.FC<Props> = (props) => {
    return (
        <div style={{margin: 10}}>
            <SchemasList />
            <table>
                <thead>
                <tr>
                    <th>Table List</th>
                    <th>Table Details</th>
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