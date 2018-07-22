import axios from 'axios'
import cache from '../utils/sessionStorage'
import store from '../store'
import { Message, MessageBox } from 'element-ui'

const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 1200000 // 请求超时时间
})

service.interceptors.request.use(
  config => {
    config.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

    // if(config.method  === 'post'){
    //   config.data = qs.stringify(config.data);
    // }
    config.headers['token'] = store.getters.token
    config.headers['userId'] = store.getters.userId
    if (!cache.has('is-login')) {
      config.headers['token-login'] = 1
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)
//code状态码200判断
service.interceptors.response.use(
  res => {
    if (!res.data || !res.data.code) {
      console.log(res)
      return res.data
    }
    if ([410].indexOf(res.data.code) !== -1) {
      let loginCount = cache.get('login-count') || 0
      if (loginCount > 10) {
        Message({
          message: '授权登陆失败',
          type: 'error',
          duration: 3 * 1000
        })
        return
      }
      cache.set('login-count', 1 + loginCount)
      location.href = process.env.LOGIN_URL
    } else if (res.data.code !== 200) {
      // 错误提示
      Message({
        message: res.data.tip || res.data.msg,
        type: 'error',
        duration: 3 * 1000
      })
      return Promise.reject(res.data)
    }
    if (!cache.has('is-login')) {
      cache.set('is-login', 1)
      cache.set('login-count', 0)
    }
    return res.data.res
  },
  error => {
    console.log(error)
    // 网络异常
    Message({
      message: error.message || '网络异常',
      type: 'error',
      duration: 3 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
