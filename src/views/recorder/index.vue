<template>
  <div class="recorderMain" v-loading="pageLoading">
    <el-form :model="form" res="form" label-width="80px">
      <el-form-item label="类型:">
        <el-radio-group v-model="form.type">
          <el-radio :label="0">mp3</el-radio>
          <el-radio :label="1">wav</el-radio>
          <el-radio :label="2">ogg</el-radio>
          <el-radio :label="3">webm</el-radio>
          <el-radio :label="4">amr</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="比特率:" style="width:300px">
        <el-input v-model="form.bit" clearable />
      </el-form-item>
      <el-form-item label="采样率:" style="width:300px">
        <el-input v-model="form.sample" clearable />
      </el-form-item>
      <el-form-item labe="时间/音量:">
        <div class="pd">
          <div class="recpower">
            <div class="recpowerx" :style="recpowerxStyle"/>
            <div class="recpowert" >{{ recpowert }}</div>
          </div>
        </div>
      </el-form-item>
      <el-form-item>
        <div class="pd">
          <div class="waveBox" />
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :disabled="!opened" @click="recopen">打开录音</el-button>
        <el-button type="primary" :disabled="!closed" @click="recclose">关闭录音</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :disabled="!recording" @click="recstart">录制</el-button>
        <el-button type="primary" :disabled="!stoped" @click="recstop">停止</el-button>
        <el-button type="primary" :disabled="!paused" @click="recpause">暂停</el-button>
        <el-button type="primary" :disabled="!resumed" @click="recresume">继续</el-button>
      </el-form-item>
    </el-form>
    <!-- <div id="waveform" class="waveform"></div> -->
    <div class="record-audios">
      <div v-for="(item, i) in recordedData" :key="item.id" class="flex-center pad-tb">
        {{ i+':' }}
        <audio controls="controls" class="ml" :src="item.url" @play="audioPlay()" @pause="audioPause()" />
        <el-button type="primary" class="ml" @click="handleDetail(item)">详情</el-button>
      </div>
    </div>
        <el-drawer
      title="录音明细"
      :visible.sync="drawer"
      direction="rtl"
      :size="drawerWidth"
      :before-close="handleClose"
      >
      <el-row class="flex-center">
        <el-col :span="2"><el-avatar class="avatar-color" size="medium">user</el-avatar></el-col>
        <el-col :span="10" class="info-text-container">speaker1</el-col>
        <el-col :span="10" class="info-text-container" align="right">speaker2</el-col>
        <el-col :span="2"><el-avatar class="avatar-color" size="medium">saler</el-avatar></el-col>
      </el-row>
      <el-divider />
      <div class="audio-container">
        <vueAudio :url="dailogData.url" :theProcessWidth="vudioProcessWidth" />
      </div>
      <div class="button-container">
        <el-button v-if="!playAllStatu"  size="small" @click="playAll">批量播放</el-button>
        <el-button v-else size="small" @click="playAllPause">暂停</el-button>
        <el-button v-if="!tranAllStatu"  size="small" @click="tranAll">批量转文字</el-button>
        <el-button v-else size="small" @click="tranAllPause">暂停</el-button>
      </div>
      <div>
        <el-table
          :data="dailogData.list"
          style="width: 100%"
          max-height="500"
          v-loading="tableLoading"
        >
          <el-table-column style="width: 100%" label="通话记录">
            <template slot-scope="scope">
              <div v-if="scope.row.type===1" align="left">
                <me @end="audioMeEnd" @tranEnd="tranMeEnd" :ref="`me-audio-${scope.row.id}`" :id="scope.row.id" :url="scope.row.audioUrl" :text="scope.row.recordText" />
              </div>
              <div v-else align="right">
                <other @end="audioMeEnd" @tranEnd="tranMeEnd" :ref="`me-audio-${scope.row.id}`" :id="scope.row.id" :url="scope.row.audioUrl" :text="scope.row.recordText" />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import { uploadFile } from '@/api/recorder'
