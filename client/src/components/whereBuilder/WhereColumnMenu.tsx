import React from "react";
import WithX from "../../containers/WithX/WithX";
import { ColumnItemExtended, WhereColumnValue } from "../dbMap/DataUtil";

import WhereColumnMenuTable from "./WhereColumnMenuTable";

interface Props {
  handleWhere: (table: string, columnData: WhereColumnValue[]) => void;
}

interface States {
  column?: ColumnItemExtended;
  x: number;
  y: number;
  isHidden: boolean;
}

const MAX_WIDTH = 560;
const MAX_HEIGHT = 270;

class WhereColumnBuilderMenu extends React.Component<Props, States> {
  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: 0,
      isHidden: true,
    };

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  show(column: ColumnItemExtended, x: number, y: number): void {
    const x1 = x + window.scrollX;
    const y1 = y + window.scrollY;
    console.log("POSX", x1, MAX_WIDTH, window.innerWidth);
    console.log("POSY", y1, MAX_HEIGHT, window.innerHeight);
    this.setState({
      x: Math.min(x1, window.innerWidth - MAX_WIDTH),
      y: Math.min(y1, window.innerHeight - MAX_HEIGHT),
      column,
      isHidden: false,
    });
  }

  hide(): void {
    this.setState({
      isHidden: true,
    });
  }

  render() {
    if (!this.state.column) return null;
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
        <WithX onClick={this.hide}>
          <WhereColumnMenuTable
            onClose={this.hide}
            column={this.state.column}
          />
        </WithX>
      </div>
    );
  }
}

export default WhereColumnBuilderMenu;
