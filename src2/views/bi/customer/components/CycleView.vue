<template>
  <div
    v-loading="loading"
    class="cycle-content">
    <filtrate-handle-view
      v-if="initView"
      :title="filterTitle"
      class="filtrate-bar"
      module-type="customer"
      @load="loading=true"
      @change="getDataList"/>
    <div class="content">
      <div class="axis-content">
        <div class="content-title">{{ title }}</div>
        <div
          :id="'axismain' + type"
          class="axismain"/>
      </div>
      <div class="table-content">
        <div class="handle-bar">
          <el-button
            class="export-btn"
            @click="exportClick">Xuất báo cáo</el-button>
        </div>
        <el-table
          v-if="showTable"
          :data="list"
          :summary-method="getSummaries"
          height="400"
          show-summary
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
<script type="text/javascript">
import BaseMixin from '../../mixins/Base'
import SortMixin from '../../mixins/Sort'
import SummaryMixin from '../../mixins/Summary'
import echarts from 'echarts'
import {
  biCustomerUserCycleAPI,
  biCustomerUserCycleExportAPI,
  biCustomerAddressCycleAPI,
  biCustomerAddressCycleExportAPI,
  biCustomerProductCycleAPI,
  biCustomerProductCycleExportAPI,
  employeeCycleInfoAPI
} from '@/api/bi/customer'

