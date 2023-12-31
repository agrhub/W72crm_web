<template>
  <div>
    <div
      v-for="(item, index) in mainList"
      :key="index"
      class="expense-item">
      <flexbox class="expense-item-head">
        <div class="expense-item-head-title">Chi tiết về chi phí hoàn trả （{{ index+1 }}）</div>
        <i
          v-if="index != 0"
          class="el-icon-delete expense-item-head-delete"
          @click="deleteItems(index)"/>
      </flexbox>
      <flexbox
        wrap="wrap"
        align="stretch"
        class="clauses">
        <flexbox-item
          v-for="(subItem, subIndex) in showItems"
          :span="1/2"
          :key="subIndex"
          class="clauses-item">
          <div class="clauses-item-title">
            {{ subItem.name }}
          </div>
          <el-date-picker
            v-if="subItem.formType == 'datetime'"
            v-model="item[subItem.field]"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="Chọn ngày"
            @change="valueChange"/>
          <el-input-number
            v-else-if="subItem.formType == 'number'"
            v-model="item[subItem.field]"
            :controls="false"
            :precision="2"
            :min="0"
            @input="calculateValueChange(index, subIndex)"/>
          <el-input
            v-else
            v-model="item[subItem.field]"
            :maxlength="100"
            type="text"
            @input="calculateValueChange(index, subIndex)"/>
        </flexbox-item>
        <flexbox-item
          :span="1/2"
          class="clauses-item">
          <div class="sub-total">
            Tổng (đồng)：<span>{{ item['money'] }}</span>
          </div>
        </flexbox-item>
      </flexbox>
      <div class="description">
        <div class="description-title">Chi tiết chi phí</div>
        <el-input
          v-model="item['description']"
          :rows="3"
          :maxlength="300"
          type="textarea"
          resize="none"
          show-word-limit
          @input="valueChange"/>
      </div>
      <div class="files">
        <el-button
          type="text"
          class="add-files"
          @click="addFiles(index)">Tải lên hình ảnh hóa đơn</el-button>
        <flexbox wrap="wrap">
          <div
            v-src:background-image="imgItem.url"
            v-for="(imgItem, imgIndex) in item['imgList']"
            :key="imgIndex"
            class="img-item"
            @mouseover="mouseImgOver(imgItem, imgIndex, item['imgList'])"
            @mouseleave="mouseImgLeave(imgItem, imgIndex, item['imgList'])">
            <div
              v-if="imgItem.showDelete"
              class="img-delete"
              @click="deleteFile(imgItem, imgIndex, item['imgList'])">×</div>
          </div>
        </flexbox>
      </div>
    </div>
    <div class="handle-bar">
      <el-button
        class="handle-bar-button"
        type="text"
        icon="el-icon-plus"
        @click="addItems(index)">Thêm các mục</el-button>
        <!-- <div class="handle-bar-total">
        Tổng （đồng）：<span>{{totalMoney}}</span>
      </div> -->
    </div>
    <input
      id="imageFileInput"
      type="file"
      accept="image/*"
      multiple
      @change="uploadImageFile" >
  </div>
</template>
<script type="text/javascript">
import { crmFileSaveAPI, crmFileDeleteAPI } from '@/api/common'
import objMixin from '@/components/CreateCom/objMixin'
import { guid, floatAdd } from '@/utils'

