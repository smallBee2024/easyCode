import { computed, markRaw, nextTick, reactive } from 'vue'
import { convertTreeToObject, guid } from '../common/helper'
import {
  type Flow,
  type FlowMaterial,
  type FlowVariables,
  type FlowMaterialMap,
  type FlowNode,
  type FlowSetterProps,
  type ValidateInfo
} from '../types'
import { useThrottledRefHistory } from '@vueuse/core'
import { message } from 'ant-design-vue'
const zoomStep = 10
const zoomMax = 200
const zoomMin = 80
export interface IState {
  materials: FlowMaterialMap
  mode: 'edit' | 'preview'
  editNode: null | FlowNode
  setterProps: FlowSetterProps // 传递给setter组件的props
  theme: string
  flowData: Flow | null
  validateInfo: Record<string, ValidateInfo>
  zoom: number
  storesVariables: FlowVariables[]
  // 创建变量弹框
  createVariable: boolean
  editVarRow: FlowVariables | null,
}
// 创建一个响应式对象，用于存储流程数据
const state = reactive<IState>({
  materials: {},
  mode: 'edit',
  editNode: null,
  setterProps: {
    hideBaseInfo: false
  },
  theme: '#0089FF',
  flowData: null,
  validateInfo: {},
  zoom: 100,
  storesVariables: [],
  createVariable: false,
  editVarRow: null
})
type ChangeType = 'add' | 'update' | 'delete' | 'undo' | 'redo'
type ChangeFunction = (_type: ChangeType, _node?: FlowNode, _flowData?: Flow) => void
let onChangeHooks: ChangeFunction[] = []
function onChange(hook: ChangeFunction) {
  onChangeHooks.push(hook)
}
function callChangeHooks(type: ChangeType, node?: FlowNode) {
  onChangeHooks.forEach((hook) => {
    hook(type, node, state.flowData)
  })
  // TODO: 考虑仅针对修改的节点进行验证
  validate()
}
// 设置流程物料
function setMaterials(materials: FlowMaterialMap = {}) {
  state.materials = markRaw(materials)
}
// 设置流程数据
function setFlowData(flowData: Flow) {
  state.flowData = flowData
}
// 设置模式
function setMode(mode: 'edit' | 'preview') {
  state.mode = mode
}
// 设置主题
function setTheme(theme: string = '#0089FF') {
  state.theme = theme
}
// 设置setter组件的props
function setSetterProps(props?: IState['setterProps']) {
  state.setterProps = props || {
    hideBaseInfo: false
  }
}

