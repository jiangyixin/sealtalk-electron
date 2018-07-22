<template>
  <el-aside width="70px" class="toolbar" style="height: 100%; float: left;">
    <div title="我" class="bar-item" @click="toMySetting">
      <div class="face">
        <img v-if="userInfo.headimgurl" :src="userInfo.headimgurl" alt="">
        <img v-else="" src="../assets/image/head.png" alt="">
      </div>
    </div>
    <div @click="toggleSidebar('Conversations')" @dblclick="toggleUnreadConversation" title="会话列表" class="bar-item" :class="[curSidebar == 'Conversations' ? 'active' : '']">
      <!--<icon name="weixin"></icon>-->
      <!--<span v-if="unreadCount" class="badge">{{ unreadCount }}</span>-->
      <el-badge :value="unreadCount" :max="999" :hidden="!unreadCount" class="item">
        <icon name="weixin"></icon>
      </el-badge>
    </div>
    <div @click="toggleSidebar('Contacts')" title="通讯录" class="bar-item" :class="[curSidebar == 'Contacts' ? 'active' : '']">
      <icon name="address-book-o"></icon>
    </div>
    <div @click="toMass()" title="群发" class="bar-item" :class="[curSidebar == 'SelectContacts' ? 'active' : '']">
      <icon name="users"></icon>
    </div>
    <div @click="showMenu = !showMenu" ref="btnOperate" class="bar-item bottom">
      <i class="el-icon-plus"></i>
      <div v-if="showMenu" class="menu-block">
        <ul class="menu-list">
          <li class="menu-item">
            <router-link :to="{name: 'SearchFriend'}" class="menu">添加好友</router-link>
          </li>
        </ul>
      </div>
    </div>
  </el-aside>
</template>

<script>
  import { mapGetters } from 'vuex'
  export default {
    name: 'Sidebar',
    computed: {
      ...mapGetters(['curSidebar', 'conversations', 'userInfo', 'bus']),
      unreadCount () {
        let count = 0
        this.conversations.map(conversation => {
          count += conversation.unreadMessageCount
        })
        return count
      }
    },
    data () {
      return {
        showMenu: false
      }
    },
    methods: {
      toggleSidebar (curSidebar) {
        this.$store.commit('SET_CUR_SIDEBAR', curSidebar)
      },
      toMass () {
        this.$store.commit('SET_CUR_SIDEBAR', 'SelectContacts')
        this.$router.push({name: 'Mass'})
      },
      toMySetting () {
        this.$router.push({name: 'Setting'})
      },
      toggleUnreadConversation () {
        this.bus.$emit('toggle-unread-conversation')
      }
    },
    mounted:function () {
      let that = this
      this.globalClick(function (e) {
        if (that.$refs.btnOperate && !that.$refs.btnOperate.contains(e.target)) {
          that.showMenu = false
        }
      })
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">

  .toolbar {
    position: relative;
    background-color: #38a0fe;
    .bar-item {
      display: block;
      color: #fff;
      font-size: 24px;
      text-align: center;
      height: 70px;
      line-height: 75px;
      cursor: pointer;
      user-select: none;
      &.active {
        background-color: #2884ca;
      }
      &.bottom {
        position: absolute;
        bottom: 5px;
        width: 100%;
      }
      .el-badge /deep/ .is-fixed {
        top: 4px;
        right: -16px;
        transform: none;
      }
      .face {
        height: 100%;
        width: 100%;
        overflow: hidden;
        text-align: center;
        padding: 10px;
        box-sizing: border-box;
        img {
          max-height: 100%;
          max-width: 100%;
          border-radius: 50%;
        }
      }
    }
  }

  .menu-block {
    position: fixed;
    bottom: 70px;
    left: 35px;
    width: 100px;
    background-color: #fff;
    border-radius: 5px;
    border: 1px solid #eee;
    z-index: 99;
    .menu-list {
      list-style: none;
      padding-left: 0;
      margin: 0;
      line-height: 20px;
      .menu-item {

        .menu {
          display: block;
          padding: 5px;
          color: #333;
          font-size: 14px;
          text-decoration: none;
          &:hover, &:active, &:focus {
            background-color: #ecf5ff;
          }
        }
      }
    }
  }

  .el-menu--collapse {
    width: 70px;
  }

</style>
