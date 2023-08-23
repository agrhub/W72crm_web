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
          @close="hideView">
          <template slot="name">
            <el-tooltip :content="detailData.star == 0 ? 'Theo dõi': 'Bỏ theo dõi'" effect="dark" placement="top">
              <i
                :class="{active: detailData.star != 0}"
                class="wk wk-focus-on focus-icon"
                @click="toggleStar()" />
            </el-tooltip>
          </template>
        </c-r-m-detail-head>
        <flexbox class="d-container-bd" align="stretch">
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
                :crm-type="crmType" />
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
                <contacts-import
                  :id="id"
                  :customer-id="customerId" />
              </el-tab-pane>
            </el-tabs>
          </transition>
        </flexbox>
      </flexbox>
    </div>
    <el-button
      class="firse-button"
      @click="showImportInfo= !showImportInfo">Thông<br>tin<br>quan<br>trọng<br><i :class="{ 'is-reverse': !showImportInfo }" class="el-icon-arrow-right el-icon--right" /></el-button>
    <c-r-m-all-create
      v-if="isCreate"
      :action="{type: 'update', id: id, batchId: detailData.batchId}"
      :crm-type="crmType"
      @save-success="editSaveSuccess"
      @close="isCreate=false"/>
  </slide-view>
</template>

<script>
import { crmContactsReadAPI } from '@/api/crm/contacts'

import SlideView from '@/components/SlideView'
import CRMDetailHead from '../components/CRMDetailHead'
import Activity from '../components/Activity' // 活动
import ContactsImport from './components/ContactsImport' // 重要信息
import CRMEditBaseInfo from '../components/CRMEditBaseInfo' // 联系人基本信息

import RelativeBusiness from '../components/RelativeBusiness' // 相关商机
import RelativeHandle from '../components/RelativeHandle' // 相关操作
import RelativeFiles from '../components/RelativeFiles' // 相关附件
import CRMAllCreate from '../components/CRMAllCreate' // 新建页面
import DetailMixin from '../mixins/Detail'

export default {
  /** 联系人管理 的 联系人详情 */
  name: 'ContactsDetail',
  components: {
    SlideView,
    CRMDetailHead,
    Activity,
    CRMEditBaseInfo,
    RelativeBusiness,
    RelativeHandle,
    RelativeFiles,
    CRMAllCreate,
    ContactsImport
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
      crmType: 'contacts',
      headDetails: [
        { title: 'Tên khách hàng', value: '' },
        { title: 'Chức vụ', value: '' },
        { title: 'Điện thoại di động', value: '' },
        { title: 'Ngày tạo', value: '' }
      ],
      tabCurrentName: 'Activity',
      // 编辑操作
      isCreate: false,
      // 展示重要信息
      showImportInfo: true
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
          label: 'Công việc'
        }, {
          type: 'business',
          label: 'Cơ hội kinh doanh'
        }, {
          type: 'contract',
          label: 'Hợp đồng'
        }, {
          type: 'receivables',
          label: 'Thanh toán'
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
      if (this.crm.contacts && this.crm.contacts.read) {
        tempsTabs.push({ label: 'Chi tiết', name: 'CRMEditBaseInfo' })
      }
      if (this.crm.business && this.crm.business.index) {
        tempsTabs.push({ label: this.getTabName('Cơ hội kinh doanh', this.tabsNumber.businessCount), name: 'RelativeBusiness' })
      }
      tempsTabs.push({ label: this.getTabName('Đính kèm', this.tabsNumber.fileCount), name: 'RelativeFiles' })
      tempsTabs.push({ label: 'Nhật ký hoạt động', name: 'RelativeHandle' })
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
        icon: 'contacts',
        color: '#27BA4A',
        command: 3,
        label: 'Danh bạ'
      }, {
        icon: 'o-task',
        color: '#D376FF',
        command: 11,
        label: 'Công việc'
      }, {
        icon: 'log',
        color: '#5864FF',
        command: 8,
        label: 'Báo cáo'
      }, {
        icon: 'approve',
        color: '#9376FF',
        command: 9,
        label: 'Đề xuất'
      }]
    },

    /**
     * 客户ID
     */
    customerId() {
      return this.detailData ? this.detailData.customerId || '' : ''
    }
  },
  mounted() {},
  methods: {
    /**
     * 详情
     */
    getDetial() {
      this.loading = true
      crmContactsReadAPI({
        contactsId: this.id
      })
        .then(res => {
          this.loading = false
          this.detailData = res.data
          // 负责人
          this.headDetails[0].value = res.data.customerName
          this.headDetails[1].value = res.data.post
          this.headDetails[2].value = res.data.mobile
          this.headDetails[3].value = res.data.createTime
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
    }

    // /**
    //  * 编辑成功
    //  */
    // editSaveSuccess() {
    //   this.$emit('handle', { type: 'save-success' })
    //   this.getDetial()
    // }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/crmdetail.scss';
</style>
