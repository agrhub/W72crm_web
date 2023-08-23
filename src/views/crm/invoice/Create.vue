<template>
  <xr-create
    v-loading="loading"
    :title="title"
    :confirm-button-text="confirmButtonText"
    @close="close"
    @save="saveClick">
    <create-sections title="Thông tin cơ bản">
      <el-form
        ref="crmForm"
        :model="baseFrom"
        :rules="rules"
        label-position="top">
        <el-form-item
          v-for="(item, index) in baseFields"
          :key="item.key"
          :prop="item.field">
          <span slot="label">
            {{ item.name }}
            <span style="color:#999;">
              {{ item.tips || '' }}
            </span>
          </span>
          <component
            :is="item.formType | typeToComponent"
            :value="baseFrom[item.field]"
            :index="index"
            :item="item"
            :relation="item.relation"
            :relative-type="item.formType"
            :disabled="item.disabled"
            :clearable="false"
            @value-change="fieldValueChange"/>
        </el-form-item>
      </el-form>
    </create-sections>

    <create-sections title="Thông tin hóa đơn">
      <div style="padding: 10px 20px; text-align: right;">
        <el-popover
          v-model="showPopover"
          placement="top"
          width="700"
          style="padding: 0 !important;"
          trigger="click">
          <crm-relative
            v-if="showSelectView"
            ref="crmrelative"
            :show="showPopover"
            :action="titleAction"
            radio
            crm-type="invoiceTitle"
            @close="showPopover=false"
            @changeCheckout="titleSelectChange"/>
          <el-button
            slot="reference"
            :disabled="!baseFrom.customerId"
            type="primary"
            @click="showSelectView=true">Chọn thông tin hóa đơn</el-button>
        </el-popover>
      </div>
      <el-form
        ref="otherFrom"
        :model="otherFrom"
        :rules="otherRules"
        label-position="top">
        <el-form-item
          v-for="(item, index) in otherFields"
          v-show="!item.hidden"
          :key="item.key"
          :prop="item.field">
          <span slot="label">
            {{ item.name }}
            <span style="color:#999;">
              {{ item.tips || '' }}
            </span>
          </span>
          <component
            :is="item.formType | typeToComponent"
            :value="otherFrom[item.field]"
            :index="index"
            :item="item"
            :relative-type="item.formType"
            :disabled="item.disabled"
            :clearable="false"
            @value-change="otherFieldValueChange"/>
        </el-form-item>
      </el-form>
    </create-sections>

    <create-sections title="Thông tin gửi thư">
      <el-form
        ref="mailFrom"
        :model="mailFrom"
        :rules="mailRules"
        label-position="top">
        <el-form-item
          v-for="(item, index) in mailFields"
          :key="item.key"
          :prop="item.field">
          <span slot="label">
            {{ item.name }}
            <span style="color:#999;">
              {{ item.tips || '' }}
            </span>
          </span>
          <component
            :is="item.formType | typeToComponent"
            :value="mailFrom[item.field]"
            :index="index"
            :item="item"
            :relative-type="item.formType"
            :disabled="item.disabled"
            :clearable="false"
            @value-change="mailFieldValueChange"/>
        </el-form-item>
      </el-form>
    </create-sections>

    <create-sections
      v-if="isOpenExamine"
      title="Duyệt thông tin">
      <div
        v-if="examineInfo.examineType===1 || examineInfo.examineType===2"
        slot="header"
        class="examine-type">{{ examineInfo.examineType===1 ? ' Quy trình phê duyệt cố định': ' Người phê duyệt được ủy quyền' }}</div>
      <create-examine-info
        ref="examineInfo"
        :types-id="editId"
        types="crm_invoice"
        @value-change="examineValueChange" />
    </create-sections>
  </xr-create>
</template>

<script>
import { crmInvoiceSaveAPI, crmInvoiceUpdateAPI, crmInvoiceNumberConfigAPI } from '@/api/crm/invoice'
import { crmCustomerInvoiceInfoAPI } from '@/api/crm/customer'

import XrCreate from '@/components/XrCreate'
import CreateSections from '@/components/CreateSections'
import CreateExamineInfo from '@/components/Examine/CreateExamineInfo'

import {
  XhInput,
  XhTextarea,
  XhSelect,
  XhDate,
  CrmRelativeCell
} from '@/components/CreateCom'
import CrmRelative from '@/components/CreateCom/CrmRelative'

