<template>
  <el-select
    v-bind="$attrs"
    v-model="selectValue"
    class="role-employee-select"
    v-on="$listeners"
    @visible-change="selectVisibleChange"
    @change="selectChange">
    <div class="role-employee-select__body">
      <el-tabs
        ref="roleTabs"
        v-model="activeName">
        <el-tab-pane ref="roleTabPane" label="Quyền tùy chọn" name="role">
          <div
            v-for="group in roleOption"
            :key="group.pid"
            :label="group.name">
            <div class="role-employee-select__title">{{ group.name }}</div>
            <el-option
              v-for="item in group.list"
              :key="item.roleId"
              :label="item.roleName"
              :value="item.roleId"
              style="padding: 0 10px;"/>
          </div>
        </el-tab-pane>
        <el-tab-pane label="Sao chép quyền của nhân viên" name="employee">
          <el-input
            v-model="searchInput"
            placeholder="Tìm kiếm thành viên"
            size="small"
            prefix-icon="el-icon-search"
            class="search-input"
            @input="userSearch"/>
          <el-option
            v-for="item in userOption"
            v-show="!item.isHide"
            :key="item.userId"
            :label="item.realname"
            :value="`${item.userId}@${item.roleId}`"
            style="padding: 0 10px;">
            <flexbox class="cell">
              <xr-avatar
                :name="item.realname"
                :size="24"
                :src="item.img"
                class="cell__img" />
              <div class="cell__body" >{{ item.realname }}</div>
              <el-tooltip :content="item.roleName" effect="dark" placement="top">
                <div class="cell__footer text-one-line" >{{ item.roleName }}</div>
              </el-tooltip>
            </flexbox>
          </el-option>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-select>
</template>

<script>
import { roleListAPI } from '@/api/admin/employeeDep'
import { userListAPI } from '@/api/common'

import { valueEquals } from 'element-ui/lib/utils/util'
import PinyinMatch from 'pinyin-match'

export default {
  // 角色员工选择
  name: 'RoleEmployeeSelect',

  components: {},

  props: {
    value: [Array, Number, String]
  },

  data() {
    return {
      selectValue: [],
      activeName: '',
      roleOption: [],
      userOption: [],
      searchInput: ''
    }
  },

  computed: {},

  watch: {
    value: {
      handler() {
        if (!valueEquals(this.value, this.selectValue)) {
          this.selectValue = this.value
        }
      },
      immediate: true
    }
  },

  created() {
    this.getRoleList()
    this.getUserList()
  },

  mounted() {},

  beforeDestroy() {},

  methods: {
    selectVisibleChange(visible) {
      if (this.activeName === '' || this.activeName === '0') {
        this.activeName = 'role'
      }
    },

    /**
     * 获取角色列表
     */
    getRoleList() {
      roleListAPI()
        .then(res => {
          this.roleOption = res.data || []
        })
        .catch(() => {})
    },

    /**
     * 员工列表
     */
    getUserList() {
      userListAPI({ pageType: 0 })
        .then(res => {
          this.userOption = res.data.list || []
        })
        .catch(() => {})
    },

    selectChange() {
      this.$emit('input', this.selectValue)
    },

    userSearch() {
      this.userOption.forEach(item => {
        item.isHide = !PinyinMatch.match(item.realname, this.searchInput)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.role-employee-select {
  &__body {
    padding: 0 15px;
    width: 100%;
  }

  &__title {
    border-bottom: 1px solid #e4e7ed;
    padding: 0 0 7px;
    font-size: 12px;
    color: #909399;
    line-height: 30px;
  }

  .el-select-dropdown__item {
    padding: 0 10px;
  }
}

/deep/ .el-select-dropdown__item.selected::after {
  top: 0;
}

/deep/ .el-tabs {
  .el-tabs__nav-wrap::after {
    height: 1px;
  }

  .el-tab-pane {
    height: 100%;
    overflow-y: auto;
  }

  .el-tabs__content {
    height: 200px;
  }
}

.search-input {
  margin-bottom: 5px;
  /deep/ .el-input__inner {
    background-color: #F4F4F4;
    border: none;
  }
}

.cell {
  width: calc(100% - 30px);
  &__img {
    margin-right: 8px;
    vertical-align: middle;
    flex-shrink: 0;
  }
  &__body {
    flex-shrink: 0;
    flex: 1;
    margin-right: 30px;
  }
  &__footer {
    text-align: right;
  }
}
</style>
