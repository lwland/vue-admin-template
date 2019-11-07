<template>
  <div class="flex-normal">
    <el-avatar class="avatar-color">user</el-avatar>
    <div class="me-container">
      <div>
        <span @click="playAudio"><my-audio :ref="curRef" :src="url" @end="audioEnd" /></span>
        <span v-if="isRead"><el-tag type="info">已读</el-tag></span>
      </div>
      <div>
        <div v-if="isTranText" :class="[isActive? 'me-chat-content' : 'disabled-me-content']" @click="onClick()">{{ recordText }}</div>
        <div v-else class="me-chat-content">{{ recordText }}</div>
      </div>
    </div>
    <!-- <vueAudio :url="url" :theControlList="controllist" /> -->
  </div>
</template>
<script>
import { tranSentence } from '@/api/table'
import MyAudio from './m-audio'
export default {
  props: {
    url: {
      type: String,
      required: true,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    id: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      recordText: '',
      isTranText: false,
      isRead: false,
      isActive: true
    }
  },
  components: {
    MyAudio
  },
  computed: {
    curRef() {
      return `my-audio${this.id}`
    }
  },
  created() {
    console.log(this)
    if (this.text !== '') {
      this.recordText = this.text
      this.isTranText = false
    } else {
      this.recordText = '点击转文字'
      this.isTranText = true
    }
  },
  methods: {
    onClick() {
      if (!this.isTranText) {
        this.$emit('tranEnd')
        return
      }
      this.isActive = false
      this.recordText = '转文字中...'
      const params = {
        url: this.url,
        id: this.id
      }
      tranSentence(params).then(response => {
        this.isTranText = false
        this.recordText = response.data
        this.isActive = true
        this.$emit('tranEnd')
      })
    },
    playAudio() {
      this.$refs[this.curRef].play()
    },
    audioEnd() {
      console.log(11111)
      this.isRead = true
      this.$emit('end')
    }
  }
}
</script>
<style scope>
.flex-normal{
  display: flex;
  align-items: normal;
  padding-top: 5px;
  padding-bottom: 5px;
}
.me-chat-content{
  max-width: 300px;
  display: inline-block;
  border-radius: 4px;
  background: #83BCF7;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  padding-right: 8px;
  padding-left: 8px;
  padding-top: 5px;
  padding-bottom: 5px
}
.me-container{
  margin-left: 8px
}
.disabled-me-content{
  max-width: 300px;
  display: inline-block;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  padding-right: 8px;
  padding-left: 8px;
  padding-top: 5px;
  padding-bottom: 5px;
  pointer-events: none;
  background: #D6DBE0;
}
</style>
