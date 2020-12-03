import { FormControl, Select, MenuItem } from "@material-ui/core";
import React, { useState } from "react";
import { allWhereOps, WhereOps } from "../dbMap/DataUtil";

interface Props {
  onSelect: (op: WhereOps) => void;
}

const OpSelect: React.FC<Props> = ({ onSelect }) => {
  const [allOps] = useState(allWhereOps());
  const [selected, setSelected] = useState(allOps.indexOf(WhereOps.ILIKE));

  return (
    <FormControl>
      {/* <InputLabel id="demo-simple-select-helper-label">Operator</InputLabel> */}
      <Select
        // labelId="demo-simple-select-helper-label"
        // id="demo-simple-select-helper"
        style={{ textAlign: "center" }}
        value={selected}
        // onChange={(event, menuItem) => {
        //   setSelected((menuItem as any).props.value);
        //   onSelect((menuItem as any).props.children);
        // }}
      >
        {allOps.map((op, index) => (
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
      {/* <FormHelperText>Operator</FormHelperText> */}
    </FormControl>
  );
};

export default OpSelect;
