<template>
  <div class="employee-dep-management">
    <xr-header
      :content.sync="searchInput"
      placeholder="Vui lòng nhập tên nhân viên / số điện thoại"
      show-search
      icon-class="wk wk-s-seas"
      icon-color="#26D4DA"
      label="Quản lý nhân viên và phòng ban"
      @search="headerSearch">
      <el-button
        slot="ft"
        class="xr-btn--orange"
        type="primary"
        @click="bulkImportClick">Nhập hàng loạt</el-button>
    </xr-header>
    <div class="system-content">
      <!-- 左边导航栏 -->
      <div
        v-loading="depLoading"
        class="system-nav">
        <div class="system-nav__title">
          Cơ cấu tổ chức doanh nghiệp
        </div>
        <div class="system-nav__content">
          <div class="section">
            <div class="section__title">Nhân viên</div>
            <div class="section__content">
              <flexbox
                v-for="(item, index) in employeeMenu"
                :key="index"
                :class="['menu-item', { 'is-select' : currentMenuData && currentMenuData.type == item.type}]"
                @click.native="changeUserClick(item)">
                <i
                  :class="item.icon"
                  class="menu-item__icon" />
                <div class="menu-item__content">{{ item.label }}</div>
              </flexbox>
            </div>
          </div>

          <div class="section">
            <div class="section__title">Phòng ban
              <el-button
                v-if="strucSaveAuth"
                type="text"
                icon="el-icon-circle-plus"
                class="add-btn"
                @click="addStruc">Tạo phòng ban</el-button>
            </div>
            <div class="section__content">
              <el-tree
                ref="tree"
                :data="showDepData"
                node-key="deptId"
                highlight-current
                default-expand-all
                @node-click="changeDepClick">
                <flexbox
                  slot-scope="{ node }"
                  :class="{ 'is-current': node.isCurrent}"
                  class="node-data">
                  <i
                    v-if="node.level == 1"
                    class="wk wk-department" />
                  <span
                    v-else
                    class="node-data__mark" />

                  <div class="node-data__label text-one-line ">{{ node.label }}</div>
                  <i
                    v-if="node.childNodes && node.childNodes.length"
                    :class="{ 'is-close': !node.expanded }"
                    class="wk wk-up-unfold" />
                </flexbox>
              </el-tree>
            </div>
          </div>

        </div>
      </div>
      <!-- 右边内容 -->
      <div class="system-view-table flex-index">
        <flexbox
          v-if="selectionList.length === 0"
          justify="space-between"
          class="table-top">
          <div class="table-top__title">
            <span>{{ `${currentMenuData ? currentMenuData.label : ''}：${ total || 0 }` }}</span>
            <reminder
              v-if="currentMenuData && currentMenuData.type && currentMenuData.type == 'all'"
              class="all-user-reminder"
              content="Nhân viên chưa thêm phòng ban và quyền sẽ không thể đăng nhập hệ thống bình thường" />
          </div>
          <div>
            <el-button
              v-if="userSaveAuth"
              type="text"
              icon="el-icon-circle-plus"
              @click="addEmployee">Thêm nhân viên</el-button>
            <el-button
              v-if="strucSaveAuth && currentMenuData && currentMenuData.id"
              type="text"
              icon="el-icon-circle-plus"
              @click="appendStruc(currentMenuData)">Thêm phòng ban</el-button>
            <el-dropdown
              v-if="currentMenuData && currentMenuData.id && strucMoreOptions.length > 0"
              trigger="click"
              @command="strucMoreHandleClick">
              <el-button icon="el-icon-more" />
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(item, index) in strucMoreOptions"
                  :key="index"
                  :icon="item.icon | wkIconPre"
                  :command="item.type">{{ item.name }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </flexbox>
        <flexbox
          v-if="selectionList.length > 0"
          class="selection-bar">
          <div class="selected—title">Đã chọn <span class="selected—count">{{ selectionList.length }}</span> mục</div>
          <flexbox class="selection-items-box">
            <el-button
              v-for="(item, index) in selectionInfo"
              :icon="item.icon | wkIconPre"
              :key="index"
              type="primary"
              @click.native="selectionBarClick(item.type)">{{ item.name }}</el-button>
          </flexbox>
        </flexbox>
        <div class="flex-box">
          <el-table
            v-loading="loading"
            id="depTable"
            :data="tableData"
            :height="tableHeight"
            @selection-change="handleSelectionChange"
            @row-click="rowClick">
            <el-table-column
              v-if="tableUpdateAuth"
              type="selection"
              width="55" />
            <el-table-column
              prop="realname"
              width="100"
              show-overflow-tooltip
              label="Tên">
              <template slot-scope="scope">
                <div class="status-name">
                  <div :style="{'background-color' : getStatusColor(scope.row.status)}" />
                  {{ scope.row.realname }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              v-for="(item, index) in fieldList"
              :key="index"
              :width="item.width"
              :prop="item.field"
              :label="item.value"
              :formatter="tableFormatter"
              show-overflow-tooltip />
            <el-table-column />
          </el-table>
          <div class="p-contianer">
            <div class="status-des">
              <div
                v-for="item in statusOptions"
                :key="item.value"
                class="status-des-item">
                <div :style="{'background-color' : getStatusColor(item.value)}" />
                {{ item.label }}
              </div>
            </div>
            <el-pagination
              :current-page="currentPage"
              :page-sizes="pageSizes"
              :page-size.sync="pageSize"
              :total="total"
              class="p-bar"
              background
              layout="prev, pager, next, sizes, total, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange" />
          </div>
        </div>
      </div>
    </div>
    <!-- 导航新增部门 -->
    <el-dialog
      :visible.sync="depCreateDialog"
      :close-on-click-modal="false"
      :title="depCreateTitle"
      :before-close="depCreateClose"
      width="30%">
      <div class="nav-dialog-div">
        <label>{{ depCreateLabel }}：</label>
        <el-input
          v-model="depCreateLabelValue"
          :maxlength="20"
          placeholder="Vui lòng nhập nội dung" />
      </div>
      <div
        v-if="depSelect != 0"
        class="nav-dialog-div">
        <label>Phòng ban cấp trên：</label>
        <el-select
          v-model="depSelect"
          :clearable="false">
          <el-option
            v-for="item in superDepList"
            :key="item.deptId"
            :label="item.name"
            :value="item.deptId" />
        </el-select>
      </div>
      <span
        slot="footer"
        class="dialog-footer">
        <el-button @click="depCreateDialog = false">Đóng</el-button>
        <el-button
          type="primary"
          @click="submitDialog">Lưu</el-button>
      </span>
    </el-dialog>
    <!-- 详情 -->
    <employee-detail
      v-if="employeeDetailDialog"
      :data="dialogData"
      @edit="editBtn"
      @command="handleCommand"
      @hide-view="employeeDetailDialog=false" />
    <!-- 重置密码 -->
    <el-dialog
      v-loading="loading"
      :visible.sync="resetPasswordVisible"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :before-close="resetPasswordClose"
      title="Đặt lại mật khẩu"
      width="30%">
      <div class="el-password">
        <el-form
          ref="passForm"
          :model="passForm"
          :rules="rules">
          <el-form-item
            label="Mật khẩu"
            prop="password">
            <el-input
              v-model="passForm.password"
              type="password" />
          </el-form-item>
        </el-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer">
        <el-button @click="resetPasswordClose">Đóng</el-button>
        <el-button
          type="primary"
          @click="passSubmit(passForm)">Lưu</el-button>
      </span>
    </el-dialog>

    <!-- 重置登录账号 -->
    <el-dialog
      v-loading="loading"
      :visible.sync="resetUserNameVisible"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :before-close="()=>{resetUserNameVisible = false}"
      title="Đặt lại tài khoản đăng nhập"
      width="30%">
      <div class="el-password">
        <el-form
          ref="resetUserNameForm"
          :model="resetUserNameForm"
          :rules="dialogRules">
          <el-form-item
            label="Tài khoản mới (số điện thoại)"
            prop="username">
            <el-input v-model="resetUserNameForm.username" />
          </el-form-item>
          <el-form-item
            label="Mật khẩu"
            prop="password">
            <el-input
              v-model="resetUserNameForm.password"
              type="password" />
          </el-form-item>

          <template v-if="isManageReset">
            <el-popover
              v-model="slideVerifyShow"
              :disabled="slideVerifyPass || !canSlideVerify"
              placement="top-start"
              width="332"
              popper-class="no-padding-popover"
              trigger="click">
              <slide-verify
                :phone="resetUserNameForm.username"
                slider-text="Vuốt sang phải"
                @success="sliderSuccess"
                @fail="sliderFail"
                @refresh="sliderRefresh"
                @close="slideVerifyShow = false" />
              <div
                slot="reference"
                :class="{success: slideVerifyPass}"
                class="verify-picture">
                <template v-if="!slideVerifyPass">
                  <img
                    src="~@/assets/login/verify_picture.png"
                    alt=""
                    class="icon">
                  <span class="text">Nhấp để hoàn tất xác minh</span>
                </template>
                <template v-else>
                  <img
                    src="~@/assets/login/verify_success.png"
                    alt=""
                    class="icon">
                  <span class="text">Đã xác minh thành công</span>
                </template>
              </div>
            </el-popover>

            <el-form-item>
              <div class="sms-box">
                <el-input
                  ref="smscode"
                  v-model.trim="resetUserNameForm.smscode"
                  placeholder="Vui lòng nhập mã xác minh SMS" />
                <el-button
                  :disabled="codeTime !== codeSecond"
                  @click="getSmsCode">
                  <div class="btn-content">
                    <template v-if="codeTime === codeSecond">
                      <!--<span class="icon wk wk-shouji" />-->
                      <span>Lấy mã xác minh</span>
                    </template>
                    <template v-else>
                      <span>Gửi lại ({{ codeSecond }}s)</span>
                    </template>
                  </div>
                </el-button>
              </div>
            </el-form-item>
          </template>
        </el-form>
        <div
          class="tips"
          style="margin-top: 20px;">Sau khi thiết lập lại tài khoản đăng nhập, nhân viên cần đăng nhập bằng tài khoản mới. Vui lòng thông báo cho nhân viên kịp thời để đảm bảo sử dụng bình thường</div>
      </div>
      <span
        slot="footer"
        class="dialog-footer">
        <el-button @click="()=>{resetUserNameVisible = false}">Đóng</el-button>
        <el-button
          type="primary"
          @click="passUserNameSubmit(resetUserNameForm)">Lưu</el-button>
      </span>
    </el-dialog>

    <!-- 新建和编辑 -->
    <el-dialog
      v-loading="loading"
      v-if="employeeCreateDialog"
      :title="dialogTitle"
      :visible.sync="employeeCreateDialog"
      :close-on-click-modal="false"
      :modal-append-to-body="true"
      :append-to-body="true"
      :before-close="newHandleClose"
      width="60%">
      <el-form
        ref="dialogRef"
        :inline="true"
        :model="formInline"
        :rules="dialogRules"
        class="new-dialog-form"
        label-width="80px"
        label-position="top">
        <el-form-item
          v-for="(item, index) in tableList"
          :label="item.value"
          :prop="item.field"
          :key="index">
          <span slot="label">{{ item.value }}</span>
          <el-tooltip
            v-if="item.tips"
            slot="label"
            :content="item.tips"
            effect="dark"
            placement="top">
            <i class="wukong wukong-help_tips" />
          </el-tooltip>
          <template v-if="item.type == 'select'">
            <el-select
              v-model="formInline[item.field]"
              filterable>
              <el-option
                v-for="optionItem in optionsList[item.field].list"
                :key="optionItem.id"
                :label="optionItem.name"
                :value="optionItem.id" />
            </el-select>
          </template>
          <template v-else-if="item.type == 'selectCheckout'">
            <el-select
              v-model="formInline[item.field]"
              :popper-append-to-body="false"
              popper-class="select-popper-class"
              filterable
              multiple>
              <el-option-group
                v-for="group in groupsList"
                :key="group.pid"
                :label="group.name">
                <el-option
                  v-for="item in group.list"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId" />
              </el-option-group>
            </el-select>
          </template>
          <el-input
            v-else
            v-model="formInline[item.field]"
            :maxlength="100"
            :disabled="dialogTitle == 'Chỉnh sửa tài khoản nhân viên' && item.field == 'username'" />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer">
        <el-button
          type="primary"
          @click="newDialogSubmit">Lưu</el-button>
        <el-button @click="employeeCreateDialog = false">Hủy</el-button>
      </span>
    </el-dialog>

    <!-- 批量导入 -->
    <bulk-import-user
      :show="bulkImportShow"
      @close="bulkImportShow=false"
      @success="refreshUserList" />
    <!-- 角色编辑 -->
    <edit-role-dialog
      v-if="editRoleDialogShow"
      :user-show="editRoleType === 'copyRole'"
      :selection-list="selectionList"
      :visible.sync="editRoleDialogShow"
      @change="getUserList"
    />
  </div>
</template>

<script>
import {
  depDeleteAPI,
  depEditAPI,
  depSaveAPI,
  userAddAPI,
  userEditAPI,
  roleListAPI,
  adminUsersUpdatePwdAPI,
  adminUsersUsernameEditAPI,
  adminUsersManagerUsernameEditAPI,
  usersEditStatusAPI
} from '@/api/admin/employeeDep'

import { userListAPI, depListAPI } from '@/api/common' // 直属上级接口
import { sendSmsAPI } from '@/api/login'

import { mapGetters } from 'vuex'

import BulkImportUser from './components/BulkImportUser'
import EmployeeDetail from './components/EmployeeDetail'
import XrHeader from '@/components/XrHeader'
import Reminder from '@/components/Reminder'
import SlideVerify from '@/components/SlideVerify'
import EditRoleDialog from './components/EditRoleDialog'

// import { chinaMobileRegex, objDeepCopy } from '@/utils'
import { objDeepCopy } from '@/utils'

export default {
  /** 系统管理 的 员工部门管理 */
  name: 'EmployeeDep',
  components: {
    EmployeeDetail,
    BulkImportUser,
    XrHeader,
    Reminder,
    SlideVerify,
    EditRoleDialog
  },
  data() {
    return {
      employeeMenu: [
        {
          icon: 'wk wk-employees',
          label: 'Tất cả nhân viên',
          type: 'all'
        },
        {
          icon: 'wk wk-new-employee',
          label: 'Nhân viên mới',
          type: 'new'
        },
        {
          icon: 'wk wk-active-employee',
          label: 'Kích hoạt tài khoản',
          type: 'active'
        },
        {
          icon: 'wk wk-inactive-employee',
          label: 'Hủy kích hoạt tài khoản',
          type: 'inactive'
        },
        {
          icon: 'wk wk-disable-employees',
          label: 'Khóa tài khoản',
          type: 'disable'
        }
      ],
      // 右边导航
      depCreateTitle: 'Mới',
      depCreateDialog: false, // 控制部门新增 编辑 数据
      depSelect: '',
      // 上级部门
      superDepList: [],
      depCreateLabel: '',
      allDepData: [], // 包含全部部门信息
      showDepData: [],
      depLoading: false, // 左侧部门loading效果
      // 列表
      loading: false, // 表的加载动画
      searchInput: '', // 搜索
      statusOptions: [
        { value: '0', label: 'Chưa kích hoạt' },
        { value: '1', label: 'Kích hoạt' },
        { value: '2', label: 'Bị khóa' }
      ],
      // selectModel: '', // 状态值 用于筛选
      /** 列表 */
      fieldList: [
        { field: 'username', value: 'Tên đăng nhập (số điện thoại)', width: '150' },
        { field: 'sex', value: 'Giới tính', type: 'select', width: '50' },
        { field: 'email', value: 'Email', width: '150' },
        { field: 'deptName', value: 'Phòng ban', type: 'select', width: '100' },
        { field: 'post', value: 'Chức vụ', width: '150' },
        {
          field: 'parentName',
          value: 'Quản lý cấp trên',
          type: 'select',
          width: '150'
        },
        {
          field: 'roleName',
          value: 'Quyền',
          type: 'selectCheckout',
          width: '150'
        }
      ],
      selectionList: [], // 批量勾选数据
      tableData: [],
      tableHeight: document.documentElement.clientHeight - 240, // 表的高度
      /** 分页逻辑 */
      currentMenuData: null,
      // structureValue: '', // 左侧列表选中的值 用于筛选
      currentPage: 1,
      pageSize: 15,
      pageSizes: [15, 30, 45, 60],
      total: 0,
      /** ** */
      employeeDetailDialog: false,
      dialogData: {},
      // 新建和编辑
      employeeCreateDialog: false,
      dialogTitle: 'Nhân viên mới',
      formInline: {},
      depCreateLabelValue: '',
      // 编辑部门时id
      treeEditId: '',
      optionsList: {
        deptId: {
          field: 'deptId',
          list: []
        },
        parentId: {
          field: 'parentId',
          list: [{ id: 0, name: 'xin vui lòng chọn' }]
        },
        sex: {
          field: 'sex',
          list: [
            { id: 0, name: 'xin vui lòng chọn' },
            { id: 1, name: 'Nam' },
            { id: 2, name: 'Nữ' }
          ]
        }
      },
      groupsList: [],
      // 重置密码
      resetPasswordVisible: false,
      rules: {
        password: [
          { required: true, message: 'Xin vui lòng nhập mật khẩu', trigger: 'blur' },
          {
            pattern: /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/,
            message: 'Mật khẩu bao gồm 6-20 chữ cái và số'
          }
        ],
        username: [
          { required: true, message: 'Số điện thoại không được để trống', trigger: 'blur' }
        ]
      },
      passForm: {},
      dialogRules: {
        realname: [
          { required: true, message: 'Họ và tên không được để trống', trigger: 'blur' }
        ],
        password: [
          { required: true, message: 'Mật khẩu không được để trống', trigger: 'blur' },
          {
            pattern: /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/,
            message: 'Mật khẩu bao gồm 6-20 chữ cái và số'
          }
        ],
        username: [
          { required: true, message: 'Tên đăng nhập (Số điện thoại) không được để trống', trigger: 'blur' },
          {
            pattern: /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/,
            message: 'Mật khẩu bao gồm 6-20 chữ cái và số',
            trigger: 'blur'
          }
        ],
        email: [
          {
            pattern: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
            message: 'Vui lòng nhập đúng định dạng email',
            trigger: 'blur'
          }
        ],
        // parentId: [
        //   { required: true, message: 'Cấp trên trực tiếp không được để trống', trigger: 'change' }
        // ],
        deptId: [
          { required: true, message: 'Phòng ban không được để trống', trigger: 'change' }
        ],
        roleId: [{ required: true, message: 'Không được để trống vai trò', trigger: 'change' }]
      },
      // 重置登录账号
      resetUserNameVisible: false,
      resetUserNameForm: {
        username: '',
        password: ''
      },
      isManageReset: false, // 是管理员重置密码
      slideVerifyShow: false,
      slideVerifyPass: false,
      codeTime: 60,
      codeSecond: 60,
      codeTimer: null,
      // 批量导入
      bulkImportShow: false,
      // 角色操作
      editRoleType: '',
      editRoleDialogShow: false
    }
  },
  computed: {
    ...mapGetters(['manage']),
    // 员工创建权限
    userSaveAuth() {
      return this.manage && this.manage.users && this.manage.users.userSave
    },
    // 员工编辑操作权限
    userUpdateAuth() {
      return this.manage && this.manage.users && this.manage.users.userUpdate
    },
    // 员工禁用启用权限
    userEnablesAuth() {
      return this.manage && this.manage.users && this.manage.users.userEnables
    },
    // 员工列表的勾选编辑
    tableUpdateAuth() {
      return this.userEnablesAuth && this.userUpdateAuth
    },
    // 部门新建权限
    strucSaveAuth() {
      return this.manage && this.manage.users && this.manage.users.deptSave
    },
    // 部门编辑权限
    strucUpdateAuth() {
      return this.manage && this.manage.users && this.manage.users.deptUpdate
    },
    // 部门删除权限
    strucDeleteAuth() {
      return this.currentMenuData && this.currentMenuData.pid !== 0 && this.manage && this.manage.users && this.manage.users.deptDelete
    },
    // 员工编辑角色权限
    userUpdateRoleAuth() {
      return this.manage && this.manage.permission
    },
    /**
     * 部门更多操作
     */
    strucMoreOptions() {
      const moreList = []
      if (this.strucUpdateAuth) {
        moreList.push({ type: 'edit', name: 'Chỉnh sửa', icon: 'edit' })
      }

      if (this.strucDeleteAuth) {
        moreList.push({ type: 'delete', name: 'Xóa', icon: 'delete' })
      }

      return moreList
    },

    selectionInfo: function() {
      let temps = []
      if (this.userEnablesAuth) {
        temps = [
          {
            name: 'Khóa',
            type: 'lock',
            icon: 'wk wk-remove'
          },
          {
            name: 'Mở khóa',
            type: 'unlock',
            icon: 'wk wk-activation'
          }
        ]
      }

      if (this.userUpdateAuth) {
        if (this.selectionList.length === 1) {
          temps = temps.concat([
            {
              name: 'Chỉnh sửa',
              type: 'edit',
              icon: 'wk wk-edit'
            },
            {
              name: 'Khôi phục mật khẩu',
              type: 'reset',
              icon: 'wk wk-circle-password'
            },
            {
              name: 'Khôi phục tên đăng nhập',
              type: 'resetName',
              icon: 'wk wk-reset'
            }
          ])
        } else {
          temps = temps.concat([
            {
              name: 'Khôi phục mật khẩu',
              type: 'reset',
              icon: 'wk wk-circle-password'
            }
          ])
        }
      }

      if (this.userUpdateRoleAuth) {
        if (this.selectionList.length === 1) {
          temps.push({
            name: 'Sao chép quyền',
            type: 'copyRole',
            icon: 'wk wk-icon-double-note'
          })
        }
        temps.push({
          name: 'Chỉnh sửa quyền',
          type: 'editRole',
          icon: 'wk wk-edit'
        })
      }


      return temps
    },
    /** 添加列表 */
    tableList: function() {
      if (this.dialogTitle === 'Nhân viên mới') {
        return [
          { field: 'username', value: 'Tên đăng nhập (sô điện thoại)' },
          { field: 'password', value: 'Mật khẩu' },
          { field: 'realname', value: 'Họ và tên' },
          { field: 'sex', value: 'Giới tính', type: 'select' },
          { field: 'email', value: 'Email' },
          { field: 'deptId', value: 'Phòng ban', type: 'select' },
          { field: 'post', value: 'Chức vụ' },
          { field: 'parentId', value: 'Quản lý', type: 'select' },
          { field: 'roleId', value: 'Quyền', type: 'selectCheckout' }
        ]
      } else {
        return [
          {
            field: 'username',
            value: 'Tên đăng nhập (sô điện thoại)',
            tips: 'Nếu bạn cần sửa đổi tên đăng nhập, vui lòng kiểm tra nhân viên trong danh sách và hoạt động'
          },
          { field: 'realname', value: 'Họ và tên' },
          { field: 'sex', value: 'Giới tính', type: 'select' },
          { field: 'email', value: 'Email' },
          { field: 'deptId', value: 'Phòng ban', type: 'select' },
          { field: 'post', value: 'Chức vụ' },
          { field: 'parentId', value: 'Quản lý', type: 'select' },
          { field: 'roleId', value: 'Quyền', type: 'selectCheckout' }
        ]
      }
    },

    /**
     * 能进行滑动验证
     */
    canSlideVerify() {
      return true// chinaMobileRegex.test(this.resetUserNameForm.username)
    }
  },
  mounted() {
    var self = this
    /** 控制table的高度 */
    window.onresize = function() {
      self.tableHeight = document.documentElement.clientHeight - 240
    }

    // 部门树形列表
    this.currentMenuData = this.employeeMenu[0]
    this.getDepTreeList()
    this.getUserList()
  },
  methods: {
    /**
     * 选择部门
     */
    changeDepClick(data) {
      this.currentMenuData = data
      // this.structureValue = data.id
      this.refreshUserList()
    },

    /**
     * 选择员工
     */
    changeUserClick(data) {
      // this.structureValue = ''
      this.currentMenuData = data
      this.refreshUserList()
    },

    /**
     * 刷新员工列表
     */
    refreshUserList() {
      this.currentPage = 1
      this.getUserList()
    },

    /**
     * 用户列表
     */
    getUserList() {
      this.loading = true
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        realname: this.searchInput
      }

      if (this.currentMenuData) {
        // 员工有type值
        if (this.currentMenuData.type) {
          if (this.currentMenuData.type == 'active') {
            params.status = 1
          } else {
            params.label = {
              all: 0,
              new: 1,
              inactive: 2,
              disable: 3
            }[this.currentMenuData.type]
          }
        } else if (this.currentMenuData.id) {
          params.deptId = this.currentMenuData.id
        }
      }
      userListAPI(params)
        .then(res => {
          this.tableData = res.data.list
          this.total = res.data.totalRow
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 头部搜索
     */
    headerSearch(search) {
      this.searchInput = search
      this.refreshUserList()
    },

    /**
     * 批量导入
     */
    bulkImportClick() {
      this.bulkImportShow = true
    },

    // /**
    //  * 展开闭合操作
    //  */
    // handleExpand(type, node, data) {
    //   if (type == 'close') {
    //     if (data.children) {
    //       node.expanded = false
    //     }
    //   } else if (type == 'open') {
    //     node.expanded = true
    //   }
    // },
    handleClose() {
      this.employeeDetailDialog = false
    },
    // 第一列点击事件
    rowClick(row, column, event) {
      this.dialogData = row
      if (column.property == 'realname') {
        this.employeeDetailDialog = true
      }
    },
    // 新建和编辑
    newHandleClose() {
      this.employeeCreateDialog = false
    },
    // 新建用户
    addEmployee() {
      this.getHandleEmployeeRelateData()
      this.dialogTitle = 'Nhân viên mới'
      this.formInline = {
        roleId: [],
        deptId:
          this.currentMenuData && this.currentMenuData.id
            ? this.currentMenuData.id
            : ''
      }
      this.employeeCreateDialog = true
    },

    /**
     * 新建或编辑员工 需要获取的信息
     */
    getHandleEmployeeRelateData() {
      this.getSelectUserList() // 直属上级列表
      this.getDepList()
      this.getRoleList()
    },

    // 详情 -- 编辑用户
    editBtn() {
      this.dialogTitle = 'Chỉnh sửa nhân viên'
      this.getHandleEmployeeRelateData()
      var detail = {}
      for (let index = 0; index < this.tableList.length; index++) {
        const element = this.tableList[index]
        if (element.field !== 'password') {
          if (element.field === 'roleId') {
            detail[element.field] = this.dialogData.roleId
              ? this.dialogData.roleId
                .split(',')
                .map(function(item, index, array) {
                  return parseInt(item)
                })
              : []
          } else if (element.field === 'parentId') {
            detail.parentId = this.dialogData.parentId || ''
          } else if (element.field === 'deptId') {
            detail.deptId = this.dialogData.deptId
          } else {
            detail[element.field] = this.dialogData[element.field]
          }
        }
      }
      detail['userId'] = this.dialogData.userId
      this.formInline = detail
      this.employeeCreateDialog = true
    },

    /**
     * 新建编辑员工的  部门信息
     */
    getDepList() {
      depListAPI()
        .then(response => {
          this.optionsList['deptId'].list = response.data
        })
        .catch(() => {})
    },

    /**
     * 获取角色列表
     */
    getRoleList() {
      // 角色列表
      roleListAPI()
        .then(res => {
          this.groupsList = res.data
        })
        .catch(() => {})
    },

    /**
     * 创建部门
     */
    addStruc() {
      const id =
        this.allDepData && this.allDepData.length ? this.allDepData[0].deptId : ''
      if (id) {
        this.depCreateLabelValue = ''
        this.depCreateLabel = 'Phòng ban mới'
        this.depCreateTitle = 'Phòng ban mới'
        this.depSelect = id
        this.getStructuresListBySuperior({ id: id, type: 'save' })
        this.depCreateDialog = true
      }
    },

    /**
     * 部门更多操作
     */
    strucMoreHandleClick(command) {
      if (command == 'edit') {
        this.editStruc(this.currentMenuData)
      } else if (command == 'delete') {
        this.deleteStruc(this.currentMenuData)
      }
    },

    /**
     * 新增部门
     */
    appendStruc(data) {
      this.depCreateLabelValue = ''
      this.depCreateLabel = 'Phòng ban mới'
      this.depCreateTitle = 'Phòng ban mới'
      this.depSelect = data.deptId
      this.getStructuresListBySuperior({ id: data.id, type: 'save' })
      this.depCreateDialog = true
    },

    /**
     * 获取新增部门 上级部门信息
     */
    getStructuresListBySuperior(data) {
      this.superDepList = []
      depListAPI(data)
        .then(response => {
          this.superDepList = response.data
        })
        .catch(() => {})
    },

    /**
     * 编辑部门
     */
    editStruc(data) {
      this.depCreateLabelValue = data.label
      this.treeEditId = data.id
      this.depSelect = data.pid
      this.depCreateTitle = 'Phòng ban mới'
      this.depCreateLabel = 'Phòng ban mới'
      this.getStructuresListBySuperior({ id: data.id, type: 'update' })
      this.depCreateDialog = true
    },

    /**
     * 删除部门
     */
    deleteStruc(data) {
      this.$confirm(`Xác nhận xóa phòng ban ${data.name}？`, 'Thông báo', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          depDeleteAPI({ id: data.id })
            .then(res => {
              this.getDepTreeList()
              this.currentMenuData = this.employeeMenu[0]
              this.$message.success('Đã xóa thành công')
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
    },
    // 关闭新增或编辑
    depCreateClose() {
      this.depCreateDialog = false
    },
    // 新增或编辑确定按钮
    submitDialog() {
      if (this.depCreateLabel == 'Phòng ban mới') {
        depSaveAPI({ name: this.depCreateLabelValue, pid: this.depSelect }).then(
          res => {
            this.getDepList() // 增加了新部门 刷新数据
            this.getDepTreeList()
            this.depCreateClose()
          }
        )
      } else {
        depEditAPI({
          name: this.depCreateLabelValue,
          deptId: this.treeEditId,
          pid: this.depSelect
        }).then(res => {
          this.$message.success('Thành công')
          this.getDepTreeList()
          this.depCreateClose()
        })
      }
    },
    // 获取树形列表
    getDepTreeList() {
      this.depLoading = true
      depListAPI({ type: 'tree' })
        .then(response => {
          this.allDepData = response.data
          this.showDepData = response.data || []
          this.depLoading = false
        })
        .catch(() => {
          this.depLoading = false
        })
    },

    // 用户新建
    newDialogSubmit() {
      this.$refs.dialogRef.validate(valid => {
        if (valid) {
          if (this.dialogTitle == 'Nhân viên mới') {
            this.loading = true
            const formInline = objDeepCopy(this.formInline)
            formInline.roleId = formInline.roleId.join(',')
            userAddAPI(formInline)
              .then(res => {
                this.$message.success('Thành công')
                this.employeeCreateDialog = false
                this.refreshUserList()
                this.getSelectUserList()
                this.loading = false
              })
              .catch(() => {
                this.loading = false
              })
          } else {
            this.loading = true
            const formInline = objDeepCopy(this.formInline)
            formInline.roleId = formInline.roleId.join(',')
            userEditAPI(formInline)
              .then(res => {
                if (this.employeeDetailDialog) {
                  this.employeeDetailDialog = false
                }
                this.employeeCreateDialog = false
                this.$message.success('Thành công')
                this.getUserList()
                this.getSelectUserList()
                this.loading = false
              })
              .catch(() => {
                this.loading = false
              })
          }
        } else {
          // 提示第一个error
          if (this.$refs.dialogRef.fields) {
            for (
              let index = 0;
              index < this.$refs.dialogRef.fields.length;
              index++
            ) {
              const ruleField = this.$refs.dialogRef.fields[index]
              if (ruleField.validateState == 'error') {
                this.$message.error(ruleField.validateMessage)
                break
              }
            }
          }
          return false
        }
      })
    },
    // 详情里面点击事件
    handleCommand(command) {
      switch (command) {
        case 'reset':
          // 当前登录用户ID
          this.passForm = {
            password: ''
          }
          this.resetPasswordVisible = true
          break
        case 'status':
          usersEditStatusAPI({
            ids: [this.dialogData.userId],
            status: this.dialogData.status === 0 ? 1 : 0
          }).then(res => {
            this.employeeDetailDialog = false
            this.$message.success('Thành công')
            this.getUserList()
          })
          break
      }
    },
    /** 操作 */
    selectionBarClick(type) {
      var ids = this.selectionList
        .map(function(item, index, array) {
          return item.userId
        })
        .join(',')
      if (type === 'lock' || type === 'unlock') {
        var message = type === 'lock' ? 'Khóa' : 'Mở khóa'
        this.$confirm('Xác nhận ' + message + ' nhân viên?', 'Thông báo', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            this.loading = true
            usersEditStatusAPI({
              ids: ids.split(','),
              status: type === 'unlock' ? 1 : 0
            })
              .then(res => {
                this.loading = false
                this.$message.success('Thành công')
                this.getUserList()
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
      } else if (type === 'reset') {
        this.resetPasswordVisible = true
      } else if (type === 'resetName') {
        // 重置验证码弹窗变量
        this.isManageReset = false
        this.slideVerifyPass = false
        this.slideVerifyShow = false
        this.resetUserNameForm = {
          username: '',
          password: ''
        }
        this.resetUserNameVisible = true
      } else if (type === 'edit') {
        this.dialogData = this.selectionList[0]

        this.dialogTitle = 'Chỉnh sửa nhân viên'
        this.getHandleEmployeeRelateData()
        var detail = {}
        for (let index = 0; index < this.tableList.length; index++) {
          const element = this.tableList[index]
          if (element.field !== 'password') {
            if (element.field === 'roleId') {
              detail[element.field] = this.dialogData.roleId
                ? this.dialogData.roleId
                  .split(',')
                  .map(function(item, index, array) {
                    return parseInt(item)
                  })
                : []
            } else if (element.field === 'parentId') {
              detail.parentId = this.dialogData.parentId
            } else if (element.field === 'deptId') {
              detail.deptId = this.dialogData.deptId
            } else {
              detail[element.field] = this.dialogData[element.field]
            }
          }
        }
        detail['userId'] = this.dialogData.userId
        this.formInline = detail
        this.employeeCreateDialog = true
      } else if (type === 'editRole' || type === 'copyRole') {
        this.editRoleType = type
        this.editRoleDialogShow = true
      }
    },
    // 重置密码 -- 关闭按钮
    resetPasswordClose() {
      this.resetPasswordVisible = false
    },
    // 重置密码 -- 确定按钮
    passSubmit(val) {
      this.$refs.passForm.validate(valid => {
        if (valid) {
          var ids = []
          if (this.selectionList.length > 0) {
            ids = this.selectionList
              .map(function(item, index, array) {
                return item.userId
              })
          } else {
            ids.push(this.dialogData.userId)
          }
          val.ids = ids
          this.loading = true
          adminUsersUpdatePwdAPI(val)
            .then(res => {
              this.$message.success('Thành công')
              this.resetPasswordClose()
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          return false
        }
      })
    },
    /**
     * 重置登录账号
     */
    passUserNameSubmit(val) {
      this.$refs.resetUserNameForm.validate(valid => {
        if (valid) {
          if (this.selectionList.length > 0) {
            val.id = this.selectionList[0].userId
            if (this.isManageReset) {
              if (!this.resetUserNameForm.smscode) {
                this.$message.error('vui lòng nhập mã xác nhận')
                return
              }
              this.loading = true
              adminUsersManagerUsernameEditAPI(val)
                .then(res => {
                  this.$message.success('Thành công')
                  this.resetUserNameVisible = false
                  this.loading = false
                  this.refreshUserList()
                })
                .catch(() => {
                  this.loading = false
                })
            } else {
              this.loading = true
              adminUsersUsernameEditAPI(val)
                .then(res => {
                  if (res.status === 3) {
                    this.$message.error('Hệ thống hiện tại đã đăng ký tài khoản (số điện thoại di động), việc đặt lại yêu cầu mã xác minh số điện thoại di động mới')
                    this.isManageReset = true
                  } else {
                    this.$message.success('Thành công')
                    this.resetUserNameVisible = false
                    this.refreshUserList()
                  }
                  this.loading = false
                })
                .catch(() => {
                  this.loading = false
                })
            }
          }
        } else {
          return false
        }
      })
    },

    sliderSuccess() {
      setTimeout(() => {
        this.slideVerifyPass = true
        this.slideVerifyShow = false
      }, 500)
    },

    sliderFail() {},
    sliderRefresh() {},

    getSmsCode() {
      if (!this.canSlideVerify) {
        this.$message.error('Xin vui lòng nhập một số điện thoại hợp lệ')
        return
      }

      if (!this.slideVerifyPass) {
        this.$message.error('Vui lòng trượt xác minh trước')
        return
      }

      sendSmsAPI({
        telephone: this.resetUserNameForm.username,
        type: 1 // 注册
      })
        .then(() => {
          this.startTimer()
        })
        .catch()
    },

    /**
     * 发送短信倒计时
     */
    startTimer() {
      if (this.codeSecond === this.codeTime) {
        this.codeSecond--
      }
      this.codeTimer = setTimeout(() => {
        this.codeSecond--
        if (this.codeSecond >= 0) {
          this.startTimer()
        } else {
          clearTimeout(this.codeTimer)
          this.codeTimer = null
          this.codeSecond = this.codeTime
        }
      }, 1000)
    },

    /**
     * 更改每页展示数量
     */
    handleSizeChange(val) {
      this.pageSize = val
      this.refreshUserList()
    },

    /**
     * 更改当前页数
     */
    handleCurrentChange(val) {
      this.currentPage = val
      this.getUserList()
    },
    // 勾选
    handleSelectionChange(val) {
      this.selectionList = val // 勾选的行
    },

    /** 获取选择直属上级列表 */
    getSelectUserList() {
      this.loading = true
      userListAPI({ pageType: 0 })
        .then(res => {
          this.optionsList['parentId'].list = [{
            id: '',
            name: 'xin vui lòng chọn'
          }]
          for (const i of res.data.list) {
            this.optionsList['parentId'].list.push({
              id: i.userId,
              name: i.realname
            })
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 获取状态颜色 0 禁用 1 启用 2未激活
    getStatusColor(status) {
      if (status == 0) {
        return '#FF6767'
      } else if (status == 1) {
        return '#46CDCF'
      } else if (status == 2) {
        return '#CCCCCC'
      }
    },
    // 列表信息格式化
    tableFormatter(row, column) {
      if (column.property == 'sex') {
        return { 1: 'Nam', 2: 'Nữ' }[row.sex]
      }
      return row[column.property]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/views/login/index.scss';
.verify-picture {
  margin-top: 20px;
}

.sms-box {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  .el-input {
    width: 210px;
  }
  .el-button {
    flex: 1;
    font-size: 12px;
    color: white;
    background-color: #3e6bea;
    border-radius: $xr-border-radius-base;
    border: 0 none;
    padding: 0;
    margin-left: 20px;

    .btn-content {
      width: 100%;
      height: 42px;
      @include center;
      .icon {
        font-size: 16px;
        margin-right: 5px;
      }
    }
    &:hover,
    &.is-disabled,
    &.is-disabled:hover {
      color: white;
      border-color: #517aec;
      background-color: #517aec;
    }
  }
}

.employee-dep-management {
  padding: 0 15px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.system-content {
  position: relative;
  height: 100%;
  flex: 1;
  display: flex;
  overflow: hidden;
}
.system-nav {
  width: 280px;
  height: 100%;
  overflow: auto;
  margin-right: 10px;
  background: #fff;
  border: 1px solid $xr-border-line-color;
  border-radius: $xr-border-radius-base;

  &__title {
    padding: 15px;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid $xr-border-line-color;
  }

  &__content {
    overflow: auto;
    height: calc(100% - 50px);
    overflow-y: overlay;
    overflow-x: overlay;
  }
}
// 菜单
.section {
  position: relative;
  &__title {
    position: relative;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    padding: 15px;
    .add-btn {
      position: absolute;
      right: 10px;
      top: 10px;
    }
  }
}

.menu-item {
  position: relative;
  cursor: pointer;
  padding: 12px 15px;
  color: #333;

  &__icon {
    font-size: 14px;
    margin-right: 8px;
    color: #8a94a6;
  }

  &__content {
    font-size: 14px;
  }
}

.menu-item:hover,
.menu-item.is-select {
  background-color: $xr--background-color-base;
}

.menu-item:hover::before,
.menu-item.is-select::before {
  content: ' ';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 2px;
  background-color: #5383ed;
}

.system-view-table {
  background: #fff;
  border: 1px solid $xr-border-line-color;
  border-radius: $xr-border-radius-base;
  position: absolute;
  top: 0;
  left: 295px;
  bottom: 0;
  right: 0;
}

.table-top {
  padding: 0 30px;
  height: 50px;

  &__title {
    font-size: 16px;
    color: #333;
  }

  .el-dropdown {
    margin-left: 7px;
  }
}

.all-user-reminder {
  width: auto;
  margin-left: 5px;
  display: inline-block;
}

.el-table /deep/ .el-table-column--selection .cell {
  padding-left: 14px;
}

// .status {
//   display: inline-block;
//   margin-left: 50px;
// }
// .status > span {
//   margin-right: 10px;
// }

.status-name {
  div {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 3px;
  }
  color: $xr-color-primary;
  cursor: pointer;
}
/* 详情 */
.employee-dep-management /deep/ .el-dialog__wrapper {
  margin-top: 60px !important;
}

.el-form {
  padding: 0;
}

/* 新建和编辑 */
.new-dialog-form {
  height: 47vh;
  overflow-y: auto;
  padding: 20px;
}
.new-dialog-form /deep/ .el-form-item {
  width: 50%;
  margin: 0;
  padding-bottom: 10px;
}
.new-dialog-form /deep/ .el-form-item .el-form-item__label {
  padding: 0;
}
.new-dialog-form {
  /deep/ .el-form-item:nth-child(even) {
    padding-left: 15px;
  }

  /deep/ .el-form-item:nth-child(odd) {
    padding-right: 15px;
  }
}
.nav-dialog-div {
  margin-bottom: 20px;
}
.nav-dialog-div {
  .el-input,
  .el-select {
    width: calc(100% - 80px);
  }
}
/** 树形结构 */
.el-tree /deep/ .el-tree-node__expand-icon {
  display: none;
}
.el-tree /deep/ .el-tree-node__content {
  height: 40px;

  .node-data {
    // .node-img {
    //   width: 15px;
    //   height: 15px;
    //   display: block;
    //   margin-right: 8px;
    //   margin-left: 24px;
    // }
    height: 40px;
    padding: 0 15px;
    position: relative;
    border-radius: $xr-border-radius-base;

    .wk {
      font-size: 14px;
      color: #8a94a6;
      flex-shrink: 0;
    }

    .wk-department {
      margin-right: 8px;
    }

    &__mark {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #e6e6e6;
      margin-right: 8px;
      flex-shrink: 0;
    }

    &__label {
      flex: 1;
      color: #333;
      font-size: 14px;
      margin-right: 8px;
    }

    .wk-up-unfold {
      margin-left: 8px;
      transition: transform 0.3s;
    }

    .wk-up-unfold.is-close {
      transform: rotateZ(180deg);
    }
    // .node-label-set {
    //   display: none;
    // }
  }

  .node-data.is-current,
  .node-data:hover {
    background-color: $xr--background-color-base;
  }

  // .node-data:hover .node-label-set {
  //   display: block;
  // }
}
// .el-tree /deep/ .el-tree-node.is-current > .el-tree-node__content {
//   background-color: #ebf3ff;
//   border-right: 2px solid #46cdcf;
//   .node-label-set {
//     display: block;
//   }
// }
.system-nav /deep/ .el-tree-node > .el-tree-node__children {
  overflow: visible;
}
.system-nav /deep/ .el-tree > .el-tree-node {
  min-width: 100%;
  display: inline-block !important;
}

.system-nav
  /deep/
  .el-tree--highlight-current
  .el-tree-node.is-current
  > .el-tree-node__content {
  background-color: white;
}

.system-nav /deep/ .el-tree-node__content:hover {
  background-color: white;
}

/* 搜索框图标按钮 */
.icon-search .el-icon-search {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 40px;
  line-height: 40px;
  text-align: center;
  cursor: pointer;
  font-size: 20px;
  color: #ccc;
}
/* 设置flex布局 */
.flex-index {
  display: flex;
  flex-direction: column;
}
/* 设置占位 */
.flex-box {
  flex: 1;
  // border-bottom: 1px solid $xr-border-line-color;
}
/* 搜索框 */
.icon-search {
  width: 280px;
  position: relative;
}
.new-dialog-form /deep/ .el-select {
  display: block;
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

/** 勾选操作 */
.selection-bar {
  font-size: 12px;
  height: 50px;
  padding: 0 20px;
  color: #777;

  .selected—title {
    flex-shrink: 0;
    padding-right: 20px;
    color: #333;
    .selected—count {
      color: $xr-color-primary;
    }
  }
}

.selection-items-box {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 15px;
  .el-button {
    color: #666;
    background-color: $xr--background-color-base;
    border-color: $xr--background-color-base;
    font-size: 12px;
    height: 28px;
    border-radius: 14px;
    /deep/ i {
      font-size: 12px;
      margin-right: 5px;
    }
  }

  .el-button--primary:hover {
    background: $xr-color-primary;
    border-color: $xr-color-primary;
    color: #ffffff;
  }

  .el-button + .el-button {
    margin-left: 15px;
  }
}
.new-dialog-form
  /deep/
  .el-form-item
  .el-form-item__content
  .el-select-group__wrap:not(:last-of-type)::after {
  display: none;
}
.new-dialog-form /deep/ .el-form-item .el-form-item__content .el-select-group {
  padding-left: 10px;
}
.new-dialog-form
  /deep/
  .el-form-item
  .el-form-item__content
  .el-select-group__title {
  border-bottom: 1px solid #e4e7ed;
  padding: 0 0 7px;
  margin: 0 20px 5px;
}

.status-des {
  font-size: 12px;
  color: #777777;
  margin: 0 5px;
  position: absolute;
  left: 0;
  top: 7px;
  .status-des-item {
    margin: 8px;
    display: inline-block;
    div {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 3px;
      margin-right: 5px;
    }
  }
}

// 提示
// 提示标志
.wukong-help_tips {
  color: #999;
  font-size: 14px;
  margin-left: 3px;
  cursor: pointer;
}

.wukong-help_tips:hover {
  color: $xr-color-primary;
}

// 修改密码和修改登录名的样式
.el-password {
  .el-form-item {
    margin-bottom: 5px;
  }
}

.el-dialog__wrapper /deep/.el-dialog__body {
  padding: 20px;
}

.tips {
  font-size: 13px;
  color: #999;
}
@import '../styles/table.scss';
</style>

