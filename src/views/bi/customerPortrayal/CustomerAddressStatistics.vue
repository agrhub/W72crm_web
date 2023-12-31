<template>
  <div
    v-loading="loading"
    class="main-container">
    <filtrate-handle-view
      title="Phân tích khách hàng theo khu vực"
      class="filtrate-bar"
      module-type="customer"
      @load="loading=true"
      @change="getDataList"/>
    <flexbox class="content">
      <flexbox-item>
        <div class="axis-content">
          <div
            id="allChart"
            class="axismain"/>
        </div>
      </flexbox-item>
      <flexbox-item>
        <div class="axis-content">
          <div
            id="dealChart"
            class="axismain"/>
        </div>
      </flexbox-item>
    </flexbox>
  </div>
</template>

<script>
import BaseMixin from '../mixins/Base'
import echarts from 'echarts'
import 'echarts/map/js/world.js'
import { toolbox as features } from 'echarts/lib/langEN'
import { biAchievementAnalysisAPI } from '@/api/bi/customerPortrayal'

export default {
  /** 城市分布分析 */
  name: 'CustomerAddressStatistics',
  mixins: [BaseMixin],
  data() {
    return {
      loading: false,
      allOption: null,
      dealOption: null,
      chartObj: null,
      chartOtherObj: null
    }
  },
  computed: {},
  mounted() {
    this.initAxis()
  },
  methods: {
    getDataList(params) {
      this.loading = true
      biAchievementAnalysisAPI(params)
        .then(res => {
          this.loading = false

          const allData = []
          const dealData = []
          for (let index = 0; index < res.data.length; index++) {
            const element = res.data[index]
            if (element.allCustomer) {
              allData.push({
                name: element.address,
                value: element.allCustomer
              })
            }

            if (element.dealCustomer) {
              dealData.push({
                name: element.address,
                value: element.dealCustomer
              })
            }
          }

          this.allOption.series[0].data = allData
          this.dealOption.series[0].data = dealData
          this.chartObj.setOption(this.allOption, true)
          this.chartOtherObj.setOption(this.dealOption, true)
        })
        .catch(() => {
          this.loading = false
        })
    },
    /** 柱状图 */
    initAxis() {
      this.chartObj = echarts.init(document.getElementById('allChart'))
      this.chartOtherObj = echarts.init(document.getElementById('dealChart'))
      this.allOption = this.getChartOptione('Tất cả khách hàng')
      this.dealOption = this.getChartOptione('Khách hàng')
      this.chartObj.setOption(this.allOption, true)
      this.chartOtherObj.setOption(this.dealOption, true)
    },
    getChartOptione(title) {
      return {
        title: {
          text: title,
          left: 'center',
          bottom: 0
        },
        tooltip: {
          trigger: 'item',
          formatter: function(data) {
            if (data.value) {
              return data.name + '<br/>' + (data.value || '-') + '（lượt）'
            }
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['Số lượng khách hàng']
        },
        visualMap: {
          min: 0,
          max: 50,
          left: 'left',
          top: 'bottom',
          text: ['Cao nhất', 'Thấp nhất'], // 文本，默认为数值文本
          calculable: true,
          inRange: {
            color: ['lightskyblue', 'yellow', 'orangered']
          }
        },
        toolbox: {
          show: true,
          orient: 'vertical',
          left: 'right',
          top: 'center',
          ...features,
          feature: {
            mark: { show: true },
            dataView: { show: true, title: 'Data view', readOnly: false, lang: ['Data view', 'Close', 'Refresh'], optionToContent: function(opt) {
              var data = opt.series[0].data
              var table = '<table style="width:100%;text-align:center"><tbody><tr>' +
                 '<td>Thành phố</td>' +
                 '<td>Số lượng khách hàng</td>' +
                 '</tr>'
              for (var i = 0, l = data.length; i < l; i++) {
                table += '<tr>' +
                 '<td>' + data[i].name + '</td>' +
                 '<td>' + data[i].value + '</td>' +
                 '</tr>'
              }
              table += '</tbody></table>'
              return table
            } },
            restore: { show: true, title: 'Reset' },
            saveAsImage: { show: true, title: 'Save image' },
            downloadTable: { show: true, title: 'Save As picture' }
          }
        },
        series: [
          {
            name: '',
            type: 'map',
            mapType: 'world',
            showLegendSymbol: false,
            itemStyle: {
              normal: { label: { show: false }},
              emphasis: { label: { show: true }, borderColor: '#ccc' }
            },
            data: []
          }
        ]
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../styles/detail.scss';
</style>
