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
// 기경: 아래에 새로 작성한 컴포넌트 import 수정함
import PriceFeatureEntry from './components/price/PriceFeatureEntry.vue'
// 새로 추가된 컴포넌트들
import QuickWidgets from './components/QuickWidgets.vue'
import NotificationCenter from './components/NotificationCenter.vue'
import WeatherDetail from './components/WeatherDetail.vue'
import FinanceDetail from './components/FinanceDetail.vue'
import NewsKeywordManager from './components/NewsKeywordManager.vue'
import NutritionGoals from './components/NutritionGoals.vue'
import DietPlan from './components/DietPlan.vue'
import PurchaseGuide from './components/PurchaseGuide.vue'
import NotificationSettings from './components/NotificationSettings.vue'
import SecuritySettings from './components/SecuritySettings.vue'


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
    path: '/price-feature', // 기경: 새 라우트 추가
    name: 'PriceFeatureEntry',
    component: PriceFeatureEntry,
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
  {
    path: '/quick-widgets',
    name: 'QuickWidgets',
    component: QuickWidgets,
  },
  {
    path: '/notifications',
    name: 'NotificationCenter',
    component: NotificationCenter,
  },
  {
    path: '/weather-detail',
    name: 'WeatherDetail',
    component: WeatherDetail,
  },
  {
    path: '/finance-detail',
    name: 'FinanceDetail',
    component: FinanceDetail,
  },
  {
    path: '/news-keyword-manager',
    name: 'NewsKeywordManager',
    component: NewsKeywordManager,
  },
  {
    path: '/nutrition-goals',
    name: 'NutritionGoals',
    component: NutritionGoals,
  },
  {
    path: '/diet-plan',
    name: 'DietPlan',
    component: DietPlan,
  },
  {
    path: '/purchase-guide',
    name: 'PurchaseGuide',
    component: PurchaseGuide,
  },
  {
    path: '/notification-settings',
    name: 'NotificationSettings',
    component: NotificationSettings,
  },
  {
    path: '/security-settings',
    name: 'SecuritySettings',
    component: SecuritySettings,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
