<template>
  <div class="edit-pwd">
    <div class="head">
      <span class="wk wk-circle-password icon" />
      <span class="text">Đổi mật khẩu</span>
    </div>
    <el-form
      v-loading="loading"
      ref="form"
      :model="form"
      :rules="rules"
      label-position="left"
      label-width="120px">
      <el-form-item label="Mật khẩu cũ" prop="oldPwd">
        <el-input
          v-model.trim="form.oldPwd"
          :maxlength="20"
          type="password" />
      </el-form-item>
      <el-form-item label="Mật khẩu mới" prop="newPwd">
        <el-input
          v-model.trim="form.newPwd"
          :maxlength="20"
          type="password" />
      </el-form-item>
      <el-form-item label="Xác nhận mật khẩu" prop="confirmPwd">
        <el-input
          v-model.trim="form.confirmPwd"
          :maxlength="20"
          type="password" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="handleSave">Lưu</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { adminUsersResetPasswordAPI } from '@/api/user/personCenter'
import { removeAuth } from '@/utils/auth'

export default {
  name: 'EditPwd',
  data() {
    const pwdReg = /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/
    return {
      loading: false,
      form: {},
      rules: {
        oldPwd: [
          { required: true, message: 'Vui lòng nhập mật khẩu cũ', trigger: 'blur' },
          { pattern: pwdReg, message: 'Mật khẩu phải bao gồm 6-20 chữ cái và số', trigger: 'blur' }
        ],
        newPwd: [
          { required: true, message: 'Vui lòng nhập mật khẩu mới', trigger: 'blur' },
          { pattern: pwdReg, message: 'Mật khẩu phải bao gồm 6-20 chữ cái và số', trigger: 'blur' }
        ],
        confirmPwd: [
          { required: true, message: 'Vui lòng nhập mật khẩu xác nhận', trigger: 'blur' },
          { validator: this.validatedConfirmPwd, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  methods: {
    validatedConfirmPwd(rule, value, callback) {
      if (value === '') {
        callback(new Error('Vui lòng nhập lại mật khẩu'))
      } else if (value !== this.form.newPwd) {
        callback(new Error('Mật khẩu xác nhận không khớp!'))
      } else {
        callback()
      }
    },
    handleSave() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          const params = {
            id: this.userInfo.userId,
            oldPwd: this.form.oldPwd,
            newPwd: this.form.newPwd
          }
          adminUsersResetPasswordAPI(params).then(() => {
            this.loading = false
            removeAuth().then(() => {
              this.$confirm('Đổi mật khẩu thành công, vui lòng đăng nhập lại', 'Thông báo', {
                confirmButtonText: 'OK',
                showCancelButton: false,
                type: 'warning'
              }).then(() => {
                this.$router.push('/login')
              }).catch(() => {
                this.$router.push('/login')
              })
            })
          }).catch(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
  @import "./style";
  .edit-pwd {
    width: 100%;
    background-color: white;
    padding: 22px 25px;
  }
</style>
