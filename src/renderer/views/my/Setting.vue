<template>
  <el-container>
    <el-header>
      <el-button class="btn-left" icon="el-icon-arrow-left" @click="$router.back()"></el-button>
      <h3 class="title">用户设置</h3>
    </el-header>
    <el-main>
      <div class="user-info">
        <div v-if="userInfo" class="user-data">
          <div class="photo">
            <img :src="userInfo.headimgurl" alt="">
          </div>
          <div class="info">
            <h3 class="username">{{ userInfo.nickname }}</h3>
            <p class="studentid">{{ userInfo.studentid }}</p>
          </div>
        </div>
      </div>
      <div class="operate-block">
        <div class="operate-item">
          <label class="label">发送快捷键</label>
          <el-input v-model="hotKey" @keydown.native="onKeyDown" class="input" placeholder="请按下快捷键" readonly="readonly"></el-input>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'Setting',
    computed: {
      ...mapGetters(['userInfo', 'sendHotKey']),
      hotKey () {
        let fKey = this.sendHotKey.functionKeys.join('+')
        return fKey ? fKey + '+' + this.sendHotKey.editKey : this.sendHotKey.editKey
      }
    },
    data () {
      return {

      }
    },
    methods: {
      onKeyDown (e) {
        if (e.location === 0) {
          let set = new Set([])
          if (e.altKey) set.add('alt')
          if (e.ctrlKey) set.add('ctrl')
          if (e.shiftKey) set.add('shift')
          if (e.metaKey) set.add('meta')
          let hotKey = {
            functionKeys: Array.from(set),
            editKey: e.key.toLowerCase()
          }
          this.$store.commit('SET_SEND_HOT_KEY', hotKey)
        }
        return false
      }
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">

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
        .username {
          margin: 10px 0 10px 0;
        }
        .studentid {
          font-size: 14px;
          color: #95989a;
        }
      }
    }
  }

  .operate-block {
    padding: 20px 100px;
    .operate-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .label {
        flex-shrink: 0;
        margin-right: 10px;
      }
      .input {
        flex: 1;
      }
    }
  }

</style>
