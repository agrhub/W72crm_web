<template>
  <div class="crm-update">
    <div class="title-wrap">
      <i class="el-icon-setting"/>
      <div>
        <p class="title">Cập nhật hệ thống</p>
        <p class="description">Bạn có thể kiểm tra xem hệ thống có phải là phiên bản mới nhất hay không và thực hiện nâng cấp bằng một cú nhấp chuột</p>
      </div>
    </div>

    <reminder
      class="warning-box"
      content="Trước khi cập nhật, bạn cần sao lưu dữ liệu của mình để tránh mất mát dữ liệu." />

    <!-- 登录状态 -->
    <div v-if="isLogin" class="login-box">
      <!-- 头像 -->
      <div class="face">
        <img v-if="userData.img" :src="userData.img" alt="">
        <span v-else>{{ userData.name }}</span>
      </div>

      <!-- 信息 -->
      <div class="info">
        <span class="name">{{ userData.name }}</span>
        <span class="title">{{ userData.title }}</span>
        <p>{{ userData.companyName }}</p>
        <p>
          <i class="el-icon-mobile-phone"/>
          {{ userData.mobile }}
        </p>
        <p>
          <i class="wk wk-icon-email-outline"/>
          {{ userData.email }}
        </p>
      </div>
      <!-- 按钮 -->
      <div>
        <el-button type="primary" plain @click="logoutHandle">Đăng xuất</el-button>
      </div>
    </div>

    <!-- <div v-else class="login-box">
      <div class="face">Đăng nhập</div>
      <div class="info">
        <div class="login-box-title">
          <span @click="dialogVisible = true">Vui lòng bấm để đăng nhập</span>
          <p>Bạn cần đăng nhập vào tài khoản ứng dụng của mình trước khi cập nhật</p>
        </div>
      </div>
      <el-button type="primary" plain @click="dialogVisible = true">Đăng nhập</el-button>
    </div> -->

    <div v-loading="checkLoading" class="last-time">
      <el-button :disabled="isClick" type="primary" plain @click="checkHandle">Kiểm tra cập nhật</el-button>
    </div>

    <!-- 检查更新后展示 -->
    <div v-if="isCheckUpdate" class>
      <!-- 已经是最新版本 -->
      <div v-if="isNewest" class="version">
        <p class="text">Bạn hiện là phiên bản mới nhất</p>
        Phiên bản hiện tại：{{ version }}
      </div>

      <!-- 有新版本 -->
      <div
        v-loading="updateLoading"
        v-else
        :element-loading-text="progressTooltip"
        class="version"
        element-loading-background="#fff"
      >
        <p class="text">Có một phiên bản mới để nâng cấp</p>
        Phiên bản mới：{{ serverVersion }}，Bạn có thể nâng cấp lên
        <span>{{ version }}</span>

        <div class="update-wrap">
          <el-badge :value="1" class="update-badge">
            <el-button :type="isCanUpdate ? 'primary' : 'info'" @click="updateHandle">Cập nhật ngay</el-button>
          </el-badge>
        </div>

      </div>
    </div>
    <!-- 备份 -->
    <div class="data-back">
      <p class="text">Sao lưu dữ liệu</p>
      <div v-loading="backLoading" class="box" element-loading-text="Working hard to back up">
        <el-button type="primary" plain @click="queryDatabaseHandle">Query database</el-button>
        <el-button type="primary" plain @click="isCustom = 0">Custom database</el-button>
        <div v-if="isCustom === 1" class="database-wrap">
          <el-select v-model="database" placeholder="xin vui lòng chọn">
            <el-option v-for="(item, index) in databaseList" :key="index" :value="item"/>
          </el-select>
          <p class="way">
            Chọn phương pháp sao lưu：
            <el-radio v-model="backupType" :label="1">Sao lưu cục bộ</el-radio>
          </p>
          <el-button type="primary" @click="dataBackHandle">Bắt đầu sao lưu</el-button>
        </div>

        <!-- 自定义数据库 -->
        <el-form
          v-if="isCustom === 0"
          ref="databaseForm"
          :model="customDatabase"
          :rules="databaseRules"
          status-icon
          class="custom1"
        >
          <el-form-item prop="host">
            <el-input v-model="customDatabase.host" autocomplete="off" placeholder="Vui lòng nhập địa chỉ cơ sở dữ liệu"/>
          </el-form-item>
          <el-form-item prop="port">
            <el-input
              v-model.number="customDatabase.port"
              autocomplete="off"
              placeholder="Port"
            />
          </el-form-item>
          <el-form-item prop="databaseName">
            <el-input
              v-model="customDatabase.databaseName"
              autocomplete="off"
              placeholder="Tên CSDL"
            />
          </el-form-item>
          <el-form-item prop="DBUsername">
            <el-input
              v-model="customDatabase.DBUsername"
              autocomplete="off"
              placeholder="Nhập tên đăng nhập"
            />
          </el-form-item>
          <el-form-item prop="DBPassword">
            <el-input
              v-model="customDatabase.DBPassword"
              type="password"
              autocomplete="off"
              placeholder="Nhập mật khẩu"
            />
          </el-form-item>
          <el-button type="primary" @click="submitForm">Bắt đầu sao lưu</el-button>
        </el-form>

        <div v-if="isBackSuccess" class="back-success">Sao lưu thành công! đường dẫn tập tin：{{ sql }}</div>
        <div class="explain">
          <p>Hướng dẫn sao lưu:</p>
          <p>1、Sao lưu cục bộ sẽ chỉ sao lưu SQL và được sao lưu vào thư mục cùng cấp</p>
          <p>2、The cloud backup data will be backed up to the cloud. You can view the backup record and download the backup data in the personal center</p>
        </div>
      </div>
    </div>

    <!-- 登录悟空弹窗 -->
    <el-dialog :visible.sync="dialogVisible" title="Log in to your account" width="500px">
      <div slot="title" class="el-dialog__title">
        Log in to your account
        <p class="description">Bạn có thể đăng nhập vào tài khoản ứng dụng của mình để nâng cấp bằng một cú nhấp chuột</p>
      </div>
      <!-- 登录表单 -->
      <el-form
        ref="loginRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
        label-position="top"
        class="login-form"
      >
        <div class="form-item">
          <el-form-item prop="username">
            <i class="wk wk-mobile"/>Tên đăng nhập
            <el-input v-model="loginForm.username" placeholder="Nhập tên đăng nhập"/>
          </el-form-item>
        </div>
        <div class="form-item password">
          <el-form-item prop="password">
            <i class="wk wk-lock"/>Mật khẩu
            <el-input v-model="loginForm.password" type="password" placeholder="Nhập mật khẩu"/>
          </el-form-item>
        </div>
        <el-button type="primary" @click="loginHandle('loginRef')">Đăng nhập</el-button>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import Lockr from 'lockr'