// 设置当前编辑的节点
function setEditNode(node: null | FlowNode = null, setterProps?: FlowSetterProps) {
  state.editNode = node
  setSetterProps(setterProps)
}
// 创建节点
function createNode(flowId: string, material: FlowMaterial): FlowNode {
  const id = guid()
  let node: FlowNode = {
    id: `node_${flowId}_${id}`,
    type: material.type,
    name: material.name,
    description: '',
    props: {
      ...material.props
    },
    children: [...(material.children || [])]
  }
  if (material.onBeforeAdd) {
    node = material.onBeforeAdd(node, state)
  }
  return node
}
// 添加节点
function addNode(material: FlowMaterial, curIndex: number, parentList: FlowNode[]) {
  // 去掉flow_前缀
  const flowId = state.flowData.id.replace('flow_', '')
  const node = createNode(flowId, material)
  parentList.splice(curIndex, 0, node)
  if (material.onAfterAdd) {
    nextTick(() => {
      material.onAfterAdd(node, state)
    })
  }
  callChangeHooks('add', node)
  return node
}
// 更新节点
function updateNode(node: FlowNode, curIndex: number, parentList: FlowNode[]) {
  parentList.splice(curIndex, 1, node)
  callChangeHooks('update', node)
}
// 移除节点
function removeNode(curIndex: number, parentList: FlowNode[]) {
  const [node] = parentList.splice(curIndex, 1)
  callChangeHooks('delete', node)
}
function getFlatFlowNodes() {
  return convertTreeToObject(state.flowData.children) || {}
}
// 计算属性，用于获取流程数据
const flowData = computed({
  get() {
    return state.flowData
  },
  set(val) {
    setFlowData(val)
  }
})
// 使用useThrottledRefHistory，用于记录流程数据的历史
const historyRef = useThrottledRefHistory(flowData, {
  deep: true,
  throttle: 1000
})
const history = {
  ...historyRef,
  redo() {
    historyRef.redo()
    callChangeHooks('redo')
  },
  undo() {
    historyRef.undo()
    callChangeHooks('undo')
  }
}
// 添加验证信息
function addValidateInfo(id: string, info: ValidateInfo) {
  state.validateInfo[id] = info
}
// 移除验证信息
function removeValidateInfo(id: string) {
  delete state.validateInfo[id]
}
// 清空验证信息
function clearValidateInfo() {
  state.validateInfo = {}
}
function validateNode(node: FlowNode) {
  const { id, type } = node
  const material = state.materials[type]
  // 如果是分支router节点，则跳过，因为使用父及分支节点进行验证
  if (type === 'FlowBranchRouter') {
    return
  }
  if (material && material.validator) {
    let validateInfo: ValidateInfo = null
    try {
      validateInfo = material.validator(node)
    } catch (error) {
      console.error(`${node.name}验证出错，请检查其validator配置`, error)
    }
    if (validateInfo?.type !== 'default') {
      addValidateInfo(id, validateInfo)
    } else {
      removeValidateInfo(id)
    }
  } else {
    removeValidateInfo(id)
  }
}
function validate() {
  clearValidateInfo()
  const nodeMap = getFlatFlowNodes()
  const nodes = Object.values(nodeMap)
  nodes.forEach((node) => validateNode(node))
  return state.validateInfo
}
// 切换流程时使用
function changeFlow(data: Flow) {
  setEditNode()
  setSetterProps()
  clearValidateInfo()
  historyRef?.pause()
  setFlowData(data)
  historyRef.resume()
  nextTick(() => {
    historyRef.clear()
    validate()
  })
}
// 一些变量操作
function setstoresVariables(variables: FlowVariables[]) {
  state.storesVariables = variables
}
// 删除变量
const delVariable = (name: string) => {
  const variableList = state.flowData.variables
  if (variableList && Array.isArray(variableList)) {
    const targetIndex = variableList.findIndex((item: any) => item.name === name)
    variableList.splice(targetIndex, 1)
  }
}
// 新增变量
const addVariable = (row: any) => {
  const variableList = state.flowData.variables
  if (variableList && Array.isArray(variableList)) {
    const variableNames = variableList.map((item: any) => item.name)
    if (variableNames.includes(row.name)) {
      message.warn('该变量名称已经存在，请重新输入')
      return false
    }
    variableList.push({ ...row, refs: [] })
    return true
  } else {
    return false
  }
}
// 修改变量(引用值同步)
const modifyVariable = (row: any) => {
  const variableList = state.flowData.variables
  if (variableList && Array.isArray(variableList)) {
    // 这里编辑是不能修改名称的
    // const variableNames = variableList.map((item: any) => item.name);
    // if (variableNames.includes(row.name)) {
    //   message.warn('该变量名称已经存在，请重新输入');
    //   return;
    // }
    // 引用值同步（暂时用不到）
    try {
      // if (row?.refs && row.refs.length > 0) {
      //   row.refs.forEach((item: any) => {
      //     const { nodeId, propsJsonPath } = item;

      //     const targetNode = getFlowNode(nodeId, nodes.value);
      //     if (targetNode) {
      //       setJsonValue(targetNode, propsJsonPath, row.name); // 更新变量名
      //     }
      //   });
      // }
      const targetIndex = variableList.findIndex((item: any) => item.name === row.name)
      variableList.splice(targetIndex, 1, row)
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  } else {
    return false
  }
}
// 销毁
function destroy() {
  historyRef.dispose()
  setMaterials()
  setEditNode()
  setSetterProps()
  onChangeHooks = []
  clearValidateInfo()
  setFlowData(null)
}
function zoomIn() {
  if (state.zoom < zoomMax) {
    state.zoom += zoomStep
  }
}
function zoomOut() {
  if (state.zoom > zoomMin) {
    state.zoom -= zoomStep
  }
}
function zoomReset() {
  state.zoom = 100
}
export default function () {
  return {
    history,
    state,
    setMaterials,
    setFlowData,
    setMode,
    setTheme,
    setEditNode,
    setSetterProps,
    addNode,
    updateNode,
    removeNode,
    addValidateInfo,
    removeValidateInfo,
    clearValidateInfo,
    validate,
    validateNode,
    destroy,
    changeFlow,
    zoomIn,
    zoomOut,
    zoomReset,
    onChange,
    callChangeHooks,
    getFlatFlowNodes,
    setstoresVariables,
    delVariable,
    addVariable,
    modifyVariable
  }
}
