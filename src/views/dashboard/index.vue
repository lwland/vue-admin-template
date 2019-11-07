<template>
  <div class="dashboard-container">
    <!-- :style="{backgroundImage:'url('+bg+')',backgroundRepeat:'no-repeat',backgroundSize:'100% 100%'}" -->
    <img :src="bg" class="bg-img" alt="">
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Demo',
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  data() {
    return {
      bg: require('@/assets/main/main-back.jpg')
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 10px;

  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.bg-img{
  width: 100%
}
</style>
