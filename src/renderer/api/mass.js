import axios from '../utils/axios'

export function getMass(id) {
  return axios({
    url: `/message/${id}`,
    method: 'get'
  })
}

export function getMasses (params) {
  return axios({
    url: `/message`,
    method: 'get',
    params: {
      limit: params.limit || 10,
      skip: params.skip || 0,
      all: params.all || 0,
      type: params.type || 'direct' // 消息类型，direct或者timing，分别是已发送消息和定时消息
    }
  })
}

export function massGroups(data) {
  return axios({
    url: `/message/groups`,
    method: 'post',
    data: data
  })
}

export function massUsers(data) {
  return axios({
    url: `/message/users`,
    method: 'post',
    data: data
  })
}

export function delMass(id) {
  return axios({
    url: `/message/timing/${id}`,
    method: 'delete'
  })
}

