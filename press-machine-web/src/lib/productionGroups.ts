// 生産グループの名称マッピング
export const PRODUCTION_GROUP_NAMES: Record<number, string> = {
  1: '生産1',
  2: '生産2',
  3: '生産3',
  30: '東大阪',
  32: '本社'
}

// 生産グループIDから名称を取得
export function getProductionGroupName(groupId: number): string {
  return PRODUCTION_GROUP_NAMES[groupId] || `グループ${groupId}`
}

// 利用可能な生産グループの選択肢を取得
export function getProductionGroupOptions() {
  return Object.entries(PRODUCTION_GROUP_NAMES).map(([id, name]) => ({
    value: parseInt(id),
    label: name
  }))
}