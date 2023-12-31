<template>
  <div
    v-loading="loading"
    class="main-container">
    <div class="tabs-bar">
      <el-tabs
        v-model="tabType"
        @tab-click="tabTypeClick">
        <el-tab-pane
          label="Mục tiêu kinh doanh cho phòng ban"
          name="department" />
        <el-tab-pane
          label="Mục tiêu kinh doanh cho nhân viên"
          name="user" />
      </el-tabs>
    </div>
    <div class="handle-bar">
      <el-date-picker
        v-model="dateSelect"
        :clearable="false"
        type="year"
        value-format="yyyy"
        placeholder="Chọn năm" />
      <el-select
        v-model="typeSelect">
        <el-option
          v-for="item in [{label:'Giá trị hợp đồng', value:1},{label:'Giá trị thanh toán', value:2}]"
          :key="item.value"
          :label="item.label"
          :value="item.value" />
      </el-select>
      <el-cascader
        :options="deptList"
        :show-all-levels="false"
        :props="structuresProps"
        v-model="structuresSelectValue"
        placeholder="Chọn phòng ban"
        change-on-select
        @change="structuresValueChange" />
      <el-select
        v-if="tabType === 'user'"
        v-model="userSelectValue"
        :clearable="true"
        placeholder="Chọn nhân viên">
        <el-option
          v-for="item in userOptions"
          :key="item.userId"
          :label="item.realname"
          :value="item.userId" />
      </el-select>
      <el-button
        type="primary"
        @click.native="handleClick('search')">Tìm</el-button>

      <div
        v-if="!isEdit"
        style="float: right;">
        <el-button
          type="primary"
          class="xr-btn--orange"
          @click.native="addViewShow = true">Tạo mục tiêu kinh doanh</el-button>

        <el-button
          v-if="list.length"
          type="primary"
          @click.native="handleClick('edit')">Chỉnh sửa</el-button>
        <el-button
          v-if="list.length"
          type="primary"
          @click.native="handleClick('export')">Xuất file</el-button>
      </div>

      <div
        v-if="isEdit"
        style="float: right;">
        <el-button
          v-if="list.length > 0"
          type="primary"
          @click.native="handleClick('save')">Lưu</el-button>
        <el-button
          type="primary"
          @click.native="handleClick('cancel')">Hủy</el-button>
      </div>
    </div>
    <div class="content">
      <el-table
        id="task-set-table"
        :data="list"
        :height="tableHeight"
        :cell-style="cellStyle"
        border
        header-align="center"
        align="center"
        highlight-current-row>
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :fixed="index==0"
          :prop="item.field"
          :label="item.name"
          show-overflow-tooltip
          width="150">
          <template slot-scope="scope">
            <div
              v-if="item.field === 'name' && scope.$index!==list.length -1 "
              class="table-show-item">
              <i
                :class="{ 'is-show': isEdit }"
                class="wk wk-delete"
                @click="deleteAchievement(scope.row, scope.$index)" />
              {{ scope.row[item.field] }}
            </div>
            <div
              v-else-if="item.field === 'name'
                || item.field === 'yeartarget'
                || item.field === 'first'
                || item.field === 'second'
                || item.field === 'third'
              || item.field === 'fourth' || !isEdit || ( scope.$index===list.length -1 )"
              class="table-show-item">
              {{ scope.row[item.field] }}
            </div>
            <el-input
              v-else
              v-model="scope.row[item.field]"
              type="number"
              @input="handleInputEdit('change', scope)"
              @blur="handleInputEdit('blur', scope)" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <add-goal
      :visible.sync="addViewShow"
      :type="tabType"
      @success="tabTypeClick" />
  </div>
</template>

<script>
import { depListAPI, userListAPI } from '@/api/common'
import {
  crmAchievementIndex,
  crmAchievementUpdate,
  crmAchievementDelete
} from '@/api/admin/crm'

import moment from 'moment'
import AddGoal from './AddGoal'
import { exportElTable } from '@/utils'

