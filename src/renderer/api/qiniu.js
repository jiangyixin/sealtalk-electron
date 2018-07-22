import axios from '../utils/axios'

export function getQiniuToken () {
  return axios({
    url: `/qinius/token`,
    method: 'get'
  })
}
