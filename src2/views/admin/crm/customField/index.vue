<template>
  <div class="system-customer">
    <xr-header
      icon-class="wk wk-double-gear"
      icon-color="#1CBAF5"
      label="Cài đặt trường tùy chỉnh" />
    <div class="customer-content">
      <el-table
        v-loading="loading"
        :data="tableList"
        :height="tableHeight"
        highlight-current-row
        style="width: 100%">
        <el-table-column
          prop="name"
          label="Tên trường"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <img
              :src="getCustomFieldIcon( scope.row.label)"
              class="table-item-icon" >
            <span class="table-item-label">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="Thời gian cập nhật"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="table-item-time">{{ scope.row.updateTime == 0 ? 'No' : scope.row.updateTime }}</span>
          </template>
        </el-table-column>

        <el-table-column
          fixed="right"
          label="Tùy chọn"
          width="100">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleCustomField('edit', scope.row, scope.$index)">Chỉnh sử</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleCustomField('preview', scope.row, scope.$index)">Xem trước</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 表单预览 -->
    <preview-field-view
      v-if="showTablePreview"
      :types="tablePreviewData.types"
      :types-id="tablePreviewData.typesId"
      :label="tablePreviewData.label"
      @hiden-view="showTablePreview=false"/>
  </div>
</template>

<script>
import { customFieldIndexAPI } from '@/api/admin/crm'

import PreviewFieldView from '@/views/admin/components/PreviewFieldView'
import XrHeader from '@/components/XrHeader'

export default {
  name: 'CustomField',

  components: {
    PreviewFieldView,
    XrHeader
  },

  data() {
    return {
      loading: false,
      tableHeight: document.documentElement.clientHeight - 140, // 表的高度
      // 自定义字段设置
      tableList: [],
      // 展示表单预览
      tablePreviewData: { types: '', typesId: '' },
      showTablePreview: false
    }
  },

  created() {
    // 控制table的高度
    window.onresize = () => {
      self.tableHeight = document.documentElement.clientHeight - 140
    }

    this.getDetail()
  },

  methods: {
    /**
     * 详情
     */
    getDetail() {
      this.loading = true
      customFieldIndexAPI()
        .then(res => {
          this.tableList = res.data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 列表的编辑和预览
     */
    handleCustomField(type, item, index) {
      if (type == 'edit') {
        this.$router.push({
          name: 'handlefield',
          params: {
            type: {
              1: 'crm_leads',
              2: 'crm_customer',
              3: 'crm_contacts',
              4: 'crm_product',
              5: 'crm_business',
              6: 'crm_contract',
              7: 'crm_receivables',
              17: 'crm_visit'
            }[item.label],
            id: 'none',
            label: item.label
          }
        })
      } else if (type == 'preview') {
        this.tablePreviewData = item
        this.showTablePreview = true
      }
    },

    /**
     * 根据自定义字段types 获取展示icon
     */
    getCustomFieldIcon(label) {
      if (label === 1) {
        return require('@/assets/img/crm/leads.png')
      } else if (label === 2) {
        return require('@/assets/img/crm/customer.png')
      } else if (label === 3) {
        return require('@/assets/img/crm/contacts.png')
      } else if (label === 5) {
        return require('@/assets/img/crm/business.png')
      } else if (label === 6) {
        return require('@/assets/img/crm/contract.png')
      } else if (label === 4) {
        return require('@/assets/img/crm/product.png')
      } else if (label === 7) {
        return require('@/assets/img/crm/receivables.png')
      } else if (label === 17) {
        return require('@/assets/img/crm/visit.png')
      }
      return require('@/assets/img/crm/product.png')
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.system-customer {
  height: 100%;
}
.customer-content {
  border-top: 1px solid $xr-border-line-color;
  border-bottom: 1px solid $xr-border-line-color;
}

.table-item-label {
  vertical-align:middle;
}
.table-item-icon {
  width: 30px;
  height: 30px;
  margin-right: 8px;
  vertical-align:middle;
  border-radius: 4px;
}

.table-item-time {
  color: #999;
}

.el-table {
  /deep/ .el-table__body td {
    height: 60px;
  }
}
</style>
