import { State } from "../reducers";
import { LoadingStatus } from "../reducers/types";

export const getQueryData = ({ calcs }: State) => ({
  whereableT2Cols: calcs.whereableT2Cols,
  focusConstraints: calcs.focusConstraints,
});
export const getQueryDataSucceeded = ({ calcs }: State) =>
  calcs.focusConstraintsStatus === LoadingStatus.SUCCEEDED &&
  calcs.whereableT2ColsStatus === LoadingStatus.SUCCEEDED;

export const getQueryDataFailed = ({ calcs }: State) =>
  calcs.focusConstraintsStatus === LoadingStatus.FAILED ||
  calcs.whereableT2ColsStatus === LoadingStatus.FAILED;

export const getQueryDataRequested = ({ calcs }: State) =>
  calcs.focusConstraintsStatus === LoadingStatus.REQUESTED ||
  calcs.whereableT2ColsStatus === LoadingStatus.REQUESTED;

export const getWhereData = ({ calcs }: State) => calcs.whereData;
