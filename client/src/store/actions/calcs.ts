import { ColumnItem } from "../../api/type";
import { ConstraintItemExtended } from "../../components/dbMap/DataUtil";
import { SMap } from "../../util/utils";
import { actionsOf } from "./actionUtil";

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
