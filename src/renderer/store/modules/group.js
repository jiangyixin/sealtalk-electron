import { getMyGroups, findManageGroups, findGroups, getGroupInfo, getGroupMembers, updateGroupSetting, getMyGroupSetting, kickingMembers, joinMembers } from '../../api/group'
import Vue from 'vue'
import localCache from '../../utils/localStorage'

const group = {
  state: {
    myGroups: [],
    manageGroups: [],
    objGroups: localCache.get('obj-groups') || {}
  },
  mutations: {
    SET_MY_GROUPS: (state, groups) => {
      state.myGroups = groups
    },
    SET_MANAGE_GROUPS: (state, groups) => {
      state.manageGroups = groups
    },
    SET_OBJ_GROUPS: (state, groups) => {
      for (let group of groups) {
        if (state.objGroups[group['groupId']]) {
          state.objGroups[group['groupId']] = Object.assign({}, state.objGroups[group['groupId']], group)
        } else {
          Vue.set(state.objGroups, group['groupId'], group)
        }
      }
    },
    DELETE_OBJ_GROUPS_ITEM: (state, [groupId, key]) => {
      delete state.objGroups[groupId][key]
    },
    SET_GROUP_MEMBERS: (state, [groupId, members]) => {
      if (!state.objGroups[groupId]) {
        Vue.set(state.objGroups, groupId, {})
      }
      Vue.set(state.objGroups[groupId], 'members', members)
    },
    SET_GROUP_INFO: (state, [groupId, info]) => {
      if (!state.objGroups[groupId]) {
        Vue.set(state.objGroups, groupId, {})
      }
      state.objGroups[groupId] = Object.assign({}, state.objGroups[groupId], info)
      Vue.set(state.objGroups[groupId], 'info', info)
    },
    CLEAN_GROUP_INFO: (state, groupId) => {
      delete state.objGroups[groupId].info
    },
    CLEAN_GROUP_SETTING: (state, groupId) => {
      delete state.objGroups[groupId].mySetting
    },
    SET_MY_GROUP_SETTING: (state, [groupId, mySetting]) => {
      if (!state.objGroups[groupId]) {
        Vue.set(state.objGroups, groupId, {})
      }
      Vue.set(state.objGroups[groupId], 'mySetting', mySetting)
    }
  },
  actions: {
    getMyGroups({commit, state}) {
      if (state.myGroups && state.myGroups.length) {
        return Promise.resolve(state.myGroups)
      } else {
        return getMyGroups().then(data => {
          commit('SET_MY_GROUPS', data)
          commit('SET_OBJ_GROUPS', data)
          return data
        })
      }
    },
    findManageGroups({commit, state}) {
      if (state.manageGroups && state.manageGroups.length) {
        return Promise.resolve(state.manageGroups)
      } else {
        return findManageGroups().then(data => {
          commit('SET_MANAGE_GROUPS', data)
          commit('SET_OBJ_GROUPS', data)
          return data
        })
      }
    },
    findGroups({commit, state}, groupIds) {
      let ids = []
      for (let groupId of groupIds) {
        if (!state.objGroups[groupId]) {
          ids.push(groupId)
        }
      }
      if (ids.length) {
        let chunkIds = [], chunkLen = 100
        for(let i = 0, len = ids.length; i < len; i += chunkLen){
          chunkIds.push(ids.slice(i, i+chunkLen));
        }
        let promises = chunkIds.map(ids => {
          return findGroups(ids).then(data => {
            commit('SET_OBJ_GROUPS', data)
            return data
          })
        })
        return Promise.all(promises).then(data => {
          return state.objGroups
        })
      } else {
        return Promise.resolve(state.objGroups)
      }
    },
    getGroupInfo({commit, state}, groupId) {
      if (state.objGroups[groupId] && state.objGroups[groupId].info) {
        return state.objGroups[groupId].info
      } else {
        return getGroupInfo(groupId).then(data => {
          commit('SET_GROUP_INFO', [groupId, data[0]])
          return data[0]
        })
      }
    },
    getGroupMembers({commit, state}, groupId) {
      if (state.objGroups[groupId] && state.objGroups[groupId].members) {
        return state.objGroups[groupId].members
      } else {
        return getGroupMembers(groupId).then(data => {
          commit('SET_GROUP_MEMBERS', [groupId, data])
          return data
        })
      }
    },
    kickingMembers({commit}, [groupId, params]) {
      return kickingMembers(groupId, params).then(data => {
        commit('DELETE_OBJ_GROUPS_ITEM', [groupId, 'members'])
        return data
      })
    },
    joinMembers({commit}, [groupId, form]) {
      return joinMembers(groupId, form).then(data => {
        commit('DELETE_OBJ_GROUPS_ITEM', [groupId, 'members'])
        return data
      })
    },
    getMyGroupSetting({commit, state}, groupId) {
      if (state.objGroups[groupId] && state.objGroups[groupId].mySetting) {
        let mySetting = state.objGroups[groupId].mySetting
        getMyGroupSetting(groupId).then(data => {
          if (data && data.updatedTime > mySetting.updatedTime) {
            commit('SET_MY_GROUP_SETTING', [groupId, data])
            getGroupMembers(groupId).then(data => {
              commit('SET_GROUP_MEMBERS', [groupId, data])
            })
          }
        })
        return mySetting
      } else {
        return getMyGroupSetting(groupId).then(data => {
          commit('SET_MY_GROUP_SETTING', [groupId, data])
          return data
        })
      }
    },
    updateGroupSetting({commit, dispatch}, form) {
      return updateGroupSetting(form.groupId, form).then(data => {
        commit('CLEAN_GROUP_SETTING', form.groupId)
        dispatch('getMyGroupSetting', form.groupId)
        return data
      })
    }
  },
  getters: {
    myGroups: state => state.myGroups,
    manageGroups: state => state.manageGroups,
    objGroups: state => state.objGroups
  }
}

export default group
