<template>
  <el-aside width="330px" class="select-contacts-bar" style="height: 100%;">
    <div class="select-search">
      <el-input v-model="keyword" size="medium" placeholder="🔍搜索"></el-input>
    </div>
    <div class="select-contacts">
      <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange" class="checkbox-head"
      > 群聊 ({{ filterContacts.length }})</el-checkbox>
      <el-checkbox-group v-model="checked" @change="handleCheckedChange">
        <el-checkbox v-for="contact in filterContacts" :label="contact.id" :key="contact.id">
          <slot>
            <div class="contact-card">
              <img class="face" :src="contact.avatar" alt="">
              <div class="info">
                <div class="name">{{ contact.name }}</div>
                <div class="num">{{ contact.num }}个群成员</div>
              </div>
            </div>
          </slot>
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="select-result">
      <div class="title">已选择 {{ checked.length }}/{{ contacts.length }} 群聊</div>
      <div class="checkbox-group">
        <el-checkbox-group
          v-model="sendType"
          :min="0"
          :max="1">
          <el-checkbox @click.native="changeSendType(2)" :label="2">私聊群成员</el-checkbox>
          <el-checkbox @click.native="changeSendType(1)" :label="1">群聊中@全体</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </el-aside>
</template>

<script>
  import { mapGetters } from 'vuex'
  import cache from '../../utils/sessionStorage'

  export default {
    name: 'SelectContacts',
    data () {
      return {
        keyword: '',
        checkAll: false,
        cacheKey: 'checked-contacts',
        checked: [],
        contacts: [],
        sendType: []
      }
    },
    computed: {
      ...mapGetters(['manageGroups', 'selectGroupIds', 'objGroups', 'bus']),
      filterContacts () {
        return this.contacts.filter(contact => {
          return contact.name.toLowerCase().indexOf(this.keyword.toLowerCase()) !== -1
        })
      },
      isIndeterminate () {
        let checkedCount = this.checked.length
        return checkedCount > 0 && checkedCount < this.filterContacts.length
      }
    },
    filters: {

    },
    created () {
      this.keyword = cache.get('select-contact-keyword') || ''
      this.checked = cache.get(this.cacheKey) || []
      this.sendType = cache.get('mass-send-group-type') || []
      this.$store.dispatch('getMyFriends', {applyStatus: 'passed'}).then(data => {

      })
      this.$store.dispatch('findManageGroups').then(data => {
        this.contacts = data.map(group => {
          return {
            id: group.groupId,
            name: group.groupName,
            type: group.groupType,
            avatar: group.groupHeadimgurl,
            num: group.num
          }
        })
      })
      this.bus.$on('check-contact', (checked) => {
        this.checked = checked
      })
    },
    beforeDestroy () {
      cache.set('select-contact-keyword', this.keyword)
      cache.set(this.cacheKey, this.checked)
      cache.set('mass-send-group-type', this.sendType)
    },
    methods: {
      changeSendType (type) {
        this.sendType = [type]
      },
      handleCheckAllChange (val) {
        if (val) {
          this.checked = this.filterContacts.map(contact => contact.id)
        } else {
          this.checked = []
        }
      },
      handleCheckedChange (value) {
        let checkedCount = value.length
        this.checkAll = checkedCount === this.filterContacts.length
      },
      sortContactName (arr) {
        return arr.sort(function(a, b) {
          return a.name.localeCompare(b.name, 'zh-Hans-CN', {sensitivity: 'accent'});
        })
      },
    },
    watch: {
      checked (val) {
        this.$store.commit('SET_SELECT_GROUP_IDS', val)
      },
      sendType (val) {
        let sendGroupType = val[0] || 0
        this.$store.commit('SET_SEND_GROUP_TYPE', sendGroupType)
      }
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">

  .select-contacts-bar {
    display: flex;
    flex-direction: column;
    .select-search {
      padding: 15px 25px 8px;
      border-right: 1px solid #eee;
    }
    .select-contacts {
      flex: 1;
      overflow-y: auto;
    }
    .select-result {
      flex-shrink: 0;
      border-top: 1px solid #eee;
      border-right: 1px solid #eee;
      padding: 15px 0;
      text-align: center;
      font-size: 14px;
      .title {
        color: #409EFF;
        margin-bottom: 10px;
      }
      .checkbox-group {

      }
    }
  }

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

</style>
