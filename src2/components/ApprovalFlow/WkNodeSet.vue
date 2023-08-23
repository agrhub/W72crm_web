<template>
  <el-drawer
    :visible="visible"
    :with-header="false"
    size="500px"
    title="Tiêu đề"
    append-to-body
    @close="close">
    <flexbox v-if="editNode" class="drawer-header">
      <div class="edit-title">
        <el-input
          v-if="isNameEdit"
          v-model="editNode.name"
          maxlength="20"
          @blur="nameInputBlur" />
        <template v-else>
          <span class="title" @click="isNameEdit = true">{{ editNode.name }}</span>
          <i class="wk wk-edit" @click="isNameEdit = true" />
        </template>
      </div>
      <i
        class="el-icon-close "
        @click="close" />
    </flexbox>
    <div v-if="editNode" class="drawer-body">
      <div class="section">
        <el-radio-group
          v-model="editNode.examineType"
          @change="examineTypeChange">
          <el-radio
            v-for="(item, index) in examineTypeOptions"
            :key="index"
            :label="item.value"
            class="el-radio--type">{{ item.label }}</el-radio>
        </el-radio-group>
        <!-- 指定成员 -->
        <div v-if="editNode.examineType === 1" class="area-top">
          <div class="section-handle">
            <el-button type="primary" @click="depUserViewDialogShow = true">Thêm nhân viên</el-button>
            <span class="text-des">Không quá 20 người</span>
          </div>
          <div class="user-list-wrap">
            <span
              v-for="(item, index) in editNode.userList"
              :key="index"
              class="user-item">
              {{ item.realname }}
              <i class="el-icon-close" @click="userDelete(index)" />
            </span>
          </div>
        </div>

        <!-- 上级 -->
        <div v-if="editNode.examineType === 2" class="area-top">
          <div class="section-handle">
            <span>Người đề xuất</span>
            <el-select v-model="editNode.parentLevel">
              <el-option
                v-for="item in sendLevelOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"/>
            </el-select>
          </div>
          <div class="area-top wk-checkbox">
            <el-checkbox
              v-model="editNode.type"
              :true-label="1"
              :false-label="0"/>
            <span class="wk-checkbox__label">Khi người quản lý không có, người duyệt sẽ là quản trị hệ thống</span>
          </div>
        </div>

        <!-- 角色 -->
        <div v-if="editNode.examineType === 3" class="area-top">
          <role-employee-select
            ref="roleSelect"
            v-model="editNode.roleId"
            :props="{
              onlyShowRole: true
            }"
            clearable
            @change="roleSelectChange"/>
        </div>

        <!-- 发起人自选 -->
        <div v-if="editNode.examineType === 4" class="area-top">
          <div class="section-handle">
            <el-select v-model="editNode.chooseType">
              <el-option :value="1" label="Chọn một người"/>
              <el-option :value="2" label="Chọn nhiều người"/>
            </el-select>
          </div>
          <div class="area-top">
            <div class="section__title">Chọn phạm vi</div>
            <div class="area-top">
              <el-select
                v-model="editNode.rangeType"
                @change="rangeTypeChange">
                <el-option :value="1" label="Toàn công ty"/>
                <el-option :value="2" label="Thành viên được chỉ định"/>
                <el-option :value="3" label="Vai trò được chỉ định"/>
              </el-select>
              <template v-if="editNode.rangeType === 2">
                <el-button type="primary" @click="depUserViewDialogShow = true">Thêm nhân viên</el-button>
              </template>
              <role-employee-select
                v-if="editNode.rangeType === 3"
                ref="roleSelect"
                v-model="editNode.roleId"
                :props="{
                  onlyShowRole: true
                }"
                clearable
                @change="roleSelectChange"/>
            </div>
            <div
              v-if="editNode.rangeType === 2 && editNode.userList.length > 0"
              class="user-list-wrap"
              style="margin-top: 8px;">
              <span
                v-for="(item, index) in editNode.userList"
                :key="index"
                class="user-item">
                {{ item.realname }}
                <i class="el-icon-close" @click="userDelete(index)" />
              </span>
            </div>
          </div>
        </div>

        <!-- 连续多级上级 -->
        <div v-if="editNode.examineType === 5" class="area-top">
          <div class="section__title">Hoàn tất phê duyệt</div>
          <el-radio-group
            v-model="editNode.type"
            class="el-radio-group--block"
            @change="endTypeChange">
            <el-radio :label="1" class="el-radio--block">
              <div>Vai trò được chỉ định (cấp trên đa cấp liên tục phải bao gồm vai trò này)<role-employee-select
                ref="roleSelect"
                v-model="editNode.roleId"
                :props="{
                  onlyShowRole: true
                }"
                clearable
                @change="roleSelectChange"/></div>
            </el-radio>
            <div
              class="area-top wk-checkbox"
              style="line-height: 34px; margin-left: 20px;">
              <el-checkbox
                v-model="editNode.overType"
                :true-label="1"
                :false-label="0"/>
              <span class="wk-checkbox__label" style="font-size: 13px;margin-right: 8px;">Chỉ được 1 người đề xuất duy nhất</span>
              <el-select v-model="editNode.parentLevel">
                <el-option
                  v-for="item in levelOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"/>
              </el-select>
            </div>
            <el-radio :label="2" class="el-radio--block area-top"><span>Từ trên xuống</span><el-select
              v-model="editNode.tempParentLevel"
              style="margin-left: 5px;">
              <el-option
                v-for="item in topLevelOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"/>
            </el-select></el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 审批方式-->
      <div
        v-if="waySectionShow"
        class="section">
        <div class="section__title">
          <span>Phương pháp phê duyệt được áp dụng khi nhiều người cùng phê duyệt</span>
        </div>

        <div class="section__content">
          <el-radio-group v-model="editNode.type">
            <el-radio
              v-if="editNode.examineType !== 3"
              :label="1" class="el-radio--block">Phê duyệt lần lượt</el-radio>
            <el-radio :label="2" class="el-radio--block">Chữ ký đồng ý (yêu cầu sự đồng ý của tất cả những người phê duyệt)</el-radio>
            <el-radio :label="3" class="el-radio--block">Chữ ký (chỉ một người phê duyệt đồng ý hoặc từ chối)</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 审批为空 -->
      <div
        class="section">
        <div class="section__title">
          <span>Người phê duyệt trống</span><el-tooltip
            effect="dark"
            placement="top">
            <div slot="content" class="mutil-line-tips">
              <div class="tips-title">Trong bất kỳ trường hợp nào sau đây, người phê duyệt trống：</div>
              <div class="tips-line">1、Vai trò hoặc cấp trên trống；</div>
              <div class="tips-line">2、Khi quy trình được phê duyệt bởi một người, người phê duyệt xin nghỉ phép / từ chức；</div>
              <div class="tips-line">3、Quy trình này yêu cầu nhiều người phê duyệt lần lượt hoặc khi từ chức, người phê duyệt xin nghỉ phép / từ chức；</div>
              <div class="tips-line">4、Việc phê duyệt bắt đầu không đáp ứng bất kỳ điều kiện nào.</div>
            </div>
            <i class="wk wk-help wk-help-tips"/>
          </el-tooltip>
        </div>

        <div class="section__content">
          <el-radio-group v-model="editNode.examineErrorHandling">
            <!-- <el-radio :label="1" class="el-radio--block">Duyệt tự động</el-radio> -->
            <el-radio :label="2" class="el-radio--block">Chuyển tự động cho quản trị viên</el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>
    <div class="drawer-footer">
      <el-button @click.native="close">Hủy</el-button>
      <el-button
        v-debounce="handleConfirm"
        type="primary">Lưu</el-button>
    </div>

    <wk-dep-user-view-dialog
      v-if="depUserViewDialogShow"
      :props="{
        canSelectDep: false,
        searchParams: {status: 1},
        request: userRequest,
      }"
      :user-value="editNode.userList"
      :visible.sync="depUserViewDialogShow"
      @change="selectUserChange"
    />
  </el-drawer>
