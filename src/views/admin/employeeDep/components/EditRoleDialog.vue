<template>
  <el-dialog
    ref="wkDialog"
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    width="500px"
    @close="close">
    <div slot="title" class="el-dialog__title">
      {{ title }}<el-tooltip
        v-if="userShow"
        effect="dark"
        placement="top">
        <div slot="content">1、Có thể sao chép quyền của nhân viên cho các nhân viên khác。<br >
          2、Nếu nhân viên được chọn có một quyền, quyền ban đầu sẽ bị ghi đè.<br >
          3、Nếu bạn chọn một bộ phận, tất cả nhân viên trong bộ phận sẽ có quyền như nhau.<br >
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Có thể được lưu và điều chỉnh độc lập cho nhân viên。
        </div>
        <i class="wk wk-help wk-help-tips" style="margin-left: 3px;"/>
      </el-tooltip>
    </div>
    <el-form
      ref="editRoleForm"
      :model="ruleForm"
      :rules="rules"
      label-width="100px"
      label-position="top">
      <el-form-item v-if="userShow" label="Chọn nhân viên và phòng ban" prop="userIds">
        <wk-user-dep-select
          :user-value.sync="ruleForm.userIds"
          :dep-value.sync="ruleForm.deptIds"
          style="width: 100%;"
        />
      </el-form-item>
      <el-form-item label="Cài đặt quyền" prop="roleList">
        <role-employee-select
          v-model="ruleForm.roleList"
          style="width: 100%;"
          multiple
        />
      </el-form-item>
    </el-form>
    <div class=""/>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">Đóng</el-button>
      <el-button type="primary" @click="sureClick">Lưu</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  adminRoleRelatedDeptUserAPI
} from '@/api/admin/role'

import RoleEmployeeSelect from './RoleEmployeeSelect'
import WkUserDepSelect from '@/components/NewCom/WkUserDepSelect'

import ElDialogLoadingMixin from '@/mixins/ElDialogLoading'

export default {
  // 编辑角色
  name: 'EditRoleDialog',
  components: {
    RoleEmployeeSelect,
    WkUserDepSelect
  },
  mixins: [ElDialogLoadingMixin],
  props: {
    selectionList: Array,
    userShow: {
      type: Boolean,
      default: true
    },
    visible: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      roleValue: [],
      ruleForm: {
        roleList: [],
        userIds: [],
        deptIds: []
      }
    }
  },
  computed: {
    title() {
      return this.userShow ? 'Sao chép quyền' : 'Chỉnh sửa quyền'
    },

    rules() {
      const validateUserIds = (rule, value, callback) => {
        if ((this.ruleForm.userIds && this.ruleForm.userIds.length > 0) ||
        (this.ruleForm.deptIds && this.ruleForm.deptIds.length > 0)) {
          callback()
        } else {
          callback(new Error('xin vui lòng chọn'))
        }
      }
      const temp = {
        roleList: [
          { required: true, message: 'xin vui lòng chọn', trigger: 'change' }
        ] }
      if (this.userShow) {
        temp.userIds = [
          { validator: validateUserIds, trigger: '' }
        ]
      }

      return temp
    }
  },
  watch: {
  },
  created() {
    if ((this.userShow && this.selectionList.length > 0) || (!this.userShow && this.selectionList.length === 1)) {
      const userData = this.selectionList[0]
      this.ruleForm.roleList = userData.roleId ? this.selectionList[0].roleId.split(',').map(item => parseFloat(item)) : []
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },

    sureClick() {
      this.$refs.editRoleForm.validate((valid) => {
        if (valid) {
          const roleIdList = []
          let userRoleIds = []
          this.ruleForm.roleList.forEach(item => {
            if (typeof item === 'string') {
              if (item.includes('@')) {
                const temps = item.split('@')
                if (temps.length > 1) {
                  const tempsIds = temps[1].split(',').map(item => parseFloat(item))
                  userRoleIds = userRoleIds.concat(tempsIds)
                }
              }
            } else {
              roleIdList.push(item)
            }
          })

          const roleIds = Array.from(new Set(roleIdList.concat(userRoleIds)))

          const params = {
            roleIds
          }
          if (this.userShow) {
            params.userIds = this.ruleForm.userIds
            params.deptIds = this.ruleForm.deptIds
          } else {
            params.userIds = this.selectionList.map(item => item.userId)
          }

          adminRoleRelatedDeptUserAPI(params)
            .then(res => {
              this.$message.success('Thành công')
              this.$emit('change')
              this.close()
            })
            .catch(() => {})
        } else {
          return false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.el-form {
  margin-top: 10px;
  /deep/ .el-form-item__label {
    line-height: 30px;
    padding-bottom: 0;
  }
}

</style>
