<template>
  <xr-create
    :loading="loading"
    :title="title"
    :confirm-button-text="sureBtnTitle"
    @close="close"
    @save="saveClick">
    <create-sections title="Thông tin cơ bản">
      <wk-form
        ref="crmForm"
        :model="fieldForm"
        :rules="fieldRules"
        :field-from="fieldForm"
        :field-list="fieldList"
        label-position="top"
        @change="formChange"
      >
        <template slot-scope="{ data }">
          <crm-relative-cell
            v-if="data && data.formType == 'customer'"
            :value="fieldForm[data.field]"
            :disabled="data.disabled"
            relative-type="customer"
            @value-change="otherChange($event, data)"
          />
          <crm-relative-cell
            v-if="data && data.formType == 'contract'"
            :value="fieldForm[data.field]"
            :disabled="data.disabled"
            :relation="data.relation"
            :relative-type="data.formType"
            @value-change="otherChange($event, data)"
          />
          <xh-receivables-plan
            v-if="data && data.formType == 'receivables_plan'"
            :value="fieldForm[data.field]"
            :receivables-id="editId"
            :relation="data.relation"
            @value-change="otherChange($event, data)"
          />
        </template>
      </wk-form>
    </create-sections>
    <create-sections
      v-if="isOpenExamine"
      title="Duyệt thông tin">
      <template slot="header">
        <div
          v-if="examineInfo.examineType===1 || examineInfo.examineType===2"
          class="examine-type">{{ examineInfo.examineType===1 ? ' Quy trình phê duyệt cố định' : ' Người phê duyệt được ủy quyền' }}</div>
        <el-tooltip
          v-if="examineInfo && examineInfo.remarks"
          :content="examineInfo.remarks"
          effect="dark"
          placement="top">
          <i class="wk wk-help wk-help-tips" style="height: 13px;"/>
        </el-tooltip>
      </template>
      <create-examine-info
        ref="examineInfo"
        :types-id="action.id"
        types="crm_receivables"
        @value-change="examineValueChange" />
    </create-sections>

    <el-button
      slot="footer"
      type="primary"
      plain
      @click.native="debouncedSaveField(true)">Lưu nháp</el-button>
  </xr-create>
</template>

<script>
import { filedGetFieldAPI } from '@/api/crm/common'
import { crmReceivablesSaveAPI } from '@/api/crm/receivables'

import XrCreate from '@/components/XrCreate'
import CreateSections from '@/components/CreateSections'
import WkForm from '@/components/NewCom/WkForm'
import {
  XhReceivablesPlan,
  CrmRelativeCell
} from '@/components/CreateCom'
import CreateExamineInfo from '@/components/Examine/CreateExamineInfo'

import crmTypeModel from '@/views/crm/model/crmTypeModel'
import CustomFieldsMixin from '@/mixins/CustomFields'
import { debounce } from 'throttle-debounce'
import { objDeepCopy } from '@/utils'
// import { isEmpty } from '@/utils/types'