</template>

<script>
import {
  adminUserQueryDeptUserByExamineAPI
} from '@/api/admin/user'

import WkDepUserViewDialog from '@/components/NewCom/WkUserSelect/DepDialog'
import WkUserSelect from '@/components/NewCom/WkUserSelect'
import RoleEmployeeSelect from '@/views/admin/employeeDep/components/RoleEmployeeSelect'

import { objDeepCopy } from '@/utils'
import NodeSetMixin from './NodeSet'

export default {
  // 条件配置
  name: 'WkNodeSet',

  components: {
    WkDepUserViewDialog,
    WkUserSelect,
    RoleEmployeeSelect
  },

  mixins: [NodeSetMixin],

  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false
    },
    node: {
      type: Object,
      default() {
        return {}
      }
    },
    props: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {
      editNode: null,
      isNameEdit: false,
      examineTypeOptions: [{
        label: 'Thành viên được chỉ định',
        value: 1
      }, {
        label: 'Cấp trên',
        value: 2
      }, {
        label: 'Thành viên liên quan',
        value: 3
      }, {
        label: 'Người để xuất tùy chọn',
        value: 4
      }, {
        label: 'Cấp trên của cấp trên',
        value: 5
      }],
      sendLevelOption: [],
      topLevelOption: [],
      levelOption: [], // sendLevelOption topLevelOption levelOption 仅第一级名称区别
      depUserViewDialogShow: false
    }
  },

  computed: {
    // 审批方式
    waySectionShow() {
      return this.getWkWayShowStatus(this.editNode)
    },

    userRequest() {
      return adminUserQueryDeptUserByExamineAPI
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.editNode = objDeepCopy(this.node)
      } else {
        this.editNode = null
      }
    }
  },

  created() {
    for (let index = 1; index <= 20; index++) {
      const label = `Từ ${index} cấp`
      this.levelOption.push({
        label: label,
        value: index
      })
      if (index === 1) {
        this.sendLevelOption.push({
          label: 'Cấp trên trực tiếp',
          value: index
        })
        this.topLevelOption.push({
          label: 'Quản trị viên',
          value: index
        })
      } else {
        this.sendLevelOption.push({
          label: label,
          value: index
        })
        this.topLevelOption.push({
          label: label,
          value: index
        })
      }
    }
  },

  mounted() {},

  beforeDestroy() {},

  methods: {
    /**
     * 输入失去焦点
     */
    nameInputBlur() {
      this.isNameEdit = false
      if (this.editNode.name === '') {
        this.editNode.name = 'Người phê duyệt'
      }
    },

    /**
     * 关闭
     */
    close() {
      this.$emit('update:visible', false)
    },

    /**
     * 保存
     */
    handleConfirm() {
      // 条件为0 报红
      this.editNode.isError = this.getWkNodeErrorStatus(this.editNode)

      for (const key in this.editNode) {
        if (key !== 'conditionList') {
          this.node[key] = this.editNode[key]
        }
      }

      this.close()
    },

    /**
     * 审批类型change
     */
    examineTypeChange() {
      this.editNode.parentLevel = 1
      this.editNode.userList = []
      // 多人审批类型 1 依次审批 2 会签 3 或签
      // 当审批类型为主管时 找不到上级时，是否由上一级上级代审批 0 否 1 是
      // 当审批类型为连续多级主管时 1 指定角色 2 组织架构的最上级
      // 当审批类型为发起人自选时 1 全公司 2 指定成员 3 指定角色
      if (this.editNode.examineType === 2) { // 指定成员
        this.editNode.type = 1 // 多人审批类型
      } else if (this.editNode.examineType === 2) { // 上级
        this.editNode.type = 0 // 当审批类型为主管时
      } else if (this.editNode.examineType === 3) { // 角色
        this.editNode.type = 2 // 多人审批类型
      } else if (this.editNode.examineType === 4) { // 发起人自选
        if (!this.editNode.rangeType) {
          this.editNode.rangeType = 1
        }
        this.editNode.chooseType = 1
        this.editNode.type = 1 // 多人审批类型
      }


      this.editNode.examineErrorHandling = 2
      this.editNode.roleId = ''
      this.editNode.chooseType = 1
    },

    /**
     * 选择员工change
     */
    selectUserChange(users, deps) {
      if (users.length > 0) {
        if (this.editNode.examineType === 1) {
          this.editNode.userList = users.length > 20 ? users.slice(0, 20) : users
          this.editNode.type = 1 // 重置多人审批状态
        } else {
          this.editNode.userList = users
        }
      } else {
        this.editNode.userList = []
      }
    },

    /**
     * 用户删除
     */
    userDelete(index) {
      this.editNode.userList.splice(index, 1)
    },

    /**
     * 发起人自选 范围change
     */
    rangeTypeChange() {
      this.editNode.userList = []
      this.editNode.roleId = ''
      this.editNode.type = 1
    },

    /**
     * 审批终点 类型change
     */
    endTypeChange() {
      this.editNode.overType = 0
    },

    /**
     * 角色选择
     */
    roleSelectChange() {
      this.$nextTick(() => {
        if (this.editNode.roleId) {
          this.$set(this.editNode, 'roleObj', {
            roleName: this.$refs.roleSelect.select.selectedLabel
          })
        } else {
          this.$set(this.editNode, 'roleObj', null)
        }
      })
    }
  }
}
</script>

