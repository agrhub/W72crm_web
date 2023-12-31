<template>
  <div
    v-loading="loading"
    class="edit-user-info">
    <div class="head">
      <span class="wk wk-user icon" />
      <span class="text">Thông tin tài khoản</span>
    </div>
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-position="left"
      label-width="120px">
      <el-form-item label="Ảnh đại diện">
        <flexbox class="user-box">
          <xr-avatar
            :name="userInfo.realname"
            :size="70"
            :src="userInfo.img"
            class="user-img" />
          <div class="change-avatar" @click="handleChangeAvatar">
            Thay đổi
          </div>
        </flexbox>
      </el-form-item>
      <el-form-item
        v-for="(item, index) in fieldList"
        :key="index"
        :prop="item.field"
        :label="item.label">
        <el-input
          v-if="item.type !== 'select'"
          v-model="form[item.field]"
          :maxlength="30"
          :disabled="item.disabled" />
        <el-select
          v-else
          v-model="form[item.field]">
          <el-option
            v-for="option in item.setting"
            :key="option.value"
            :label="option.label"
            :value="option.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave">Lưu</el-button>
      </el-form-item>
    </el-form>

    <input
      id="inputFile"
      type="file"
      accept="image/png, image/jpeg, image/gif, image/jpg"
      style="display: none;"
      @change="uploadFile">
    <edit-image
      :show="showEditImage"
      :file="editFile"
      :image="editImage"
      @save="submitImage"
      @close="showEditImage=false"/>
  </div>
</template>

<script>
import {
  adminUsersUpdateImgAPI,
  adminUsersUpdateAPI
} from '@/api/user/personCenter'
import { mapGetters } from 'vuex'
import { regexIsCRMMobile, regexIsCRMEmail } from '@/utils'
import EditImage from '@/components/EditImage'

export default {
  name: 'EditUserInfo',
  components: {
    EditImage
  },
  data() {
    const sexMap = [
      { label: 'xin vui lòng chọn', value: 0 },
      { label: 'Nam', value: 1 },
      { label: 'Nữ', value: 2 }
    ]
    const validateCRMMobile = (rule, value, callback) => {
      if (!value || value == '' || regexIsCRMMobile(value)) {
        callback()
      } else {
        callback(new Error('Định dạng điện thoại sai'))
      }
    }
    const validateCRMEmail = (rule, value, callback) => {
      if (!value || value == '' || regexIsCRMEmail(value)) {
        callback()
      } else {
        callback(new Error('Định dạng email không chính xác'))
      }
    }
    return {
      fieldList: [
        { label: 'Họ và tên', field: 'realname' },
        { label: 'Số điện thoại (tên đăng nhập)', field: 'mobile', disabled: true },
        { label: 'Quản lý cấp trên', field: 'parentName', disabled: true },
        { label: 'Giới tính', field: 'sex', type: 'select', setting: sexMap },
        { label: 'Email', field: 'email' },
        { label: 'Phòng ban', field: 'deptName', disabled: true },
        { label: 'Chức vụ', field: 'post' }
      ],
      rules: {
        realname: [{ required: true, message: 'Xin vui lòng điền tên của bạn', trigger: 'blur' }],
        email: [{ validator: validateCRMEmail, trigger: 'change' }],
        username: [
          { required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' },
          { validator: validateCRMMobile, trigger: 'change' }
        ]
      },
      form: {},
      loading: false,

      showEditImage: false,
      editFile: null,
      editImage: null
    }
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  watch: {
    userInfo: {
      handler() {
        this.initData()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    initData() {
      this.form = Object.assign({}, this.userInfo)
    },
    handleChangeAvatar() {
      document.getElementById('inputFile').click()
    },
    /**
     * 图片操作
     * @param event
     */
    uploadFile(event) {
      const files = event.target.files
      const file = files[0]
      const reader = new FileReader()
      const self = this
      reader.onload = function(e) {
        let result
        if (typeof e.target.result === 'object') {
          // 把Array Buffer转化为blob 如果是base64不需要
          result = window.URL.createObjectURL(new Blob([e.target.result]))
        } else {
          result = e.target.result
        }
        self.editImage = result
        self.editFile = file
        self.showEditImage = true
        e.target.value = ''
      }
      reader.readAsDataURL(file)
    },
    /**
     * 上传提交头像修改
     * @param data
     */
    submitImage(data) {
      this.loading = true
      const param = new FormData()
      param.append('userId', this.form.userId)
      param.append('file', data.blob, data.file.name)
      adminUsersUpdateImgAPI(param).then(() => {
        this.loading = false
        this.$emit('change')
      }).catch(() => {
        this.loading = false
      })
    },
    /**
     * 个人信息编辑
     */
    handleSave() {
      const params = {
        realname: this.form.realname,
        sex: this.form.sex,
        email: this.form.email,
        post: this.form.post,
        username: this.form.username
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          adminUsersUpdateAPI(params).then(() => {
            this.loading = false
            this.$message.success('Thành công')
            this.$emit('change')
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
  .edit-user-info {
    width: 100%;
    background-color: white;
    padding: 22px 25px;
  }
</style>
