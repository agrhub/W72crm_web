<template>
  <div>
    <div class="handel-header">
      <el-popover
        v-model="showPopover"
        placement="left-end"
        width="700"
        style="padding: 0 !important;"
        trigger="click">
        <crm-relative
          v-if="showSelectView"
          ref="crmrelative"
          :radio="false"
          :show="showPopover"
          :selected-data="selectedData"
          crm-type="product"
          @close="showPopover=false"
          @changeCheckout="selectInfos"/>
        <el-button
          slot="reference"
          type="primary"
          @click="showSelectView=true">Thêm sản phẩm</el-button>
      </el-popover>
    </div>
    <el-table
      :data="productList"
      style="width: 100%;">
      <el-table-column
        prop="name"
        show-overflow-tooltip
        label="Tên sản phẩm"/>
      <el-table-column
        prop="categoryName"
        show-overflow-tooltip
        label="Danh mục sản phẩm"/>
      <el-table-column
        prop="unit"
        show-overflow-tooltip
        label="Đơn vị tính"/>
      <el-table-column
        prop="price"
        show-overflow-tooltip
        label="Đơn giá"/>
      <el-table-column label="Giá bán">
        <template slot-scope="scope">
          <el-input
            v-wk-number
            v-model="scope.row.salesPrice"
            placeholder="Vui lòng nhập"
            type="number"
            @input="salesPriceChange(scope)"/>
        </template>
      </el-table-column>
      <el-table-column label="Số lượng">
        <template slot-scope="scope">
          <el-input
            v-wk-number
            v-model="scope.row.num"
            type="number"
            placeholder="Vui lòng nhập"
            @input="numChange(scope)"/>
        </template>
      </el-table-column>
      <el-table-column label="Giảm giá （%）">
        <template slot-scope="scope">
          <el-input
            v-wk-number
            v-model="scope.row.discount"
            placeholder="Vui lòng nhập"
            type="number"
            @input="discountChange(scope)"/>
        </template>
      </el-table-column>
      <el-table-column
        prop="subtotal"
        label="Thành tiền"/>
      <el-table-column label="Tùy chọn">
        <template slot-scope="scope">
          <el-button @click="removeItem(scope.$index)">Xóa</el-button>
        </template>
      </el-table-column>
    </el-table>
    <flexbox class="handle-footer">
      <div class="discount-title">Giảm giá toàn bộ đơn hàng（%）：</div>
      <el-input
        v-wk-number
        v-model="discountRate"
        style="width: 80px"
        placeholder="Vui lòng nhập"
        type="number"
        @input="rateChange"/>
      <div class="total-info">Sản phẩm được chọn:
        <span class="info-yellow">{{ productList.length }}</span>&nbsp;loại&nbsp;&nbsp;Tổng cộng:
        <el-input
          v-wk-number
          v-model="totalPrice"
          style="width: 120px"
          placeholder="Vui lòng nhập"
          type="number"
          @input="totalPriceChange"
          @blur="totalPrice || (totalPrice = 0)"/>&nbsp;đồng
      </div>
    </flexbox>
  </div>
</template>
<script type="text/javascript">
import ObjMixin from './ObjMixin'
import CrmRelative from '@/components/CreateCom/CrmRelative'

export default {
  name: 'XhProduct', // 关联产品
  components: {
    CrmRelative
  },
  mixins: [ObjMixin],
  props: {},
  data() {
    return {
      showPopover: false, // 展示产品框
      showSelectView: false, // 内容
      productList: [],
      totalPrice: 0,
      discountRate: '',
      selectedData: { product: [] }
    }
  },
  computed: {},
  watch: {
    dataValue: function(value) {
      this.refreshProductList()
    },
    productList() {
      this.selectedData = { product: this.productList || [] }
    }
  },
  mounted() {
    this.refreshProductList()
  },
  methods: {
    /**
     * 刷新数据
     */
    refreshProductList() {
      this.productList = this.dataValue.product || []
      this.totalPrice = this.dataValue.totalPrice || 0
      this.discountRate = this.dataValue.discountRate || ''
    },
    /** 选中 */
    selectInfos(data) {
      if (data.data) {
        const newSelects = []
        data.data.forEach(element => {
          const obj = this.productList.find(item => {
            return item.productId == element.productId
          })
          if (obj) {
            newSelects.push(obj)
          } else {
            newSelects.push(this.getShowItem(element))
          }
        })
        this.productList = newSelects
        this.calculateToal()
      }
    },
    getShowItem(data) {
      const item = {}
      item.name = data.name
      item.categoryName = data.categoryName
      item.unit = data.unit
      item.price = data.price || 0
      item.salesPrice = data.price || 0
      item.num = 1
      item.discount = 0
      item.subtotal = data.price || 0
      item.productId = data.productId
      return item
    },
    // 单价
    salesPriceChange(data) {
      const item = data.row

      if (item.price !== 0) {
      let discount = ((item.price - item.salesPrice || 0) / item.price) * 100.0
      discount = discount.toFixed(2)
      if (item.discount !== discount) {
        item.discount = discount
      }
      }

      this.calculateSubTotal(item)
      this.calculateToal()
    },
    // 数量
    numChange(data) {
      const item = data.row
      this.calculateSubTotal(item)
      this.calculateToal()
    },
    // 折扣
    discountChange(data) {
      const item = data.row
      let salesPrice =
        (item.price * (100.0 - parseFloat(item.discount || 0))) / 100.0
      salesPrice = salesPrice.toFixed(2)
      if (item.salesPrice !== salesPrice) {
        item.salesPrice = salesPrice
      }
      this.calculateSubTotal(item)
      this.calculateToal()
    },
    // 计算单价
    calculateSubTotal(item) {
      item.subtotal = (item.salesPrice * parseFloat(item.num || 0)).toFixed(2)
    },
    // 计算总价
    calculateToal() {
      let totalPrice = this.getProductTotal()
      totalPrice =
        (totalPrice * (100.0 - parseFloat(this.discountRate || 0))) / 100.0
      this.totalPrice = totalPrice.toFixed(2)
      this.updateValue() // 传递数据给父组件
    },
    /**
     * 获取产品总价(未折扣)
     */
    getProductTotal() {
      let totalPrice = 0.0
      for (let i = 0; i < this.productList.length; i++) {
        const item = this.productList[i]
        totalPrice += parseFloat(item.subtotal)
      }
      return totalPrice
    },
    // 总折扣
    rateChange() {
      this.calculateToal()
    },
    /**
     * 总价更改 折扣更改
     */
    totalPriceChange() {
      const totalPrice = this.getProductTotal()
      if (totalPrice) {
        this.discountRate = (
          100.0 -
          (parseFloat(this.totalPrice) / totalPrice) * 100
        ).toFixed(2)
      }
      this.updateValue()
    },
    // 删除操作
    removeItem(index) {
      this.productList.splice(index, 1)
      this.calculateToal()
    },
    updateValue() {
      this.valueChange({
        product: this.productList,
        totalPrice: this.totalPrice,
        discountRate: this.discountRate
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.handel-header {
  overflow: hidden;
  button {
    float: right;
    margin-bottom: 10px;
  }
}

.el-table /deep/ thead th {
  font-size: 12px;
}

.el-table /deep/ tbody tr td {
  font-size: 12px;
}

.handle-footer {
  position: relative;
  font-size: 12px;
  padding: 5px;
  .discount-title {
    color: #666;
  }
  .total-info {
    position: absolute;
    right: 20px;
    top: 5px;
    .info-yellow {
      color: #fd715a;
    }
  }
}
</style>
