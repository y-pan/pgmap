import { ColumnItem } from "../../api/type";
import {
  ConstraintItemExtended,
  WhereColumnValue,
} from "../../components/dbMap/DataUtil";
import { SMap } from "../../util/utils";
import { actionsOf, simpleActionOf } from "./actionUtil";

const NAMESPACE = "Calcs";

export const {
  types: [
    setQueryDataActionSaga,
    setQueryDataActionRequested,
    setQueryDataActionSucceeded,
    setQueryDataActionFailed,
  ],
  creators: [
    setQueryDataSaga,
    setQueryDataRequested,
    setQueryDataSucceeded,
    setQueryDataFailed,
  ],
} = actionsOf<{
  t2Cols: SMap<ColumnItem[]>;
  focusConstraints: ConstraintItemExtended[];
}>(NAMESPACE, "setQueryData");

export const {
  type: setWhereDataAction,
  creator: setWhereData,
} = simpleActionOf<SMap<WhereColumnValue[]>>(NAMESPACE, "setWhereData");

export const {
  type: unsetWhereDataAction,
  creator: unsetWhereData,
} = simpleActionOf<void>(NAMESPACE, "unsetWhereData");
