import React, { createContext } from "react";
import SearchInput from "./SearchInput";
import SearchResult from "./SearchResult";

const searchUiCtx = {
  searchResultAnchorElem: null,
};

export const SearchUiContext = createContext(searchUiCtx);

const Search: React.FC<{}> = () => {
  return (
    <>
      <SearchUiContext.Provider value={searchUiCtx}>
        <SearchInput />
        <SearchResult />
      </SearchUiContext.Provider>
    </>
  );
};

export default Search;
