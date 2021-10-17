
import React, {useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentDatabase, getDatabases } from '../../store/selectors/databases';
import Link from '@material-ui/core/Link';
import { Breadcrumbs } from '@material-ui/core';
import { initialize, setCurrentDatabase } from './DatabaseList.actions';

const DatabaseList: React.FC = () => {
    const dispatch = useDispatch();
    const databases = useSelector(getDatabases);
    const currentDatabase = useSelector(getCurrentDatabase);

    useEffect(() => {
        dispatch(initialize());
    }, [dispatch])

    let databaseItems: JSX.Element[] = []

    function onClickDatabase (event: React.MouseEvent, database: string) {
        event.preventDefault();
        currentDatabase !== database && dispatch(setCurrentDatabase(database));
    }

    if (databases) {
        databaseItems = databases.map((db, index) => (
            <Link
                key={index}
                style={{cursor: "pointer"}}
                color={ currentDatabase === db ? "textPrimary" : "inherit"} 
                onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => onClickDatabase(event, db)}>
                {db}
            </Link>
        ));
    }

    return (
        <>
        <strong>Databases:</strong>
        <Breadcrumbs aria-label="breadcrumb" itemsBeforeCollapse={10} maxItems={20}>
            {databaseItems}
        </Breadcrumbs>
        </>
    )
}

export default DatabaseList;