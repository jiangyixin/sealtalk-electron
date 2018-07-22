import store from '../store'
import { Message } from 'element-ui'

export function init(params, callbacks, modules) {
  var appKey = params.appKey;
  var token = params.token;
  var navi = params.navi || "";

  modules = modules || {};
  var RongIMLib = modules.RongIMLib || window.RongIMLib;
  var RongIMClient = RongIMLib.RongIMClient;
  var protobuf = modules.protobuf || null;

  var config = {};

  //私有云切换navi导航，私有云格式 '120.92.10.214:8888'
  if(navi !== "") {
    config.navi = navi;
  }

  //私有云切换api,私有云格式 '172.20.210.38:81:8888'
  var api = params.api || "";
  if(api !== "") {
    config.api = api;
  }

  //support protobuf url + function
  if(protobuf != null) {
    config.protobuf = protobuf;
  }


  RongIMLib.RongIMClient.init(appKey,null,config);

  var instance = RongIMClient.getInstance();

  // 连接状态监听器
  RongIMClient.setConnectionStatusListener({
    onChanged: function (status) {
      console.log(status);
      switch (status) {
        case RongIMLib.ConnectionStatus["CONNECTED"]:
        case 0:
          console.log("连接成功")
          callbacks.getInstance && callbacks.getInstance(instance);
          break;

        case RongIMLib.ConnectionStatus["CONNECTING"]:
        case 1:
          console.log("连接中")
          break;

        case RongIMLib.ConnectionStatus["DISCONNECTED"]:
        case 2:
          console.log("当前用户主动断开链接")
          break;

        case RongIMLib.ConnectionStatus["NETWORK_UNAVAILABLE"]:
        case 3:
          console.log("网络不可用")
          Message({
            message: '网络不可用',
            type: 'error',
            duration: 5 * 1000
          })
          reconnect()
          break;

        case RongIMLib.ConnectionStatus["CONNECTION_CLOSED"]:
        case 4:
          console.log("未知原因，连接关闭")
          Message({
            message: '未知原因，连接关闭，重新连接中',
            type: 'error',
            duration: 5 * 1000
          })
          reconnect()
          break;

        case RongIMLib.ConnectionStatus["KICKED_OFFLINE_BY_OTHER_CLIENT"]:
        case 6:
          console.log("用户账户在其他设备登录，本机会被踢掉线")
          Message({
            message: '用户账户在其他设备登录，本机会被踢掉线',
            type: 'error',
            duration: 5 * 1000
          })
          break;

        case RongIMLib.ConnectionStatus["DOMAIN_INCORRECT"]:
        case 12:
          console.log("当前运行域名错误，请检查安全域名配置")
          break;
      }
    }
  });

  /*
   文档：http://www.rongcloud.cn/docs/web.html#3、设置消息监听器
   注意事项：
   1：为了看到接收效果，需要另外一个用户向本用户发消息
   2：判断会话唯一性 ：conversationType + targetId
   3：显示消息在页面前，需要判断是否属于当前会话，避免消息错乱。
   4：消息体属性说明可参考：http://rongcloud.cn/docs/api/js/index.html
   */
  RongIMClient.setOnReceiveMessageListener({
    // 接收到的消息
    onReceived: function (message) {
      // 判断消息类型
      switch(message.messageType){
        case RongIMClient.MessageType.TextMessage:
        case RongIMClient.MessageType.VoiceMessage:
        case RongIMClient.MessageType.ImageMessage:
        case RongIMClient.MessageType.RichContentMessage:
          break;
        case RongIMClient.MessageType.DiscussionNotificationMessage:
          // message.content.extension => 讨论组中的人员。
          break;
        case RongIMClient.MessageType.LocationMessage:
          // message.content.latiude => 纬度。
          // message.content.longitude => 经度。
          // message.content.content => 位置图片 base64。
          break;

        case RongIMClient.MessageType.InformationNotificationMessage:
          // do something...
          break;
        case RongIMClient.MessageType.ContactNotificationMessage:
          // do something...
          break;
        case RongIMClient.MessageType.ProfileNotificationMessage:
          // do something...
          break;
        case RongIMClient.MessageType.CommandNotificationMessage:
          // do something...
          break;
        case RongIMClient.MessageType.CommandMessage:
          // do something...
          break;
        case RongIMClient.MessageType.UnknownMessage:
          // do something...
          break;
        default:
        // do something...
      }
      callbacks.receiveNewMessage && callbacks.receiveNewMessage(message);
    }
  });

  //开始链接
  RongIMClient.connect(token, {
    onSuccess: function(userId) {
      callbacks.getCurrentUser && callbacks.getCurrentUser({userId:userId});
      console.log("链接成功，用户id：" + userId);
      store.commit('SET_INIT_STATUS', true)
    },
    onTokenIncorrect: function() {
      console.log('token无效');
      Message({
        message: 'token无效，首次登陆可能会出现token无效的情况，等待片刻再刷新就好',
        type: 'error',
        duration: 5 * 1000
      })
    },
    onError:function(errorCode) {
      console.log(errorCode);
      Message({
        message: '己方未接听，刷新页面中',
        type: 'error',
        duration: 3 * 1000
      })
      // reconnect()
      window.location.reload()
    }
  });
}

export function reconnect() {
  let RongIMLib = window.RongIMLib;
  let RongIMClient = RongIMLib.RongIMClient;

  let start = new Date().getTime();
  let begin = new Date().getTime();
  RongIMClient.reconnect({
    onSuccess: function(userId) {
      store.commit('SET_INIT_STATUS', true)
      console.log(`重新链接 成功，用户id：${userId}; ` + start)
      Message({
        message: "重新链接 成功",
        type: 'success',
        duration: 5 * 1000
      })
    },
    onTokenIncorrect: function() {
      //console.log('token无效');
      console.log("重新链接 失败 token无效", start)
      Message({
        message: "重新链接 失败 token无效",
        type: 'error',
        duration: 5 * 1000
      })
    },
    onError:function(errorCode){
      var info = '';
      switch (errorCode) {
        case RongIMLib.ErrorCode.TIMEOUT:
          info = '超时';
          break;
        case RongIMLib.ErrorCode.UNKNOWN_ERROR:
          info = '未知错误';
          break;
        case RongIMLib.ErrorCode.UNACCEPTABLE_PROTOCOL_VERSION:
          info = '不可接受的协议版本';
          break;
        case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
          info = 'appkey不正确';
          break;
        case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
          info = '服务器不可用';
          break;
      }
      console.log(info);
      Message({
        message: info,
        type: 'error',
        duration: 5 * 1000
      })
    }
  });
}
