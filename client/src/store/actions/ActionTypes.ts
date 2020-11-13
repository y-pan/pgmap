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

export function actionTypeOf(namespace: string, actionName: string): string {
  return `[${namespace}] ${actionName}`; // simple action
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

/** @summary returns *_saga, *_requested, *_succeeded, *_failed; *_sagaCreator, *_requestedCreator, *_succeededCreator, *_failedCreator,
 *
 */
export function actionTypesCreatorsOf<T>(
  namespace: string,
  actionName: string
): { types: string[]; creators: ActionCreator<T>[] } {
  const types: string[] = actionTypesOf(namespace, actionName);
  const creators = actionCreatorsOf<T>(types);
  return { types, creators };
}

export interface Action<T> {
  type: string;
  payload?: T;
}

export type SimpleAction = Action<any>;
