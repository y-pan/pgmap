import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSchemasSaga, setCurrentSchemaSaga } from '../../store/actions/schemas';
import { LoadingStatus } from '../../store/reducers/types';
import { getCurrent, getSchemas, getSchemasStatus } from '../../store/selectors/schemas';

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
  if (schemas) {
    listItems = schemas.map((schema, index) => (
      <li key={index} style={{display: "inline-block", margin: 5}}>
        <a onClick={() => currentSchema !== schema && dispatch(setCurrentSchemaSaga(schema))}>{schema}</a>
      </li>
    ));
  }

  return (
    <>
      <p>Schemas:</p>
      <ul>
        {listItems}
      </ul>
    </>
  )
}

export default SchemaList;