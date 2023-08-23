/** 商业智能管理路由 */
import Layout from '@/views/layout/BiLayout'
const layout = function(path, alwaysShow, meta) {
  return {
    path: path,
    component: Layout,
    alwaysShow: alwaysShow,
    meta: {
      requiresAuth: true,
      ...meta
    }
  }
}


export default [
  {
    ...layout('/bi/customer', true, {
      permissions: ['bi', 'customer'],
      icon: 'customer-solid',
      title: 'Báo cáo hiệu suất nhân viên'
    }),
    children: [
      {
        path: 'total', // 客户总量分析
        component: () => import('@/views/bi/customer/CustomerTotalStatistics'),
        meta: {
          title: 'Tổng số khách hàng'
        }
      },
      {
        path: 'record', // 客户跟进次数分析
        component: () => import('@/views/bi/customer/CustomerRecordStatistics'),
        meta: {
          title: 'Số lần liên lạc'
        }
      },
      {
        path: 'recordmode', // 客户跟进方式分析
        component: () => import('@/views/bi/customer/CustomerRecordModeStatistics'),
        meta: {
          title: 'Cách liên lạc'
        }
      },
      {
        path: 'conversion', // 客户转化率分析
        component: () => import('@/views/bi/customer/CustomerConversionStatistics'),
        meta: {
          title: 'Tỉ lệ chuyển đổi'
        }
      },
      {
        path: 'pool', // 公海客户分析
        component: () => import('@/views/bi/customer/CustomerPoolStatistics'),
        meta: {
          title: 'Hạng mục chuyển đổi'
        }
      },
      {
        path: 'cycle', // 成交周期分析
        component: () => import('@/views/bi/customer/CustomerCycleStatistics'),
        meta: {
          title: 'Chu ky giao dịch'
        }
      },
      {
        path: 'customerSatisfaction', // 员工客户满意度分析
        component: () => import('@/views/bi/customer/CustomerSatisfaction'),
        meta: {
          title: 'Mức hài lòng của KH'
        }
      },
      {
        path: 'productSatisfaction', // 产品满意度分析
        component: () => import('@/views/bi/customer/ProductSatisfaction'),
        meta: {
          title: 'Mức hài lòng về sản phẩm'
        }
      }
    ]
  },
  {
    ...layout('/bi/business', true, {
      permissions: ['bi', 'business'],
      icon: 'funnel-solid',
      title: 'Báo cáo phễu bán hàng'
    }),
    children: [
      {
        path: 'funnel', // 销售漏斗
        component: () => import('@/views/bi/business/FunnelStatistics'),
        meta: {
          title: 'Phễu bán hàng'
        }
      },
      {
        path: 'addBusiness', // 新增商机分析
        component: () => import('@/views/bi/business/BusinessTrendStatistics'),
        meta: {
          title: 'Xu hướng mua hàng'
        }
      },
      {
        path: 'conversion', // 商机转化率分析
        component: () => import('@/views/bi/business/BusinessWinStatistics'),
        meta: {
          title: 'Tỉ lệ chuyển đổi'
        }
      }
    ]
  },
  {
    ...layout('/bi/contract', true, {
      permissions: ['bi', 'contract'],
      icon: 'results-solid',
      title: 'Báo cáo hợp đồng'
    }),
    children: [
      {
        path: 'count', // 合同数量分析
        component: () => import('@/views/bi/achievement/AchievementCountStatistics'),
        meta: {
          title: 'Theo số lượng'
        }
      },
      {
        path: 'money', // 合同金额分析
        component: () => import('@/views/bi/achievement/AchievementMoneyStatistics'),
        meta: {
          title: 'Theo giá trị hợp đồng'
        }
      },
      {
        path: 'backMoney', // 回款金额分析
        component: () => import('@/views/bi/achievement/AchievementBackStatistics'),
        meta: {
          title: 'Theo giá trị thanh toán'
        }
      },
      {
        path: 'summary', // 合同汇总表
        component: () => import('@/views/bi/achievement/AchievementSummaryStatistics'),
        meta: {
          title: 'Theo kết quả chung'
        }
      },
      {
        path: 'invoice', // 发票统计分析
        component: () => import('@/views/bi/achievement/AchievementInvoiceStatistics'),
        meta: {
          title: 'Theo hóa đơn'
        }
      }
    ]
  },
  {
    ...layout('/bi/portrait', true, {
      permissions: ['bi', 'portrait'],
      icon: 's-seas',
      title: 'Báo cáo nhân khẩu học KH'
    }),
    children: [
      {
        path: 'address', // 城市分布分析
        component: () => import('@/views/bi/customerPortrayal/CustomerAddressStatistics'),
        meta: {
          title: 'Theo khu vực'
        }
      }, {
        path: 'customer/:type', // 客户分析
        hidden: true, // 菜单不展示
        component: () => import('@/views/bi/customerPortrayal/CustomerPortrayalStatistics')
      },
      {
        path: 'customer/industry', // 客户行业分析
        component: () => import('@/views/bi/customerPortrayal/CustomerPortrayalStatistics'),
        ignore: true, // 路由添加时忽略
        meta: {
          title: 'Theo lĩnh vực'
        }
      },
      {
        path: 'customer/level', // 客户级别分析
        component: () => import('@/views/bi/customerPortrayal/CustomerPortrayalStatistics'),
        ignore: true, // 路由添加时忽略
        meta: {
          title: 'Theo chức vụ'
        }
      },
      {
        path: 'customer/source', // 客户来源分析
        component: () => import('@/views/bi/customerPortrayal/CustomerPortrayalStatistics'),
        ignore: true, // 路由添加时忽略
        meta: {
          title: 'Theo nguồn'
        }
      }
    ]
  },
  {
    ...layout('/bi/product', true, {
      permissions: ['bi', 'product'],
      icon: 'product',
      title: 'Báo cáo sản phẩm'
    }),
    children: [
      {
        path: 'sales', // 产品销售情况统计
        component: () => import('@/views/bi/product/ProductStatistics'),
        meta: {
          title: 'Sản phẩm đã bán'
        }
      },
      {
        path: 'category', // 产品分类销量分析
        component: () => import('@/views/bi/product/ProductCategoryStatistics'),
        meta: {
          title: 'Danh mục sản phẩm đã bán'
        }
      }
    ]
  },
  {
    ...layout('/bi/ranking', true, {
      permissions: ['bi', 'ranking'],
      icon: 'left-trophy',
      title: 'Bảng xếp hạng'
    }),
    children: [
      {
        path: 'contract', // 合同金额排行
        component: () => import('@/views/bi/ranking/RankingContractStatistics'),
        meta: {
          title: 'Theo giá trị hợp đồng'
        }
      },
      {
        path: 'receivables', // 回款金额排行
        component: () => import('@/views/bi/ranking/RankingReceivablesStatistics'),
        meta: {
          title: 'Theo giá trị thành toán'
        }
      },
      {
        path: 'signing', // 签约合同排行
        component: () => import('@/views/bi/ranking/RankingSigningStatistics'),
        meta: {
          title: 'Theo số lượng hợp đồng'
        }
      },
      {
        path: 'product', // 产品销量排行
        component: () => import('@/views/bi/ranking/RankingProductStatistics'),
        meta: {
          title: 'Theo sản phẩm bán ra'
        }
      },
      {
        path: 'addCustomer', // 新增客户数排行
        component: () => import('@/views/bi/ranking/RankingAddCustomerStatistics'),
        meta: {
          title: 'Theo số lượng KH mới'
        }
      },
      {
        path: 'addContacts', // 新增联系人数排行
        component: () => import('@/views/bi/ranking/RankingAddContactsStatistics'),
        meta: {
          title: 'Theo số lượng danh bạ mới'
        }
      },
      {
        path: 'recordNun', // 跟进次数排行
        component: () => import('@/views/bi/ranking/RankingRecordNunStatistics'),
        meta: {
          title: 'Theo số lượt chăm sóc KH'
        }
      },
      {
        path: 'recordCustomer', // 跟进客户数排行
        component: () => import('@/views/bi/ranking/RankingRecordCustomerStatistics'),
        meta: {
          title: 'Theo số lượt liên hệ KH'
        }
      },
      {
        path: 'examine', // 出差次数排行
        component: () => import('@/views/bi/ranking/RankingExamineStatistics'),
        meta: {
          title: 'Theo số lượng đề xuất mới'
        }
      }
    ]
  },
  {
    ...layout('/bi/oa', true, {
      permissions: ['bi', 'oa'],
      icon: 'office',
      title: 'Báo cáo công việc'
    }),
    children: [
      {
        path: 'log', // 日志分析
        component: () => import('@/views/bi/oa/Log'),
        meta: {
          title: 'Báo cáo'
        }
      },
      {
        path: 'examine', // 审批分析
        component: () => import('@/views/bi/oa/Examine'),
        meta: {
          title: 'Đề xuất'
        }
      }
    ]
  },
  {
    ...layout('/bi/target', false, {
      permissions: ['bi', 'achievement']
    }),
    children: [
      {
        path: 'complete', // 业绩目标完成情况
        component: () => import('@/views/bi/TaskCompleteStatistics'),
        meta: {
          icon: 'target-solid',
          title: 'Báo cáo doanh thu'
        }
      }
    ]
  }
]

