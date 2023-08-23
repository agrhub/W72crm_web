<template>
  <div v-loading="loading" class="init-set">
    <xr-header
      icon-class="wk wk-results-solid"
      icon-color="#2362FB" >
      <template slot="label">Khôi phục cài đặt gốc<span class="label-des">(Xóa các dữ liệu cũ trên hệ thống)</span></template>
    </xr-header>
    <div class="init-set__body">
      <reminder
        :content="`Gợi ý: 1. Bạn có thể khôi phục cài đặt một ứng dụng hoặc nhiều ứng dụng, và tất cả dữ liệu trong ứng dụng sẽ bị xóa；<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. Lưu ý rằng sau khi khôi phục cài đặt một ứng dụng duy nhất, nó sẽ ảnh hưởng đến dữ liệu được liên kết với ứng dụng này trong các ứng dụng khác；<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style='color: red;'>Không thể khôi phục dữ liệu đã khởi tạo lại, vui lòng thao tác một cách thận trọng！</span>`"
        class="xr-reminder"/>
      <div class="init__label">Khôi phục cài đặt gốc ứng dụng</div>
      <div class="init__body">
        <el-select v-model="value" multiple>
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
        <el-button :disabled="value.length == 0" type="primary" @click="saveClick">Thực hiện</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  adminConfigVerifyPasswordAPI,
  adminConfigModuleInitDataAPI
} from '@/api/admin/init'

import Reminder from '@/components/Reminder'
import XrHeader from '@/components/XrHeader'

export default {
  // 初始化设置页面
  name: 'InitSet',
  components: {
    Reminder,
    XrHeader
  },
  data() {
    return {
      loading: false,
      value: [],
      optionsObj: {},
      options: [{
        value: 'all',
        label: 'Tất cả ứng dụng'
      }, {
        value: 'crm',
        label: 'Quản lý kinh doanh'
      }, {
        value: 'taskExamine',
        label: 'Nhiệm vụ / phê duyệt'
      }, {
        value: 'log',
        label: 'Báo cáo'
      }, {
        value: 'project',
        label: 'Quản lý dự án'
      }, {
        value: 'calendar',
        label: 'Lịch biểu'
      }
      ]
    }
  },
  computed: {},
  watch: {
    value(newVal, oldVal) {
      if (newVal.includes('all') && !oldVal.includes('all')) {
        this.value = this.options.map(item => item.value)
      } else if (!newVal.includes('all') && oldVal.includes('all') && oldVal.length === this.options.length) {
        this.value = []
      } else {
        if (!newVal.includes('all') && newVal.length === this.options.length - 1) {
          this.value = this.options.map(item => item.value)
        } else if (newVal.includes('all') && newVal.length === this.options.length - 1) {
          this.value = newVal.filter(item => item !== 'all')
        }
      }
    }
  },
  created() {
    this.options.forEach(item => {
      this.optionsObj[item.value] = item.label
    })
  },
  methods: {

    /**
     * 保存
     */
    saveClick() {
      this.$prompt('Nhập mật khẩu quản trị', 'Thông báo', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        inputType: 'password',
        inputPlaceholder: 'Nhập mật khẩu'
      }).then(({ value }) => {
        this.loading = true
        adminConfigVerifyPasswordAPI({
          password: value
        })
          .then(res => {
            this.loading = false
            const modules = this.value.filter(item => item != 'all')
            const modulesName = modules.map(item => `【${this.optionsObj[item]}】`).join('、')
            this.$confirm(`Xác nhận thực hiện khôi phục cài đặt gốc ứng dụng ${modulesName}？<br/>Dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục được！`, 'Thông báo', {
              confirmButtonText: 'OK',
              cancelButtonText: 'Cancel',
              dangerouslyUseHTMLString: true,
              type: 'warning'
            }).then(() => {
              this.loading = true
              adminConfigModuleInitDataAPI({
                password: value,
                temporaryCode: res.data,
                modules
              })
                .then(() => {
                  this.loading = false
                  this.value = []
                  this.$message({
                    type: 'success',
                    message: 'Thành công'
                  })
                  setTimeout(() => {
                    window.location.reload()
                  }, 1500)
                })
                .catch(() => {
                  this.loading = false
                })
            }).catch(() => {})
          })
          .catch(() => {
            this.loading = false
          })
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.init-set {
  height:100%;

  /deep/ .xr-header {
    padding: 15px 30px;
  }

  &__body {
    height: calc(100% - 60px);
    padding: 10px 20px;
    background-color: white;
    border-top: 1px solid $xr-border-line-color;
    border-bottom: 1px solid $xr-border-line-color;
  }
}

.label-des {
  font-weight: normal;
  color: $xr-color-text-placeholder;
  font-size: 13px;
}

.init {
  &__label {
    margin: 30px 0 20px;
    font-weight: bold;
  }

  &__body {
    .el-select {
      width: 300px;
    }
  }
}

.xr-reminder {
  width: auto;
}
</style>
