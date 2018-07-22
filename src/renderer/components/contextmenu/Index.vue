<template>
  <div :style="style" class="context-menu" v-show="show"
       @mousedown.stop
       @contextmenu.prevent
  >
    <ul class="menu-list">
      <slot>

      </slot>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'context-menu',
    data () {
      return {
        triggerShowFn: () => {},
        triggerHideFn: () => {},
        x: null,
        y: null,
        style: {},
        binded: false
      }
    },
    props: {
      target: null,
      show: Boolean
    },
    mounted () {
      this.bindEvents()
    },
    watch: {
      show (show) {
        if (show) {
          this.bindHideEvents()
        } else {
          this.unbindHideEvents()
        }
      },
      target (target) {
        this.bindEvents()
      }
    },
    methods: {
      // 初始化事件
      bindEvents () {
        this.$nextTick(() => {
          if (!this.target || this.binded) return
          this.triggerShowFn = this.contextMenuHandler.bind(this)
          this.target.addEventListener('contextmenu', this.triggerShowFn)
          this.binded = true
        })
      },
      // 取消绑定事件
      unbindEvents () {
        if (!this.target) return
        this.target.removeEventListener('contextmenu', this.triggerShowFn)
      },
      // 绑定隐藏菜单事件
      bindHideEvents () {
        this.triggerHideFn = this.clickDocumentHandler.bind(this)
        document.addEventListener('mousedown', this.triggerHideFn)
        document.addEventListener('mousewheel', this.triggerHideFn)
      },
      // 取消绑定隐藏菜单事件
      unbindHideEvents () {
        document.removeEventListener('mousedown', this.triggerHideFn)
        document.removeEventListener('mousewheel', this.triggerHideFn)
      },
      // 鼠标按压事件处理器
      clickDocumentHandler (e) {
        this.$emit('update:show', false)
      },
      // 右键事件事件处理
      contextMenuHandler (e) {
        this.x = e.clientX
        this.y = e.clientY
        this.layout()
        this.$emit('update:show', true)
        e.preventDefault()
      },
      // 布局
      layout () {
        this.style = {
          left: this.x + 'px',
          top: this.y + 'px'
        }
      }
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">

  .context-menu {
    display: block;
    position: fixed;
    width: 100px;
    background-color: #fff;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 0 6px 0 #aaa;
    z-index: 99;
    .menu-list {
      list-style: none;
      padding-left: 0;
      margin: 0;
      line-height: 20px;
      .menu-item {
        &+.menu-item {
          border-top: 1px solid #eee;
        }
        .menu {
          display: block;
          padding: 5px;
          color: #333;
          font-size: 14px;
          text-decoration: none;
          text-align: center;
          &:hover, &:active, &:focus {
            background-color: #ecf5ff;
          }
        }
      }
    }
  }
</style>
