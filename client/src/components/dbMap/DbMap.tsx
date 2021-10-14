import React from "react";
import { useSelector } from "react-redux";
import { getDatabases } from "../../store/selectors/databases";
import DatabaseList from "../database/DatabaseList";
import DbMapTHead from "../dbMapTHead/DbMapTHead";

import SchemasList from "../schema/SchemaList";
import TableList from "../table/TableList";
import SchemaMap from "./SchemaMap";

const DbMap: React.FC<{}> = () => {
  const databases = useSelector(getDatabases)
  return (
    <div style={{ margin: 10 }}>
      <DatabaseList />
      {databases && databases.length > 0 && (
      <>
        <SchemasList />
        <table>
          <DbMapTHead />

          <tbody>
            <tr>
              <td>
                <TableList />
              </td>
              <td colSpan={2}>
                <SchemaMap />
              </td>
            </tr>
          </tbody>
        </table>
      </>
      )}
    </div>
  );
};

export default DbMap;