import {
  crmCheckVersionAPI,
  crmQueryDatabaseAPI,
  crmBackupDatabaseAPI,
  crmUpdateAPI,
  updateProgressAPI,
  loginWKAPI
} from '@/api/admin/update'

import Reminder from '@/components/Reminder'

export default {
  /** 系统升级 */
  name: 'Update',
  components: {
    Reminder
  },
  data() {
    var checkPort = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('Vui lòng nhập số port'))
      }
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('Vui lòng nhập một giá trị số'))
        } else {
          if (value > 65535 || value <= 0) {
            callback(new Error('Vui lòng nhập số port từ 0 đến 65535'))
          } else {
            callback()
          }
        }
      }, 1000)
    }
    return {
      isClick: false,
      isCanUpdate: false,
      isLogin: false, // 是否登录悟空账号
      dialogVisible: false, // 登录弹窗
      dialogVisibleH: false, // 历史备份弹窗
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [
          { required: true, message: 'Vui lòng nhập tài khoản', trigger: 'blur' }
        ],
        password: [{ required: true, message: 'Xin vui lòng nhập mật khẩu', trigger: 'blur' }]
      },
      userData: {},
      isCheckUpdate: false, // 是否检查更新过
      isNewest: false, // 是否是最新版本
      checkLoading: false, // 检查更新loading
      version: '', // 最新版本
      serverVersion: '', // 服务器版本
      isCustom: -1, // 0: 自定义数据库 1:选择数据库
      backupType: 1, // 备份方式 1:本地 2:云端
      databaseList: [], // 数据库列表
      database: '', // 选中的数据库
      databaseRules: {
        host: [
          { required: true, message: 'Vui lòng nhập địa chỉ cơ sở dữ liệu', trigger: 'blur' }
        ],
        port: [{ validator: checkPort, trigger: 'blur' }],
        databaseName: [
          { required: true, message: 'Vui lòng nhập tên cơ sở dữ liệu', trigger: 'blur' }
        ],
        DBUsername: [
          { required: true, message: 'Vui lòng nhập tài khoản đăng nhập cơ sở dữ liệu', trigger: 'blur' }
        ],
        DBPassword: [
          { required: true, message: 'Vui lòng nhập mật khẩu đăng nhập cơ sở dữ liệu', trigger: 'blur' }
        ]
      },
      customDatabase: {
        // 自定义数据库
        host: '', // 地址
        port: '', // 端口号
        databaseName: '', // 数据库名称
        DBUsername: '', // 数据库账号
        DBPassword: '' // 数据库密码
      },
      backLoading: false, // 数据库备份loading
      isBackSuccess: false,
      sql: '', // 数据库备份文件保存路径
      backType: 1, // 数据备份方式 1:本地 2:云端
      updateLoading: false,
      progressTooltip: '',
      progress: 0 // 进度
    }
  },

  created() {
    const _this = this
    async function decorator() {
      var { data } = await crmCheckVersionAPI()
      _this.checkIsNewest(data.version, data.serverVersion)

      _this.checkLoading = false

      _this.version = data.version
      _this.serverVersion = data.serverVersion

      _this.isCheckUpdate = true
    }
    decorator()
  },

  methods: {
    loginHandle(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var param = {
            username: this.loginForm.username,
            password: this.loginForm.password
          }
          loginWKAPI(param).then(res => {
            var { data } = res
            if (res.code === 0) {
              this.userData = data
              this.dialogVisible = false
              this.isLogin = true
              Object.assign(this.userData, this.loginForm)
            }
          }).catch(() => {
          })
        } else {
          return false
        }
      })
    },

    logoutHandle() {
      this.isLogin = false
      this.loginForm.username = ''
      this.loginForm.password = ''
    },

    async checkHandle() {
      this.checkLoading = true
      var { data } = await crmCheckVersionAPI()

      this.isNewest = this.checkIsNewest(data.version, data.serverVersion)
      this.checkLoading = false

      this.version = data.version
      this.serverVersion = data.serverVersion

      this.isCheckUpdate = true
      this.isClick = true
    },

    checkIsNewest(a, b) {
      var a = toNum(a)
      var b = toNum(b)

      if (a > b) {
        return false
      } else {
        return true
      }

      function toNum(a) {
        var a = a.toString()
        var c = a.split('.')
        var num_place = ['', '0', '00', '000', '0000']
        var r = num_place.reverse()
        for (var i = 0; i < c.length; i++) {
          var len = c[i].length
          c[i] = r[len] + c[i]
        }
        var res = c.join('')
        return res
      }
    },

    async queryDatabaseHandle() {
      this.isCustom = 1
      var res = await crmQueryDatabaseAPI()
      this.databaseList = res.data
      this.isShowDatabase = res.code === 0
    },

    submitForm() {
      this.$refs.databaseForm.validate((valid) => {
        if (valid) {
          this.dataBackHandle()
        } else {
          return false
        }
      })
    },

    async dataBackHandle() {
      if (!this.isLogin) {
        this.$message({
          showClose: true,
          message: 'Hãy đăng nhập vào tài khoản ứng dụng',
          type: 'warning'
        })
        return
      }

      if (this.isCustom && !this.database) {
        this.$message({
          showClose: true,
          message: 'Vui lòng chọn cơ sở dữ liệu để sao lưu',
          type: 'warning'
        })
        return
      }


      this.backLoading = true
      var data = this.isCustom
        ? {
          backupType: this.backupType,
          databaseName: this.database,
          username: this.loginForm.username,
          password: this.loginForm.password,
          isCustom: this.isCustom
        }
        : Object.assign(this.customDatabase, this.loginForm)
      var res = await crmBackupDatabaseAPI(data)

      this.backLoading = false
      if (res.code === 0) {
        this.isBackSuccess = true
        this.sql = res.data
        this.isCanUpdate = true
      }
    },

    async updateHandle() {
      if (!this.isLogin) {
        this.$message({
          message: 'Chưa đăng nhập',
          type: 'warning'
        })
        return
      }
      if (!this.isBackSuccess) {
        this.$message({
          message: 'Không sao lưu dữ liệu',
          type: 'warning'
        })
        return
      }

      this.updateLoading = true
      var data = this.isCustom
        ? {
          backupType: this.backupType,
          databaseName: this.database,
          username: this.loginForm.username,
          password: this.loginForm.password,
          isCustom: this.isCustom
        }
        : Object.assign(this.customDatabase, this.loginForm)
      var res = await crmUpdateAPI(data)
      if (res.code === 0) {
        this.progressTooltip = 'Cập nhật để chuẩn bị'
        var _this = this
        var timer = setInterval(function() {
          fn()
          async function fn() {
            var res = await updateProgressAPI()
            switch (res.data) {
              case 5:
                _this.progressTooltip = 'Nhận thông tin cập nhật'
                break
              case 15:
                _this.progressTooltip = 'Sao lưu cơ sở dữ liệu'
                break
              case 25:
                _this.progressTooltip = 'Tập tin sao lưu'
                break
              case 50:
                _this.progressTooltip = 'Ngừng các dịch vụ bị ảnh hưởng'
                break
              case 70:
                _this.progressTooltip = 'Thực hiện nâng cấp'
                break
              case 100:
                _this.progressTooltip = 'Nâng cấp hoàn thành'
                setTimeout(function() {
                  _this.updateLoading = false
                  _this.isNewest = true
                }, 500)
                clearInterval(timer)
                break
              default:
                _this.progressTooltip = 'Nâng cấp hoàn thành'
                setTimeout(function() {
                  _this.updateLoading = false
                  _this.isNewest = true
                }, 500)
                clearInterval(timer)
                break
            }
          }
        }, 3000)
      }
    },

    // 更改每页展示数量
    handleSizeChange(val) {
      Lockr.set('crmPageSizes', val)
      this.pageSize = val
    },
    // 更改当前页数
    handleCurrentChange(val) {
      this.currentPage = val
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../styles/table.scss";
$linkColor: #3b6ff1;

// 公共
.text {
  font-size: 18px;
  font-weight: bold;
  height: 38px;
  line-height: 38px;
  color: #000;
}
.link {
  color: $linkColor;
  cursor: pointer;
}

.crm-update {
  width: 100%;
  min-width: 1200px;
  height: 100%;
  padding: 15px 20px 20px;
  background: #fff;
  overflow: auto;
}

// 标题
.title-wrap {
  display: flex;
  padding: 0 15px;

  .el-icon-setting {
    width: 30px;
    height: 30px;
    margin-right: 12px;
    border-radius: 6px;
    line-height: 30px;
    text-align: center;
    background: #2362fb;
    color: #fff;
    font-size: 18px;
  }
  .title {
    font-size: 16px;
    font-weight: bold;
  }
  .description {
    height: 22px;
    line-height: 22px;
    color: #a2a2a2;
    font-size: 13px;
  }
}

.login-wrap {
  display: flex;
  height: 40px;
  align-items: center;
  .face {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    img {
      width: 100%;
    }
  }
  .name {
    margin: 0 8px;
  }
  .phone {
    margin-right: 8px;
  }
}

// 未登录，警告框
.warning-box {
  margin-top: 10px;
  margin-bottom: 10px;
}


// 登录展示
.login-box {
  width: 600px;
  background: #f8f8f8;
  padding: 22px;
  display: flex;
  border-radius: 6px;
  justify-content: space-between;
  .face {
    width: 40px;
    height: 40px;
    margin-right: 14px;
    border-radius: 50%;
    overflow: hidden;
    line-height: 40px;
    background: #2362fb;
    font-size: 12px;
    color: #fff;
    text-align: center;
    flex-grow: 0;
    img {
      width: 100%;
    }
  }
  .info {
    flex-grow: 1;
    color: #a2a2a2;
    font-size: 12px;
    line-height: 20px;
  }
  .name {
    height: 22px;
    line-height: 22px;
    font-weight: bold;
    font-size: 16px;
    color: #000;
    margin-right: 10px;
  }

  .login-box-title {
    height: 22px;
    line-height: 22px;
    font-weight: bold;
    font-size: 16px;
    color: #333;
    cursor: pointer;
    p {
      height: 28px;
      font-size: 14px;
      color: #a2a2a2;
      line-height: 28px;
      font-weight: normal;
    }
  }
  .el-button {
    height: 31px;
  }
}

// 检查更新
.last-time {
  margin: 16px 0;
  padding: 16px 0;
}

.version {
  a {
    color: $linkColor;
  }
  button {
    display: block;
  }
}

// 数据备份
.data-back {
  margin-top: 40px;
  .link {
    margin-left: 20px;
  }
}

.box {
  width: 820px;
  // border: 1px solid #000;
  border-radius: 6px;
  padding: 14px;
  margin-top: 20px;
  background: #fafafa;
  .database-wrap {
    margin-top: 20px;
  }
  .way {
    margin: 14px 0;
    // margin-bottom: 14px;
  }
  .back-success {
    color: #f56c6c;
    height: 30px;
    line-height: 30px;
    font-size: 18px;
    margin-top: 12px;
  }
  .explain {
    margin-top: 14px;
    line-height: 22px;
    font-size: 12px;
    color: #aaa;
    img {
      width: 16px;
      vertical-align: middle;
    }
  }
}

// 数据库选择
.custom {
  width: 200px;
  p {
    width: 200px;
    margin: 14px 0;
  }
}
.custom1 {
  width: 200px;
  margin-top: 14px;
  .el-button {
  }
}

// dialog
.el-dialog__wrapper {
  /deep/ .el-dialog {
    padding-left: 25px;
    padding-right: 25px;
    border-radius: 6px;
    .el-dialog__title {
      .description {
        font-size: 14px;
        color: #a2a2a2;
        font-weight: normal;
      }
    }
  }
}

// 登陆表单
.login-form {
  .el-button {
    width: 100%;
    font-size: 16px;
    height: 45px;
  }
}
.form-item {
  &.password {
    margin-top: 28px;
  }
  p {
    margin-bottom: 8px;
  }
  .el-input {
    /deep/ input {
      height: 47px;
      background: #f8f8f8;
    }
  }
}

.forget {
  height: 40px;
  line-height: 40px;
  text-align: right;
  color: #2362fb;
}
.register {
  margin-top: 20px;
  text-align: center;
  color: #2362fb;
  font-size: 16px;
}

.time {
  display: flex;
  .el-input {
    width: 246px;
    margin-left: 108px;
  }
}

// 分页
.p-contianer {
  margin-top: 30px;
  border-top: none;
  .p-bar {
    margin-right: 0;
  }
}

// 标记
.update-wrap{
  // margin-top: 10px;
  // margin-right: 40px;
  margin-top: 20px;
}
</style>
