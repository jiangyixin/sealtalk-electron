<template>
  <el-container>
    <el-aside width="400px" style="overflow: hidden;">
      <Sidebar></Sidebar>
      <component :is="curSidebar"></component>
    </el-aside>
    <el-main>
      <router-view/>
    </el-main>
  </el-container>
</template>

<script>
  import Sidebar from '../../components/Sidebar.vue'
  import Contacts from '../../components/contacts/Index.vue'
  import Conversations from '../../components/conversations/Index.vue'

  export default {
    name: 'Layout',
    components: {
      Sidebar, Contacts, Conversations
    },
    data () {
      return {}
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">

</style>
