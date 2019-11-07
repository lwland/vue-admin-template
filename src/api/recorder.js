import request from '@/utils/request'

export function uploadFile(data) {
  return request({
    // url: '/table/list',
    url: 'http://asr.focus-dev.cn/audio/uploadMp3',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

