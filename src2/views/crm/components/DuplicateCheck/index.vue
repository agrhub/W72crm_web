<template>
  <el-dialog
    :visible.sync="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :before-close="handleClose"
    title="Kiểm tra khách hàng trùng lập"
    custom-class="no-padding-dialog"
    width="800px">
    <div
      v-loading="loading"
      :class="{ 'show-table': showTable }"
      class="duplicate-check">
      <div>
        <el-input
          v-model="searchContent"
          class="search-input"
          @keyup.enter.native="getList">
          <el-select
            slot="prepend"
            v-model="typeSelect">
            <el-option
              label="Theo tên khách hàng"
              value="name" />
            <el-option
              label="Theo số điện thoại khách hàng"
              value="phone" />
          </el-select>
          <el-button
            slot="append"
            type="primary"
            icon="wk wk-search"
            @click.native="getList">Kiểm tra trùng lặp</el-button>
        </el-input>
      </div>

      <el-table
        v-if="showTable"
        :data="tableData"
        :cell-class-name="cellClassName"
        class="duplicate-check__content"
        border
        height="380"
        style="width: 100%"
        @row-click="handleRowClick">
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :prop="item.prop"
          :label="item.label"
          :min-width="item.width"
          show-overflow-tooltip />
        <el-table-column
          fixed="right"
          width="110px"
          label="Tùy chọn">
          <template v-if="scope.row.poolAuthList" slot-scope="scope">
            <el-button
              v-if="scope.row.poolAuthList.receive"
              type="text"
              size="small"
              @click="handleClick('receive', scope.row)">Nhận</el-button>
            <el-button
              v-if="scope.row.poolAuthList.distribute"
              type="text"
              size="small"
              @click="handleClick('distribute', scope.row)">Trả</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div
        v-if="showTable"
        class="duplicate-check__footer">Lưu ý: Kết quả kiểm tra trùng lặp có thể hiển thị tối đa 10 mục, nếu không đầy đủ, vui lòng điều chỉnh điều kiện kiểm tra trùng lặp</div>


      <c-r-m-full-screen-detail
        :visible.sync="showFullDetail"
        :crm-type="relationCrmType"
        :id="relationId"
        :pool-id="poolId"
        @handle="getList"/>

      <alloc-handle
        :pool-id="poolId"
        :selection-list="[relationData]"
        :dialog-visible.sync="allocDialogShow"
        crm-type="customer"
        @handle="getList" />
    </div>
  </el-dialog>
</template>

<script>
import {
  crmCustomerDataCheckAPI,
  crmCustomerReceiveAPI
} from '@/api/crm/customer'

import AllocHandle from '../SelectionHandle/AllocHandle' // 公海分配操作

import crmTypeModel from '@/views/crm/model/crmTypeModel'

export default {
  name: 'DuplicateCheck',
  components: {
    AllocHandle,
    CRMFullScreenDetail: () =>
      import('@/components/CRMFullScreenDetail')
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      typeSelect: 'name',
      searchContent: '',
      tableData: null,

      showFullDetail: false, // 查看相关客户管理详情
      relationId: '', // 相关ID参数
      relationData: {}, // 关联数据
      poolId: '', // 公海Id
      relationCrmType: '', // 相关类型
      allocDialogShow: false //  分配弹窗
    }
  },
  computed: {
    showTable() {
      return this.tableData
    },

    isCustomerFilter() {
      return this.typeSelect == 'name'
    },

    // 客户名称、创建时间、负责人、最后跟进时间、操作
    fieldList() {
      if (this.isCustomerFilter) {
        return [{
          prop: 'name',
          label: 'Tên khách hàng',
          width: 200
        }, {
          prop: 'createTime',
          label: 'Ngày tạo',
          width: 160
        }, {
          prop: 'ownerUserName',
          label: 'Người tạo',
          width: 100
        }, {
          prop: 'lastTime',
          label: 'Lần liên hệ cuối cùng',
          width: 160
        }, {
          prop: 'module',
          label: 'Mô-đun',
          width: 100
        }]
      }

      return [{
        prop: 'mobile',
        label: 'Số điện thoại khách hàng',
        width: 160
      }, {
        prop: 'contactsName',
        label: 'Người liên hệ',
        width: 160
      }, {
        prop: 'name',
        label: 'Tên khách hàng',
        width: 200
      }, {
        prop: 'ownerUserName',
        label: 'Người tạo',
        width: 100
      }, {
        prop: 'module',
        label: 'Mô-đun',
        width: 100
      }]
    }
  },
  watch: {
    typeSelect() {
      this.searchContent = ''
      this.tableData = null
    }
  },
  mounted() {},
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
      this.resetData()
    },

    resetData() {
      this.typeSelect = 'name'
      this.searchContent = ''
      this.tableData = null
    },

    getList() {
      if (!this.searchContent) {
        return
      }
      const params = {}
      params[this.typeSelect] = this.searchContent
      this.loading = true
      crmCustomerDataCheckAPI(params).then(res => {
        this.loading = false
        const list = res.data || []
        this.tableData = list.map(item => {
          item.module = crmTypeModel.convertTypeToName(item.type)
          if (item.poolName) {
            item.module = `${item.module}（${item.poolName}）`
          }
          // 是手机号
          if (!this.isCustomerFilter) {
            item.mobile = this.searchContent
            if (item.type == crmTypeModel.contacts) {
              item.contactsName = item.name
              item.contactsId = item.id

              item.name = item.customerName
              item.id = item.customerId
              // name 字段对应的点击类型 以type为准，所以将type校准为客户
              // 联系人详情 已 contactsId 为准
              item.type = crmTypeModel.customer
            }
          }

          return item
        })
      }).catch(() => {
        this.loading = false
      })
    },

    /**
     * 列表点击
     */
    handleRowClick(row, column, event) {
      if (column.property == 'name' && row.id) {
        this.relationId = row.id
        if (row.poolAuthList) {
          this.poolId = row.poolAuthList.poolId
        } else {
          this.poolId = ''
        }
        const key = crmTypeModel.convertTypeToKey(row.type)
        this.relationCrmType = key == 'pool' ? 'customer' : key
        this.showFullDetail = true
      } else if (column.property == 'contactsName' && row.contactsId) {
        this.relationId = row.contactsId
        this.relationCrmType = 'contacts'
        this.showFullDetail = true
      }
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'name' || column.property === 'contactsName') {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    handleClick(type, data) {
      if (type === 'receive') {
        this.$confirm('Bạn muốn nhận khách hàng này không?', 'Thông báo', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            crmCustomerReceiveAPI({
              ids: [data.id],
              poolId: data.poolAuthList.poolId
            })
              .then(res => {
                this.$message.success('Thành công')
                this.getList()
              })
              .catch(() => {})
          })
          .catch(() => {})
      } else {
        data['customerId'] = data.id
        this.relationData = data
        this.allocDialogShow = true
      }
    }
  }
}
</script>

<style scoped lang="scss">
.duplicate-check {
  position: relative;
  padding: 20px;
  padding-bottom: 40px;

  &__content {
    margin-top: 15px;
  }

  &__footer {
    margin-top: 10px;
    font-size: 12px;
    color: #666;
  }
}

.duplicate-check.show-table {
  padding-bottom: 20px;
}

.el-input {
  /deep/ .el-select .el-input {
    width: 130px;
    /deep/ i {
      font-weight: bold;
    }
  }

  /deep/ .el-input-group__append {
    background-color: $xr-color-primary;
    border-color: $xr-color-primary;
    color: white;

    .el-button {
      /deep/ i {
        margin-right: 5px;
        font-size: 14px;
      }
    }
  }
}
</style>
