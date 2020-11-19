import React from "react";
import DbMapTHead from "../dbMapTHead/DbMapTHead";

import SchemasList from "../schema/SchemaList";
import TableList from "../table/TableList";
import SchemaMap from "./SchemaMap";

const DbMap: React.FC<{}> = () => {
  return (
    <div style={{ margin: 10 }}>
      <SchemasList />
      <table>
        <DbMapTHead />

        <tbody>
          <tr>
            <td>
              <TableList />
            </td>
            <td>
              <SchemaMap />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DbMap;