import me from '@/components/Chat/me'
import other from '@/components/Chat/other'
import vueAudio from '@/components/Player'
import { vad } from '@/api/table'
// import WaveSurfer from 'wavesurfer'
export default {
  components: { vueAudio, me, other },
  data() {
    return {
      pageLoading: false,
      typeConfig: [
        {
          value: 'mp3',
          engine: 'mp3,mp3-engine',
          min: '/recorder.mp3.min'
        },
        {
          value: 'wav',
          engine: 'wav',
          min: '/recorder.wav.min'
        },
        {
          value: 'ogg',
          engine: 'beta-ogg,beta-ogg-engine',
          min: ',beta-ogg'
        },
        {
          value: 'webm',
          engine: 'beta-webm',
          min: ',beta-webm'
        },
        {
          value: 'amr',
          engine: 'beta-amr,beta-amr-engine,wav',
          min: ',beta-amr'
        }
      ],
      form: {
        type: 0,
        bit: 8,
        sample: 8000
      },
      opened: true,
      closed: false,
      recording: false,
      stoped: false,
      paused: false,
      resumed: false,
      recorder: undefined,
      wavesurfer: undefined,
      wave: undefined,
      recordedData: [
        {
          audioPath: '687184084786512895511474',
          beginTime: '2019-10-22 17:55:11',
          endTime: '2019-10-22 17:57:10',
          id: 10787794,
          list: [],
          name: '687184084786512895511474.mp3',
          saler: '01053608888',
          url: 'http://400.focus.cn/api/audio/playAudio?callType=true&uniqueId=687184084786512895511474',
          user: '15810749381',
          workId: '687184084786512895511474'
        }
      ],
      dailogData: {},
      drawerWidth: '40%',
      vudioProcessWidth: '300px',
      drawer: false,
      audioIndex: 0,
      tranIndex: 0,
      playAllStatu: false,
      tableLoading: false,
      recpowert: '0/0',
      recpowerxStyle: 'width: 0%',
      tranAllStatu: false
    }
  },
  computed: {
    curMeRef() {
      return `my-me-audio${this.id}`
    }
  },
  created() {
    var bodayWidth = document.body.clientWidth
    this.vudioProcessWidth = (bodayWidth * 0.4 * 0.57) + 'px'
  },
  // mounted () {
  // 	this.$nextTick(() => {
  //     this.wavesurfer = WaveSurfer.create({
  //         container: '#waveform',
  //         waveColor: 'violet',
  //         progressColor: 'purple'
  //     })
  //     this.wavesurfer.load('http://400.focus.cn/api/audio/playAudio?callType=true&uniqueId=687184084786512895511474')
  //   })
  // },
  methods: {
    tranAllPause() {
      this.tranAllStatu = false
    },
    tranAll() {
      this.tranAllStatu = true
      if (this.tranAllStatu) {
        const curId = this.dailogData.list[this.tranIndex].id
        this.$refs[`me-audio-${curId}`].onClick()
      }
    },
    handleDetail(row, showNow = true) {
      if (showNow) {
        this.drawer = true
      }
      this.tableLoading = true
      this.dailogData = {}
      if (row.list.length > 0) {
        this.tableLoading = false
        this.dailogData = row
      } else {
        var params = {
          detailId: row.id,
          workId: row.workId,
          audioPath: row.audioPath,
          audioUrl: row.url
        }
        vad(params).then(response => {
          this.dailogData = row
          this.dailogData.list = response.data
        }).finally(_ => {
          this.tableLoading = false
        })
      }
    },
    playAllPause() {
      this.playAllStatu = false
    },
    playAll() {
      this.playAllStatu = true
      if (this.playAllStatu) {
        const curId = this.dailogData.list[this.audioIndex].id
        this.$refs[`me-audio-${curId}`].playAudio()
      }
    },
    tranMeEnd() {
      this.tranIndex = this.tranIndex + 1
      if (this.tranIndex < this.dailogData.list.length && this.tranAllStatu) {
        const curId = this.dailogData.list[this.tranIndex].id
        this.$refs[`me-audio-${curId}`].onClick()
      }
    },
    audioMeEnd() {
      this.audioIndex = this.audioIndex + 1
      if (this.audioIndex < this.dailogData.list.length && this.playAllStatu) {
        const curId = this.dailogData.list[this.audioIndex].id
        this.$refs[`me-audio-${curId}`].playAudio()
      }
    },
    recopen() {
      console.log(this.form)
      console.log(this.typeConfig[this.form.type].value)
      this.opened = false
      this.recording = true
      this.recpowerxStyle = 'width: 0%'
      this.recpowert = '0/0'
      this.recorder = window.Recorder({
        type: this.typeConfig[this.form.type].value,
        bitRate: Number(this.form.bit),
        sampleRate: Number(this.form.sample),
        onProcess: (buffers, level, time, sampleRate) => {
          this.recpowert = time + '/' + level
          console.log(this.recpowert)
          this.recpowerxStyle = 'width:' + level + '%'
          this.wave.input(buffers[buffers.length - 1], level, sampleRate)
        }
      })
      this.recorder.open(
        () => {
          // 打开麦克风授权获得相关资源
          var set = this.recorder.set
          this.reclog(
            '打开录音' +
              set.type +
              ' ' +
              set.sampleRate +
              'hz ' +
              set.bitRate +
              'kbps'
          )
          this.wave = window.WaveView({ elem: '.waveBox' })
          console.log('wave', this.wave)
        },
        (msg, isUserNotAllow) => {
          // 用户拒绝未授权或不支持
          this.reclog(
            (isUserNotAllow ? 'UserNotAllow，' : '') + '无法录音:' + msg
          )
        }
      )
    },
    recclose() {
      // 先停止才能关闭
      this.stoped = false
      this.opened = true
      this.closed = false
      if (this.recorder) {
        this.recorder.close(() => {
          this.reclog('录音关闭成功')
        })
      } else {
        this.reclog('未打开的录音')
      }
    },
    recstart() {
      this.recording = false
      this.stoped = true
      this.paused = true
      if (this.recorder) {
        this.recorder.start() // 开始录音
        var set = this.recorder.set
        this.reclog(
          '录制中：' +
            set.type +
            ' ' +
            set.sampleRate +
            'hz ' +
            set.bitRate +
            'kbps'
        )
      } else {
        this.reclog('未打开的录音')
      }
    },
    recstop() {
      this.pageLoading = true
      this.stoped = false
      this.closed = true
      this.paused = false
      if (this.recorder) {
        this.recorder.stop(
          (blob, duration) => {
            // 到达指定条件停止录音
            console.log(
              (window.URL).createObjectURL(blob),
              '时长:' + duration + 'ms'
            )
            this.recorder.close() // 释放录音资源
            // 已经拿到blob文件对象想干嘛就干嘛：立即播放、上传
            var formData = new FormData()
            var now = this.timest()
            var fileName = now + '.mp3'
            formData.append('file', blob, fileName)
            uploadFile(formData).then(response => {
              // console.log(response)
              var data = {
                id: now,
                name: fileName,
                beginTime: '未知',
                endTime: '未知',
                user: '未知',
                saler: '未知',
                workId: now,
                audioPath: now,
                url: response.data,
                list: []
              }
              this.recordedData.push(data)
              this.handleDetail(data, false)
            }).catch(e => {

            }).finally(_ => {
              this.pageLoading = false
            })
          },
          function(msg) {
            console.log('录音失败:' + msg)
          }
        )
      } else {
        this.reclog('未打开的录音')
      }
    },
    recpause() {
      this.paused = false
      this.resumed = true
      this.stoped = false
      if (this.recorder) {
        this.recorder.pause()
        this.reclog('已暂停')
      } else {
        this.reclog('未打开的录音')
      }
    },
    recresume() {
      this.resumed = false
      this.paused = true
      this.stoped = true
      if (this.recorder) {
        this.recorder.resume()
        this.reclog('继续录音中...')
      } else {
        this.reclog('未打开的录音')
      }
    },
    reclog(s) {
      var now = new Date()
      var t =
        ('0' + now.getHours()).substr(-2) +
        ':' +
        ('0' + now.getMinutes()).substr(-2) +
        ':' +
        ('0' + now.getSeconds()).substr(-2)
      console.log(t + s)
    },
    timest() {
      var tmp = Date.parse(new Date()).toString()
      tmp = tmp.substr(0, 10)
      return tmp
    },
    handleClose(done) {
      done()
      this.playAllStatu = false
      this.tableLoading = false
      this.audioIndex = 0
    },
    audioPlay() {
      console.log('audioPlay')
    },
    audioPause() {
      console.log('audioPause')
    }
  }
}
</script>
<style>
body {
  word-wrap: break-word;
  background: #fff;
}
pre {
  white-space: pre-wrap;
}
.recorderMain {
  margin: 10px;
}
.pd {
  padding: 0 0 0 0;
}
.btns button {
  padding: 5px 10px;
}
.recpower {
  height: 40px;
  width: 400px;
  background: #999;
  position: relative;
}
.recpowerx {
  height: 40px;
  background: #0b1;
  position: absolute;
}
.recpowert {
  text-align: center;
  line-height: 40px;
  position: relative;
}
.waveBox {
  height: 100px;
  width: 400px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  display: inline-block;
}
.flex-center {
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px
}
.pad-tb {
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 8px;
  padding-bottom: 8px;
}
.record-audios {
  padding-left: 80px;
}
.audio-container{
  padding-left: 10px;
  padding-right: 10px;
}
.avatar-color{
  background: #409EFF
}
.upload-line{
  float: left;
  padding-bottom: 15px;
}
.el-upload__tip{
  color: red
}
.button-container{
  padding-left: 10px;
  padding-top: 10px;
}
.waveform {
    max-width: 800px;
    height: 150px;
    margin: auto;
}
.ml {
  margin-left: 15px
}
</style>
