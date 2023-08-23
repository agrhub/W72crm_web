export const invoiceHeaderFields = [{
  label: 'Số đơn đăng ký hóa đơn',
  width: '120px',
  prop: 'invoiceApplyNumber'
}, {
  label: 'Tên khách hàng',
  width: '120px',
  prop: 'customerName'
}, {
  label: 'Số hợp đồng',
  width: '120px',
  prop: 'contractNum'
}, {
  label: 'Số tiền hợp đồng',
  width: '90px',
  prop: 'contractMoney'
}, {
  label: 'Số tiền hóa đơn （đồng）',
  width: '120px',
  prop: 'invoiceMoney'
}, {
  label: 'Ngày thanh toán',
  width: '120px',
  prop: 'invoiceDate'
}, {
  label: 'Ngày thanh toán thực tế',
  width: '120px',
  prop: 'realInvoiceDate'
}, {
  label: 'Loại hóa đơn',
  width: '120px',
  prop: 'invoiceType'
}, {
  label: 'Số hóa đơn',
  width: '90px',
  prop: 'invoiceNumber'
}, {
  label: 'Số lô hàng',
  width: '90px',
  prop: 'logisticsNumber'
}, {
  label: 'Người tạo',
  width: '90px',
  prop: 'ownerUserName'
}, {
  label: 'Trạng thái',
  width: '90px',
  prop: 'checkStatus'
}]

// 筛选字段
export const invoiceFilterFields = [{
  formType: 'text',
  fieldName: 'invoiceNumber',
  name: 'Số hóa đơn'
}, {
  formType: 'date',
  fieldName: 'realInvoiceDate',
  name: 'Ngày thanh toán thực tế'
}, {
  formType: 'text',
  fieldName: 'customerName',
  name: 'Tên khách hàng'
}, {
  formType: 'text',
  fieldName: 'logisticsNumber',
  name: 'Số lô hàng'
}, {
  formType: 'checkStatus',
  fieldName: 'invoiceStatus',
  name: 'Tình trạng lập hóa đơn',
  setting: [{
    name: 'Không lập hóa đơn',
    value: 0
  }, {
    name: 'Đã lập hóa đơn',
    value: 1
  }]
}, {
  formType: 'checkStatus',
  fieldName: 'checkStatus',
  name: 'Trạng thái',
  setting: [
    {
      name: 'Đang chờ xử lý',
      value: 0
    }, {
      name: 'Duyệt',
      value: 1
    }, {
      name: 'Từ chối',
      value: 2
    }, {
      name: 'Đang xem xét',
      value: 3
    }, {
      name: 'Trả lại',
      value: 4
    }
  ]
}, {
  formType: 'user',
  fieldName: 'ownerUserId',
  name: 'Người tạo'
}]
