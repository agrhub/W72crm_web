<template>
  <div class="search-container">
    <flexbox class="search-header">
      <el-button
        type="text"
        icon="el-icon-arrow-left"
        class="btn-back"
        @click="$router.go(-1)">
        Trở về
      </el-button>
      <flexbox-item
        align="center"
        justify="center">
        <el-input
          v-model="form.search"
          :maxlength="50"
          placeholder="Vui lòng nhập các từ khóa">
          <el-button
            slot="append"
            class="btn-search"
            @click="searcClick">
            Tìm kiếm
          </el-button>
        </el-input>
      </flexbox-item>
    </flexbox>
    <div class="search-tabs">
      <el-tabs v-model="tabName">
        <el-tab-pane
          v-for="(item, index) in tabList"
          :key="index"
          :label="`${item.label}${item.list.length > 0 ? `(${item.list.length})` : ''}`"
          :name="item.name"/>
      </el-tabs>

      <el-dropdown
        v-if="tabName === 'task'"
        trigger="click"
        @command="taskFilterClick">
        <div class="el-dropdown-link el-dropdown-filter">
          {{ taskFilterObj[form.sort] }}<i class="el-icon-arrow-down el-icon--right"/>
        </div>
        <el-dropdown-menu slot="dropdown">
          <div class="el-dropdown-title">Sắp xếp</div>
          <el-dropdown-item
            v-for="(item, index) in taskFilterList"
            :key="index"
            :command="item.value">{{ item.label }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown
        v-else
        trigger="click"
        @command="filterClick">
        <div class="el-dropdown-link el-dropdown-filter">
          {{ filterObj[form.workSort] }}<i class="el-icon-arrow-down el-icon--right"/>
        </div>
        <el-dropdown-menu slot="dropdown">
          <div class="el-dropdown-title">Sắp xếp</div>
          <el-dropdown-item
            v-for="(item, index) in filterList"
            :key="index"
            :command="item.value">{{ item.label }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-container class="search-body">
      <el-aside>
        <div class="filter-sec">
          <div class="input-box">
            <div class="label">
              Thành viên
            </div>
            <wk-user-select
              :value="form.userList"
              :radio="false"
              style="width: 100%;"
              @change="userListChange"
            />
          </div>

          <template v-if="tabName === 'task'">
            <div class="input-box">
              <div class="label">
                Trong các mục sau
              </div>
              <el-select
                v-model="form.workIdList"
                filterable
                multiple
                clearable
                @change="refreshList">
                <el-option
                  v-for="item in projectList"
                  :key="item.workId"
                  :label="item.name"
                  :value="item.workId"/>
              </el-select>
            </div>

            <div class="input-box">
              <div class="label">
                Nhãn
              </div>
              <el-select
                v-model="form.labelIdList"
                filterable
                multiple
                clearable
                @change="refreshList">
                <el-option
                  v-for="item in labelList"
                  :key="item.labelId"
                  :label="item.name"
                  :value="item.labelId"/>
              </el-select>
            </div>
          </template>
        </div>

        <div class="filter-sec">
          <div class="sec-title">
            Cập nhật gần đây
          </div>
          <div class="sec-body">
            <ul class="options">
              <li
                v-for="(item, index) in timeIntervalType"
                :key="index"
                :class="{active: form.type === item.value}"
                class="option-item"
                @click="typeClick(item)">
                {{ item.label }}
              </li>
            </ul>
            <div
              v-if="form.type === 5"
              class="time-select">
              <el-date-picker
                v-model="form.startTime"
                value-format="yyyy-MM-dd"
                placeholder="Ngày bắt đầu"
                @change="refreshList" />
              <div class="line" />
              <el-date-picker
                v-model="form.endTime"
                value-format="yyyy-MM-dd"
                placeholder="Ngày kết thúc"
                @change="refreshList" />
            </div>
          </div>
        </div>
      </el-aside>
      <el-main v-loading="loading">
        <div v-empty="emptyValue" class="search-res">
          <template v-if="tabName === 'task'">
            <task-cell
              v-for="(item, index) in tabList[1].list"
              :key="index"
              :data="item"
              @on-handle="taskCellHandle" />
          </template>
          <template v-else>
            <project-cell
              v-for="(item, index) in tabList[0].list"
              :key="index"
              :data="item"
              :edit-show="item.authList && item.authList.project && item.authList.project.setWork"
              :delete-show="item.authList && item.authList.project && item.authList.project.setWork"
              @click.native="enterDetail(item)"
              @handle="projectCellHandle($event, item)"
            />
          </template>
        </div>
      </el-main>
    </el-container>
    <add-project
      v-if="isCreate"
      :id="editId"
      @save-success="refreshList"
      @close="isCreate = false"/>
    <!-- 详情 -->
    <task-detail
      v-if="taskDetailShow"
      :id="editId"
      :no-listener-class="['search-res']"
      @on-handle="refreshList"
      @close="taskDetailShow = false"/>
  </div>
</template>

<script>
import { workIndexWorkListAPI, workQueryWorkTaskListAPI } from '@/api/pm/task'
import { workWorkCollectAPI, workWorkDeleteAPI } from '@/api/pm/project'
import { workTasklableIndexAPI } from '@/api/pm/tag'

import WkUserSelect from '@/components/NewCom/WkUserSelect'
import ProjectCell from './components/ProjectCell'
import AddProject from '../components/AddProject'
import TaskCell from '@/views/taskExamine/task/components/TaskCell'
import TaskDetail from '@/views/taskExamine/task/components/TaskDetail'

export default {
  name: 'ProjectSearch',
  components: {
    WkUserSelect,
    ProjectCell,
    AddProject,
    TaskCell,
    TaskDetail
  },
  data() {
    return {
      loading: false,
      tabName: 'project',
      tabList: [
        {
          label: 'Dự án',
          name: 'project',
          list: []
        },
        {
          label: 'Công việc',
          name: 'task',
          list: []
        }
      ],
      filterObj: {},
      filterList: [{
        label: 'Tạo sớm nhất',
        value: 1
      }, {
        label: 'Tạo gần đây',
        value: 2
      }, {
        label: 'Cập nhật mới nhất',
        value: 3
      }],
      taskFilterObj: {},
      taskFilterList: [{
        label: 'Tạo sớm nhất',
        value: 1
      }, {
        label: 'Tạo gần đây',
        value: 2
      }, {
        label: 'Cập nhật mới nhất',
        value: 3
      }, {
        label: 'Mức độ ưu tiên cao nhất',
        value: 4
      }],
      projectList: [],
      labelList: [],
      timeIntervalType: [
        { label: 'Bất cứ lúc nào', value: 'all' },
        { label: 'Hôm nay', value: 1 },
        { label: 'Tuần trước', value: 2 },
        { label: 'Tháng trước', value: 3 },
        { label: 'Năm trước', value: 4 },
        { label: 'Thời gian tùy chỉnh', value: 5 }
      ],
      timeIndex: 1,

      form: {
        workSort: 1,
        sort: 1,
        type: 'all',
        search: '',
        userList: [],
        workIdList: [],
        labelIdList: []
      },
      isCreate: false,
      editId: null,
      taskDetailShow: false
    }
  },
  computed: {
    emptyValue() {
      if (this.tabName === 'project') {
        return this.tabList[0].list.length === 0
      }
      return this.tabList[1].list.length === 0
    }
  },
  created() {
    this.filterList.forEach(item => {
      this.filterObj[item.value] = item.label
    })
    this.taskFilterList.forEach(item => {
      this.taskFilterObj[item.value] = item.label
    })
    this.form.search = this.$route.query.search
    this.form.workSort = this.$route.query.sort
    this.refreshList()
    this.getProjectOption()
    this.getTagOption()
  },
  methods: {
    /**
     * 搜索按钮点击
     */
    searcClick() {
      this.refreshList()
    },

    /**
     * 筛选操作
     */
    filterClick(command) {
      this.form.workSort = command
      this.refreshList()
    },

    /**
     * 筛选操作
     */
    taskFilterClick(command) {
      this.form.sort = command
      this.refreshList()
    },


    /**
     * 类型修改
     */
    typeClick(item) {
      this.form.type = item.value
      this.refreshList()
    },

    userListChange(data) {
      this.form.userList = data
      this.refreshList()
    },

    refreshList() {
      const params = {
        name: this.form.search
      }

      if (this.form.type != 'all') {
        params.type = this.form.type

        if (this.form.type == 5) {
          params.startTime = this.form.startTime
          params.endTime = this.form.endTime
        }
      }


      if (this.form.userList && this.form.userList.length) {
        params.userIdList = this.form.userList
      }

      this.getProjectList(params)
      this.getTaskList(params)
    },

    getProjectList(params) {
      this.loading = true
      workIndexWorkListAPI({
        ...params,
        workSort: this.form.workSort
      })
        .then(res => {
          this.tabList[0].list = res.data || []
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    getTaskList(params) {
      this.loading = true
      workQueryWorkTaskListAPI({
        ...params,
        sort: this.form.sort,
        workIdList: this.form.workIdList,
        labelIdList: this.form.labelIdList
      })
        .then(res => {
          const list = res.data || []
          list.forEach(item => {
            item.checked = item.status == 5
          })
          this.tabList[1].list = list
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    getProjectOption() {
      workIndexWorkListAPI()
        .then(res => {
          this.projectList = res.data || []
        })
        .catch(() => {
        })
    },

    /**
     * 获取标签
     */
    getTagOption() {
      workTasklableIndexAPI()
        .then(res => {
          this.labelList = res.data || []
        })
        .catch(() => {})
    },


    /**
     * 进入详情
     */
    enterDetail(item) {
      this.$router.push({
        name: 'project-list',
        params: {
          id: item.workId
        }
      })
    },

    /**
     * 行操作
     */
    projectCellHandle(type, data) {
      if (type === 'edit') {
        this.editId = data.workId
        this.isCreate = true
      } else if (type === 'delete') {
        this.deleteProject(data)
      } else {
        workWorkCollectAPI(data.workId)
          .then(res => {
            this.refreshList()
          })
          .catch(() => {})
      }
    },

    /**
     * 删除项目
     */
    deleteProject(data) {
      this.$confirm(
        'Bạn có chắc chắn muốn xóa dự án không? Sau khi xóa, tất cả các tác vụ trong dự án này sẽ bị xóa hoàn toàn và không thể khôi phục',
        'Thông báo',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
        .then(() => {
          workWorkDeleteAPI(data.workId)
            .then(res => {
              this.$message({
                type: 'success',
                message: 'Thành công!'
              })
              this.getList()
            })
            .catch(() => {})
        })
        .catch(() => {})
    },

    /**
     * 任务cell 操作
     */
    taskCellHandle(type, data) {
      if (type == 'view') {
        this.editId = data.taskId
        this.taskDetailShow = true
      } else {
        this.refreshList()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.search-container {
  height: 100%;
  .search-header {
    padding-bottom: 15px;
    .btn-back {}
    .el-input {
      width: 400px;
      // width: 545px;
      // height: 46px;
      // /deep/ .el-input__inner {
      //   height: 46px;
      //   line-height: 46px;
      //   padding: 0 12px;
      // }
      /deep/ .el-input-group__append {
        border-color: $xr-color-primary;
        background-color: $xr-color-primary;
      }
      .btn-search {
        color: white;
        padding: 0 20px;
      }
    }
  }

  .search-tabs {
    position: relative;
    background-color: white;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    margin-bottom: 15px;

    /deep/ .el-tabs {
      .el-tabs__header {
        margin: 0 20px 2px;
      }

      .el-tabs__nav-wrap::after {
        display: none;
      }
    }

    .el-dropdown-filter {
      cursor: pointer;
      border-radius: 4px;
      padding: 8px 10px;
      background-color: white;
      margin-left: 15px;
    }

    .el-dropdown {
      cursor: pointer;
      position: absolute;
      right: 30px;
      top: 5px;
      z-index: 2;
    }
  }

  .search-body {
    height: calc(100% - 105px);
    .el-aside {
      background-color: white;
      border: 1px solid $xr-border-color-base;
      border-radius: $xr-border-radius-base;
      padding: 0 20px;

      .filter-sec {
        border-bottom: 1px solid $xr-border-color-base;
        padding: 15px 0;

        &:last-child {
          border-bottom: 0 none;
        }

        .input-box {
          margin-bottom: 15px;
          &:last-child {
            margin-bottom: 0;
          }
          .label {
            font-size: 14px;
            margin-bottom: 10px;
          }
          .el-select {
            width: 100%;
          }
        }

        .sec-title {
          color: $xr-color-text-secondary;
        }
        .sec-body {
          .options {
            margin-top: 10px;
            .option-item {
              color: $xr-color-primary;
              border-radius: $xr-border-radius-base;
              padding: 10px 10px 10px 25px;
              margin: 5px 0;
              cursor: pointer;
              &.active, &:hover {
                background-color: #f6f9f9;
              }
            }
          }

          .time-select {
            .el-date-editor {
              width: 100%;
            }
            .line {
              width: 8px;
              height: 2px;
              background-color: #666;
              border-radius: 2px;
              margin: 10px 0;
            }
          }
        }
      }
    }

    .el-main {
      background-color: white;
      border: 1px solid $xr-border-color-base;
      border-radius: $xr-border-radius-base;
      padding: 25px 0 15px;
      margin-left: 15px;

      .search-res {
        height: calc(100% - 42px);
        padding: 0 20px;
        overflow: auto;

        .search-res-item {
          margin-bottom: 25px;
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
      .page-container {
        margin-top: 10px;
        padding: 0 20px;
        .el-pagination {
          text-align: right;
        }
      }
    }
  }
}

.el-dropdown-menu {
  .el-dropdown-title {
    padding: 0px 20px 10px;
    color: #999;
    border-bottom: 1px solid $xr-border-color-base;
  }
  .el-dropdown-menu__item {
    color: #333;
  }
}
</style>
