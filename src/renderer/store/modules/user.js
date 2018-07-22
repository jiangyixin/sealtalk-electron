import cache from '../../utils/sessionStorage'
import localCache from '../../utils/localStorage'
import { getUserProfile } from '../../api/user'
import Vue from 'vue'

const user = {
  state: {
    bus: new Vue(),
    token: '',
    userId: 0,
    userInfo: {},
    curSidebar: '',
    sendHotKey: localCache.get('send-hot-key') || {
      functionKeys: ['ctrl'],
      editKey: 'enter'
    }
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
      localCache.set('token', token)
    },
    SET_USER_ID: (state, userId) => {
      state.userId = userId
      localCache.set('userId', userId)
    },
    SET_USER_INFO: (state, userInfo) => {
      state.userInfo = userInfo
    },
    SET_CUR_SIDEBAR: (state, sidebar) => {
      let key = 'curSidebar'
      cache.set(key, sidebar)
      state.curSidebar = sidebar
    },
    SET_SEND_HOT_KEY: (state, hotKey) => {
      state.sendHotKey.functionKeys = hotKey.functionKeys
      state.sendHotKey.editKey = hotKey.editKey
      localCache.set('send-hot-key', state.sendHotKey)
    }
  },
  actions: {
    getUserProfile({commit, state}) {
      if (state.userInfo && state.userInfo.userId) {
        return Promise.resolve(state.userInfo)
      } else {
        return getUserProfile().then(data => {
          commit('SET_USER_INFO', data)
          return data
        })
      }
    }
  },
  getters: {
    bus: state => state.bus,
    token: state => {
      return state.token || localCache.get('token') || ''
    },
    userId: state => {
      return state.userId || localCache.get('userId') || 0
    },
    userInfo: state => state.userInfo,
    curSidebar: state => {
      let key = 'curSidebar'
      return state.curSidebar || cache.get(key) || 'Conversations'
    },
    sendHotKey: state => state.sendHotKey
  }
}

export default user
