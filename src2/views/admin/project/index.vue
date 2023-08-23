<template>
  <div class="main">
    <xr-header
      icon-class="wk wk-project"
      icon-color="#33D08F"
      label="Quyền tùy biến" />
    <div class="main-body">
      <div class="main-table-header">
        <reminder
          class="project-reminder"
          content="Set the operation permissions for matching projects, task lists, and tasks for the permissions required by project members in different scenarios"/>
        <el-button
          class="main-table-header-button xr-btn--orange"
          type="primary"
          icon="el-icon-plus"
          @click="addJurisdiction">Tạo mới</el-button>
      </div>
      <el-table
        v-loading="loading"
        id="examine-table"
        :data="list"
        :height="tableHeight"
        class="main-table"
        highlight-current-row
        style="width: 100%"
        @row-click="handleRowClick">
        <el-table-column
          show-overflow-tooltip
          prop="roleName"
          width="150"
          label="Quyền quản lý dự án"/>
        <el-table-column
          show-overflow-tooltip
          prop="remark"
          label="Mô tả dự án"/>
        <el-table-column
          fixed="right"
          label="Tùy chọn"
          width="100">
          <template slot-scope="scope">
            <el-button
              :disabled="scope.row.label == 2"
              type="text"
              size="small"
              @click="handleClick('edit', scope)">Chỉnh sửa</el-button>
            <el-button
              :disabled="scope.row.roleType == 5"
              type="text"
              size="small"
              @click="handleClick('delete', scope)">Xóa</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <jurisdiction-create
      :show.sync="jurisdictionCreateShow"
      :action="createAction"
      @submite="getList"/>
  </div>
</template>

<script>
import {
  systemRoleQueryProjectRoleListAPI,
  systemRoleDeleteWorkRoleAPI
} from '@/api/admin/project'

import JurisdictionCreate from './components/JurisdictionCreate'
import Reminder from '@/components/Reminder'
import XrHeader from '@/components/XrHeader'

export default {
  /** 系统管理 的 项目管理 */
  name: 'SystemProject',
  components: {
    JurisdictionCreate,
    Reminder,
    XrHeader
  },
  mixins: [],
  data() {
    return {
      loading: false, // 加载动画
      tableHeight: document.documentElement.clientHeight - 196, // 表的高度
      list: [],
      createAction: {
        type: 'save'
      },
      jurisdictionCreateShow: false
    }
  },
  computed: {},
  mounted() {
    var self = this
    /** 控制table的高度 */
    window.onresize = function() {
      self.tableHeight = document.documentElement.clientHeight - 196
    }

    this.getList()
  },
  methods: {
    /**
     * 获取列表数据
     */
    getList() {
      this.loading = true
      systemRoleQueryProjectRoleListAPI()
        .then(res => {
          this.list = res.data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     *  添加权限
     */
    addJurisdiction() {
      this.createAction = {
        type: 'save'
      }
      this.jurisdictionCreateShow = true
    },

    /** 列表操作 */
    /**
     * 当某一行被点击时会触发该事件
     */
    handleRowClick(row, column, event) {},

    /**
     * 编辑删除
     */
    handleClick(type, scope) {
      if (type === 'edit') {
        this.createAction = {
          type: 'update',
          data: scope.row
        }
        this.jurisdictionCreateShow = true
      } else if (type === 'delete') {
        // 启用停用
        this.$confirm('Xác nhận xóa?', 'Thông báo', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            systemRoleDeleteWorkRoleAPI({
              roleId: scope.row.roleId
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
  height: 50px;
  background-color: white;
  position: relative;
  .main-table-header-button {
    float: right;
    margin-right: 20px;
    margin-top: 10px;
  }
}

.project-reminder {
  width: auto;
  float: left;
  margin-left: 20px;
  margin-top: 10px;
}
@import '../styles/table.scss';
</style>
