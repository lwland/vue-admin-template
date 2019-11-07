import request from '@/utils/request'

export function getList(params) {
  return request({
    // url: '/table/list',
    url: 'http://asr.focus-dev.cn/audio/demoList',
    method: 'get',
    params
  })
}
export function vad(params) {
  return request({
    url: 'http://asr.focus-dev.cn/audio/vad',
    method: 'get',
    params: params
  })
}

export function tranSentence(params) {
  return request({
    url: 'http://asr.focus-dev.cn/audio/sentenceTran',
    method: 'get',
    params: params
  })
}

