import {
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
} from "@material-ui/core";
import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFocusTableSaga } from "../../store/actions/tables";
import { LoadingStatus } from "../../store/reducers/types";
import { getSearchResult, getSearchStatus } from "../../store/selectors/search";
import { isEmpty } from "../../util/utils";
import { SearchUiContext } from "./Search";

const SearchResult: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const { searchResultAnchorElem } = useContext(SearchUiContext);
  const searchResult = useSelector(getSearchResult);
  const searchStatus = useSelector(getSearchStatus);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (
      searchStatus === LoadingStatus.SUCCEEDED &&
      searchResult &&
      searchResult.length > 0
    ) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [searchResult, searchStatus]);

  const handleClickItem = (event: any, table: string) => {
    event.stopPropagation();
    event.preventDefault();
    setOpen(false);
    dispatch(setFocusTableSaga(table));
  };

  const listItems: JSX.Element[] = isEmpty(searchResult)
    ? []
    : searchResult.map((tableName, index) => (
        <MenuItem
          style={{ zIndex: 2000 }}
          key={index}
          onClick={(event) => handleClickItem(event, tableName)}
        >
          {tableName}
        </MenuItem>
      ));
  return (
    <Popper
      open={open}
      anchorEl={searchResultAnchorElem}
      role={undefined}
      transition
      disablePortal
    >
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin:
              placement === "bottom" ? "center top" : "center bottom",
          }}
        >
          <Paper>
            <ClickAwayListener onClickAway={() => setOpen(false)}>
              <MenuList
                style={{ zIndex: 2000 }}
                autoFocusItem={open}
                id="menu-list-grow"
              >
                {listItems}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
};

export default SearchResult;
