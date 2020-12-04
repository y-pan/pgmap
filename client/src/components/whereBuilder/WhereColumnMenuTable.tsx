import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField/TextField";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DataTypes } from "../../api/type";
import WithFooter from "../../containers/WithFooter/WithFooter";
import { setTableWhereData } from "../../store/actions/calcs";
import { nonNil, isNil } from "../../util/utils";
import { ColumnItemExtended, DEFAULT_OP, WhereOps } from "../dbMap/DataUtil";
import OpSelect from "./OpSelect";
import { getOpValueString, isNumericDataType } from "./WhereColumnValueBuilder";

interface Props {
  column: ColumnItemExtended;
  onClose: () => void;
  // onWhereData: (whereData: WhereColumnValue) => void;
}

const cleanValueOf = (
  valueStr: string,
  op: WhereOps,
  dataType: DataTypes
): string | string[] | number | number[] => {
  const trimed = valueStr.trim();
  switch (op) {
    case WhereOps.IN:
    case WhereOps.NOT_IN:
      const array = trimed.split(",");
      if (isNumericDataType(dataType)) {
        return array
          .map((valStr) => parseFloat(valStr))
          .filter((num) => nonNil(num));
      }
      return array;

    default:
      if (isNumericDataType(dataType)) {
        const num = parseFloat(valueStr);
        if (isNil(num)) {
          console.warn(
            `Data incompatible for type=${dataType}, value=${valueStr}, defaulted 0`
          );
          return 0; // bad data shape
        }
        return num;
      }

      return trimed;
  }
};

const WhereColumnMenuTable: React.FC<Props> = ({ column, onClose }) => {
  const dispatch = useDispatch();

  const [op, setOp] = useState(DEFAULT_OP);
  const [value, setValue] = useState("");
  const [cleanValue, setCleanValue] = useState<
    string | number | string[] | number[]
  >("");
  const [outpuOpValue, setOutputOpValue] = useState<string>("");
  const { table_name, column_name, data_type } = column;

  useEffect(() => {
    const newCleanValue = cleanValueOf(value, op, data_type);
    const newOutputOpValue = getOpValueString(op, newCleanValue, data_type);
    setCleanValue(newCleanValue);
    setOutputOpValue(newOutputOpValue);
  }, [data_type, op, value]);

  return (
    <WithFooter
      okText={"Update Where"}
      hasOK={true}
      hasClose={true}
      onClose={onClose}
      onOk={async () => {
        await dispatch(
          setTableWhereData([
            {
              table: table_name,
              column: column_name,
              dataType: data_type,
              op,
              value: cleanValue,
            },
          ])
        );
        onClose();
      }}
    >
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Table</TableCell>
              <TableCell>Column</TableCell>
              <TableCell>Data Type</TableCell>
              <TableCell>Operator</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell component="th" scope="row">
                {table_name}
              </TableCell>
              <TableCell>{column_name}</TableCell>
              <TableCell>{data_type}</TableCell>
              <TableCell>
                <OpSelect onSelect={(op) => setOp(op)} />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  label="Standard"
                  value={value}
                  onChange={(event) => {
                    const rawValue: string = event.target.value.trim();
                    setValue(rawValue);
                  }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={5}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  label="Where clause:"
                  value={`${table_name}.${column_name} ${outpuOpValue}`}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </WithFooter>
  );
};

export default WhereColumnMenuTable;