export default {
  name: 'CycleView',
  components: {},
  mixins: [BaseMixin, SortMixin, SummaryMixin],
  props: {
    type: {
      required: true,
      type: String
    }, // 'customer' 'product' 'address'
    show: {
      // 是否展示
      required: true,
      type: Boolean
    }
  },
  data() {
    return {
      loading: false,
      axisOption: null,

      postParams: null,

      list: [],
      fieldList: [],
      initView: false // 默认没有初始化
    }
  },
  computed: {
    title() {
      return {
        customer: 'Chu kỳ giao dịch khách hàng của nhân viên (tính theo thời gian đặt hàng theo hợp đồng và thời gian tạo khách hàng)',
        address: 'Chu kỳ giao dịch khu vực (được tính dựa trên thời gian đặt hàng theo hợp đồng và thời gian tạo khách hàng)',
        product: 'Chu kỳ giao dịch sản phẩm (được tính dựa trên thời gian đặt hàng theo hợp đồng và thời gian tạo khách hàng)'
      }[this.type]
    },
    filterTitle() {
      return {
        customer: 'Phân tích chu kỳ giao dịch khách hàng của nhân viên',
        address: 'Phân tích chu kỳ giao dịch khu vực',
        product: 'Phân tích chu kỳ giao dịch sản phẩm'
      }[this.type]
    }
  },
  watch: {
    show: function(value) {
      if (value && !this.initView) {
        this.initView = true
        if (this.postParams) {
          this.getDataList(this.postParams)
        }
        this.$nextTick(() => {
          this.initAxis()
        })
      }
    }
  },
  mounted() {
    this.fieldList = this.getFieldList()
    if (this.show) {
      this.initView = true
      this.initAxis()
    }
  },
  methods: {
    getDataList(params) {
      this.postParams = params
      if (!this.show) {
        return
      }
      this.loading = true
      const request = {
        customer: biCustomerUserCycleAPI,
        product: biCustomerProductCycleAPI,
        address: biCustomerAddressCycleAPI
      }[this.type]
      request(params)
        .then(res => {
          this.loading = false
          let axisList = []
          if (this.type != 'customer') {
            const data = res.data || {}
            axisList = data.list || []
            this.list = data.list || []
            this.getSummariesData(data.total)
          } else {
            axisList = res.data || []
          }

          const cycleData = []
          const dealData = []
          const xAxis = []
          for (let index = 0; index < axisList.length; index++) {
            const element = axisList[index]
            cycleData.push(element.cycle)
            dealData.push(element.customerNum)
            if (this.type == 'customer') {
              xAxis.push(element.type)
            } else if (this.type == 'address') {
              xAxis.push(element.type)
            } else if (this.type == 'product') {
              xAxis.push(element.productName)
            }
          }
          this.axisOption.xAxis[0].data = xAxis
          this.axisOption.series[0].data = cycleData
          this.axisOption.series[1].data = dealData
          this.chartObj.setOption(this.axisOption, true)
        })
        .catch(() => {
          this.loading = false
        })
      if (this.type == 'customer') {
        employeeCycleInfoAPI(params)
          .then(res => {
            this.loading = false
            const data = res.data || {}
            this.list = data.list || []
            this.getSummariesData(data.total)
          })
          .catch(() => {
            this.loading = false
          })
      }
    },
    /** 柱状图 */
    initAxis() {
      const chartObj = echarts.init(
        document.getElementById('axismain' + this.type)
      )

      const option = {
        color: ['#6ca2ff', '#ff7474'],
        toolbox: this.toolbox,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          data: ['Thời gian giao dịch', 'Số lượng khách hàng đã giao dịch'],
          bottom: '0px',
          itemWidth: 14
        },
        grid: {
          top: '40px',
          left: '30px',
          right: '30px',
          bottom: '40px',
          containLabel: true,
          borderColor: '#fff'
        },
        xAxis: [
          {
            type: 'category',
            data: [],
            axisTick: {
              alignWithLabel: true,
              lineStyle: { width: 0 }
            },
            axisLabel: {
              color: '#333'
            },
            /** 坐标轴轴线相关设置 */
            axisLine: {
              lineStyle: { color: '#333' }
            },
            splitLine: {
              show: false
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Chu kỳ giao dịch',
            axisTick: {
              alignWithLabel: true,
              lineStyle: { width: 0 }
            },
            axisLabel: {
              color: '#333',
              formatter: '{value} ngày'
            },
            /** 坐标轴轴线相关设置 */
            axisLine: {
              lineStyle: { color: '#333' }
            },
            splitLine: {
              show: false
            }
          },
          {
            type: 'value',
            name: 'Số lượng khách hàng',
            axisTick: {
              alignWithLabel: true,
              lineStyle: { width: 0 }
            },
            axisLabel: {
              color: '#333',
              formatter: '{value} lượt'
            },
            /** 坐标轴轴线相关设置 */
            axisLine: {
              lineStyle: { color: '#333' }
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: 'Chu kỳ giao dịch',
            type: 'bar',
            yAxisIndex: 0,
            barMaxWidth: 15,
            data: []
          },
          {
            name: 'Số lượng khách hàng',
            type: 'bar',
            yAxisIndex: 1,
            barMaxWidth: 15,
            data: []
          }
        ]
      }

      chartObj.setOption(option, true)
      this.axisOption = option
      this.chartObj = chartObj
    },
    getFieldList() {
      return {
        customer: [
          { field: 'realname', name: 'Họ và tên' },
          { field: 'cycle', name: 'Chu kỳ giao dịch (ngày)' },
          { field: 'customerNum', name: 'Mã khách hàng' }
        ],
        product: [
          { field: 'productName', name: 'Tên sản phẩm' },
          { field: 'cycle', name: 'Chu kỳ giao dịch (ngày)' },
          { field: 'customerNum', name: 'Mã sản phẩm' }
        ],
        address: [
          { field: 'type', name: 'Khu vực' },
          { field: 'cycle', name: 'Chu kỳ giao dịch (ngày)' },
          { field: 'customerNum', name: 'mã khu vực' }
        ]
      }[this.type]
    },

    /**
     * 导出点击
     */
    exportClick() {
      this.requestExportInfo({
        customer: biCustomerUserCycleExportAPI,
        product: biCustomerProductCycleExportAPI,
        address: biCustomerAddressCycleExportAPI
      }[this.type], this.postParams)
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../styles/detail.scss';
.filtrate-bar {
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  top: 0;
}

.content {
  padding-top: 54px;
  height: 100%;
}

.cycle-content {
  height: 100%;
  overflow-y: auto;
}
</style>
