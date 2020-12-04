import React from "react";
import { DataTypes } from "../../api/type";
import WithX from "../../containers/WithX/WithX";
import { isNil, nonNil } from "../../util/utils";
import {
  ColumnItemExtended,
  DEFAULT_OP,
  WhereColumnValue,
  WhereOps,
} from "../dbMap/DataUtil";
import { isNumericDataType } from "./WhereColumnValueBuilder";
import OpSelect from "./OpSelect";

interface Props {
  handleWhere: (table: string, columnData: WhereColumnValue[]) => void;
}

interface States {
  column?: ColumnItemExtended;
  x: number;
  y: number;
  isHidden: boolean;
  value: string;
  op: WhereOps;
  error?: string;
}

class WhereColumnBuilderMenu extends React.Component<Props, States> {
  constructor(props) {
    super(props);
    this.state = {
      column: undefined,
      x: 0,
      y: 0,
      isHidden: true,
      op: DEFAULT_OP,
      value: "",
    };
  }

  show(column: ColumnItemExtended, x: number, y: number): void {
    this.setState({
      x: x + window.scrollX,
      y: y + window.scrollY,
      column,
      isHidden: false,
      value: "",
      error: "",
    });
  }

  hide(): void {
    this.setState({
      isHidden: true,
    });
  }

  render() {
    if (!this.state.column) return null;
    const { column_name, data_type } = this.state.column;
    const name = (
      <span>
        <strong>{column_name}</strong>
      </span>
    );
    const type = (
      <span style={{ marginLeft: 5, marginRight: 5, fontStyle: "italic" }}>
        {data_type}
      </span>
    );

    return (
      <div
        id="whereMenu"
        className="whereColumnMenu"
        style={{
          left: this.state.x,
          top: this.state.y,
          display: this.state.isHidden ? "none" : "block",
        }}
      >
        <WithX onClick={() => this.hide()}>
          {name}
          <OpSelect onSelect={(op) => this.setState({ op: op })} />
          <input
            value={this.state.value}
            onChange={(event) => this.onChangeValue(event.target.value)}
          />
          {type}
          <button onClick={() => this.build()}>Update Where Clause</button>
        </WithX>
      </div>
    );
  }

  private onChangeValue(value: string): void {
    // this.state.column.
    this.setState({ value: value.trim() });
  }

  private build(): void {
    const { table_name, column_name, data_type } = this.state.column;

    const columnValue: WhereColumnValue = {
      table: table_name,
      column: column_name,
      dataType: data_type,
      op: this.state.op,
      value: this.valueOf(this.state.value, this.state.op, data_type),
    };
    this.props.handleWhere(table_name, [columnValue]);
  }

  private valueOf(
    valueStr: string,
    op: WhereOps,
    dataType: DataTypes
  ): string | string[] | number | number[] {
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
  }
}

export default WhereColumnBuilderMenu;
