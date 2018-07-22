<template>
  <div v-show="visible" class="at-block">
    <ul class="at-list">
      <li v-for="(member, key, index) in filterMembers" :key="index" class="at-item">
        <div class="at-card" :data-index="index" :class="[(activeIndex == index) ? 'active' : '']">
          <div class="face"><img :src="member.headimgurl" alt=""></div>
          <div class="name" v-text="member.nickname"></div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>

  export default {
    name: 'At',
    props: {
      visible: Boolean,
      chatMembers: Object,
      active: {
        type: Number,
        default: 0
      },
      keyword: {
        type: String,
        default: ''
      }
    },
    computed: {
      filterMembers () {
        let filterMembers = {}
        for (let key of Object.keys(this.chatMembers)) {
          if (this.chatMembers[key].nickname.toLowerCase().indexOf(this.keyword.toLowerCase()) !== -1) {
            filterMembers[key] = this.chatMembers[key]
          }
        }
        return filterMembers
      }
    },
    data () {
      return {
        activeIndex: 0
      }
    },
    created () {

    },
    methods: {

    },
    mounted:function () {
      let that = this
      this.globalClick(function (e) {

      })
      that.globalKeyDown(function (e) {
        console.log(e)
        if (e.keyCode == 27) {
          that.$emit('update:visible', false)
        } else if (e.keyCode == 40 && that.activeIndex < Object.keys(that.filterMembers).length-1) {
          that.activeIndex++
        } else if (e.keyCode == 38 && that.activeIndex > 0) {
          that.activeIndex--
        } else if (e.keyCode == 13) {

        }
      })
    },
    watch: {
      active (val, oldVal) {
        this.activeIndex = val
      }
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">

  .at-block {
    position: absolute;
    background-color: #fff;
    border-radius: 5px;
    border: 1px solid #dde7f0;
    max-height: 300px;
    bottom: 50px;
    overflow-y: auto;
    .at-list {
      list-style: none;
      padding-left: 0;
      margin: 0;
      .at-item {
        &+.at-item {
          border-top: 1px solid #eee;
        }
        .at-card {
          display: flex;
          align-items: center;
          justify-content: start;
          width: 150px;
          padding: 5px;
          &.active {
            background-color: #dde7f0;
          }
          .face {
            width: 25px;
            height: 25px;
            overflow: hidden;
            border-radius: 50%;
            flex-shrink: 0;
            margin-right: 5px;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .name {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }

</style>
