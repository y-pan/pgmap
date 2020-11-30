import { Button } from "@material-ui/core";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataTypes } from "../../api/type";
import { setWhereData } from "../../store/actions/calcs";
import { getQueryData } from "../../store/selectors/calcs";
import { getFocusTable } from "../../store/selectors/tables";
import { WhereOps } from "../dbMap/DataUtil";

const WhereBuilder: React.FC = () => {
  const dispatch = useDispatch();

  const focusTable = useSelector(getFocusTable);
  const { whereableT2Cols, focusConstraints } = useSelector(getQueryData);
  if (!focusTable || !whereableT2Cols) return null;

  const tables = Object.keys(whereableT2Cols);
  const useDummy = false;

  const dummyWhereColumnValue = {
    address: [
      {
        table: "address",
        column: "id",
        op: WhereOps.NE,
        value: 21,
        dataType: DataTypes.BIGINT,
      },
      {
        table: "address",
        column: "profile_id",
        op: WhereOps.IN,
        value: [6, 7, 8, 9, 10],
        dataType: DataTypes.BIGINT,
      },
    ],
    province: [
      {
        table: "province",
        column: "name",
        op: WhereOps.IN,
        value: ["AB"],
        dataType: DataTypes.VARCHAR,
      },
    ],
  };
  return useDummy ? (
    <Button onClick={() => dispatch(setWhereData(dummyWhereColumnValue))}>
      Add dummy where
    </Button>
  ) : null;
};

export default WhereBuilder;
