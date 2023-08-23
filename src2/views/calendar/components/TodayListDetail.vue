<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :lock-scroll="true"
    modal-append-to-body
    append-to-body
    width="950px"
    @close="close">
    <div slot="title">
      <span :style="{backgroundColor: blockColor}" class="block"/>
      <span class="title-text">{{ detail.typeName || todayDetailData.title }}</span>
      <span v-if="id != -1" class="title-message">{{ detail.createUserName }} tạo lúc {{ timeFormatted(detail.createTime) }}
        <el-dropdown
          trigger="click"
          @command="handleTypeDrop">
          <el-button icon="el-icon-more"/>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(item, index) in moreTypes"
              :key="index"
              :command="item.type">{{ item.title }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </span>
    </div>
    <div v-loading="loading" class="scroll_content">
      <template v-if="id == -1">
        <el-table
          id="crm-table"
          :data="list"
          :cell-class-name="cellClassName"
          height="450"
          class="n-table--border"
          stripe
          border
          highlight-current-row
          style="width: 100%"
          @row-click="handleRowClick">
          <el-table-column
            v-for="(item, index) in fieldList"
            :key="index"
            :prop="item.prop"
            :label="item.label"
            :min-width="item.width"
            :formatter="fieldFormatter"
            show-overflow-tooltip>
            <template slot-scope="scope">
              <template v-if="item.prop == 'dealStatus'">
                <i :class="scope.row[item.prop] | dealIcon"/>
                <span>{{ scope.row[item.prop] | dealName }}</span>
              </template>
              <template v-else-if="item.prop == 'status' && crmType === 'customer'">
                <i
                  v-if="scope.row.status == 2"
                  class="wk wk-circle-password customer-lock"/>
              </template>
              <template v-else-if="item.prop == 'checkStatus'">
                <span :style="getStatusStyle(scope.row.checkStatus)" class="status-mark"/>
                <span>{{ getStatusName(scope.row.checkStatus) }}</span>
              </template>
              <template v-else>
                {{ scope.row[item.prop] }}
              </template>
            </template>
          </el-table-column>
          <el-table-column :resizable="false"/>
        </el-table>
        <div class="p-contianer">
          <el-pagination
            :current-page="currentPage"
            :page-sizes="pageSizes"
            :page-size.sync="pageSize"
            :total="total"
            class="p-bar"
            background
            layout="prev, pager, next, sizes, total, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"/>
        </div>
      </template>
      <template v-else>
        <div class="common-box">
          <div class="common-title">{{ todayDetailData.title || detail.title }}</div>

          <flexbox class="common-header">
            <flexbox class="header-left">
              <span class="time-circle">
                <span class="wk wk-l-time"/>
              </span>

              <div class="time-text">
                <div class="text-up">{{ formattedTime(todayDetailData.startTime) }}</div>
                <div class="time-time">Thời gian bắt đầu</div>
              </div>
            </flexbox>

            <flexbox class="header-right">
              <i class="el-icon-remove"/>
              <div class="time-text">
                <div class="text-up">{{ formattedTime(todayDetailData.endTime) }}</div>
                <div class="time-time">Thời gian kết thúc</div>
              </div>
            </flexbox>
          </flexbox>

          <div class="common-content">
            <div class="content-title">Người thực hiện</div>
            <flexbox>
              <xr-avatar
                v-for="item in detail.ownerUserList"
                :id="item.userId"
                :key="item.userId"
                :size="32"
                :disabled="false"
                :name="item.realname"
                :src="item.img"
                trigger="hover"
                class="user-img"/>
            </flexbox>
          </div>

          <div class="common-bootom">
            <!-- <div class="type_type">
              <p>Loại lặp lại：</p>
              <span>{{ repeatText }}</span>
            </div> -->
            <div class="type_time">
              <p>Nhắc nhở trước thời gian：</p>
              <span v-for="(notice, index) in noticeList" :key="index"><span v-if="index != 0">、</span>trước {{ notice.value }} {{ timeList[notice.type] }}</span>

            </div>
          </div>

          <div class="common-foot">

            <div v-if="relatedCount > 0" class="section__hd">
              <i class="wukong wukong-relevance" />
              <span>Thông tin liên quan({{ relatedCount }})</span>
            </div>

            <p v-else>Không có thông tin</p>

            <div class="section_scroll">
              <div>
                <related-business-cell
                  v-for="(item, itemIndex) in detail.customerList"
                  :data="item"
                  :cell-index="itemIndex"
                  :key="item.customerId"
                  :show-foot="false"
                  type="customer"
                  @click.native="checkRelatedDetail(item, 'customer')" />
                <related-business-cell
                  v-for="(item, itemIndex) in detail.contactsList"
                  :data="item"
                  :cell-index="itemIndex"
                  :key="item.contactsId"
                  :show-foot="false"
                  type="contacts"
                  @click.native="checkRelatedDetail(item, 'contacts')" />
                <related-business-cell
                  v-for="(item, itemIndex) in detail.contractList"
                  :data="item"
                  :cell-index="itemIndex"
                  :key="item.contractId"
                  :show-foot="false"
                  type="contract"
                  @click.native="checkRelatedDetail(item, 'contract')" />
                <related-business-cell
                  v-for="(item, itemIndex) in detail.businessList"
                  :data="item"
                  :cell-index="itemIndex"
                  :key="item.businessId"
                  :show-foot="false"
                  type="business"
                  @click.native="checkRelatedDetail(item, 'business')" />
              </div>
            </div>

          </div>
        </div>
      </template>
    </div>

    <create-event
      :show-create="showCreate"
      :edit-all="editAll"
      :cus-check="cusCheck"
      :today-detail-data="detail"
      title="Chỉnh sửa lịch biểu"
      @createSuccess="handleSure"
      @handleSure="handleSure"
      @close="showCreate = false"/>
    <!-- CRM详情 -->
    <c-r-m-full-screen-detail
      :visible.sync="showFullDetail"
      :crm-type="crmType"
      :id="relationID" />
  </el-dialog>
</template>
<script>

import {
  canlendarDeleteAPI,
  canlendarQueryByIdAPI,
  canlendarTodayContractAPI,
  canlendarTodayCustomerAPI,
  canlendarTodayLeadsAPI,
  canlendarTodayBusinessAPI,
  canlendarTodayDealBusinessAPI
} from '@/api/calendar'
import RelatedBusinessCell from '@/views/oa/components/RelatedBusinessCell'
import TaskDetail from '@/views/taskExamine/task/components/TaskDetail'
import CreateEvent from './CreateEvent'
import CheckStatusMixin from '@/mixins/CheckStatusMixin'
import moment from 'moment'
export default {
  name: 'TodayListDetail',
  components: {
    RelatedBusinessCell,
    CreateEvent,
    TaskDetail,
    CRMFullScreenDetail: () =>
      import('@/components/CRMFullScreenDetail')
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
    id: {
      type: [String, Number],
      default: ''
    },
    showTodayDetail: {
      type: Boolean,
      default: false
    },
    todayDetailData: {
      type: Object,
      default: () => {
        return {
          customerList: []
        }
      }
    },
    cusCheck: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      // 详情参数
      showFullDetail: false,
      crmType: 'customer',
      relationID: 0,
      // 任务详情
      taskDetailShow: false,
      taskID: 0,
      detailIndex: -1,

      dialogVisible: false,
      detail: {
        customerList: []
      },
      fieldList: [],
      list: [],
      loading: false,
      currentPage: 1,
      pageSize: 15,
      pageSizes: [15, 30, 45, 60],
      total: 0,
      moreTypes: [
        { title: 'Chỉ xóa lần này', type: 'delete' },
        { title: 'Xóa hiện tại và tương lai', type: 'deleteAll' },
        { title: 'Chỉ chỉnh sửa lần này', type: 'edit' },
        { title: 'Chỉnh sửa hiện tại và tương lai', type: 'editAll' }],
      showCreate: false,
      // 是否编辑整个系列
      editAll: false,
      repeatText: '',
      blockColor: '',
      noticeList: [],
      timeList: ['', 'phút', 'giờ', 'ngày']
    }
  },
  computed: {
    // 相关信息数量
    relatedCount() {
      let count = 0
      const keys = ['customerList', 'contactsList', 'contractList', 'businessList']
      keys.forEach(key => {
        if (this.detail[key]) {
          count += this.detail[key].length
        }
      })
      return count
    }
  },
  watch: {
    showTodayDetail(val) {
      this.dialogVisible = val
      if (val) {
        if (this.id == -1) {
          this.getFieldList()
          this.blockColor = this.todayDetailData.backgroundColor
          this.detail = {
            customerList: []
          }
        } else {
          this.getDetail()
        }
      }
    },
    detail: {
      handler(val) {
        if (val.repetitionType === 1) {
          this.moreTypes = [
            { title: 'Xóa', type: 'delete' },
            { title: 'Chỉnh sửa', type: 'edit' }
          ]
        } else {
          this.moreTypes = [
            { title: 'Chỉ chỉnh sửa lần này', type: 'edit' },
            { title: 'Chỉnh sửa hiện tại và tương lai', type: 'editAll' },
            { title: 'Chỉ xóa lần này', type: 'delete' },
            { title: 'Xóa hiện tại và tương lai', type: 'deleteAll' }]
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /**
     * 获取详情
     */
    getDetail() {
      this.loading = true
      const startTime = new Date(this.todayDetailData.startTime).getTime()
      const endTime = new Date(this.todayDetailData.endTime).getTime()
      canlendarQueryByIdAPI({
        eventId: this.id,
        startTime: startTime,
        endTime: endTime
      }).then(res => {
        const detail = res.data || {}
        detail.contactsList = (detail.contactsList || []).map(item => {
          if (item.id) {
            item.contactsId = item.id
          }
          return item
        })
        detail.customerList = (detail.customerList || []).map(item => {
          if (item.id) {
            item.customerId = item.id
          }
          return item
        })
        detail.businessList = (detail.businessList || []).map(item => {
          if (item.id) {
            item.businessId = item.id
          }
          return item
        })
        detail.contractList = (detail.contractList || []).map(item => {
          if (item.id) {
            item.contractId = item.id
          }
          return item
        })
        this.detail = detail
        this.noticeList = res.data.noticeList
        // this.repeatText = this.summaryText()
        this.blockColor = this.detail.color
        this.loading = false
      }).catch(() => {
        this.loading = false
        this.close()
      })
    },

    /**
     * 获取表头
     */
    getFieldList() {
      if (this.todayDetailData.crmType === 'customer') {
        this.fieldList = [
          { label: 'Tên khách hàng', prop: 'customerName', width: 105 },
          { label: 'Lần liên hệ tiếp theo', prop: 'nextTime', width: 135 },
          { label: 'Lần liên hệ cuối cùng', prop: 'updateTime', width: 135 },
          { label: 'Người tạo', prop: 'ownerUserName', width: 80 },
          { label: 'Ngày tạo ', prop: 'createTime', width: 105 }
        ]
      } else if (this.todayDetailData.crmType === 'leads') {
        this.fieldList = [
          { label: 'Tên khách hàng tiềm năng', prop: 'leadsName', width: 105 },
          { label: 'Lần liên hệ tiếp theo', prop: 'nextTime', width: 135 },
          { label: 'Lần liên hệ cuối cùng', prop: 'updateTime', width: 135 },
          { label: 'Người tạo', prop: 'ownerUserName', width: 80 },
          { label: 'Ngày tạo ', prop: 'createTime', width: 105 }
        ]
      } else if (this.todayDetailData.crmType === 'business') {
        this.fieldList = [
          { label: 'Tên cơ hội', prop: 'businessName', width: 105 },
          { label: 'Lần liên hệ tiếp theo', prop: 'nextTime', width: 135 },
          { label: 'Lần liên hệ cuối cùng', prop: 'updateTime', width: 135 },
          { label: 'Người tạo', prop: 'ownerUserName', width: 80 },
          { label: 'Ngày tạo ', prop: 'createTime', width: 105 }
        ]
      } else if (this.todayDetailData.crmType === 'dealBusiness') {
        this.fieldList = [
          { label: 'Tên cơ hội', prop: 'businessName', width: 105 },
          { label: 'Thời gian giao dịch ước tính', prop: 'dealDate', width: 135 },
          { label: 'Lần liên hệ cuối cùng', prop: 'updateTime', width: 135 },
          { label: 'Người tạo', prop: 'ownerUserName', width: 80 },
          { label: 'Ngày tạo ', prop: 'createTime', width: 105 }
        ]
      } else if (this.todayDetailData.crmType === 'receiveContract') {
        this.fieldList = [
          { label: 'Mã hợp đồng', prop: 'num', width: 105 },
          { label: 'Tên khách hàng', prop: 'customerName', width: 105 },
          { label: 'Thời gian thanh toán dự kiến', prop: 'planNum', width: 135 },
          { label: 'Ngày thanh toán dự kiến', prop: 'returnDate', width: 135 },
          { label: 'Phương thức thanh toán dự kiến', prop: 'returnType', width: 135 }
        ]
      } else {
        this.fieldList = [
          { label: 'Mã hợp đồng', prop: 'num', width: 105 },
          { label: 'Tiêu đề hợp đồng', prop: 'name', width: 105 },
          { label: 'Tên khách hàng', prop: 'customerName', width: 105 },
          { label: 'Giá trị hợp đồng', prop: 'money', width: 105 },
          { label: 'Ngày bắt đầu', prop: 'startTime', width: 105 },
          { label: 'Ngày kết thúc', prop: 'endTime', width: 105 },
          { label: 'Người tạo', prop: 'ownerUserName', width: 80 }
        ]
      }
      this.getList()
    },

    /**
     * 重复文字 暂时去掉
     */
    summaryText() {
      if (this.detail.repetitionType === 1) {
        return 'Không lặp lại'
      } else if (this.detail.repetitionType === 2) {
        let day = ''
        if (this.detail.repeatRate == 1) {
          day = ''
        } else {
          day = this.detail.repeatRate
        }
        return `Mỗi ${day} ngày`
      } else if (this.detail.repetitionType === 3) {
        return `Mỗi ${this.detail.repeatRate} tuần， hàng tuần ${this.detail.repeatTime}`
      } else if (this.detail.repetitionType === 4) {
        return `Mỗi ${this.detail.repeatRate} tháng，đầu tiên ${this.detail.repeatTime} ngày`
      } else if (this.detail.repetitionType === 5) {
        return `Mỗi ${this.detail.repeatRate} năm`
      }
    },
    /**
     * 获取宽度
     */
    handelFieldList(list) {
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
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

        this.fieldList.push({
          prop: element.fieldName,
          label: element.name,
          width: width
        })
      }
    },

    /**
     * 获取列表
     */
    getList() {
      var crmIndexRequest = this.getIndexRequest()
      const startTime = new Date(this.todayDetailData.startTime).getTime()
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        time: startTime,
        isSub: 1,
        type: 1
      }
      if (this.todayDetailData.userId) {
        params.userId = this.todayDetailData.userId
      }
      if (this.todayDetailData.crmType === 'receiveContract') {
        params.type = 2
      } else if (this.todayDetailData.crmType === 'contract') {
        params.type = 1
      }
      this.loading = true
      crmIndexRequest(params)
        .then(res => {
          this.list = res.data.list
          this.total = res.data.totalRow
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 获取列表请求
     */
    getIndexRequest() {
      if (this.todayDetailData.crmType === 'customer') {
        return canlendarTodayCustomerAPI
      } else if (this.todayDetailData.crmType == 'leads') {
        return canlendarTodayLeadsAPI
      } else if (this.todayDetailData.crmType == 'business') {
        return canlendarTodayBusinessAPI
      } else if (this.todayDetailData.crmType == 'dealBusiness') {
        return canlendarTodayDealBusinessAPI
      } else {
        return canlendarTodayContractAPI
      }
    },

    /**
     * 关闭
     */
    close() {
      this.$emit('close')
    },

    /**
     * 数据格式化
     */
    fieldFormatter(row, column, cellValue) {
      if (column.property === 'priority') {
        const list = ['N/A', 'Thấp', 'Trung bình', 'Cao']
        return list[cellValue]
      }
      return cellValue === '' || cellValue === null ? '--' : cellValue
    },

    /**
     * 行点击
     */
    handleRowClick(row, column, event) {
      if (this.todayDetailData.crmType === 'customer') {
        if (column.property === 'customerName') {
          this.relationID = row.customerId
          this.crmType = 'customer'
          this.showFullDetail = true
        } else {
          this.showFullDetail = false
        }
      } else if (this.todayDetailData.crmType === 'leads') {
        if (column.property === 'leadsName') {
          this.relationID = row.leadsId
          this.crmType = 'leads'
          this.showFullDetail = true
        } else {
          this.showFullDetail = false
        }
      } else if (this.todayDetailData.crmType === 'business' || this.todayDetailData.crmType === 'dealBusiness') {
        if (column.property === 'businessName') {
          this.relationID = row.businessId
          this.crmType = 'business'
          this.showFullDetail = true
        } else {
          this.showFullDetail = false
        }
      } else if (this.todayDetailData.crmType === 'receiveContract') {
        if (column.property === 'customerName') {
          this.relationID = row.customerId
          this.crmType = 'customer'
          this.showFullDetail = true
        } else if (column.property === 'num' || column.property === 'contractName') {
          this.relationID = row.contractId
          this.crmType = 'contract'
          this.showFullDetail = true
        } else {
          this.showFullDetail = false
        }
      } else {
        if (column.property === 'customerName') {
          this.relationID = row.customerId
          this.crmType = 'customer'
          this.showFullDetail = true
        } else if (column.property === 'businessName') {
          if (row.businessId) {
            this.relationID = row.businessId
            this.crmType = 'business'
            this.showFullDetail = true
          } else {
            this.showFullDetail = false
          }
        } else if (column.property === 'contactsName') {
          this.relationID = row.contactsId
          this.crmType = 'contacts'
          this.showFullDetail = true
        } else if (column.property === 'num') {
          this.relationID = row.contractId
          this.crmType = 'contract'
          this.showFullDetail = true
        } else {
          this.showFullDetail = false
        }
      }
    },
    /**
     * 每页条数改变
     */
    handleSizeChange(val) {
      this.pageSize = val
      this.getList()
    },

    /**
     * 页数改变
     */
    handleCurrentChange(val) {
      this.currentPage = val
      this.getList()
    },

    /**
     * 时间格式化
     */
    formattedTime(date) {
      const timestemp = new Date(date)
      return moment(timestemp).format('MMM Do HH:mm:ss')
    },
    /**
     * 时间格式化
     */
    timeFormatted(date) {
      if (!date) {
        return ''
      }
      const timestemp = new Date(date)
      return moment(timestemp).format('YYYY-MM-DD')
    },
    /**
     * 相关信息的点击
     */
    checkRelatedDetail(item, key) {
      this.crmType = key
      this.relationID = item[key + 'Id']
      this.showFullDetail = true
    },

    /**
     * 更多操作
     */
    handleTypeDrop(command) {
      if (command === 'delete') {
        this.delete(command)
      } else if (command === 'deleteAll') {
        this.delete(command)
      } else if (command === 'edit') {
        this.edit(command)
      } else if (command === 'editAll') {
        this.edit(command)
      }
    },

    /**
     * 删除
     */
    delete(type) {
      this.$confirm('Thao tác này sẽ xóa vĩnh viễn lịch biểu, có tiếp tục không?', 'Thông báo', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        const timestemp = new Date(this.detail.startTime).getTime()
        const params = {
          eventId: this.id,
          time: timestemp,
          batchId: this.detail.batchId
        }
        if (type === 'delete') {
          params.type = 1
        } else if (type === 'deleteAll') {
          params.type = 2
        }
        canlendarDeleteAPI(params).then(res => {
          this.$message.success('Thành công')
          this.$emit('deleteSuccess')
        }).catch(() => {})
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Không thành công'
        })
      })
    },

    /**
     * 编辑
     */
    edit(type) {
      if (type === 'editAll') {
        this.editAll = true
      } else {
        this.editAll = false
      }
      this.showCreate = true
    },

    /**
     * 编辑成功的回调
     */
    handleSure() {
      this.showCreate = false
      this.$emit('createSuccess')
    },

    /**
     *  0待审核、1审核中、2审核通过、3审核未通过
     */
    getStatusStyle(status) {
      return {
        backgroundColor: this.getStatusColor(status)
      }
    },

    /**
     * 通过回调控制class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (
        column.property === 'customerName' ||
        column.property === 'leadsName' ||
        column.property === 'businessName' ||
        column.property === 'num'
      ) {
        return 'can-visit--underline'
      } else if (column.property === 'businessCheck') {
        return 'can-visit'
      } else {
        return ''
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/views/crm/styles/table.scss';
.block{
  width: 12px;
  height: 12px;
  display: inline-block;
  margin-right: 5px;
  border-radius: 4px;
}
/deep/.el-dialog__header{
  line-height: 20px;
  padding-bottom: 0px;
}
.title-text{
  font-size: 12px;
  font-weight: bolder;
}
.title-message{
  font-size: 12px;
  color: #999;
  width: 230px;
  float: right;
  /deep/.el-dropdown-selfdefine{
    padding: 0px;
    margin-left: 32px;
    border: none;
  }
}
.common-box{
  width: 100%;
  .common-title{
    font-size: 22px;
    width: 500px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-left: 20px;
    color: #333;
  }
  .common-header{
    padding-left: 50px;
    padding-top: 30px;
    .time-text{
      margin-left: 11px;
      .text-up{
        color: #333;
        font-size: 18px;
        padding-bottom: 5px;
      }
      .time-time{
        color: #999;
        font-size: 12px;
      }
    }
     .time-circle{
       display: inline-block;
       width: 32px;
       height: 32px;
       border-radius: 50%;
       background-color: #F7AD3D;
       padding-left: 9px;
       line-height: 30px;
     .wk{
       color: #fff;
       }
    }
     /deep/.el-icon-remove{
    font-size: 32px;
    color: #F56C6C;
    }
  }
  .common-content{
    padding-left: 50px;
    padding-top: 30px;
    .content-title{
      color: #999;
      font-size: 12px;
      margin-bottom: 17px;
    }
    .user-img{
      margin-right: 11px;
    }
  }
  .common-foot{
     padding-left: 50px;
     padding-top: 30px;
     padding-bottom: 20px;
     .section__hd{
       color: #333;
       font-size: 16px;
       font-weight: bolder;
       margin-bottom: 20px;
     }
     .section_scroll{
       width: 854px;
     }
  }
  .common-bootom{
     width: 90%;
     overflow-x: auto;
     overflow-y: hidden;
     padding-left: 50px;
     padding-top: 30px;
     color: #999;
     font-size: 12px;
     bottom: 18px;
     .type_type {
       margin-bottom: 20px;
       p {
         margin-bottom: 10px;
       }
     }
     .type_time {
        p {
         margin-bottom: 10px;
       }
     }
     span{
       padding-right: 20px;
       display: inline-block;
     }
  }
}
.scroll_content {
  height: 500px;
  overflow-y: auto;
}
/deep/.el-icon-more{
  color: #666;
  font-size: 16px;
}
/deep/.el-dialog__close{
  color: #666;
}
/deep/.el-dialog__body{
  padding: 20px 0px 0px;
}
/deep/.p-contianer .p-bar{
  margin-right: 25px
}
</style>
