import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unsetFocusTableSucceeded } from "../../store/actions/tables";
import { getFocusTable } from "../../store/selectors/tables";
import { Button } from "@material-ui/core";
import Search from "../search/Search";
import { getQueryData, getWhereData } from "../../store/selectors/calcs";
import { getCurrent } from "../../store/selectors/schemas";
import { generateSelectJoinWhereQuery } from "../dbMap/DataUtil";

const DbMapTHead: React.FC = () => {
  const dispatch = useDispatch();
  const schema = useSelector(getCurrent);
  const focusTable = useSelector(getFocusTable);
  const { whereableT2Cols, focusConstraints } = useSelector(getQueryData);
  const whereData = useSelector(getWhereData);
  // console.log("where data", whereData);
  const [query, setQuery] = useState("");
  const [isCopiedHidden, setIsCopiedHidden] = useState(true);
  const setIsCopiedHiddenTimeout = useRef(undefined);

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
    if (schema && focusTable && whereableT2Cols && focusConstraints) {
      const newQuery = generateSelectJoinWhereQuery(
        schema,
        focusTable,
        focusConstraints,
        whereableT2Cols,
        whereData
      );
      setQuery(newQuery);
    } else {
      setQuery("");
    }
  }, [schema, whereData, focusTable, whereableT2Cols, focusConstraints]);

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
        </th>
        <th>
          {/* <WhereBuilder /> */}
          {/* <div>Summary of wheres?</div> */}
        </th>
      </tr>
    </thead>
  );
};

export default DbMapTHead;
