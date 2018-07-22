<template>
  <el-container>
    <el-header>
      <el-button class="btn-left" icon="el-icon-arrow-left" @click="$router.back()"></el-button>
      <h3 class="title">{{ chatInfo.title }}</h3>
      <el-button class="btn-right" icon="el-icon-info" @click="toInfo()"></el-button>
    </el-header>
    <el-main id="chatroom">
      <div class="message-block">
        <ul class="message-list">
          <li v-for="(msg, index) in curConversation.histories" :key="index" class="message-item">
            <div class="msg-date">{{ msg.sentTime|humanizeTime(curConversation.histories[index-1] && curConversation.histories[index-1].sentTime) }}</div>
            <Message :rcMessage="msg" :owner="chatMembers[msg.senderUserId] || {}" :isMe="msg.senderUserId == userId ? true : false" v-on:showDialogImage="showDialogImage"></Message>
          </li>
        </ul>
      </div>
    </el-main>
    <el-footer height="auto">
      <div class="input-box">
        <div class="operate-row">
          <a @click="toggleShowEmojo" class="operate-item">
            <icon name="meh-o"></icon>
            <emojo v-model="showEmojo" v-on:execCommandEmojo="execCommandEmojo" @update:value="val => showEmojo = val"></emojo>
          </a>
          <div class="operate-item" style="position: static;">
            <rc-image v-on:on-preview="previewImage" :autoUpload="false"></rc-image>
          </div>
          <div class="operate-item" style="position: static;">
            <file v-on:on-preview="previewFile" :autoUpload="false"></file>
          </div>
        </div>
        <div class="message-form">
          <el-input
            id="replyText"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 15 }"
            placeholder="请输入内容"
            @keydown.native="hotKeySendMessage"
            @paste.native="onPaste"
            @drop.native.prevent="onDrop"
            resize="none"
            v-model="replyText">
          </el-input>
          <el-button class="btn-send" type="primary" @click="sendTextMessage">发送<br>{{ hotKey }}</el-button>
        </div>
      </div>
    </el-footer>
    <el-dialog :visible.sync="previewDialogVisible" class="preview-img-dialog">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </el-container>
</template>

<script>
  import Emojo from '../../components/input-box/Emoji'
  import RcImage from '../../components/input-box/Image'
  import File from '../../components/input-box/File'
  import Message from './Message.vue'
  import { mapGetters } from 'vuex'
  let moment = require('moment')
  import cache from '../../utils/sessionStorage'
