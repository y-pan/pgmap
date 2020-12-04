import { FormControl, Select, MenuItem } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { DataTypes } from "../../api/type";
import {
  defaultWhereOpIndexByDataType,
  validWhereOpsByDataType,
  WhereOps,
} from "../dbMap/DataUtil";

interface Props {
  dataType: DataTypes;
  onSelect: (op: WhereOps) => void;
}

const OpSelect: React.FC<Props> = ({ onSelect, dataType }) => {
  const [selected, setSelected] = useState(
    defaultWhereOpIndexByDataType(dataType)
  );

  useEffect(() => setSelected(defaultWhereOpIndexByDataType(dataType)), [
    dataType,
  ]);

  return (
    <FormControl>
      <Select style={{ textAlign: "center" }} value={selected}>
        {validWhereOpsByDataType(dataType).map((op, index) => (
          <MenuItem
            dense
            key={index}
            value={index}
            onClick={() => {
              setSelected(index);
              onSelect(op);
            }}
          >
            {op}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default OpSelect;
