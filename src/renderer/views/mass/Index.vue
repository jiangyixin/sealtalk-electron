<template>
  <div class="container">
    <div class="main">
      <mass></mass>
    </div>
    <div class="side">
      <mass-list></mass-list>
    </div>
  </div>
</template>

<script>
  import Mass from './Mass.vue'
  import MassList from './List.vue'

  export default {
    name: 'MassLayout',
    components: {
      Mass, MassList
    },
    data () {
      return {

      }
    },
  }

</script>

<style scoped rel="stylesheet/scss" lang="scss">

  .container {
    height: 100%;
    display: flex;
    .main {
      flex: 1;
    }
    .side {
      flex-shrink: 0;
      width: 350px;
    }
  }

</style>