export default {
  /** 业绩目标设置 */
  name: 'TaskSetStatistics',
  components: {
    AddGoal
  },
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      loading: false,
      tableHeight: document.documentElement.clientHeight - 290,
      tabType: 'department',

      dateSelect: '', // 选择的date区间
      typeSelect: 1, // 类型选择 1销售（目标）2回款（目标）
      /** 部门选择解析数据 */
      structuresProps: {
        children: 'children',
        label: 'label',
        value: 'id'
      },
      deptList: [], // 部门列表
      structuresSelectValue: [],
      /** 用户列表 */
      userOptions: [],
      userSelectValue: '',

      /** 编辑控制 */
      isEdit: false, // 是否是编辑中

      list: [],
      fieldList: [
        { field: 'name', name: '' },
        { field: 'yeartarget', name: 'Cả năm' },
        { field: 'first', name: 'Quý I' },
        { field: 'january', name: 'Tháng 1' },
        { field: 'february', name: 'Tháng 2' },
        { field: 'march', name: 'Tháng 3' },
        { field: 'second', name: 'Quý II' },
        { field: 'april', name: 'Tháng 4' },
        { field: 'may', name: 'Tháng 5' },
        { field: 'june', name: 'Tháng 6' },
        { field: 'third', name: 'Quý III' },
        { field: 'july', name: 'Tháng 7' },
        { field: 'august', name: 'Tháng 8' },
        { field: 'september', name: 'Tháng 9' },
        { field: 'fourth', name: 'Quý IV' },
        { field: 'october', name: 'Tháng 10' },
        { field: 'november', name: 'Tháng 11' },
        { field: 'december', name: 'Tháng 12' }
      ],

      // 设置目标
      addViewShow: false
    }
  },
  computed: {},
  mounted() {
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight - 290
    }

    this.dateSelect = moment()
      .year()
      .toString()
    this.getDeptList()
  },
  methods: {
    tabTypeClick() {
      this.isEdit = false
      if (this.tabType === 'department') {
        this.getAhievementList()
      } else if (this.tabType === 'user') {
        this.getUserList() // 更新员工列表
        this.getAhievementListForUser()
      }
    },
    /** 获取部门业绩目标列表 */
    getAhievementList() {
      this.loading = true
      var id = this.structuresSelectValue[this.structuresSelectValue.length - 1]
      crmAchievementIndex({
        year: this.dateSelect,
        type: 2, // 2部门3员工
        status: this.typeSelect,
        deptId: id
      })
        .then(res => {
          this.list = res.data.map(item => {
            item.name = item.objName
            return this.getShowItem(item)
          })
          if (this.list.length) {
            this.getSubTotalModel()
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    getShowItem(item) {
      item['first'] = this.calculateFirst(item)
      item['second'] = this.calculateSecond(item)
      item['third'] = this.calculateThird(item)
      item['fourth'] = this.calculateFourth(item)
      item['yeartarget'] = this.calculateAll(item)
      return item
    },
    /** 获取直属下级目标总和 */
    getSubTotalModel() {
      var initModel = {
        name: 'Tổng số mục tiêu',
        january: '0.00',
        february: '0.00',
        march: '0.00',
        april: '0.00',
        may: '0.00',
        june: '0.00',
        july: '0.00',
        august: '0.00',
        september: '0.00',
        october: '0.00',
        november: '0.00',
        december: '0.00',
        yeartarget: '0.00',
        first: '0.00',
        second: '0.00',
        third: '0.00',
        fourth: '0.00',
        ignore: true
      }

      // 从下属数据1 开始循环
      for (let index = 0; index < this.list.length; index++) {
        const element = this.list[index]
        for (
          let fieldIndex = 0;
          fieldIndex < this.fieldList.length;
          fieldIndex++
        ) {
          const fieldItem = this.fieldList[fieldIndex]
          if (fieldItem.field !== 'name') {
            initModel[fieldItem.field] = (
              parseFloat(initModel[fieldItem.field]) +
              parseFloat(element[fieldItem.field])
            )
              .toFixed(2)
              .toString()
          }
        }
      }

      this.list.push(initModel)
      // this.list.splice(1, 0, initModel)
    },
    handleInputEdit(type, scope) {
      if (type === 'change') {
        var value = scope.row[scope.column.property]
          ? scope.row[scope.column.property]
          : '0.00'
        var newValue = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
        if (value !== newValue) {
          scope.row[scope.column.property] = newValue
          this.$set(this.list, scope.$index, scope.row)
        }
      } else if (type === 'blur') {
        /** 一季度 */
        if (
          scope.column.property === 'january' ||
          scope.column.property === 'february' ||
          scope.column.property === 'march'
        ) {
          scope.row['first'] = this.calculateFirst(scope.row)
          scope.row['yeartarget'] = this.calculateAll(scope.row)
        } else if (
          scope.column.property === 'april' ||
          scope.column.property === 'may' ||
          scope.column.property === 'june'
        ) {
          scope.row['second'] = this.calculateSecond(scope.row)
          scope.row['yeartarget'] = this.calculateAll(scope.row)
        } else if (
          scope.column.property === 'july' ||
          scope.column.property === 'august' ||
          scope.column.property === 'september'
        ) {
          scope.row['third'] = this.calculateThird(scope.row)
          scope.row['yeartarget'] = this.calculateAll(scope.row)
        } else if (
          scope.column.property === 'october' ||
          scope.column.property === 'november' ||
          scope.column.property === 'december'
        ) {
          scope.row['fourth'] = this.calculateFourth(scope.row)
          scope.row['yeartarget'] = this.calculateAll(scope.row)
        }

        if (this.tabType === 'department' && this.list.length >= 2) {
          // 部门下 有子部门的时候 计算其值
          this.calculateSubTotal(scope)
        }
      }
    },
    /** 计算下属目标综合 */
    calculateSubTotal(scope) {
      var item = this.list[this.list.length - 1]
      var subValue = '0'
      for (let index = 0; index < this.list.length - 1; index++) {
        const element = this.list[index]
        subValue = (
          parseFloat(subValue) + parseFloat(element[scope.column.property])
        )
          .toFixed(2)
          .toString()
      }
      item[scope.column.property] = subValue

      /** 一季度 */
      if (
        scope.column.property === 'january' ||
        scope.column.property === 'february' ||
        scope.column.property === 'march'
      ) {
        item['first'] = this.calculateFirst(item)
        item['yeartarget'] = this.calculateAll(item)
      } else if (
        scope.column.property === 'april' ||
        scope.column.property === 'may' ||
        scope.column.property === 'june'
      ) {
        item['second'] = this.calculateSecond(item)
        item['yeartarget'] = this.calculateAll(item)
      } else if (
        scope.column.property === 'july' ||
        scope.column.property === 'august' ||
        scope.column.property === 'september'
      ) {
        item['third'] = this.calculateThird(item)
        item['yeartarget'] = this.calculateAll(item)
      } else if (
        scope.column.property === 'october' ||
        scope.column.property === 'november' ||
        scope.column.property === 'december'
      ) {
        item['fourth'] = this.calculateFourth(item)
        item['yeartarget'] = this.calculateAll(item)
      }
    },
    /** 计算各季度 */
    calculateFirst(data) {
      return (
        parseFloat(data.january) +
        parseFloat(data.february) +
        parseFloat(data.march)
      )
        .toFixed(2)
        .toString()
    },
    calculateSecond(data) {
      return (
        parseFloat(data.april) +
        parseFloat(data.may) +
        parseFloat(data.june)
      )
        .toFixed(2)
        .toString()
    },
    calculateThird(data) {
      return (
        parseFloat(data.july) +
        parseFloat(data.august) +
        parseFloat(data.september)
      )
        .toFixed(2)
        .toString()
    },
    calculateFourth(data) {
      return (
        parseFloat(data.october) +
        parseFloat(data.november) +
        parseFloat(data.december)
      )
        .toFixed(2)
        .toString()
    },
    /** 计算全年 */
    calculateAll(data) {
      return (
        parseFloat(data.first) +
        parseFloat(data.second) +
        parseFloat(data.third) +
        parseFloat(data.fourth)
      )
        .toFixed(2)
        .toString()
    },
    /**
     * 获取部门列表
     */
    getDeptList() {
      depListAPI({ type: 'tree' }).then(res => {
        this.deptList = res.data
        if (res.data.length > 0) {
          this.structuresSelectValue = [res.data[0].id]
          this.tabTypeClick() // 获取信息
        }
      })
    },
    /** 部门更改 */
    structuresValueChange(data) {
      if (this.tabType === 'department') {
        if (this.userSelectValue) {
          // 在部门目标设置下更新部门 清空员工下的员工列表信息
          this.userSelectValue = ''
          this.userOptions = []
        }
        // this.getAhievementList()
      } else if (this.tabType === 'user') {
        this.userSelectValue = ''
        this.userOptions = []
        this.getUserList() // 更新员工列表
        // this.getAhievementListForUser() // 获取部门下的员工目标列表
      }
    },
    /** 部门下员工 */
    getUserList() {
      var params = { pageType: 0 }
      if (this.structuresSelectValue.length > 0) {
        params.deptId = this.structuresSelectValue[
          this.structuresSelectValue.length - 1
        ]
        userListAPI(params)
          .then(res => {
            this.userOptions = res.data.list
          })
          .catch(() => {})
      } else {
        this.userSelectValue = ''
        this.userOptions = []
      }
    },
    /** 获取员工业绩目标列表 */
    getAhievementListForUser() {
      this.loading = true
      var id = this.structuresSelectValue[this.structuresSelectValue.length - 1]
      crmAchievementIndex({
        year: this.dateSelect,
        type: 3, // 2部门3员工
        status: this.typeSelect,
        deptId: id,
        userId: this.userSelectValue
      })
        .then(res => {
          this.list = res.data.map(item => {
            item.name = item.objName
            return this.getShowItem(item)
          })
          if (this.list.length) {
            this.getSubTotalModel()
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    /** 顶部操作 */
    handleClick(type) {
      if (type == 'search') {
        this.updateAhievementList()
      } else if (type == 'edit') {
        this.isEdit = true
      } else if (type == 'export') {
        const name = `Năm ${this.dateSelect} - ${
          { department: 'Mục tiêu phòng ban', user: 'Mục tiêu nhân viên' }[this.tabType]
        }.xlsx`
        exportElTable(name, 'task-set-table')
      } else if (type == 'save') {
        this.loading = true
        var list = this.list.filter(function(item, index, array) {
          return !item.ignore
        })
        crmAchievementUpdate(list)
          .then(res => {
            this.$message.success('Thành công')
            this.loading = false
            this.isEdit = false
            this.updateAhievementList()
          })
          .catch(() => {
            this.loading = false
          })
      } else if (type == 'cancel') {
        this.updateAhievementList()
        this.isEdit = false
      }
    },

    /** 点击搜索 保存 取消时更新信息 */
    updateAhievementList() {
      if (this.tabType === 'department') {
        this.getAhievementList()
      } else if (this.tabType === 'user') {
        this.getAhievementListForUser()
      }
    },
    /** 通过回调控制style */
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (rowIndex === this.list.length - 1) {
        return {
          backgroundColor: '#FAF9F6'
        }
      } else if (
        columnIndex == 1 ||
        columnIndex == 2 ||
        columnIndex == 6 ||
        columnIndex == 10 ||
        columnIndex == 14
      ) {
        return {
          backgroundColor: '#E5F4FE',
          textAlign: 'center'
        }
      } else {
        return { textAlign: 'center' }
      }
    },

    /**
     * 删除目标
     */
    deleteAchievement(data, index) {
      this.$confirm('Xác nhận xóa?', 'Thông báo', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          crmAchievementDelete({ achievementId: data.achievementId })
            .then(res => {
              this.loading = false
              this.$message.success('Thành công')

              this.list.splice(index, 1)
              this.list.pop()
              if (this.list.length) {
                this.getSubTotalModel()
              }
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
.main-container {
  flex: 1;
  background-color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
}

.handle-bar {
  padding: 15px 20px 5px 20px;
  .el-date-editor {
    width: 130px;
    margin-right: 15px;
  }
  .el-cascader {
    width: 130px;
    margin-right: 15px;
  }
  .el-select {
    width: 120px;
    margin-right: 15px;
  }
}

.content {
  padding: 10px 20px;
  flex: 1;
  overflow-y: hidden;
}
.content /deep/ .el-table {
  border: 1px solid #e6e6e6;
}

.tabs-bar {
  border-bottom: 1px solid #e6e6e6;
}
.el-tabs /deep/ .el-tabs__nav-wrap::after {
  display: none !important;
}
.el-tabs /deep/ .el-tabs__header {
  padding-left: 17px;
  height: 57px;
  margin-bottom: 0;
}
.el-tabs /deep/ .el-tabs__item {
  font-size: 13px;
  height: 57px;
  line-height: 57px;
}

.el-table /deep/ td {
  padding: 3px 0;
}
.el-table /deep/ th {
  text-align: center;
}

.table-show-item {
  height: 34px;
  line-height: 34px;
  text-align: center;
}

.wk-delete {
  cursor: pointer;
  opacity: 0;
  color: #666;
}

.wk-delete.is-show {
  opacity: 1;
}

.wk-delete:hover {
  color: #f56c6c;
}
</style>
