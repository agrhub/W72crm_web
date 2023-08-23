<template>
  <div>
    <div class="se-table-header">
      <el-button
        class="se-table-header-button xr-btn--orange"
        type="primary"
        icon="el-icon-plus"
        @click="addExamine">Thêm quy trình</el-button>
    </div>
    <el-table
      v-loading="loading"
      id="examine-table"
      :data="list"
      :height="tableHeight"
      :cell-class-name="cellClassName"
      class="main-table"
      stripe
      highlight-current-row
      style="width: 100%"
      @row-click="handleRowClick">
      <el-table-column
        width="100"
        label="Biểu tượng quy trình phê duyệt">
        <template slot-scope="scope">
          <div
            :style="{ backgroundColor: scope.row.iconColor }"
            class="table-icon">
            <i :class="scope.row.iconClass" />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(item, index) in fieldList"
        :key="index"
        :formatter="fieldFormatter"
        :prop="item.prop"
        :width="item.width"
        :label="item.label"
        show-overflow-tooltip/>
      <el-table-column/>
      <el-table-column
        fixed="right"
        label="Tùy chỉnh"
        width="250">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="handleClick('edit-table', scope)">Chỉnh sửa biểu mẫu</el-button>
          <el-button
            type="text"
            size="small"
            @click="handleClick('edit', scope)">Chỉnh sửa quy trình</el-button>
          <el-button
            :disabled="scope.row.isSys === 1"
            type="text"
            size="small"
            @click="handleClick('delete', scope)">Xóa</el-button>
          <el-button
            type="text"
            size="small"
            @click="handleClick('change', scope)">{{ scope.row['status'] === 0 ? 'Kích hoạt' : 'Hủy kích hoạt' }}</el-button>
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
    <create-examine-category
      v-if="showHandleView"
      :handle="createHandleInfo"
      @save="saveSuccess"
      @hiden-view="showHandleView=false"/>
    <examine-category-detail
      v-if="showDetail"
      :data="detailData"
      @refresh="getList"
      @hide-view="showDetail=false"/>
  </div>
</template>

<script>
import {
  oaExamineCategoryListAPI,
  oaExamineCategoryEnablesAPI,
  oaExamineCategoryDeleteAPI
} from '@/api/admin/oa'
import CreateExamineCategory from './CreateExamineCategory'
import ExamineCategoryDetail from './ExamineCategoryDetail'

