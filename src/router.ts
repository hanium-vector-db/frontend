import { createRouter, createWebHistory } from 'vue-router'
import Start from './components/Start.vue'
import Login from './components/Login.vue'
import Selection from './components/Selection.vue'
import Permission from './components/Permission.vue'
import GetUsername from './components/get_username.vue'
import MainHome from './components/Main_home.vue'
import CalendarView from './components/CalendarView.vue'
import SideMenu from './components/SideMenu.vue'
import Settings from './components/Settings.vue'
import VoiceRecognition from './components/VoiceRecognition.vue'
import HealthRecommend from './components/HealthRecommend.vue'
import NewsFeed from './components/NewsFeed.vue'
import PriceForecast from './components/PriceForecast.vue'
import Finance from './components/Finance.vue'
import ProfileEdit from './components/ProfileEdit.vue'
import DailyReports from './components/DailyReports.vue'
import IntegrationsManager from './components/IntegrationsManager.vue'
import LanguagePicker from './components/LanguagePicker.vue'

const routes = [
  {
    path: '/',
    name: 'Start',
    component: Start,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/selection',
    name: 'Selection',
    component: Selection,
  },
  {
    path: '/permission',
    name: 'Permission',
    component: Permission,
  },
  {
    path: '/get_username',
    name: 'GetUsername',
    component: GetUsername,
  },
  {
    path: '/main_home',
    name: 'MainHome',
    component: MainHome,
  },
  {
    path: '/calendar',
    name: 'CalendarView',
    component: CalendarView,
  },
  {
    path: '/menu',
    name: 'SideMenu',
    component: SideMenu,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
  },
  {
    path: '/voice',
    name: 'VoiceRecognition',
    component: VoiceRecognition,
  },
  {
    path: '/health',
    name: 'HealthRecommend',
    component: HealthRecommend,
  },
  {
    path: '/news',
    name: 'NewsFeed',
    component: NewsFeed,
  },
  {
    path: '/price',
    name: 'PriceForecast',
    component: PriceForecast,
  },
  {
    path: '/finance',
    name: 'Finance',
    component: Finance,
  },
  {
    path: '/profile-edit',
    name: 'ProfileEdit',
    component: ProfileEdit,
  },
  {
    path: '/daily-reports',
    name: 'DailyReports',
    component: DailyReports,
  },
  {
    path: '/integrations-manager',
    name: 'IntegrationsManager',
    component: IntegrationsManager,
  },
  {
    path: '/language-picker',
    name: 'LanguagePicker',
    component: LanguagePicker,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
