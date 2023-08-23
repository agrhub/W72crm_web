/** 通讯录路由 */
import Layout from '@/views/layout/AddressBookLayout'

const layout = function(hidden, meta = {}) {
  return {
    path: '/addressBook',
    component: Layout,
    alwaysShow: false,
    hidden: hidden,
    meta: {
      requiresAuth: true,
      permissions: ['oa', 'book'],
      ...meta
    }
  }
}

export default [
  {
    ...layout(true),
    children: [{
      path: 'index/:type',
      meta: {
        redirect: 'index/all' // 获取传参的重置链接
      },
      component: () => import('@/views/addressBook/index')
    }]
  },
  {
    ...layout(false),
    ignore: true, // 路由添加时忽略
    children: [{
      path: 'index/all',
      meta: {
        title: 'Tất cả',
        icon: 'all'
      }
    }]
  },
  {
    ...layout(false),
    ignore: true,
    children: [{
      path: 'index/attention',
      meta: {
        title: 'Đánh dấu',
        icon: 'focus-on'
      }
    }]
  }
]
