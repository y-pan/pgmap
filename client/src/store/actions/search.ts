import { actionTypesCreatorsOf } from "./actionTypes";

const NAMESPACE = "Search";

export interface SearchPayload {
  searchBy?: string;
  searchResult?: string[];
}
export const {
  types: [
    searchActionSaga,
    searchActionRequested,
    searchActionSucceeded,
    searchActionFailed,
  ],
  creators: [searchSaga, searchRequested, searchSucceeded, searchFailed],
} = actionTypesCreatorsOf<any>(NAMESPACE, "search");
