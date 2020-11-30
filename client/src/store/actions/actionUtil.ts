/**
 * @summary gets actionsTypes of: *_saga, *_requested, *_succeeded, *_failed
 */
export function actionTypesOf(namespace: string, actionName: string): string[] {
  // async actions
  return [
    `[${namespace}] ${actionName}_saga`,
    `[${namespace}] ${actionName}_requested`,
    `[${namespace}] ${actionName}_succeeded`,
    `[${namespace}] ${actionName}_failed`,
  ];
}

export type ActionCreator<T> = (payload?: T) => Action<T>;

export function simpleActionTypeOf(
  namespace: string,
  actionName: string
): string {
  return `[${namespace}] ${actionName}_simple`; // no async, no saga
}

export function actionCreatorsOf<T>(actionTypes: string[]): ActionCreator<T>[] {
  const [
    actionSaga,
    actionRequested,
    actionSucceeded,
    actionFailed,
  ] = actionTypes;

  const saga = (payload?: T) => ({ type: actionSaga, payload });
  const requested = (payload?: T) => ({ type: actionRequested, payload });
  const succeeded = (payload?: T) => ({ type: actionSucceeded, payload });
  const failed = (payload?: T) => ({ type: actionFailed, payload });

  return [saga, requested, succeeded, failed];
}

export function simpleActionCreatorOf<T>(actionType: string): ActionCreator<T> {
  const simpleCreator = (payload?: T) => ({ type: actionType, payload });
  return simpleCreator;
}

/** @summary returns *_saga, *_requested, *_succeeded, *_failed; *_sagaCreator, *_requestedCreator, *_succeededCreator, *_failedCreator,
 *
 */
export function actionsOf<T>(
  namespace: string,
  actionName: string
): { types: string[]; creators: ActionCreator<T>[] } {
  const types: string[] = actionTypesOf(namespace, actionName);
  const creators = actionCreatorsOf<T>(types);
  return { types, creators };
}

export function simpleActionOf<T>(namespace: string, actionName: string) {
  const actionType: string = simpleActionTypeOf(namespace, actionName);
  const actionCreator: ActionCreator<T> = simpleActionCreatorOf<T>(actionType);
  return { type: actionType, creator: actionCreator };
}
export interface Action<T> {
  type: string;
  payload?: T;
}

export type SimpleAction = Action<any>;
