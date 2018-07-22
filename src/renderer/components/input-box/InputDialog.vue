<template>
  <div class="input-dialog">
    <el-dialog
      title="编辑"
      top="20vh"
      width="70%"
      :visible.sync="dialogVisible">
      <div class="input-box">
        <div class="operate-row">
          <a @click="toggleShowEmojo" class="operate-item">
            <icon name="meh-o"></icon>
            <emojo v-model="showEmojo" v-on:execCommandEmojo="execCommandEmojo" @update:value="val => showEmojo = val"></emojo>
          </a>
          <!--<div v-if="operates.indexOf('image') > -1" class="operate-item" style="position: static;">-->
            <!--<rc-image v-on:on-success="execCommandImage"></rc-image>-->
          <!--</div>-->
        </div>
        <div class="message-form">
          <el-input
            id="input-text"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 15 }"
            placeholder="请输入内容"
            @keydown.native="hotKeyExecCommandMessage"
            resize="none"
            v-model="inputText">
          </el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="execCommandMessage">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Emojo from './Emoji.vue'
//  import RcImage from './Image.vue'
  import cache from '../../utils/sessionStorage'

  export default {
    name: 'InputDialog',
    components: {
      Emojo
    },
    props: {
      value: Boolean,
      message: {
        type: Object,
        default: {
          content: ''
        }
      },
      operates: {
        type: Array,
        default () {
          return ['emoji', 'image']
        }
      }
    },
    data () {
      return {
        dialogVisible: false,
        inputText: '',
        showEmojo: false
      }
    },
    computed: {
      ...mapGetters(['sendHotKey'])
    },
    created () {
      this.dialogVisible = this.value
      this.inputText = this.emojiToSymbol(this.message.content)
    },
    methods: {
      hotKeyExecCommandMessage (e) {
        if (e.location === 0) {
          let functionKeys = []
          if (e.altKey) functionKeys.push('alt')
          if (e.ctrlKey) functionKeys.push('ctrl')
          if (e.shiftKey) functionKeys.push('shift')
          if (e.metaKey) functionKeys.push('meta')
          let editKey = e.key.toLowerCase()
          if (editKey === this.sendHotKey.editKey && functionKeys.sort().toString() === this.sendHotKey.functionKeys.sort().toString()) {
            this.execCommandMessage()
          }
        }
      },
      execCommandMessage () {
        let inputText = this.inputText
        let message = this.message
        message.type = 'text'
        message.content = this.symbolToEmoji(inputText)
        this.$emit('update:message', message)
        this.dialogVisible = false
      },
      execCommandImage () {

      },
      symbolToEmoji (symbol) {
        if (RongIMLib.RongIMEmoji && RongIMLib.RongIMEmoji.symbolToEmoji) {
          return RongIMLib.RongIMEmoji.symbolToEmoji(symbol)
        } else {
          return symbol
        }
      },
      emojiToSymbol (emoji) {
        if (RongIMLib.RongIMEmoji && RongIMLib.RongIMEmoji.emojiToSymbol) {
          return RongIMLib.RongIMEmoji.emojiToSymbol(emoji)
        } else {
          return emoji
        }
      },
      toggleShowEmojo () {
        this.showEmojo = !this.showEmojo
      },
      execCommandEmojo (emojo) {
        let $inputText = document.getElementById('input-text')
        $inputText.focus()
        let flag = document.execCommand('insertText', 'false', emojo.symbol)
        if(!flag) {
          let $text = $inputText
          this.inputText = $text.value.substr(0, $text.selectionStart) + emojo.symbol + $text.value.substring($text.selectionStart, $text.value.length)
        }
      }
    },
    watch: {
      value (val) {
        this.dialogVisible = val
      },
      dialogVisible (val) {
        this.$emit('input', val)
      },
      message (val) {
        this.inputText = this.emojiToSymbol(val.content)
      }
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">

  .input-dialog {
    /deep/ .el-dialog__body {
      border-top: 1px solid #eee;
    }
  }

  .input-box {
    height: 100%;
    .operate-row {
      padding: 10px 5px 0;
      color: #c7c7c7;
      .operate-item {
        position: relative;
        display: inline-block;
        cursor: pointer;
        font-size: 20px;
        width: 20px;
        height: 20px;
        text-align: center;
        &+.operate-item {
          margin-left: 10px;
        }
        &:hover, &:focus, &:active {
          color: #38a0fe;
        }
      }
    }
    .progress-row {

    }
    .message-form {
      display: flex;
      align-items: center;
      justify-content: start;
      padding: 0 5px;
      .text-area {
        min-height: 70px;
        flex: 1;
        outline: none;
        border: 1px solid #eee;
        border-radius: 2px;
        padding: 5px;
      }
      .btn-send {
        margin-left: 5px;
        padding: 15px 10px;
      }
    }
  }

</style>
