<template>
  <div class="import-history">
    <div class="import-history__hd">
      <span class="import-history__title">Xem lịch sử nhập dữ liệu</span>
      <span class="import-history__des">(Dữ liệu lỗi chỉ được lưu trong bảy ngày và sẽ tự động hết hạn sau bảy ngày)</span>

      <el-button
        class="xr-icon-close-btn"
        icon="el-icon-close"
        @click="closeClick" />
    </div>

    <el-table
      :data="tableList"
      class="import-history__bd"
      height="250"
      style="width: 100%">
      <el-table-column
        prop="createTime"
        label="Ngày nhập"
        width="120">
        <template slot-scope="scope">
          {{ scope.row.createTime | createTime }}
        </template>
      </el-table-column>
      <el-table-column
        prop="realname"
        label="Người nhập"
        width="80"/>
      <el-table-column
        prop="address"
        label="Kết quả nhập dữ liệu">
        <template slot-scope="scope">
          {{ `Tổng số dòng đã nhập: ${scope.row.title} dòng，${getImportContent(scope.row.title, scope.row.content)}` }}
        </template>
      </el-table-column>
      <el-table-column
        prop="option"
        width="150"
        label="Tùy chọn">
        <template slot-scope="scope">
          <template v-if="getErrorNum(scope.row.content) > 0">
            <el-button
              v-if="scope.row.valid == 1"
              type="text"
              @click="downloadError(scope.row.messageId)">Tải về dữ liệu lỗi</el-button>
            <span v-else-if="scope.row.valid == 0" class="invalid-tips">Hết hạn</span>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <div class="import-history__ft">
      <el-button
        type="primary"
        @click="closeClick">Đóng</el-button>
    </div>
  </div>
</template>

<script>
import { systemMessageListAPI } from '@/api/common'
import {
  crmDownImportErrorAPI
} from '@/api/crm/common'

import { downloadExcelWithResData } from '@/utils/index'

export default {
  // 导入历史
  name: 'CRMImportHistory',
  components: {},
  filters: {
    createTime(time) {
      const times = time.split(' ')
      return times.length > 0 ? times[0] : ''
    }
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    // CRM类型
    crmType: {
      type: String,
      default: ''
    },
    // moduleType
    props: Object
  },
  data() {
    return {
      loading: false,
      tableList: []
    }
  },
  computed: {},
  watch: {
    show(value) {
      if (value) {
        this.getList()
      }
    }
  },
  mounted() {},

  beforeDestroy() {},
  methods: {
    getList() {
      this.loading = true
      systemMessageListAPI({
        page: 1,
        limit: 9999,
        type: {
          customer: 14,
          contacts: 16,
          leads: 18,
          product: 20
        }[this.crmType] || this.props.moduleType
      })
        .then(res => {
          this.loading = false
          this.tableList = res.data.list
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 下载错误数据
     */
    downloadError(messageId) {
      crmDownImportErrorAPI({ messageId })
        .then(res => {
          downloadExcelWithResData(res)
        })
        .catch(() => {
        })
    },

    getImportContent(totalSize, content) {
      const list = content.split(',') || []
      const updateSize = Number(list[1] || '0')
      const errSize = Number(list[0] || '0')
      return `Tổng số: ${updateSize} dòng， Thành công: ${totalSize - errSize} dòng，Lỗi: ${errSize} dòng`
    },

    /**
     * 获取错误数据数
     */
    getErrorNum(content) {
      const list = content.split(',') || []
      const errSize = Number(list[0] || '0')
      return parseInt(errSize)
    },

    /**
     * 关闭
     */
    closeClick() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.import-history {
  &__hd {
    padding: 20px;
    padding-bottom: 10px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  &__des {
    font-size: 12px;
    color: #ccc;
  }

  &__bd {
    border-top: 1px solid #e6e6e6;
  }

  &__ft {
    padding: 10px;
    background-color: #F7F8FA;

    text-align: right;
  }

  .xr-icon-close-btn {
    float: right;
  }
}

.invalid-tips {
  color: #999;
}
</style>
