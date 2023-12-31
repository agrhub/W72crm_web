<template>
  <div>
    <div class="content-title">
      <span>{{ title }}</span>
      <el-button
        type="primary"
        class="rt"
        size="medium"
        @click="addRule">Thêm quy tắc</el-button>
    </div>
    <div class="customer-table">
      <el-table
        v-loading="loading"
        :data="list"
        :height="tableHeight"
        :header-cell-style="headerCellStyle"
        style="width: 100%"
        stripe>
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :prop="item.field"
          :label="item.label"
          :formatter="fieldFormatter"
          show-overflow-tooltip/>
        <el-table-column
          fixed="right"
          label="Tùy chọn"
          width="120">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleEdit(scope.row)">Chỉnh sửa</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleDelete(scope)">Xóa</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="p-contianer">
        <el-pagination
          :current-page="currentPage"
          :page-sizes="pageSizes"
          :page-size.sync="pageSize"
          :total="total"
          class="p-bar"
          background
          layout="prev, pager, next, sizes, total, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"/>
      </div>
    </div>

    <edit-customer-limit
      :visible.sync="showAddEdit"
      :types="types"
      :action="action"
      @success="getList"/>
  </div>
</template>

<script>
import {
  crmSettingCustomerConfigListAPI,
  crmSettingCustomerConfigDelAPI
} from '@/api/admin/crm'
import EditCustomerLimit from './EditCustomerLimit'

export default {
  name: 'CustomerLimitSet',

  components: {
    EditCustomerLimit
  },

  props: {
    types: [String, Number] // 1拥有客户上限2锁定客户上限
  },

  data() {
    return {
      loading: false, // 展示加载中效果
      tableHeight: document.documentElement.clientHeight - 320, // 表的高度
      // 设置
      list: [],
      // 添加 编辑
      showAddEdit: false,
      action: {},
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 20, 30, 40],
      total: 0
    }
  },

  computed: {
    title() {
      return {
        1: 'Số lượng khách hàng tối đa',
        2: 'Giới hạn khách hàng từ chối'
      }[this.types]
    },

    fieldList() {
      const temps = [
        { label: 'Nhân viên áp dụng', field: 'userIds' },
        {
          label: {
            1: 'Số lượng khách hàng tối đa',
            2: 'Giới hạn khách hàng từ chối'
          }[this.types],
          field: 'customerNum'
        }
      ]

      if (this.types == 1) {
        temps.push({
          label: {
            1: 'Số lượng khách hàng đã hoàn tất giao dịch',
            2: 'Số lượng khách hàng giao dịch nhưng từ chối'
          }[this.types],
          field: 'customerDeal'
        })
      }

      return temps
    }
  },

  watch: {
    types() {
      this.list = []
      this.getList()
    }
  },
  created() {
    /** 控制table的高度 */
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight - 320
    }
    this.getList()
  },

  methods: {
    /**
     * 列表头样式
     */
    headerCellStyle(val, index) {
      return { background: '#F2F2F2' }
    },

    /**
     * 更改每页展示数量
     */
    handleSizeChange(val) {
      this.pageSize = val
      this.getList()
    },

    /**
     * 更改当前页数
     */
    handleCurrentChange(val) {
      this.currentPage = val
      this.getList()
    },

    /**
     * 列表
     */
    getList() {
      this.loading = true
      crmSettingCustomerConfigListAPI({
        page: this.currentPage,
        limit: this.pageSize,
        type: this.types
      })
        .then(res => {
          this.loading = false
          this.list = res.data.list
          this.total = res.data.totalRow
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 列表格式化
     */
    fieldFormatter(row, column) {
      if (column.property == 'customerDeal') {
        return row.customerDeal == 1 ? 'Đã chốt deal' : 'Chưa chốt' // 0 不占用 1 占用
      } else if (column.property === 'userIds') {
        const structures = row['deptIds'] || []
        let strName = structures
          .map(item => item.name)
          .join('、')

        const users = row['userIds'] || []
        const userName = users
          .map(item => item.realname)
          .join('、')

        if (strName && userName) {
          strName += '、'
        }
        const name = strName + userName
        return name || 'Toán công ty'
        // 1 启用 0 禁用 2 删除
      } else if (column.property === 'status') {
        if (row[column.property] === 0) {
          return 'Tắt'
        }
        return 'Kích hoạt'
      }
      return row[column.property]
    },

    /**
     * 编辑
     */
    handleEdit(data) {
      this.action = {
        type: 'update',
        data: data
      }
      this.showAddEdit = true
    },

    /**
     * 添加
     */
    addRule() {
      this.action = {
        type: 'save'
      }
      this.showAddEdit = true
    },

    /**
     * 删除
     */
    handleDelete(scope) {
      this.$confirm('Xác nhận xóa?', 'Thông báo', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          crmSettingCustomerConfigDelAPI({
            settingId: scope.row.settingId
          })
            .then(res => {
              this.list.splice(scope.$index, 1)
              this.$message.success('Thành công')
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Không thành công'
          })
        })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.content-title {
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
}
.content-title > span {
  display: inline-block;
  height: 36px;
  line-height: 36px;
  margin-left: 20px;
}

/* 设置 */

.customer-table {
  border: 1px solid #e6e6e6;
  margin: 30px;
  flex: 1;
  overflow: auto;
  box-sizing: border-box;
}

.p-contianer {
  position: relative;
  background-color: white;
  height: 44px;
  .p-bar {
    float: right;
    margin: 5px 100px 0 0;
    font-size: 14px !important;
  }
}
</style>
