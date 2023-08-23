/** crm自定义列表 公共逻辑 */
import {
  filedGetTableFieldAPI
} from '@/api/crm/common'
import crmTypeModel from '@/views/crm/model/crmTypeModel'
import {
  crmMessageCheckContractAPI,
  crmMessageCheckReceivablesAPI,
  crmMessageTodayLeadsAPI,
  crmMessageTodayCustomerAPI,
  crmMessageTodayBusinessAPI,
  crmMessageFollowLeadsAPI,
  crmMessageFollowCustomerAPI,
  crmMessagEndContractAPI,
  crmMessagRemindreceivablesplanAPI,
  crmMessagRemindCustomerAPI,
  crmMessagVisitRemindAPI,
  crmMessageCheckInvoiceAPI
} from '@/api/crm/message'
import CheckStatusMixin from '@/mixins/CheckStatusMixin'
import { invoiceHeaderFields } from '../../invoice/js/fields'

export default {
  components: {},
  data() {
    return {
      loading: false, // 加载动画
      tableHeight: document.documentElement.clientHeight - 300, // 表的高度
      list: [],
      fieldList: [],
      currentPage: 1,
      pageSize: 15,
      pageSizes: [15, 30, 45, 60],
      total: 0
    }
  },

  mixins: [CheckStatusMixin],

  computed: {
    // 展示options下拉选择
    showOptions() {
      if (this.infoType == 'putInPoolRemind' || this.infoType == 'returnVisitRemind') {
        return false
      }
      return true
    }
  },

  mounted() {
    this.$bus.on('message-scroll', tableHeight => {
      this.tableHeight = tableHeight
    })

    this.$bus.on('examine-handle-bus', () => {
      this.getList()
    })

    /** 控制table的高度 */
    window.onresize = () => {
      this.updateTableHeight()
    }
  },

  methods: {
    /**
     * 当某一行被点击时会触发该事件
     * @param {*} row
     * @param {*} column
     * @param {*} event
     */
    handleRowClick(row, column, event) {
      if (this.crmType === 'leads') {
        if (column.property === 'leadsName') {
          this.rowID = row.leadsId
          this.rowType = 'leads'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'customer') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'contacts') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'name') {
          this.rowID = row.contactsId
          this.rowType = 'contacts'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'business') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'businessName') {
          this.rowID = row.businessId
          this.rowType = 'business'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'contract') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'businessName') {
          this.rowID = row.businessId
          this.rowType = 'business'
          this.showDview = true
        } else if (column.property === 'contactsName') {
          this.rowID = row.contactsId
          this.rowType = 'contacts'
          this.showDview = true
        } else if (column.property === 'num') {
          this.rowID = row.contractId
          this.rowType = 'contract'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'product') {
        if (column.property === 'name') {
          this.rowID = row.productId
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'receivables') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'contractNum') {
          this.rowID = row.contractId
          this.rowType = 'contract'
          this.showDview = true
        } else if (column.property === 'number') {
          this.rowID = row.receivablesId
          this.rowType = 'receivables'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'receivables_plan') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'contractNum' || column.property === 'contractName') {
          this.rowID = row.contractId
          this.rowType = 'contract'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'invoice') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'contractNum') {
          this.rowID = row.contractId
          this.rowType = 'contract'
          this.showDview = true
        } else if (column.property === 'invoiceApplyNumber') {
          this.rowID = row.invoiceId
          this.rowType = 'invoice'
          this.showDview = true
        } else {
          this.showDview = false
        }
      }
    },

    /** 获取列表数据 */
    getList(loading = true) {
      this.loading = loading
      var crmIndexRequest = this.getIndexRequest()
      const params = {
        page: this.currentPage,
        limit: this.pageSize
      }

      if (this.showSubType) {
        params.isSub = this.isSubType
      }

      if (this.showOptions) {
        params.type = this.optionsType
      }

      const filterObj = this.filterObj.obj
      if (filterObj && Object.keys(filterObj).length > 0) {
        params.data = filterObj
      }

      crmIndexRequest(params)
        .then(res => {
          this.list = res.data.list
          this.total = res.data.totalRow

          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /** 获取列表请求 */
    getIndexRequest() {
      return {
        'todayLeads': crmMessageTodayLeadsAPI,
        'todayCustomer': crmMessageTodayCustomerAPI,
        'todayBusiness': crmMessageTodayBusinessAPI,
        'followLeads': crmMessageFollowLeadsAPI,
        'followCustomer': crmMessageFollowCustomerAPI,
        'checkContract': crmMessageCheckContractAPI,
        'checkReceivables': crmMessageCheckReceivablesAPI,
        'remindReceivablesPlan': crmMessagRemindreceivablesplanAPI,
        'endContract': crmMessagEndContractAPI,
        'putInPoolRemind': crmMessagRemindCustomerAPI,
        'returnVisitRemind': crmMessagVisitRemindAPI,
        'checkInvoice': crmMessageCheckInvoiceAPI
      }[this.infoType]
    },

    /** 获取字段 */
    getFieldList() {
      console.log('this.crmType', this.crmType)
      if (this.crmType == 'receivables_plan' || this.crmType == 'invoice') {
        let list = []
        if (this.crmType == 'receivables_plan') {
          list = [{
            fieldName: 'num',
            formType: 'text',
            name: 'Số kỳ'
          },
          {
            fieldName: 'customerName',
            formType: 'customerName',
            name: 'Tên khách hàng'
          },
          {
            fieldName: 'contractNum',
            formType: 'contractNum',
            name: 'Số hợp đồng'
          },
          {
            fieldName: 'money',
            formType: 'text',
            name: 'Số tiền thanh toán theo kế hoạch'
          },
          {
            fieldName: 'returnDate',
            formType: 'text',
            name: 'Ngày thanh toán dự kiến'
          },
          {
            fieldName: 'returnType',
            formType: 'text',
            name: 'Phương thức thanh toán'
          },
          {
            fieldName: 'remind',
            formType: 'text',
            name: 'Nhắc trước vài ngày'
          },
          {
            fieldName: 'remark',
            formType: 'text',
            name: 'Ghi chú'
          }]
          this.handelFieldList(list)
        } else if (this.crmType == 'invoice') {
          this.fieldList = invoiceHeaderFields
        }
        // 获取好字段开始请求数据
        this.getList()
        return
      }

      filedGetTableFieldAPI({
        label: crmTypeModel[this.crmType]
      })
        .then(res => {
          this.handelFieldList(res.data)

          // 获取好字段开始请求数据
          this.getList()
        })
        .catch(() => {
          this.loading = false
        })
    },

    handelFieldList(list) {
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
        var width = 0
        if (!element.width) {
          if (element.name && element.name.length <= 6) {
            width = element.name.length * 15 + 45
          } else {
            width = 140
          }
        } else {
          width = element.width
        }

        this.fieldList.push({
          prop: element.fieldName,
          label: element.name,
          width: width
        })
      }

      // // 待进入公海的客户 添加距进入公海天数字段
      // if (this.infoType == 'putInPoolRemind') {
      //   this.fieldList.push({
      //     prop: 'poolDay',
      //     label: '距进入公海天数',
      //     width: 140
      //   })
      // }
    },

    columnHeaderFormatter(title) {
      console.log(title)
      title = title.toLowerCase()
      switch (title) {
        // customer
        case 'lead name':
        case 'customer name':
          title = 'Tên khách hàng'
          break
        case 'lead source':
        case 'customer source':
          title = 'Nguồn khách hàng'
          break
        case 'mobile':
          title = 'Số di động'
          break
        case 'telephone':
        case 'phone':
          title = 'Số điện thoại'
          break
        case 'mailbox':
          title = 'Email'
          break
        case 'url':
          title = 'Website'
          break
        case 'customer industry':
          title = 'Lĩnh vực'
          break
        case 'customer level':
          title = 'Độ ưu tiên'
          break
        case 'next contact time':
          title = 'Lần liên hệ kế'
          break
        case 'remark':
          title = 'Ghi chú'
          break
        case 'state':
        case 'status':
          title = 'Trạng thái'
          break
        case 'dealstatus':
          title = 'Trạng thái giao dịch'
          break
        case 'lasttime':
          title = 'Lần liên hệ cuối'
          break
        case 'lastcontent':
          title = 'Nhật ký liên hệ cuối'
          break
        case 'detailaddress':
          title = 'Địa chỉ'
          break
        case 'address':
          title = 'Khu vực'
          break
        case 'poolday':
          title = 'Ngày hết hạn'
          break
        case 'ownerusername':
          title = 'Quản lý'
          break
        case 'updatetime':
          title = 'Ngày cập nhật'
          break
        case 'createtime':
          title = 'Ngày tạo'
          break
        case 'createusername':
          title = 'Người phụ trách'
          break
        // contact
        case 'name':
          title = 'Tên danh bạ'
          break
        case 'post':
          title = 'Chức vụ'
          break
        case 'is the key decision maker':
          title = 'Người quyết định chính'
          break
        case 'remarks':
          title = 'Ghi chú'
          break
        case 'sex':
          title = 'Ông/Bà'
          break
        // business
        case 'business name':
          title = 'Tên cơ hội'
          break
        case 'opportunity amount':
          title = 'Giá trị cơ hội'
          break
        case 'expected transaction date':
          title = 'Ngày chốt dự kiến'
          break
        case 'typename':
          title = 'Loại cơ hội'
          break
        case 'statusname':
          title = 'Trạng thái'
          break
        // contract
        case 'contract number':
          title = 'Số hợp đồng'
          break
        case 'contract name':
          title = 'Tiêu đề hợp đồng'
          break
        case 'business opportunity name':
          title = 'Tên cơ hội'
          break
        case 'contract amount':
          title = 'Giá trị hợp đồng'
          break
        case 'order time':
          title = 'Ngày ký'
          break
        case 'contract start time':
          title = 'Ngày bắt đầu'
          break
        case 'contract end time':
          title = 'Ngày kết thúc'
          break
        case 'customer contractor':
          title = 'Người đại diện'
          break
        case 'company contractor':
          title = 'Công ty'
          break
        case 'contract type':
          title = 'Loại hợp đồng'
          break
        case 'checkstatus':
          title = 'Trạng thái'
          break
        case 'receivedmoney':
          title = 'Số tiền đã thanh toán'
          break
        case 'unreceivedmoney':
          title = 'Số tiền chưa thanh toán'
          break
        // payment
        case 'payment number':
          title = 'Số thanh toán'
          break
        case 'number of periods':
          title = 'Số kỳ'
          break
        case 'return date':
          title = 'Ngày thanh toán'
          break
        case 'receipt amount':
          title = 'Giá trị thanh toán'
          break
        case 'return method':
          title = 'Phương thức thanh toán'
          break
        case 'contractmoney':
          title = 'Giá trị hợp đồng'
          break
        // product
        case 'product name':
          title = 'Tên sản phẩm'
          break
        case 'product type':
          title = 'Danh mục'
          break
        case 'product unit':
          title = 'Đơn vị tính'
          break
        case 'product code':
          title = 'Mã sản phẩm'
          break
        case 'price':
          title = 'Đơn giá'
          break
        case 'product description':
          title = 'Mô tả'
          break
        // visit
        case 'visit_number':
          title = 'Mã số'
          break
        case 'revisit time':
          title = 'Thời gian gặp'
          break
        case 'return visitor':
          title = 'Khách gặp'
          break
        case 'return visit form':
          title = 'Nội dung trao đổi'
          break
        case 'contacts':
          title = 'Danh bạ'
          break
        case 'customer satisfaction':
          title = 'Độ hài lòng'
          break
        case 'customer feedback':
          title = 'Ý kiến khách hàng'
          break
      }
      // upper first char
      title = title.charAt(0).toUpperCase() + title.slice(1)
      return title
    },

    columnWidthFormatter(title, originWidth) {
      const tempTitle = this.columnHeaderFormatter(title)
      let minWidth = 100
      if (tempTitle.length * 10 > minWidth) {
        minWidth = tempTitle.length * 10
      }
      return minWidth
    },

    /** 格式化字段 */
    fieldFormatter(row, column) {
      // 如果需要格式化
      if (column.property == 'invoiceType') {
        return {
          1: 'Hóa đơn GTGT',
          2: 'Hóa đơn VAT',
          3: 'National tax general machine invoice',
          4: 'General machine invoice for land tax',
          5: 'Biên nhận'
        }[row[column.property]]
      }
      return row[column.property] === '' || row[column.property] === null ? '--' : row[column.property]
    },

    // 更改每页展示数量
    handleSizeChange(val) {
      this.pageSize = val
      this.getList()
    },

    // 更改当前页数
    handleCurrentChange(val) {
      this.currentPage = val
      this.getList()
    },

    // 0待审核、1审核中、2审核通过、3审核未通过
    getStatusStyle(status) {
      return {
        backgroundColor: this.getStatusColor(status)
      }
    },

    /**
     * 更新表高
     */
    updateTableHeight() {
      var offsetHei = document.documentElement.clientHeight
      var removeHeight = Object.keys(this.filterObj).length > 0 ? 360 : 300
      this.tableHeight = offsetHei - removeHeight
    }
  },

  beforeDestroy() {
    this.$bus.off('message-scroll')
    this.$bus.off('examine-handle-bus')

    if (document.getElementById('crm-table')) {
      document.getElementById('crm-table').removeEventListener('click', e => {
        e.stopPropagation()
      })
    }
  }
}
