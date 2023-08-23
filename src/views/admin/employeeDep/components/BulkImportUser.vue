<template>
  <el-dialog
    :visible.sync="showDialog"
    :append-to-body="true"
    :show-close="showCancel"
    :close-on-click-modal="false"
    title="Nhập dữ liệu hàng loạt"
    width="750px"
    @close="closeView">
    <div class="dialog-body">
      <el-steps
        :active="stepsActive"
        simple>
        <el-step
          v-for="(item, index) in stepList"
          :key="index"
          :title="item.title"
          :icon="item.icon"
          :status="item.status" />
      </el-steps>
      <div
        v-if="stepsActive == 1"
        class="sections">
        <div>Vui lòng chọn tệp để nhập</div>
        <div class="content">
          <flexbox class="file-select">
            <el-input
              v-model="file.name"
              :disabled="true" />
            <el-button
              type="primary"
              @click="selectFile">Chọn file</el-button>
          </flexbox>
        </div>
        <div
          class="download"
          @click="download">
          Nhấp để tải xuống 《File mẫu》</div>
        <div class="content content-tips">
          <div>Các bước：</div>
          <div>1、Tải xuống 《File mẫu》</div>
          <div>2、Mở 《File mẫu》 và nhập hoặc sao chép thông tin trường tương ứng vào biểu mẫu này. Để đảm bảo rằng thông tin đã sao chép được nhập một cách hiệu quả, vui lòng sử dụng văn bản thuần túy hoặc số</div>
          <div>3、Sau khi nhập đầy đủ thông tin, bấm nút "Chọn tệp" và chọn tệp excel để tải lên</div>
          <div>4、Nhấp vào "OK" để bắt đầu nhập dữ liệu</div>
        </div>
      </div>

      <div
        v-loading="loading"
        v-else-if="stepsActive == 2"
        element-loading-text="Nhập dữ liệu"
        element-loading-spinner="el-icon-loading"
        class="sections" />

      <div
        v-loading="loading"
        v-else-if="stepsActive == 3"
        class="sections">
        <div class="result-info">
          <i class="wk wk-success result-info__icon" />
          <p class="result-info__des">Nhập dữ liệu hoàn tất</p>
          <p class="result-info__detail">Tổng dữ liệu<span class="result-info__detail--all">{{ resultData.totalSize }}</span> dòng，Đã nhập thành công<span class="result-info__detail--suc">{{ resultData.totalSize - (resultData.errSize || 0) }}</span>dòng，Nhập không thành công<span class="result-info__detail--err">{{ resultData.errSize || 0 }}</span>dòng</p>
          <el-button
            v-if="resultData && resultData.errSize > 0"
            class="result-info__btn--err"
            type="text"
            @click="downloadErrData">Tải xuống dữ liệu sai</el-button>
        </div>
      </div>
      <input
        id="importInputFile"
        type="file"
        @change="uploadFile">
    </div>
    <span
      slot="footer"
      class="dialog-footer">
      <el-button
        :class="{ 'is-hidden': !showCancel }"
        @click="closeView">Đóng</el-button>
      <el-button
        v-if="sureTitle"
        type="primary"
        @click="sureClick">{{ sureTitle }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  userImportTemplateURL,
  userExcelImportAPI,
  userErrorExcelDownAPI
} from '@/api/admin/employeeDep'

import { downloadExcelWithResData, verifyFileTypeWithFileName } from '@/utils'

