import { type FlowMaterial } from '../../types'
import Icon from './icon.svg'
export { default as runner } from './Runner.ts'
export const FlowEndNode: FlowMaterial = {
  name: '结束节点',
  type: 'FlowEndNode',
  icon: Icon,
  group: '内置',
  config: {
    hideInAdd: true,
    allowDelete: false,
    allowEdit: false,
  },
  props: {}
}
