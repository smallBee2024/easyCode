import { type Component } from 'vue'
import { type IState } from './designer/useDesignerStore'
// import type { ISourceType, FieldType } from './materials/resource/dicts'

type ISourceType = any
type FieldType = any

// type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'object' | 'array' | 'function' | 'undefined'
// 类型定义
export type IDataType = {
  type?: FieldType
  reference?: { id: string; name: string }
  itemTypes?: IDataType[]
  [prop: string]: any
}
// 结构泛型(T-具体内容，R 结构类型)
export interface StructuredInfo<T = any, R = 'structured'> {
  structured?: T
  conditionType: R
}
export interface ParamItem {
  name: string
  variableType: 'flow'
  variableName?: string
}
// 节点相关类型定义
export type FlowNodeType =
  | 'FlowStartNode'
  | 'FlowEndNode'
  | 'FlowBranchNode'
  | 'FlowParallelBranchNode'
  | 'FlowBranchRouter' // 分支路由节点
  | 'FlowConsoleNode'
  | 'FlowForNode'
  | 'FlowWhileNode'
  | 'FlowAssignmentNode'
  | 'FlowFunctionCallNode'
  | 'FlowOpenPageNode'
  | 'FlowServiceCallNode'
  | 'FlowMessageNode'
  | 'FlowUpdateServiceNode'
  | 'FlowAddStorageNode'
  | 'FlowGetStorageNode'
  | 'FlowDeleteStorageNode'
export interface BaseParam {
  name: string
  dataType: IDataType // TODO
  defaultValue: any
  variableName: string
  description: string
}
export interface FlowNodeProps {
  inputs?: BaseParam[]
  outputs?: BaseParam[]
  valueText?: string
  [key: string]: any
}

export interface FlowNode<P extends FlowNodeProps = FlowNodeProps, C = FlowNodeChildren> {
  id: string
  type: FlowNodeType
  name: string
  placeholderText?: string // 默认占位文字
  description: string
  props: P
  children?: C[]
}
export type FlowNodeChildren = FlowNode | FlowBranchRouter
// 物料相关类型定义
export type FlowNodeRunner = (_context: any, _node: FlowNode) => Promise<any>
export type FlowRunnerMap = Partial<Record<FlowNodeType, FlowNodeRunner>>

export interface FlowSetterProps {
  hideBaseInfo: boolean
  [key: string]: any
}
export interface FlowMaterialConfig {
  isCustom?: boolean // 是否是自定义样式
  nodeAutoWidth?: true // 是否自动宽度
  hideInAdd?: boolean // 是否在添加面板中隐藏
  allowDelete?: boolean // 是否允许删除
  allowEdit?: boolean // 是否允许编辑
  allowCollapse?: boolean // 是否允许折叠
  footerTips?: string // 节点底部提示
}
export type ValidateType = 'error' | 'default' | 'warning'
export interface ValidateInfo {
  type: ValidateType
  id?:string
  messages?: string[]
  children?: (ValidateInfo & { id: string })[]
}
export interface FlowMaterial<
  Props extends FlowNodeProps = FlowNodeProps,
  Children = FlowNodeChildren,
  Config = FlowMaterialConfig
> {
  name: string
  type: FlowNodeType
  icon: Component
  group: string
  noder?: Component
  setter?: Component
  config: Config
  props: Props
  children?: Children[]
  validator?: (_node: FlowNode, _state?: IState) => ValidateInfo // 节点校验函数
  updateValueText?: (_node: FlowNode, _state: IState) => void // 渲染描述文字,这里会更新到对应节点的props下的valueText中
  onBeforeAdd?: (_node: FlowNode, _state: IState) => FlowNode // 节点添加前的钩子函数
  onAfterAdd?: (_node: FlowNode, _state: IState) => void // 节点添加后的钩子函数
}
export type FlowMaterialMap = Partial<Record<FlowNodeType, FlowMaterial>>

// flow相关定义

// 变量选择的类型(变量树中)
export type VariableType = 'input' | 'flowTemp' | 'page' | 'stores'

export interface TreeVariableItem {
  key: string
  origin?: IDataType
  loading?: boolean
  name: string
  isLeaf: boolean
  variableType?: VariableType
  dataType?: IDataType
  isLoaded?: boolean
  type: FieldType | 'empty'
  children?: TreeVariableItem[]
}

export interface FlowVariables {
  name: string
  variableType: VariableType
  dataType?: IDataType
  defaultValue?: any
  description?: string
}

export interface Flow<P = Record<string, any>> {
  id: string
  displayName: string
  props: P
  children: FlowNode[]
  variables: FlowVariables[]
}

export type ConditionOperator = 'not_empty' | 'empty' | 'equals' | 'not_equals'
export interface StructuredCondition {
  id: string
  expression?: string
  expressionFull?: any // 这里存的codeMirror全量
  operator?: ConditionOperator
  operatorName?: string
  source: string
  sourceType: ISourceType
  sourceVariableType: VariableType,
  target: string
  targetVariableType: VariableType,
  targetType: 'value' | 'variable' | 'expression'
  targetDataType?: IDataType // 目标类型
}
// 用于json值设置
export interface ReqParam extends StructuredCondition {
  pType?: FieldType
  isRoot?: boolean
  targetDataType: IDataType
  children?: ReqParam[]
}
// 字段控件通用校验失败的项（目前只保留了id）
export type ValidFailItemType = { id: string; [prop: string]: any }

export interface Structured {
  id: string
  combineType: 'and' | 'or'
  combineTypeName: '且' | '或'
  criteriaList: (Structured | StructuredCondition)[]
}
export interface FlowBranchRouter {
  id: string
  type: 'FlowBranchRouter'
  name: string
  description: string
  props: {
    conditionType?: 'structured' | 'expression'
    structured?: Structured
    isDefaultBranch?: boolean
    nodeId: string
    expression?: string
    expressionFull?: any
    valueText?: string
  }
  children: FlowNode[]
}
