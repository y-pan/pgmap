enum ValueType {
  STRING = "STRING",
  NUMBER = "NUMBER",
}

interface KeyValueTyped {
  key: string;
  value: number | string;
  type: ValueType;
}

function whereOf(keyValues: KeyValueTyped[]): string {
  if (!keyValues || keyValues.length === 0) return "";

  return keyValues.reduce((result, item) => {
    const valStr =
      item.type === ValueType.NUMBER ? item.value : `'${item.value}'`;
    result += `${item.key}=${valStr} `;
    return result;
  }, " WHERE ");
}
