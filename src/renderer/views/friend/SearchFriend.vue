<template>
  <el-container>
    <el-header>
      <el-button class="btn-left" icon="el-icon-arrow-left" @click="$router.back()"></el-button>
      <h3>添加好友</h3>
    </el-header>
    <el-main>
      <div class="search-form">
        <el-input placeholder="学号/手机号" v-model="keyword">
          <el-button @click="searchUser(keyword)" slot="append" icon="el-icon-search"></el-button>
        </el-input>
      </div>
      <div class="friends-list">
        <div v-for="(friend, index) in friends" :key="friend.userId" class="friend">
          <div class="face"><img :src="friend.headimgurl" alt=""></div>
          <div class="info">
            <div class="name" v-text="friend.nickname"></div>
            <div class="studentid" v-text="friend.studentid"></div>
          </div>
          <div class="operate">
            <el-button v-if="!friend.isFriend" @click="toApplyFriend(friend)">申请好友</el-button>
            <el-button v-if="friend.isFriend" @click="toUserChat(friend)" >聊天</el-button>
          </div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  import cache from '../../utils/sessionStorage'
  import { mapGetters } from 'vuex'
  import { searchUser } from '../../api/friend'

  export default {
    name: 'SearchFriend',
    props: [

    ],
    data () {
      return {
        cacheKey: 'search-friend-keyword',
        keyword: '',
        friends: [],
        fromRemark: ''
      }
    },
    computed: {
      ...mapGetters(['userInfo'])
    },
    created () {
      this.keyword = cache.get(this.cacheKey) || ''
    },
    watch: {
      keyword (val, oldVal) {
        if (val.length >= 10 && val.length <= 11) {
          this.searchUser(val)
        }
      }
    },
    beforeDestroy () {
      cache.set(this.cacheKey, this.keyword)
    },
    methods: {
      searchUser (keyword) {
        searchUser(keyword).then(data => {
          this.friends = data
          this.fromRemark = keyword
        })
      },
      toUserChat (friend) {
        this.$router.push({name: 'Chat', params: {conversationType: 1, targetId: ''+friend.userId}})
      },
      toApplyFriend (friend) {
        this.$router.push({name: 'ApplyFriend', params: {
          friendUserId: friend.userId
        }, query: {
          applyFrom: friend.applyFrom,
          fromRemark: this.fromRemark
        }})
      }
    }
  }
</script>
<style scoped rel="stylesheet/scss" lang="scss">
  .search-form {
    padding: 50px;
    .el-select /deep/ .el-input {
      width: 100px;
    }
  }
  .friends-list {
    padding: 0 50px;
    .friend {
      display: flex;
      align-items: center;
      justify-content: start;
      .face {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 8px;
        flex-shrink: 0;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .info {
        flex: 1;
      }
      .operate {
        flex-shrink: 0;

      }
    }
  }
</style>
