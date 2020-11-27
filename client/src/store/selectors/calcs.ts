import { State } from "../reducers";
import { LoadingStatus } from "../reducers/types";

export const getQueryData = ({ calcs }: State) => ({
  t2Cols: calcs.t2Cols,
  focusConstraints: calcs.focusConstraints,
});
export const getQueryDataSucceeded = ({ calcs }: State) =>
  calcs.focusConstraintsStatus === LoadingStatus.SUCCEEDED &&
  calcs.t2ColsStatus === LoadingStatus.SUCCEEDED;

export const getQueryDataFailed = ({ calcs }: State) =>
  calcs.focusConstraintsStatus === LoadingStatus.FAILED ||
  calcs.t2ColsStatus === LoadingStatus.FAILED;

export const getQueryDataRequested = ({ calcs }: State) =>
  calcs.focusConstraintsStatus === LoadingStatus.REQUESTED ||
  calcs.t2ColsStatus === LoadingStatus.REQUESTED;
