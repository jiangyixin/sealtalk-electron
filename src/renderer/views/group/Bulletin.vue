<template>
  <el-container>
    <el-header>
      <el-button class="btn-left" icon="el-icon-arrow-left" @click="$router.back()"></el-button>
      <h3>群公告</h3>
    </el-header>
    <el-main>
      <div class="bulletin-form">
        <el-input
          type="textarea"
          :autosize="{ minRows: 10, maxRows: 15 }"
          placeholder="请编辑群公告"
          v-model="bulletin">
        </el-input>
        <div class="text-right">
          <el-button @click="sendToAll" :disabled="(!hasBulletin || !canEdit)">发布</el-button>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'Bulletin',
    props: {
      groupId: {}
    },
    data () {
      return {
        bulletin: '',
        myGroupSetting: {}
      }
    },
    computed: {
      ...mapGetters(['userId']),
      hasBulletin () {
        return !!this.bulletin.trim()
      },
      canEdit () {
        let canEdit = false
        if (this.myGroupSetting.groupType == 'class' || this.myGroupSetting.groupType == 'committee') {
          if (['teacher', 'tutor', 'monitor'].indexOf(this.myGroupSetting.role) > -1) {
            canEdit = true
          }
        } else if (this.myGroupSetting.groupType == 'group') {
          if (['teacher', 'tutor', 'monitor', 'groupHead'].indexOf(this.myGroupSetting.role) > -1) {
            canEdit = true
          }
        } else if (this.myGroupSetting.groupType == 'free') {
          if (['teacher', 'tutor'].indexOf(this.myGroupSetting.role) > -1) {
            canEdit = true
          }
        }
        return canEdit
      }
    },
    created () {
      this.$store.dispatch('getMyGroupSetting', this.groupId).then(data => {
        this.myGroupSetting = data
        this.bulletin = data.notice
      })
    },
    methods: {
      sendToAll () {
        this.$confirm('该公告会通知全部群成员，是否发布？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let form = {
            groupId: this.groupId,
            notice: this.bulletin
          }
          this.$store.dispatch('updateGroupSetting', form).then(data => {
            let mentioneds = new RongIMLib.MentionedInfo()
            mentioneds.type = RongIMLib.MentionedType.ALL
            mentioneds.userIdList = []
            let conversation = {
              senderUserId: this.userId,
              conversationType: 3,
              targetId: this.groupId + '',
              message: {
                content: this.bulletin.trim(),
                extra: '',
                mentionedInfo: mentioneds
              },
              at: true
            }
            conversation.content = new RongIMLib.TextMessage(conversation.message)

            this.$store.dispatch('sendRcMsg', conversation).then(data => {
              console.log(data)
              this.$message({
                type: 'success',
                message: '发布成功!'
              })
            }).catch(err => {
              console.log(err)
            })
          })
        })
      }
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">

  .bulletin-form {
    padding: 50px;
  }
  .text-right {
    text-align: right;
    padding-top: 15px;
  }
</style>