export default {
  name: 'ExamineManager',
  components: {
    CreateExamineCategory,
    ExamineCategoryDetail
  },
  data() {
    return {
      loading: false, // 加载动画
      tableHeight: document.documentElement.clientHeight - 240, // 表的高度
      list: [],
      fieldList: [
        {
          prop: 'title',
          label: 'Tên quy trình',
          width: 150
        },
        {
          prop: 'examineType',
          label: 'Loại quy trình',
          width: 150
        },
        {
          prop: 'userList',
          label: 'Người phê duyệt',
          width: 150
        },
        {
          prop: 'remarks',
          label: 'Ghi chú',
          width: 150
        },
        {
          prop: 'updateTime',
          label: 'Ngày cập nhật',
          width: 150
        },
        {
          prop: 'status',
          label: 'Trạng thái',
          width: 150
        }
      ],
      currentPage: 1,
      pageSize: 10,
      pageSizes: [10, 20, 30, 40],
      total: 0,
      showHandleView: false, // 审批类型操作
      // 创建的相关信息
      createHandleInfo: { action: 'save', type: 'examine', id: '' },
      // 详情展示
      showDetail: false,
      detailData: {}
    }
  },
  watch: {},
  mounted() {
    var self = this
    /** 控制table的高度 */
    window.onresize = function() {
      self.tableHeight = document.documentElement.clientHeight - 240
    }

    this.getList()
  },
  methods: {
    /** 新建成功 */
    saveSuccess() {
      this.currentPage = 1
      this.getList()
    },
    /** 获取列表数据 */
    /** 获取列表数据 */
    getList() {
      this.loading = true
      oaExamineCategoryListAPI({
        page: this.currentPage,
        limit: this.pageSize
      })
        .then(res => {
          res.data.list.forEach(item => {
            const temps = item.icon ? item.icon.split(',') : []
            if (temps.length > 1) {
              item.iconClass = temps[0]
              item.iconColor = temps[1]
            } else {
              item.iconClass = 'wk wk-approve'
              item.iconColor = '#9376FF'
            }
          })
          this.list = res.data.list

          this.total = res.data.totalRow

          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /** 格式化字段 */
    fieldFormatter(row, column) {
      // 如果需要格式化
      if (column.property === 'examineType') {
        if (row[column.property] === 1) {
          return 'Quy trình phê duyệt cố định'
        } else if (row[column.property] === 2) {
          return 'Người phê duyệt được ủy quyền'
        } else {
          return ''
        }
      } else if (column.property === 'userList') {
        const structures = row['deptList'] || []
        let strName = structures
          .map(item => {
            return item.name
          })
          .join('、')

        const users = row['userList'] || []
        const userName = users
          .map(item => {
            return item.realname
          })
          .join('、')

        if (strName && userName) {
          strName += '、'
        }
        const name = strName + userName
        return name || 'Toán công ty'
      } else if (column.property === 'status') {
        if (row[column.property] === 0) {
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
      if (column.property === 'title') {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },
    /**
     *  添加审批流
     */
    addExamine() {
      this.createHandleInfo = { action: 'save', type: 'examine', id: '' }
      this.showHandleView = true
    },
    /** 列表操作 */
    // 当某一行被点击时会触发该事件
    handleRowClick(row, column, event) {
      if (column.property) {
        this.detailData = row
        this.showDetail = true
      }
    },
    // 更改每页展示数量
    handleSizeChange(val) {
      this.pageSize = val
      this.getList()
    },
    // 更改当前页数
    handleCurrentChange(val) {
      this.currentPage = val
      this.getList()
    },
    handleClick(type, scope) {
      if (type === 'edit-table') {
        this.$router.push({
          name: 'workbenchHandlefield',
          params: {
            type: 'oa_examine',
            label: '10',
            id: scope.row.categoryId
          }
        })
      } else if (type === 'edit') {
        this.createHandleInfo.action = 'update'
        this.createHandleInfo.id = scope.row.categoryId
        this.createHandleInfo.data = scope.row
        this.showHandleView = true
      } else if (type === 'delete') {
        // 启用停用
        this.$confirm('Bạn có chắc chắn muốn xóa quy trình phê duyệt này không?', 'Thông báo', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            this.loading = true
            oaExamineCategoryDeleteAPI({
              id: scope.row['categoryId']
            })
              .then(res => {
                this.list.splice(scope.$index, 1)
                if (this.list.length == 0) {
                  this.currentPage = this.currentPage - 1 > 0 ? this.currentPage - 1 : 1
                }
                this.getList()

                this.$message({
                  type: 'success',
                  message: 'Thành công'
                })
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
      } else if (type === 'change') {
        // 启用停用
        this.$confirm(
          'Xác nhận ' +
            (scope.row['status'] === 0 ? 'kích hoạt' : 'hủy kích hoạt') +
            ' quy trình?',
          'Thông báo',
          {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }
        )
          .then(() => {
            oaExamineCategoryEnablesAPI({
              id: scope.row['categoryId'],
              status: scope.row['status'] === 0 ? 1 : 0
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
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.se-table-header {
  height: 50px;
  background-color: white;
  position: relative;
  .se-table-header-button {
    float: right;
    margin-right: 20px;
    margin-top: 10px;
  }
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

.table-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  border-radius: $xr-border-radius-base;
  .wk {
    color: white;
    font-size: 12px;
  }
}

@import '../../styles/table.scss';
</style>
