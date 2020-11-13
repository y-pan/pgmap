import React from 'react';
import { useSelector } from 'react-redux';
import { LoadingStatus } from '../../store/reducers/types';
import { getColumns, getColumnsStatus } from '../../store/selectors/columns';
import { getConstraints, getConstraintsStatus } from '../../store/selectors/constaints';
import { getCurrent, getSetCurrentSchemaStatus } from '../../store/selectors/schemas';
import { getTables, getTablesStatus } from '../../store/selectors/tables';
import Status from '../status/Status';
import SvgMap from './SvgMap';

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

  let allStatus: JSX.Element[] = [];
  let canRenderSvg = false;
  if (currentSchemaStatus !== LoadingStatus.SUCCEEDED) {
    allStatus = [<Status key="schemas-status" name="Schemas" status={currentSchemaStatus}/>]
  } else if (!isReadyToDrawMap) {
    allStatus= (
      [
        <Status key="tables-status" name="Tables" status={tablesStatus}/>,
        <Status key="columns-status" name="Columns" status={columnsStatus}/>,
        <Status key="constraints-status" name="Constraints" status={constraintsStatus}/>
      ]
    )
  } else {
    if (!tables) {
      allStatus = [<div> -- No Table Available -- </div>];
    } else {
      canRenderSvg = true;
    }
  }

  return (
    <div className="schema-map">
      {allStatus}
      {canRenderSvg && 
        <SvgMap
          tables={tables}
          columns={columns} 
          constraints={constraints} />
         }
    </div>
  );
} 

export default SchemaMap;