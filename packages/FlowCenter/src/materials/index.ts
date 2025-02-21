import { FlowStartNode, runner as startRuner } from './start'
import { FlowEndNode, runner as endRunner } from './end'
// import { FlowAssignmentNode, runner as assignmentRunner } from './assignment'
// import { FlowBranchNode, runner as branchRunner } from './branch'
// import { FlowParallelBranchNode, runner as parallelBranchRunner } from './parallelBranch'
// import { FlowConsoleNode, runner as consoleRunner } from './console'
// import { FlowFunctionCallNode, runner as functionCallRunner } from './functionCall'
// import { FlowForNode, runner as forRunner } from './for'
// import { FlowWhileNode, runner as whileRunner } from './while'
// import { FlowMessageNode, runner as messageRunner } from './message'
// import { FlowOpenPageNode, runner as openpageRunner } from './openpage'
// import { FlowServiceCallNode, runner as serviceCallRunner } from './serviceCall'
// import { FlowUpdateServiceNode, runner as updateServiceRunner } from './updateService'
import { type FlowMaterialMap, type FlowRunnerMap } from '../types'
// 新增缓存
// import { FlowAddStorageNode, runner as addStorageRunner } from './storageAdd'
// // 获取缓存
// import { FlowGetStorageNode, runner as getStorageRunner } from './storageGet'
// // 删除缓存
// import { FlowDeleteStorageNode, runner as deleteStorageRunner } from './storageDel'

export const nodes: FlowMaterialMap = {
  FlowStartNode,
  FlowEndNode,
  // FlowConsoleNode,
  // FlowAssignmentNode,
  // FlowBranchNode,
  // FlowParallelBranchNode,
  // FlowFunctionCallNode,
  // FlowForNode,
  // FlowWhileNode,
  // FlowMessageNode,
  // FlowOpenPageNode,
  // FlowServiceCallNode,
  // FlowUpdateServiceNode,
  // FlowAddStorageNode,
  // FlowGetStorageNode,
  // FlowDeleteStorageNode,
}
export const runners: FlowRunnerMap = {
  FlowStartNode: startRuner,
  FlowEndNode: endRunner,
  // FlowConsoleNode: consoleRunner,
  // FlowAssignmentNode: assignmentRunner,
  // FlowBranchNode: branchRunner,
  // FlowParallelBranchNode: parallelBranchRunner,
  // FlowFunctionCallNode: functionCallRunner,
  // FlowForNode: forRunner,
  // FlowWhileNode: whileRunner,
  // FlowMessageNode: messageRunner,
  // FlowOpenPageNode: openpageRunner,
  // FlowServiceCallNode: serviceCallRunner,
  // FlowUpdateServiceNode: updateServiceRunner,
  // FlowAddStorageNode: addStorageRunner,
  // FlowGetStorageNode: getStorageRunner,
  // FlowDeleteStorageNode: deleteStorageRunner,
}
