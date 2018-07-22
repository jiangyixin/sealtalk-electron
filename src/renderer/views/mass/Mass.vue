<template>
  <el-container>
    <el-header>
      <el-button class="btn-left" icon="el-icon-arrow-left" @click="$router.back()"></el-button>
      <h3>群发消息</h3>
    </el-header>
    <el-main>
      <div class="msg-block">
        <ul class="msg-list">
          <li class="msg-item" v-for="(msg, index) in msgList">
            <div class="msg-card" :class="msg.type">
              <div class="operate-row">
                <el-button @click="handleArrowUp(msg, index)" v-if="index != 0" icon="el-icon-arrow-up" circle></el-button>
                <el-button @click="handleArrowDown(msg, index)" v-if="index != msgList.length-1" icon="el-icon-arrow-down" circle></el-button>
                <rc-image v-if="msg.type == 'image'" v-on:on-success="handleEditImage">
                  <slot>
                    <span @click="handleEdit(msg, index)" class="btn-icon-edit"><i class="el-icon-edit"></i></span>
                  </slot>
                </rc-image>
                <el-button v-else="" @click="handleEdit(msg, index)" icon="el-icon-edit" circle class="btn-edit"></el-button>
                <el-button @click="handleDelete(msg, index)" icon="el-icon-delete" circle></el-button>
              </div>
              <div v-if="msg.type == 'text'" v-html="emojoToHTML(msg.content)" class="msg-text"></div>
              <div v-if="msg.type == 'image'" class="msg-image">
                <img :src="msg.imageUri || msg.content" alt="">
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="btn-row">
        <div>
          <label>定时发送：</label>
          <el-date-picker
            v-model="sendTime"
            type="datetime"
            placeholder="选择发送时间">
          </el-date-picker>
        </div>
        <el-button @click="sendMassMsg" type="primary" >{{ sendText }}</el-button>
      </div>
      <div class="input-block">
        <div class="input-box">
          <div class="operate-row">
            <a @click="toggleShowEmojo" class="operate-item">
              <icon name="meh-o"></icon>
              <emojo v-model="showEmojo" v-on:execCommandEmojo="execCommandEmojo" @update:value="val => showEmojo = val"></emojo>
            </a>
            <div class="operate-item" style="position: static;">
              <rc-image v-on:on-success="execCommandImage"></rc-image>
            </div>
          </div>
          <div class="message-form">
            <el-input
              id="replyText"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 15 }"
              placeholder="请输入内容"
              @keydown.native="hotKeyAddMessage"
              resize="none"
              v-model="replyText">
            </el-input>
            <el-button class="btn-send" type="primary" @click="addMessage"> 添加<br>{{ hotKey }}</el-button>
          </div>
        </div>
      </div>
    </el-main>
    <input-dialog v-model.sync="showInputDialog" :message="editMsg"></input-dialog>
  </el-container>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Emojo from '../../components/input-box/Emoji.vue'
  import RcImage from '../../components/input-box/Image.vue'
  import InputDialog from '../../components/input-box/InputDialog.vue'
  import cache from '../../utils/sessionStorage'

  export default {
    name: 'Mass',
    components: {
      Emojo, RcImage, InputDialog
    },
    data () {
      return {
        $replyText: null,
        replyText: '',
        showEmojo: false,
        msgList: [],
        msgListCacheKey: 'mass-msg-list',
        showInputDialog: false,
        editMsg: {
          type: '',
          content: '',
          extra: ''
        },
        sendTime: ''
      }
    },
    computed: {
      ...mapGetters(['selectGroupIds', 'sendGroupType', 'bus', 'sendHotKey']),
      draft () {
        let key = 'mass-draft'
        return cache.get(key) || ''
      },
      hotKey () {
        let fKey = this.sendHotKey.functionKeys.join('+')
        return fKey ? fKey + '+' + this.sendHotKey.editKey : this.sendHotKey.editKey
      },
      sendText () {
        if (this.sendTime > Date.now()) {
          return '定时发送'
        } else {
          return '立即发送'
        }
      }
    },
    created () {
      this.msgList = cache.get(this.msgListCacheKey) || []
      this.bus.$on('import-messages', (messages) => {
        this.msgList = messages
      })
    },
    mounted () {
      this.$replyText = document.getElementById('replyText')
      this.replyText = this.draft
    },
    beforeDestroy () {
      cache.set(this.msgListCacheKey, this.msgList)
    },
    methods: {
      emojoToHTML (emojo) {
        if (RongIMLib.RongIMEmoji && RongIMLib.RongIMEmoji.emojiToHTML) {
          return RongIMLib.RongIMEmoji.emojiToHTML(emojo)
        } else {
          return emojo
        }
      },
      handleArrowUp (msg, index) {
        if (index <= 0) return
        this.msgList.splice(index - 1, 0, ...this.msgList.splice(index, 1));
      },
      handleArrowDown (msg, index) {
        if (index >= this.msgList.length-1) return
        this.msgList.splice(index + 1, 0, ...this.msgList.splice(index, 1));
      },
      handleEdit (msg, index) {
        if (msg.type == 'text') {
          this.showInputDialog = true
          this.editMsg = msg
        } else if (msg.type == 'image') {
          this.editMsg = msg
        }
      },
      handleDelete (msg, index) {
//        this.$confirm('确定删除？', '提示', {
//          confirmButtonText: '确定',
//          cancelButtonText: '取消',
//          type: 'warning'
//        }).then(() => {
          this.msgList.splice(index, 1)
//        })
      },
      handleEditImage (image) {
        this.editMsg.content = image.content
        this.editMsg.imageUri = image.imageUri
      },
      symbolToEmoji (symbol) {
        if (RongIMLib.RongIMEmoji && RongIMLib.RongIMEmoji.symbolToEmoji) {
          return RongIMLib.RongIMEmoji.symbolToEmoji(symbol)
        } else {
          return symbol
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
      execCommandImage (image) {
        let message = {
          type: 'image',
          content: image.content,
          imageUri: image.imageUri,
          extra: ''
        }
        this.msgList.push(message)
      },
      hotKeyAddMessage (e) {
        if (e.location === 0) {
          let functionKeys = []
          if (e.altKey) functionKeys.push('alt')
          if (e.ctrlKey) functionKeys.push('ctrl')
          if (e.shiftKey) functionKeys.push('shift')
          if (e.metaKey) functionKeys.push('meta')
          let editKey = e.key.toLowerCase()
          if (editKey === this.sendHotKey.editKey && functionKeys.sort().toString() === this.sendHotKey.functionKeys.sort().toString()) {
            this.addMessage()
          }
        }
      },
      addMessage () {
        let replyText = this.replyText = this.$replyText.value || ''
        if (!replyText.trim()) return
        if (this.msgList.length >= 5) {
          this.$message({
            type: 'warning',
            message: '一次最多发送5条消息'
          })
          return
        }
        let message = {
          type: 'text',
          content: this.symbolToEmoji(replyText),
          extra: ''
        }
        this.msgList.push(message)
        this.replyText = ''
      },
      sendMassMsg () {
        let errMsg = ''
        if (!this.selectGroupIds || this.selectGroupIds.length <= 0) {
          errMsg = '请选择群聊'
        } else if (!this.msgList || this.msgList.length <= 0) {
          errMsg = '请添加消息'
        }
        if (errMsg) {
          this.$message({
            type: 'error',
            message: errMsg
          })
          return
        }
        this.$confirm(`${this.sendText}消息？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let form = {
            toGroupIds: this.selectGroupIds.toString(),
            messages: this.msgList
          }
          if (this.sendTime && this.sendTime > new Date()) {
            form.sendTime = parseInt(new Date(this.sendTime).getTime()/1000)
          }
          if (this.sendGroupType < 2) {
            form.isMentioned = this.sendGroupType
            this.$store.dispatch('massGroups', form).then(data => {
              this.msgList = []
              this.$message({
                type: 'success',
                message: '发送成功'
              })
              if (!form.sendTime) {
                this.refreshMass(data.messageId)
              }
            })
          } else if (this.sendGroupType == 2) {
            this.$store.dispatch('massUsers', form).then(data => {
              this.msgList = []
              this.$message({
                type: 'success',
                message: '发送成功'
              })
              if (!form.sendTime) {
                this.refreshMass(data.messageId)
              }
            })
          }
        })
      },
      refreshMass (massId) {
        this.$store.dispatch('getMass', massId).then(data => {
          if (data.status == 'sending') {
            setTimeout(() => {
              this.refreshMass(massId)
            }, 1000)
          }
        })
      }
    },
  }

</script>

<style scoped rel="stylesheet/scss" lang="scss">

  .el-main {
    display: flex;
    flex-direction: column;
    background-color: #f5f7fa;
    .msg-block {
      flex: 1;
      overflow-y: auto;
    }
    .input-box {
      flex-shrink: 0;
      padding: 5px 5px 15px;
      background-color: #fff;
    }
  }

  .msg-list {
    list-style: none;
    padding-left: 0;
    .msg-item {
      padding: 0 15px;
      margin-bottom: 15px;
      .msg-card {
        position: relative;
        padding: 5px 10px;
        background-color: #fff;
        border-radius: 5px;
        min-height: 50px;
        .operate-row {
          display: none;
          position: absolute;
          right: 5px;
          top: 5px;
          font-size: 16px;
          & /deep/ .el-button.is-circle {
            padding: 8px;
            margin-left: 0;
            vertical-align: middle;
          }
          .choice-block {
            width: auto;
            height: auto;
            display: inline-block;
            vertical-align: middle;
            .btn-icon-edit {
              display: inline-block;
              line-height: 1;
              white-space: nowrap;
              cursor: pointer;
              background: #fff;
              border: 1px solid #dcdfe6;
              color: #606266;
              -webkit-appearance: none;
              text-align: center;
              -webkit-box-sizing: border-box;
              box-sizing: border-box;
              outline: 0;
              margin: 0;
              -webkit-transition: .1s;
              transition: .1s;
              font-size: 14px;
              border-radius: 50%;
              padding: 8px;
              &:hover, &:focus, &:active {
                color: #409EFF;
                border-color: #c6e2ff;
                background-color: #ecf5ff;
              }
            }
          }
          .btn-edit /deep/ .choice-block {

          }

        }
        &:hover, &:focus, &:active {
          .operate-row {
            display: inline-block;
          }
        }
        .msg-text {
          margin: 0;
          font-family: inherit;
          white-space: pre-wrap;
          word-wrap: break-word;
          word-break: break-all;
        }
        .msg-image {
          img {
            max-height: 200px;
            max-width: 100%;
          }
        }
      }
    }
  }

  .btn-row {
    padding: 15px 15px 20px;
    display: flex;
    justify-content: space-between;
  }

  .input-box {
    height: 100%;
    .operate-row {
      position: relative;
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

</style>
