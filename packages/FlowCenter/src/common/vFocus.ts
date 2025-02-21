export const vFocus = {
  mounted(el?: HTMLElement) {
    if (el?.tagName !== 'INPUT') {
      el?.querySelector('input')?.focus()
      return
    }

    el?.focus()
  },
}