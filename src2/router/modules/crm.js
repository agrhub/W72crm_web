/** 客户管理路由 */
import Layout from '@/views/layout/CrmLayout'

const layout = function(meta = {}) {
  return {
    path: '/crm',
    component: Layout,
    meta: {
      requiresAuth: true,
      ...meta
    }
  }
}

export default [
  {
    ...layout({
      permissions: ['crm']
    }),
    children: [{
      path: 'workbench', // 仪表盘
      component: () => import('@/views/crm/workbench'),
      meta: {
        title: 'Tổng hợp',
        icon: 'board'
      }
    }]
  },
  {
    ...layout({
      permissions: ['crm']
    }),
    children: [{
      path: 'message', // 待办事项
      component: () => import('@/views/crm/message'),
      meta: {
        title: 'Công việc cần làm',
        icon: 'message',
        num: 0
      }
    }]
  },
  {
    ...layout({
      permissions: ['crm', 'leads']
    }),
    children: [{
      path: 'leads', // 线索列表
      component: () => import('@/views/crm/leads/AllIndex'),
      meta: {
        title: 'Khách hàng tiềm năng',
        icon: 'leads'
      }
    }]
  },
  {
    ...layout({
      // permissions: ['crm', 'customer']
      permissionList: [['crm', 'customer'], ['crm', 'pool'], ['crm', 'customer', 'nearbyCustomer']]
    }),
    children: [{
      path: 'customer', // 客户列表
      component: () => import('@/views/crm/customer/AllIndex'),
      meta: {
        title: 'Khách hàng',
        icon: 'customer'
      }
    }]
  },
  {
    ...layout({
      permissions: ['crm', 'contacts']
    }),
    children: [{
      path: 'contacts', // 联系人
      component: () => import('@/views/crm/contacts/index'),
      meta: {
        title: 'Danh bạ',
        icon: 'contacts'
      }
    }]
  },
  {
    ...layout({
      permissions: ['crm', 'business']
    }),
    children: [{
      path: 'business', // 商机列表
      component: () => import('@/views/crm/business'),
      meta: {
        title: 'Cơ hội kinh doanh',
        icon: 'business'
      }
    }]
  },
  {
    ...layout({
      permissions: ['crm', 'contract']
    }),
    children: [{
      path: 'contract', // 合同列表
      component: () => import('@/views/crm/contract'),
      meta: {
        title: 'Hợp đồng',
        icon: 'contract'
      }
    }]
  },
  {
    ...layout({
      permissions: ['crm', 'receivables']
    }),
    children: [{
      path: 'receivables', // 回款列表
      component: () => import('@/views/crm/receivables'),
      meta: {
        title: 'Thanh toán',
        icon: 'receivables'
      }
    }]
  },
  {
    name: 'print',
    path: '/print', // 打印
    hidden: true,
    component: () => import('@/views/crm/components/Print'),
    meta: {
      permissionList: [['crm', 'receivables', 'print'], ['crm', 'contract', 'print'], ['crm', 'business', 'print']],
      title: 'In ấn',
      icon: 'print'
    }
  },
  {
    ...layout({
      permissions: ['crm', 'invoice']
    }),
    children: [{
      path: 'invoice', // 发票列表
      component: () => import('@/views/crm/invoice'),
      meta: {
        title: 'Hóa đơn',
        icon: 'invoice'
      }
    }]
  },
  {
    ...layout({
      permissions: ['crm', 'visit']
    }),
    children: [{
      path: 'visit', // 回访列表
      component: () => import('@/views/crm/visit'),
      meta: {
        title: 'Lịch hẹn',
        icon: 'house'
      }
    }]
  },
  {
    ...layout({
      permissions: ['crm', 'product']
    }),
    children: [{
      path: 'product', // 产品列表
      component: () => import('@/views/crm/product'),
      meta: {
        title: 'Sản phẩm',
        icon: 'product'
      }
    }]
  }
]
