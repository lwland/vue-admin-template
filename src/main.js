import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import '@/icons' // icon
import '@/permission' // permission control
import audio from 'vue-mobile-audio'
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */
import { mockXHR } from '../mock'
if (process.env.NODE_ENV === 'production') {
  mockXHR()
}

require('./js/recorder-core')
require('./js/engine/mp3')
require('./js/engine/mp3-engine')
require('./js/engine/wav')
// require('./js/engine/beta-amr')
// require('./js/engine/beta-amr-engine')
// require('./js/engine/beta-ogg')
// require('./js/engine/beta-ogg-engine')
// require('./js/engine/beta-webm')
require('./js/extensions/waveview')
// set ElementUI lang to EN
Vue.use(ElementUI, { locale })
Vue.use(audio)
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
