<template>
  <create-view :body-style="{height: '100%'}">
    <div
      v-loading="loading"
      class="details-box">
      <div
        slot="header"
        class="header">
        <span class="text">{{ title }}</span>
        <i
          class="el-icon-close rt"
          @click="close" />
      </div>
      <div class="content">
        <el-form
          ref="form"
          :model="formData"
          :rules="rules">
          <el-form-item
            v-for="(item, index) in formList"
            :label="item.label"
            :class="'el-form-item' + item.field"
            :prop="item.field"
            :key="index">
            <template v-if="item.type == 'date'">
              <el-date-picker
                v-model="formData[item.field]"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="Chọn ngày"/>
            </template>
            <template v-else-if="item.type == 'textarea'">
              <el-input
                :autosize="{ minRows: 15}"
                :maxlength="2000"
                v-model="formData[item.field]"
                show-word-limit
                type="textarea"
                placeholder="Nhập nội dung"/>
            </template>
            <template v-else-if="item.type =='plus'">
              <xh-struc-user-cell
                :value="null"
                :users="formData[item.field].staff"
                :strucs="formData[item.field].dep"
                style="width: 100%;"
                @value-change="strcUserChange"/>
            </template>
            <el-input
              v-else
              v-model="formData[item.field]"/>
          </el-form-item>
        </el-form>
      </div>
      <div class="btn-box">
        <el-button
          type="primary"
          @click="onSubmit">Gởi</el-button>
        <el-button @click="close">Hủy</el-button>
      </div>
    </div>
  </create-view>
</template>

<script>
import CreateView from '@/components/CreateView'

import { XhStrucUserCell } from '@/components/CreateCom'
// API
import { noticeAddOrUpateAPI } from '@/api/oa/notice'
import { formatTimeToTimestamp } from '@/utils/index'

export default {
  components: {
    CreateView,
    XhStrucUserCell
  },
  props: {
    action: {
      type: Object,
      default: () => {
        return {
          type: 'save'
        }
      }
    }
  },

  data() {
    var validateTime = (rule, value, callback) => {
      if (
        (rule.field == 'startTime' &&
          !this.formData.startTime &&
          this.formData.endTime) ||
        (rule.field == 'endTime' &&
          !this.formData.endTime &&
          this.formData.startTime)
      ) {
        callback(new Error('Hãy chọn lại thời gian'))
      } else if (this.formData.startTime && this.formData.endTime) {
        if (
          formatTimeToTimestamp(this.formData.startTime) >=
          formatTimeToTimestamp(this.formData.endTime)
        ) {
          callback(new Error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc'))
        }
      }
      callback()
    }
    return {
      formList: [
        { label: 'Tiêu đề thông báo', field: 'title' },
        { label: 'Phạm vi thông báo', field: 'dep', type: 'plus' },
        // { label: 'Thời gian bắt đầu', field: 'startTime', type: 'date' },
        // { label: 'Thời gian kết thúc', field: 'endTime', type: 'date' },
        { label: 'Nội dung', field: 'content', type: 'textarea' }
      ],
      formData: { dep: { staff: [], dep: [] }},
      rules: {
        title: [
          { required: true, message: 'Tiêu đề thông báo không được để trống', trigger: 'blur' },
          { max: 50, message: 'Độ dài của tiêu đề thông báo lên đến 50 ký tự', trigger: 'blur' }
        ],
        content: [
          { required: true, message: 'Nội dung thông báo không được để trống', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: 'Không được để trống', trigger: 'blur' },
          { validator: validateTime, trigger: 'blur' }
        ],
        endTime: [
          { required: true, message: 'Không được để trống', trigger: 'blur' },
          { validator: validateTime, trigger: 'blur' }
        ]
      },
      loading: false
    }
  },

  computed: {
    title() {
      return this.action.type == 'save' ? 'Thông báo mới' : 'Chỉnh sửa thông báo'
    }
  },

  created() {
    if (this.action.type == 'update') {
      this.formData = {
        title: this.action.data.title,
        content: this.action.data.content,
        dep: { staff: this.action.data.ownerUserList, dep: this.action.data.deptList }
      }
    }
  },

  methods: {
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          const params = {
            title: this.formData.title,
            content: this.formData.content,
            // startTime: this.formData.startTime,
            // endTime: this.formData.endTime,
            deptIds: this.formData.dep.dep
              .map(item => item.id)
              .join(','),
            ownerUserIds: this.formData.dep.staff
              .map(item => item.userId)
              .join(',')
          }

          if (this.action.type == 'update') {
            params.announcementId = this.action.id
          }

          noticeAddOrUpateAPI(params)
            .then(res => {
              this.$message.success(`${this.title} thành công`)
              // if (this.$route.query.routerKey == 1) {
              //   this.$router.push('notice')
              // } else {
              this.$emit('onSubmit')
              this.close()
              // }
              this.loading = false
            })
            .catch(() => {
              this.$message.error(`${this.title} không thành công`)
              this.loading = false
            })
        } else {
          return false
        }
      })
    },
    close() {
      // if (this.$route.query.routerKey == 1) {
      //   this.$router.go(-1)
      // } else {
      this.$emit('close')
      // }
    },
    // 关闭按钮
    strcUserChange(data) {
      this.$set(this.formData, 'dep', { staff: data.value.users, dep: data.value.strucs })
    },
    // 删除部门和用户
    deleteuser(index) {
      this.formData.dep.staff.splice(index, 1)
    },
    deleteDepuser(index) {
      this.formData.dep.dep.splice(index, 1)
    }
  }
}
</script>

