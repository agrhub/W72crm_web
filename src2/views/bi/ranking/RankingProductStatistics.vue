<template>
  <div
    v-loading="loading"
    class="main-container">
    <filtrate-handle-view
      :show-user-select="false"
      title="Xếp hạng sản phẩm bán"
      class="filtrate-bar"
      module-type="ranking"
      @load="loading=true"
      @change="getDataList"/>
    <div class="content">
      <div class="content-title">Xếp hạng doanh số sản phẩm bán ra (theo thống kê sản phẩm liên quan của các hợp đồng đã ký và phê duyệt)</div>
      <div
        v-empty="list.length === 0"
        class="axis-content"
        xs-empty-text="Không có xếp hạng">
        <div id="axismain"/>
      </div>
      <div class="table-content">
        <div class="handle-bar">
          <el-button
            class="export-btn"
            @click="exportClick">Xuất báo cáo</el-button>
        </div>
        <el-table
          :data="list"
          height="400"
          stripe
          border
          highlight-current-row>
          <el-table-column
            align="center"
            header-align="center"
            show-overflow-tooltip
            label="Xếp hạng tổng thể của công ty">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column
            v-for="(item, index) in fieldList"
            :key="index"
            :prop="item.field"
            :label="item.name"
            align="center"
            header-align="center"
            show-overflow-tooltip/>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import RankingMixin from '../mixins/Ranking'
import echarts from 'echarts'
import { biRankingProductAPI, biRankingProductExportAPI } from '@/api/bi/ranking'

export default {
  /** 产品销量排行 */
  name: 'RankingProductStatistics',
  mixins: [RankingMixin],
  data() {
    return {}
  },
  computed: {},
  mounted() {
    this.fieldList = [
      { field: 'realname', name: 'Nhân viên' },
      { field: 'structureName', name: 'Phòng ban' },
      { field: 'count', name: 'Sản phẩm bán' }
    ]
    this.initAxis()
  },
  methods: {
    getDataList(params) {
      this.postParams = params
      this.loading = true
      biRankingProductAPI(params)
        .then(res => {
          this.loading = false
          this.list = res.data || []

          const showData = []
          const yAxis = []

          const rankingIndex = res.data.length > 10 ? 10 : res.data.length
          for (let index = 0; index < rankingIndex; index++) {
            const element = res.data[index]
            showData.splice(0, 0, parseFloat(element.count))
            yAxis.splice(0, 0, element.realname)
          }
          this.axisOption.yAxis[0].data = yAxis
          this.axisOption.series[0].data = showData
          this.chartObj.setOption(this.axisOption, true)
        })
        .catch(() => {
          this.loading = false
        })
    },
    /** 柱状图 */
    initAxis() {
      this.chartObj = echarts.init(document.getElementById('axismain'))
      this.axisOption.tooltip.formatter = '{b} : {c}'
      this.axisOption.xAxis[0].name = ''
      this.chartObj.setOption(this.axisOption, true)
    },

    /**
     * 导出点击
     */
    exportClick() {
      this.requestExportInfo(biRankingProductExportAPI, this.postParams)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../styles/detail.scss';
</style>
