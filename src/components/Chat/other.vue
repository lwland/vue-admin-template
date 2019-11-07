<template>
  <div class="flex-right">
    <el-avatar class="avatar-color">saler</el-avatar>
    <div class="other-container">
      <div>
        <span v-if="isRead"><el-tag type="info">已读</el-tag></span>
         <span @click="playAudio"><my-audio :ref="curRef" :src="url" @end="audioEnd" /></span>
      </div>
      <div>
        <div v-if="isTranText" :class="isActive?'other-chat-content':'disabled-other-content'" @click="onClick()">{{ recordText }}</div>
        <div v-else class="other-chat-content">{{ recordText }}</div>
      </div>
    </div>
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
    if (this.text !== '') {
      this.recordText = this.text
      this.isTranText = false
    } else {
      this.recordText = '点击转文字'
      this.isTranText = true
    }
  },
  methods: {
    playAudio() {
      this.$refs[this.curRef].play()
    },
    onClick() {
      // console.log(this.isTranText)
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
    audioClick() {
      console.log('audioClick')
      this.isRead = true
    },
    audioEnd() {
      console.log(2222)
      this.isRead = true
      this.$emit('end')
    }
  }
}
</script>
<style>
.flex-right{
  display: flex;
  align-items: normal !important;
  flex-direction: row-reverse;
  padding-top: 5px;
  padding-bottom: 5px;
}
.other-chat-content{
  max-width: 300px;
  display: inline-block;
  text-align: left;
  border-radius: 4px;
  background: #0EEBB0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  padding-right: 8px;
  padding-left: 8px;
  padding-top: 5px;
  padding-bottom: 5px
}
.other-container{
  margin-right: 8px
}
.disabled-other-content{
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
