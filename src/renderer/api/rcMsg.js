import { Message } from 'element-ui'

let msgTypes = {
  1: RongIMLib.ConversationType.PRIVATE,            // 二人单聊会话类型
  2: RongIMLib.ConversationType.DISCUSSION,         // 讨论组会话类型
  3: RongIMLib.ConversationType.GROUP,              // 群组会话类型
  4: RongIMLib.ConversationType.CHATROOM,           // 聊天室会话类型
  5: RongIMLib.ConversationType.CUSTOMER_SERVICE,   // 客服会话类型
  6: RongIMLib.ConversationType.SYSTEM,             // 系统消息类型
  7: RongIMLib.ConversationType.APP_PUBLIC_SERVICE, // 公众账号（默认关注）会话类型
  8: RongIMLib.ConversationType.PUBLIC_SERVICE      // 公众账号 (手动关注) 会话类型
}

export function getConversations() {
  return new Promise((resolve, reject) => {
    RongIMClient.getInstance().getConversationList({
      onSuccess: function (list) {
        resolve(list)
      },
      onError: function (error) {
        reject(error)
      }
    }, null, 500)
  })
}

export function delConversation(conversation) {
  return new Promise((resolve, reject) => {
    RongIMClient.getInstance().removeConversation(conversation.conversationType, conversation.targetId, {
      onSuccess:function(bool){
        resolve(bool)
      },
      onError:function(error){
        reject(error)
      }
    })
  })
}

export function getTotalUnreadCount() {
  return new Promise((resolve, reject) => {
    RongIMClient.getInstance().getTotalUnreadCount({
      onSuccess: function (count) {
        resolve(count)
      },
      onError: function (error) {
        reject(error)
      }
    })
  })
}

export function clearUnreadCount(msgType, targetId) {
  // console.log('----clearUnreadCount---', msgType, targetId)
  let conversationType = msgTypes[msgType]
  return new Promise((resolve, reject) => {
    RongIMClient.getInstance().clearUnreadCount(conversationType, targetId,{
      onSuccess:function(){
        resolve()
      },
      onError:function(error){
        reject(error)
      }
    });
  })
}

let sendSyncReadStatusMessage = function (conversationType, targetId) {
  let sentTime = new Date().getTime()
  let content = {
    lastMessageSendTime: sentTime
  }
  let msg = new RongIMLib.SyncReadStatusMessage(content)
  return new Promise((resolve, reject) => {
    RongIMClient.getInstance().sendMessage(conversationType, targetId, msg, {
      onSuccess: function (message) {
        console.log('同步消息成功', message, sentTime)
        resolve(message)
      },
      onError: function (errorCode, message) {
        console.log("同步消息失败", errorCode, message, sentTime)
        reject([errorCode, message])
      }
    })
  })
}

/**
 *
 * @param msgType
 * @param targetId
 * @param timestamp // 默认传 null，若从头开始获取历史消息，请赋值为 0 ,timestamp = 0;
 * @param count // 每次获取的历史消息条数，范围 0-20 条，可以多次获取。
 */
export function getHistoryMsg(msgType, targetId, timestamp = null, count = 20) {
  let conversationType = msgTypes[msgType]
  return new Promise((resolve, reject) => {
    RongIMLib.RongIMClient.getInstance().getHistoryMessages(conversationType, targetId, timestamp, count, {
      onSuccess: function (list, hasMsg) {
        resolve([list, hasMsg])
      },
      onError: function (error) {
        console.log("GetHistoryMessages,errorcode:" + error);
        reject(error)
      }
    })
  })
}

export function sendRecallMessage(recallMessage) {
  return new Promise((resolve, reject) => {
    RongIMClient.getInstance().sendRecallMessage(recallMessage, {
      onSuccess: function (message) {
        console.log("撤回成功",message)
        resolve(message)
      },
      onError: function (errorCode, message) {
        reject([errorCode, message])
        console.log("撤回失败", errorCode, message)
        Message({
          message: '撤回失败:' + errorCode,
          type: 'error',
          duration: 5 * 1000
        })
      }})
  })
}

export function sendTextMsg(msgType, targetId, message, at) {
  let rcMsg = new RongIMLib.TextMessage(message)
  return sendRcMsg(msgType, targetId, rcMsg, at).then(message => {
    return message
  })
}

export function sendRcMsg (msgType, targetId, rcMsg, at) {
  let conversationType = msgTypes[msgType]
  return new Promise((resolve, reject) => {
    RongIMClient.getInstance().sendMessage(conversationType, targetId, rcMsg, {
      onSuccess: function (message) {
        //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
        console.log("Send successfully", message)
        sendSyncReadStatusMessage(conversationType, targetId).then(data => {})
        resolve(message)
      },
      onError: function (errorCode, message) {
        let info = '';
        switch (errorCode) {
          case RongIMLib.ErrorCode.TIMEOUT:
            info = '超时';
            break;
          case RongIMLib.ErrorCode.UNKNOWN_ERROR:
            info = '未知错误';
            break;
          case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
            info = '在黑名单中，无法向对方发送消息';
            break;
          case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
            info = '不在讨论组中';
            break;
          case RongIMLib.ErrorCode.NOT_IN_GROUP:
            info = '不在群组中';
            break;
          case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
            info = '不在聊天室中';
            break;
          default :
            info = x;
            break;
        }
        console.log('发送失败:' + info);
        Message({
          message: '发送失败:' + info,
          type: 'error',
          duration: 5 * 1000
        })
        reject(info)
      }
    }, at)
  })
}
