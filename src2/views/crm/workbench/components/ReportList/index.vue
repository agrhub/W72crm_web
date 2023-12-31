<template>
  <el-dialog
    :visible="show"
    :append-to-body="true"
    :close-on-click-modal="false"
    top="10vh"
    width="80%"
    custom-class="no-padding-dialog"
    @close="hideView">

    <div
      slot="title"
      class="header"
      @click="showDview = false">
      <span class="title">{{ title }}</span>
      <el-input
        v-if="placeholder"
        :placeholder="placeholder"
        v-model="inputContent"
        class="search-input"
        @keyup.enter.native="searchInput">
        <el-button
          slot="append"
          icon="el-icon-search"
          @click.native="searchInput" />
      </el-input>
    </div>

    <div class="container">
      <div class="content">
        <div class="list-body">
          <el-table
            v-loading="loading"
            id="crm-table"
            ref="crmTable"
            :data="list"
            :height="tableHeight"
            :cell-class-name="cellClassName"
            stripe
            border
            highlight-current-row
            style="width: 100%"
            @row-click="handleRowClick"
            @sort-change="sortChange">
            <el-table-column
              v-for="(item, index) in showFieldList"
              :key="index"
              :sortable="item.prop != 'poolDay' ? 'custom' : false"
              :fixed="index==0"
              :prop="item.prop"
              :label="columnHeaderFormatter(item.label)"
              :width="columnWidthFormatter(item.label, item.width)"
              show-overflow-tooltip>
              <template slot-scope="scope">
                <template v-if="item.prop == 'dealStatus'">
                  <i :class="scope.row[item.prop] | dealIcon"/>
                  <span>{{ scope.row[item.prop] | dealName }}</span>
                </template>
                <template v-else-if="item.prop == 'status'">
                  <i
                    v-if="scope.row.status == 2"
                    class="wk wk-circle-password customer-lock"/>
                </template>
                <template v-else-if="item.prop == 'checkStatus'">
                  <span
                    :style="{
                      backgroundColor: getStatusColor(scope.row.checkStatus)
                  }" class="status-mark"/>
                  <span>{{ getStatusName(scope.row.checkStatus) }}</span>
                </template>
                <template v-else>{{ fieldFormatter(scope.row, scope.column) }}</template>
              </template>
            </el-table-column>
            <el-table-column v-if="showFillColumn" />
          </el-table>
          <div
            v-if="paging"
            class="p-contianer">
            <el-pagination
              :current-page="currentPage"
              :page-sizes="pageSizes"
              :page-size.sync="pageSize"
              :total="total"
              class="p-bar"
              background
              layout="prev, pager, next, sizes, total, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange" />
          </div>
        </div>
      </div>
      <!-- 相关详情页面 -->
      <c-r-m-all-detail
        :visible.sync="showDview"
        :crm-type="rowType"
        :id="rowID"
        class="d-view"
        @handle="handleHandle" />

      <record-list
        v-if="recordShow"
        :crm-type="rowType"
        :request="recordRequest"
        :params="recordParams"
        @handle="getList"
        @hide="recordShow = false" />
    </div>
  </el-dialog>
</template>
<script type="text/javascript">
import { filedGetTableFieldAPI } from '@/api/crm/common'

import crmTypeModel from '@/views/crm/model/crmTypeModel'
import CRMAllDetail from '@/views/crm/components/CRMAllDetail'
import RecordList from './components/RecordList'

import { mapGetters } from 'vuex'
import Lockr from 'lockr'
import CheckStatusMixin from '@/mixins/CheckStatusMixin'

