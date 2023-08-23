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
          :detail="detailData"
          :head-details="headDetails"
          :id="id"
          :crm-type="crmType"
          @handle-click="deadHandleClick"
          @handle="detailHeadHandle"
          @close="hideView">
          <template slot="name">
            <span v-if="detailData.checkStatus == 8" class="is-invalid">（已作废）</span>
          </template>
        </c-r-m-detail-head>

        <examine-info
          v-if="detailData.examineRecordId"
          :id="id"
          :record-id="detailData.examineRecordId"
          :owner-user-id="detailData.ownerUserId"
          class="examine-info"
          examine-type="crm_contract"
          @on-handle="examineHandle"/>

        <div class="d-container-bd">
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
                :handle="activityHandle"
                :crm-type="crmType"
                @on-handle="detailHeadHandle" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </flexbox>
    </div>

    <c-r-m-all-create
      v-if="isCreate"
      :action="createAction"
      :crm-type="crmType"
      @save-success="editSaveSuccess"
      @close="isCreate=false"/>
  </slide-view>
</template>

<script>
import { crmContractReadAPI } from '@/api/crm/contract'

import SlideView from '@/components/SlideView'
import CRMDetailHead from '../components/CRMDetailHead'
import Activity from '../components/Activity' // 活动
import CRMEditBaseInfo from '../components/CRMEditBaseInfo' // 商机基本信息
import RelativeHandle from '../components/RelativeHandle' // 相关操作
import RelativeTeam from '../components/RelativeTeam' // 团队成员
import RelativeProduct from '../components/RelativeProduct' // 团队成员
import RelativeReturnMoney from '../components/RelativeReturnMoney' // 相关回款
import RelativeFiles from '../components/RelativeFiles' // 相关附件
import RelativeVisit from '../components/RelativeVisit' // 回访
import RelativePrint from '../components/RelativePrint' // 相关打印
import ExamineInfo from '@/components/Examine/ExamineInfo'

import CRMAllCreate from '../components/CRMAllCreate' // 新建页面
import DetailMixin from '../mixins/Detail'
import { separator } from '@/filters/vueNumeralFilter/filters'
import { getWkDateTime } from '@/utils'

export default {
  // 客户管理 的 合同详情
  name: 'ContractDetail',
  components: {
    SlideView,
    CRMDetailHead,
    Activity,
    CRMEditBaseInfo,
    RelativeHandle,
    RelativeTeam,
    RelativeProduct,
    RelativeReturnMoney,
    RelativeFiles,
    RelativeVisit,
    RelativePrint,
    ExamineInfo,
    CRMAllCreate
  },
  mixins: [DetailMixin],
  props: {
    // 详情信息id
    id: [String, Number],
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
      crmType: 'contract',
      headDetails: [
        { title: 'Mã hợp đồng', value: '' },
        { title: 'Tên khách hàng', value: '' },
        { title: 'Giá trị hợp đồng （đồng）', value: '' },
        { title: 'Thời gian mua hàng', value: '' },
        { title: 'Số tiền thanh toán （đồng）', value: '' },
        { title: 'Người phụ trách', value: '' }
      ],
      tabCurrentName: 'Activity',
      // 编辑操作
      createAction: {},
      isCreate: false
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
        }, {
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
      if (this.crm.contract && this.crm.contract.read) {
        tempsTabs.push({ label: 'Chi tiết', name: 'CRMEditBaseInfo' })
      }

      tempsTabs.push({ label: 'Hoạt động', name: 'Activity' })

      if (this.crm.product && this.crm.product.index) {
        tempsTabs.push({ label: this.getTabName('Sản phẩm', this.tabsNumber.productCount), name: 'RelativeProduct' })
      }
      if (this.crm.receivables && this.crm.receivables.index) {
        tempsTabs.push({ label: this.getTabName('Thanh toán', this.tabsNumber.receivablesCount), name: 'RelativeReturnMoney' })
      }
      if (this.crm.visit && this.crm.visit.index) {
        tempsTabs.push({ label: this.getTabName('Lịch hẹn gặp', this.tabsNumber.returnVisitCount), name: 'RelativeVisit' })
      }
      tempsTabs.push({ label: this.getTabName('Thành viên', this.tabsNumber.memberCount), name: 'RelativeTeam' })
      tempsTabs.push({ label: this.getTabName('Đính kèm', this.tabsNumber.fileCount), name: 'RelativeFiles' })
      tempsTabs.push({ label: 'Nhật ký', name: 'RelativeHandle' })
      if (this.crm.contract && this.crm.contract.print) {
        tempsTabs.push({ label: 'In bản ghi', name: 'RelativePrint' })
      }
      return tempsTabs
    },

    /**
     * 根据记录筛选
     */
    logTyps() {
      return [{
        icon: 'all',
        color: '#2362FB',
        command: '',
        label: 'Tất cả các hoạt động'
      }, {
        icon: 'contract',
        color: '#FD5B4A',
        command: 6,
        label: 'Hợp đồng'
      }, {
        icon: 'o-task',
        color: '#D376FF',
        command: 11,
        label: 'Công việc'
      }, {
        icon: 'receivables',
        color: '#FFB940',
        command: 7,
        label: 'Thanh toán'
      }, {
        icon: 'log',
        color: '#5864FF',
        command: 8,
        label: 'Báo cáo'
      }, {
        icon: 'approve',
        color: '#9376FF',
        command: 9,
        label: 'Phê duyệt'
      }]
    }
  },
  mounted() {
    if (this.crm.contract && this.crm.contract.read) {
      this.tabCurrentName = 'CRMEditBaseInfo'
    }
  },
  methods: {
    /**
     * 详情
     */
    getDetial() {
      this.loading = true
      crmContractReadAPI({
        contractId: this.id
      })
        .then(res => {
          this.loading = false
          // 创建回款计划的时候使用
          const resData = res.data || {}
          this.detailData = resData

          this.headDetails[0].value = resData.num
          this.headDetails[1].value = resData.customerName
          this.headDetails[2].value = separator(resData.money || 0)
          this.headDetails[3].value = getWkDateTime(resData.orderDate)
          this.headDetails[4].value = separator(resData.receivablesMoney || 0)
          this.headDetails[5].value = resData.ownerUserName
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
     * 编辑成功
     */
    editSaveSuccess() {
      this.$bus.$emit('crm-detail-update', this.crmType)
      this.$emit('handle', { type: 'save-success' })
      this.detailData = null
      this.getDetial()
    },

    /**
     * 审核操作
     */
    examineHandle(data) {
      // 1 审核通过 2 审核拒绝 4 已撤回
      if (data.type == 1) {
        this.getDetial()
      }
      this.$emit('handle', { type: 'examine' })
    },

    /**
     * 详情操作
     */
    detailHeadHandleClick(data) {
      if (data.type === 'edit') {
        if (this.detailData.checkStatus === 1) {
          this.$message.error('Chỉ có thể được chỉnh sửa sau khi hợp đồng được thông qua là vô hiệu')
          return false
        } else if (this.detailData.checkStatus === 3) {
          this.$message.error('Hợp đồng đang được xem xét chỉ có thể được chỉnh sửa sau khi nó được trả lại')
          return false
        } else {
          this.createAction = { type: 'update', id: this.id, batchId: this.detailData.batchId }
        }
      }
    },

    /**
     * 详情操作
     */
    deadHandleClick(data) {
      if (data.type === 'copyContract') {
        this.createAction = { type: 'update', title: 'Sao chép hợp đồng', id: this.id, isCopy: true }
        this.isCreate = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/crmdetail.scss';
.is-invalid {
  color: #ccc;
}
</style>
