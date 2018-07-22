<template>
  <div class="msg-card" v-if="rcMessage">
    <template v-if="rcMessage.objectName == 'RC:InfoNtf'">
      <div class="info-ntf">{{ rcMessage.content.message }}</div>
    </template>
    <template v-else-if="['RC:TxtMsg', 'RC:ImgMsg', 'RC:VcMsg', 'RC:FileMsg'].indexOf(rcMessage.objectName) > -1">
      <div class="normal-ntf" :class="{ me: isMe }">
        <router-link :to="{name: 'UserInfo', params: { userId: rcMessage.senderUserId}, query: {applyFrom: 'group', fromRemark: rcMessage.targetId}}" class="face">
          <img v-if="owner.headimgurl" :src="owner.headimgurl" alt="">
          <img v-else="" src="../../assets/image/head.png" >
        </router-link>
        <div class="info">
          <div class="name">
            <span class="vc">{{ owner.groupNickname || owner.nickname || rcMessage.senderUserId }}</span>
            <el-tag v-if="owner.roleName" type="info" size="mini">{{ owner.roleName }}</el-tag>
          </div>
          <div class="msg">
            <div @click.right.prevent="showMenu" :id="rcMessage.messageUId" ref="menuTarget" class="event-block">
              <context-menu v-if="contextMenuTarget" class="right-menu"
                            :target="contextMenuTarget"
                            :show="contextMenuVisible"
                            @update:show="(show) => contextMenuVisible = show">
                <slot>
                  <li v-if="rcMessage.messageUId && rcMessage.objectName == 'RC:TxtMsg'" class="menu-item">
                    <a class="menu" href="javascript:;" @click="copyMessage($refs.textEle)">复制</a>
                  </li>
                  <li v-if="isMe && rcMessage.messageUId" class="menu-item">
                    <a class="menu" href="javascript:;" @click="sendRecallMessage(rcMessage)">撤回</a>
                  </li>
                </slot>
              </context-menu>
              <div v-if="rcMessage.objectName == 'RC:TxtMsg'" class="msg-bubble">
                <pre class="text-msg"  v-html="handledMessage.html" ref="textEle"></pre>
                <div class="arrow"></div>
              </div>
              <div v-else-if="rcMessage.objectName == 'RC:ImgMsg'" class="img-msg">
                <img  @click="previewImage(handledMessage.html)" :src="handledMessage.html">
                <div v-if="rcMessage.sentStatus == 10" class="loading-mask">
                  <i class="loading el-icon-loading"></i>
                </div>
                <div v-else-if="rcMessage.sentStatus == 20" class="loading-mask">
                  <i class="refresh el-icon-refresh" @click="reUploadMessage(rcMessage)"></i>
                </div>
              </div>
              <div v-else-if="rcMessage.objectName == 'RC:VcMsg'">
                <div @click="playVoice(rcMessage)" class="voice-msg">
                  <span class="icon" :class="{ playing: isPlayVoice }"></span>
                  <span class="duration">{{ rcMessage.content.duration }}'</span>
                </div>
              </div>
              <div v-else-if="rcMessage.objectName == 'RC:FileMsg'" class="file-msg">
                <div class="left">
                  <icon class="icon" name="cloud-download"></icon>
                </div>
                <div class="middle">
                  <div class="title">{{ rcMessage.content.name }}</div>
                  <div class="sub-title">
                    <template v-if="rcMessage.sentStatus == 20">发送失败</template>
                    <template v-else>{{ rcMessage.content.size|filterFileSize }}</template>
                  </div>
                  <div v-if="rcMessage.percentage && rcMessage.percentage < 100" class="percentage">
                    <el-progress :percentage="rcMessage.percentage" :show-text="false"></el-progress>
                  </div>
                </div>
                <div class="right">
                  <a v-if="rcMessage.sentStatus == 10" @click="cancelUpload(rcMessage)" href="javascript:;" title="取消发送">
                    <el-button class="btn-icon" icon="el-icon-close" circle></el-button>
                  </a>
                  <a v-else-if="rcMessage.sentStatus == 20" @click="reUploadMessage(rcMessage)" href="javascript:;" title="重新发送">
                    <el-button class="btn-icon" icon="el-icon-refresh" circle></el-button>
                  </a>
                  <a v-else="" :href="rcMessage.content.fileUrl" target="_blank" download title="下载文件">
                    <el-button class="btn-icon" icon="el-icon-download" circle></el-button>
                  </a>
                </div>
              </div>
              <div v-else="">[其他消息]</div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else-if="rcMessage.objectName == 'RC:TypSts'"></template>
    <template v-else-if="rcMessage.objectName == 'RC:SRSMsg'"></template>
    <template v-else-if="rcMessage.objectName == 'RC:RcCmd'">
      <div class="info-ntf" v-html="handledMessage.html"></div>
    </template>
    <template v-else="">
      <div>
        {{ rcMessage.objectName }}
      </div>
    </template>
  </div>
