<template>
  <div
    class="welcome-wrapper">
    <div class="top-nav">
      <img
        src="~@/assets/img/logo.png"
        alt="">
    </div>
    <div class="container">

      <div class="welcome-main-content">
        <div class="welcome__title">
          <i class="el-icon-success"/>Xin chúc mừng, bạn đã cài đặt Farmery thành công
        </div>

        <div class="welcome__des">Bạn đã cài đặt Farmery thành công，Bạn có thể trải nghiệm tất cả các chức năng và dịch vụ của Farmery phiên bản demo. Trước khi sử dụng Farmery trả phí，
        Bạn cần hoàn thành xác minh tài khoản của mình và khởi tạo mật khẩu đăng nhập của quản trị viên.</div>

      </div>
    </div>
  </div>
</template>

<script>
import LoginByWelcome from './component/LoginByWelcome'

export default {
  name: 'Login',
  components: {
    LoginByWelcome
  },
  data() {
    return {}
  },
  watch: {},
  created() {
  },
  methods: {}
}
</script>

<style scoped lang="scss">
@import 'index';

.welcome-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background: url('~@/assets/login/welcome_bg.png') center no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  overflow: auto;

  .top-nav {
    width: 100%;
    padding: 23px 2.8% 0;
    display: flex;
    img {
      // width: 164px;
      height: 50px;
    }
  }

  .container {
    width: 100%;
    flex: 1;
    text-align: center;
  }

  .welcome-main-content {
    position: relative;
    width: 700px;
    border-radius: 6px;
    overflow: hidden;
    display: inline-block;

    .welcome {
      &__title {
        font-weight: bold;
        font-size: 30px;
        color: white;
        margin: 15px 0 20px;
        .el-icon-success {
          font-size: 30px;
          color: #20b559;
          background-color: white;
          border-radius: 15px;
          margin-right: 24px;
        }
      }

      &__des {
        color: white;
        line-height: 2;
        padding: 10px 0;
      }

      &__main {
        padding: 0 40px;
        margin-bottom: 100px;
      }

      &__tips {
        background-color: white;
        line-height: 2;
        margin: 20px 0;
        padding: 20px 40px;
        border-radius: 6px;
        overflow: hidden;

        a {
          color: $xr-color-primary;
        }
      }
    }
  }
}
</style>
