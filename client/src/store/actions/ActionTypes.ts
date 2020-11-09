
/**
 * @summary gets actionsTypes of: *_saga, *_requested, *_succeeded, *_failed
 */
export function actionTypesOf(namespace: string, actionType: string): string[] {
  return [
    `[${namespace}] ${actionType}_saga`,
    `[${namespace}] ${actionType}_requested`,
    `[${namespace}] ${actionType}_succeeded`,
    `[${namespace}] ${actionType}_failed`,
  ];
}

export interface Action<T> {
  type: string;
  payload?: T;
}

export type SimpleAction = Action<any>;