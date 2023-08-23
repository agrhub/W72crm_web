/** 任务审批路由+ */
import Layout from '@/views/layout/TaskExamineLayout'

const layout = function(hidden, meta = {}) {
  return {
    path: '/taskExamine',
    component: Layout,
    alwaysShow: false,
    hidden: hidden,
    meta: {
      requiresAuth: true,
      permissions: ['oa', 'taskExamine'],
      ...meta
    }
  }
}

export default [
  {
    ...layout(true),
    children: [{
      path: 'task-index/:type',
      meta: {
        redirect: 'task-index/1' // 获取传参的重置链接
      },
      component: () => import('@/views/taskExamine/task/index')
    }]
  },
  {
    ...layout(false),
    ignore: true, // 路由添加时忽略
    children: [{
      path: 'task-index/1',
      meta: {
        title: 'Công việc cần làm',
        icon: 'my-task'
      }
    }]
  },
  {
    ...layout(false),
    ignore: true,
    children: [{
      path: 'task-index/2',
      meta: {
        title: 'Công việc đã giao',
        icon: 'o-task'
      }
    }]
  },

  {
    ...layout(true),
    children: [{
      path: 'examine-index/:type',
      meta: {
        redirect: 'examine-index/my' // 获取传参的重置链接
      },
      component: () => import('@/views/taskExamine/examine/index')
    }]
  },
  {
    ...layout(false),
    ignore: true, // 路由添加时忽略
    children: [{
      path: 'examine-index/my',
      meta: {
        title: 'Đề xuất bạn đã duyệt',
        icon: 'apply-for'
      }
    }]
  },
  {
    ...layout(false),
    ignore: true,
    children: [{
      path: 'examine-index/wait',
      meta: {
        title: 'Để xuất chờ bạn duyệt (văn phòng)',
        icon: 'approve'
      }
    }]
  },

  {
    ...layout(true),
    children: [{
      path: 'crm/:type',
      meta: {
        redirect: 'crm/contract' // 获取传参的重置链接
      },
      component: () => import('@/views/taskExamine/crm/index')
    }]
  },
  {
    ...layout(false),
    ignore: true, // 路由添加时忽略
    children: [{
      path: 'crm/contract',
      meta: {
        title: 'Hợp đồng chờ bạn duyệt (kinh doanh)',
        icon: 'contract'
      }
    }]
  },
  {
    ...layout(false),
    ignore: true,
    children: [{
      path: 'crm/receivables',
      meta: {
        title: 'Thanh toán chờ bạn duyệt (kinh doanh)',
        icon: 'receivables'
      }
    }]
  },
  {
    ...layout(false),
    ignore: true,
    children: [{
      path: 'crm/invoice',
      meta: {
        title: 'Hóa đơn chờ bạn duyệt (kinh doanh)',
        icon: 'invoice'
      }
    }]
  }
]
