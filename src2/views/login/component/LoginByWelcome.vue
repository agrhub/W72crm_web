<template>
  <div class="login-by-wel">
    <el-form
      class="login-from"
      label-position="left"
      label-width="60px" >
      <el-form-item label="Số điện thoại" label-position="left" >
        <el-input
          ref="username"
          v-model.trim="form.username"
          :class="{error: !validateRes.username}"
          placeholder="Vui lòng nhập số điện thoại di động của bạn"
          autofocus
          type="text"
          @focus="focusKey = 'username'"
          @blur="checkFromItem('username', form.username)"
          @keyup.enter.native="debouncedHandleLogin"/>
      </el-form-item>
      <el-form-item label="Mã xác thực">
        <el-input
          ref="code"
          v-model.trim="form.code"
          :maxlength="20"
          :class="{error: !validateRes.code}"
          placeholder="Vui lòng nhập mã xác thực"
          type="code"
          @focus="focusKey = 'code'"
          @keyup.enter.native="debouncedHandleLogin"
          @blur="checkForm"/>
      </el-form-item>
      <div class="wel-tips">Bạn không cần phải kết nối với Internet, bạn có thể hoàn tất xác minh ngay cả khi ngoại tuyến</div>
      <el-divider/>
      <template>
        <div class="wel-title">Khởi tạo mật khẩu đăng nhập quản trị viên</div>
        <el-form-item label="Mật khẩu">
          <el-input
            ref="password"
            v-model.trim="form.password"
            :class="{error: !validateRes.password}"
            placeholder="Vui lòng nhập mật khẩu khởi tạo của bạn"
            autofocus
            type="text"
            @focus="focusKey = 'password'"
            @blur="checkFromItem('password', form.password)"
            @keyup.enter.native="debouncedHandleLogin"/>
        </el-form-item>
        <el-form-item label="Xác nhận mật khẩu">
          <el-input
            ref="verifyPassword"
            v-model.trim="form.verifyPassword"
            :class="{error: !validateRes.verifyPassword}"
            placeholder="Vui lòng nhập mật khẩu khởi tạo của bạn"
            autofocus
            type="text"
            @focus="focusKey = 'verifyPassword'"
            @blur="checkFromItem('verifyPassword', form.verifyPassword)"
            @keyup.enter.native="debouncedHandleLogin"/>
        </el-form-item>
      </template>
    </el-form>

    <div
      :class="{ok: !Boolean(errorInfo)}"
      class="error-info">
      <div
        v-if="errorInfo"
        class="box">
        <img
          src="~@/assets/login/error.png"
          alt=""
          class="icon">
        <span>{{ errorInfo }}</span>
      </div>
    </div>

    <div class="control">
      <div
        class="btn"
        style="font-size: 16px;"
        @click="debouncedHandleLogin">
        Đăng nhập với quyền quản trị viên
      </div>
    </div>

  </div>
</template>

<script>
import { initUserAPI, querySystemStatusAPI } from '@/api/login'
import { Loading } from 'element-ui'

import Mixins from './Mixins'
import { debounce } from 'throttle-debounce'
import md5 from 'js-md5'

export default {
  name: 'LoginByWelcome',
  components: {
  },
  mixins: [Mixins],
  data() {
    return {
      redirect: undefined,
      form: {},
      errorInfo: null,
      validateRes: {
        username: true,
        code: true,
        password: true,
        verifyPassword: true
      }
    }
  },
  computed: {
    rules() {
      const validateEqual = () => {
        if (this.form.password === this.form.verifyPassword) {
          return true
        }
        return false
      }

      const validateCode = () => {
        let num = ''
        if (this.form.username && this.form.username.length > 6) {
          const phoneMd = md5(this.form.username)
          const subPhone = this.form.username.substring(this.form.username.length - 6)
          for (let index = 0; index < subPhone.length; index++) {
            const i = subPhone[index]
            num += phoneMd[i]
          }
        }
        return num == this.form.code
      }
      const temp = {
        username: [
          { required: true, msg: 'Số điện thoại không được để trống' },
          { reg: /^1[1-9]\d{9}$/, msg: 'Vui lòng nhập số điện thoại chính xác' }
        ],
        code: [
          { required: true, msg: 'Mã xác thực không được để trống' },
          { validator: validateCode, msg: 'Vui lòng nhập mã xác thực chính xác' }
        ],
        password: [
          { required: true, msg: 'Mật khẩu khởi tạo không được để trống' },
          { reg: /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/, msg: 'Mật khẩu bao gồm 6-20 chữ cái và số' }
        ],
        verifyPassword: [
          { required: true, msg: 'Xác nhận mật khẩu không được để trống' },
          { reg: /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/, msg: 'Xác nhận mật khẩu bao gồm 6-20 chữ cái và số' },
          { validator: validateEqual, msg: 'Hai mật khẩu đã nhập không nhất quán' }
        ]
      }

      return temp
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.username.focus()
    })
  },
  created() {
    this.debouncedHandleLogin = debounce(300, this.handleLogin)
    this.getInit()
  },
  methods: {
    /**
     * 登录
     */
    handleLogin() {
      const flag = this.checkForm()
      if (!flag) return

      const loading = Loading.service({
        target: document.querySelector('.login-main-content')
      })
      initUserAPI({
        username: this.form.username,
        code: this.form.code,
        password: this.form.password
      })
        .then(res => {
          this.$router.push('/login')
          loading.close()
        })
        .catch(() => {
          loading.close()
        })
    },

    /**
     * 校验登录表单
     */
    checkForm() {
      this.clearError()
      const arr = Object.keys(this.validateRes)
      for (let i = 0; i < arr.length; i++) {
        const res = this.checkFromItem(arr[i], this.form[arr[i]] || null)
        if (!res) return false
      }
      return true
    },

    /**
     * 查看帮助信息
     */
    helpClik() {
      this.helpDialogVisible = true
    },

    getInit() {
      querySystemStatusAPI().then(res => {
        res.data == 1 && this.$router.push('/login')
      }).catch(() => {})
    },

    clearError() {
      this.errorInfo = null
      this.validateRes = {
        username: true,
        code: true,
        password: true,
        verifyPassword: true
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '../index';

.login-by-wel {
  background-color: white;
  padding: 30px ;
  border-radius: 6px;

  .wel-tips {
    text-align: right;
    color: #ccc;
  }

  .wel-title {
    margin-bottom: 15px;
  }
}

.login-action {
  margin-top: -10px;
  .login-by-code {
    font-size: 14px;
    color: #3e6bea;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }

  // @media screen and (min-width: 1550px) {
    /deep/ .el-checkbox {
      .el-checkbox__inner {
        width: 14px;
        height: 14px;
        &::after {
          top: 2px;
          left: 5px;
        }
      }
      .el-checkbox__label {
        font-size: 14px;
      }
    }
  // }

  // @media screen and (max-width: 1550px) {
  //   margin-top: -5px;
  //   .login-by-code {
  //     font-size: 14px;
  //   }
  // }
}

.control {
  .others {
    font-size: 14px;
    .el-dropdown {
      font-size: 14px;
    }
    .register {
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  // @media screen and (max-width: 1550px) {
  //   .others {
  //     font-size: 14px;
  //     .el-dropdown {
  //       font-size: 14px;
  //     }
  //   }
  // }
}

.center-tips {
  font-size: 12px;
  color: #999;
  margin-top: 10px;
  .el-icon-warning {
    color: #f9a74e;
    font-size: 14px;
  }
}
</style>
