<template>
  <div v-loading="loading" class="rc-cont">
    <flexbox
      v-if="!isSeas"
      class="rc-head"
      direction="row-reverse">
      <el-button
        class="xr-btn--orange rc-head-item"
        icon="el-icon-plus"
        type="primary"
        @click="createClick('title')">Tiêu đề hóa đơn mới</el-button>
    </flexbox>
    <el-table
      :data="titleList"
      :height="tableHeight"
      stripe
      style="width: 100%;border: 1px solid #E6E6E6;">
      <el-table-column
        v-for="(item, index) in titleFieldList"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        :formatter="titleFieldFormatter"
        show-overflow-tooltip/>
      <el-table-column
        label="Tùy chọn"
        width="100"
        fixed="right">
        <template slot-scope="scope">
          <flexbox justify="center">
            <el-button
              type="text"
              @click.native="handleTitle('edit', scope)">Chỉnh sửa</el-button>
            <el-button
              type="text"
              @click.native="handleTitle('delete', scope)">Xóa</el-button>
          </flexbox>
        </template>
      </el-table-column>
    </el-table>

    <flexbox
      class="rc-head"
      direction="row-reverse"
      style="margin-top: 15px;">
      <el-button
        v-if="!isSeas"
        class="xr-btn--orange rc-head-item"
        icon="el-icon-plus"
        type="primary"
        @click="createClick('invoice')">Hóa đơn mới</el-button>
    </flexbox>
    <el-table
      :data="list"
      :height="tableHeight"
      :cell-class-name="cellClassName"
      stripe
      style="width: 100%;border: 1px solid #E6E6E6;"
      @row-click="handleRowClick">
      <el-table-column
        v-for="(item, index) in fieldList"
        :key="index"
        :prop="item.prop"
        :formatter="invoicefieldFormatter"
        :label="item.label"
        :width="item.width"
        show-overflow-tooltip/>
      <el-table-column
        v-if="canUpdateStatus"
        :resizable="false"
        label="Tùy chọn"
        fixed="right"
        width="150">
        <template slot-scope="scope">
          <el-button
            :disabled="scope.row.invoiceStatus == 1"
            :type="scope.row.invoiceStatus == 1 ? '' : 'primary'"
            plain
            @click.native="markReceivables(scope)">{{ scope.row.invoiceStatus == 1 ? 'Đã lập hóa đơn': 'Đánh dấu là đã lập hóa đơn' }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <c-r-m-full-screen-detail
      :visible.sync="showFullDetail"
      :id="showFullId"
      crm-type="invoice"
      @handle="detailHandle"/>
    <create
      v-if="isCreate"
      :detail="{
        customerName: detail.customerName,
        customerId: detail.customerId,
        contactsName: detail.contactsName,
        contactsMobile: detail.contactsMobile,
        contactsAddress: detail.contactsAddress,
      }"
      @save-success="getInvoiceList"
      @close="isCreate=false"/>
    <invoice-title-set
      :visible.sync="titleCreateShow"
      :customer-id="id"
      :detail="titleDetail"
      @change="getTitleList" />
    <mark-invoice
      :visible.sync="markShow"
      :detail="rowDetail"
      @change="getInvoiceList"
    />
  </div>
</template>

<script type="text/javascript">
import {
  crmCustomerInvoiceAPI,
  crmCustomerInvoiceInfoAPI
} from '@/api/crm/customer'
import { crmInvoiceDeleteInvoiceInfoAPI } from '@/api/crm/invoice'


import CheckStatusMixin from '@/mixins/CheckStatusMixin'
import { separator } from '@/filters/vueNumeralFilter/filters'
import InvoiceTitleSet from '../invoice/components/InvoiceTitleSet'
import MarkInvoice from '../invoice/components/MarkInvoice'
import Create from '../invoice/Create'
import { mapGetters } from 'vuex'

