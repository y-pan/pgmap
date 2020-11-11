import React from 'react';
import { useSelector } from 'react-redux';
import { LoadingStatus } from '../../store/reducers/types';
import { getColumns, getColumnsStatus } from '../../store/selectors/columns';
import { getConstraints, getConstraintsStatus } from '../../store/selectors/constaints';
import { getCurrent, getSetCurrentSchemaStatus } from '../../store/selectors/schemas';
import { getTables, getTablesStatus } from '../../store/selectors/tables';
import Status from '../status/Status';
import Table from '../table/Table';

const SchemaMap: React.FC = () => {
  const currentSchema = useSelector(getCurrent);
  const currentSchemaStatus = useSelector(getSetCurrentSchemaStatus);
  const tables = useSelector(getTables);
  const tablesStatus = useSelector(getTablesStatus);
  const columns = useSelector(getColumns);
  const columnsStatus = useSelector(getColumnsStatus);
  const constraints = useSelector(getConstraints);
  const constraintsStatus = useSelector(getConstraintsStatus);

  const isReadyToDrawMap = tablesStatus === LoadingStatus.SUCCEEDED 
  && columnsStatus === LoadingStatus.SUCCEEDED
  && constraintsStatus === LoadingStatus.SUCCEEDED;

  let mapComp: JSX.Element[] = [];

  if (currentSchemaStatus !== LoadingStatus.SUCCEEDED) {
    mapComp = [<Status key="schemas-status" name="Schemas" status={currentSchemaStatus}/>]
  } else if (!isReadyToDrawMap) {
    mapComp= (
      [
        <Status key="tables-status" name="Tables" status={tablesStatus}/>,
        <Status key="columns-status" name="Columns" status={columnsStatus}/>,
        <Status key="constraints-status" name="Constraints" status={constraintsStatus}/>
      ]
    )
  } else {
    if (!tables) {
      mapComp = [<div> -- Tables not available -- </div>];
    } else {
      mapComp = tables.map((table, index) => 
        <Table name={table.table_name} columns={columns?.filter(item => item.table_name === table.table_name)}/>
      );
    }
  }
  const schemaInfo = <p>Current Schema: {currentSchema}</p>;

  return (
    <div className="schema-map">
      {schemaInfo}
      <div className="schema-map-inner">
        {mapComp}
      </div>
    </div>
  );
} 

export default SchemaMap;