<template>
  <div class="mass-list-block">
    <div class="tab-bar">
      <div class="tab-item" @click="changeActiveTab('direct')" :class="{ active: activeName == 'direct' }">已发送</div>
      <div class="tab-item" @click="changeActiveTab('timing')" :class="{ active: activeName == 'timing' }">定时发送</div>
    </div>
    <div id="masses" class="mass-list">
      <div class="mass-item" v-for="(mass, index) in filterMasses">
        <div class="time">{{ mass.sendTime|humanizeTime }}</div>
        <div class="mass-card">
          <div class="card-header">
            <div class="status" :class="mass.status">{{ mass.status|filterStatus }}</div>
            <div>
              <el-button type="text" @click="importMessages(mass.messages)">导入消息编辑区</el-button>
            </div>
          </div>
          <div class="card-body">
            <div class="face">
              <img :src="mass.senderInfo.smallAvatar" alt="">
            </div>
            <div class="message-list">
              <div v-for="(message) in mass.messages" class="message">
                <div v-if="message.type == 'text'" v-html="emojoToHTML(message.content)" class="text"></div>
                <div v-else-if="message.type == 'image'" class="image">
                  <img :src="message.imageUri" alt="">
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <div>
              <template v-if="mass.sendTargets.type == 'user'">
                发送至 {{ mass.sendTargets.targets.length }} 人
              </template>
              <template v-else-if="mass.sendTargets.type == 'group'">
                发送至 {{ mass.sendTargets.targets.length }} 群聊
              </template>
            </div>
            <div>
              <el-button @click="showContactsDialog(mass)" type="text">详情</el-button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="loading" v-loading="loading" element-loading-background="#f5f8fc" class="loading"></div>
      <div v-if="params.end" class="end">暂无更多数据</div>
    </div>
    <div class="operate">
      <el-checkbox v-model="isMe">只看我的</el-checkbox>
    </div>
    <contacts-dialog v-model="isShowContactsDialog" :type="sendTargets.type" :targets="sendTargets.targets"></contacts-dialog>
  </div>
</template>

