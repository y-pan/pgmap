import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSchemasSaga, setCurrentSchemaSaga } from '../../store/actions/schemas';
import { LoadingStatus } from '../../store/reducers/types';
import { getCurrent, getSchemas, getSchemasStatus } from '../../store/selectors/schemas';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';

const SchemaList: React.FC = () => {
  const dispatch = useDispatch();
  const schemasStatus = useSelector(getSchemasStatus);
  const schemas = useSelector(getSchemas);
  const currentSchema = useSelector(getCurrent);

  useEffect(() => {
    if (schemasStatus === LoadingStatus.INITIAL) {
      dispatch(getSchemasSaga());
    }
  }, [dispatch, schemasStatus])

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
    <Breadcrumbs aria-label="breadcrumb" itemsBeforeCollapse={10} maxItems={20}>
      {listItems}
    </Breadcrumbs>
  )
}

export default SchemaList;