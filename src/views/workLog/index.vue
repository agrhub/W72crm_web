<template>
  <div
    v-infinite-scroll="getList"
    :key="scrollKey"
    class="main"
    infinite-scroll-distance="100"
    infinite-scroll-disabled="scrollDisabled">
    <div>
      <div class="work-log scroll-body">
        <div class="card">
          <flexbox class="hello-card">
            <xr-avatar
              :name="userInfo.realname"
              :size="50"
              :src="userInfo.img"
              class="user-img" />

            <div class="greeting">
              <div class="hello">
                {{ headData.timeLabel }}，{{ nickName }}
                <span class="status">
                  <span :class="userDoneStatus.icon" class="icon wk" />
                  <span>{{ userDoneStatus.label }}</span>
                </span>
              </div>
              <div v-if="headData && headData.timeRemind" class="text">
                {{ headData.timeRemind }}
              </div>
            </div>

            <div class="statistics">
              <div class="title">
                <!-- <span class="icon wk wk-task" /> -->
                <span>Hoàn thành báo cáo trong tháng này</span>
              </div>
              <div class="info">
                <span class="special">{{ headData.allNum }}</span> báo cáo
              </div>

            </div>
          </flexbox>
          <flexbox
            align="stretch"
            class="report-card">
            <div class="report-card__label">Tổng hợp bán hàng</div>
            <report-menu
              :list="reportList"
              @select="reportSelect" />
          </flexbox>
        </div>


        <create-log v-if="showAdd" ref="createLog" class="add-card card" @update="addLogSuccess" @completeSelect="completeSelect" />

        <flexbox class="filter-control card">
          <xh-user-cell
            v-if="showUserSelect"
            :radio="false"
            :value="userSelects"
            class="xh-user-cell"
            placeholder="Chọn nhân sự"
            @value-change="userChange" />
          <time-type-select
            :width="190"
            :options="timeOptions"
            :default-type="timeSelect"
            @change="timeTypeChange" />
          <el-select
            v-model="filterForm.categoryId"
            placeholder="Chọn danh mục">
            <el-option
              v-for="(item, index) in options"
              :key="index"
              :label="item.label"
              :value="item.value" />
          </el-select>
          <el-input
            v-model="search"
            placeholder="Vui lòng nhập nội dung công việc"
            prefix-icon="el-icon-search"
            type="text"
            @blur="refreshList"
            @keyup.enter.native="refreshList"/>
          <div class="filter-right">
            <span class="total-count">Lọc ra <span>{{ totalCount }}</span> mục</span>
            <el-button
              class="export-btn"
              @click="logExportClick">Xuất file</el-button>
          </div>
        </flexbox>
      </div>

      <div
        v-for="(item, index) in listData"
        :key="index"
        class="card">
        <log-item
          :data="item"
          :index="index"
          :show-history-btn="showUserSelect"
          @read="handleRead(index)"
          @add-comment="handleAddComment"
          @delete="handleDelete"
          @edit="handleEdit"
          @relate-detail="enterRelateDetail"
          @report-detail="reportSelect"
          @check-history="checkUserHistory" />
      </div>
    </div>
    <p
      v-if="loading"
      class="scroll-bottom-tips">Đang tải...</p>
    <p
      v-if="noMore"
      class="scroll-bottom-tips">Không có dữ liệu</p>

    <c-r-m-all-detail
      :visible.sync="showRelatedDetail"
      :crm-type="relatedCRMType"
      :id="relatedID"
      :no-listener-class="['content-item']" />

    <new-dialog
      v-if="showNewDialog"
      :form-data="formData"
      :img-file-list="imgFileList"
      :accessory-file-list="accessoryFileList"
      :new-loading="newLoading"
      dialog-title="Chỉnh sửa báo cáo"
      @close="showNewDialog = false"
      @submitBtn="submitEdit" />

    <!-- 销售简报列表 -->
    <report-list
      :show.sync="reportListShow"
      :title="reportData.title"
      :placeholder="reportData.placeholder"
      :crm-type="reportData.crmType"
      :request="reportData.request"
      :params="reportData.params"
      :record-request="reportData.recordRequest"
      :field-list="fieldReportList"
      :paging="reportData.paging"
      :sortable="reportData.sortable"/>

    <log-com-detail :show.sync="logComDetailShow" :type="logComDetailType" />
  </div>
</template>

