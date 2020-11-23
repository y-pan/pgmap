import { State } from "../reducers";

export const getSearchResult = ({ search }: State) => search.searchResult;
export const getSearchStatus = ({ search }: State) => search.searchStatus;
