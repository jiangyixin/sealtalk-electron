import ContextMenu from './Index.vue'
const contextMenu = {}

/**
 * Plugin API
 */
contextMenu.install = function (Vue, options) {
  Vue.component(ContextMenu.name, ContextMenu)
}

contextMenu.component = ContextMenu

/**
 * Auto install
 */
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(contextMenu)
}

export default contextMenu
