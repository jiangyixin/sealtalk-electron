import { getRCToken } from '../../api/user'
import { getHistoryMsg, sendRcMsg, sendTextMsg, clearUnreadCount, sendRecallMessage, delConversation } from '../../api/rcMsg'
import cache from '../../utils/sessionStorage'
import localCache from '../../utils/localStorage'

const rc = {
  state: {
    rcToken: '',
    initStatus: false,
    conversations: localCache.get('rc-conversations') || [],
    curConversation: {
      conversationType: 0,
      targetId: 0,
      hasMsg: true,
      histories: [],
      newMsg: 0,
      hasHistoryMsg: false
    },
    rcHistories: {},
    msgObjMap: {
      'TextMessage': 'RC:TxtMsg',
      'ImageMessage': 'RC:ImgMsg',
      'FileMessage': 'RC:FileMsg'
    }
  },
  mutations: {
    SET_RC_TOKEN: (state, rcToken) => {
      state.rcToken = rcToken
    },
    SET_INIT_STATUS: (state, status) => {
      state.initStatus = status
    },
    SET_CONVERSATIONS: (state, conversations) => {
      state.conversations = conversations
    },
    SET_CUR_CONVERSATION: (state, conversation) => {
      // state.curConversation = conversation
      // Object.assign(state.curConversation, conversation)
      Object.assign(state.curConversation, JSON.parse(JSON.stringify(conversation)))
      // state.curConversation = Object.assign({}, state.curConversation, conversation)
    },
    ADD_OLD_HISTORY: (state, [list, hasMsg, hasHistoryMsg]) => {
      state.curConversation.histories.unshift(...list)
      state.curConversation.hasMsg = hasMsg
      state.curConversation.hasHistoryMsg = hasHistoryMsg
    },
    PREVIEW_RC_MSG: (state, message) => {
      let previewMessage = Object.assign(message, {
        content: message.content,
        sentTime: Date.now(),
        messageType: message.content.messageName,
        objectName: state.msgObjMap[message.content.messageName],
      })
      state.curConversation.histories.push(previewMessage)
      let key = previewMessage.conversationType + '-' + previewMessage.targetId
      if (state.rcHistories[key]) {
        state.rcHistories[key].histories.push(previewMessage)
      } else {
        state.rcHistories[key] = {
          histories: [previewMessage],
          hasMsg: true
        }
      }
    },
    UPDATE_PREVIEW_MESSAGE: (state, [params, message]) => {
      let previewId = params.previewId
      let key = params.conversationType + '-' + params.targetId
      if (!previewId) return
      for (let i in state.curConversation.histories) {
        let item = state.curConversation.histories[i]
        if (item.content.extra && item.content.extra.previewId === previewId) {
          // state.curConversation.histories.splice(i, 1, message)
          Object.assign(state.curConversation.histories[i], message)
          break
        }
      }
      for (let i = 0; i < state.rcHistories[key].histories.length; i++) {
        let item = state.rcHistories[key].histories[i]
        if (item.content.extra && item.content.extra.previewId === previewId) {
          // state.rcHistories[key].histories.splice(i, 1, message)
          Object.assign(state.rcHistories[key].histories[i], message)
          break
        }
      }
    },
    ADD_NEW_HISTORY: (state, message) => {
      state.curConversation.histories.push(message)
      let key = message.conversationType + '-' + message.targetId
      if (state.rcHistories[key]) {
        state.rcHistories[key].histories.push(message)
      } else {
        state.rcHistories[key] = {
          histories: [message],
          hasMsg: true
        }
      }
    },
    CLEAR_UNREAD_COUNT: (state, conversation) => {
      for (let i in state.conversations) {
        if (state.conversations[i].targetId == conversation.targetId) {
          state.conversations[i].unreadCount = 0
          break
        }
      }
    },
    SET_DRAFT: (state, [conversation, draft]) => {
      for (let i in state.conversations) {
        if ((state.conversations[i].targetId == conversation.targetId) && (state.conversations[i].conversationType == conversation.conversationType)) {
          state.conversations[i].draft = draft
          if (draft) {
            state.conversations[i].sentTime = Date.now()
          }
          break
        }
      }
    },
    RECEIVE_NEW_MESSAGE: (state, message) => {
      if (message.objectName == 'RC:TypSts' || message.objectName == 'RC:SRSMsg') {
        return
      }
      let targetId = message.targetId
      for (let i in state.conversations) {
        if (state.conversations[i].targetId == targetId) {
          state.conversations[i].latestMessage = message
          state.conversations[i].sentTime = message.sentTime
          state.conversations[i].sentStatus = message.sentStatus
          state.conversations[i].objectName = message.objectName
          state.conversations[i].notificationStatus = message.sentStatus
          state.conversations[i].latestMessageId = message.messageId
          if (message.objectName == 'RC:RcCmd' && state.conversations[i] && state.conversations[i].unreadMessageCount) {
            if (state.conversations[i].unreadMessageCount > 2) {
              state.conversations[i].unreadMessageCount = state.conversations[i].unreadMessageCount - 2
            } else {
              state.conversations[i].unreadMessageCount = 0
            }
          }
          break
        }
      }
      if (state.curConversation.targetId == targetId) {
        if (message.objectName == 'RC:RcCmd') { // 撤回消息
          for (let i = 0; i < state.curConversation.histories.length; i++) {
            if (state.curConversation.histories[i].messageUId == message.content.messageUId) {
              state.curConversation.histories.splice(i, 1)
              state.curConversation.histories.push(message)
              break
            }
          }
        } else {
          state.curConversation.histories.push(message)
        }
        state.curConversation.newMsg++
      }

      let key = message.conversationType + '-' + targetId
      if (state.rcHistories[key] && message.objectName == 'RC:RcCmd') { // 撤回消息
        for (let i = 0; i < state.rcHistories[key].histories.length; i++) {
          if (state.rcHistories[key].histories[i].messageUId == message.content.messageUId) {
            state.rcHistories[key].histories.splice(i, 1)
            state.rcHistories[key].histories.push(message)
            break
          }
        }
      } else {
        if (state.rcHistories[key]) {
          state.rcHistories[key].histories.push(message)
        } else {
          state.rcHistories[key] = {
            histories: [message],
            hasMsg: true
          }
        }
      }
    },
    RECALL_MESSAGE: (state, message) => {
      if (message.objectName !== 'RC:RcCmd') return
      let targetId = message.content.targetId
      let key = message.conversationType + '-' + targetId

      if (state.curConversation.targetId == targetId) {
        state.curConversation.newMsg++
        for (let i = 0; i < state.curConversation.histories.length; i++) {
          if (state.curConversation.histories[i].messageUId == message.content.messageUId) {
            state.curConversation.histories.splice(i, 1)
            state.curConversation.histories.push(message)
            break
          }
        }
      }

      for (let i = 0; i < state.rcHistories[key].histories.length; i++) {
        if (state.rcHistories[key].histories[i].messageUId == message.content.messageUId) {
          state.rcHistories[key].histories.splice(i, 1)
          state.rcHistories[key].histories.push(message)
          break
        }
      }

      for (let i in state.conversations) {
        if (state.conversations[i].targetId == targetId) {
          state.conversations[i].latestMessage = message
          state.conversations[i].sentTime = message.sentTime
          state.conversations[i].sentStatus = message.sentStatus
          state.conversations[i].objectName = message.objectName
          state.conversations[i].notificationStatus = message.sentStatus
          state.conversations[i].latestMessageId = message.messageId
          break
        }
      }
    },
    SET_HISTORIES: (state, conversation) => {
      let key = conversation.conversationType + '-' + conversation.targetId
      if (state.rcHistories[key]) {
        state.rcHistories[key].histories.unshift(...conversation.histories)
        state.rcHistories[key].hasMsg = conversation.hasMsg
      } else {
        state.rcHistories[key] = {
          histories: conversation.histories,
          hasMsg: conversation.hasMsg,
          hasHistoryMsg: conversation.hasHistoryMsg
        }
      }
    },
    DEL_CONVERSATION: (state, conversation) => {
      for (let i in state.conversations) {
        if (state.conversations[i].conversationType == conversation.conversationType && state.conversations[i].targetId == conversation.targetId) {
          state.conversations.splice(i, 1)
          break
        }
      }
    }
  },
  actions: {
    getRCToken({commit}) {
      let key = 'rcToken'
      if (cache.has(key)) {
        commit('SET_RC_TOKEN', cache.get(key))
        return Promise.resolve(cache.get(key))
      } else {
        return getRCToken().then(data => {
          commit('SET_RC_TOKEN', data.token)
          cache.set(key, data.token)
          return data.token
        })
      }
    },
    getHistoryMsg({commit, state}, params) {
      let key = state.curConversation.conversationType + '-' + state.curConversation.targetId
      if (state.rcHistories[key] && params.first && state.curConversation.hasHistoryMsg) {
        commit('SET_CUR_CONVERSATION', state.rcHistories[key])
        return Promise.resolve(state.curConversation)
      } else if (state.curConversation.histories && !state.curConversation.hasMsg) {
        return Promise.resolve(state.curConversation)
      } else {
        if (state.rcHistories[key] && state.rcHistories[key].histories && state.rcHistories[key].histories.length) {
          let startHistory = state.rcHistories[key].histories[0]
          params.timestamp = startHistory.sentTime
        }
        return getHistoryMsg(state.curConversation.conversationType, state.curConversation.targetId, params.timestamp, params.limit).then(([list, hasMsg]) => {
          // commit('ADD_OLD_HISTORY', [list, hasMsg, true])
          commit('SET_HISTORIES', {conversationType: state.curConversation.conversationType, targetId: state.curConversation.targetId, histories: list, hasMsg: hasMsg, hasHistoryMsg: true})
          commit('SET_CUR_CONVERSATION', state.rcHistories[key])
          return state.curConversation
        })
      }
    },
    sendRecallMessage({commit}, recallMessage) {
      return sendRecallMessage(recallMessage)
        .then(message => {
          commit('RECALL_MESSAGE', message)
          return message
        })
    },
    sendRcMsg({commit}, message) {
      return sendRcMsg(message.conversationType, message.targetId, message.content, message.at)
        .then(message => {
          if (message.content.extra && message.content.extra.previewId) {
            commit('UPDATE_PREVIEW_MESSAGE', [{
              previewId: message.content.extra.previewId,
              conversationType: message.conversationType,
              targetId: message.targetId
            }, message])
          } else {
            commit('ADD_NEW_HISTORY', message)
          }
          return message
        })
    },
    sendTextMsg({commit, state}, conversation) {
      return sendTextMsg(conversation.conversationType, conversation.targetId, conversation.message, conversation.at)
        .then((message) => {
          commit('ADD_NEW_HISTORY', message)
          return message
        })
    },
    clearUnreadCount({commit}, conversation) {
      return clearUnreadCount(conversation.conversationType, conversation.targetId).then(() => {
        commit('CLEAR_UNREAD_COUNT', conversation)
        return true
      })
    },
    delConversation({commit}, conversation) {
      return delConversation(conversation).then((bool) => {
        commit('DEL_CONVERSATION', conversation)
        return bool
      })
    }
  },
  getters: {
    rcToken: state => state.rcToken,
    initStatus: state => state.initStatus,
    conversations: state => state.conversations,
    curConversation: state => state.curConversation,
    rcHistories: state => state.rcHistories
  }
}

export default rc
