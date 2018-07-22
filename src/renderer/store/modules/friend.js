import { getMyFriends, findFriends, getFriendInfo, applyFriend, getFriendGroups, getFriendCourses, delFriend, getFriendVip } from '../../api/friend'
import Vue from 'vue'
import localCache from '../../utils/localStorage'

const friend = {
  state: {
    myFriends: [],
    objFriends: localCache.get('obj-friends') || {}
  },
  mutations: {
    SET_MY_FRIENDS: (state, friends) => {
      state.myFriends = friends
    },
    SET_OBJ_FRIENDS: (state, friends) => {
      for (let friend of friends) {
        Vue.set(state.objFriends, friend.friendUserId, friend)
      }
    },
    UPDATE_OBJ_FRIENDS: (state, friend) => {
      Vue.set(state.objFriends, friend.userId, friend)
    },
    SET_FRIEND_INFO: (state, [userId, friend]) => {
      if (!state.objFriends[userId]) {
        Vue.set(state.objFriends, userId, {})
      }
      Object.assign(state.objFriends[userId], friend)
      // state.objFriends[userId] = Object.assign({}, state.objFriends[userId], friend)
      // Object.assign({}, state.objFriends[userId], friend)
    },
    SET_FRIEND_GROUPS: (state, [userId, groups]) => {
      if (!state.objFriends[userId]) {
        Vue.set(state.objFriends, userId, {})
      }
      // state.objFriends[userId] = Object.assign({}, state.objFriends[userId], groups)
      Vue.set(state.objFriends[userId], 'groups', groups)
    },
    SET_FRIEND_COURSES: (state, [userId, courses]) => {
      if (!state.objFriends[userId]) {
        Vue.set(state.objFriends, userId, {})
      }
      // state.objFriends[userId] = Object.assign({}, state.objFriends[userId], courses)
      Vue.set(state.objFriends[userId], 'courses', courses)
    },
    SET_FRIEND_VIP: (state, [userId, vip]) => {
      if (!state.objFriends[userId]) {
        Vue.set(state.objFriends, userId, {})
      }
      // state.objFriends[userId] = Object.assign({}, state.objFriends[userId], vip)
      Vue.set(state.objFriends[userId], 'vip', vip)
    },
    DELETE_FRIEND: (state, userId) => {
      delete state.objFriends[userId]
    }
  },
  actions: {
    getMyFriends({commit, state}, params) {
      if (state.myFriends && state.myFriends.length) {
        return Promise.resolve(state.myFriends)
      } else {
        return getMyFriends(params).then(data => {
          commit('SET_MY_FRIENDS', data)
          commit('SET_OBJ_FRIENDS', data)
          return data
        })
      }
    },
    findFriends({commit, state}, userIds) {
      let ids = []
      for (let userId of userIds) {
        if (!state.objFriends[userId]) {
          ids.push(userId)
        }
      }
      if (ids.length) {
        let chunkIds = [], chunkLen = 100
        for(let i = 0, len = ids.length; i < len; i += chunkLen){
          chunkIds.push(ids.slice(i, i+chunkLen));
        }
        let promises = chunkIds.map(ids => {
          return findFriends(ids).then(data => {
            commit('SET_OBJ_FRIENDS', data)
            return data
          })
        })
        return Promise.all(promises).then(data => {
          return state.objFriends
        })
      } else {
        return Promise.resolve(state.objFriends)
      }
    },
    getFriendInfo({commit, state}, params) {
      if (state.objFriends[params.userId] && !params.origin) {
        return Promise.resolve(state.objFriends[params.userId])
      } else {
        return getFriendInfo(params).then(data => {
          commit('SET_FRIEND_INFO', [params.userId, data])
          return state.objFriends[params.userId]
        })
      }
    },
    getFriendGroups({commit, state}, userId) {
      if (state.objFriends[userId] && state.objFriends[userId].groups) {
        return state.objFriends[userId].groups
      } else {
        return getFriendGroups(userId).then(data => {
          commit('SET_FRIEND_GROUPS', [userId, data])
          return data
        })
      }
    },
    getFriendCourses({commit, state}, userId) {
      if (state.objFriends[userId] && state.objFriends[userId].courses) {
        return state.objFriends[userId].courses
      } else {
        return getFriendCourses(userId).then(data => {
          commit('SET_FRIEND_COURSES', [userId, data])
          return data
        })
      }
    },
    getFriendVip({commit, state}, userId) {
      if (state.objFriends[userId] && state.objFriends[userId].vip) {
        return state.objFriends[userId].vip
      } else {
        return getFriendVip(userId).then(data => {
          commit('SET_FRIEND_VIP', [userId, data])
          return data
        })
      }
    },
    applyFriend({commit, state}, form) {
      return applyFriend(form).then(data => {
        return data
      })
    },
    delFriend({commit, dispatch, state}, friendId) {
      return delFriend(friendId).then(data => {
        // commit('DELETE_FRIEND', friendId)
        return dispatch('getFriendInfo', {userId: friendId, origin: true}).then(data => {
          return data
        })
      })
    }
  },
  getters: {
    myFriends: state => state.myFriends,
    objFriends: state => state.objFriends
  }
}

export default friend
