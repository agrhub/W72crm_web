<template>
  <div>
    <xr-header
      style="padding: 15px 23px;"
      icon-class="wk wk-invoice"
      icon-color="#13BF97"
      label="Quản lý hóa đơn" >
      <template slot="ft">
        <el-button
          v-if="canSave"
          class="xr-btn--orange"
          icon="el-icon-plus"
          type="primary"
          @click="createClick">Hóa đơn mới</el-button>
      </template>
    </xr-header>
    <div
      class="crm-container">
      <xr-table-header
        :handles="handles"
        :selects="selectionList"
        :scenes="scenes"
        @command="handleCommand">
        <span>Lọc：</span>
        <el-select
          v-model="scene"
          class="scene-select"
          @change="sceneChange">
          <el-option
            v-for="(item, index) in scenes"
            :key="index"
            :label="item.name"
            :value="item.sceneId"/>
        </el-select>

        <el-button
          type="primary"
          style="margin-left: 20px;"
          icon="wk wk-screening"
          @click="showFilterClick">Lọc nâng cao</el-button>
        <filter-form
          :field-list="filters"
          :dialog-visible.sync="showFilter"
          :obj="filterObj"
          :save-scene="false"
          @filter="handleFilter" />

        <filter-content
          v-if="filterObj.form && filterObj.form.length > 0"
          slot="append"
          :obj="filterObj"
          @delete="handleDeleteField" />
      </xr-table-header>
      <el-table
        v-loading="loading"
        id="crm-table"
        :row-height="40"
        :data="list"
        :height="tableHeight"
        :cell-class-name="cellClassName"
        :header-cell-class-name="headerCellClassName"
        use-virtual
        class="n-table--border"
        stripe
        border
        highlight-current-row
        style="width: 100%"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange">
        <el-table-column
          show-overflow-tooltip
          type="selection"
          align="center"
          width="55"/>
        <el-table-column
          v-for="(item, index) in fieldList"
          :key="index"
          :prop="item.prop"
          :label="columnHeaderFormatter(item.label)"
          :width="columnWidthFormatter(item.label, item.width)"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <template v-if="item.prop == 'checkStatus'">
              <span :style="getStatusStyle(scope.row.checkStatus)" class="status-mark"/>
              <span>{{ getStatusName(scope.row.checkStatus) }}</span>
            </template>
            <template v-else>
              {{ fieldFormatter(scope.row, scope.column) }}
            </template>
          </template>
        </el-table-column>
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
        <el-table-column />
      </el-table>
      <div class="p-contianer">
        <el-pagination
          :current-page="currentPage"
          :page-sizes="pageSizes"
          :page-size.sync="pageSize"
          :total="total"
          class="p-bar"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"/>
      </div>
    </div>

    <create
      v-if="isCreate"
      @save-success="refreshList"
      @close="isCreate = false"/>
    <mark-invoice
      :visible.sync="markShow"
      :reset="isResetInvoice"
      :detail="rowDetail"
      @change="refreshList"
    />

    <!-- 相关详情页面 -->
    <c-r-m-all-detail
      :visible.sync="showDview"
      :crm-type="rowType"
      :id="rowID"
      class="d-view"
      @handle="handleHandle"/>

    <transfer-handle
      :crm-type="crmType"
      :selection-list="selectionList"
      :dialog-visible.sync="transferDialogShow"
      @handle="refreshList" />
  </div>
</template>

<script>
import {
  crmInvoiceIndexAPI,
  crmInvoiceDeleteIdsAPI
} from '@/api/crm/invoice'

import XrHeader from '@/components/XrHeader'
import XrTableHeader from '@/components/XrTableHeader'
import Create from './Create'
import MarkInvoice from './components/MarkInvoice'
import { XhUserCell } from '@/components/CreateCom'
import TransferHandle from '../components/SelectionHandle/TransferHandle' // 转移
import CRMAllDetail from '@/views/crm/components/CRMAllDetail'
import FilterForm from '../components/FilterForm'
import FilterContent from '../components/FilterForm/FilterContent'

