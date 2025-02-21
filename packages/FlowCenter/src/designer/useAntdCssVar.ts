import { theme } from 'ant-design-vue'
import { watchEffect } from 'vue'

export default () => {
  const { useToken } = theme
  const { token } = useToken()
  function getCssVariableValue(value: any) {
    if (typeof value === 'string') {
      return value
    } else if (typeof value === 'number') {
      return `${value}px`
    } else {
      return value
    }
  }

  function setCssVariables(variables: Record<string, any>): void {
    const id = 'AntTokenAsCssVariables'

    let styleTag = document.head.querySelector(`#${id}`) as HTMLStyleElement
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = id
      document.head.appendChild(styleTag)
    }

    const cssVars = Object.entries(variables)
      .map(([key, value]) => `--ant-${key}: ${getCssVariableValue(value)};`)
      .join('')

    styleTag.innerHTML = `:root { ${cssVars} }`
  }
  // 主题切换会改变
  watchEffect(() => setCssVariables(token.value))
}
