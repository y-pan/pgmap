import { combineReducers } from "redux";
import schemas from "./schemas";
import tables from "./tables";
import columns from "./columns";
import constraints from "./constraints";
import search from "./search";
import calcs from "./calcs";
import databases from "./databases";
import operations from './operations';

const rootReducer = combineReducers({
  operations,
  databases,
  schemas,
  tables,
  columns,
  constraints,
  search,
  calcs,
});

export type State = ReturnType<typeof rootReducer>;

export default rootReducer;
