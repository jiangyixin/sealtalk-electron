import axios from '../utils/axios'
import store from '../store'


export function getRCToken () {
  return axios({
    url: `/users/token`,
    method: 'get'
  })
}

export function getUserProfile() {
  return axios({
    url: `/users/${store.getters.userId}/profile`,
    method: 'get'
  })
}

