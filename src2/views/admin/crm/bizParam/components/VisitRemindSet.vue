<template>
  <div v-loading="loading" class="visit-remind-set">
    <div class="content-title">
      <span>Cài đặt lời nhắc hẹn gặp lại khách hàng</span>
      <el-button
        type="primary"
        class="rt"
        size="medium"
        @click="save">保存</el-button>
    </div>
    <div class="content-body">
      <div class="tips">Sau khi đặt lời nhắc quay lại, lời nhắc này sẽ tự động được nhắc khi hết hạn. Hợp đồng có hiệu lực khi đến thời gian bắt đầu hợp đồng</div>
      <div class="set-content">
        <el-radio
          v-model="status"
          :label="0">Không nhắc nhở</el-radio>
        <el-radio
          v-model="status"
          :label="1">Nhắc lại</el-radio>
        <div
          v-if="status == 1"
          class="time-set">
          <span>Sau khi bắt đầu hợp đồng</span>
          <el-input v-model="value" type="number"/><span>ngày</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  returnVisitConfigQueryAPI,
  returnVisitConfigSetAPI
} from '@/api/admin/crm'

export default {
  name: 'VisitRemindSet',

  components: {},

  data() {
    return {
      loading: false, // 展示加载中效果

      value: 0, // 天数
      status: 0 // 是否提醒 0、不提醒 1、提醒
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
      returnVisitConfigQueryAPI().then(res => {
        this.loading = false
        this.value = res.data.value
        this.status = parseInt(res.data.status)
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
      if (this.status == 1) {
        params.value = this.value
        params.status = 1
      } else {
        params.status = 0
      }
      returnVisitConfigSetAPI(params)
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