export default {
  // 订单创建
  name: 'InvoiceCreate',
  components: {
    XrCreate,
    CreateSections,
    CreateExamineInfo,
    XhInput,
    XhTextarea,
    XhSelect,
    XhDate,
    CrmRelativeCell,
    CrmRelative
  },
  filters: {
    /** 根据type 找到组件 */
    typeToComponent(formType) {
      if (formType == 'text' || formType == 'floatnumber') {
        return 'XhInput'
      } else if (formType == 'select') {
        return 'XhSelect'
      } else if (formType == 'contract' || formType == 'customer') {
        return 'CrmRelativeCell'
      } else if (formType == 'date') {
        return 'XhDate'
      } else if (formType == 'textarea') {
        return 'XhTextarea'
      }
    }
  },
  props: {
    detail: Object
  },
  data() {
    return {
      loading: false,
      baseFields: [],
      rules: {
        customerId: [
          { required: true, message: 'Vui lòng chọn tên khách hàng', trigger: 'change' }
        ],
        contractId: [
          { required: true, message: 'Vui lòng chọn số hợp đồng', trigger: 'change' }
        ],
        invoiceMoney: [
          { required: true, message: 'Vui lòng nhập số tiền đã lập hóa đơn', trigger: ['blur', 'change'] }
        ],
        invoiceType: [
          { required: true, message: 'Vui lòng chọn loại hóa đơn', trigger: 'change' }
        ]
      },
      baseFrom: {
      },
      showPopover: false,
      titleAction: {
        type: 'default'
      },
      showSelectView: false,
      // 发票信息
      otherFields: [],
      otherRules: {},
      otherFrom: {
        titleType: 1
      },

      // 邮寄信息
      mailFields: [],
      mailRules: {},
      mailFrom: {},
      // 审批信息
      examineInfo: {}
    }
  },
  computed: {
    editId() {
      if (this.detail) {
        return this.detail.invoiceId
      }
      return ''
    },

    title() {
      return this.isEdit ? 'Chỉnh sửa hóa đơn' : 'Hóa đơn mới'
    },

    isEdit() {
      return !!this.editId
    },

    isOpenExamine() {
      if (this.examineInfo) {
        // 初始状态是空对象默认展示，请求之后，根据status判断
        return Object.keys(this.examineInfo).length > 0 ? this.examineInfo.status == 1 : true
      }
      return false
    },

    confirmButtonText() {
      if (this.isOpenExamine) {
        return 'Gửi đánh giá'
      }
      return 'Lưu'
    }
  },
  watch: {},
  created() {
    this.getInvoiceNumberConfig()

    // 是编辑
    if (this.detail) {
      const baseFrom = {}
      baseFrom.invoiceApplyNumber = this.detail.invoiceApplyNumber
      baseFrom.customerId = this.detail.customerId ? [{
        customerName: this.detail.customerName,
        customerId: this.detail.customerId
      }] : []

      if (this.detail.customerId) {
        this.titleAction = {
          type: 'default',
          request: crmCustomerInvoiceInfoAPI,
          showScene: false,
          showSearch: false,
          showCreate: false,
          canShowDetail: true,
          params: {
            customerId: this.detail.customerId
          }
        }
      }

      baseFrom.contractId = this.detail.contractId ? [{
        num: this.detail.contractNum,
        contractId: this.detail.contractId
      }] : []

      baseFrom.contractMoney = this.detail.contractMoney
      baseFrom.invoiceMoney = this.detail.invoiceMoney
      baseFrom.invoiceDate = this.detail.invoiceDate
      baseFrom.invoiceType = this.detail.invoiceType
      baseFrom.remark = this.detail.remark
      this.baseFrom = baseFrom

      const otherFrom = {}
      otherFrom.titleType = this.detail.titleType
      otherFrom.invoiceTitle = this.detail.invoiceTitle
      otherFrom.taxNumber = this.detail.taxNumber
      otherFrom.depositBank = this.detail.depositBank
      otherFrom.depositAccount = this.detail.depositAccount
      otherFrom.depositAddress = this.detail.depositAddress
      otherFrom.telephone = this.detail.telephone
      this.otherFrom = otherFrom

      const mailFrom = {}
      mailFrom.contactsName = this.detail.contactsName
      mailFrom.contactsMobile = this.detail.contactsMobile
      mailFrom.contactsAddress = this.detail.contactsAddress
      this.mailFrom = mailFrom
    }
  },
  mounted() {},

  beforeDestroy() {},
  methods: {

    getInvoiceNumberConfig() {
      crmInvoiceNumberConfigAPI().then(res => {
        this.getField(res.data.status)
      }).catch(() => {})
    },

    getField(status) {
      if (status != 1) {
        this.$set(this.rules, 'invoiceApplyNumber', [
          { required: true, message: 'Vui lòng nhập số yêu cầu hóa đơn', trigger: ['blur', 'change'] }
        ])
      }
      this.baseFields = [
        {
          name: 'Số đơn đăng ký hóa đơn',
          field: 'invoiceApplyNumber',
          formType: 'text',
          autoGeneNumber: status,
          setting: []
        },
        {
          name: 'Tên khách hàng',
          field: 'customerId',
          formType: 'customer',
          setting: []
        },
        {
          name: 'Mã hợp đồng',
          field: 'contractId',
          formType: 'contract',
          disabled: !(this.detail && this.detail.customerId),
          relation: this.detail && this.detail.customerId ? {
            moduleType: 'customer',
            params: { checkStatus: 1 },
            customerName: this.detail.customerName,
            customerId: this.detail.customerId
          } : null,
          setting: []
        },
        {
          name: 'Giá trị hợp đồng',
          field: 'contractMoney',
          formType: 'text',
          disabled: true,
          setting: []
        },
        {
          name: 'Số tiền hóa đơn （đồng）',
          field: 'invoiceMoney',
          formType: 'floatnumber',
          setting: []
        },
        {
          name: 'Ngày thanh toán',
          field: 'invoiceDate',
          formType: 'date',
          setting: []
        },
        {
          name: 'Loại hóa đơn',
          field: 'invoiceType',
          formType: 'select',
          setting: [{
            name: 'Hóa đơn thuế giá trị gia tăng',
            value: 1
          }, {
            name: 'Hóa đơn VAT',
            value: 2
          }, {
            name: 'National tax general machine invoice',
            value: 3
          }, {
            name: 'General machine invoice for land tax',
            value: 4
          }, {
            name: 'Biên nhận',
            value: 5
          }]
        },
        {
          name: 'Ghi chú',
          field: 'remark',
          formType: 'textarea',
          setting: []
        }]


      this.otherFields = [
        {
          name: 'Loại tiêu đề',
          field: 'titleType',
          formType: 'select',
          setting: [{
            name: 'Tổ chức',
            value: 1
          }, {
            name: 'Cá nhân',
            value: 2
          }]
        }, {
          name: 'Hóa đơn',
          field: 'invoiceTitle',
          formType: 'text',
          setting: []
        },
        {
          name: 'Mã số thuế',
          field: 'taxNumber',
          formType: 'text',
          hidden: false,
          setting: []
        },
        {
          name: 'Ngân hàng',
          field: 'depositBank',
          formType: 'text',
          hidden: false,
          setting: []
        }, {
          name: 'Số tài khoản',
          field: 'depositAccount',
          formType: 'text',
          hidden: false,
          setting: []
        }, {
          name: 'Địa chỉ ngân hàng',
          field: 'depositAddress',
          formType: 'text',
          hidden: false,
          setting: []
        }, {
          name: 'Số điện thoại',
          field: 'telephone',
          formType: 'text',
          setting: []
        }]

      this.mailFields = [{
        name: 'Người liên hệ',
        field: 'contactsName',
        formType: 'text',
        setting: []
      },
      {
        name: 'Số điện thoại',
        field: 'contactsMobile',
        formType: 'text',
        setting: []
      },
      {
        name: 'Địa chỉ',
        field: 'contactsAddress',
        formType: 'text',
        setting: []
      }]
    },

    titleSelectChange(data) {
      const dataValue = data.data
      if (dataValue && dataValue.length) {
        const titleData = dataValue[0]
        for (let index = 0; index < this.otherFields.length; index++) {
          const element = this.otherFields[index]
          this.$set(this.otherFrom, element.field, titleData[element.field])
        }

        const hidden = titleData.titleType == 2
        this.otherFields[2].hidden = hidden
        this.otherFields[3].hidden = hidden
        this.otherFields[4].hidden = hidden
        this.otherFields[5].hidden = hidden
      }
    },

    fieldValueChange(data) {
      const item = this.baseFields[data.index]
      const dataValue = data.value
      this.$set(this.baseFrom, item.field, dataValue)

      if (item.formType == 'customer') {
        const contractItem = this.baseFields[data.index + 1]
        if (dataValue.length) {
          contractItem.disabled = false
          const customerItem = dataValue[0]
          customerItem['moduleType'] = 'customer'
          customerItem['params'] = { checkStatus: 1 }
          contractItem['relation'] = customerItem

          this.$set(this.mailFrom, 'contactsName', customerItem.contactsName)
          this.$set(this.mailFrom, 'contactsMobile', customerItem.contactsMobile)
          this.$set(this.mailFrom, 'contactsAddress', customerItem.contactsAddress)

          this.titleAction = {
            type: 'default',
            request: crmCustomerInvoiceInfoAPI,
            showScene: false,
            showSearch: false,
            showCreate: false,
            canShowDetail: true,
            params: {
              customerId: customerItem.customerId
            }
          }
        } else {
          contractItem.disabled = true
          contractItem['relation'] = {}
        }

        this.$set(this.baseFrom, 'contractId', [])
        this.$set(this.baseFrom, 'invoiceMoney', '')
        this.$set(this.baseFrom, 'contractMoney', '')
        this.$refs.crmForm.validateField(item.field)
      } else if (item.formType == 'contract') {
        const contractValue = dataValue && dataValue.length ? dataValue[0] : null
        this.$set(this.baseFrom, 'contractMoney', contractValue ? contractValue.money : '')
        this.$set(this.baseFrom, 'invoiceMoney', contractValue ? contractValue.money : '')
        this.$refs.crmForm.validateField(item.field)
      }
    },

    otherFieldValueChange(data) {
      const item = this.otherFields[data.index]
      const dataValue = data.value
      if (item.field == 'titleType') {
        const hidden = dataValue == 2
        this.otherFields[2].hidden = hidden
        this.otherFields[3].hidden = hidden
        this.otherFields[4].hidden = hidden
        this.otherFields[5].hidden = hidden
      }
      this.$set(this.otherFrom, item.field, dataValue)
    },

    mailFieldValueChange(data) {
      const item = this.mailFields[data.index]
      const dataValue = data.value
      this.$set(this.mailFrom, item.field, dataValue)
    },

    // 审批信息值更新
    examineValueChange(data) {
      this.examineInfo = data
    },

    close() {
      this.$emit('close')
    },

    saveClick() {
      this.$refs.crmForm.validate(valid => {
        if (valid) {
          const params = {}
          for (let index = 0; index < this.baseFields.length; index++) {
            const element = this.baseFields[index]
            if (!element.disabled) {
              if (element.formType == 'customer') {
                const customerValue = this.baseFrom.customerId && this.baseFrom.customerId.length ? this.baseFrom.customerId[0] : null
                params[element.field] = customerValue ? customerValue.customerId : ''
              } else if (element.formType == 'contract') {
                const contractValue = this.baseFrom.contractId && this.baseFrom.contractId.length ? this.baseFrom.contractId[0] : null
                params[element.field] = contractValue ? contractValue.contractId : ''
              } else {
                params[element.field] = this.baseFrom[element.field]
              }
            }
          }

          for (let index = 0; index < this.otherFields.length; index++) {
            const element = this.otherFields[index]
            if (!element.disabled) {
              params[element.field] = this.otherFrom[element.field]
            }
          }

          for (let index = 0; index < this.mailFields.length; index++) {
            const element = this.mailFields[index]
            if (!element.disabled) {
              params[element.field] = this.mailFrom[element.field]
            }
          }

          if (this.isEdit) {
            params.invoiceId = this.detail.invoiceId
            params.batchId = this.detail.batchId
          }

          this.getExamineValidateResult((result) => {
            if (result) {
              if (this.examineInfo.examineType === 2) {
                params['checkUserId'] = this.examineInfo.value[0].userId
              }

              console.log(params)
              const request = this.isEdit ? crmInvoiceUpdateAPI : crmInvoiceSaveAPI
              this.loading = true
              request(params)
                .then(res => {
                  this.loading = false
                  this.close()
                  // 回到保存成功
                  this.$emit('save-success')
                })
                .catch(() => {
                  this.loading = false
                })
            }
          })
        }
      })
    },

    /**
     * 获取审批验证结果
     */
    getExamineValidateResult(callBack) {
      if (this.isOpenExamine) {
        this.$refs.examineInfo.validateField((result) => {
          callBack(result)
        })
      } else {
        callBack(true)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -23px;
  /deep/ .el-form-item.is-required .el-form-item__label:before {
    margin-right: 0;
  }
}

.el-form-item {
  flex: 0 0 50%;
  flex-shrink: 0;
  padding: 0 40px;
  padding-bottom: 10px;
  margin-bottom: 4px;
  /deep/ .el-form-item__label {
    color: #333333;
    padding: 5px 0;
    line-height: inherit;
  }

  /deep/ .el-form-item__error {
    padding-top: 2px;
  }
}

.xh-product {
  padding: 0 15px;
}

// 审核信息 里的审核类型
.examine-type {
  font-size: 12px;
  color: white;
  background-color: #fd715a;
  padding: 0 8px;
  margin-left: 5px;
  height: 16px;
  line-height: 16px;
  border-radius: 8px;
  transform: scale(0.8, 0.8);
}
</style>
