import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrent } from '../../store/selectors/schemas';
import { getTables, getTablesStatus } from '../../store/selectors/tables';
import { LoadingStatus } from '../../store/reducers/types';
import { TableItem } from '../../api/type';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
  }),
);

export default function SelectedListItem() {
  const dispatch = useDispatch();
  const currentSchema = useSelector(getCurrent);
  const tables = useSelector(getTables);
  const tablesStatus = useSelector(getTablesStatus);
  const currentTable = 'address' as any;
  
  const classes = useStyles();
  // const [selectedIndex, setSelectedIndex] = React.useState(1);


  const onClickTable = (
    table: TableItem,
  ) => {
    // setSelectedIndex(index);
  };

  if (tablesStatus === LoadingStatus.INITIAL) {
    return <div>Please select a schema first.</div>
  }
  if (tablesStatus === LoadingStatus.REQUESTED) {
    return <div>Loading tables...</div>
  }
  if (tablesStatus === LoadingStatus.FAILED) {
    return <div>Failed to load tables!</div>
  }

  let tableList: JSX.Element[] = [];
  if (!tables || tables.length === 0) {
    tableList = [
      <ListItem
          button
        >
          <ListItemText secondary="No Table" />
      </ListItem>
    ]
  } else {
    tableList = tables.map((table, index) => (
      <ListItem 
          key={index}
          button
          dense
          selected={table == currentTable}
          onClick={() => onClickTable(table)}>
          <ListItemText primary={table.table_name}/>
      </ListItem>
    ))
  }

  return (
    <div className={classes.root}>
      {/* <Divider /> */}
      <List component="nav">
        {tableList}
      </List>
    </div>
  );
}
