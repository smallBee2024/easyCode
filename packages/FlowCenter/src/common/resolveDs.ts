// 数据源结构处理方法（从apihub过来的）

import { type IDataType, type ReqParam } from '../types'
import { guid } from './helper'
import { message } from 'ant-design-vue'
// import { type FieldType } from '../materials/resource/dicts'
// 不同类型参数的默认值
export const defaultValues = {
  string: '',
  number: 0,
  integer: 0,
  boolean: false,
  null: null,
  object: {},
  array: []
}
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
// 兼容获取下类型
export const getParamType = (item: any) => {
  return item.paramType
    ? item.paramType === 'integer'
      ? 'number'
      : item.paramType === 'ref'
      ? 'object'
      : item.paramType
    : 'string'
}
// 单传解构解析（后端的响应）
export const analysisRes = (data: any[]) => {
  const generatorRow = (rows: any[]) => {
    const result: any[] = []
    rows.forEach((r: any) => {
      const temp: Record<string, any> = {}
      temp.id = r?.id
      if (r?.paramKey) {
        // 如果字段名含有，构建一个{name:string;dataType:IDataType;[prop:string]: any}的类型
        temp.name = r?.paramKey
        temp.description = r?.description
        temp.dataType = {
          type: getParamType(r)
        }
      } else {
        temp.type = getParamType(r)
      }
      if (r.refModelId) {
        if (temp.dataType) {
          temp.dataType = {
            type: 'structureObject',
            reference: {
              id: r.refModelId,
              name: r.refModelKey
            }
          }
        } else {
          // 引用类型(不再向下调用)
          temp.type = 'structureObject'
          temp.reference = {
            id: r.refModelId,
            name: r.refModelKey
          }
        }
      } else {
        // 普通类型
        if ('object' === r?.paramType && r?.children?.length > 0) {
          if (temp.dataType) {
            temp.dataType.itemTypes = generatorRow(r.children)
          } else {
            temp.itemTypes = generatorRow(r.children)
          }
        } else if ('array' === r?.paramType && r?.children?.length > 0) {
          if (temp.dataType) {
            temp.dataType.itemTypes = generatorRow(r.children.slice(0))
          } else {
            temp.itemTypes = generatorRow(r.children.slice(0))
          }
        } else {
          // 加一个叶子节点isLeaf为true
          temp.isLeaf = true
        }
      }
      result.push(temp)
    })
    return result
  }
  return generatorRow(data)
}
// 数据源树结构转换为json
export const datasource2Json = (treeData: any[]) => {
  // 单个类型判断处理（string,number,boolean,null,array,object）
  const getPerTypeItem = (target: Record<string, any>) => {
    const children = target.children
    let temp = target.source || defaultValues[target.targetDataType?.type]
    if (['array', 'object'].includes(target.targetDataType?.type) && children.length > 0) {
      if ('array' === target.targetDataType?.type) {
        temp = []
        temp = children.map((item: any) => {
          return getPerTypeItem(item)
        })
      } else {
        temp = {}
        children.forEach((item: any) => {
          temp[item.target] = getPerTypeItem(item)
        })
      }
    }
    return temp
  }
  return getPerTypeItem(treeData)
}

// json转换为数据源树结构
export const json2Datasource = (jsonData: any) => {
  try {
    let jsonTree: ReqParam[] = []
    // 单个类型判断处理（string,number,boolean,null,array,object）
    const getPerTypeItem = (
      target: Record<string, any>,
      option: {
        pType?: any
        outKey?: string
        isRoot?: boolean
        key?: string
        index?: number
      }
    ) => {
      const val = option?.key ? target[option.key] : target
      const item: ReqParam = {
        id: 'param_' + guid(),
        targetType: 'value',
        target: option.outKey || option.key || '',
        targetDataType: { type: 'string' },
        sourceType: 'value', // 默认值类型
        pType: option?.pType, // 存一个上级类型
        source: val,
        isRoot: option?.isRoot
      }
      // 新增时候默认值设定(String- '', number-0, boolean-false, null-null, array-[], object-{})
      switch (Object.prototype.toString.call(val)) {
        // 字符串，布尔处理为文本
        case '[object String]': {
          item.targetDataType.type = 'string'
          break
        }
        case '[object Boolean]': {
          item.targetDataType.type = 'boolean'
          break
        }
        case '[object Number]': {
          item.targetDataType.type = 'number'
          break
        }
        // 空
        case '[object Undefined]':
        case '[object Null]': {
          item.targetDataType.type = 'null'
          break
        }
        // 对象或数组递归处理
        case '[object Object]':
        case '[object Array]': {
          item.children = []
          if (Array.isArray(val)) {
            item.targetDataType.type = 'array'
            item.source = `${option.isRoot ? 'array' : ''}{${val.length} item${val.length > 1 ? 's' : ''}}`
            if (val.length > 0) {
              item.children = val.map((tItem: any, index: number) => {
                return getPerTypeItem(tItem, { outKey: `item ${index}`, pType: 'array' })
              })
            }
          } else if (typeof target === 'object') {
            item.targetDataType.type = 'object'
            item.source = `${option.isRoot ? 'object' : ''}{${Object.keys(val).length} key${
              Object.keys(val).length > 1 ? 's' : ''
            }}`
            if (Object.keys(val).length > 0) {
              item.children = Object.keys(val).map((tKey: string) => {
                return getPerTypeItem(val, { key: tKey, pType: 'object' })
              })
            }
          }

          break
        }
      }
      return item
    }
    if (jsonData) {
      jsonTree = [getPerTypeItem(jsonData, { isRoot: true })]
      return jsonTree
    }
  } catch (error) {
    // parseErrorMsg.value = error as string;
    message.warning('json格式错误，请重新输入!')
  }
}

// 将首字母转成大写

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
// 转换字符串
export const dataTransform2Str = (info: any) => {
  return info instanceof Object ? JSON.stringify(info) : info
}
export const strTransform2Data = (str: string) => {
  try {
    const result = JSON.parse(str)
    return result
  } catch (error) {
    return str
  }
}
// 去除json 多余空格
export const removeSpacesInJson = (jsonStr: any) => {
  if (typeof jsonStr === 'string') {
    // 使用正则表达式匹配括号、逗号和冒号周围的空格
    const regex = /(\{|\[|:|,)\s+|(\s+)(\}|\]|:)/g
    // 使用 replace() 方法替换所有匹配到的空格
    return jsonStr.replace(regex, '$1$3')
  }
  return jsonStr
}
