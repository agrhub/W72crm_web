<template>
  <div class="main">
    <xr-header
      icon-class="wk wk-s-seas"
      icon-color="#487DFF"
      label="Client high seas rule setting" />
    <div class="main-body">
      <div class="main-table-header">
        <reminder
          :content="`Tips: 1. The system will uniformly return customers who meet the rules to the high seas pool at 24:00~6:00 every day`"
          class="xr-reminder"/>
        <reminder
          :content="`2. When a customer meets multiple high seas customer rules, it will fall into multiple high seas at the same time`"
          class="xr-reminder"/>
        <reminder
          :content="`3. If the automatic withdrawal rules are modified, the new rules will take effect the next day. Before that, the data of the customers high seas members will still be allocated in accordance with the original rules`"
          class="xr-reminder"/>
        <el-button
          class="main-table-header-button xr-btn--orange"
          icon="el-icon-plus"
          type="primary"
          @click="addClick">Thêm mới</el-button>
      </div>
      <el-table
        v-loading="loading"
        id="examine-table"
        :data="list"
        :height="tableHeight"
        :cell-class-name="cellClassName"
        class="main-table"
        highlight-current-row
        style="width: 100%"
        @row-click="handleRowClick">
        <el-table-column
          show-overflow-tooltip
          prop="poolName"
          width="150"
          label="High seas name"/>
        <el-table-column
          :formatter="fieldFormatter"
          show-overflow-tooltip
          prop="adminUser"
          label="Người quản lý"/>
        <el-table-column
          :formatter="fieldFormatter"
          show-overflow-tooltip
          prop="memberUser"
          label="Thành viên"/>
        <el-table-column
          show-overflow-tooltip
          prop="customerNum"
          width="100"
          label="Number of clients"/>
        <el-table-column
          :formatter="fieldFormatter"
          show-overflow-tooltip
          prop="status"
          width="100"
          label="Trạng thái"/>
        <el-table-column
          fixed="right"
          label="Tùy chọn"
          width="200">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleClick('status', scope)">{{ scope.row['status'] === 0 ? 'Kích hoạt' : 'Hủy kích hoạt' }}</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleClick('transfer', scope)">Chuyển giao</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleClick('edit', scope)">Chỉnh sửa</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleClick('delete', scope)">Xóa</el-button>
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

    <pool-add
      v-if="createShow"
      :action="createAction"
      @hiden-view="createShow=false"
      @save="getList" />

    <pool-detail
      v-if="detailShow"
      :id="detailId"
      @hide="detailShow = false"/>
    <pool-transfer
      :visible.sync="transferShow"
      :id="detailId"
      @transfer="getList"/>
  </div>
</template>

<script>
import {
  crmCustomerPoolSetListAPI,
  crmCustomerPoolSetDeleteAPI,
  crmCustomerPoolSetChangeStatusAPI
} from '@/api/crm/customer'

import Reminder from '@/components/Reminder'
import XrHeader from '@/components/XrHeader'
import PoolAdd from './components/PoolAdd'
import PoolDetail from './components/PoolDetail'
import PoolTransfer from './components/PoolTransfer'

export default {
  /** 系统管理 的 客户规则公海设置 */
  name: 'SystemPool',
  components: {
    Reminder,
    XrHeader,
    PoolAdd,
    PoolDetail,
    PoolTransfer
  },
  mixins: [],
  data() {
    return {
      loading: false, // 加载动画
      tableHeight: document.documentElement.clientHeight - 284, // 表的高度
      currentPage: 1,
      pageSize: 15,
      pageSizes: [15, 30, 45, 60],
      total: 0,
      list: [],
      createAction: {
        type: 'save'
      },
      createShow: false,
      // 查看详情
      detailId: '',
      detailShow: false,
      // 转移
      transferShow: false
    }
  },
  computed: {},
  mounted() {
    var self = this
    /** 控制table的高度 */
    window.onresize = function() {
      self.tableHeight = document.documentElement.clientHeight - 284
    }

    this.getList()
  },
  methods: {
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
     * 获取列表数据
     */
    getList() {
      this.loading = true
      crmCustomerPoolSetListAPI({
        page: this.currentPage,
        limit: this.pageSize
      })
        .then(res => {
          this.list = res.data.list
          this.total = res.data.totalRow
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 格式化字段
     */
    fieldFormatter(row, column) {
      if (column.property === 'adminUser') {
        const users = row['adminUser'] || []
        return users
          .map(item => {
            return item.realname
          })
          .join('、')
      } else if (column.property === 'memberUser') {
        const structures = row['memberDept'] || []
        let strName = structures
          .map(item => {
            return item.name
          })
          .join('、')

        const users = row['memberUser'] || []
        const userName = users
          .map(item => {
            return item.realname
          })
          .join('、')

        if (strName && userName) {
          strName += '、'
        }
        const name = strName + userName
        return name
      } else if (column.property === 'status') {
        if (row.status === 0) {
          return 'Hủy kích hoạt'
        }
        return 'Kích hoạt'
      }
      return row[column.property]
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'poolName') {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     *  添加权限
     */
    addClick() {
      this.createAction = {
        type: 'save'
      }
      this.createShow = true
    },

    /** 列表操作 */
    /**
     * 当某一行被点击时会触发该事件
     */
    handleRowClick(row, column, event) {
      if (column.property === 'poolName') {
        this.detailId = row.poolId
        this.detailShow = true
      }
    },

    /**
     * 编辑删除
     */
    handleClick(type, scope) {
      if (type === 'edit') {
        this.createAction = {
          type: 'update',
          id: scope.row.poolId,
          data: scope.row
        }
        this.createShow = true
      } else if (type === 'transfer') {
        this.detailId = scope.row.poolId
        this.transferShow = true
      } else if (type === 'delete') {
        this.$confirm('Xác nhận xóa?', 'Thông báo', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            crmCustomerPoolSetDeleteAPI({
              poolId: scope.row.poolId
            })
              .then(res => {
                this.list.splice(scope.$index, 1)
                this.$message({
                  type: 'success',
                  message: 'Thành công'
                })
              })
              .catch(() => {})
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: 'Không thành công'
            })
          })
      } else if (type === 'status') {
        // 启用 停用
        this.$confirm(`Xác nhận ${scope.row.status === 0 ? 'kích hoạt' : 'hủy kích hoạt'}?`,
          'Thông báo',
          {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }
        )
          .then(() => {
            crmCustomerPoolSetChangeStatusAPI({
              poolId: scope.row.poolId,
              status: scope.row.status === 0 ? 1 : 0
            })
              .then(res => {
                scope.row.status = scope.row.status === 0 ? 1 : 0
                this.$message({
                  type: 'success',
                  message: 'Thành công'
                })
              })
              .catch(() => {})
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
}
</script>

<style lang="scss" scoped>
.main {
  height:100%;

  /deep/ .xr-header {
    padding: 15px 30px;
  }
}

.main-body {
  background-color: white;
  border-top: 1px solid $xr-border-line-color;
  border-bottom: 1px solid $xr-border-line-color;
}

.main-table-header {
  background-color: white;
  position: relative;
  overflow: hidden;
  .main-table-header-button {
    float: right;
    margin-right: 20px;
    margin-top: 10px;
  }
}

.xr-reminder {
  width: auto;
  float: left;
  margin: 10px 20px;
}

/** 分页布局 */
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
@import '../../styles/table.scss';
</style>