export default {
  name: 'ReportList', // 简报列表
  components: {
    CRMAllDetail,
    RecordList
  },
  filters: {
    dealIcon(statu) {
      return statu == 1 ? 'wk wk-success deal-suc' : 'wk wk-close deal-un'
    },

    dealName(statu) {
      return statu == 1 ? 'Đã giao dịch' : 'Chưa bán'
    }
  },
  mixins: [CheckStatusMixin],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: String,
    placeholder: {
      type: String,
      default: 'Nhập nội dung tìm kiếm'
    },
    crmType: String,
    fieldList: Array,
    recordRequest: Function,
    request: Function,
    params: Object,
    // 展示分页
    paging: {
      type: Boolean,
      default: true
    },

    sortable: {
      type: [Boolean, String],
      default: false
    }
  },
  data() {
    return {
      inputContent: '',

      loading: false, // 加载动画
      tableHeight: this.getTableHeight(), // 表的高度
      list: [],
      showFieldList: [],
      sortData: {}, // 字段排序
      currentPage: 1,
      pageSize: Lockr.get('crmPageSizes') || 15,
      pageSizes: [15, 30, 60, 100],
      total: 0,

      /** 控制详情展示 */
      rowID: '', // 行信息
      rowType: '', // 详情类型
      showDview: false,
      recordParams: {},
      recordShow: false
    }
  },
  computed: {
    ...mapGetters(['crm']),
    showExamineStatus() {
      if (this.crmType == 'contract' && this.crmType == 'receivables') {
        return true
      }
      return false
    },
    showFillColumn() {
      if (this.fieldList && this.fieldList.length) {
        return false
      }
      return true
    }
  },
  watch: {
    show(value) {
      if (value) {
        this.initInfo()
      }
    }
  },
  mounted() {
    this.$el.addEventListener('click', this.handleDocumentClick, false)
  },

  destroyed() {
    if (this.$el) {
      this.$el
        .removeEventListener('click', this.handleDocumentClick, false)
    }
  },
  methods: {
    /**
     * 获取表高
     */
    getTableHeight() {
      const clientHeight = document.documentElement.clientHeight
      const paddingHieght = clientHeight * 0.2

      return clientHeight - paddingHieght - 200
    },

    /**
     * 初始化数据
     */
    initInfo() {
      this.inputContent = ''
      this.showFieldList = []
      this.sortData = {}
      this.$nextTick(() => {
        this.$refs.crmTable.clearSort()
      })
      this.list = []
      this.currentPage = 1

      window.onresize = () => {
        this.tableHeight = this.getTableHeight()
      }

      if (this.fieldList) {
        this.showFieldList = this.fieldList
        this.getList()
      } else {
        this.getFieldList()
      }
    },

    /**
     * 搜索
     */
    searchInput() {
      this.currentPage = 1
      this.getList()
    },

    /**
     * 获取列表数据
     */
    getList() {
      this.loading = true
      var params = {}

      // 加入分页
      if (this.paging) {
        params = {
          page: this.currentPage,
          limit: this.pageSize
        }
      }

      // 如果有占位符 加入搜索
      if (this.placeholder) {
        params.search = this.inputContent
      }

      if (this.sortData.order) {
        params.sortField = this.sortData.prop
        params.order = this.sortData.order == 'ascending' ? 2 : 1
      }

      this.request({ ...params, ...this.params })
        .then(res => {
          if (this.paging) {
            this.list = res.data.list
            this.total = res.data.totalRow
          } else {
            this.list = res.data
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 获取表头字段
     */
    getFieldList() {
      if (this.showFieldList.length == 0) {
        this.loading = true
        const crmType =
          this.crmType == 'business_status' ? 'business' : this.crmType
        var params = {
          label: crmTypeModel[crmType]
        }

        filedGetTableFieldAPI(params)
          .then(res => {
            for (let index = 0; index < res.data.length; index++) {
              const element = res.data[index]

              var width = 0
              if (!element.width) {
                if (element.name && element.name.length <= 6) {
                  width = element.name.length * 15 + 45
                } else {
                  width = 140
                }
              } else {
                width = element.width
              }

              this.showFieldList.push({
                prop: element.fieldName,
                label: element.name,
                width: width
              })
            }

            // 获取好字段开始请求数据
            this.getList()
          })
          .catch(() => {
            this.loading = false
          })
      } else {
        // 获取好字段开始请求数据
        this.getList()
      }
    },

    columnHeaderFormatter(title) {
      console.log(title)
      title = title.toLowerCase()
      switch (title) {
        // customer
        case 'customer name':
          title = 'Tên khách hàng'
          break
        case 'customer source':
          title = 'Nguồn khách hàng'
          break
        case 'mobile':
          title = 'Số di động'
          break
        case 'telephone':
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
    fieldFormatter(row, column) {
      // 如果需要格式化
      if (this.fieldList && this.fieldList.length) {
        if (column.property == 'crmType') {
          return crmTypeModel.convertTypeToName(row[column.property])
        }
      }
      return row[column.property] === '' || row[column.property] === null ? '--' : row[column.property]
    },

    /**
     * 字段排序
     */
    sortChange(column, prop, order) {
      this.sortData = column
      this.getList()
    },

    /**
     * 更改每页展示数量
     */
    handleSizeChange(val) {
      Lockr.set('crmPageSizes', val)
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
     * 查看详情
     */
    handleRowClick(row, column, event) {
      if (this.crmType === 'leads') {
        if (column.property === 'leadsName') {
          this.rowID = row.leadsId
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'customer') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'contacts') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'name') {
          this.rowID = row.contactsId
          this.rowType = 'contacts'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (
        this.crmType === 'business' ||
        this.crmType === 'business_status'
      ) {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'businessName') {
          this.rowID = row.businessId
          this.rowType = 'business'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'contract') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'businessName') {
          this.rowID = row.businessId
          this.rowType = 'business'
          this.showDview = true
        } else if (column.property === 'contactsName') {
          this.rowID = row.contactsId
          this.rowType = 'contacts'
          this.showDview = true
        } else if (column.property === 'num' || column.property === 'name') {
          this.rowID = row.contractId
          this.rowType = 'contract'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'product') {
        if (column.property === 'name') {
          this.rowID = row.productId
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'receivables') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'contractNum') {
          this.rowID = row.contractId
          this.rowType = 'contract'
          this.showDview = true
        } else if (column.property === 'number') {
          this.rowID = row.receivablesId
          this.rowType = 'receivables'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'record') {
        if (column.property === 'count' && row.count) {
          this.rowType = 'crm_' + crmTypeModel.convertTypeToKey(row.crmType)
          this.recordParams = { crmType: row.crmType, queryType: 0, ...this.params }
          this.recordShow = true
        } else {
          this.recordShow = false
        }
      }
    },

    /**
     * 详情操作
     */
    handleHandle(data) {
      if (
        data.type === 'alloc' ||
        data.type === 'get' ||
        data.type === 'transfer' ||
        data.type === 'transform' ||
        data.type === 'delete' ||
        data.type === 'put_seas'
      ) {
        this.showDview = false
      }

      if (data.type !== 'edit') {
        this.getList()
      }
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (
        this.crmType &&
        (column.property === 'customerName' ||
          column.property === 'businessName' ||
          column.property === 'name' ||
          column.property === 'contactsName' ||
          column.property === 'num' ||
          column.property === 'contractNum' ||
          column.property === 'number' ||
          (this.crmType === 'record' && column.property === 'count' &&
        row[column.property]))
      ) {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     * 隐藏视图
     */
    hideView() {
      this.$emit('update:show', false)
      this.$emit('hide')
    },

    /**
     * 点击列表内容之外的区域隐藏
     */
    handleDocumentClick(e) {
      var hidden = true
      var items = document.getElementsByClassName('el-table__row')
      if (items && hidden) {
        for (let index = 0; index < items.length; index++) {
          const element = items[index]
          if (element.contains(e.target)) {
            hidden = false
            break
          }
        }
      }

      if (
        document.getElementById('slide') &&
        document.getElementById('slide').contains(e.target)
      ) {
        hidden = false
      }
      if (hidden) {
        this.showDview = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../../styles/table.scss';

/** 容器布局 */
.container {
  height: 100%;
}

.content {
  position: relative;
  height: 100%;
  padding: 0 15px 15px;
}

.header {
  position: relative;
  padding: 10px 20px 10px 0;

  .title {
    font-size: 16px;
    color: #333;
    font-weight: 600;
  }
  .search-input {
    width: 300px;
    margin: -18px 0 0 -150px;
    position: absolute;
    left: 50%;
    top: 50%;
  }
}

.p-contianer {
  border: 1px solid $xr-border-line-color;
  border-top: none;
}

.d-view {
  top: 0;
}

</style>