//  import $ from 'jquery'
  window.jQuery = window.$ = require('jquery/dist/jquery.min')
  import '../../assets/lib/caret/jquery.caret.min'
  import '../../assets/lib/at/js/jquery.atwho.min'
  import { guid } from '../../utils/tool'

  export default {
    name: 'Chat',
    components: {
      Message, Emojo, RcImage, File
    },
    props: {
      conversationType: {
        type: Number
      },
      targetId: {
        type: String
      }
    },
    data () {
      return {
        $replyText: null,
        $chatroom: null,
        chatInfo: {
          title: ''
        },
        replyText: '',
        page: {
          first: true,
          timestamp: null,
          limit: 20,
          loading: false
        },
        chatMembers: {},
        showEmojo: false,
        previewDialogVisible: false,
        dialogImageUrl: '',
        chatNicknames: []
      }
    },
    computed: {
      ...mapGetters(['initStatus', 'userInfo', 'curConversation', 'userId', 'sendHotKey']),
      draft () {
        let key = 'draft-' + this.conversationType + '-' + this.targetId
        return cache.get(key) || ''
      },
      hotKey () {
        let fKey = this.sendHotKey.functionKeys.join('+')
        return fKey ? fKey + '+' + this.sendHotKey.editKey : this.sendHotKey.editKey
      }
    },
    created () {
      let conversation = {
        conversationType: this.conversationType,
        targetId: this.targetId,
        hasMsg: true,
        histories: []
      }
      this.$store.commit('SET_CUR_CONVERSATION', conversation)
      this.fetchChatMembers()
      let that = this
      let initInterval = setInterval(function () {
        if (that.initStatus) {
          clearInterval(initInterval)
          that.fetchLatestMessage()
          that.clearUnreadCount()
        }
      }, 500)
    },
    mounted () {
      this.$chatroom = document.getElementById('chatroom')
      this.$chatroom.addEventListener('scroll', this.fetchHistoricalMessage)
      this.$replyText = document.getElementById('replyText')
      this.replyText = this.draft
    },
    beforeRouteUpdate (to, from, next) {
      this.setDraft(this.$replyText.value)
      this.replyText = ''
      next()
    },
    beforeRouteLeave (to, from, next) {
      this.setDraft(this.$replyText.value)
      this.replyText = ''
      next()
    },
    methods: {
      setDraft (draft) {
        let key = 'draft-' + this.conversationType + '-' + this.targetId
        this.$store.commit('SET_DRAFT', [this.curConversation, draft])
        if (draft) {
          cache.set(key, draft)
        } else {
          cache.del(key)
        }
      },
      showDialogImage (imgUrl) {
        this.dialogImageUrl = imgUrl
        this.previewDialogVisible = true
      },
      toInfo () {
        if (this.conversationType == 1) {
          this.$router.push({name: 'UserInfo', params: {userId: this.targetId}})
        } else if (this.conversationType == 3) {
          this.$router.push({name: 'GroupInfo', params: { groupId: this.targetId } })
        }
      },
      clearUnreadCount () {
        this.$store.dispatch('clearUnreadCount', this.curConversation).then()
      },
      fetchChatMembers () {
        if (this.conversationType == 1) {
          let params = {
            userId: this.targetId
          }
          this.$store.dispatch('getFriendInfo', params).then(data => {
            this.chatInfo.title = data.nickname
            this.$set(this.chatMembers, this.targetId, {
              nickname: data.nickname,
              headimgurl: data.headimgurl,
              userId: data.userId
            })
          })
        } else if (this.conversationType == 3) {
          this.$store.dispatch('getMyGroupSetting', this.targetId).then(data => {
            this.chatInfo.title = data.groupName
          })
          this.$store.dispatch('getGroupMembers', this.targetId).then(data => {
            for (let member of data) {
              this.$set(this.chatMembers, member.userId, {
                userId: member.userId,
                nickname: member.groupNickname || member.nickname,
                headimgurl: member.headimgurl,
                role: member.role,
                roleName: member.roleName
              })
              if (this.userId != member.userId) {
                this.chatNicknames.push(member.groupNickname || member.nickname)
              }
            }
            this.initAt(this.chatNicknames)
          })
        }
        this.$store.dispatch('getUserProfile').then(data => {
          this.$set(this.chatMembers, data.userId, {
            userId: data.userId,
            nickname: data.nickname,
            headimgurl: data.headimgurl
          })
        })
      },
      initAt (data) {
        $('#replyText').atwho({
          at: "@",
          limit: 3000,
          data: data
        })
      },
      symbolToEmoji (symbol) {
        if (RongIMLib.RongIMEmoji && RongIMLib.RongIMEmoji.symbolToEmoji) {
          return RongIMLib.RongIMEmoji.symbolToEmoji(symbol)
        } else {
          return symbol
        }
      },
      getAtArray(item){
        let userIds = []
        let atArr = item.match(/@.*?\s/g)
        if (!atArr) return userIds
        let nameArr = []
        for (let at of atArr) {
          let name = at.replace('@', '').replace(' ', '')
          nameArr.push(name)
        }
        if (!nameArr.length) return userIds
        let userIdsSet = new Set()
        for (let member of Object.values(this.chatMembers)) {
          if (nameArr.indexOf(member.nickname) > -1) {
            userIdsSet.add(member.userId.toString())
          }
        }
        // this.chatNicknames.filter(v => nameArr.indexOf(v) > -1 )
        userIds = Array.from(userIdsSet)
        return userIds
      },
      hotKeySendMessage (e) {
        if (e.location === 0) {
          let functionKeys = []
          if (e.altKey) functionKeys.push('alt')
          if (e.ctrlKey) functionKeys.push('ctrl')
          if (e.shiftKey) functionKeys.push('shift')
          if (e.metaKey) functionKeys.push('meta')
          let editKey = e.key.toLowerCase()
          let myFunctionKeys = JSON.parse(JSON.stringify(this.sendHotKey.functionKeys))
          if (editKey === this.sendHotKey.editKey && functionKeys.sort().toString() === myFunctionKeys.sort().toString()) {
            this.sendTextMessage()
            e.preventDefault()
          }
        }
      },
      sendTextMessage () {
        let replyText = this.replyText = this.$replyText.value
        if (!replyText.trim()) {
          return
        }
        replyText = this.symbolToEmoji(replyText)
        let conversation = {
          senderUserId: this.userId,
          conversationType: this.curConversation.conversationType,
          targetId: this.curConversation.targetId,
          message: {
            content: replyText.trim(),
            extra: ''
          },
          at: false
        }
        if (this.curConversation.conversationType == 3) {
          let userIds = this.getAtArray(replyText)
          if (userIds && userIds.length) {
            let mentioneds = new RongIMLib.MentionedInfo()
            // 全部：RongIMLib.MentionedType.ALL；部分：RongIMLib.MentionedType.PART
            mentioneds.type = RongIMLib.MentionedType.PART
            mentioneds.userIdList = userIds
            conversation.message.mentionedInfo = mentioneds
            conversation.at = true
          }
        }
        conversation.content = new RongIMLib.TextMessage(conversation.message)
        this.replyText = ''
        this.$store.dispatch('sendRcMsg', conversation).then(data => {
          this.setDraft(this.replyText)
          this.refreshChatroom()
        }).catch(e => {
          console.error('sendRcMsg error', e)
          this.replyText = replyText
        })
      },
      refreshChatroom () {
        setTimeout(() => {
          this.$chatroom.scrollTop = this.$chatroom.scrollHeight
        }, 0)
      },
      fetchLatestMessage () {
        this.page.first = true
        this.page.timestamp = 0
        this.$store.dispatch('getHistoryMsg', this.page).then(data => {
          this.page.first = false
          this.refreshChatroom()
        })
      },
      fetchHistoricalMessage (e) {
        if (e.target.scrollTop <= 10 && !this.page.first && !this.page.loading && this.curConversation.hasMsg) {
          this.page.first = false
          this.page.timestamp = null
          this.page.loading = true
          let curHeight = this.$chatroom.scrollHeight
          let that = this
          this.$store.dispatch('getHistoryMsg', this.page).then(data => {
            setTimeout(function () {
              that.page.loading = false
            }, 500)
            this.$chatroom.scrollTop = this.$chatroom.scrollHeight - curHeight
          })
        }
      },
      toggleShowEmojo () {
        this.showEmojo = !this.showEmojo
      },
      execCommandEmojo (emojo) {
        this.$replyText.focus()
        let flag = document.execCommand('insertText', 'false', emojo.symbol)
        if(!flag) {
          let $text = this.$replyText
          this.replyText = $text.value.substr(0, $text.selectionStart) + emojo.symbol + $text.value.substring($text.selectionStart, $text.value.length)
        }
      },
      onDrop (e) {
        console.log('onDrop', e, e.dataTransfer, e.dataTransfer.files)
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          let file = e.dataTransfer.files[0]
          if (file.type.indexOf("image") > -1) {
            this.previewImage(file)
          } else {
            this.previewFile(file)
          }
        }
      },
      onPaste (e) {
        const items = (e.clipboardData || e.clipboardData.clipboardData).items
        Array.from(items).forEach(item => {
          if (item.kind === 'file') {
            const file = item.getAsFile()
            console.log('onPaste', e, item, file)
            if (!file) return
            e.preventDefault()
            if (item.type.indexOf("image") > -1) {
              this.previewImage(file)
            } else {
              this.previewFile(file)
            }
          }
        })
      },
      previewImage (file) {
        let previewId = guid()
        var reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = e => {
          let reg = new RegExp('data:image/[a-zA-z]+;base64,')
          let content = new RongIMLib.ImageMessage({
            content: e.target.result.replace(reg, ''),
            imageUri: '',
            extra: {previewId: previewId}
          })
          let previewMessage = {
            senderUserId: this.userId,
            conversationType: this.curConversation.conversationType,
            targetId: this.curConversation.targetId,
            content: content,
            at: false,
            previewId: previewId,
            file: file
          }
          this.$store.commit('PREVIEW_RC_MSG', previewMessage)
          setTimeout(() => {
            this.refreshChatroom()
          })
        }
      },
      previewFile (file) {
        let previewId = guid()
        let content = new RongIMLib.FileMessage({
          name: file.name,
          size: file.size,
          type: file.name.split('.').pop(),
          fileUrl: '',
          extra: {previewId: previewId}
        })
        let previewMessage = {
          senderUserId: this.userId,
          conversationType: this.curConversation.conversationType,
          targetId: this.curConversation.targetId,
          content: content,
          at: false,
          previewId: previewId,
          file: file
        }
        this.$store.commit('PREVIEW_RC_MSG', previewMessage)
        setTimeout(() => {
          this.refreshChatroom()
        })
      },
    },
    filters: {
      humanizeTime (timestamp, preTimestamp) {
        let str = ''
        if (preTimestamp && timestamp - preTimestamp < 3*60*1000) {
          return str
        }
        if (moment(moment(timestamp).format('YYYY-MM-DD HH:mm:ss')).isBetween(moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD HH:mm:ss'))) {
          str = moment(timestamp).format('HH:mm')
        } else {
          str = moment(timestamp).format('Y-M-D HH:mm')
        }
        return str
      }
    },
    watch: {
      targetId (val, oldVal) {
        this.chatNicknames = []
        this.chatMembers = {}
        let conversation = {
          conversationType: this.conversationType,
          targetId: this.targetId,
          hasMsg: true,
          histories: []
        }
        this.$store.commit('SET_CUR_CONVERSATION', conversation)
        this.fetchChatMembers()
        this.fetchLatestMessage()
        this.clearUnreadCount()
        this.replyText = this.draft
      },
      'curConversation.newMsg': function (val, oldVal) {
        this.refreshChatroom()
      }
    }
  }
