import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unsetFocusTableSucceeded } from "../../store/actions/tables";
import { getFocusTable } from "../../store/selectors/tables";
import { Button } from "@material-ui/core";
import Search from "../search/Search";
import { getQueryData } from "../../store/selectors/calcs";
import { getCurrent } from "../../store/selectors/schemas";
import { generateSelectJoinWhereQuery } from "../dbMap/DataUtil";
// todo: remove query out of store
const DbMapTHead: React.FC = () => {
  const dispatch = useDispatch();
  const [isCopiedHidden, setIsCopiedHidden] = useState(true);
  const schema = useSelector(getCurrent);
  const focusTable = useSelector(getFocusTable);
  const [query, setQuery] = useState("");
  const { t2Cols, focusConstraints } = useSelector(getQueryData);
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

  useEffect(() => {
    if (schema && focusTable && t2Cols && focusConstraints) {
      const newQuery = generateSelectJoinWhereQuery(
        schema,
        focusTable,
        focusConstraints,
        t2Cols
      );
      setQuery(newQuery);
    }
  }, [schema, focusTable, t2Cols, focusConstraints]);

  return (
    <thead>
      <tr>
        <th id="table-list" className="valign-bottom">
          <Button
            style={{ display: "block", margin: "0px auto" }}
            color={"primary"}
            disabled={!focusTable}
            onClick={() => dispatch(unsetFocusTableSucceeded())}
          >
            Deselect
          </Button>
          <Search />
        </th>
        <th className="query-box">
          Select (Join) Query:
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
  );
};

export default DbMapTHead;
