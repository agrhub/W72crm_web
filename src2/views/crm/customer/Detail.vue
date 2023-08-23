<template>
  <slide-view
    v-empty="!canShowDetail"
    :listener-ids="listenerIDs"
    :no-listener-ids="noListenerIDs"
    :no-listener-class="noListenerClass"
    :body-style="{padding: 0, height: '100%'}"
    xs-empty-icon="nopermission"
    xs-empty-text="Không có quyền"
    @afterEnter="viewAfterEnter"
    @close="hideView">
    <div
      v-loading="loading"
      ref="crmDetailMain"
      class="detail-main">
      <flexbox
        v-if="canShowDetail && detailData"
        direction="column"
        align="stretch"
        class="d-container">
        <c-r-m-detail-head
          :is-seas="isSeasDetail"
          :detail="detailData"
          :head-details="headDetails"
          :id="id"
          :pool-id="seasPoolId"
          :pool-auth="poolAuth"
          :crm-type="crmType"
          @handle="detailHeadHandle"
          @close="hideView">
          <template slot="name">
            <i v-if="detailData.status == 2" class="wk wk-circle-password" />
            <el-tooltip v-if="!isSeasDetail" :content="detailData.star == 0 ? 'Theo dõi': 'Bỏ theo dõi'" effect="dark" placement="top">
              <i
                :class="{active: detailData.star != 0}"
                class="wk wk-focus-on focus-icon"
                @click="toggleStar()" />
            </el-tooltip>
          </template>
        </c-r-m-detail-head>
        <flexbox
          class="d-container-bd"
          align="stretch">
          <el-tabs
            v-model="tabCurrentName"
            type="border-card"
            class="d-container-bd--left">
            <el-tab-pane
              v-for="(item, index) in tabNames"
              :key="index"
              :label="item.label"
              :name="item.name"
              lazy>
              <component
                :is="item.name"
                :detail="detailData"
                :type-list="logTyps"
                :id="id"
                :pool-id="seasPoolId"
                :handle="activityHandle"
                :is-seas="isSeasDetail"
                :crm-type="crmType"
                :contacts-id.sync="firstContactsId"
                @on-handle="detailHeadHandle" />
            </el-tab-pane>
          </el-tabs>
          <transition name="slide-fade">
            <el-tabs
              v-show="showImportInfo"
              value="chiefly-contacts"
              type="border-card"
              class="d-container-bd--right">
              <el-tab-pane
                label="Thông tin quan trọng"
                name="chiefly-contacts"
                lazy>
                <chiefly-contacts
                  :contacts-id="firstContactsId"
                  :id="id"
                  :pool-id="seasPoolId"
                  :crm-type="crmType"
                  :is-seas="isSeasDetail"
                  @add="addChieflyContacts" />
              </el-tab-pane>
            </el-tabs>
          </transition>
        </flexbox>
      </flexbox>
    </div>
    <el-button
      class="firse-button"
      @click="showImportInfo= !showImportInfo">Thông<br>tin<br>quan<br>trọng<br><i
        :class="{ 'is-reverse': !showImportInfo }"
        class="el-icon-arrow-right el-icon--right" /></el-button>
    <c-r-m-all-create
      v-if="isCreate"
      :action="createActionInfo"
      :crm-type="createCRMType"
      @save-success="editSaveSuccess"
      @close="isCreate=false" />
  </slide-view>
</template>

<script>
import { crmCustomerReadAPI } from '@/api/crm/customer'

import SlideView from '@/components/SlideView'
import CRMDetailHead from '../components/CRMDetailHead'
import Activity from '../components/Activity' // 活动
import ChieflyContacts from '../components/ChieflyContacts' // 首要联系人
import CRMEditBaseInfo from '../components/CRMEditBaseInfo' // 基本信息
import RelativeContacts from '../components/RelativeContacts' // 相关联系人
import RelativeBusiness from '../components/RelativeBusiness' // 相关商机
import RelativeContract from '../components/RelativeContract' // 相关合同
import RelativeReturnMoney from '../components/RelativeReturnMoney' // 相关回款
import RelativeFiles from '../components/RelativeFiles' // 相关附件
import RelativeHandle from '../components/RelativeHandle' // 相关操作
import RelativeTeam from '../components/RelativeTeam' // 团队成员
import RelativeVisit from '../components/RelativeVisit' // 回访
import RelativeInvoice from '../components/RelativeInvoice' // 发票

import CRMAllCreate from '../components/CRMAllCreate' // 新建页面
import DetailMixin from '../mixins/Detail'

