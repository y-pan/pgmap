import { ClickAwayListener, TextField } from "@material-ui/core";
import React, { useContext, useRef } from "react";
import { ChangeEvent } from "react";
import { useDispatch } from "react-redux";
import { searchSaga } from "../../store/actions/search";
import { SearchUiContext } from "./Search";

const SearchInput: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const searchUiContext = useContext(SearchUiContext);
  const searchByRef = useRef("");
  const wasFocusRef = useRef(false);

  return (
    <ClickAwayListener
      onClickAway={() => {
        wasFocusRef.current = false;
      }}
    >
      <TextField
        label="Search"
        ref={(ref) => (searchUiContext.searchResultAnchorElem = ref)}
        onClick={() => {
          !wasFocusRef.current &&
            searchByRef.current &&
            dispatch(searchSaga(searchByRef.current));
          wasFocusRef.current = true;
        }}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const searchBy: string = event.target.value.trim();
          searchByRef.current = searchBy;
          wasFocusRef.current = true;
          dispatch(searchSaga(searchBy));
        }}
      />
    </ClickAwayListener>
  );
};

export default SearchInput;
