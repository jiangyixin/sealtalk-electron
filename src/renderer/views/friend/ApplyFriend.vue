<template>
  <el-container>
    <el-header>
      <el-button class="btn-left" icon="el-icon-arrow-left" @click="$router.back()"></el-button>
      <h3 class="title">申请将"{{ friendInfo.nickname }}"加为好友</h3>
    </el-header>
    <el-main>
      <div class="apply-form">
        <p class="tips">你需要发送验证申请，等待对方通过</p>
        <el-input
          type="textarea"
          :autosize="{ minRows: 10, maxRows: 15 }"
          :placeholder="placeholder"
          v-model="applyReason">
        </el-input>
        <div class="text-right">
          <el-button @click="submit">发送</el-button>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'ApplyFriend',
    props: [
      'friendUserId', 'applyFrom', 'fromRemark'
    ],
    data () {
      return {
        applyReason: '',
        remark: '',
        friendInfo: {}
      }
    },
    computed: {
      ...mapGetters(['userInfo']),
      placeholder () {
        return `我是${this.userInfo.nickname}，赶快通过我的好友申请，一起学习交流吧～`
      }
    },
    created () {
      let params = {
        userId: this.friendUserId
      }
      this.$store.dispatch('getFriendInfo', params).then(data => {
        this.friendInfo = data
      })
    },
    methods: {
      submit () {
        this.$confirm('确认发送好友请求？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let form = {
            friendUserId: this.friendUserId,
            applyReason: this.applyReason.trim() || this.placeholder,
            remark: this.remark,
            applyFrom: this.applyFrom,
            fromRemark: this.fromRemark
          }
          if (!this.applyFrom || !this.fromRemark) {
            form.applyFrom = 'studentid'
            form.fromRemark = this.userInfo.studentid
          }
          this.$store.dispatch('applyFriend', form).then(data => {
            console.log(data)
            this.$message({
              type: 'success',
              message: '发送成功!'
            })
            this.$router.back()
          }).catch(error => {
            console.log(error)
          })

        }).catch(() => {

        })
      }
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">
  .apply-form {
    padding: 50px;
    .tips {
      margin: 0 0 15px;
      font-size: 14px;
      color: #666;
    }
  }
  .text-right {
    text-align: right;
    padding-top: 15px;
  }
</style>
