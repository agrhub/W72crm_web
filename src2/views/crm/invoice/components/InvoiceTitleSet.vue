<template>
  <el-dialog
    v-loading="loading"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :title="title"
    width="500px"
    class="invoice-title-set"
    @close="handleCancel">
    <div
      :style="{ height: contentHeight }"
      class="handle-box">
      <el-form ref="form" :model="form" label-width="100px">
        <template v-for="(item, index) in fieldList">
          <el-form-item v-if="item.field == 'titleType'" :key="index" :label="item.name" :prop="item.field">
            <el-select
              v-model="form[item.field]"
              :clearable="false"
              style="width: 100%;"
              @change="valueChange">
              <el-option
                v-for="(subItem, subIndex) in item.setting"
                :key="subIndex"
                :label="subItem.name"
                :value="subItem.value"/>
            </el-select>
          </el-form-item>
          <el-form-item v-else v-show="!item.hidden" :key="index" :label="item.name" :prop="item.field">
            <el-input v-model="form[item.field]"/>
          </el-form-item>
        </template>
      </el-form>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button @click.native="handleCancel">Hủy</el-button>
      <el-button
        v-debounce="handleConfirm"
        type="primary">Lưu</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { crmInvoiceSaveInvoiceInfoAPI, crmInvoiceUpdateInvoiceInfoAPI } from '@/api/crm/invoice'


export default {
  name: 'InvoiceTitleSet', // 标记为开票
  components: {
  },
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    customerId: [String, Number],
    detail: Object
  },
  data() {
    return {
      loading: true,
      form: {
        titleType: 1
      },
      fieldList: []
    }
  },
  computed: {
    title() {
      return this.detail ? 'Chỉnh sửa tiêu đề hóa đơn' : 'Tiêu đề hóa đơn mới'
    },

    contentHeight() {
      return this.form.titleType == 2 ? '190px' : '300px'
    }
  },
  watch: {
    visible() {
      if (this.visible) {
        if (this.detail) {
          this.form = {
            ...this.detail
          }
        }
        this.getFieldList()
      }
    }
  },
  mounted() {},
  methods: {
    getFieldList() {
      const hidden = this.detail && this.detail.titleType == 2
      this.fieldList = [{
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
        hidden: hidden,
        setting: []
      },
      {
        name: 'Ngân hàng',
        field: 'depositBank',
        formType: 'text',
        hidden: hidden,
        setting: []
      }, {
        name: 'Số tài khoản',
        field: 'depositAccount',
        formType: 'text',
        hidden: hidden,
        setting: []
      }, {
        name: 'Địa chỉ ngân hàng',
        field: 'depositAddress',
        formType: 'text',
        hidden: hidden,
        setting: []
      }, {
        name: 'Số điện thoại',
        field: 'telephone',
        formType: 'text',
        setting: []
      }]
    },

    /**
     * 取消选择
     */
    handleCancel() {
      // 重置状态
      this.form = {
        titleType: 1
      }
      this.$emit('update:visible', false)
    },

    valueChange() {
      const hidden = this.form.titleType == 2
      this.fieldList[2].hidden = hidden
      this.fieldList[3].hidden = hidden
      this.fieldList[4].hidden = hidden
      this.fieldList[5].hidden = hidden
    },

    /**
     * 点击确定
     */
    handleConfirm() {
      var params = {
        customerId: this.customerId
      }

      if (this.form.titleType == 2) {
        params.titleType = this.form.titleType
        params.invoiceTitle = this.form.invoiceTitle
        params.telephone = this.form.telephone
      } else {
        params = {
          ...params,
          ...this.form
        }
      }

      if (this.detail) {
        params.infoId = this.detail.infoId
      }

      this.loading = true
      const request = this.detail ? crmInvoiceUpdateInvoiceInfoAPI : crmInvoiceSaveInvoiceInfoAPI
      request(params)
        .then(res => {
          this.$message({
            type: 'success',
            message: 'Thành công'
          })
          this.loading = false
          this.handleCancel()
          this.$emit('change')
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss">
.invoice-title-set {
  .el-dialog__body {
    padding: 30px 15px;
  }

  .handle-box {
    padding: 0 10px;
    color: #333;
    font-size: 12px;
    height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .handle-item {
    padding-bottom: 15px;
    .handle-item-name {
      flex-shrink: 0;
      width: 110px;
    }
    .handle-item-content {
      flex: 1;
    }
  }
  .handle-bar {
    position: relative;
    margin-top: 10px;
    height: 30px;
    button {
      float: right;
      margin-right: 10px;
    }
  }
}
</style>
