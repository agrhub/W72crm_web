<template>
  <div class="detail-recycle-rule">
    <div>{{ typeName }}</div>
    <div
      class="detail-recycle-rule__content">
      <div class="range-rule">
        <span>Những khách hàng không bị đưa vào vùng đào thải</span>
        <span v-if="dealHandleShow && data.dealHandle === 0">Khách hàng thân thiết</span>
        <span v-if="businessHandleShow && data.businessHandle === 0">Khách hàng mang cơ hội kinh doanh</span>
      </div>
      <div>
        <div v-if="data.customerLevelSetting === 1" class="type-rule">Cài đặt thống nhất cho tất cả khách hàng</div>
        <div v-else-if="data.customerLevelSetting === 2" class="type-rule">Đặt riêng theo chức vụ khách hàng</div>
        <el-table
          :data="data.levelSetting"
          border
          style="width: 100%">
          <el-table-column
            prop="level"
            label="Khách hàng"
            width="180"/>
          <el-table-column
            :label="limitDayName"
            prop="limitDay">
            <template slot-scope="scope">
              <span>{{ `Quá ${scope.row.limitDay} ngày ${getLimitDayUnit(data.type)}，sẽ đưa vào vùng đào thải` }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  // 详情回收规则
  name: 'DetailRecycleRule',
  components: {},
  props: {
    data: null
  },
  data() {
    return {}
  },
  computed: {
    typeName() {
      return {
        1: 'Customers with "no new follow-up (follow-up record)" for more than N days will be returned to the high seas customer pool regularly by the system',
        2: 'Customers with "no new business opportunities" over N days will be returned to the high seas customer pool regularly by the system',
        3: 'Customers who are "unsold" for more than N days will be returned to the high seas customer pool regularly by the system'
      }[parseInt(this.data.type)]
    },

    limitDayName() {
      return {
        1: 'Số ngày không liên lạc',
        2: 'Không có ngày hẹn',
        3: 'Số ngày chưa bán'
      }[parseInt(this.data.type)]
    },

    dealHandleShow() {
      return this.data.type == 1 || this.data.type == 2
    },
    businessHandleShow() {
      return this.data.type == 1 || this.data.type == 3
    }
  },
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    getLimitDayUnit(type) {
      return {
        1: 'Không có liên lạc',
        2: 'Không có cơ hội',
        3: 'Không bán được'
      }[type]
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-recycle-rule {
  font-size: 13px;

  &__content {
    padding: 15px;
    border: 1px solid $xr-border-color-base;
    border-radius: $xr-border-radius-base;
  }
}

.range-rule {
  span:first-child {
    color: #999;
  }

  span {
    display: inline-block;
  }

  span + span {
    margin-left: 20px;
  }
}

.type-rule {
  color: #999;
  margin-top: 10px;
}
</style>
