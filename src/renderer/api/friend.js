import axios from '../utils/axios'


export function getFriendGroups(userId) {
  return axios({
    url: `/groups/list/user/${userId}`,
    method: 'get'
  })
}

export function getFriendCourses(userId) {
  return axios({
    url: `/friends/courses/user/${userId}`,
    method: 'get'
  })
}

export function getFriendVip(userId) {
  return axios({
    url: `/friends/vip/user/${userId}`,
    method: 'get'
  })
}

export function getMyFriends (params) {
  return axios({
    url: `/friends`,
    method: 'get',
    params: {
      applyStatus: params.applyStatus
    }
  })
}

export function findFriends(userIds = []) {
  return axios({
    url: `/friends/find`,
    method: 'get',
    params: {
      userIds: userIds.join(',')
    }
  })
}

export function getFriendInfo (params) {
  return axios({
    url: `/users/${params.userId}/profile`,
    method: 'get',
    params: {
      groupId: params.groupId
    }
  })
}

export function applyFriend(form) {
  return axios({
    url: `/friends/apply`,
    method: 'post',
    data: {
      friendUserId: form.friendUserId,
      applyReason: form.applyReason,
      remark: form.remark,
      applyFrom: form.applyFrom,
      fromRemark: form.fromRemark
    }
  })
}

export function delFriend(friendId) {
  return axios({
    url: `/friends/user/${friendId}`,
    method: 'delete'
  })
}

export function searchUser(target) {
  return axios({
    url: `/users/search`,
    method: 'get',
    params: {
      target: target
    }
  })
}
