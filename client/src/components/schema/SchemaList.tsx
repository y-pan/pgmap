import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentSchemaSaga } from '../../store/actions/schemas';
import { getCurrent, getSchemas } from '../../store/selectors/schemas';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import { getCurrentDatabase } from '../../store/selectors/databases';
import { initialize } from './SchemaList.actions';

const SchemaList: React.FC = () => {
  const dispatch = useDispatch();
  const schemas = useSelector(getSchemas);
  const currentSchema = useSelector(getCurrent);
  const currentDatabase = useSelector(getCurrentDatabase);
  console.log("currentdb", currentDatabase)
  useEffect(() => {
      if (currentDatabase) {
        dispatch(initialize());
      }
  }, [dispatch, currentDatabase])

  let listItems: JSX.Element[] = [] 

  function onClickSchema (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, schema: string) {
    event.preventDefault();
    currentSchema !== schema && dispatch(setCurrentSchemaSaga(schema))
  }
  if (schemas) {
    listItems = schemas.map((schema, index) => (
      <Link 
        key={index} 
        style={{cursor: "pointer"}}
        color={ currentSchema === schema ? "textPrimary" : "inherit"} 
        onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => onClickSchema(event, schema)}>
        {schema}
      </Link>
    ));
  }

  return (
    <>
    <strong>Schemas:</strong>
    <Breadcrumbs aria-label="breadcrumb" itemsBeforeCollapse={10} maxItems={20}>
      {listItems}
    </Breadcrumbs>
    </>
  )
}

export default SchemaList;