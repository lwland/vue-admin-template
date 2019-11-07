<template>
  <div class="app-container">
    <div class="upload-line">
      <el-upload
        :action="uploadMp3Url"
        class="upload-demo"
        accept=""
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        >
        <el-button size="small" type="primary"><i class="el-icon-upload" /> 点击上传</el-button>
        <div slot="tip" class="el-upload__tip">(只能上传单声道、8KHZ的mp3文件)</div>
      </el-upload>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="录音"  align="center">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="开始时间" width="200" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.beginTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" width="200" align="center">
        <template slot-scope="scope">
          {{ scope.row.endTime }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="用户电话" width="150" align="center">
        <template>
          {{ scope.row.user }}
          ----
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="销售电话" width="150" align="center">
        <template>
          {{ scope.row.saler }}
          ----
        </template>
      </el-table-column> -->
      <el-table-column
        fixed="right"
        label="操作"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
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
                <me @end="audioMeEnd" :ref="`me-audio-${scope.row.id}`" :id="scope.row.id" :url="scope.row.audioUrl" :text="scope.row.recordText" />
              </div>
              <div v-else align="right">
                <other @end="audioMeEnd" :ref="`me-audio-${scope.row.id}`" :id="scope.row.id" :url="scope.row.audioUrl" :text="scope.row.recordText" />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
    <!-- <drawer title="录音明细" :display.sync="display" :inner="true" :width="drawerWidth" :mask="false">
    </drawer> -->
  </div>
</template>

<script>
// import drawer from '@/components/Drawer'
import me from '@/components/Chat/me'
import other from '@/components/Chat/other'
import vueAudio from '@/components/Player'
import { getList, vad } from '@/api/table'
export default {
  components: { vueAudio, me, other },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      uploadMp3Url: '',
      dailogData: {},
      drawerWidth: '40%',
      vudioProcessWidth: '300px',
      drawer: false,
      audioIndex: 0,
      playAllStatu: false,
      tableLoading: false
    }
  },
  computed: {
    curMeRef() {
      return `my-me-audio${this.id}`
    }
  },
  created() {
    if (process.env.NODE_ENV === 'development') {
      this.uploadMp3Url = 'http://asr.focus-dev.cn/audio/uploadMp3'
    } else {
      this.uploadMp3Url = 'http://asr.focus-dev.cn/audio/uploadMp3'
    }
    var bodayWidth = document.body.clientWidth
    this.vudioProcessWidth = (bodayWidth * 0.4 * 0.57) + 'px'
    this.fetchData()
  },
  methods: {
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
    audioMeEnd() {
      this.audioIndex = this.audioIndex + 1
      if (this.audioIndex < this.dailogData.list.length && this.playAllStatu) {
        const curId = this.dailogData.list[this.audioIndex].id
        this.$refs[`me-audio-${curId}`].playAudio()
      }
    },
    fetchData() {
      this.listLoading = true
      getList().then(response => {
        this.list = response.data.items
        this.listLoading = false
      })
    },
    handleSuccess(response, file, fileList) {
      console.log(response, file, fileList)
      if (response.errorCode === 0) {
        var now = this.timest()
        var data = {
          id: now,
          name: file.name,
          beginTime: '未知',
          endTime: '未知',
          user: '未知',
          saler: '未知',
          workId: now,
          audioPath: now,
          url: response.data,
          list: []
        }
        this.list.push(data)
      } else {
        alert('上传失败')
      }
    },
    handleDetail(row) {
      this.drawer = true
      this.tableLoading = true
      this.dailogData = {}
      if (row.list.length > 0) {
        this.dailogData = row
        this.tableLoading = false
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
      // this.$confirm('确认关闭？')
      //   .then(_ => {
      //     done()
      //     // this.dailogData = {}
      //   })
      //   .catch(_ => {})
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    }
  }
}
</script>
<style>
  .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
  .info-text-container {
    height: 40px;
    line-height: 40px;
    padding-left: 10px;
    padding-right: 10px;
  }
  .flex-center{
    display: flex;
    align-items: center;
    padding-left: 10px;
    padding-right: 10px;
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
</style>
