import { fetchDatabases, fetchSchemas } from "../../api/Api";
import { OpTypes } from "../../types/opTypes";
import { Operation } from "./Operation";

export const getDatabases = new Operation(OpTypes.getDatabases, fetchDatabases)

export const getSchemas = new Operation(OpTypes.getSchemas, fetchSchemas)