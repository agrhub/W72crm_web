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
          examine-type="crm_invoice"
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
                :crm-type="crmType"
                :filed-list="baseDetailList" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </flexbox>
    </div>

    <!-- <c-r-m-create-view
      v-if="isCreate"
      :action="{type: 'update', id: id, batchId: detailData.batchId}"
      :crm-type="crmType"
      @save-success="editSaveSuccess"
      @hiden-view="isCreate=false" /> -->

    <create
      v-if="isCreate"
      :detail="detailData"
      @save-success="editSaveSuccess"
      @close="isCreate = false"/>
  </slide-view>
</template>

<script>
import { crmInvoiceReadAPI } from '@/api/crm/invoice'

import SlideView from '@/components/SlideView'
import CRMDetailHead from '../components/CRMDetailHead'
import CRMBaseInfo from '../components/CRMBaseInfo' // 基本信息
import RelativeFiles from '../components/RelativeFiles' // 相关附件
import RelativeHandle from '../components/RelativeHandle' // 相关操作
import ExamineInfo from '@/components/Examine/ExamineInfo'
import Create from './Create'

import DetailMixin from '../mixins/Detail'
import { separator } from '@/filters/vueNumeralFilter/filters'

export default {
  // 学员管理 的 发票详情
  name: 'InvoiceDetail',
  components: {
    SlideView,
    CRMDetailHead,
    CRMBaseInfo,
    RelativeFiles,
    RelativeHandle,
    ExamineInfo,
    Create
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
      crmType: 'invoice',
      // 名称
      name: '',
      headDetails: [
        { title: 'Tên khách hàng', value: '' },
        { title: 'Giá trị hóa đơn', value: '' },
        { title: 'Số hóa đơn', value: '' },
        { title: 'Ngày thanh toán thực tế', value: '' }
      ],
      tabCurrentName: 'CRMBaseInfo',
      baseDetailList: [], // 基本详情list
      // 编辑操作
      isCreate: false
    }
  },
  computed: {
    tabNames() {
      return [
        { label: 'Chi tiết', name: 'CRMBaseInfo' },
        {
          label: this.getTabName('ĐÍnh kèm', this.tabsNumber.fileCount),
          name: 'RelativeFiles'
        },
        { label: 'Lịch sử', name: 'RelativeHandle' }
      ]
    }
  },
  mounted() {},
  methods: {
    viewAfterEnter() {
      this.getDetial()
    },

    /**
     * 详情
     */
    getDetial() {
      this.loading = true
      crmInvoiceReadAPI(this.id)
        .then(res => {
          this.loading = false
          this.name = res.data.invoiceNumber
          this.detailData = res.data
          this.getBaseList(res.data)

          //   // 负责人
          this.headDetails[0].value = res.data.customerName
          this.headDetails[1].value = separator(res.data.invoiceMoney || 0)
          this.headDetails[2].value = res.data.invoiceNumber
          this.headDetails[3].value = res.data.realInvoiceDate
        })
        .catch(() => {
          this.loading = false
          this.hideView()
        })
    },

    /**
     * 获取基本信息数据
     */
    getBaseList(data) {
      this.baseDetailList = [
        {
          name: '基本信息',
          list: [
            {
              name: 'Số đơn đăng ký hóa đơn',
              formType: 'text',
              value: data.invoiceApplyNumber
            },
            {
              name: 'Tên khách hàng',
              formType: 'customer',
              value: data
            },
            {
              name: 'Số hợp đồng',
              formType: 'contract',
              value: data
            },
            {
              name: 'Giá trị hợp đồng',
              formType: 'text',
              value: data.contractMoney
            },
            {
              name: 'Số tiền trong hóa đơn （đồng）',
              formType: 'text',
              value: data.invoiceMoney
            },
            {
              name: 'Ngày thanh toán',
              formType: 'text',
              value: data.invoiceDate
            },
            {
              name: 'Loại hóa đơn',
              formType: 'text',
              value: {
                1: 'Hóa đơn thuế giá trị gia tăng',
                2: 'Hóa đơn VAT',
                3: 'National tax general machine invoice',
                4: 'General machine invoice for land tax',
                5: 'Biên nhận'
              }[data.invoiceType]
            },
            {
              name: 'Ghi chú',
              formType: 'text',
              value: data.remark
            },
            {
              name: 'Người tạo',
              formType: 'text',
              value: data.createUserName
            },
            {
              name: 'Người phụ trách',
              formType: 'text',
              value: data.ownerUserName
            },
            {
              name: 'Ngày tạo',
              formType: 'text',
              value: data.createTime
            },
            {
              name: 'Ngày cập nhật',
              formType: 'text',
              value: data.updateTime
            }
          ]
        },
        {
          name: 'Thông tin hóa đơn',
          list: [
            {
              name: 'Loại tiêu đề',
              formType: 'text',
              value: {
                1: 'Doanh nghiệp',
                2: 'Cá nhân'
              }[data.titleType]
            },
            {
              name: 'Hóa đơn',
              formType: 'text',
              value: data.invoiceTitle
            },
            {
              name: 'Mã số thuế',
              formType: 'text',
              value: data.taxNumber
            },
            {
              name: 'Ngân hàng',
              formType: 'text',
              value: data.depositBank
            },
            {
              name: 'Tài khoản',
              formType: 'text',
              value: data.depositAccount
            },
            {
              name: 'Địa chỉ ngân hàng',
              formType: 'text',
              value: data.depositAddress
            },
            {
              name: 'Số điện thoại',
              formType: 'text',
              value: data.telephone
            }
          ]
        },
        {
          name: 'Thông tin gửi thư',
          list: [
            {
              name: 'Người liên hệ',
              formType: 'text',
              value: data.contactsName
            },
            {
              name: 'Số điện thoại',
              formType: 'text',
              value: data.contactsMobile
            },
            {
              name: 'Địa chỉ',
              formType: 'text',
              value: data.contactsAddress
            }
          ]
        }
      ]
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
      this.$emit('handle', { type: 'save-success' })
      this.getDetial()
    },

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
