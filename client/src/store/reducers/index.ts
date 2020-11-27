import { combineReducers } from "redux";
import schemas from "./schemas";
import tables from "./tables";
import columns from "./columns";
import constraints from "./constraints";
import search from "./search";
import calcs from "./calcs";

const rootReducer = combineReducers({
  schemas,
  tables,
  columns,
  constraints,
  search,
  calcs,
});

export type State = ReturnType<typeof rootReducer>;

export default rootReducer;