export default {
  // 批量导入员工股
  name: 'BulkImportUser',
  components: {},
  props: {
    show: {
      type: Boolean,
      default: false
    },
    // CRM类型
    crmType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      showDialog: false,
      file: { name: '' },
      stepsActive: 1,
      stepList: [
        {
          icon: 'wk wk-upload',
          title: 'Tải lên',
          status: 'wait'
        },
        {
          icon: 'wk wk-data-import',
          title: 'Nhâp dữ liệu',
          status: 'wait'
        },
        {
          icon: 'wk wk-success',
          title: 'Nhập xong',
          status: 'wait'
        }
      ],
      resultData: null
    }
  },
  computed: {
    sureTitle() {
      return {
        1: 'Nhập ngay bây giờ',
        2: '',
        3: 'Kết thúc'
      }[this.stepsActive]
    },

    showCancel() {
      return this.stepsActive != 2
    }
  },
  watch: {
    show: function(val) {
      this.showDialog = val
      this.resetData()
    }
  },
  mounted() {},
  methods: {
    sureClick() {
      if (this.stepsActive == 1) {
        if (this.stepList[0].status == 'finish') {
          this.stepList[1].status = 'process'
          this.stepsActive = 2
          this.updateFile(res => {
            this.stepList[1].status = 'finish'
            this.stepsActive = 3
            if (res.data) {
              this.resultData = res.data
              if (res.data.errSize > 0) {
                this.stepList[2].status = 'error'
              } else {
                this.stepList[2].status = 'finish'
              }
            }
          })
        } else {
          this.$message.error('Vui lòng chọn tệp nhập')
        }
      } else if (this.stepsActive == 3) {
        this.closeView()
      }
    },

    updateFile(result) {
      if (!this.file.name) {
        this.$message.error('Vui lòng chọn tệp nhập')
      } else {
        this.loading = true
        userExcelImportAPI({
          file: this.file
        })
          .then(res => {
            this.loading = false
            if (result) {
              result(res)
            }
            this.$emit('success')
          })
          .catch(() => {
            if (result) {
              result(false)
            }
            this.loading = false
          })
      }
    },

    /**
     * 下载错误
     */
    downloadErrData() {
      this.getImportError(this.resultData.token)
    },

    /**
     * 导入错误下载
     */
    getImportError(token) {
      this.loading = true
      userErrorExcelDownAPI({
        token
      })
        .then(res => {
          downloadExcelWithResData(res)
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 下载模板操作
     */
    download() {
      window.open(userImportTemplateURL)
    },

    /**
     * 选择文件选择文件
     */
    selectFile() {
      document.getElementById('importInputFile').click()
    },

    /**
     * 选择触发
     */
    uploadFile(event) {
      var files = event.target.files
      const file = files[0]
      if (verifyFileTypeWithFileName(file.name)) {
        this.file = file
        this.stepList[0].status = 'finish'
      }
      event.target.value = ''
    },

    /**
     * 关闭
     */
    closeView() {
      this.$emit('close')
    },

    /**
     * 重置数据
     */
    resetData() {
      this.file = { name: '' }
      this.stepList = [
        {
          icon: 'wk wk-upload',
          title: 'Tải lên',
          status: 'wait'
        },
        {
          icon: 'wk wk-data-import',
          title: 'Nhập dữ liệu',
          status: 'wait'
        },
        {
          icon: 'wk wk-success',
          title: 'Nhập thành công',
          status: 'wait'
        }
      ]
      this.stepsActive = 1
      this.resultData = null
    }
  }
}
</script>

<style scoped lang="scss">
.el-steps {
  margin-bottom: 15px;

  /deep/ .el-step__title {
    font-size: 14px;
  }

  /deep/ .el-step.is-simple .el-step__arrow::before,
  /deep/ .el-step.is-simple .el-step__arrow::after {
    height: 10px;
    width: 2px;
  }

  /deep/ .el-step.is-simple .el-step__arrow::after {
    transform: rotate(45deg) translateY(3px);
  }
  /deep/ .el-step.is-simple .el-step__arrow::before {
    transform: rotate(-45deg) translateY(-2px);
  }
}

.sections {
  font-size: 14px;
  min-height: 215px;
  .download {
    cursor: pointer;
    color: #2362fb;
    margin-bottom: 15px;
  }

  /deep/ .el-loading-spinner {
    top: 45%;
    .el-icon-loading {
      font-size: 40px;
      color: #999;
    }

    .el-loading-text {
      color: #333;
    }
  }
}

.content {
  padding: 10px 0;
}

.content-tips {
  font-size: 12px;
  color: #999;
  line-height: 15px;
}

#importInputFile {
  display: none;
}

.file-select {
  .el-input {
    width: 400px;
  }
  button {
    margin-left: 20px;
  }
}

.is-hidden {
  visibility: hidden;
}

// 结果信息
.result-info {
  text-align: center;
  padding-top: 30px;

  &__icon {
    font-size: 40px;
    color: $xr-color-primary;
  }

  &__des {
    margin-top: 15px;
    color: #333;
    font-size: 14px;
  }

  &__detail {
    margin-top: 15px;
    font-size: 12px;
    color: #666;
    &--all {
      color: #333;
      font-weight: 600;
    }

    &--suc {
      color: $xr-color-primary;
      font-weight: 600;
    }

    &--err {
      color: #f94e4e;
      font-weight: 600;
    }
  }

  &__btn--err {
    margin-top: 10px;
  }
}
</style>