export default {
  name: 'XhExpenses', // 差旅报销事项
  components: {},
  mixins: [objMixin],
  props: {},
  data() {
    return {
      mainList: [],
      imageIndex: -1,
      totalMoney: '0', // 合计
      showItems: [
        {
          field: 'startAddress',
          name: 'Điểm đi',
          formType: 'text'
        },
        {
          field: 'endAddress',
          name: 'Điếm đến',
          formType: 'text'
        },
        {
          field: 'startTime',
          name: 'Ngày đi',
          formType: 'datetime'
        },
        {
          field: 'endTime',
          name: 'Ngày về',
          formType: 'datetime'
        },
        {
          field: 'traffic',
          name: 'Chi phí đi lại （đồng）',
          formType: 'number'
        },
        {
          field: 'stay',
          name: 'Chi phí ở （đồng）',
          formType: 'number'
        },
        {
          field: 'diet',
          name: 'Chi phí ăn （đồng）',
          formType: 'number'
        },
        {
          field: 'other',
          name: 'Chi phí khác （đồng）',
          formType: 'number'
        }
      ]
    }
  },
  computed: {},
  watch: {
    value: function(val) {
      this.dataValue = val
      if (val.list && val.list.length > 0) {
        this.mainList = val.list
      } else {
        this.mainList.push(this.getValueItem())
      }
    }
  },
  mounted() {
    if (this.dataValue.list && this.dataValue.list.length > 0) {
      this.mainList = this.dataValue.list
    } else {
      this.mainList.push(this.getValueItem())
    }
  },
  methods: {
    addFiles(index) {
      this.imageIndex = index
      document.getElementById('imageFileInput').click()
    },
    /** 图片选择出发 */
    uploadImageFile(event) {
      var files = event.target.files

      for (let index = 0; index < files.length; index++) {
        const file = files[index]
        crmFileSaveAPI({
          type: 'img',
          file: file,
          batchId: this.mainList[this.imageIndex].batchId
        })
          .then(res => {
            if (res) {
              this.mainList[this.imageIndex].imgList.push(res.data || {})
              this.submitValueChange()
            }
          })
          .catch(() => {})
      }
      event.target.value = ''
    },
    /** 鼠标移入和移除 图片区域 */
    mouseImgOver(item, index, items) {
      item.showDelete = true
      this.$set(items, index, item)
    },
    mouseImgLeave(item, index, items) {
      item.showDelete = false
      this.$set(items, index, item)
    },
    deleteFile(item, index, items) {
      this.$confirm('Bạn có chắc chắn muốn xóa tệp này không?', 'Thông báo', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(() => {
          crmFileDeleteAPI({
            id: item.fileId
          })
            .then(res => {
              items.splice(index, 1)
              this.$message.success('Thành công')
            })
            .catch(() => {})
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Không thành công'
          })
        })
    },
    deleteItems(index) {
      this.mainList.splice(index, 1)
      // 更新合计值
      this.updateTotalValue()
      this.submitValueChange(true)
    },
    addItems() {
      this.mainList.push(this.getValueItem())
    },
    valueChange() {
      this.submitValueChange(false)
    },
    // 值更新的回调
    calculateValueChange(mainIndex, subIndex) {
      if (subIndex < 2) {
        this.submitValueChange(false)
        return
      }
      var subTotal = 0
      const calculateFields = ['traffic', 'stay', 'diet', 'other']
      const mainItem = this.mainList[mainIndex]
      calculateFields.forEach(field => {
        subTotal = floatAdd(
          subTotal,
          parseFloat(mainItem[field] ? mainItem[field] : 0)
        )
      })
      mainItem.money = subTotal

      // 更新合计值
      this.updateTotalValue()

      this.submitValueChange(true)
    },

    /**
     * 更新合计
     */
    updateTotalValue() {
      let total = 0
      for (let index = 0; index < this.mainList.length; index++) {
        const element = this.mainList[index]
        total = floatAdd(
          total,
          parseFloat(element.money ? element.money : 0)
        )
      }
      this.totalMoney = total
    },

    submitValueChange(update) {
      this.$emit('value-change', {
        index: this.index,
        value: {
          list: this.mainList,
          update: update, // 是否更新总数
          money: this.totalMoney
        }
      })
    },
    getValueItem() {
      return {
        startAddress: '',
        endAddress: '',
        startTime: '',
        endTime: '',
        traffic: '',
        stay: '',
        diet: '',
        other: '',
        money: '0',
        description: '',
        imgList: [],
        batchId: guid()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.expense-item {
  border: 1px solid #e6e6e6;
  border-radius: 2px;
  padding-bottom: 15px;
  margin-bottom: 10px;
  &-head {
    padding: 10px 20px;
    background-color: #f5f5f5;
    &-title {
      height: auto;
      font-size: 12px;
      color: #333;
      flex: 1;
      line-height: normal;
    }

    &-delete {
      cursor: pointer;
      padding: 0 10px;
      color: #2362FB;
      font-size: 14px;
    }
  }
}

.clauses {
  padding: 10px 10px;
  &-item {
    margin-left: 0 !important;
    display: flex;
    padding: 0 10px;
    &-title {
      width: 90px;
      flex-shrink: 0;
      font-size: 12px;
      color: #333;
    }

    .el-date-editor,
    .el-select {
      width: 100%;
    }

    .el-input-number {
      width: 100%;
      /deep/ .el-input__inner {
        padding: 0 8px;
        text-align: left;
      }
    }
  }
}

.sub-total {
  font-size: 12px;
  color: #333;
}

.description {
  padding: 0 20px;
  &-title {
    font-size: 12px;
    color: #333;
  }
}

.el-input /deep/ .el-input__inner {
  border-color: #ddd !important;
}

.el-select /deep/ .el-input__inner {
  border-color: #ddd !important;
}

.el-textarea /deep/ .el-textarea__inner {
  border-color: #ddd !important;
}

.el-input-number /deep/ .el-input__inner {
  border-color: #ddd !important;
}

.handle-bar {
  padding: 0 20px;
  height: 29px;
  &-button {
    float: right;
    border: none;
    color: #2362FB;
  }
  &-total {
    margin-top: 10px;
    text-align: left;
    font-size: 13px;
    color: #333;
    span {
      color: #666;
    }
  }
}

.files {
  padding: 0 20px;
}

.img-item {
  width: 98px;
  height: 98px;
  border: 1px solid #ccc;
  display: inline-block;
  margin: 0 4px 4px 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  .img-delete {
    position: absolute;
    cursor: pointer;
    top: 0;
    right: 0;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    font-size: 17px;
    background-color: #666;
    color: white;
  }
}

#imageFileInput {
  display: none;
}
</style>
