

export function stateAttrOf(attrName: string): string[] {
  return [
    attrName,
    `${attrName}_status`
  ]
}

