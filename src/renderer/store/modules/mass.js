import { getMasses, massGroups, massUsers, getMass } from '../../api/mass'
import Vue from 'vue'

const mass = {
  state: {
    masses: {},
    selectGroupIds: [],
    sendGroupType: 0 // 0：直接发送  1：@全体群成员  2：私聊群成员
  },
  mutations: {
    SET_MASSES: (state, masses) => {
      for (let mass of masses) {
        Vue.set(state.masses, mass.id, mass)
      }
    },
    SET_SELECT_GROUP_IDS: (state, groupIds) => {
      state.selectGroupIds = groupIds
    },
    SET_SEND_GROUP_TYPE: (state, type) => {
      state.sendGroupType = type
    }
  },
  actions: {
    getMass({commit}, id) {
      return getMass(id).then(data => {
        commit('SET_MASSES', [data])
        return data
      })
    },
    getMasses({commit}, params) {
      return getMasses(params).then(data => {
        commit('SET_MASSES', data)
        return data
      })
    },
    massGroups({commit}, form) {
      return massGroups(form).then(data => {
        return data
      })
    },
    massUsers({commit}, form) {
      return massUsers(form).then(data => {
        return data
      })
    }
  },
  getters: {
    sendGroupType: state => state.sendGroupType,
    selectGroupIds: state => state.selectGroupIds,
    masses: state => state.masses
  }
}

export default mass