<script>
  import ContactsDialog from '../../components/select-contacts/ContactsDialog.vue'
  import { mapGetters } from 'vuex'
  let moment = require('moment')

  export default {
    name: 'MassList',
    components: {
      ContactsDialog
    },
    computed: {
      ...mapGetters(['userId', 'masses', 'objFriends', 'objGroups', 'bus']),
      activeMasses () {
        let activeMasses = {}
        let nowTime = parseInt(Date.now()/1000)
        for (let id in this.masses) {
          let mass = this.masses[id]
          if (this.activeName == 'timing' && mass.sendTime >= nowTime) {
            this.$set(activeMasses, id, mass)
          } else if (this.activeName == 'direct' && mass.sendTime < nowTime) {
            this.$set(activeMasses, id, mass)
          }
        }
        return activeMasses
      },
      filterMasses () {
        let masses = []
        for (let mass of Object.values(this.activeMasses)) {
          if (this.isMe) {
            if (mass.userId == this.userId) {
              masses.push(mass)
            }
          } else {
            masses.push(mass)
          }
        }
        masses.sort((a, b) => {
          return b.sendTime - a.sendTime
        })
        return masses
      }
    },
    data () {
      return {
        activeName: 'direct',
        $masses: null,
        params: {
          limit: 10,
          skip: 0,
          all: 1,
          end: false,
          type: ''
        },
        timingParams: {
          limit: 10,
          skip: 0,
          all: 1,
          type: 'timing',
          end: false
        },
        directParams: {
          limit: 10,
          skip: 0,
          all: 1,
          type: 'direct',
          end: false
        },
        loading: false,
        isMe: false,
        isShowContactsDialog: false,
        sendTargets: {
          type: '',
          targets: []
        }
      }
    },
    created () {
      this.$store.dispatch('getMasses', this.directParams).then(data => {

      })
    },
    mounted () {
      this.$masses = document.getElementById('masses')
      this.$masses.addEventListener('scroll', this.fetchMoreMasses)
    },
    methods: {
      changeActiveTab (activeName) {
        if (this.activeName === 'direct') {
          this.directParams = Object.assign({}, this.params)
        } else if (this.activeName === 'timing') {
          this.timingParams = Object.assign({}, this.params)
        }
        this.activeName = activeName
        if (this.activeName === 'direct') {
          this.params = Object.assign({}, this.directParams)
        } else if (this.activeName === 'timing') {
          this.params = Object.assign({}, this.timingParams)
        }
        this.params.skip = Object.keys(this.activeMasses).length
        if (this.params.skip === 0) {
          this.loading = true
          this.$store.dispatch('getMasses', this.params).then(data => {
            this.loading = false
            if (!data || data.length < this.params.limit) {
              this.params.end = true
            }
          })
        }
      },
      emojoToHTML (emojo) {
        if (RongIMLib.RongIMEmoji && RongIMLib.RongIMEmoji.emojiToHTML) {
          return RongIMLib.RongIMEmoji.emojiToHTML(emojo)
        } else {
          return emojo
        }
      },
      importMessages (messages) {
        this.bus.$emit('import-messages', JSON.parse(JSON.stringify(messages)))
      },
      fetchMoreMasses (e) {
        if (this.$masses.scrollHeight - this.$masses.offsetHeight - e.target.scrollTop <= 10 && !this.loading && !this.params.end) {
          this.params.skip = Object.keys(this.activeMasses).length
          this.loading = true
          this.$store.dispatch('getMasses', this.params).then(data => {
            this.loading = false
            if (!data || data.length < this.params.limit) {
              this.params.end = true
            }
          })
        }
      },
      showContactsDialog (mass) {
        this.sendTargets = mass.sendTargets
        this.isShowContactsDialog = true
        if (this.sendTargets.type === 'user') {
          this.$store.dispatch('findFriends', mass.sendTargets.targets).then(data => {

          })
        } else if (this.sendTargets.type === 'group') {
          this.$store.dispatch('findGroups', mass.sendTargets.targets).then(data => {

          })
        }

      }
    },
    filters: {
      humanizeTime (timestamp) {
        if (timestamp.toString().length === 10) {
          timestamp = timestamp * 1000
        }
        let str = ''
        if (moment(moment(timestamp).format('YYYY-MM-DD HH:mm')).isBetween(moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD HH:mm:ss'))) {
          str = moment(timestamp).format('HH:mm')
        } else {
          str = moment(timestamp).format('M-D HH:mm')
        }
        return str
      },
      filterStatus (status) {
        switch (status) {
          case 'created':
            return '创建成功'
          case 'fail':
            return '发送失败'
          case 'success':
            return '发送成功'
          case 'sending':
            return '发送中'
          default:
            return '未知'
        }
      }
    },
    watch: {

    }
  }

</script>

<style scoped rel="stylesheet/scss" lang="scss">

  .mass-list-block {
    border-left: 1px solid #eee;
    background-color: #f5f8fc;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .tab-bar {
    display: flex;
    .tab-item {
      flex: 1;
      text-align: center;
      padding: 10px;
      border: 1px solid #e4e7ed;
      cursor: pointer;
      &.active {
        color: #409eff;
      }
      &+.tab-item {
        border-left: none;
      }
    }
  }

  .mass-list {
    flex: 1;
    overflow-y: auto;
    padding: 15px 0;
    .mass-item {
      .time {
        text-align: center;
      }
      .mass-card {
        margin: 8px 15px;
        border: 1px solid #eee;
        background-color: #fff;
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          padding: 0 5px;
          border-bottom: 1px solid #eee;
          .status {
            &.fail {
              color: #F56C6C;
            }
            &.success {

            }
            &.sending {
              color: #67C23A;
            }
          }
        }
        .card-body {
          padding: 5px;
          display: flex;
          justify-content: flex-start;
          overflow: hidden;
          .face {
            flex-shrink: 0;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            overflow: hidden;
            img {
              max-height: 100%;
              max-width: 100%;
            }
          }
          .message-list {
            flex: 1;
            .message {
              padding: 5px;
              &+.message {
                border-top: 1px solid #eee;
              }
              .text {
                white-space: pre-wrap;
                word-wrap: break-word;
                word-break: break-all;
                max-height: 6em;
                overflow: hidden;
              }
              .image {
                overflow: hidden;
                img {
                  max-width: 100px;
                  max-height: 100px;
                }
              }
            }
          }
        }
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          background-color: #f2f2f2;
          padding: 0 5px;
        }
      }

    }
    .end {
      padding: 5px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .loading {
      height: 80px;
    }
  }

  .operate {
    background-color: #fff;
    padding: 15px;
    text-align: center;
  }

</style>
