interface TableItem {
  name: string;
  alias: string;
  columns: string[];
}

class SelectColumnsBuilder {
  private tables: Set<string> = new Set();
  private tableItems: TableItem[] = [];

  add(tableName, tableAlias, columns: string[]): SelectColumnsBuilder {
    if (this.tables.has(tableName)) {
      return; // no need of duplication
    }
    this.tables.add(tableName);
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
        .map((col) => `${alias}.${col} AS ${alias}_${col}`) // with alias_col, easier to manually app where clause
        .join(", ")
    );
  }

  build(): string {
    const query = this.tableItems.map(({ name, alias, columns }) =>
      this.columnQueryOf(name, alias, columns)
    ).join(`
    ,`);
    return query
      ? `SELECT 
    ${query}`
      : "";
  }
}

export default SelectColumnsBuilder;
