<template>
  <slide-view
    :listener-ids="['manager-main-container']"
    :no-listener-class="['el-table__body']"
    :body-style="{padding: '10px 30px', height: '100%'}"
    class="d-view"
    @close="hideView">
    <flexbox
      orient="vertical"
      class="main">
      <div class="detail-body">
        <flexbox class="dialog-top">
          <xr-avatar
            :name="data.realname"
            :size="36"
            :src="data.img"
            :key="data.realname"
            class="user-img" />
          <div class="user-name">{{ data.realname }}</div>
          <div class="dialog-btn-group">
            <el-button
              v-if="userUpdateAuth"
              type="primary"
              size="medium"
              @click="editBtn"> Chỉnh sửa </el-button>
            <el-dropdown
              v-if="userUpdateAuth || userEnablesAuth"
              trigger="click"
              @command="handleCommand">
              <el-button size="medium">
                Tùy chỉnh<i class="el-icon-arrow-down el-icon--right"/>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-if="userUpdateAuth"
                  command="reset">Đặt lại mật khẩu</el-dropdown-item>
                <el-dropdown-item
                  v-if="userEnablesAuth"
                  command="status">{{ data.status === 0 ? 'Kích hoạt' : 'Khóa' }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </flexbox>
        <div class="dialog-remark">
          <p>Tình trạng tài khoản：{{ {'0':'Chưa kích hoạt','1':'Kích hoạt','2':'Bị khóa' }[data.status] }}</p>
          <p>Ngày tạo：{{ data.createTime }}</p>
        </div>
        <div class="dialog-content">
          <flexbox
            v-for="(item, index) in detailList"
            :key="index"
            class="content-items"
            align="stretch">
            <div class="content-items-name">{{ item.value }}</div>
            <div class="content-items-value">{{ data|formatedInfo(item.field) }}</div>
          </flexbox>
        </div>
      </div>
    </flexbox>
  </slide-view>
</template>

<script>
import SlideView from '@/components/SlideView'
import { mapGetters } from 'vuex'

export default {
  /** 审批详情 */
  name: 'EmployeeDetail',
  components: {
    SlideView
  },
  filters: {
    formatedInfo(data, field) {
      if (field == 'sex') {
        return { 1: 'Nam', 2: 'Nữ' }[data.sex]
      }
      return data[field]
    }
  },
  props: {
    // 详情信息
    data: Object
  },
  data() {
    return {
      detailList: [
        { field: 'username', value: 'Tên tài khoản' },
        { field: 'realname', value: 'Họ và tên' },
        { field: 'sex', value: 'Giới tính', type: 'select' },
        { field: 'email', value: 'Email' },
        { field: 'deptName', value: 'Phòng ban', type: 'select' },
        { field: 'post', value: 'Chức vụ' },
        { field: 'parentName', value: 'Quản lý trực tiếp', type: 'select' },
        { field: 'roleName', value: 'Quyền', type: 'selectCheckout' }
      ]
    }
  },
  computed: {
    ...mapGetters(['manage']),
    // 员工编辑操作权限
    userUpdateAuth() {
      return this.manage && this.manage.users && this.manage.users.userUpdate
    },
    // 员工禁用启用权限
    userEnablesAuth() {
      return this.manage && this.manage.users && this.manage.users.userEnables
    }
  },
  watch: {},
  mounted() {},
  methods: {
    editBtn() {
      this.$emit('edit')
    },
    handleCommand(command) {
      this.$emit('command', command)
    },
    //* * 点击关闭按钮隐藏视图 */
    hideView() {
      this.$emit('hide-view')
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  height: 100%;
  padding: 10px 0;
  font-size: 14px;
}
.dialog-top {
  .user-img {
    margin-right: 10px;
  }

  .user-name {
    flex: 1;
    margin-right: 8px;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
  }
}

.dialog-btn-group {
  flex-shrink: 0;
}
.dialog-remark {
  color: #999;
  margin-top: 10px;
  p + p {
    margin-top: 5px;
  }
}
.dialog-content {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e6e6e6;
  .content-items {
    overflow: hidden;
    padding: 10px 0;
    .content-items-name {
      width: 132px;
      color: #777;
      flex-shrink: 0;
    }
    .content-items-value {
      flex: 1;
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;
    }
  }
}

.detail-body {
  flex: 1;
  overflow-y: auto;
  width: 100%;
}

.d-view {
  position: fixed;
  width: 500px;
  top: 60px;
  bottom: 0px;
  right: 0px;
  background-color: white;
}
</style>