export default {
  name: 'RelativeInvoice', // 相关回访

  components: {
    Create,
    InvoiceTitleSet,
    MarkInvoice,
    CRMFullScreenDetail: () => import('@/components/CRMFullScreenDetail')
  },

  mixins: [CheckStatusMixin],

  props: {
    /** 模块ID */
    id: [String, Number],
    /** 没有值就是全部类型 有值就是当个类型 */
    crmType: {
      type: String,
      default: ''
    },
    /** 是公海 默认是客户 */
    isSeas: {
      type: Boolean,
      default: false
    },
    /** 客户和 合同下 可新建 抬头 */
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {
      loading: false,
      list: [],
      fieldList: [],
      tableHeight: '250px',
      showFullDetail: false,
      showFullId: '', // 查看全屏详情的 ID
      isCreate: false, // 新建发票发票
      titleList: [],
      titleFieldList: [],

      titleCreateShow: false,
      titleDetail: null,

      rowDetail: {},
      markShow: false
    }
  },

  inject: ['rootTabs'],

  computed: {
    ...mapGetters(['crm']),
    // 是否能操作
    canUpdateStatus() {
      return this.crm && this.crm.invoice && this.crm.invoice.updateInvoiceStatus
    }
  },

  watch: {
    id(val) {
      this.list = []
      this.titleList = []
      this.getInvoiceList()
      this.getTitleList()
    },

    'rootTabs.currentName'(val) {
      if (val === 'RelativeInvoice') {
        this.getInvoiceList(false)
        this.getTitleList(false)
      }
    }
  },

  mounted() {
    this.titleFieldList = [
      { prop: 'titleType', width: '120', label: 'Tiêu đề' },
      { prop: 'invoiceTitle', width: '120', label: 'Tên hóa đơn' },
      { prop: 'taxNumber', width: '120', label: 'Mã số thuế' },
      { prop: 'depositBank', width: '120', label: 'Ngân hàng' },
      { prop: 'depositAccount', width: '120', label: 'Số tài khoản' },
      { prop: 'depositAddress', width: '120', label: 'Địa chỉ giao dịch' },
      { prop: 'telephone', width: '120', label: 'Số điện thoại' },
      { prop: 'ownerUserName', width: '120', label: 'Người tạo' },
      { prop: 'createTime', width: '120', label: 'Ngày tạo' }
    ]

    this.getTitleList()

    this.fieldList = [
      { prop: 'invoiceApplyNumber', width: '120', label: 'Mã số hóa đơn' },
      { prop: 'contractNum', width: '120', label: 'Số hợp đồng' },
      { prop: 'contractMoney', width: '120', label: 'Giá trị hợp đồng' },
      { prop: 'invoiceMoney', width: '120', label: 'Số tiền hóa đơn （đồng）' },
      { prop: 'invoiceDate', width: '120', label: 'Ngày thanh toán' },
      { prop: 'realInvoiceDate', width: '120', label: 'Ngày thanh toán thực tế' },
      { prop: 'invoiceType', width: '120', label: 'Loại hóa đơn' },
      { prop: 'invoiceNumber', width: '120', label: 'Số hóa đơn' },
      { prop: 'logisticsNumber', width: '120', label: 'Số lô hàng' },
      { prop: 'ownerUserName', width: '120', label: 'Người tạo' },
      { prop: 'checkStatus', width: '120', label: 'Trạng thái' }
    ]
    this.getInvoiceList()
  },

  methods: {
    /**
     * 抬头列表
     */
    getTitleList(loading = true) {
      this.loading = loading
      crmCustomerInvoiceInfoAPI({ customerId: this.id, pageType: 0 })
        .then(res => {
          this.loading = false
          this.titleList = res.data.list
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 发票列表
     */
    getInvoiceList(loading = true) {
      this.loading = loading
      crmCustomerInvoiceAPI({ customerId: this.id, pageType: 0 })
        .then(res => {
          this.loading = false
          this.list = res.data.list
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
    /**
     * 当某一行被点击时会触发该事件
     */
    handleRowClick(row, column, event) {
      if (column.property == 'invoiceApplyNumber') {
        this.showFullId = row.invoiceId
        this.showFullDetail = true
      }
    },

    /**
     * 新建发票和抬头
     */
    createClick(type) {
      if (type == 'invoice') {
        this.isCreate = true
      } else if (type == 'title') {
        this.titleDetail = null
        this.titleCreateShow = true
      }
    },

    /**
     * 编辑操作
     */
    handleTitle(type, item) {
      if (type == 'edit') {
        this.titleDetail = item.row
        this.titleCreateShow = true
      } else if (type == 'delete') {
        this.$confirm('Xác nhận xóa?', 'Thông báo', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            crmInvoiceDeleteInvoiceInfoAPI({
              infoId: item.row.infoId
            })
              .then(res => {
                this.titleList.splice(item.$index, 1)
                this.$message.success('Thành công')
              })
              .catch(() => {})
          })
          .catch(() => {})
      }
    },

    /**
     * 发票格式化字段
     */
    invoicefieldFormatter(row, column) {
      if (column.property === 'checkStatus') {
        return this.getStatusName(row.checkStatus)
      } else if (column.property == 'invoiceType') {
        return {
          1: 'Hóa đơn thuế giá trị gia tăng',
          2: 'Hóa đơn VAT',
          3: 'National tax general machine invoice',
          4: 'General machine invoice for land tax',
          5: 'Biên nhận'
        }[row[column.property]]
      } else if (column.property == 'contractMoney' || column.property == 'invoiceMoney') {
        return separator(row[column.property] || 0)
      }
      return row[column.property] === '' || row[column.property] === null ? '--' : row[column.property]
    },

    /**
     * 抬头格式化字段
     */
    titleFieldFormatter(row, column) {
      if (column.property === 'titleType') {
        return {
          1: 'Tổ chức / Đơn vị',
          2: 'Cá nhân'
        }[row[column.property]]
      }
      return row[column.property] === '' || row[column.property] === null ? '--' : row[column.property]
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'invoiceApplyNumber') {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     * 详情操作
     */
    detailHandle(data) {
      if (data.type === 'delete') {
        this.getInvoiceList()
        this.$nextTick(() => {
          this.$bus.emit('crm-tab-num-update')
        })
      }
    },

    /**
     * 开票操作
     */
    markReceivables(scope) {
      this.rowDetail = scope.row
      this.markShow = true
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../styles/relativecrm.scss';
</style>
