<template>
  <el-aside width="330px" class="contacts-bar" style="height: 100%;">
    <el-menu
      default-active="1"
      class="el-menu-vertical"
      :router="true"
      :default-openeds="openeds"
      @open="handleOpen"
      @close="handleClose">
      <el-menu-item index="1" :disabled="true">
        <!--<span slot="title">新消息</span>-->
        <el-input placeholder="用户名/学号" v-model="keyword"></el-input>
      </el-menu-item>
      <el-submenu index="2">
        <template slot="title">
          <span>群组</span>
        </template>
        <el-menu-item-group key="group">
          <template v-for="(group, index) in filterGroups">
            <el-menu-item :route="{ name: 'GroupInfo', params: { groupId: group.groupId } }" :key="group.groupId" :index="group.groupId|toString">
              <div class="contact-card">
                <img class="face" :src="group.groupHeadimgurl" alt="">
                <span>{{ group.groupName }}</span>
              </div>
            </el-menu-item>
          </template>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="3">
        <template slot="title">
          <span>联系人</span>
        </template>
        <template v-for="(group, index) in groupByZh(filterFriends)">
          <el-menu-item-group :key="group.letter">
            <template slot="title">{{ group.letter }}</template>
            <template v-for="(friend, index) in group.data">
              <el-menu-item :route="{ name: 'UserInfo', params: { userId: friend.friendUserId } }" :key="friend.friendUserId" :index="friend.friendUserId|toString">
                <div class="contact-card">
                  <img class="face" :src="friend.headimgurl" alt="">
                  <span>{{ friend.nickname }}</span>
                </div>
              </el-menu-item>
            </template>
          </el-menu-item-group>
        </template>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { groupByZh } from '../../utils/filter'
  import cache from '../../utils/sessionStorage'

  export default {
    name: 'Contacts',
    data () {
      return {
        openeds: ['1', '2', '3'],
        keyword: ''
      }
    },
    computed: {
      ...mapGetters(['myGroups', 'myFriends']),
      filterGroups () {
        return this.myGroups.filter(group => {
          return group.groupName.toLowerCase().indexOf(this.keyword.toLowerCase()) !== -1
        })
      },
      filterFriends () {
        if (/[0-9]*/.test(this.keyword) && this.keyword.length == 10) {
          return this.myFriends.filter(friend => {
            return friend.studentid == this.keyword
          })
        } else {
          return this.myFriends.filter(friend => {
            return friend.nickname.toLowerCase().indexOf(this.keyword.toLowerCase()) !== -1
          })
        }
      }
    },
    filters: {
      toString (val = '') {
        return val.toString()
      }
    },
    created () {
      this.keyword = cache.get('contact-keyword') || ''
      this.$store.dispatch('getMyFriends', {applyStatus: 'passed'}).then(resp => {

      })
      this.$store.dispatch('getMyGroups').then(resp => {

      })
    },
    beforeDestroy () {
      cache.set('contact-keyword', this.keyword)
    },
    methods: {
      groupByZh (array) {
        return groupByZh(array)
      },
      sortGroupName (arr) {
        console.log('----sortGroupName----', arr.length)
        return arr.sort(function(a, b) {
          return a.groupName.localeCompare(b.groupName, 'zh-Hans-CN', {sensitivity: 'accent'});
        })
      },
      handleOpen(key, keyPath) {

      },
      handleClose(key, keyPath) {

      }
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">

  .contacts-bar {
    background-color: #f5f8fc;
    /deep/ .el-menu-item.is-disabled {
      opacity: 1;
    }
    .contact-card {
      .face {
        width: 25px;
        height: 25px;
        overflow: hidden;
        border-radius: 50%;
      }
    }
  }

</style>
