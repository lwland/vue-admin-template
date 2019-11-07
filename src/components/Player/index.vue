<template>
  <div :disabled="audio.waiting" class="main-wrap">
    <!-- 这里设置了ref属性后，在vue组件中，就可以用this.$refs.audio来访问该dom元素 -->
    <audio
      ref="audio"
      class="dn"
      :src="url"
      :preload="audio.preload"
      @play="onPlay"
      @error="onError"
      @waiting="onWaiting"
      @pause="onPause"
      @timeupdate="onTimeupdate"
      @loadedmetadata="onLoadedmetadata"
    >您的浏览器不支持播放音乐</audio>
    <div class="flex">
      <i v-show="!audio.playing" style="font-size:27px" class="el-icon-video-play" @click="startPlayOrPause" />
      <i v-show="audio.playing" style="font-size:27px" class="el-icon-video-pause" @click="startPlayOrPause" />
      <el-button v-if="!controlList.noSpeed" type="text" @click="changeSpeed">{{ audio.speed | transSpeed }}</el-button>
      <el-slider v-if="!controlList.noProcess" v-model="sliderTime" :style="processWidth" :format-tooltip="formatProcessToolTip" class="h-slider" @change="changeCurrentTime" />
      <el-tag v-if="!controlList.noTime" type="info">{{ audio.currentTime | formatSecond }} | {{ audio.maxTime | formatSecond }}</el-tag>
      <el-button v-if="!controlList.noMuted" type="text" @click="startMutedOrNot">{{ audio.muted | transMutedOrNot }}</el-button>
      <el-slider v-if="!controlList.noVolume" vertical height="100px" v-model="volume" :format-tooltip="formatVolumeToolTip" @change="changeVolume" />
      <a v-if="!controlList.noDownload" :href="url" target="_blank" class="download" download><i class="el-icon-download" /></a>
    </div>
  </div>
</template>
<script>
function realFormatSecond(second) {
  var secondType = typeof second
  if (secondType === 'number' || secondType === 'string') {
    second = parseInt(second)
    var hours = Math.floor(second / 3600)
    second = second - hours * 3600
    var mimute = Math.floor(second / 60)
    second = second - mimute * 60
    return ('0' + mimute).slice(-2) + ':' + ('0' + second).slice(-2)
  } else {
    return '00:00'
  }
}
export default {
  filters: {
    formatSecond(second = 0) {
      return realFormatSecond(second)
    },
    transMutedOrNot(value) {
      return value ? '放音' : '静音'
    },
    transSpeed(value) {
      return '快进: x' + value
    }
  },
  props: {
    url: {
      type: String,
      required: true,
      default: ''
    },
    theSpeeds: {
      type: Array,
      default() {
        return [1, 1.5, 2]
      }
    },
    theControlList: {
      type: String,
      default: ''
    },
    theProcessWidth: {
      type: String,
      default: '55%'
    }
  },
  data() {
    return {
      // url: this.theUrl || 'http://devtest.qiniudn.com/secret base~.mp3',
      audio: {
        currentTime: 0,
        maxTime: 0,
        playing: false,
        muted: false,
        speed: 1,
        waiting: true,
        preload: 'auto'
      },
      sliderTime: 0,
      volume: 100,
      speeds: this.theSpeeds,
      controlList: {
        // 不显示下载
        noDownload: false,
        // 不显示静音
        noMuted: true,
        // 不显示音量条
        noVolume: true,
        // 不显示进度条
        noProcess: false,
        // 只能播放一个
        onlyOnePlaying: false,
        // 不要快进按钮
        noSpeed: true,
        noTime: false
        // noDownload noMuted noVolume noProcess noSpeed noTime
      },
      processWidth: 'width: 55%'
    }
  },
  created() {
    this.setControlList()
    this.processWidth = 'width: ' + this.theProcessWidth
  },
  methods: {
    setControlList() {
      console.log('the_control_list', this.theControlList)
      const controlList = this.theControlList.split(' ')
      controlList.forEach((item) => {
        if (this.controlList[item] !== undefined) {
          this.controlList[item] = true
        }
      })
    },
    changeSpeed() {
      const index = this.speeds.indexOf(this.audio.speed) + 1
      this.audio.speed = this.speeds[index % this.speeds.length]
      this.$refs.audio.playbackRate = this.audio.speed
    },
    startMutedOrNot() {
      this.$refs.audio.muted = !this.$refs.audio.muted
      this.audio.muted = this.$refs.audio.muted
    },
    // 音量条toolTip
    formatVolumeToolTip(index) {
      return '音量条: ' + index
    },
    // 进度条toolTip
    formatProcessToolTip(index = 0) {
      index = parseInt(this.audio.maxTime / 100 * index)
      return '进度条: ' + realFormatSecond(index)
    },
    // 音量改变
    changeVolume(index = 0) {
      this.$refs.audio.volume = index / 100
      this.volume = index
    },
    // 播放跳转
    changeCurrentTime(index) {
      this.$refs.audio.currentTime = parseInt(index / 100 * this.audio.maxTime)
    },
    startPlayOrPause() {
      return this.audio.playing ? this.pausePlay() : this.startPlay()
    },
    // 开始播放
    startPlay() {
      this.$refs.audio.play()
    },
    // 暂停
    pausePlay() {
      this.$refs.audio.pause()
    },
    // 当音频暂停
    onPause() {
      this.audio.playing = false
    },
    // 当发生错误, 就出现loading状态
    onError() {
      this.audio.waiting = true
    },
    // 当音频开始等待
    onWaiting(res) {
      console.log(res)
    },
    // 当音频开始播放
    onPlay(res) {
      console.log(res)
      this.audio.playing = true
      this.audio.loading = false
      if (!this.controlList.onlyOnePlaying) {
        return
      }
      const target = res.target
      const audios = document.getElementsByTagName('audio');
      [...audios].forEach((item) => {
        if (item !== target) {
          item.pause()
        }
      })
    },
    // 当timeupdate事件大概每秒一次，用来更新音频流的当前播放时间
    onTimeupdate(res) {
      // console.log('timeupdate')
      // console.log(res)
      this.audio.currentTime = res.target.currentTime
      this.sliderTime = parseInt(this.audio.currentTime / this.audio.maxTime * 100)
    },
    // 当加载语音流元数据完成后，会触发该事件的回调函数
    // 语音元数据主要是语音的长度之类的数据
    onLoadedmetadata(res) {
      console.log('loadedmetadata')
      console.log(res)
      this.audio.waiting = false
      this.audio.maxTime = parseInt(res.target.duration)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .main-wrap{
    background: #DCDFE6;
    border-radius: 4px;
    display: flex;
    box-align: center;
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .h-slider {
    display: inline-block;
    position: relative;
    margin-left: 15px;
    margin-right: 15px;
  }
  .flex {
    display: flex;
    align-items: center;
  }
  .download {
    color: #000000;
    font-size: 20px;
    margin-left: 10px;
  }
  .dn{
    display: none;
  }
</style>
