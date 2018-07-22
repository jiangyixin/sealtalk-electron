<template>
  <el-container>
    <el-header>
      <el-button class="btn-left" icon="el-icon-arrow-left" @click="$router.back()"></el-button>
      <h3 class="title">群资料</h3>
      <el-button v-if="!isManage && roles.indexOf(myGroupSetting.role) > -1" class="btn-right" icon="el-icon-setting" @click="toManage()"></el-button>
    </el-header>
    <el-main>
      <div class="user-info">
        <div class="group-data">
          <div class="photo">
            <img :src="myGroupSetting.groupHeadimgurl" alt="">
          </div>
          <div class="info">
            <h3 class="name">{{ myGroupSetting.groupName }}</h3>
            <p class="num">群成员 {{ myGroupSetting.num }} 人</p>
          </div>
        </div>
      </div>
      <div v-if="!isManage" class="operate-block">
        <el-button type="text" @click="toChat()">发群聊</el-button>
      </div>
      <div v-if="!isManage" class="operate-block">
        <el-button type="text" @click="toBulletin()">群公告</el-button>
      </div>
      <div v-if="isManage && roles.indexOf(myGroupSetting.role) > -1" class="operate-block">
        <el-button type="text" @click="dialogFormVisible = true">添加新成员</el-button>
      </div>
      <ul class="group-member-list">
        <li v-for="(member, index) in sortGroupMembers(groupMembers)" :key="member.userId" class="group-member-item">
          <router-link :to="{name: 'UserInfo', params: {userId: member.userId}, query: {applyFrom: 'group', fromRemark: groupId}}" class="member-card">
            <div class="face"><img :src="member.headimgurl" alt=""></div>
            <div class="info">
              <div class="name">{{ member.nickname }}</div>
              <span v-if="member.groupNickname" class="group-name">({{ member.groupNickname }})</span>
              <el-tag v-if="member.roleName" type="success" size="small">{{ member.roleName }}</el-tag>
            </div>
            <div v-if="isManage && roles.indexOf(myGroupSetting.role) > -1" class="operate">
              <el-button @click.prevent.stop="kickingMember(member, index)" type="danger" icon="el-icon-delete" size="mini" :circle="true"></el-button>
            </div>
          </router-link>
        </li>
      </ul>
      <el-dialog v-if="isManage && roles.indexOf(myGroupSetting.role) > -1" title="添加新成员" :visible.sync="dialogFormVisible">
        <el-form :model="form">
          <el-form-item>
            <el-input v-model="form.target" placeholder="学号/手机号" auto-complete="off"></el-input>
          </el-form-item>
          <div v-if="form.userId" class="friend">
            <div class="face"><img :src="form.user.headimgurl" alt=""></div>
            <div class="info">
              <div class="name" v-text="form.user.nickname"></div>
              <div class="studentid" v-text="form.user.studentid"></div>
            </div>
          </div>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addMember" :disabled="!form.userId">确 定</el-button>
        </div>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { searchUser } from '../../api/friend'

  export default {
    name: 'GroupInfo',
    components: {

    },
    props: ['groupId'],
    data () {
      return {
        conversationType: '3',
        // groupMembers: [],
        // myGroupSetting: {},
        dialogFormVisible: false,
        form: {
          userId: '',
          target: '',
          user: {}
        }
      }
    },
    computed: {
      ...mapGetters(['objGroups']),
      isManage () {
        return this.$route.meta.isManage || false
      },
      roles () {
        return this.$route.meta.roles || []
      },
      myGroupSetting () {
        return this.objGroups[this.groupId].mySetting || {}
      },
      groupMembers () {
        return this.objGroups[this.groupId].members || []
      }
    },
    created () {
      this.fetchGroupInfo()
    },
    methods: {
      sortGroupMembers (groupMembers) {
        let roleArr = []
        let normalArr = []
        for (let member of groupMembers) {
          if (member.roleWeight > 0) {
            roleArr.push(member)
          } else {
            normalArr.push(member)
          }
        }
        if (normalArr.length > 0) {
          normalArr = normalArr.sort(function(a, b) {
            return a.nickname.localeCompare(b.nickname, 'zh-Hans-CN', {sensitivity: 'accent'});
          })
        }
        return roleArr.concat(normalArr)
      },
      fetchGroupInfo () {
        this.$store.dispatch('getGroupMembers', this.groupId).then(data => {
          // this.groupMembers = data
        })
        this.$store.dispatch('getMyGroupSetting', this.groupId).then(data => {
          // this.myGroupSetting = data
        })
      },
      kickingMember (member, index) {
        this.$confirm('确定踢出？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let params = {
            userIds: [member.userId]
          }
          this.$store.dispatch('kickingMembers', [this.groupId, params]).then(data => {
            this.groupMembers.splice(index, 1)
            this.myGroupSetting.num--
            this.$message({
              type: 'success',
              message: '踢出群聊成功!'
            })
          })
        })
      },
      addMember () {
        let form = {
          userIds: [this.form.userId]
        }
        this.$store.dispatch('joinMembers', [this.groupId, form]).then(data => {
          this.groupMembers.push(this.form.user)
          this.myGroupSetting.num++
          this.dialogFormVisible = false
          this.$message({
            type: 'success',
            message: '添加成功!'
          })
          this.form = {
            userId: '',
            target: '',
            user: {}
          }
        })
      },
      toChat () {
        this.$router.push({name: 'Chat', params: {conversationType: this.conversationType, targetId: this.groupId}})
      },
      toBulletin () {
        this.$router.push({name: 'Bulletin', params: { groupId: this.groupId }})
      },
      toManage () {
        this.$router.push({name: 'GroupInfoManage', params: { groupId: this.groupId }})
      }
    },
    watch: {
      groupId () {
        this.fetchGroupInfo()
      },
      'form.target' (val, oldVal) {
        if (val && val.length >= 10 && val.length <= 11) {
          searchUser(val).then(data => {
            if (data && data.length > 0) {
              this.form.userId = data[0].userId
              this.form.user = data[0]
            } else {
              this.form.userId = 0
              this.form.user = null
            }
          })
        } else {
          this.form.userId = 0
          this.form.user = null
        }
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
    .group-data {
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
        .name {
          margin: 10px 0 10px 0;
        }
        .num {
          font-size: 14px;
          color: #95989a;
        }
      }
    }
  }

  .operate-block {
    margin: 15px 100px;
    border-bottom: 1px solid #e9f0f8;
  }

  .group-member-list {
    margin: 20px 100px;
    list-style: none;
    padding-left: 0;

    .member-card {
      display: flex;
      align-items: center;
      justify-content: start;
      margin-bottom: 10px;
      cursor: pointer;
      text-decoration: inherit;
      color: inherit;
      &:hover, &:focus, &:active {
        background-color: #eee;
      }
      .face {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 10px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .info {
        flex: 1;
        height: 36px;
        line-height: 36px;
        border-bottom: 1px solid #e9f0f8;
        .name {
          display: inline-block;
          margin-right: 5px;
        }
        .group-name {
          color: #999;
        }
      }
      .operate {

        & /deep/ .el-button.is-circle {
          padding: 8px;
        }
      }
    }
  }

  .el-dialog .el-form {
    .friend {
      display: flex;
      align-items: center;
      justify-content: start;
      .face {
        width: 40px;
        height: 40px;
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
    }
  }

</style>
