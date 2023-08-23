/** 个人中西管理路由 */
import Layout from '@/views/layout/UserLayout'

const personRouter = {
  path: '/person',
  component: Layout,
  redirect: '/person/index',
  name: 'person',
  hidden: true,
  meta: {
    title: 'Thông tin tài khoản'
  },
  children: [{
    path: 'index',
    component: () => import('@/views/user/index')
  }]
}

export default personRouter