import CheckStatusMixin from '@/mixins/CheckStatusMixin'
import { separator } from '@/filters/vueNumeralFilter/filters'
import { debounce } from 'throttle-debounce'
import { mapGetters } from 'vuex'
import { invoiceFilterFields, invoiceHeaderFields } from './js/fields'

export default {
  name: 'Invoice', // 发票
  components: {
    XrHeader,
    XrTableHeader,
    Create,
    MarkInvoice,
    XhUserCell,
    TransferHandle,
    CRMAllDetail,
    FilterForm,
    FilterContent
  },
  mixins: [CheckStatusMixin],
  props: {},
  data() {
    return {
      loading: false,
      crmType: 'invoice',
      tableHeight: document.documentElement.clientHeight - 235, // 表的高度
      filterParams: {
        invoiceStatus: '',
        invoiceNumber: '',
        logisticsNumber: '',
        customerName: '',
        realInvoiceDate: '',
        checkStatus: '',
        ownerUserId: []
      },
      filterCustomers: {
        customer: [],
        purposecustomer: []
      },
      scene: '',
      scenes: [{
        name: 'Tất cả các hóa đơn',
        sceneId: ''
      }, {
        name: 'Hóa đơn bạn phụ trách',
        sceneId: 1
      }, {
        name: 'Hóa đơn của cấp dưới của bạn',
        sceneId: 2
      }],
      showFilter: false, // 控制筛选框
      filters: invoiceFilterFields,
      filterObj: { form: [] }, // 筛选确定数据
      list: [],
      fieldList: invoiceHeaderFields, // invoice_status
      currentPage: 1,
      pageSize: 15,
      pageSizes: [15, 30, 60, 100],
      total: 0,
      selectionList: [], // 勾选数据 用于全局导出
      isCreate: false,
      rowDetail: {},
      markShow: false,
      isResetInvoice: false,
      transferDialogShow: false,
      showDview: false,
      rowType: '',
      rowID: ''
    }
  },
  computed: {
    ...mapGetters(['crm']),
    handles() {
      const temps = []
      if (this.crm && this.crm[this.crmType]) {
        if (this.crm[this.crmType].delete) {
          temps.push({
            label: 'Xóa',
            command: 'delete',
            icon: 'delete'
          })
        }

        if (this.crm[this.crmType].resetInvoiceStatus && this.selectionList.length == 1) {
          temps.push({
            label: 'Đặt lại thông tin thanh toán',
            command: 'reset',
            icon: 'reset'
          })
        }

        if (this.crm[this.crmType].transfer) {
          temps.push({
            label: 'Chuyển giao',
            command: 'transfer',
            icon: 'transfer'
          })
        }
      }
      return temps
    },
    // 是否能操作
    canUpdateStatus() {
      return this.crm && this.crm[this.crmType] && this.crm[this.crmType].resetInvoiceStatus
    },
    // 是否能保存
    canSave() {
      return this.crm && this.crm[this.crmType] && this.crm[this.crmType].save
    }
  },
  watch: {},
  created() {
    // 控制table的高度
    window.onresize = () => {
      this.updateTableHeight()
    }

    this.debouncedRefreshList = debounce(500, () => {
      this.refreshList()
    })
    this.refreshList()
  },

  beforeDestroy() {},
  methods: {
    /**
     * 刷新
     */
    refreshList() {
      this.handleCurrentChange(1)
    },

    /**
     * 更改每页展示数量
     */
    handleSizeChange(val) {
      this.pageSize = val
      this.getList()
    },

    /**
     * 更改当前页数
     */
    handleCurrentChange(val) {
      this.currentPage = val
      this.getList()
    },

    /**
     * 获取列表
     */
    getList() {
      const params = {
        page: this.currentPage,
        limit: this.pageSize
      }

      if (this.filterObj && this.filterObj.obj && this.filterObj.obj.length > 0) {
        params.searchList = this.filterObj.obj
      }

      if (this.scene) {
        params.sceneId = this.scene
      }


      crmInvoiceIndexAPI(params)
        .then(res => {
          this.list = res.data.list
          this.total = res.data.totalRow
          this.loading = false

          this.$nextTick(() => {
            document.querySelector('.el-table__body-wrapper').scrollTop = 1
          })
        })
        .catch(() => {
          this.loading = false
        })
    },

    columnHeaderFormatter(title) {
      console.log(title)
      title = title.toLowerCase()
      switch (title) {
        // customer
        case 'lead name':
        case 'customer name':
          title = 'Tên khách hàng'
          break
        case 'lead source':
        case 'customer source':
          title = 'Nguồn khách hàng'
          break
        case 'mobile':
          title = 'Số di động'
          break
        case 'telephone':
        case 'phone':
          title = 'Số điện thoại'
          break
        case 'mailbox':
          title = 'Email'
          break
        case 'url':
          title = 'Website'
          break
        case 'customer industry':
          title = 'Lĩnh vực'
          break
        case 'customer level':
          title = 'Độ ưu tiên'
          break
        case 'next contact time':
          title = 'Lần liên hệ kế'
          break
        case 'remark':
          title = 'Ghi chú'
          break
        case 'state':
        case 'status':
          title = 'Trạng thái'
          break
        case 'dealstatus':
          title = 'Trạng thái giao dịch'
          break
        case 'lasttime':
          title = 'Lần liên hệ cuối'
          break
        case 'lastcontent':
          title = 'Nhật ký liên hệ cuối'
          break
        case 'detailaddress':
          title = 'Địa chỉ'
          break
        case 'address':
          title = 'Khu vực'
          break
        case 'poolday':
          title = 'Ngày hết hạn'
          break
        case 'ownerusername':
          title = 'Quản lý'
          break
        case 'updatetime':
          title = 'Ngày cập nhật'
          break
        case 'createtime':
          title = 'Ngày tạo'
          break
        case 'createusername':
          title = 'Người phụ trách'
          break
        // contact
        case 'name':
          title = 'Tên danh bạ'
          break
        case 'post':
          title = 'Chức vụ'
          break
        case 'is the key decision maker':
          title = 'Người quyết định chính'
          break
        case 'remarks':
          title = 'Ghi chú'
          break
        case 'sex':
          title = 'Ông/Bà'
          break
        // business
        case 'business name':
          title = 'Tên cơ hội'
          break
        case 'opportunity amount':
          title = 'Giá trị cơ hội'
          break
        case 'expected transaction date':
          title = 'Ngày chốt dự kiến'
          break
        case 'typename':
          title = 'Loại cơ hội'
          break
        case 'statusname':
          title = 'Trạng thái'
          break
        // contract
        case 'contract number':
          title = 'Số hợp đồng'
          break
        case 'contract name':
          title = 'Tiêu đề hợp đồng'
          break
        case 'business opportunity name':
          title = 'Tên cơ hội'
          break
        case 'contract amount':
          title = 'Giá trị hợp đồng'
          break
        case 'order time':
          title = 'Ngày ký'
          break
        case 'contract start time':
          title = 'Ngày bắt đầu'
          break
        case 'contract end time':
          title = 'Ngày kết thúc'
          break
        case 'customer contractor':
          title = 'Người đại diện'
          break
        case 'company contractor':
          title = 'Công ty'
          break
        case 'contract type':
          title = 'Loại hợp đồng'
          break
        case 'checkstatus':
          title = 'Trạng thái'
          break
        case 'receivedmoney':
          title = 'Số tiền đã thanh toán'
          break
        case 'unreceivedmoney':
          title = 'Số tiền chưa thanh toán'
          break
        // payment
        case 'payment number':
          title = 'Số thanh toán'
          break
        case 'number of periods':
          title = 'Số kỳ'
          break
        case 'return date':
          title = 'Ngày thanh toán'
          break
        case 'receipt amount':
          title = 'Giá trị thanh toán'
          break
        case 'return method':
          title = 'Phương thức thanh toán'
          break
        case 'contractmoney':
          title = 'Giá trị hợp đồng'
          break
        // lead
      }
      // upper first char
      title = title.charAt(0).toUpperCase() + title.slice(1)
      return title
    },

    columnWidthFormatter(title, originWidth) {
      const tempTitle = this.columnHeaderFormatter(title)
      let minWidth = 100
      if (tempTitle.length * 10 > minWidth) {
        minWidth = tempTitle.length * 10
      }
      return minWidth
    },

    /**
     * 格式化字段
     */
    fieldFormatter(row, column, cellValue) {
      if (column.property == 'invoiceType') {
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

    // 0待审核、1审核中、2审核通过、3已拒绝 4已撤回 5未提交
    getStatusStyle(status) {
      return {
        backgroundColor: this.getStatusColor(status)
      }
    },

    /**
     * 开票操作
     */
    markReceivables(scope) {
      this.rowDetail = scope.row
      this.isResetInvoice = false
      this.markShow = true
    },

    /**
     * 改变负责人筛选条件
     */
    changeUserCell(data) {
      this.filterParams.ownerUserId = data.value
      this.refreshList()
    },

    /**
     * 表头勾选
     */
    handleSelectionChange(val) {
      this.selectionList = val // 勾选的行
    },

    /**
     * 列表操作
     */
    handleCommand(command) {
      if (command == 'delete') {
        this.$confirm('Xác nhận xóa？', 'Thông báo', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            this.loading = true
            crmInvoiceDeleteIdsAPI(this.selectionList.map(item => item.invoiceId))
              .then(res => {
                this.loading = false
                this.$message({
                  type: 'success',
                  message: 'Thành công'
                })
                this.refreshList()
              })
              .catch(() => {
                this.loading = false
              })
          })
          .catch(() => {})
      } else if (command == 'transfer') {
        this.transferDialogShow = true
      } else {
        this.rowDetail = this.selectionList[0]
        this.isResetInvoice = true
        this.markShow = true
      }
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'invoiceApplyNumber') {
        return 'can-visit--underline can-visit--bold'
      } else if (
        column.property === 'customerName' ||
        column.property === 'contractNum'
      ) {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    headerCellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.property === 'invoiceApplyNumber') {
        return 'header-can-visit-backgroud'
      }
      return ''
    },

    /**
     * 详情操作
     */
    handleHandle(data) {
      if (['alloc', 'get', 'transfer', 'transform', 'delete', 'put_seas', 'exit-team'].includes(data.type)) {
        this.showDview = false
      }

      this.getList()
    },

    /**
     * 查看详情
     */
    handleRowClick(row, column, event) {
      if (column.property === 'customerName') {
        this.rowID = row.customerId
        this.rowType = 'customer'
        this.showDview = true
      } else if (column.property === 'contractNum') {
        this.rowID = row.contractId
        this.rowType = 'contract'
        this.showDview = true
      } else if (column.property === 'invoiceApplyNumber') {
        this.rowID = row.invoiceId
        this.rowType = 'invoice'
        this.showDview = true
      } else {
        this.showDview = false
      }
    },

    /**
     * 创建点击
     */
    createClick() {
      this.isCreate = true
    },

    /**
     * 切换场景
     */
    sceneChange() {
      this.refreshList()
    },

    showFilterClick() {
      this.showFilter = true
    },

    handleFilter(form) {
      this.filterObj = form
      this.showFilter = false
      this.refreshList()
      this.updateTableHeight()
    },

    handleDeleteField(data) {
      this.filterObj = data.obj
      this.refreshList()
      this.updateTableHeight()
    },

    /**
     * 更新表高
     */
    updateTableHeight() {
      var offsetHei = document.documentElement.clientHeight
      var removeHeight = 0

      if (this.filterObj && this.filterObj.obj && this.filterObj.obj.length > 0) {
        removeHeight = 285
      } else {
        removeHeight = 235
      }
      this.tableHeight = offsetHei - removeHeight
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .xr-table-header {
  border-bottom: 1px solid #e6e6e6;
  border-top: 1px solid #e6e6e6;

  .scene-select {
    width: 180px;
  }
}

.status-mark {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: $xr-border-radius-base;
}
</style>
