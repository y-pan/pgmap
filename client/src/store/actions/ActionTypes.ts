
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

export function actionTypeOf(namespace: string, actionName: string): string {
    return `[${namespace}] ${actionName}`; // simple action
}

export interface Action<T> {
  type: string;
  payload?: T;
}

export type SimpleAction = Action<any>;