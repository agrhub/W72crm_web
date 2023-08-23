<template>
  <el-dialog
    v-loading="loading"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :title="title"
    width="400px"
    @close="handleCancel">
    <el-form ref="form" label-width="80px">
      <el-form-item label="Tên mẫu">
        <el-input v-model="dataForm.templateName"/>
      </el-form-item>
      <el-form-item v-if="!isEdit" label="Liên kết">
        <el-select v-model="dataForm.type" style="width: 100%;">
          <el-option
            v-for="(item, index) in options"
            :key="index"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </el-form-item>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button @click.native="handleCancel">Hủy</el-button>
      <el-button
        v-debounce="handleConfirm"
        type="primary">{{ confirmText }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { printAddTemplateAPI, printUpdateTemplateAPI } from '@/api/admin/crm'

export default {
  // 自定义模板新建
  name: 'TemplateTypeAdd',
  components: {},
  mixins: [],
  props: {
    detail: Object, // 编辑用
    visible: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data() {
    return {
      loading: true,
      dataForm: {},
      options: [
        {
          label: 'Cơ hội kinh doanh',
          value: 5
        },
        {
          label: 'Hợp đồng',
          value: 6
        },
        {
          label: 'Thanh toán',
          value: 7
        }
      ]
    }
  },
  computed: {
    isEdit() {
      return !!this.detail
    },

    title() {
      return this.isEdit ? 'Chỉnh sửa mẫu in' : 'Mẫu in mới'
    },

    confirmText() {
      return this.isEdit ? 'Lưu' : 'Tiếp tục'
    }
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.dataForm = {
            templateName: '',
            type: 5
          }

          if (this.isEdit) {
            this.dataForm.templateName = this.detail.templateName
          }
        }
      },
      immediate: true
    }
  },
  mounted() {},
  methods: {
    /**
     * 取消选择
     */
    handleCancel() {
      this.$emit('update:visible', false)
    },

    /**
     * 点击确定
     */
    handleConfirm() {
      if (!this.dataForm.templateName) {
        return
      }

      if (this.isEdit) {
        this.loading = true
        const request = this.isEdit ? printUpdateTemplateAPI : printAddTemplateAPI
        const params = this.isEdit ? {
          templateName: this.dataForm.templateName,
          templateId: this.detail.templateId
        } : this.dataForm
        request(params)
          .then(res => {
            this.$message({
              type: 'success',
              message: 'Thành công'
            })
            this.loading = false
            this.handleCancel()
            this.$emit('save')
          })
          .catch(() => {
            this.loading = false
          })
      } else {
        this.$emit('next', this.dataForm)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
