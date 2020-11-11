import React from 'react';

import SchemasList from '../schema/SchemaList';
import SchemaMap from '../schema/SchemaMap';

interface Props {
}

const DbMap: React.FC<Props> = (props) => {
    return (
        <div>
            <SchemasList />
            <SchemaMap />
        </div>
    )
}

export default DbMap;