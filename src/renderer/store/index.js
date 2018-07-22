import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import friend from './modules/friend'
import group from './modules/group'
import user from './modules/user'
import rc from './modules/rc'
import mass from './modules/mass'


Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    friend,
    group,
    user,
    rc,
    mass
  },
  getters
})

store.subscribe((mutation, state) => {
  if (mutation.type == 'RECEIVE_NEW_MESSAGE' && state.rc.curConversation.targetId == mutation.payload.targetId) {
    store.dispatch('clearUnreadCount', state.rc.curConversation).then(data => {

    })
  }
})

export default store