<style scoped lang="scss">
.details-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  .header {
    height: 40px;
    line-height: 40px;
    padding: 0 10px;
    .el-icon-close {
      display: block;
      font-size: 24px;
      color: #909399;
      margin-right: -10px;
      padding: 10px;
      cursor: pointer;
    }

    .el-icon-close:hover {
      color: $xr-color-primary;
    }

    .text {
      font-size: 17px;
      font-weight: bold;
    }
  }
  .content {
    padding: 15px 20px;
    flex: 1;
    overflow: auto;
    .el-form /deep/ {
      .el-form-item {
        margin-bottom: 10px;
        padding-bottom: 10px;
        float: left;
        width: 50%;
        // .el-form-item__content {
        //     line-height: 40px;
        //     height: 40px;
        // }
        .el-form-item__content > .el-textarea {
          margin-top: 6px;
        }
        .el-form-item__label {
          float: none;
          font-size: 12px;
        }
        .el-input {
          // width: 45%;
          .el-input__inner {
            vertical-align: bottom;
          }
        }
        .members-dep {
          display: inline-block;
          width: 100%;
          position: relative;
          .el-textarea {
            cursor: pointer;
            .el-textarea__inner {
              resize: none;
              min-height: 34px !important;
              // height: 34px !important;
              padding-right: 28px;
              overflow: hidden;
            }
          }
          .el-icon-plus {
            position: absolute;
            right: 7px;
            top: 50%;
            margin-top: -4px;
          }
        }
        .el-date-editor {
          vertical-align: bottom;
          width: 100%;
          .el-range-separator {
            width: 7%;
          }
        }
      }
      .el-form-itemtitle,
      .el-form-itemstartTime {
        padding-right: 25px;
      }
      .el-form-itemdep,
      .el-form-itemendTime {
        padding-left: 25px;
      }
      .el-form-itemdep {
        margin-bottom: 11px;
      }
      .el-form-itemcontent {
        width: 100%;
      }
    }
  }
  .btn-box {
    text-align: right;
    padding-right: 20px;
  }
}

.user-container {
  margin-top: 3px;
  min-height: 34px;
  position: relative;
  border-radius: 3px;
  font-size: 12px;
  border: 1px solid #ddd;
  color: #333333;
  padding: 5px;
  line-height: 15px;
  max-height: 105px;
  overflow-y: auto;
  .user-item {
    padding: 5px;
    background-color: #e2ebf9;
    border-radius: 3px;
    margin: 3px;
    cursor: pointer;
  }
  .add-item {
    padding: 5px;
    color: #2362FB;
    cursor: pointer;
  }
  .delete-icon {
    color: #999;
    cursor: pointer;
  }
  &:hover {
    border-color: #c0c4cc;
  }
}
</style>
