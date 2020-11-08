import { ConstraintItem, ConstraintResponse, FetchResponse, SchemaItem, SchemaResponse, TableItem, TableResponse } from "./type";
import { queryOf } from "./Utils";

const baseUrl = 'http://localhost:8000/api';

const urlOf = (uri: string = ''): string => {
    const baseUrlNoEndSlash = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const urlNoBeginSlash = uri.startsWith('/') ? uri.slice(1) : uri;
    return `${baseUrlNoEndSlash}/${urlNoBeginSlash}`
}

function handleResponse<T>(res: Response): Promise<FetchResponse<T>> {
    if (res.ok) return res.json();
    return Promise.reject(res.json());
}

export const fetchSchemas = async (): Promise<SchemaResponse> => {
    const url = urlOf('schemas');
    // console.log("fetchSchemas: ", url)
    return handleResponse(await fetch(url));
}

export const fetchTables = async (schema?: string): Promise<TableResponse> => {
    const tableQuery = queryOf({schema});
    const uri = `tables${tableQuery}`;
    const url = urlOf(uri);
    // console.log("fetchTables: ", url)
    return handleResponse<any>(await fetch(url));
}

export const fetchConstraints = async (schema?: string, table?: string): Promise<ConstraintResponse> => {
    const constraintQuery = queryOf({schema, table});
    const uri = `constraints${constraintQuery}`;
    const url = urlOf(uri);
    console.log("fetchConstraints", url);
    return handleResponse<any>(await fetch(url));
}

