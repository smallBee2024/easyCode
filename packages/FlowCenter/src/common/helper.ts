import type { IDataType } from '../types'
// 根据某个字段进行分组
export function groupBy<T>(list: T[], key: keyof T) {
  return list.reduce((result, item) => {
    const groupName: string = item[key] as string
    if (result[groupName]) {
      result[groupName].children.push(item)
    } else {
      result[groupName || '其他'] = { children: [item] }
    }
    return result
  }, {} as Record<string, { children: T[] }>)
}

/**
 * get random id
 */
export function guid() {
  return 'xxxxxxxx'.replace(/[x]/g, (c) => {
    const random = parseFloat('0.' + crypto.getRandomValues(new Uint32Array(1))[0])
    const r = (random * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const getEditorNodeId = (prefix = 'canvas_node_') => {
  return prefix + guid();
};

// 类型显示，兼容引用的结构体，兼容集合类型
export const getItemType = (typeInfo?: IDataType) => {
  if (!typeInfo || !typeInfo?.type) {
    return '-'
  }
  let tempDisplayType = ''

  const generatorItem = (info: IDataType, level = 0) => {
    tempDisplayType += level > 0 ? '<' : ''
    if (info.itemTypes && info.itemTypes?.length > 0) {
      tempDisplayType += info.type
      if (info.type === 'object') {
        //TODO:map处理
      } else {
        generatorItem(info.itemTypes?.[0], (level += 1))
      }
    } else {
      tempDisplayType +=
        info.type +
        (level > 0
          ? Array.from({ length: level })
              .map(() => '>')
              .join('')
          : '')
    }
  }
  if (typeInfo?.reference) {
    tempDisplayType = typeInfo?.reference?.name
  } else {
    generatorItem(typeInfo)
  }
  return tempDisplayType
}

// 将树结构数据转换成对象
export const convertTreeToObject = <T>(treeData: T[]) => {
  const result: Record<string, T & { parentId: string }> = {}
  const loop = (data: any, parentId = '') => {
    for (const item of data) {
      result[item.id] = {
        ...item,
        parentId
      }
      if (item.children && item.children.length > 0) {
        loop(item.children, item.id)
      }
    }
  }
  loop(treeData)
  return result
}