</script>
<style>
  @import "../../assets/lib/at/css/jquery.atwho.min.css";
</style>
<style scoped rel="stylesheet/scss" lang="scss">

  .el-container {
    background-color: #f5f7fa;
    overflow: hidden;
  }
  .el-main {
    overflow-y: auto;
  }

  .preview-img-dialog {
    & /deep/ .el-dialog {
      background-color: #000;
    }
  }

  .message-block {
    .message-list {
      list-style: none;
      padding-left: 0;
      .message-item {
        margin: 0 5px 20px 5px;
      }
    }
  }

  .msg-date {
    margin: 5px 0;
    text-align: center;
    color: #aaa;
    font-size: 14px;
  }

  .el-footer {
    position: relative;
    background-color: #fff;
    padding-bottom: 10px;
    .input-box {
      height: 100%;
      .operate-row {
        padding: 10px 5px 0;
        color: #c7c7c7;
        .operate-item {
          position: relative;
          display: inline-block;
          cursor: pointer;
          font-size: 20px;
          width: 20px;
          height: 20px;
          text-align: center;
          &+.operate-item {
            margin-left: 10px;
          }
          &:hover, &:focus, &:active {
            color: #38a0fe;
          }
        }
      }
      .progress-row {

      }
      .message-form {
        display: flex;
        align-items: center;
        justify-content: start;
        padding: 0 5px;
        .text-area {
          min-height: 70px;
          flex: 1;
          outline: none;
          border: 1px solid #eee;
          border-radius: 2px;
          padding: 5px;
        }
        .btn-send {
          margin-left: 5px;
          flex-shrink: 0;
          padding: 5px;
          height: 72px;
          width: 100px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
  }

  pre[contenteditable]:empty:not(:focus):before {
    content: attr(placeholder);
    color: #aaa;
  }
</style>
