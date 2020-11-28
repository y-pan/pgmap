import { DataTypes } from "../../api/type";
import { asArray } from "../../util/arrayUtil";
import { SMap } from "../../util/utils";
import { WhereColumnValue, WhereOps } from "./DataUtil";

type WhereValueType = string | number | string[] | number[]; // this string/number doesn't decide the actual type, just for typescript

export default class WhereColumnValueBuilder {
  private _tableAlias: SMap<string>;
  private _tableColumnValues: SMap<WhereColumnValue[]>;

  tableAlias(tableAliasMap: SMap<string>): WhereColumnValueBuilder {
    this._tableAlias = tableAliasMap;
    return this;
  }

  tableColumnValues(
    tableColumnValueMap: SMap<WhereColumnValue[]>
  ): WhereColumnValueBuilder {
    this._tableColumnValues = tableColumnValueMap;
    return this;
  }

  build(): string {
    if (!this._tableColumnValues) return "";
    const columnValueStrs: string[] = [];

    for (let tableName in this._tableColumnValues) {
      // _tableColumnValues being a map to group columnValues by table, makes query friendly for eyes
      const columnValueList: WhereColumnValue[] = this._tableColumnValues[
        tableName
      ];
      if (!columnValueList) {
        continue;
      }
      const tname: string = this._tableAlias[tableName];
      if (!tname) {
        // console.warn(
        //   `Column Value won't apply to WHERE due to table ${tableName} not available in table alias map ${JSON.stringify(
        //     this._tableAlias
        //   )}`
        // );
        continue;
      }
      for (let columnValue of columnValueList) {
        const { column, op, value, dataType } = columnValue; // it has 'table' attribute, same as the tableName
        columnValueStrs.push(
          `${tname}.${column} ${getOpValueString(op, value, dataType)}`
        );
      }
    }

    const queryNoWhere: string = columnValueStrs.join(`\n    AND `);

    return !queryNoWhere ? "" : `WHERE \n    ${queryNoWhere}`;
  }
}

function shouldQuote(dataType: DataTypes): boolean {
  switch (dataType) {
    case DataTypes.NUMERIC:
    case DataTypes.INT:
    case DataTypes.BIGINT:
    case DataTypes.SMALLINT:
    case DataTypes.DOUBLE_PRECISION:
    case DataTypes.MONEY:
    case DataTypes.REAL:
    case DataTypes.BOOLEAN:
      return false;
    default:
      return true;
  }
}

function quoteIfNeeded(value: any, dataType: DataTypes): string {
  return shouldQuote(dataType) ? `'${value}'` : value;
}

function getOpValueString(
  op: WhereOps,
  value: WhereValueType,
  dataType: DataTypes
): string {
  let finalValue;
  if (op === WhereOps.IN || op === WhereOps.NOT_IN) {
    const values = asArray(value);
    const joinQuoted = values
      .map((val) => quoteIfNeeded(val, dataType))
      .join(","); // 'val1','val2','val3'
    finalValue = `( ${joinQuoted} )`; // ( 'val1','val2','val3' )
  } else {
    // For `LIKE`, `ILIKE`, `NOT LIKE`, `NOT ILIKE`,
    // we expect user already put in the matching symbols in value (%), to be simple in code, and flexible in search
    finalValue = quoteIfNeeded(value, dataType); // 'val'
  }

  return `${op} ${finalValue}`; // IN ( 'val1','val2','val3' );    = 'val'
}