</template>

<script>
  // let moment = require('moment')
  import { mapGetters } from 'vuex'
  import { getQiniuToken } from '../../api/qiniu'
  import axios from 'axios'
  const lrz = require('lrz')

  export default {
    name: 'Message',
    components: {

    },
    props: {
      rcMessage: {
        type: Object,
        default: {}
      },
      owner: {
        type: Object,
        default: {}
      },
      isMe: {
        type: Boolean
      }
    },
    data () {
      return {
//        message: {}
        isPlayVoice: false,
        contextMenuVisible: false,
        contextMenuTarget: null
      }
    },
    computed: {
      ...mapGetters(['userId']),
      handledMessage () {
        let handledMsg = this.rcMessage
        let message = handledMsg.content
        let ownerName = this.isMe ? '我' : this.owner.groupNickname || this.owner.nickname || handledMsg.senderUserId
        switch (handledMsg.objectName) {
          case 'RC:TxtMsg':
            let content = message.content.replace(/</gi, '&lt;').replace(/>/gi, '&gt;')
            if (RongIMLib.RongIMEmoji && RongIMLib.RongIMEmoji.emojiToHTML) {
              content = RongIMLib.RongIMEmoji.emojiToHTML(content)
            }
            handledMsg.html = content
            break;
          case 'RC:ImgMsg':
            handledMsg.html = message.imageUri || ('data:image/png;base64,' + message.content)
            break;
          case 'RC:VcMsg':
            handledMsg.html = '[语音]'
            break;
          case 'RC:ImgTextMsg':
            handledMsg.html = '[图文]'
            break;
          case 'RC:LBSMsg':
            handledMsg.html = '[位置]'
            break;
          case 'RC:FileMsg':
            handledMsg.html = '[文件]'
            break;
          case 'RC:CmdNtf':
          case 'RC:ContactNtf':
            handledMsg.html = '[通知消息]'
            break;
          case 'RC:InfoNtf':
            handledMsg.html = message.message
            break;
          case 'RC:GrpNtf':
            handledMsg.html = message.message
            break;
          case 'RC:DizNtf':

            break;
          case 'RC:RcCmd':
            handledMsg.html = ownerName + '撤回一条消息'
            break;
          default:

            break;
        }
        return handledMsg
      }
    },
    created () {
      this.uploadMessage(this.rcMessage)
    },
    mounted () {
      this.setContextMenuTarget()
      document.addEventListener('mousedown', (event) => {
        if (event.button === 2) {
          if (window.getSelection().isCollapsed) {
            document.body.style.userSelect = 'none'
            setTimeout(() => {
              document.body.style.userSelect = 'auto';
            }, 0)
          }
        }
      })
    },
    watch: {
      rcMessage (val) {
        this.setContextMenuTarget()
        this.uploadMessage(val)
      }
    },
    filters: {
      filterFileSize (size) {
        if (!size) return ""
        let num = 1024.00 //byte
        if (size < num)
          return size + " B"
        if (size < Math.pow(num, 2))
          return (size / num).toFixed(2) + " K" //kb
        if (size < Math.pow(num, 3))
          return (size / Math.pow(num, 2)).toFixed(2) + " M" //M
        if (size < Math.pow(num, 4))
          return (size / Math.pow(num, 3)).toFixed(2) + " G" //G
        return (size / Math.pow(num, 4)).toFixed(2) + " T" //T
      }
    },
    methods: {
      copyMessage (target) {
        this.contextMenuVisible = false
        let focusText = window.getSelection ? window.getSelection().toString() : document.selection.createRange().text;
        if (!focusText && target) {
          let range = document.createRange()
          let selection = window.getSelection()
          range.selectNode(target)
          selection.removeAllRanges()
          selection.addRange(range)
        }
        try {
          if(document.execCommand) {
            document.execCommand('copy')
          }
        } catch (e) {
          console.log(e)
        }
      },
      reUploadMessage (message) {
        message.sentStatus = 0
        this.uploadMessage(message)
      },
      uploadMessage (message) {
        if (!message.previewId || !message.file) return
        if (!message.sentStatus) {
          this.$set(message, 'sentStatus', 10)
          console.log('uploadMessage', message.previewId, message.file)
          let file = message.file
          let param = new FormData()
          param.append('file', file, file.name)
          getQiniuToken().then(data => {
            param.append('token', data.token)
            // param.append('key', `sealtalk/${this.userId}/${Date.now()}-${file.name}`)
            const CancelToken = axios.CancelToken
            let config = {
              headers:{'Content-Type':'multipart/form-data'},
              timeout: 60*1000*10,
              cancelToken: new CancelToken(c => {
                // An executor function receives a cancel function as a parameter
                this.cancelUpload = c
              }),
              onUploadProgress: progressEvent => {
                let percentage = (progressEvent.loaded / progressEvent.total * 100 | 0)
                this.$set(message, 'percentage', percentage)
                // this.$store.commit('UPDATE_PREVIEW_MESSAGE', [message, {percentage: percentage}])
                // this.$emit('on-progress', this.file)
              }
            }
            axios.post('https://upload.qiniu.com/', param, config).then(resp => {
              if (message.objectName === 'RC:FileMsg') {
                message.content.fileUrl = resp.data.url
                this.sendMessageToRc(message)
              } else if (message.objectName === 'RC:ImgMsg') {
                let opt = {
                  width: 200,
                  height: 200
                }
                let reg = new RegExp('data:image/[a-zA-z]+;base64,')
                lrz(file, opt).then(ret => {
                  message.content.content = ret.base64.replace(reg, '')
                  message.content.imageUri = resp.data.url
                  this.sendMessageToRc(message)
                }).catch(err => {
                  console.log('-----压缩图片失败---', err)
                  this.$store.commit('UPDATE_PREVIEW_MESSAGE', [message, {sentStatus: 20, percentage: 0}])
                })
              }
              // this.$emit('on-success', this.file)
            }).catch(err => {
              console.log('-----上传到七牛失败---', err)
              this.$store.commit('UPDATE_PREVIEW_MESSAGE', [message, {sentStatus: 20, percentage: 0}])
            })
          }).catch(err => {
            console.log('获取token失败', err)
            this.$store.commit('UPDATE_PREVIEW_MESSAGE', [message, {sentStatus: 20, percentage: 0}])
          })
        }
      },
      sendMessageToRc (message) {
        this.$store.dispatch('sendRcMsg', message).then(data => {

        }).catch(err => {
          console.log('-----发送消息到融云失败---', err)
          this.$store.commit('UPDATE_PREVIEW_MESSAGE', [message, {sentStatus: 20, percentage: 0}])
        })
      },
      cancelUpload (message) {

      },
      setContextMenuTarget () {
        if (['RC:TxtMsg', 'RC:ImgMsg', 'RC:VcMsg', 'RC:FileMsg'].indexOf(this.rcMessage.objectName) > -1) {
          this.$nextTick(() => {
            this.contextMenuTarget = this.$refs.menuTarget
          })
        }
      },
      previewImage (imgUrl) {
        this.$emit('showDialogImage', imgUrl)
      },
      playVoice (rcMessage) {
        this.isPlayVoice = true
        let that = this
        let audioFile = rcMessage.content.content
        let duration = audioFile.length / 1024
        RongIMLib.RongIMVoice.preLoaded(audioFile, function() {
          RongIMLib.RongIMVoice.play(audioFile, duration)
          setTimeout(function () {
            that.isPlayVoice = false
          }, rcMessage.content.duration * 1000)
        })
      },
      showMenu (e) {
        this.contextMenuVisible = true
      },
      sendRecallMessage (recallMessage) {
        this.$store.dispatch('sendRecallMessage', recallMessage).then(data => {
          console.log('sendRecallMessage:', data)
          this.contextMenuVisible = false
        })
      }
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">

  .msg-card {
    .info-ntf {
      text-align: center;
      color: #999;
      font-size: 14px;
    }
    .normal-ntf {
      display: flex;
      align-items: flex-start;
      justify-content: start;
      .face {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        margin: 0 8px;
        flex-shrink: 0;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .info {
        flex: 1;
        margin-right: 5px;
        font-size: 15px;
        .name {
          color: #888;
          margin-bottom: 2px;
          .vc {
            display: inline-block;
            vertical-align: middle;
          }
        }
        .msg {
          .event-block {
            display: inline-block;
            max-width: 66%;
          }
          .msg-bubble {
            position: relative;
            display: inline-block;
            padding: 4px 10px;
            background-color: #fff;
            border-radius: 5px;
            border: 1px solid #ebeef5;
            .text-msg {
              display: inline-block;
              font-family: inherit;
              margin: 0;
              white-space: pre-wrap;
              word-wrap:break-word;
              word-break:break-all;
            }
            .arrow {
              position: absolute;
              display: block;
              width: 0;
              height: 0;
              border-color: transparent;
              border-style: solid;
              border-width: 6px;
              /*filter: drop-shadow(0 2px 12px rgba(0,0,0,.03));*/
              top: 8px;
              left: -6px;
              margin-bottom: 3px;
              border-right-color: #ebeef5;
              border-left-width: 0;
              &:after {
                content: " ";
                position: absolute;
                display: block;
                width: 0;
                height: 0;
                border-color: transparent;
                border-style: solid;
                border-width: 6px;
                bottom: -6px;
                left: 1px;
                border-right-color: #fff;
                border-left-width: 0;
              }
            }
          }

          .img-msg {
            position: relative;
            img {
              max-width: 300px;
              max-height: 240px;
              min-width: 100px;
              min-height: 70px;
              cursor: pointer;
            }
            .loading-mask {
              position: absolute;
              z-index: 1000;
              background-color: rgba(0, 0, 0, 0.5);
              margin: 0;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              transition: opacity .3s;
              display: flex;
              justify-content: center;
              align-items: center;
              .loading {
                color: #409eff;
                font-size: 30px;
                animation: rotating 2s linear infinite;
              }
              .refresh {
                font-size: 30px;
                cursor: pointer;
                &:hover, &:focus, &:active {
                  color: #409eff;
                }
              }
            }
          }
          .voice-msg {
            display: flex;
            justify-content: space-between;
            background-color: #7cbcff;
            width: 100px;
            border-radius: 5px;
            color: #fff;
            cursor: pointer;
            .icon {
              width: 32px;
              height: 32px;
              background-image: url("../../assets/image/yuyin.png");
              background-repeat: no-repeat;
              background-position: -3px 0; // -33
              background-size: auto 100%;
              &.playing {
                animation: voiceplay 2s infinite step-start;
              }
            }
            .duration {
              height: 32px;
              line-height: 32px;
              margin-right: 5px;
            }
          }

          .file-msg {
            display: flex;
            justify-content: space-between;
            border: 1px solid #b9c1ca;
            border-radius: 5px;
            overflow: hidden;
            width: 268px;
            padding: 8px;
            text-align: left;
            .left {
              flex-shrink: 0;
              margin-right: 8px;
              .icon {
                font-size: 48px;
                vertical-align: middle;
                color: #2268aa;
              }
            }
            .middle {
              flex: 1;
              overflow: hidden;
              .title {
                min-height: 1.25em;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
              .sub-title {
                color: #999;
              }
            }
            .right {
              margin-left: 8px;
              display: flex;
              justify-content: center;
              align-items: center;
              .btn-icon {
                padding: 10px;
              }
            }
          }
        }
      }
      &.me {
        flex-direction: row-reverse;
        .info {
          text-align: right;
          margin-left: 5px;
          margin-right: 0;
          .msg-bubble {
            padding: 4px 10px;
            background-color: #a3ea56;
            .text-msg {
              text-align: left;
            }
            .arrow {
              left: auto;
              right: -6px;
              margin-bottom: 3px;
              border-right-width: 0;
              border-right-color: transparent;
              border-left-color: #ebeef5;
              border-left-width: 6px;
              &:after {
                left: auto;
                right: 1px;
                bottom: -6px;
                margin-left: -6px;
                border-right-width: 0;
                border-right-color: transparent;
                border-left-color: #a3ea56;
                border-left-width: 6px;
              }
            }
          }
        }
      }
    }
  }
  @keyframes voiceplay {
    0%, 100% {
      background-position: -3px 0;
    }
    25% {
      background-position: -35px 0;
    }
    50% {
      background-position: -64px 0;
    }
    75% {
      background-position: -91px 0;
    }
  }

</style>
