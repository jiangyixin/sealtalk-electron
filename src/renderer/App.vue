<template>
  <el-container id="app">
    <el-aside width="400px" style="display: flex; overflow: hidden;">
      <Sidebar></Sidebar>
      <keep-alive>
        <component :is="curSidebar"></component>
      </keep-alive>
    </el-aside>
    <el-main>
      <router-view/>
    </el-main>
  </el-container>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Sidebar from './components/Sidebar.vue'
  // import Contacts from './components/contacts/Index.vue'
  // import Conversations from './components/conversations/Index.vue'
  // import SelectContacts from './components/select-contacts/SelectContacts.vue'
  import { init } from './api/rcInit'
  import { getConversations, getTotalUnreadCount } from './api/rcMsg'
  import cache from './utils/sessionStorage'

  export default {
    name: 'App',
    components: {
      Sidebar,
      Contacts: () => import('./components/contacts/Index'),
      Conversations: () => import('./components/conversations/Index'),
      SelectContacts: () => import('./components/select-contacts/SelectContacts'),
    },
    computed: {
      ...mapGetters(['rcToken', 'curSidebar', 'userId', 'conversations'])
    },
    data () {
      return {
        initConversations: false,
        tempMessages: []
      }
    },
    methods: {
      saveTempMessages () {
        while (this.tempMessages.length > 0) {
          let message = this.tempMessages.shift()
          this.$store.commit('RECEIVE_NEW_MESSAGE', message)
          if (this.tempMessages.length === 0) {
            this.initConversations = true
          }
        }
        if (this.tempMessages.length === 0) {
          this.initConversations = true
        }
      }
    },
    created () {
      this.$store.dispatch('getUserProfile').then(resp => {

      })
      if (cache.get('is-login')) {
        this.$store.dispatch('getRCToken').then(resp => {
          let that = this
          let params = {
            appKey : process.env.APP_KEY,
            token : this.rcToken
          }
          console.log('getRCToken success resp:', resp)
          init(params, {
            getInstance: (instance) => {
              getConversations().then(list => {
                this.$store.commit('SET_CONVERSATIONS', list)
                setTimeout(() => {
                  this.saveTempMessages()
                })
              })
//            getTotalUnreadCount().then(count => {
//
//            })
            },
            receiveNewMessage: (message) => {
              console.log('Receive New Message', message)
              if (!this.initConversations) {
                that.tempMessages.push(message)
              } else {
                this.$store.commit('RECEIVE_NEW_MESSAGE', message)
              }
            },
            getCurrentUser: ({userId}) => {

            }
          })
        }).catch(err => {
          console.log('getRCToken err', err)
        })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">

  html, body, .el-container {
    margin: 0;
    height: 100%;
  }

  .el-container {
    .el-main {
      position: relative;
      padding: 0;
      .el-header {
        position: relative;
        text-align: center;
        background-color: #fff;
        box-shadow: 2px 2px 2px #f5f7fa;
        z-index: 1;
        .title {
          font-weight: 400;
          line-height: 60px;
          margin: 0;
        }
        .btn-left {
          position: absolute;
          left: 0;
          top: 0;
          height: 60px;
          font-size: 25px;
          border: none;
        }
        .btn-right {
          position: absolute;
          right: 0;
          top: 0;
          height: 60px;
          font-size: 25px;
          border: none;
        }
      }
    }
  }

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .fa-icon {
    width: auto;
    height: 1em; /* 或任意其它字体大小相对值 */
    /* 要在 Safari 中正常工作，需要再引入如下两行代码 */
    max-width: 100%;
    max-height: 100%;
  }

</style>
