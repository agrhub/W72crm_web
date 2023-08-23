<template>
  <el-dialog
    :visible.sync="visible"
    :show-close="false"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    class="approval-flow-update-dialog"
    title="Thông báo"
    width="700px"
    destroy-on-close>
    <template slot="title"><i class="el-icon-warning" />Các thay đổi đối với quy trình phê duyệt!</template>
    <div class="content">Khi quy trình phê duyệt được nâng cấp hoàn toàn, quy trình phê duyệt được thay đổi như sau：<br>
      <span>① Dữ liệu có trạng thái xem xét là "Đang chờ xem xét, đang xem xét" được tự động xử lý là "Bị từ chối" và cần được người khởi xướng chỉnh sửa và gửi lại.</span><br>
      ② Nếu quy trình phê duyệt cố định được sử dụng để phê duyệt, quy trình phê duyệt đó sẽ tự động được điều chỉnh theo quy trình phê duyệt mới và quy trình phê duyệt sẽ không bị ảnh hưởng.<br>
      ③ Nếu quy trình phê duyệt ban đầu là "người phê duyệt được ủy quyền", quy trình đó sẽ tự động trở thành "người khởi xướng tùy chọn" trong quy trình phê duyệt mới và quy trình phê duyệt khác với quy trình phê duyệt ban đầu.</div>
    <div class="content">Nếu bạn phản đối quy trình phê duyệt, vui lòng liên hệ ngay với quản trị viên hệ thống để cấu hình lại quy trình phê duyệt này! Xin lỗi vì sự bất tiện mang đến cho bạn.</div>
    <div class="des">Lưu ý: Tự chọn người khởi xướng có nghĩa là khi người khởi tạo tạo biểu mẫu, người phê duyệt của mỗi nút được chọn tự do. Không cần chọn người phê duyệt. Cấu hình hiện tại có thể chọn nhiều người phê duyệt theo mặc định và phê duyệt chúng theo trình tự thứ tự của những người phê duyệt.</div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="sureClick">Tôi đã hiểu</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Lockr from 'lockr'

export default {
  // 审批流升级说明弹窗
  name: 'ApprovalFlowUpdateDialog',

  components: {},

  props: {
  },

  data() {
    return {
      visible: false
    }
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {
    const visible = Lockr.get('WkApprovalFlowUpdateDialog')
    if (!visible) {
      setTimeout(() => {
        this.visible = true
      }, 1000)
    }
  },

  beforeDestroy() {},

  methods: {
    sureClick() {
      Lockr.set('WkApprovalFlowUpdateDialog', true)
      this.visible = false
    }
  }
}
</script>

<style lang="scss">
.approval-flow-update-dialog {
  .el-dialog__header {
    font-size: 15px;
    font-weight: bold;
    .el-icon-warning {
      color: #F9A74E;
      margin-right: 5px;
    }
  }

  .el-dialog__body {
    padding-top: 10px;
    padding-left: 35px;
    padding-right: 35px;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    .content {
      span {
        color: red;
      }
    }

    .content + .content {
      margin-top: 30px;
    }

    .des {
      margin-top: 30px;
      color: #999;
      font-size: 13px;
    }
  }
}
</style>
