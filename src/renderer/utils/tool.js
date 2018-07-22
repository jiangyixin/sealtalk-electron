
export function getQueryString(name) {
  let reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)")
  let r = window.location.search.substr(1).match(reg)
  if(r != null) return unescape(r[2]); return null
}

export function guid() {
  function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1)
  }
  return (S4()+"-"+S4()+"-"+S4()+"-"+S4())
}
