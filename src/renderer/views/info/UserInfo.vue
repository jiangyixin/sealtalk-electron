<template>
  <el-container>
    <el-header>
      <el-button class="btn-left" icon="el-icon-arrow-left" @click="$router.back()"></el-button>
      <h3 class="title">好友信息</h3>
    </el-header>
    <el-main>
      <div class="user-info">
        <div class="user-data">
          <div class="photo">
            <img :src="friendInfo.headimgurl" alt="">
          </div>
          <div class="info">
            <h3 class="username">
              {{ friendInfo.nickname }}
              <img class="vip" :src="vip.svgIcon" alt="">
            </h3>
            <p class="studentid">{{ friendInfo.studentid }}</p>
          </div>
          <div class="operate">
            <el-button v-if="friendInfo.isFriend" @click="delFriend()" round>删除好友</el-button>
          </div>
        </div>
      </div>
      <div v-if="friendInfo.isFriend" class="operate-block">
        <el-button type="text" @click="toChat()">发消息</el-button>
      </div>
      <div v-else="" class="operate-block">
        <el-button type="text" @click="toApplyFriend()">申请好友</el-button>
      </div>
      <div v-if="courses && courses.length" class="info-card orange">
        <div class="title">在学课程</div>
        <ul class="list">
          <li class="item" v-for="course in courses" :key="course.courseId">
            <div class="text">{{ course.title }}</div>
          </li>
        </ul>
      </div>
      <div v-if="groups && groups.length" class="info-card green">
        <div class="title">所在班组群</div>
        <ul class="list">
          <li class="item" v-for="group in groups" :key="group.groupId">
            <div class="text">{{ group.groupName }} —— {{ group.role|getRoleName }}</div>
          </li>
        </ul>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'UserInfo',
    components: {

    },
    props: ['userId', 'applyFrom', 'fromRemark'],
    computed: {

    },
    data () {
      return {
        conversationType: '1',
        friendInfo: {},
        groups: [],
        courses: [],
        vip: {}
      }
    },
    created () {
      this.fetchUserInfo()
    },
    methods: {
      fetchUserInfo () {
        let params = {
          userId: this.userId,
          origin: true
        }
        this.$store.dispatch('getFriendInfo', params).then(data => {
          this.friendInfo = data
        })
        this.$store.dispatch('getFriendGroups', this.userId).then(data => {
          this.groups = data
        })
        this.$store.dispatch('getFriendCourses', this.userId).then(data => {
          this.courses = data
        })
        this.$store.dispatch('getFriendVip', this.userId).then(data => {
          this.vip = data
        })
      },
      toChat () {
        this.$router.push({name: 'Chat', params: {conversationType: this.conversationType, targetId: this.userId}})
      },
      toApplyFriend () {
        this.$router.push({name: 'ApplyFriend', params: {
          friendUserId: this.userId
        }, query: {
          applyFrom: this.applyFrom,
          fromRemark: this.fromRemark
        }})
      },
      delFriend () {
        this.$confirm('确认删除好友？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$store.dispatch('delFriend', this.userId).then(data => {
            this.friendInfo = Object.assign({}, data)
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          })
        })
      }
    },
    filters: {
      getRoleName (role) {
        switch (role) {
          case 'normal':
            return '学员'
          case 'teacher':
            return '老师'
          case 'tutor':
            return '助教'
          case 'monitor':
            return '班长'
          case 'groupHead':
            return '组长'
          default:
            return '未知'
        }
      }
    },
    watch: {
      userId (val) {
        this.fetchUserInfo()
      }
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">
  .el-container {
    background-color: #f9fbfd;
  }
  .el-main {

  }
  .user-info {
    padding: 20px 100px;
    .user-data {
      display: flex;
      align-items: center;
      justify-content: start;
      .photo {
        width: 65px;
        height: 65px;
        border-radius: 50%;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .info {
        margin-left: 10px;
        flex: 1;
        .username {
          display: flex;
          margin: 10px 0 10px 0;
          .vip {
            margin-left: 5px;
            height: 25px;
          }
        }
        .studentid {
          font-size: 14px;
          color: #95989a;
        }
      }
      .operate {

      }
    }
  }
  .info-card {
    margin: 20px 70px;
    box-shadow: 0 4px 12px 0 #DEF3FC;
    border-radius: 8px;
    background-color: #fff;
    position: relative;
    overflow: hidden;
    .title {
      display: inline-block;
      padding: 5px 15px;
    }
    .list {
      /*list-style: none;*/
      /*padding-left: 0;*/
      display: flex;
      flex-wrap: wrap;
      .item {
        flex-grow: 1;
        width: 50%;
        margin-bottom: 5px;
        .text {
          color: #333;
        }
      }
    }
    &.green {
      .title {
        background-image: linear-gradient(-90deg, #6CF1CF 0%, #16DCAA 95%);
      }
      .list {
        color: #1EDEAD;
      }
    }
    &.orange {
      .title {
        background-image: linear-gradient(-89deg, #FEAD3C 3%, #FF923D 100%);
      }
      .list {
        color: #FAA521;
      }
    }
  }
  .operate-block {
    padding: 20px 100px;
  }
</style>
