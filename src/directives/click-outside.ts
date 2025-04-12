import type { DirectiveBinding } from 'vue'

type ClickOutsideElement = HTMLElement & {
  clickOutsideHandler?: (event: MouseEvent) => void
}

export const vClickOutside = {
  mounted(el: ClickOutsideElement, binding: DirectiveBinding) {
    el.clickOutsideHandler = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideHandler)
  },
  unmounted(el: ClickOutsideElement) {
    if (el.clickOutsideHandler) {
      document.removeEventListener('click', el.clickOutsideHandler)
    }
  }
} 