<template>
  <div v-loading="loading">
    <div class="content-title">
      <span>Cài đặt nhắc nhở hết hạn hợp đồng</span>
      <el-button
        type="primary"
        class="rt"
        size="medium"
        @click="save">Lưu</el-button>
    </div>
    <div class="content-body">
      <div class="tips">Sau khi đặt trước số ngày, thời gian nhắc nhở sẽ được tính theo "Thời gian hết hạn hợp đồng" của hợp đồng</div>
      <div class="set-content">
        <el-radio
          v-model="contractConfig"
          :label="0">Không nhắc nhở</el-radio>
        <el-radio
          v-model="contractConfig"
          :label="1">Nhắc nhở trước ngày</el-radio>
        <div
          v-if="contractConfig == 1"
          class="time-set">
          <el-input-number v-model="contractDay" :controls="false" :min="0" step-strictly/><span>ngày</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { crmSettingContractDayAPI } from '@/api/admin/crm'

export default {
  name: 'ContractExpireSet',

  components: {},

  data() {
    return {
      loading: false, // 展示加载中效果

      contractDay: 0, // 合同到期提醒天数
      contractConfig: 0 // 是否提醒 0、不提醒 1、提醒
    }
  },

  created() {
    this.getDetail()
  },

  methods: {
    /**
     * 获取详情
     */
    getDetail() {
      this.loading = true
      this.$store
        .dispatch('CRMSettingConfig')
        .then(res => {
          this.loading = false
          this.contractDay = res.data.contractDay
          this.contractConfig = parseInt(res.data.contractConfig)
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 保存操作
     */
    save() {
      this.loading = true
      const params = {}
      if (this.contractConfig == 1) {
        params.contractDay = this.contractDay
        params.status = 1
      } else {
        params.status = 0
      }
      crmSettingContractDayAPI(params)
        .then(res => {
          this.loading = false
          this.$message.success('Thành công')
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.content-title {
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.content-title > span {
  display: inline-block;
  height: 36px;
  line-height: 36px;
  margin-left: 20px;
}

.content-body {
  height: calc(100% - 57px);
  padding: 30px;
  overflow-y: auto;
}

/* 合同 样式*/
.tips {
  font-size: 13px;
  color: #999;
}

.el-radio {
  display: block;
  padding: 10px 0;
}

.set-content {
  margin-top: 20px;
}

.time-set {
  padding-left: 20px;
  margin-top: 5px;

  .el-input {
    width: 200px;
  }

  span {
    margin-left: 5px;
    color: #333333;
    font-size: 13px;
  }
}
</style>
