<template>
  <div
    v-loading="loading"
    class="main-container">
    <filtrate-handle-view
      :show-year-select="true"
      title="Tổng hợp hợp đồng"
      class="filtrate-bar"
      module-type="contract"
      @load="loading=true"
      @change="getDataList">
      <el-button
        class="export-button"
        type="primary"
        @click.native="exportClick">Xuất báo cáo</el-button>
    </filtrate-handle-view>
    <div class="content">
      <div class="content-title">
        Số lượng hợp đồng đã ký：{{ data.count_zong }} cái；Giá trị hợp đồng：<span class="special">{{ data.money_zong }}</span> đồng；Số tiền hoàn trả：<span class="special">{{ data.back_zong }}</span> đồng；Số tiền chưa được thanh toán：<span class="special">{{ data.w_back_zong }}</span> đồng</div>
      <div class="table-content">
        <el-table
          v-if="showTable"
          :data="list"
          :height="tableHeight"
          stripe
          border
          highlight-current-row
          @sort-change="({ prop, order }) => mixinSortFn(list, prop, order)">
          <el-table-column
            v-for="(item, index) in fieldList"
            :key="index"
            :prop="item.field"
            :label="item.name"
            sortable="custom"
            align="center"
            header-align="center"
            show-overflow-tooltip/>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import SortMixin from '../mixins/Sort'
import BaseMixin from '../mixins/Base'
import { biAchievementSummaryAPI, biAchievementSummaryExportAPI } from '@/api/bi/achievement'
import FiltrateHandleView from '../components/FiltrateHandleView'

export default {
  /** 合同汇总表 */
  name: 'AchievementSummaryStatistics',
  components: {
    FiltrateHandleView
  },
  mixins: [BaseMixin, SortMixin],
  data() {
    return {
      loading: false,
      tableHeight: document.documentElement.clientHeight - 240,

      postParams: {}, // 筛选参数

      list: [],
      data: {
        back_zong: 0,
        count_zong: 0,
        money_zong: 0,
        w_back_zong: 0
      },
      fieldList: [
        { field: 'type', name: 'Ngày' },
        { field: 'contractNum', name: 'Số lượng hợp đồng đã ký （cái）' },
        { field: 'contractMoney', name: 'Số tiền hợp đồng (đồng)' },
        { field: 'receivablesMoney', name: 'Số tiền hoàn trả (đồng)' }
      ]
    }
  },
  computed: {},
  mounted() {
    /** 控制table的高度 */
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight - 240
    }
  },
  methods: {
    getDataList(params) {
      this.postParams = params
      this.loading = true
      biAchievementSummaryAPI(params)
        .then(res => {
          const data = res.data
          this.data = {
            back_zong: data.receivablesMoney,
            count_zong: data.contractNum,
            money_zong: data.contractMoney,
            w_back_zong: data.unreceivedMoney
          }
          this.list = data.list || []
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 导出点击
     */
    exportClick() {
      this.requestExportInfo(biAchievementSummaryExportAPI, this.postParams)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../styles/detail.scss';
.content-title {
  padding-bottom: 15px;
  .special {
    font-weight: bold;
    margin-right: 3px;
  }
}
</style>
