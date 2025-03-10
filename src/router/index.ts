import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import SignIn from '@/views/SignIn.vue'
import SignUp from '@/views/SignUp.vue'
import Dashboard from '@/views/Dashboard.vue'
import Documents from '@/views/Documents.vue'
import Scanner from '@/views/Scanner.vue'
import Settings from '@/views/Settings.vue'
import Help from '@/views/Help.vue'
import Trash from '@/views/Trash.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/sign-in',
      name: 'signin',
      component: SignIn
    },
    {
      path: '/sign-up',
      name: 'signup',
      component: SignUp
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      // Add authentication guard later
    },
    {
      path: '/documents',
      name: 'documents',
      component: Documents,
      // Add authentication guard later
    },
    {
      path: '/scanner',
      component: Scanner
    },
    {
      path: '/parametres',
      name: 'settings',
      component: Settings
    },
    {
      path: '/aide',
      name: 'help',
      component: Help
    },
    {
      path: '/corbeille',
      name: 'corbeille',
      component: Trash
    }
  ]
})

export default router 