<style lang="scss">
.el-radio-group--block {
  display: block;
}
.el-radio--block {
  display: block;
  margin-right: 0;
  .el-radio__label {
    display: inline-block;
  }
}
</style>
<style lang="scss" scoped>
.drawer-header {
  height: 50px;
  padding: 0 15px;
  background: #F7F8FA;
  border-bottom: 1px solid $xr-border-color-base;

  .edit-title {
    width: 450px;
    margin-right: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    .title {
      cursor: pointer;
    }
    .wk-edit {
      cursor: pointer;
    }
  }

  .el-icon-close {
    font-size: 24px;
    color: #909399;
    cursor: pointer;
  }

  .el-icon-close:hover {
    color: $xr-color-primary;
  }
}

.drawer-body {
  height: calc(100% - 110px);
  overflow-y: auto;

  .section {
    padding: 20px;
    border-bottom: 1px solid $xr-border-color-base;

    &__title {
      margin-bottom: 16px;
      font-weight: bold;
    }

    &-handle {
      position: relative;
      padding: 5px 0;

      .text-des {
        color: #999;
        margin-left: 8px;
        margin-top: 10px;
      }
    }
  }

  .el-radio--type {
    width: 25%;
    font-size: 15px;
    margin-bottom: 20px;
  }

  .el-radio--block {
    display: block;
    margin-bottom: 10px;
  }

  .area-top {
    margin-top: 8px;
  }

  .wk-checkbox {
    line-height: 25px;

    &__label {
      margin-left: 8px;
    }
  }

  .wk-help-tips {
    margin-left: 5px;
  }

  //用户列表
  .user-list-wrap {
    .user-item {
      display: inline-block;
      white-space: nowrap;
      background: #F3F7FF;
      border-radius: 4px;
      padding: 0 8px;
      line-height: 25px;
      margin-right: 8px;
      margin-bottom: 8px;
      .el-icon-close {
        cursor: pointer;
      }
    }
  }

  .mutil-line-tips {
    .tips-title {
      font-weight: bold;
    }
    .tips-line {
      margin-top: 3px;
    }
  }
}

.drawer-footer {
  padding: 15px;
  text-align: right;
}

</style>
