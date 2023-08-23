import BaseMixin from './Base'
import echarts from 'echarts'
import {
  biAchievementAnalysisAPI,
  biAchievementAnalysisExportAPI
} from '@/api/bi/achievement'

export default {
  data() {
    return {
      axisOption: null,

      loading: false,

      postParams: {}, // 筛选参数

      list: [],
      fieldList: [],
      type: '',
      typeName: '',
      typeUnit: ''
    }
  },

  components: {},

  mixins: [BaseMixin],

  props: {},

  computed: {},

  watch: {},

  mounted() {
    if (this.type == 'back') {
      this.typeName = 'Số tiền đã thanh toán'
      this.typeUnit = '(đồng)'
    } else if (this.type == 'count') {
      this.typeName = 'Số lượng hợp đồng'
      this.typeUnit = '（cái）'
    } else if (this.type == 'money') {
      this.typeName = 'Giá trị hợp đồng'
      this.typeUnit = '(đồng)'
    }
    this.initAxis()
  },

  methods: {
    getDataList(params) {
      this.loading = true
      params.type = this.type
      this.postParams = params
      biAchievementAnalysisAPI(this.postParams)
        .then(res => {
          this.loading = false

          const list = [{
            name: 'Tháng này ' + this.typeName + this.typeUnit
          },
          // {
          //   name: '上月' + this.typeName + this.typeUnit
          // },
          // {
          //   name: '去年当月' + this.typeName + this.typeUnit
          // },
          {
            name: 'Tăng trưởng kép （%）'
          },
          {
            name: 'Tăng trưởng hàng năm （%）'
          }
          ]
          const fieldList = [{
            field: 'name',
            name: 'Ngày'
          }]

          for (let eIndex = 0; eIndex < res.data.length; eIndex++) {
            const element = res.data[eIndex]
            const fieldKey = 'value' + eIndex

            // 处理表头逻辑
            if (fieldList.length <= res.data.length) {
              fieldList.push({
                field: fieldKey,
                name: element.month.toString()
              })
            }

            const keys = [
              'thisMonth',
              // 'lastMonth',
              // 'lastYear',
              'lastMonthGrowth',
              'lastYearGrowth'
            ]
            for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
              const keyElement = keys[keyIndex]
              list[keyIndex][fieldKey] = element[keyElement]
            }
          }

          this.fieldList = fieldList
          this.list = list

          const monthData = []
          const lastMonthData = []
          const lastYeatMonthData = []
          const chainRatioData = []
          const yearOnYearData = []

          const xAxis = []
          for (let index = 0; index < res.data.length; index++) {
            const element = res.data[index]
            monthData.push(element.thisMonth)
            lastMonthData.push(element.lastMonth)
            lastYeatMonthData.push(element.lastYear)
            chainRatioData.push(element.lastMonthGrowth)
            yearOnYearData.push(element.lastYearGrowth)
            xAxis.push(element.month)
          }
          this.axisOption.xAxis[0].data = xAxis
          this.axisOption.series[0].data = monthData
          // this.axisOption.series[1].data = lastMonthData
          // this.axisOption.series[2].data = lastYeatMonthData
          this.axisOption.series[1].data = chainRatioData
          this.axisOption.series[2].data = yearOnYearData
          this.chartObj.setOption(this.axisOption, true)
        })
        .catch(() => {
          this.loading = false
        })
    },
    /** 柱状图 */
    initAxis() {
      this.chartObj = echarts.init(document.getElementById('axismain'))
      this.axisOption = {
        color: [
          '#6CA2FF',
          '#6AC9D7',
          '#72DCA2',
          '#DBB375',
          '#E164F7',
          '#FF7474',
          '#FFB270',
          '#FECD51'
        ],
        toolbox: this.toolbox,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          data: [
            'Tháng này ' + this.typeName,
            // '上月' + this.typeName,
            // '去年当月' + this.typeName,
            'Tăng trưởng kép',
            'Tăng trưởng hàng năm'
          ],
          bottom: '0px',
          itemWidth: 14
        },
        grid: {
          top: '50px',
          left: '30px',
          right: '30px',
          bottom: '40px',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: [],
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#333'
          },
          /** 坐标轴轴线相关设置 */
          axisLine: {
            onZero: true,
            onZeroAxisIndex: 1,
            lineStyle: {
              color: '#333'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#e6e6e6'
            }
          }
        }],
        yAxis: [{
          type: 'value',
          name: this.typeUnit,
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#333',
            formatter: '{value}'
          },
          /** 坐标轴轴线相关设置 */
          axisLine: {
            lineStyle: {
              color: '#333'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#e6e6e6'
            }
          }
        },
        {
          type: 'value',
          name: '',
          axisTick: {
            alignWithLabel: true,
            lineStyle: {
              width: 0
            }
          },
          axisLabel: {
            color: '#333',
            formatter: '{value}%'
          },
          /** 坐标轴轴线相关设置 */
          axisLine: {
            lineStyle: {
              color: '#333'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#e6e6e6'
            }
          }
        }
        ],
        series: [{
          name: 'Tháng này ' + this.typeName,
          type: 'bar',
          yAxisIndex: 0,
          barMaxWidth: 10,
          markPoint: {
            data: [{
              type: 'max',
              name: 'Cao nhất'
            },
            {
              type: 'min',
              name: 'Thấp nhất'
            }
            ]
          },
          data: []
        },
        // {
        //   name: '上月' + this.typeName,
        //   type: 'bar',
        //   yAxisIndex: 0,
        //   barMaxWidth: 10,
        //   markPoint: {
        //     data: [{
        //       type: 'max',
        //       name: '最大值'
        //     },
        //     {
        //       type: 'min',
        //       name: '最小值'
        //     }
        //     ]
        //   },
        //   data: []
        // },
        // {
        //   name: '去年当月' + this.typeName,
        //   type: 'bar',
        //   yAxisIndex: 0,
        //   barMaxWidth: 10,
        //   markPoint: {
        //     data: [{
        //       type: 'max',
        //       name: '最大值'
        //     },
        //     {
        //       type: 'min',
        //       name: '最小值'
        //     }
        //     ]
        //   },
        //   data: []
        // },
        {
          name: 'Tăng trưởng kép',
          type: 'line',
          yAxisIndex: 1,
          markLine: {
            data: [{
              type: 'average',
              name: 'Trung bình'
            }]
          },
          markPoint: {
            data: [{
              type: 'max',
              name: 'Cao nhất'
            },
            {
              type: 'min',
              name: 'Thấp nhất'
            }
            ]
          },
          data: []
        },
        {
          name: 'Tăng trưởng hàng năm',
          type: 'line',
          yAxisIndex: 1,
          markLine: {
            data: [{
              type: 'average',
              name: 'Trung bình'
            }]
          },
          markPoint: {
            data: [{
              type: 'max',
              name: 'Cao nhất'
            },
            {
              type: 'min',
              name: 'Thấp nhất'
            }
            ]
          },
          data: []
        }
        ]
      }
      this.chartObj.setOption(this.axisOption, true)
    },

    /**
     * 导出点击
     */
    exportClick() {
      this.requestExportInfo(biAchievementAnalysisExportAPI, this.postParams)
    }
  },

  deactivated: function() {}

}