<script>
import {
  journalListAPI,
  journalEditAPI,
  journalQueryBulletinAPI,
  journalQueryRecordCountAPI,
  journalQueryBulletinByTypeAPI,
  journalGetLogWelcomeAPI,
  oaLogExportAPI } from '@/api/oa/journal'
import { crmQueryBulletinAPI } from '@/api/crm/workbench'

import ReportMenu from './components/ReportMenu'
import LogItem from './components/LogItem'
import CreateLog from './components/CreateLog'
import LogComDetail from './components/LogComDetail' // 日志完成 情况详情
import XhUserCell from '@/components/CreateCom/XhUserCell'
import CRMAllDetail from '@/views/crm/components/CRMAllDetail'
import NewDialog from '@/views/oa/journal/NewDialog'
import TimeTypeSelect from '@/components/TimeTypeSelect'
import ReportList from '@/views/crm/workbench/components/ReportList'

import { mapGetters } from 'vuex'
import moment from 'moment'
import { downloadExcelWithResData } from '@/utils/index'
import { separator } from '@/filters/vueNumeralFilter/filters'

export default {
  name: 'WorkLog',
  components: {
    ReportMenu,
    LogItem,
    CreateLog,
    LogComDetail,
    XhUserCell,
    CRMAllDetail,
    NewDialog,
    TimeTypeSelect,
    ReportList
  },
  data() {
    return {
      logType: '', // all send 我发出的 received 我收到的
      // 头部信息
      headData: {
        nowNum: 0,
        allNum: 0,
        timeLabel: '',
        timeRemind: ''
      },

      // 简报信息
      reportList: [
        {
          type: 'customer',
          key: 'customerCount',
          info: 'Khách hàng thêm ngay hôm nay',
          name: 'Khách hàng thêm ngay hôm nay 0'
        },
        {
          type: 'business',
          key: 'businessCount',
          info: 'Cơ hội thêm ngay hôm nay',
          name: 'Cơ hội thêm ngay hôm nay 0'
        },
        {
          type: 'contract',
          key: 'contractCount',
          info: 'Hợp đồng thêm ngay hôm nay',
          name: 'Hợp đồng thêm ngay hôm nay 0'
        },
        {
          type: 'receivables',
          key: 'receivablesMoney',
          info: 'Thanh toán tạo ngay hôm nay',
          name: 'Thanh toán tạo ngay hôm nay 0'
        },
        {
          type: 'record',
          key: 'recordCount',
          info: 'Hồ sơ theo dõi ngay hôm nay',
          name: 'Hồ sơ theo dõi ngay hôm nay 0'
        }
      ],

      // 简报信息


      listData: [],
      loading: false, // loading
      noMore: false,
      page: 1,
      totalCount: 0,
      scrollKey: Date.now(),

      options: [
        { label: 'Tất cả', value: 0 },
        { label: 'Hằng ngày', value: 1 },
        { label: 'Hằng tuần', value: 2 },
        { label: 'hằng tháng', value: 3 }
      ],

      filterForm: {
        categoryId: 0,
        createUserId: ''
      },
      userSelects: [],

      timeOptions: [
        { label: 'Hôm nay', value: 'today' },
        { label: 'Hôm qua', value: 'yesterday' },
        { label: 'Tuần này', value: 'week' },
        { label: 'Tuần trước', value: 'lastWeek' },
        { label: '30 ngày trước', value: 'recent30' },
        { label: '60 ngày trước', value: 'recent60' },
        { label: 'Tháng này', value: 'month' },
        { label: 'Tháng trước', value: 'lastMonth' },
        { label: 'Quý này', value: 'quarter' },
        { label: 'Quý trước', value: 'lastQuarter' },
        { label: 'Năm nay', value: 'year' },
        { label: 'Năm trước', value: 'lastYear' }
      ],
      timeSelect: {
        type: 'default',
        value: 'recent30'
      },
      search: '',

      // 相关详情的查看
      relatedID: '',
      relatedCRMType: '',
      showRelatedDetail: false,

      // 编辑
      newLoading: false,
      showNewDialog: false,
      formData: {},
      imgFileList: [],
      accessoryFileList: [],

      // 简报预览
      reportListShow: false,
      fieldReportList: null,
      reportData: {
        title: '',
        placeholder: '',
        crmType: '',
        request: null,
        recordRequest: journalQueryBulletinByTypeAPI,
        params: null,
        paging: true,
        sortable: false
      },

      // 日志完成详情
      logComDetailType: '',
      logComDetailShow: false
    }
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ]),

    showUserSelect() {
      return this.logType != 'send'
    },

    showAdd() {
      return this.logType != 'received'
    },

    userDoneStatus() {
      return {
        icon: this.headData.nowNum > 0 ? 'wk-success' : 'wk-close',
        label: this.headData.nowNum > 0 ? 'Báo cáo hôm nay đã hoàn thành' : 'Báo cáo hôm nay chưa được hoàn thành'
      }
    },

    // 无线滚动控制
    scrollDisabled() {
      return this.loading || this.noMore
    },

    nickName() {
      if (!this.userInfo.realname) return this.userInfo.username
      const reg = /[a-zA-Z]+/
      if (reg.test(this.userInfo.realname) || !this.userInfo.sex) {
        return this.userInfo.realname
      }
      return (this.userInfo.sex === 1 ? 'Ông ' : 'Bà ') + this.userInfo.realname.slice(0, 1)
    }
  },
  watch: {
    filterForm: {
      handler() {
        this.refreshList()
      },
      deep: true
    }
  },
  created() {
    this.logType = this.$route.params.type
    this.getLogRemind()
    this.getHeadDetail()
    this.getReportData()
  },

  beforeRouteUpdate(to, from, next) {
    this.logType = to.params.type
    this.totalCount = 0
    if (this.$refs.createLog) {
      this.$refs.createLog.showMore = false
    }
    this.filterForm = {
      categoryId: 0,
      createUserId: ''
    }
    this.userSelects = []

    this.timeSelect = {
      type: 'default',
      value: 'recent30'
    }
    this.refreshList()
    next()
  },
  methods: {
    /**
     * 获取概要
     */
    getHeadDetail() {
      journalQueryBulletinAPI().then(res => {
        this.headData.nowNum = res.data.nowNum
        this.headData.allNum = res.data.allNum
      }).catch(() => {

      })
    },

    /**
     * 简报信息
     */
    getReportData() {
      this.loading = true
      crmQueryBulletinAPI({
        type: 'today',
        isUser: 1,
        userId: this.userInfo.userId
      }).then(res => {
        this.loading = false
        const data = res.data.data || {}
        this.reportList = this.reportList.map(item => {
          if (item.key == 'receivablesMoney') {
            data.receivablesMoney = separator(Math.floor(data.receivablesMoney || 0))
          }
          item.name = `${item.info} ${data[item.key]}`
          return item
        })
      }).catch(() => {
        this.loading = false
      })
    },

    getLogRemind() {
      this.getNetworkWelcome()
      const hour = moment().format('H')
      if (hour < 12) {
        // const num = Math.floor(Math.random() * 6)
        this.headData.timeLabel = 'Buổi sáng tốt lành'
        // this.headData.timeRemind = [
        //   '给自己一个微笑，告诉自己今天会更美好',
        //   '生命的意义在于和别人的不同之处',
        //   '美丽的早晨，灿烂的你，美好的一天在等你',
        //   '暖暖的阳光照，柔柔的轻风笑，绵绵的岁月长，真真的祝福到',
        //   '美好的一天开始了，每天给自己一个希望',
        //   '蓝天是宁静的，空气是清新的，阳光是明媚的'
        // ][num]
      } else if (hour < 18) {
        // const num = Math.floor(Math.random() * 6)
        this.headData.timeLabel = 'Chào buổi trưa'
        // this.headData.timeRemind = [
        //   '认真对待工作，终有一天，你的每一份努力，都将绚烂成花',
        //   '通过辛勤的工作获得的财富才是人生的大快事',
        //   '生命之中总是有太多的感动，难忘的是你灿烂的笑容',
        //   '努力工作，永远不要向命运低头，不要向生活妥协',
        //   '生命，是一树花开，或安静或热烈',
        //   '人生，最快乐的莫过于奋斗'
        // ][num]
      } else {
        // const num = Math.floor(Math.random() * 5)
        this.headData.timeLabel = 'Chào buổi tối'
        // this.headData.timeRemind = [
        //   '工作一天辛苦了，这世界不会辜负每一份努力和坚持',
        //   '无须缅怀昨天，不必奢望明天，只要认真过好每个今',
        //   '每一份坚持都是成功的累积，相信自己，总会遇到惊喜',
        //   '不要失去希望，你永远不知道明天会带来什么',
        //   '工作一天辛苦了，人生，最快乐的莫过于奋斗'
        // ][num]
      }
    },

    getNetworkWelcome() {
      journalGetLogWelcomeAPI().then(res => {
        this.headData.timeRemind = res.data
      }).catch(() => {
      })
    },

    /**
     * 刷新列表
     */
    refreshList() {
      this.page = 1
      this.listData = []
      this.noMore = false
      this.totalCount = 0
      this.scrollKey = Date.now()
    },

    /**
     * 获取日志列表
     */
    getList(action = null) {
      if (this.loading) return
      this.loading = true
      const params = this.getBaseParams()
      params.page = this.page
      params.limit = 5

      journalListAPI(params).then(res => {
        this.loading = false
        if (!this.noMore) {
          this.listData = this.listData.concat(res.data.list)
          this.page++
        }
        this.totalCount = res.data.totalRow
        this.noMore = res.data.lastPage
      }).catch(() => {
        this.noMore = true
        this.loading = false
      })
    },

    /**
     * 获取基础请求参数
     */
    getBaseParams() {
      const params = {
        search: this.search,
        ...this.filterForm
      }

      if (this.timeSelect.type) {
        if (this.timeSelect.type === 'custom') {
          params.startTime = this.timeSelect.startTime.replace(/\./g, '-')
          params.endTime = this.timeSelect.endTime.replace(/\./g, '-')
        } else {
          params.type = this.timeSelect.value || ''
        }
      }

      if (this.logType != 'all') {
        params.by = {
          send: 1,
          received: 2
        }[this.logType]
      }

      if (this.logType == 'send' && params.hasOwnProperty('createUserId')) {
        delete params.createUserId
      }

      if (params.hasOwnProperty('categoryId') && params.categoryId === 0) {
        delete params.categoryId
      }

      return params
    },

    /**
     * 添加回复
     */
    handleAddComment(data) {
      this.listData[data.index].replyList.push(data.data)
    },

    /**
     * 日志删除
     * @param index {number}
     */
    handleDelete(index) {
      this.listData.splice(index, 1)
      this.getHeadDetail()
      this.refreshList()
    },

    /**
     * 日志添加成功
     */
    addLogSuccess() {
      this.refreshList()
      this.headData.nowNum++
      this.headData.allNum++
    },

    /**
     * 日志编辑
     * @param index {number}
     */
    handleEdit(index, data) {
      this.formData = data
      this.imgFileList = data.img
      // 附件
      this.accessoryFileList = data.file
      // 员工部门赋值
      // this.formData.depData = data.sendDeptList ? data.sendDeptList : []
      // this.formData.sentWhoList = data.sendUserList ? data.sendUserList : []
      this.showNewDialog = true
    },

    /**
     * 编辑提交
     */
    submitEdit(key, batchId, relevanceAll) {
      this.newLoading = true
      // 获取部门
      const dep = []
      if (this.formData.depData) {
        for (const j of this.formData.depData) {
          dep.push(j.id)
        }
      }
      // 获取员工
      const staff = []
      if (this.formData.sendUserList) {
        for (const h of this.formData.sendUserList) {
          staff.push(h.userId)
        }
      }

      const pramas = {
        logId: this.formData.logId,
        categoryId: key,
        content: this.formData.content,
        tomorrow: this.formData.tomorrow,
        question: this.formData.question,
        batchId: batchId,
        sendUserIds: staff.join(','),
        sendDeptIds: dep.join(','),
        customerIds: relevanceAll.customerIds.join(','),
        contactsIds: relevanceAll.contactsIds.join(','),
        businessIds: relevanceAll.businessIds.join(','),
        contractIds: relevanceAll.contractIds.join(',')
      }
      journalEditAPI(pramas)
        .then(res => {
          this.showNewDialog = false
          this.refreshList()
          this.$message.success('Thành công')
          this.newLoading = false
        })
        .catch(() => {
          this.newLoading = false
          this.$message.error('Không thành công')
        })
    },

    /**
     * 日志已读
     * @param index
     */
    handleRead(index) {
      this.listData[index].isRead = 1
    },

    /**
     * 筛选条件人员选择
     */
    userChange(data) {
      this.userSelects = data.value || []
      if (data.value.length > 0) {
        this.filterForm.createUserId = data.value.map(item => {
          return item.userId
        }).join(',')
      } else {
        this.filterForm.createUserId = ''
      }
    },

    /**
     * 查看某人历史
     */
    checkUserHistory(user) {
      this.userSelects = user ? [user] : []
      if (user) {
        this.filterForm.createUserId = user.userId
      } else {
        this.filterForm.createUserId = ''
      }
    },

    /**
     * 时间更改
     */
    timeTypeChange(data) {
      this.timeSelect = data
      this.refreshList()
    },

    /**
     * 进入相关详情
     */
    enterRelateDetail(type, data) {
      this.relatedID = data.id
      this.relatedCRMType = type
      this.showRelatedDetail = true
    },

    /**
     * 简报预览
     */
    reportSelect(item, data) {
      if (item.type) {
        this.reportData.title = `Tóm tắt bán hàng - ${item.info}`
        this.reportData.placeholder = {
          customer: 'Vui lòng nhập tên khách hàng',
          business: 'Vui lòng nhập tên cơ hội',
          contract: 'Vui lòng nhập tên hợp đồng',
          receivables: 'Vui lòng nhập tên thanh toán',
          record: ''
        }[item.type]


        this.reportData.crmType = item.type
        // data 存在 是已添加日志预览  不存在为页面顶部 销售简报预览
        this.reportData.params = data ? { logId: data.logId } : { today: 1 }

        // type   1 客户 2 商机 3 合同 4 回款 5 跟进记录
        this.reportData.params.type = {
          customer: 1,
          business: 2,
          contract: 3,
          receivables: 4,
          record: 5
        }[item.type]

        if (item.type == 'record') {
          this.fieldReportList = [
            {
              label: 'Mô-đun',
              prop: 'crmType',
              width: 300
            },
            {
              label: 'Số lượng hồ sơ theo dõi mới',
              prop: 'count'
            }
          ]
          this.reportData.request = journalQueryRecordCountAPI
          this.reportData.paging = false
          this.reportData.sortable = false
        } else {
          this.fieldReportList = this.getReportFieldList(item.type)
          this.reportData.request = journalQueryBulletinByTypeAPI
          this.reportData.paging = true
          this.reportData.sortable = 'custom'
        }

        this.reportListShow = true
      }
    },

    /**
     * type   1 客户 2 商机 3 合同 4 回款 5 跟进记录
     *
     * 表头数据
     * 客户：客户名称、成交状态、最后跟进时间、创建时间、负责人
     * 商机：商机名称、商机阶段、最后跟进时间、创建时间、负责人
     * 合同：合同名称、合同状态、创建时间、公司签约人
     * 回款：回款编号、回款时间、负责人
     */
    getReportFieldList(type) {
      return {
        customer: [
          {
            label: 'Tên khách hàng',
            prop: 'customerName'
          },
          {
            label: 'Trạng thái',
            prop: 'dealStatus'
          },
          {
            label: 'Cập nhật cuối',
            prop: 'lastTime'
          },
          {
            label: 'Ngày tạo',
            prop: 'createTime'
          },
          {
            label: 'Người phụ trách',
            prop: 'ownerUserName'
          }
        ],
        business: [
          {
            label: 'Tên cơ hội',
            prop: 'businessName'
          },
          {
            label: 'Trạng thái',
            prop: 'statusName'
          },
          {
            label: 'Cập nhật cuối',
            prop: 'lastTime'
          },
          {
            label: 'Ngày tạo',
            prop: 'createTime'
          },
          {
            label: 'Người phụ trách',
            prop: 'ownerUserName'
          }
        ],
        contract: [
          {
            label: 'Tiêu đề hợp đồng',
            prop: 'name'
          },
          {
            label: 'Trạng thái',
            prop: 'checkStatus'
          },
          {
            label: 'Ngày tạo',
            prop: 'createTime'
          },
          {
            label: 'Công ty ký kết',
            prop: 'companyUserName'
          }
        ],
        receivables: [
          {
            label: 'Số thanh toán',
            prop: 'number'
          },
          {
            label: 'Ngày thanh toán',
            prop: 'returnTime'
          },
          {
            label: 'Người phụ trách',
            prop: 'ownerUserName'
          }
        ]
      }[type]
    },

    /**
     * 日志导出功能
     */
    logExportClick() {
      if (this.filterForm.categoryId == 0) {
        this.$message.error('Vui lòng chọn một loại "Hàng ngày, Hàng tuần và Hàng tháng" để xuất')
        return
      }

      this.loading = true

      oaLogExportAPI(this.getBaseParams())
        .then(res => {
          downloadExcelWithResData(res)
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 查看完成信息
     */
    completeSelect(type) {
      this.logComDetailType = type
      this.logComDetailShow = true
    }
  }
}
</script>

<style scoped lang="scss">
  @import "./style";
</style>
