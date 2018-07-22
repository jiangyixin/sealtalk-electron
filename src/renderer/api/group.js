import axios from '../utils/axios'

export function findManageGroups() {
  return axios({
    url: `/groups/mange/list`,
    method: 'get'
  })
}

export function findGroups(groupIds) {
  return axios({
    url: `/groups/find`,
    method: 'get',
    params: {
      groupIds: groupIds.join(',')
    }
  })
}

export function getMyGroups() {
  return axios({
    url: `/groups/list/self`,
    method: 'get'
  })
}

export function getGroupInfo(groupId) {
  return axios({
    url: `/groups/${groupId}/info`,
    method: 'get'
  })
}

export function getGroupMembers(groupId) {
  return axios({
    url: `/groups/${groupId}/members`,
    method: 'get'
  })
}

export function updateGroupSetting(groupId, data) {
  return axios({
    url: `/groups/${groupId}/mysetting`,
    method: 'post',
    data: data
  })
}

export function getMyGroupSetting(groupId, params) {
  return axios({
    url: `/groups/${groupId}/mysetting`,
    method: 'get',
    params
  })
}

export function kickingMembers(groupId, params) {
  return axios({
    url: `/groups/${groupId}/kicking`,
    method: 'delete',
    data: {
      userIds: params.userIds
    }
  })
}

export function joinMembers(groupId, data) {
  return axios({
    url: `/groups/${groupId}/join`,
    method: 'post',
    data: data
  })
}