export default {
  // 新建编辑
  name: 'ReceivablesCreate',

  components: {
    XrCreate,
    CreateSections,
    CrmRelativeCell,
    XhReceivablesPlan,
    CreateExamineInfo,
    WkForm
  },

  mixins: [CustomFieldsMixin],

  props: {
    action: {
      type: Object,
      default: () => {
        return {
          type: 'save',
          id: '',
          data: {}
        }
      }
    }
  },

  data() {
    return {
      loading: false,
      baseFields: [],
      fieldList: [],
      fieldForm: {},
      fieldRules: {},

      // 审批信息
      examineInfo: {}
    }
  },

  computed: {
    title() {
      return this.action.type === 'update' ? 'Chỉnh sửa thanh toán' : 'Thanh toán mới'
    },

    editId() {
      return this.action.type == 'update' ? this.action.id : ''
    },

    // 合同 回款 下展示审批人信息
    isOpenExamine() {
      if (this.examineInfo) {
        // 初始状态是空对象默认展示，请求之后，根据status判断
        return Object.keys(this.examineInfo).length > 0 ? this.examineInfo.status == 1 : true
      }
      return false
    },

    // 确认名称
    sureBtnTitle() {
      if (this.isOpenExamine) {
        return 'Gửi đánh giá'
      }
      return 'Lưu'
    }
  },

  watch: {},

  created() {
    this.debouncedSaveField = debounce(300, this.saveClick)

    this.getField()
  },

  mounted() {},

  beforeDestroy() {},

  methods: {
    /**
     * 获取数据
     */
    getField() {
      this.loading = true
      const params = {
        label: crmTypeModel.receivables
      }

      if (this.action.type == 'update') {
        params.id = this.action.id
      }

      filedGetFieldAPI(params)
        .then(res => {
          const list = res.data || []

          const fieldList = []
          const fieldRules = {}
          const fieldForm = {}
          list.forEach(item => {
            const temp = {}
            temp.field = item.fieldName
            temp.formType = item.formType
            temp.fieldId = item.fieldId
            temp.inputTips = item.inputTips
            temp.name = item.name
            temp.setting = item.setting

            const canEdit = this.getItemIsCanEdit(item, this.action.type)
            // 是否能编辑权限
            if (canEdit) {
              // 自动生成编号
              if (item.autoGeneNumber == 1) {
                temp.placeholder = 'Được tạo tự động theo quy tắc đánh số, hỗ trợ nhập thủ công'
                const copyItem = objDeepCopy(item)
                copyItem.isNull = 0
                fieldRules[temp.field] = this.getRules(copyItem)
              } else {
                fieldRules[temp.field] = this.getRules(item)
              }
            }

            // 是否可编辑
            temp.disabled = !canEdit

            // 禁止某些业务组件选择
            if (temp.formType == 'receivables_plan' ||
                temp.formType == 'contract' ||
                temp.formType == 'customer') {
              if (this.action.type == 'relative') {
                const relativeDisInfos = {
                  contacts: { customer: true },
                  customer: { customer: true },
                  business: { customer: true },
                  contract: { customer: true, contract: true }
                }

                // 在哪个类型下添加
                const relativeTypeDisInfos = relativeDisInfos[this.action.crmType]
                if (relativeTypeDisInfos) {
                  // 包含的字段值
                  temp.disabled = relativeTypeDisInfos[item.formType] || false
                }
              } else if (this.action.type != 'update') {
                temp.disabled = item.formType === 'contract' || item.formType === 'receivables_plan'
              }
            }

            // 处理关联
            if (this.action.type == 'relative' || this.action.type == 'update') {
              // 回款计划 需要合同信息
              if (item.formType === 'receivables_plan') {
                const contractItem = this.getItemRelatveInfo(list, 'contract')
                if (contractItem) {
                  contractItem['moduleType'] = 'contract'
                  temp['relation'] = contractItem
                }
                // 合同 需要客户信息
              } else if (item.formType == 'contract') {
                const customerItem = this.getItemRelatveInfo(list, 'customer')
                if (customerItem) {
                  customerItem['moduleType'] = 'customer'
                  customerItem['params'] = { checkStatus: 1 }
                  temp['relation'] = customerItem
                }
              }
            }

            // 特殊字段允许多选
            this.getItemRadio(item, temp)

            // 获取默认值
            fieldForm[temp.field] = this.getItemValue(item, this.action.data, this.action.type)
            fieldList.push(temp)
          })

          this.baseFields = list
          this.fieldList = fieldList
          this.fieldForm = fieldForm
          this.fieldRules = fieldRules


          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 保存
     */
    saveClick(isDraft = false) {
      this.loading = true
      const crmForm = this.$refs.crmForm.instance
      crmForm.validate(valid => {
        if (valid) {
          if (this.isOpenExamine) {
            /** 验证审批数据 */
            if (isDraft) {
              // 不验证数据
              const params = this.getSubmiteParams(this.baseFields, this.fieldForm)
              if (
                this.examineInfo.examineType === 2 &&
                this.examineInfo.hasOwnProperty('value') &&
                this.examineInfo.value.length
              ) {
                params['checkUserId'] = this.examineInfo.value[0].userId
              }
              params.entity.checkStatus = 5
              this.submiteParams(params)
            } else {
              this.$refs.examineInfo.validateField((result) => {
                if (result) {
                  const params = this.getSubmiteParams(this.baseFields, this.fieldForm)
                  if (this.examineInfo.examineType === 2) {
                    params['checkUserId'] = this.examineInfo.value[0].userId
                  }
                  this.submiteParams(params)
                } else {
                  this.loading = false
                }
              })
            }
          } else {
            const params = this.getSubmiteParams(this.baseFields, this.fieldForm)
            if (isDraft) {
              params.entity.checkStatus = 5
            }
            this.submiteParams(params)
          }
        } else {
          this.loading = false
          // 提示第一个error
          this.getFormErrorMessage(crmForm)
          return false
        }
      })
    },

    /**
     * 提交上传
     */
    submiteParams(params) {
      if (this.action.type == 'update') {
        params.entity.receivablesId = this.action.id
        params.entity.batchId = this.action.batchId
      }

      // 相关添加时候的多余提交信息
      if (
        this.action.relativeData &&
        Object.keys(this.action.relativeData).length
      ) {
        params = { ...params, ...this.action.relativeData }
      }

      crmReceivablesSaveAPI(params)
        .then(res => {
          this.loading = false

          this.$message.success(
            this.action.type == 'update' ? 'Chỉnh sửa thành công' : 'Thêm thành công'
          )

          this.close()

          // 保存成功
          this.$emit('save-success', {
            type: 'receivables'
          })
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 验证唯一
     */
    UniquePromise({ field, value }) {
      return this.getUniquePromise(field, value, this.action)
    },

    /**
     * change
     */
    formChange(field, index, value, valueList) {
    },

    /**
     * 地址change
     */
    otherChange(data, field) {
      if (field.formType === 'customer') {
        this.fieldList.forEach(fieldItem => {
          if (fieldItem.formType === 'contract') {
            // 如果是合同 改变合同样式和传入客户ID
            if (data.value.length > 0) {
              fieldItem.disabled = false
              const customerItem = data.value[0]
              customerItem['moduleType'] = 'customer'
              customerItem['params'] = { checkStatus: 1 }
              fieldItem['relation'] = customerItem
            } else {
              fieldItem.disabled = true
              fieldItem['relation'] = {}
            }
            this.fieldForm[fieldItem.field] = []
          } else if (fieldItem.formType === 'receivables_plan') {
            fieldItem.disabled = true
            fieldItem['relation'] = {}
            this.fieldForm[fieldItem.field] = ''
          }
        })
      } else if (field.formType === 'contract') {
        const planItem = this.fieldList.find(item => item.formType === 'receivables_plan')
        if (planItem) {
          if (data.value.length > 0) {
            planItem.disabled = false
            var contractItem = data.value[0]
            contractItem['moduleType'] = 'contract'
            planItem['relation'] = contractItem
          } else {
            planItem.disabled = true
            planItem['relation'] = {}
          }
          this.fieldForm[planItem.field] = ''
        }
      } else if (field.formType === 'receivables_plan') {
        const dataValue = data.data || {}
        this.fieldForm.returnTime = dataValue.returnDate
        this.fieldForm.money = dataValue.money
        this.fieldForm.returnType = dataValue.returnType
      }
      this.$set(this.fieldForm, field.field, data.value)
      this.$refs.crmForm.instance.validateField(field.field)
    },

    /**
     * 审批信息值更新
     */
    examineValueChange(data) {
      this.examineInfo = data
    },

    /**
     * 关闭
     */
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.wk-form {
  /deep/ .el-form-item.is-product {
    flex: 0 0 100%;
  }
}
</style>
