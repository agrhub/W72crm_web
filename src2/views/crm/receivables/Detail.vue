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
          @handle="detailHeadHandle"
          @close="hideView" />
        <examine-info
          v-if="detailData.examineRecordId"
          :id="id"
          :record-id="detailData.examineRecordId"
          :owner-user-id="detailData.ownerUserId"
          class="examine-info"
          examine-type="crm_receivables"
          @on-handle="examineHandle" />
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
                :id="id"
                :crm-type="crmType" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </flexbox>
    </div>

    <c-r-m-all-create
      v-if="isCreate"
      :action="{type: 'update', id: id, batchId: detailData.batchId}"
      :crm-type="crmType"
      @save-success="editSaveSuccess"
      @close="isCreate=false" />
  </slide-view>
</template>

<script>
import { crmReceivablesReadAPI } from '@/api/crm/receivables'

import SlideView from '@/components/SlideView'
import CRMDetailHead from '../components/CRMDetailHead'
import CRMEditBaseInfo from '../components/CRMEditBaseInfo' // 基本信息
import RelativeFiles from '../components/RelativeFiles' // 相关附件
import RelativeHandle from '../components/RelativeHandle' // 相关操作
import RelativePrint from '../components/RelativePrint' // 相关打印
import CRMAllCreate from '../components/CRMAllCreate' // 新建页面
import ExamineInfo from '@/components/Examine/ExamineInfo'

import DetailMixin from '../mixins/Detail'
import { separator } from '@/filters/vueNumeralFilter/filters'

export default {
  // 客户管理 的 回款详情
  name: 'ReceivablesDetail',
  components: {
    SlideView,
    CRMDetailHead,
    CRMEditBaseInfo,
    RelativeFiles,
    RelativeHandle,
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
      crmType: 'receivables',
      // 名称
      name: '',
      headDetails: [
        { title: 'Tên khách hàng', value: '' },
        { title: 'Giá trị hợp đồng', value: '' },
        { title: 'Tiêu đề hợp đồng', value: '' },
        { title: 'Ngày thanh toán', value: '' },
        { title: 'Số tiền thanh toán', value: '' },
        { title: 'Người phụ trách', value: '' }
      ],
      tabCurrentName: 'CRMEditBaseInfo',
      // 编辑操作
      isCreate: false
    }
  },
  computed: {
    tabNames() {
      var tempsTabs = [
        { label: 'Chi tiết', name: 'CRMEditBaseInfo' },
        {
          label: this.getTabName('Đính kèm', this.tabsNumber.fileCount),
          name: 'RelativeFiles'
        },
        { label: 'Lịch sử', name: 'RelativeHandle' }
      ]

      if (this.crm.receivables && this.crm.receivables.print) {
        tempsTabs.push({ label: 'In bản ghi', name: 'RelativePrint' })
      }

      return tempsTabs
    }
  },
  mounted() {},
  methods: {
    /**
     * 详情
     */
    getDetial() {
      this.loading = true
      crmReceivablesReadAPI({
        id: this.id
      })
        .then(res => {
          this.loading = false
          this.name = res.data.number
          this.detailData = res.data
          //   // 负责人
          this.headDetails[0].value = res.data.customerName
          this.headDetails[1].value = separator(res.data.contractMoney || 0)
          this.headDetails[2].value = res.data.contractName
          this.headDetails[3].value = res.data.returnTime
          this.headDetails[4].value = separator(res.data.money || 0)
          this.headDetails[5].value = res.data.ownerUserName
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

    // /**
    //  * 编辑成功
    //  */
    // editSaveSuccess() {
    //   this.$emit('handle', { type: 'save-success' })
    //   this.getDetial()
    // },

    /**
     * 审核操作
     */
    examineHandle() {
      this.$emit('handle', { type: 'examine' })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/crmdetail.scss';
</style>
