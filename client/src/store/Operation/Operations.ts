import { fetchDatabases } from "../../api/Api";
import { OpTypes } from "../../types/opTypes";
import { Operation } from "./Operation";

export const getDatabases = new Operation(OpTypes.getDatabases, fetchDatabases)