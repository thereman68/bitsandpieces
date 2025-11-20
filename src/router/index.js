import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import CallbackView from '../views/CallbackView.vue'
import GameView from '../views/GameView.vue'
import { SpotifyService } from '../services/SpotifyService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/callback',
      name: 'callback',
      component: CallbackView
    },
    {
      path: '/game',
      name: 'game',
      component: GameView,
      meta: { requiresAuth: true }
    }
  ],
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth && !SpotifyService.accessToken) {
    // Try to restore session
    if (await SpotifyService.restoreSession()) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router
