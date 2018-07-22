<template>
  <a v-if="conversation.targetId && info.isExist" @click="toChat(info)" class="conversation">
    <div class="face">
      <img v-if="info.headimgurl" :src="info.headimgurl" alt="">
      <img v-else="" src="../../assets/image/head.png" >
    </div>
    <div class="info">
      <div class="name">{{ info.nickname || conversation.targetId }}</div>
      <div class="msg" v-html="info.msgContent"></div>
    </div>
    <div class="extra">
      <div class="date">{{ info.sentTime|humanizeTime }}</div>
      <div class="num" v-if="info.unreadMessageCount">{{ info.unreadMessageCount }}</div>
    </div>
  </a>
</template>

<script>
  import { mapGetters } from 'vuex'
  let moment = require('moment')

  export default {
    name: 'ConversationItem',
    props: [
      'conversation'
    ],
    data () {
      return {

      }
    },
    computed: {
      ...mapGetters(['objGroups', 'objFriends', 'userId']),
      info () {
        let conversation = this.conversation
        let info = {
          targetId: conversation.targetId,
          conversationType: conversation.conversationType,
          sentTime: conversation.latestMessage.sentTime,
          unreadMessageCount: conversation.unreadMessageCount,
          latestMessage: conversation.latestMessage,
          msgContent: ''
        }
        switch (conversation.conversationType) {
          case 1:
            info.isExist = true // !!this.objFriends[conversation['targetId']]
            info.headimgurl = this.objFriends[conversation['targetId']] && this.objFriends[conversation['targetId']].headimgurl
            info.nickname = this.objFriends[conversation['targetId']] && (this.objFriends[conversation['targetId']].nickname  || this.objFriends[conversation['targetId']].studentid)
            info.studentid = this.objFriends[conversation['targetId']] && this.objFriends[conversation['targetId']].studentid
            break;
          case 3:
            info.isExist = true // !!this.objGroups[conversation['targetId']]
            info.headimgurl = this.objGroups[conversation['targetId']] && this.objGroups[conversation['targetId']].groupHeadimgurl
            info.nickname = this.objGroups[conversation['targetId']] && this.objGroups[conversation['targetId']].groupName
            if (conversation.mentionedMsg && conversation.mentionedMsg.mentionedInfo) {
              if ((conversation.mentionedMsg.mentionedInfo.type == 1) || (conversation.mentionedMsg.mentionedInfo.userIdList && conversation.mentionedMsg.mentionedInfo.userIdList.indexOf(this.userId) > -1)
              ) {
                info.msgContent += '<span style="color: #f00;">[有人@我] </span>'
              }
            }
            break;
          default:

            break;
        }
        let message = conversation.latestMessage.content
        switch (conversation.latestMessage.objectName) {
          case 'RC:TxtMsg':
            var content = message.content.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');
            if (RongIMLib.RongIMEmoji && RongIMLib.RongIMEmoji.emojiToHTML) {
              content = RongIMLib.RongIMEmoji.emojiToHTML(content)
            }
            info.msgContent += content
            break;
          case 'RC:ImgMsg':
            info.msgContent += '[图片]'
            break;
          case 'RC:VcMsg':
            info.msgContent += '[语音]'
            break;
          case 'RC:ImgTextMsg':
            info.msgContent += '[图文]'
            break;
          case 'RC:LBSMsg':
            info.msgContent += '[位置]'
            break;
          case 'RC:FileMsg':
            info.msgContent += '[文件]' + ' ' + message.name
            break;
          case 'RC:CmdNtf':
          case 'RC:ContactNtf':
            info.msgContent += '[通知消息]'
            break;
          case 'RC:RcCmd':
            info.msgContent += '[一条消息被撤回]'
            break;
          case 'RC:InfoNtf':
            info.msgContent += message.message
            break;
          case 'RC:GrpNtf':
            info.msgContent += message.message
            break;
          case 'RC:DizNtf':

            break;
          default:

            break;
        }

        if (conversation.draft) {
          info.msgContent = '<span style="color: #f00;">[草稿] </span>' + conversation.draft
        }

        info.latestMessage.content = message
        this.$set(conversation, 'nickname', info.nickname)
        this.$set(conversation, 'studentid', info.studentid)
        return info
      }
    },
    filters: {
      humanizeTime (timestamp) {
        let str = ''
        if (moment(moment(timestamp).format('YYYY-MM-DD HH:mm')).isBetween(moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD HH:mm:ss'))) {
          str = moment(timestamp).format('HH:mm')
        } else {
          str = moment(timestamp).format('M-D')
        }
        return str
      }
    },
    created () {

    },
    methods: {
      toChat (info) {
        this.$router.push({ name: 'Chat', params: { targetId: info.targetId, conversationType: info.conversationType } })
      }
    },
    watch: {

    }
  }
</script>


<style scoped rel="stylesheet/scss" lang="scss">
  .conversations-bar {
    background-color: #f5f8fc;
  }
  .conversation-list {
    list-style: none;
    padding-left: 0;
    .conversation-item {

    }
    .conversation {
      display: flex;
      align-items: flex-start;
      justify-content: start;
      padding: 8px 10px;
      cursor: pointer;
      text-decoration: inherit;
      color: inherit;
      border-bottom: 1px solid #e1e9f1;
      &:active,
      &:hover {
        background-color: #ebf2f7;
      }
      .face {
        width: 55px;
        height: 55px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 5px;
        flex-shrink: 0;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .info {
        flex: 1;
        font-size: 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        .name {
          margin-bottom: 5px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .msg {
          font-size: 14px;
          color: #999;
          overflow: hidden;
          /*word-break: break-all;*/
          /*display: -webkit-box;*/
          /*-webkit-line-clamp: 2;*/
          /*-webkit-box-orient: vertical;*/
          /*max-height: 3em;*/
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
      .extra {
        font-size: 13px;
        flex-shrink: 0;
        width: 30px;
        text-align: right;
        .date {
          color: #999;
          margin-bottom: 5px;
        }
        .num {
          font-size: 12px;
          display: inline-block;
          padding: 2px 6px;
          background-color: #09f;
          border-radius: 15px;
          text-align: center;
          color: #fff;
        }
      }
    }
  }
</style>
