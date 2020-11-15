import { Button } from "@material-ui/core";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unsetFocusTableSucceeded } from "../../store/actions/tables";
import { getFocusTable, getQuery } from "../../store/selectors/tables";

import SchemasList from "../schema/SchemaList";
import TableList from "../table/TableList";
import SchemaMap from "./SchemaMap";

interface Props {}

const DbMap: React.FC<Props> = (props) => {
  const dispatch = useDispatch();
  const [isCopiedHidden, setIsCopiedHidden] = useState(true);
  const focusTable = useSelector(getFocusTable);
  const query = useSelector(getQuery);

  let setIsCopiedHiddenTimeout = useRef(undefined);

  const copyToClipboard = (): void => {
    if (!query) return;
    const queryElem: any = document.getElementById("query");
    if (!queryElem) return;
    queryElem.select();
    document.execCommand("copy");
    setIsCopiedHidden(false);

    if (setIsCopiedHiddenTimeout.current) {
      clearTimeout(setIsCopiedHiddenTimeout.current);
    }
    setIsCopiedHiddenTimeout.current = setTimeout(() => {
      setIsCopiedHidden(true);
    }, 2000);
  };

  return (
    <div style={{ margin: 10 }}>
      <SchemasList />
      <table>
        <thead>
          <tr>
            <th id="table-list" className="valign-bottom">
              <Button
                color={"primary"}
                disabled={!focusTable}
                onClick={() => dispatch(unsetFocusTableSucceeded())}
              >
                Unselect
              </Button>
            </th>
            <th className="query-box">
              <textarea
                id="query"
                readOnly
                value={query || ""}
                rows={3}
                onClick={copyToClipboard}
                placeholder="-- Query --"
              />
              <pre className={"copied " + (isCopiedHidden ? "hidden" : "")}>
                Copied!
              </pre>
              {/* <Button
                disabled={!query}
                onClick={copyToClipboard}
                color="primary"
                style={{ display: "inline", verticalAlign: "inherit" }}
              >
                Copy query
              </Button> */}
            </th>
          </tr>
        </thead>
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
