<template>
  <div class="select-contacts-dialog">
    <el-dialog title="群发详情" :visible.sync="dialogVisible">
      <div v-if="type == 'group'" class="select-contacts">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange" class="checkbox-head"
        > 全选 ({{ canCheckedCount }})</el-checkbox>
        <el-checkbox-group v-model="checked" @change="handleCheckedChange">
          <el-checkbox v-for="contact in filterContacts" v-if="contact" :label="contact.id" :key="contact.id" :disabled="contact.disabled">
            <slot>
              <div class="contact-card">
                <img class="face" :src="contact.avatar" alt="">
                <div class="info">
                  <div class="name">{{ contact.name }}</div>
                  <div v-if="contact.num" class="num">{{ contact.num }}个群成员</div>
                </div>
              </div>
            </slot>
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div v-if="type == 'user'" class="user-info-block">
        <div v-for="contact in filterContacts" v-if="contact" :key="contact.id" class="contact-card">
          <img class="face" :src="contact.avatar" alt="">
          <div class="info">
            <div class="name">{{ contact.name }}</div>
          </div>
        </div>
      </div>
      <span v-if="type == 'group'" slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSuccess">再次选中</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import cache from '../../utils/sessionStorage'

  export default {
    name: 'ContactsDialog',
    props: {
      value: Boolean,
      type: String,
      targets: Array
    },
    data () {
      return {
        dialogVisible: false,
        keyword: '',
        checked: [],
        checkAll: false
      }
    },
    computed: {
      ...mapGetters(['manageGroups', 'objGroups', 'objFriends', 'bus']),
      isIndeterminate () {
        let checkedCount = this.checked.length
        return checkedCount > 0 && checkedCount < this.canCheckedCount
      },
      myGroupIds () {
        return this.manageGroups.map(group => group.groupId)
      },
      filterContacts () {
        let contacts = []
        if (this.type === 'user') {
          contacts = this.targets.map(target => {
            let friend = this.objFriends[target]
            if (friend) {
              friend = Object.assign({}, friend, {
                id: friend.userId || friend.friendUserId,
                name: friend.nickname || friend.studentid,
                avatar: friend.headimgurl,
                disabled: false
              })
            }
            return friend
          })
        } else if (this.type === 'group') {
          contacts = this.targets.map(target => {
            let group = this.objGroups[target]
            if (group) {
              group = Object.assign({}, group, {
                id: group.groupId,
                name: group.groupName,
                type: group.groupType,
                avatar: group.groupHeadimgurl,
                num: group.num,
                disabled: this.myGroupIds.indexOf(group.groupId) <= -1
              })
            }
            return group
          })
        }
        return contacts
      },
      canCheckedCount () {
        let count = 0
        for (let contact of this.filterContacts) {
          if (contact && !contact.disabled) {
            count++
          }
        }
        return count
      }
    },
    created () {
      this.dialogVisible = this.value
      this.initChecked()
    },
    beforeDestroy () {

    },
    methods: {
      initChecked () {
        let myGroupIds = this.manageGroups.map(group => group.groupId)
        this.checked = myGroupIds.filter(v => this.targets.indexOf(v) > -1)
        this.checkAll = this.checked.length === this.canCheckedCount
      },
      handleCheckAllChange (val) {
        if (val) {
          this.checked = this.filterContacts.map(contact => {
            if (!contact.disabled) {
              return contact.id
            }
          })
        } else {
          this.checked = []
        }
      },
      handleCheckedChange (value) {
        let checkedCount = value.length
        this.checkAll = checkedCount === this.canCheckedCount
      },
      handleSuccess () {
        this.bus.$emit('check-contact', this.checked)
        this.dialogVisible = false
      }
    },
    watch: {
      value (val) {
        this.dialogVisible = val
        if (val) {
          this.initChecked()
        }
      },
      dialogVisible (val) {
        this.$emit('input', val)
      },
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">

  .select-contacts {

    .el-checkbox {
      display: block;
      margin-left: 25px;
      &.checkbox-head {
        background-color: #ecf5ff;
        margin-bottom: 5px;
        margin-left: 0;
        padding: 5px 25px;
      }
      /deep/ .el-checkbox__label {
        vertical-align: middle;
      }
    }
  }

  .contact-card {
    padding: 5px;
    display: flex;
    .face {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      overflow: hidden;
      border-radius: 50%;
      vertical-align: middle;
    }
    .info {
      display: inline-block;
      flex: 1;
      margin-left: 5px;
      .name {
        line-height: 25px;
      }
      .num {
        font-size: 12px;
        opacity: .5;
      }
    }

  }

  .user-info-block {
    display: flex;
    flex-wrap: wrap;
    .contact-card {
      flex-grow: 1;
      width: 30%;
    }
  }

</style>
