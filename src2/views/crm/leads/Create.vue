<template>
  <xr-create
    :loading="loading"
    :title="title"
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
      />
    </create-sections>
  </xr-create>
</template>

<script>
import { filedGetFieldAPI } from '@/api/crm/common'
import { crmLeadsSaveAPI } from '@/api/crm/leads'

import XrCreate from '@/components/XrCreate'
import CreateSections from '@/components/CreateSections'
import WkForm from '@/components/NewCom/WkForm'

import crmTypeModel from '@/views/crm/model/crmTypeModel'
import CustomFieldsMixin from '@/mixins/CustomFields'
import { isEmpty } from '@/utils/types'

export default {
  // 新建编辑
  name: 'LeadsCreate',

  components: {
    XrCreate,
    CreateSections,
    WkForm
  },

  mixins: [CustomFieldsMixin],

  props: {
    phone: String,
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
      fieldRules: {}
    }
  },

  computed: {
    title() {
      return this.action.type === 'update' ? 'Chỉnh sửa khách hàng tiềm năng' : 'Khách hàng tiềm năng mới'
    }
  },

  watch: {},

  created() {
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
        label: crmTypeModel.leads
      }

      if (this.action.type == 'update') {
        params.id = this.action.id
      }

      filedGetFieldAPI(params)
        .then(res => {
          const list = res.data || []
          if (!isEmpty(this.phone)) {
            list.forEach(item => {
              if (item.formType === 'mobile') {
                item.defaultValue = this.phone
              }
            })
          }

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
              fieldRules[temp.field] = this.getRules(item)
            }

            // 是否可编辑
            temp.disabled = !canEdit

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
    saveClick() {
      this.loading = true
      const crmForm = this.$refs.crmForm.instance
      crmForm.validate(valid => {
        if (valid) {
          const params = this.getSubmiteParams(this.baseFields, this.fieldForm)
          this.submiteParams(params)
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
        params.entity.leadsId = this.action.id
        params.entity.batchId = this.action.batchId
      }

      // 相关添加时候的多余提交信息
      if (
        this.action.relativeData &&
        Object.keys(this.action.relativeData).length
      ) {
        params = { ...params, ...this.action.relativeData }
      }
      crmLeadsSaveAPI(params)
        .then(res => {
          this.loading = false
          this.$message.success(
            this.action.type == 'update' ? 'Chỉnh sửa thành công' : 'Thêm thành công'
          )

          this.close()

          // 保存成功
          this.$emit('save-success', {
            type: 'leads'
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
    formChange(item, index, value, valueList) {},

    /**
     * 地址change
     */
    otherChange(data, field) {
      this.$set(this.fieldForm, field.field, data.value)
      this.$refs.crmForm.instance.validateField(field.field)
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
</style>
