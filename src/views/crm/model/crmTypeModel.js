export default {
  leads: 1,
  customer: 2,
  contacts: 3,
  product: 4,
  business: 5,
  contract: 6,
  receivables: 7,
  receivables_plan: 8,
  pool: 9,
  visit: 17,
  invoice: 18,

  keyToTypeData: {
    leads: 1,
    customer: 2,
    contacts: 3,
    product: 4,
    business: 5,
    contract: 6,
    receivables: 7,
    receivables_plan: 8,
    pool: 9,
    visit: 17,
    invoice: 18
  },

  typeToKeyData: {
    1: 'leads',
    2: 'customer',
    3: 'contacts',
    4: 'product',
    5: 'business',
    6: 'contract',
    7: 'receivables',
    8: 'receivables_plan',
    9: 'pool',
    17: 'visit',
    18: 'invoice'
  },

  typeToNameData: {
    1: 'Khách hàng tiềm năng',
    2: 'Khách hàng',
    3: 'Danh bạ',
    4: 'Sản phẩm',
    5: 'Cơ hội',
    6: 'Hợp đồng',
    7: 'Thanh toán',
    8: 'Kế hoạch thanh toán',
    9: 'Hồ chứa',
    17: 'Lịch hẹn',
    18: 'Hóa đơn'
  },

  keyToNameData: {
    leads: 'Khách hàng tiềm năng',
    customer: 'Khách hàng',
    contacts: 'Danh bạ',
    product: 'Sản phẩm',
    business: 'Cơ hội',
    contract: 'Hợp đồng',
    receivables: 'Thanh toán',
    receivables_plan: 'Kế hoạch thanh toán',
    pool: 'Hồ chứa',
    visit: 'Lịch hẹn',
    invoice: 'Hóa đơn'
  },
  labelToType: {
    1: 'crmLeads',
    2: 'crmCustomer',
    3: 'crmContacts',
    4: 'crmProduct',
    5: 'crmBusiness',
    6: 'crmContract',
    7: 'crmReceivables',
    8: 'crmReceivablesPlan',
    9: 'crmPool',
    17: 'crmReturnVisit',
    18: 'crmInvoice'
  },

  convertKeyToType: function(key) {
    return this.keyToTypeData[key]
  },

  convertTypeToKey: function(type) {
    return this.typeToKeyData[type]
  },

  convertTypeToName: function(type) {
    if (typeof type === 'string') {
      type = parseInt(type)
    }
    return this.typeToNameData[type]
  },

  convertKeyToName: function(key) {
    return this.keyToNameData[key]
  }
}
