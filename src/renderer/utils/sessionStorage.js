export default {
  get: (key) => {
    if (!window.sessionStorage) return false
    if (!Boolean(window.sessionStorage && window.sessionStorage.hasOwnProperty(key))) {
      return null
    } else {
      let value = window.sessionStorage.getItem(key)
      if (typeof value === 'string' && value) {
        value = JSON.parse(value)
      }
      return value
    }
  },
  set: (key, data) => {
    if (!window.sessionStorage) return false
    window.sessionStorage.setItem(key, JSON.stringify(data))
    return true
  },
  has: (key) => {
    return Boolean(window.sessionStorage && window.sessionStorage.hasOwnProperty(key))
  },
  del: (key) => {
    if (window.sessionStorage) window.sessionStorage.removeItem(key)
  },
  // 模糊删除
  delLike: (key) => {
    if (window.sessionStorage) {
      for(let name in window.sessionStorage) {
        if(name.indexOf(key) > -1) {
          window.sessionStorage.removeItem(name)
        }
      }
    }
  },
  clear: () => {
    if (window.sessionStorage) window.sessionStorage.clear()
  }
}
