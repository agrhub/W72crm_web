<template>
  <div v-loading="loading">
    <div class="content-title">
      <span>Cài đặt nhóm kinh doanh</span>
      <el-button
        type="primary"
        class="rt"
        size="medium"
        @click="addBusiness">Thêm nhóm kinh doanh</el-button>
    </div>
    <div class="business-table">
      <el-table
        :data="businessData"
        :height="tableHeight"
        :header-cell-style="headerCellStyle"
        style="width: 100%"
        stripe>
        <el-table-column
          v-for="(item, index) in businessList"
          :key="index"
          :prop="item.field"
          :label="item.label"
          :formatter="fieldFormatter"
          show-overflow-tooltip/>
        <el-table-column
          fixed="right"
          label="Tùy chọn"
          width="140">
          <template slot-scope="scope">
            <el-button
              :disabled="scope.row.status != 1"
              type="text"
              size="small"
              @click="businessEdit(scope.row)">Chỉnh sửa</el-button>
            <el-button
              type="text"
              size="small"
              @click="businessDelect(scope)">Xóa</el-button>
            <el-button
              type="text"
              size="small"
              @click="businessStatus(scope)">{{ scope.row['status'] === 0 ? 'Kích hoạt' : 'Tắt' }}</el-button>
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
    <business-dialog
      :info-data="businessObj"
      :business-dialog-visible="businessDialogVisible"
      :business-title="businessTitle"
      @businessClose="businessClose"
      @businessSubmit="businessSubmit"/>
  </div>
</template>

<script>
import BusinessDialog from '@/views/admin/components/BusinessDialog'
import {
  businessGroupListAPI,
  businessGroupReadAPI,
  businessGroupDeleteAPI,
  businessGroupUpdateStatusAPI
} from '@/api/admin/crm'

export default {
  name: 'BusinessGroupSet',

  components: {
    BusinessDialog
  },

  data() {
    return {
      loading: false, // 展示加载中效果
      tableHeight: document.documentElement.clientHeight - 320, // 表的高度

      // 商机组设置
      /** 商机组每行的信息 */
      businessObj: { name: '', businessDep: [], settingList: '' },
      businessData: [],
      businessList: [
        { label: 'Tên nhóm', field: 'name' },
        { label: 'Tên phòng ban, nhân viên', field: 'deptName' },
        { label: 'Ngày tạo', field: 'createTime' },
        { label: 'Người tạo', field: 'createName' },
        { label: 'Trạng thái', field: 'status' }
      ],
      // 添加商机组
      businessDialogVisible: false,
      businessTitle: 'Thêm nhóm kinh doanh',
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 20, 30, 40],
      total: 0
    }
  },
  created() {
    /** 控制table的高度 */
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight - 320
    }
    this.getBusinessGroupList()
  },
  methods: {
    /**
     * 商机组列表头样式
     */
    headerCellStyle(val, index) {
      return { background: '#F2F2F2' }
    },

    /**
     * 更改每页展示数量
     */
    handleSizeChange(val) {
      this.pageSize = val
      this.getBusinessGroupList()
    },

    /**
     * 更改当前页数
     */
    handleCurrentChange(val) {
      this.currentPage = val
      this.getBusinessGroupList()
    },

    /**
     * 商机组列表
     */
    getBusinessGroupList() {
      this.loading = true
      businessGroupListAPI({
        page: this.currentPage,
        limit: this.pageSize
      })
        .then(res => {
          this.loading = false
          this.businessData = res.data.list
          this.total = res.data.totalRow
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 商机列表格式化
     */
    fieldFormatter(row, column) {
      // 如果需要格式化
      if (column.property == 'deptName') {
        // 格式部门
        const structures = row.deptList || []
        const strName = structures
          .map(item => {
            return item.name
          })
          .join('、')
        return strName || 'Toàn công ty'
      } else if (column.property === 'status') {
        if (row[column.property] == 1) {
          return 'Kích hoạt'
        }
        return 'Tắt'
      }
      return row[column.property]
    },

    /**
     * 商机组编辑
     */
    businessEdit(data) {
      businessGroupReadAPI({
        id: data.typeId
      })
        .then(res => {
          var settingList = res.data.statusList || []
          this.businessObj = {
            typeId: res.data.typeId,
            name: res.data.name,
            businessDep: res.data.deptList || [],
            settingList: settingList
          }
          this.businessDialogVisible = true
          this.businessTitle = 'Chỉnh sửa nhóm kinh doanh'
        })
        .catch(() => {})
    },

    /**
     * 商机组删除
     */
    businessDelect(scope) {
      this.$confirm('Xác nhận xóa?', 'Thông báo', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(() => {
          businessGroupDeleteAPI({
            id: scope.row.typeId
          })
            .then(res => {
              this.businessData.splice(scope.$index, 1)
              this.$message.success('Thành công')
            })
            .catch(() => {})
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Không thành công'
          })
        })
    },

    businessStatus(scope) {
      console.log(scope)
      // 启用停用
      this.$confirm(
        'Bạn muốn ' +
            (scope.row.status === 0 ? 'kích hoạt' : 'tắt') +
            'nhóm kinh doanh?',
        'Thông báo',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
        .then(() => {
          businessGroupUpdateStatusAPI({
            typeId: scope.row.typeId,
            status: scope.row.status === 0 ? 1 : 0
          })
            .then(res => {
              scope.row['status'] = scope.row['status'] === 0 ? 1 : 0
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
    },

    /**
     * 商机组添加
     */
    addBusiness() {
      this.businessObj = { name: '', businessDep: [], settingList: '' }
      this.businessDialogVisible = true
      this.businessTitle = 'Thêm nhóm kinh doanh'
    },

    /**
     * 商机组添加 -- 关闭
     */
    businessClose() {
      this.businessDialogVisible = false
    },

    /**
     * 商机组添加成功
     */
    businessSubmit() {
      this.getBusinessGroupList()
      this.businessClose()
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

/* 商机组设置 */

.business-table {
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
