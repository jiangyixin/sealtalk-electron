<template>
  <el-aside width="330px" class="conversations-bar" style="height: 100%;">
    <div class="filter-conversation">
      <el-input placeholder="名字/学号" v-model="keyword"></el-input>
    </div>
    <ul class="conversation-list" @click.right.prevent="showContextMenu" ref="conversations" id="conversations">
      <li v-for="(conversation, index) in filterConversations" :key="conversation.conversationType + '-' + conversation.targetId" class="conversation-item">
        <conversation-item :conversation.sync="conversation" @click.native.right="setTargetConversation(conversation)"></conversation-item>
      </li>
      <context-menu v-if="contextMenuTarget" class="right-menu"
                    :target="contextMenuTarget"
                    :show="contextMenuVisible"
                    @update:show="(show) => contextMenuVisible = show">
        <slot>
          <li class="menu-item">
            <a class="menu" href="javascript:;" @click.stop.prevent="delConversation()">删除会话</a>
          </li>
        </slot>
      </context-menu>
    </ul>
  </el-aside>
</template>

<script>
  import { mapGetters } from 'vuex'
  import ConversationItem from './Item.vue'
  let moment = require('moment')
  import cache from '../../utils/sessionStorage'

  export default {
    name: 'Conversations',
    components: {
      ConversationItem
    },
    computed: {
      ...mapGetters(['conversations', 'objGroups', 'objFriends', 'bus']),
      filterConversations () {
        let filterConversations =  this.conversations.filter(conversation => {
          if (this.keyword === '未读' || this.keyword === 'unread') {
            return conversation.unreadMessageCount > 0
          } else if (conversation.nickname || conversation.studentid) {
            let name = conversation.nickname || conversation.studentid || ''
            return conversation.studentid == this.keyword || String(name).toLowerCase().indexOf(this.keyword.toLowerCase()) !== -1
          } else {
            return true
          }
        })
        filterConversations.sort((a, b) => {
          return b.sentTime - a.sentTime
        })
        return filterConversations
      },
      unreadIndexes () {
        let indexes = []
        this.conversations.map((conversation, i) => {
          if (conversation.unreadMessageCount > 0) {
            indexes.push(i)
          }
        })
        return indexes
      }
    },
    data () {
      return {
        keyword: '',
        contextMenuTarget: null,
        contextMenuVisible: false,
        targetConversation: {},
        curIndex: 0
      }
    },
    filters: {
      humanizeTime (timestramp, preTimestramp) {
        let str = ''
        if (preTimestramp && timestramp - preTimestramp < 3*60*1000) {
          return str
        }
        if (moment(moment(timestramp).format('YYYY-MM-DD HH:mm:ss')).isBetween(moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD HH:mm:ss'))) {
          str = moment(timestramp).format('HH:mm')
        } else {
          str = moment(timestramp).format('M-D')
        }
        return str
      }
    },
    created () {
      this.keyword = cache.get('conversations-keyword') || ''
      this.fetchUnKnowConversation()
      this.bus.$on('toggle-unread-conversation', () => {
        this.toggleUnreadConversation()
      })
    },
    mounted () {
      this.contextMenuTarget = this.$refs.conversations
    },
    beforeDestroy () {
      cache.set('conversations-keyword', this.keyword)
    },
    methods: {
      showContextMenu (e) {
        this.contextMenuVisible = true
      },
      setTargetConversation (conversation) {
        this.targetConversation = conversation
        this.contextMenuVisible = true
      },
      delConversation () {
        this.$store.dispatch('delConversation', this.targetConversation).then(data => {
          this.contextMenuVisible = false
        })
      },
      toggleUnreadConversation () {
        this.$refs.conversations.scrollTop = 72 * this.unreadIndexes[this.curIndex]
        this.curIndex++
        if (this.curIndex === this.unreadIndexes.length) {
          this.curIndex = 0
        }
      },
      fetchUnKnowConversation () {
        this.$store.dispatch('getMyFriends', {applyStatus: 'passed'}).then(resp => {
          setTimeout(() => {
            let unKnowIds = []
            this.conversations.map(conversation => {
              if (conversation.conversationType == 1 && !this.objFriends[conversation['targetId']] && conversation.targetId) {
                unKnowIds.push(conversation.targetId)
              }
            })
            this.$store.dispatch('findFriends', unKnowIds).then(data => {

            })
          }, 100)
        })
        this.$store.dispatch('getMyGroups').then(resp => {
          setTimeout(() => {
            let unKnowIds = []
            this.conversations.map(conversation => {
              if (conversation.conversationType == 3 && !this.objGroups[conversation['targetId']] && conversation.targetId) {
                unKnowIds.push(conversation.targetId)
              }
            })
            this.$store.dispatch('findGroups', unKnowIds).then(data => {

            })
          }, 100)
        })
      }
    },
    watch: {
      conversations (val, oldVal) {
        if (oldVal.length === 0) {
          this.fetchUnKnowConversation()
        }
      }
    }
  }
</script>


<style scoped rel="stylesheet/scss" lang="scss">
  .conversations-bar {
    background-color: #f5f8fc;
    display: flex;
    flex-direction: column;
  }
  .filter-conversation {
    padding: 5px;
    border-bottom: 1px solid #eee;
    margin-bottom: 5px;
    flex-shrink: 0;
  }
  .conversation-list {
    flex: 1;
    overflow-y: auto;
    list-style: none;
    padding-left: 0;
    margin-top: 0;
    .conversation-item {

    }
  }
</style>
