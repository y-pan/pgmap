import React from 'react';
import { ColumnItem } from '../../api/type';

interface Props {
  name: string;
  columns?: ColumnItem[];
}

// deprecated!!!
const Table: React.FC<Props> = ({name, columns}) => {
  const columnComps = columns?.sort(item => item.ordinal_position)
  .map(item => <tr key={item.ordinal_position}><td>{item.column_name}</td></tr>);
  
  return (
    <table style={{border: "1px solid grey"}}>
      <tr><th>{name}</th></tr>
      {columnComps}
    </table>
  );
}

export default Table;