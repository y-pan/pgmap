import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { useDispatch, useSelector } from "react-redux";
import {
  getFocusTable,
  getTables,
  getTablesStatus,
} from "../../store/selectors/tables";
import { LoadingStatus } from "../../store/reducers/types";
import { TableItem } from "../../api/type";
import { setFocusTableSaga } from "../../store/actions/tables";
import { wrapText } from "../dbMap/UiUtil";

export default function SelectedListItem() {
  const dispatch = useDispatch();
  const tables = useSelector(getTables);
  const tablesStatus = useSelector(getTablesStatus);
  const focusTable = useSelector(getFocusTable);

  const onClickTable = (table: TableItem) => {
    focusTable !== table.table_name &&
      dispatch(setFocusTableSaga(table.table_name));
    window.scrollTo(0, 0);
  };

  if (tablesStatus === LoadingStatus.INITIAL) {
    return <div>Please select a schema first.</div>;
  }
  if (tablesStatus === LoadingStatus.REQUESTED) {
    return <div>Loading tables...</div>;
  }
  if (tablesStatus === LoadingStatus.FAILED) {
    return <div>Failed to load tables!</div>;
  }

  let tableList: JSX.Element[] = [];
  if (!tables || tables.length === 0) {
    tableList = [
      <ListItem key={-1} button>
        <ListItemText secondary="No Table" />
      </ListItem>,
    ];
  } else {
    tableList = tables.map((table, index) => (
      <ListItem
        key={index}
        button
        dense
        selected={table.table_name === focusTable}
        onClick={() => onClickTable(table)}
      >
        <ListItemText
          primary={wrapText(table.table_name, "14px Roboto", 168)}
        />
      </ListItem>
    ));
  }

  return (
    <div>
      <List component="nav">{tableList}</List>
    </div>
  );
}
