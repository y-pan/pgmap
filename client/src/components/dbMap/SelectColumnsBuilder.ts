import { SMap } from "../../util/utils";

interface TableItem {
  name: string;
  alias: string;
  columns: string[];
}

class SelectColumnsBuilder {
  private table2Alias: SMap<string> = {}; // A set is enough for SelectColumnBuilder, but a map is also convenient for whereBuilder
  private tableItems: TableItem[] = [];

  add(tableName, tableAlias, columns: string[]): SelectColumnsBuilder {
    if (!!this.table2Alias[tableName]) {
      return; // no need of duplication
    }
    this.table2Alias[tableName] = tableAlias;
    this.tableItems.push({
      name: tableName,
      alias: tableAlias,
      columns: columns,
    });
    return this;
  }

  private columnQueryOf(
    name: string,
    alias: string,
    columns: string[]
  ): string {
    return (
      columns
        // .map((col) => `${alias}.${col} AS ${name}__${col}`)
        .map((col) => `${alias}.${col} AS ${alias}__${col}`) // with alias_col, easier to manually app where clause
        .join(", ")
    );
  }

  getTableAlias(): SMap<string> {
    // useful for whereColumn builder
    return this.table2Alias;
  }

  build(): string {
    const query = this.tableItems.map(({ name, alias, columns }) =>
      this.columnQueryOf(name, alias, columns)
    ).join(`,
    `);
    return query ? `SELECT\n    ${query}` : "";
  }
}

export default SelectColumnsBuilder;
