import { SMap } from "../../util/utils";
import { getOpValueString, WhereColumnValue } from "../dbMap/DataUtil";

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