export default {
  // 客户管理 的 客户详情
  name: 'CustomerDetail',
  components: {
    SlideView,
    Activity,
    ChieflyContacts,
    CRMDetailHead,
    CRMEditBaseInfo,
    RelativeContacts,
    RelativeBusiness,
    RelativeContract,
    RelativeReturnMoney,
    RelativeFiles,
    RelativeHandle,
    RelativeTeam,
    RelativeVisit,
    CRMAllCreate,
    RelativeInvoice
  },
  mixins: [DetailMixin],
  props: {
    // 详情信息id
    id: [String, Number],
    poolId: [String, Number],
    // 监听的dom 进行隐藏详情
    listenerIDs: {
      type: Array,
      default: () => {
        return ['crm-main-container']
      }
    },
    // 不监听
    noListenerIDs: {
      type: Array,
      default: () => {
        return []
      }
    },
    noListenerClass: {
      type: Array,
      default: () => {
        return ['el-table__body']
      }
    }
  },
  data() {
    return {
      // 展示加载loading
      loading: false,
      crmType: 'customer',
      headDetails: [
        { title: 'Cấp độ khách hàng', value: '' },
        { title: 'Trạng thái giao dịch', value: '' },
        { title: 'Người tạo', value: '' },
        { title: 'Ngày tạo', value: '' }
      ],
      tabCurrentName: 'Activity',
      // 编辑操作
      createActionInfo: null,
      createCRMType: '',
      isCreate: false,
      // 活动操作
      // 展示重要信息
      showImportInfo: true,
      // 首要联系人信息
      firstContactsId: '',

      // 公海规则权限
      poolAuth: {}
    }
  },
  computed: {
    /**
     * 活动操作
     */
    activityHandle() {
      let temps = [
        {
          type: 'task',
          label: 'Tạo công việc'
        },
        {
          type: 'contacts',
          label: 'Tạo danh bạ'
        },
        {
          type: 'business',
          label: 'Tạo cơ hội kinh doanh'
        },
        {
          type: 'contract',
          label: 'Tạo hợp đồng'
        },
        {
          type: 'receivables',
          label: 'Tạo thanh toán'
        }
      ]

      if (this.canCreateFollowRecord) {
        temps = [{
          type: 'log',
          label: 'Viết báo cáo'
        }].concat(temps)
      }

      return temps
    },

    /**
     * tabs
     */
    tabNames() {
      var tempsTabs = []
      tempsTabs.push({ label: 'Hoạt động', name: 'Activity' })
      if (this.crm.customer && this.crm.customer.read) {
        tempsTabs.push({ label: 'Chi tiết', name: 'CRMEditBaseInfo' })
      }
      if (this.crm.contacts && this.crm.contacts.index) {
        tempsTabs.push({ label: this.getTabName('Người liên hệ', this.tabsNumber.contactCount), name: 'RelativeContacts' })
      }

      tempsTabs.push({ label: this.getTabName('Thành viên', this.tabsNumber.memberCount), name: 'RelativeTeam' })

      if (this.crm.business && this.crm.business.index) {
        tempsTabs.push({ label: this.getTabName('Cơ hội kinh doanh', this.tabsNumber.businessCount), name: 'RelativeBusiness' })
      }

      if (this.crm.contract && this.crm.contract.index) {
        tempsTabs.push({ label: this.getTabName('Hợp đồng', this.tabsNumber.contractCount), name: 'RelativeContract' })
      }
      if (this.crm.receivables && this.crm.receivables.index) {
        tempsTabs.push({ label: this.getTabName('Thanh toán', this.tabsNumber.receivablesCount), name: 'RelativeReturnMoney' })
      }
      if (this.crm.visit && this.crm.visit.index) {
        tempsTabs.push({ label: this.getTabName('Lịch hẹn', this.tabsNumber.returnVisitCount), name: 'RelativeVisit' })
      }

      if (this.crm.invoice && this.crm.invoice.index) {
        tempsTabs.push({ label: this.getTabName('Hóa đơn', this.tabsNumber.invoiceCount), name: 'RelativeInvoice' })
      }

      tempsTabs.push({ label: this.getTabName('Đính kèm', this.tabsNumber.fileCount), name: 'RelativeFiles' })
      tempsTabs.push({ label: 'Nhật ký', name: 'RelativeHandle' })
      return tempsTabs
    },
    /**
     * isSeas 是从公海模块传入的 配合详情is_pool字段确定
     */
    isSeasDetail() {
      if (this.detailData && this.detailData.hasOwnProperty('isPool')) {
        return this.detailData.isPool == 1
      }
      return this.isSeas
    },

    /**
     * 公海id
     */
    seasPoolId() {
      if (this.poolAuth && this.poolAuth.poolId) {
        return this.poolAuth.poolId
      }
      return this.poolId
    },

    /**
     * 根据记录筛选
     */
    logTyps() {
      return [
        {
          icon: 'all',
          color: '#2362FB',
          command: '',
          label: 'Tất cả các hoạt động'
        },
        {
          icon: 'customer',
          color: '#487DFF',
          command: 2,
          label: 'Khách hàng'
        },
        {
          icon: 'o-task',
          color: '#D376FF',
          command: 11,
          label: 'Công việc'
        },
        {
          icon: 'business',
          color: '#FB9323',
          command: 5,
          label: 'Cơ hội kinh doanh'
        },
        {
          icon: 'contract',
          color: '#FD5B4A',
          command: 6,
          label: 'Hợp đồng'
        },
        {
          icon: 'contacts',
          color: '#27BA4A',
          command: 3,
          label: 'Danh bạ'
        },
        {
          icon: 'receivables',
          color: '#FFB940',
          command: 7,
          label: 'Thanh toán'
        },
        {
          icon: 'log',
          color: '#5864FF',
          command: 8,
          label: 'Báo cáo'
        },
        {
          icon: 'approve',
          color: '#9376FF',
          command: 9,
          label: 'Phê duyệt'
        }
      ]
    }
  },
  watch: {},
  mounted() {},
  methods: {
    /**
     * 详情
     */
    getDetial() {
      this.firstContactsId = ''
      this.loading = true
      const params = {
        customerId: this.id
      }

      if (this.poolId) {
        params.poolId = this.poolId
      }

      crmCustomerReadAPI(params)
        .then(res => {
          this.loading = false
          const resData = res.data || {}
          this.detailData = resData
          this.firstContactsId = this.detailData.contactsId
          // 公海权限
          this.poolAuth = resData.poolAuthList || {}
          // 负责人
          this.headDetails[0].value = this.detailData.level

          const dealItem = this.headDetails[1]
          if (this.detailData.dealStatus === null || this.detailData.dealStatus === '' || this.detailData.dealStatus === undefined) {
            dealItem.showIcon = false
            dealItem.value = ''
          } else {
            dealItem.showIcon = true
            if (this.detailData.dealStatus == 1) {
              dealItem.icon = 'wk wk-success deal-suc'
              dealItem.style = {
                fontSize: '14px',
                color: '#20b559',
                marginRight: '3px'
              }
              dealItem.value = 'Chốt đơn'
            } else {
              dealItem.icon = 'wk wk-close deal-un'
              dealItem.style = {
                fontSize: '14px',
                color: '#f95a5a',
                marginRight: '3px'
              }
              dealItem.value = 'Chưa bán'
            }
          }

          this.headDetails[2].title = this.isSeasDetail ? '' : 'Nhân viên phụ trách'
          this.headDetails[2].value = this.detailData.ownerUserName
          this.headDetails[3].value = this.detailData.updateTime
        })
        .catch(() => {
          this.loading = false
          this.hideView()
        })
    },

    /**
     * 关闭
     */
    hideView() {
      this.$emit('hide-view')
    },

    /**
     * 首要联系人添加
     */
    addChieflyContacts() {
      this.createCRMType = 'contacts'
      this.createActionInfo = {
        type: 'relative',
        crmType: this.crmType,
        data: { customer: this.detailData }
      }
      this.isCreate = true
    },

    /**
     * 顶部头 操作
     * @param {*} data
     */
    detailHeadHandle(data) {
      if (data.type === 'edit') {
        this.createCRMType = 'customer'
        this.createActionInfo = {
          type: 'update',
          id: this.id,
          batchId: this.detailData.batchId
        }
        this.isCreate = true
      } else if (data.type === 'delete' || data.type === 'exit-team') {
        this.hideView()
      }

      if (data.type === 'edit' || data.type === 'deal_status') {
        this.getDetial()
      }

      this.$emit('handle', data)
    }
  }
}
</script>

<style lang="scss" scoped>
.slide-fade-leave-active {
  will-change: transform;
  transition: all 0.1s;
}
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.wk-circle-password  {
  background-color: #f56c6c;
  color: white;
  margin-left: 5px;
  border-radius: 3px;
  font-size: 12px;
  padding: 2px;
  transform: scale(0.6);
}
@import '../styles/crmdetail.scss';
</style>
