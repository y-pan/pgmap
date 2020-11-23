import { Action } from "../actions/actionTypes";
import {
  searchActionFailed,
  searchActionRequested,
  searchActionSucceeded,
} from "../actions/search";
import { LoadingStatus } from "./types";

export interface SearchState {
  searchStatus: LoadingStatus;
  searchResult: string[];
}

const initialState: SearchState = {
  searchStatus: LoadingStatus.INITIAL,
  searchResult: [],
};

const searchReducer = (
  state = initialState,
  action: Action<any>
): SearchState => {
  switch (action.type) {
    case searchActionRequested:
      return {
        ...state,
        searchStatus: LoadingStatus.REQUESTED,
        searchResult: [],
      };
    case searchActionSucceeded:
      return {
        ...state,
        searchStatus: LoadingStatus.SUCCEEDED,
        searchResult: action.payload,
      };
    case searchActionFailed:
      return {
        ...state,
        searchResult: [],
        searchStatus: LoadingStatus.FAILED,
      };
    default:
      return state;
  }
};

export default searchReducer;
