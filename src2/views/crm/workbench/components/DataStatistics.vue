<template>
  <div
    v-loading="loading"
    class="data-statistics card">
    <flexbox class="card-title">
      <span class="icon wk wk-data" />
      <div class="card-title-center text-one-ellipsis">Tổng hợp dữ liệu</div>
      <!--<div class="card-title-right">
        <span class="box">{{ filterText }}</span>
        <span class="box">{{ timeLine }}</span>
      </div>-->
    </flexbox>
    <div class="card-desc">
      Tổng hợp thống kê thu thập dữ liệu
    </div>
    <div v-if="data" class="content">
      <div class="list-item">
        <div class="title">
          Tổng hợp khách hàng
        </div>
        <div class="info">
          Thêm vào <span class="bold">{{ data.allCustomer }}</span> khách hàng，Chuyển giao khách hàng <span class="bold">{{ data.dealCustomer }}</span> lượt
        </div>
      </div>
      <div class="list-item">
        <div class="title">
          Tổng hợp theo dõi
        </div>
        <div class="info">
          Số lượt theo dõi <span class="bold">{{ data.activityNum }}</span> lượt，Không theo dõi khách mới <span class="bold">{{ data.allCustomer - data.activityRealNum }}</span> lượt
        </div>
      </div>
      <div class="list-item">
        <div class="title">
          Tổng hợp cơ hội kinh doanh
        </div>
        <div class="info">
          Thêm vào <span class="bold">{{ data.allBusiness }}</span> cơ hội mới，Tổng giá trị cơ hội <span class="bold">{{ data.businessMoney | separator }}</span> đồng，Cơ hội thành công <span class="bold">{{ data.endBusiness }}</span> lượt
        </div>
      </div>
      <div class="list-item">
        <div class="title">
          Tổng hợp hợp đồng
        </div>
        <div class="info">
          Số hợp đồng đã ký <span class="bold">{{ data.allContract }}</span> hợp đồng，Giá trị hợp đồng <span class="bold">{{ data.contractMoney | separator }}</span> đồng
        </div>
      </div>
      <div class="list-item">
        <div class="title">
          Tổng hợp thanh toán
        </div>
        <div class="info">
          Tổng số tiền thanh toán <span class="bold">{{ data.receivablesMoney | separator }}</span> đồng，Số tiền thanh toán kế hoạch <span class="bold">{{ data.planMoney | separator }}</span> đồng
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import chartMixins from './chartMixins'
import { queryDataInfo } from '@/api/crm/workbench'

export default {
  name: 'DataStatistics',
  filters: {},
  mixins: [chartMixins],
  data() {
    return {
      data: null,
      loading: false
    }
  },
  methods: {
    getData() {
      this.loading = true
      queryDataInfo(this.getBaseParams()).then(res => {
        this.loading = false
        this.data = res.data || {}
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
  @import "style";
  .content {
    width: 100%;
    height: 300px;
    .list-item {
      border-bottom: 1px dashed #EFEFEF;
      padding: 10px 20px;
      &:last-child {
        border-bottom: 0 none;
        padding-bottom: 0;
      }
      .title {}
      .info {
        margin-top: 5px;
        .bold {
          font-size: 18px;
          font-weight: bold;
          margin: 0 3px;
        }
      }
    }
  }

  .card-title-left .icon {
    color: #BF80FF;
  }
</style>
