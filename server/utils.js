var ValueType;
(function (ValueType) {
    ValueType["STRING"] = "STRING";
    ValueType["NUMBER"] = "NUMBER";
})(ValueType || (ValueType = {}));
function whereOf(keyValues) {
    if (!keyValues || keyValues.length === 0)
        return "";
    return keyValues.reduce((result, item) => {
        const valStr = item.type === ValueType.NUMBER ? item.value : `'${item.value}'`;
        result += `${item.key}=${valStr} `;
        return result;
    }, " WHERE ");
}
