// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import cache from './utils/sessionStorage'
import localCache from './utils/localStorage'

// import 'vue-awesome/icons/flag'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
Vue.component('icon', Icon)

import ContextMenu from './components/contextmenu/index'
Vue.use(ContextMenu)

import { getQueryString } from './utils/tool'

Vue.use(ElementUI)
Vue.config.productionTip = false

Vue.prototype.globalClick = function (callback) {
  document.addEventListener('click', function (e) {
    callback(e)
  })
}
Vue.prototype.globalKeyDown = function (callback) {
  document.addEventListener('keydown', function (e) {
    callback(e)
  })
}

RongIMLib.RongIMEmoji.init()
RongIMLib.RongIMVoice.init()

router.beforeEach((to, from, next) => {
  let token = getQueryString('token')
  let userId = getQueryString('userId')
  if (token && userId) {
    cache.del('is-login')
    if (localCache.get('userId') != userId) {
      localCache.clear()
      cache.clear()
    }
    store.commit('SET_TOKEN', token)
    store.commit('SET_USER_ID', userId)
    // 美化url地址
    history.replaceState({}, 'new-url', location.origin + location.hash)
  }
  if (!store.getters.token || !store.getters.userId) {
    ElementUI.Message({
      message: '请先登录官网再访问',
      type: 'error',
      duration: 3 * 1000
    })
  }
  next()
})

window.onbeforeunload = function () {
  if (typeof store.getters.objFriends === 'object') {
    localCache.set('rc-conversations', store.getters.conversations)
  }
  if (typeof store.getters.objFriends === 'object') {
    localCache.set('obj-friends', store.getters.objFriends)
  }
  if (typeof store.getters.objGroups === 'object') {
    localCache.set('obj-groups', store.getters.objGroups)
  }
}

window.onunload = function () {

}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: {App},
  template: '<App/>'
})
