<template>
  <el-dialog
    :visible.sync="visible"
    :title="title"
    :append-to-body="true"
    :close-on-click-modal="false"
    :before-close="close"
    width="550px">
    <div class="position-relative">
      <flexbox
        class="handle-item"
        align="stretch">
        <div
          class="handle-item-name"
          style="margin-top: 8px;">Nhân viên áp dụng：</div>
        <xh-struc-user-cell
          :users="users"
          :strucs="strucs"
          style="width: 100%;"
          @value-change="strcUserChange"/>
      </flexbox>
      <flexbox
        class="handle-item"
        align="stretch">
        <div
          class="handle-item-name"
          style="margin-top: 8px;">{{ valueLabel }}</div>
        <el-input-number v-model="customerNum" :controls="false" :min="0" step-strictly/>
      </flexbox>
      <flexbox v-if="showDeal" class="handle-item">
        <div class="handle-item-name">{{ dealLabel }}</div>
        <el-radio-group v-model="customerDeal">
          <el-radio :label="1">Đã chốt deal</el-radio>
          <el-radio :label="0">Chưa chốt</el-radio>
        </el-radio-group>
      </flexbox>
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button @click.native="close">Hủy</el-button>
      <el-button
        v-debounce="sure"
        type="primary">Lưu</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { crmSettingCustomerConfigSetAPI } from '@/api/admin/crm'
import { XhStrucUserCell } from '@/components/CreateCom'
import { Loading } from 'element-ui'

export default {
  name: 'EditCustomerLimit',
  components: {
    XhStrucUserCell
  },
  props: {
    types: [String, Number], // 1拥有客户上限2锁定客户上限

    visible: {
      type: Boolean,
      default: false
    },

    action: {
      type: Object,
      default: () => {
        return {
          type: 'save'
        }
      }
    }
  },
  data() {
    return {
      customerDeal: 1,
      customerNum: '',
      users: [],
      strucs: []
    }
  },
  computed: {
    valueLabel() {
      return {
        1: 'Số lượng khách hàng tối đa (người)',
        2: 'Số lượng khách từ chối tối đa (người)'
      }[this.types]
    },

    dealLabel() {
      return {
        1: 'Số lượng khách hàng đã hoàn tất giao dịch：',
        2: 'Số lượng khách giao dịch nhưng từ chối：'
      }[this.types]
    },

    title() {
      return this.action.type == 'update' ? 'Chỉnh sửa quy tắc' : 'Thêm quy tắc'
    },

    // 展示是否
    showDeal() {
      return this.types == 1
    }
  },
  watch: {
    visible(val) {
      if (val) {
        if (this.action.type == 'save') {
          this.clearInfo()
        } else if (this.action.type == 'update') {
          const data = this.action.data
          this.customerDeal = data.customerDeal
          this.customerNum = data.customerNum
          this.$nextTick(() => {
            this.users = data.userIds
            this.strucs = data.deptIds
          })
        }
      }
    }
  },
  mounted() {
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },

    strcUserChange(data) {
      this.users = data.value.users
      this.strucs = data.value.strucs
    },

    sure() {
      if (this.customerNum <= 0) {
        this.$message.error('Vui lòng nhập đúng số lượng khách hàng')
      } else if ((!this.users.length && !this.strucs.length)) {
        this.$message.error('Vui lòng điền đầy đủ thông tin')
      } else {
        const loading = Loading.service({
          target: document.querySelector(`.el-dialog[aria-label="${this.title}"]`)
        })
        const params = {
          userIds: this.users,
          deptIds: this.strucs,
          customerNum: this.customerNum,
          type: this.types
        }

        if (this.showDeal) {
          params.customerDeal = this.customerDeal
        }

        if (this.action.type == 'update') {
          params.settingId = this.action.data.settingId
        }

        crmSettingCustomerConfigSetAPI(params)
          .then(res => {
            this.$emit('success')
            this.$message.success(`${this.title} thành công`)
            this.close()
            loading.close()
          })
          .catch(() => {
            loading.close()
          })
      }
    },

    clearInfo() {
      this.users = []
      this.strucs = []
      this.customerDeal = 1
      this.customerNum = ''
    }
  }
}
</script>

<style scoped lang="scss">
.position-relative {
  position: relative;
}

.handle-box {
  color: #333;
  font-size: 12px;
}
.handle-item {
  padding-bottom: 15px;
  position: relative;
  .handle-item-name {
    flex-shrink: 0;
    width: 150px;
  }
  .handle-item-content {
    flex: 1;
  }
}
</style>
