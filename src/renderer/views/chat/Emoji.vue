<template>
  <div v-if="value" ref="emojoBox" class="emojo-box">
    <template v-for="(emojo, index) in emojoList">
      <span @click="handleInput(emojo)" class="emojo" v-html="symbolToHTML(emojo.symbol)"></span>
    </template>
  </div>
</template>

<script>

  export default {
    name: 'Emoji',
    props: {
      value: Boolean
    },
    data () {
      return {
        emojoList: {}
      }
    },
    created () {
      this.emojoList = RongIMLib.RongIMEmoji.list
    },
    methods: {
      symbolToHTML (symbol) {
        if (RongIMLib.RongIMEmoji && RongIMLib.RongIMEmoji.symbolToHTML) {
          return RongIMLib.RongIMEmoji.symbolToHTML(symbol)
        }
      },
      handleInput (emojo) {
        this.$emit('execCommandEmojo', emojo.symbol)
      }
    },
    mounted:function () {
      let that = this
      this.globalClick(function (e) {
        if (that.$refs.emojoBox && !that.$refs.emojoBox.contains(e.target)) {
          that.$emit('update:value', false)
        }
      })
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">

  .emojo-box {
    position: absolute;
    background-color: #fff;
    bottom: 38px;
    width: 388px;
    padding: 5px;
    border: 1px solid #D9DADC;
    z-index: 1000;
    border-radius: 4px;
    .emojo {
      display: inline-block;
      border-radius: 2px;
      font-size: 16px;
      &:hover, &:active, &:focus {
        background-color: #ddd;
      }
    }
  }

</style>
