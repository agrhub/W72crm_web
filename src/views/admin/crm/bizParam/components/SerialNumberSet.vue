<template>
  <div v-loading="loading" class="serial-number-set">
    <div class="content-title">
      <span>Cài đặt mã số</span>
      <el-button
        type="primary"
        class="rt"
        size="medium"
        @click="save">Lưu</el-button>
    </div>
    <div class="content-body">
      <reminder
        content="1. The date type number of the opportunity number, payment return number, invoice number, and return visit number are all obtained from the creation time, and the date number of the contract number is obtained from the order time. If the order time is empty, it is obtained from the creation time<br />2. If the automatically generated number is duplicated with the existing number in the system, this number will be automatically skipped and generated sequentially<br />3. Set at least two levels of numbering rules<br />4. The text type supports up to 12 characters, and the starting number of the number type number is 1-9" />
      <div v-for="(listItem, index) in list" :key="index" class="rule-section">
        <div class="rule-header">
          <span class="rule-header-title">{{ listItem.label | labelName }}</span>
          <el-switch
            v-model="listItem.status"
            :active-value="1"
            :inactive-value="0"/>
          <span :class="{'inactive': listItem.status != 1}">{{ listItem.status == 1 ? 'Bật tạo tự động': 'Tắt tạo tự động' }}</span>
        </div>
        <template v-if="listItem.status == 1">
          <!-- <el-checkbox
            v-model="listItem.replace"
            :true-label="1"
            :false-label="0">Thay thế mã số hiện có</el-checkbox> -->
          <flexbox>
            <div class="rule-body">
              <div class="example">Ví dụ về mã số：{{ listItem.setting | exampleName }}</div>
              <div v-for="(typeItem, typeIndex) in listItem.setting" :key="'rule'+typeIndex" class="rule">
                <span>{{ typeIndex | typeListName }}</span>
                <el-select
                  v-model="typeItem.type"
                  class="rule-type"
                  @change="typeChange(typeItem, listItem.setting, typeIndex)">
                  <el-option
                    v-for="item in typeOptions"
                    :key="'type' + item.value"
                    :label="item.label"
                    :value="item.value"/>
                </el-select>
                <template>
                  <el-input v-if="typeItem.type == 1" v-model="typeItem.value" :maxlength="12" class="rule-input" />
                  <template v-else-if="typeItem.type == 2">
                    <el-select v-model="typeItem.value" class="rule-select" >
                      <el-option
                        v-for="item in timeOptions"
                        :key="'time' + item.value"
                        :label="item.label"
                        :value="item.value"/>
                    </el-select>
                    <!-- <el-tooltip
                      v-if="listItem.label == 6"
                      content="Có được từ thời điểm đặt hàng trên hợp đồng"
                      effect="dark"
                      placement="top">
                      <i class="wk wk-help wk-help-tips"/>
                    </el-tooltip> -->
                  </template>

                  <template v-else-if="typeItem.type == 3">
                    <span class="rule-code-span">Số bắt đầu</span>
                    <el-input v-model="typeItem.value" :maxlength="9" class="rule-code-input" type="number" @input="if(typeItem.value.length>9)typeItem.value=typeItem.value.slice(0,9)" />
                    <span class="rule-code-span">Bước số tăng</span>
                    <el-input v-model="typeItem.increaseNumber" :maxlength="9" class="rule-code-input" type="number" @input="if(typeItem.increaseNumber.length>9)typeItem.increaseNumber=typeItem.increaseNumber.slice(0,9)" />
                    <span class="rule-code-span">Bắt đầu đánh số lại</span>
                    <el-select v-model="typeItem.resetType" class="rule-code-input" >
                      <el-option
                        v-for="item in intervalOptions"
                        :key="'interval' + item.value"
                        :label="item.label"
                        :value="item.value"/>
                    </el-select>
                  </template>
                </template>
                <i
                  v-if="listItem.setting.length > 2"
                  class="el-icon-remove"
                  @click="deleteItem(listItem.setting, typeIndex)"/>
              </div>
              <el-button
                :disabled="listItem.setting.length >= 6"
                type="text"
                @click="addItem(listItem.setting)">+Thêm một cấp</el-button>
            </div>
          </flexbox>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {
  sysConfigNumberQueryAPI,
  sysConfigNumberSetAPI
} from '@/api/admin/crm'

import Reminder from '@/components/Reminder'
import crmTypeModel from '@/views/crm/model/crmTypeModel'

import moment from 'moment'

export default {
  name: 'SerialNumberSet',

  components: {
    Reminder
  },

  filters: {
    typeListName(value) {
      return ['Số cấp 1', 'Số cấp 2', 'Số cấp 3', 'Số cấp 4', 'Số cấp 5', 'Số cấp 6'][value]
    },

    labelName(label) {
      return crmTypeModel.convertTypeToName(label) + ' đánh số'
    },

    exampleName(setting) {
      let names = ''
      for (let i = 0; i < 2; i++) {
        if (i == 1) {
          names = names ? `${names}、` : ''
        }
        for (let index = 0; index < setting.length; index++) {
          const element = setting[index]
          const line = index > 0 ? '-' : ''
          if (element.value) {
            if (element.type == 1) {
              names = names + `${line}${element.value}`
            } else if (element.type == 2) {
              let formate = ''
              if (element.value) {
                formate = {
                  yyyy: 'YYYY',
                  yyyyMM: 'YYYYMM',
                  yyyyMMdd: 'YYYYMMDD'
                }[element.value]
              }
              const value = formate ? moment().format(formate) : ''
              names = names + `${line}${value}`
            } else if (element.type == 3) {
              const length = element.value ? element.value.length : 0
              let startValue = parseInt(element.value || 0)
              const interalValue = parseInt(element.increaseNumber || 0)
              if (i == 1) {
                startValue = startValue + interalValue
              }
              let startShowValue = startValue.toString() || ''
              if (startShowValue.length != length) {
                const addCount = length - startShowValue.length
                for (let index = 0; index < addCount; index++) {
                  startShowValue = '0' + startShowValue
                }
              }
              names = names + `${line}${startShowValue}`
            }
          }
        }
      }

      return names
    }
  },

  data() {
    return {
      loading: false, // 展示加载中效果
      typeOptions: [{
        value: 1,
        label: 'Văn bản'
      }, {
        value: 2,
        label: 'Ngày'
      }, {
        value: 3,
        label: 'Số nguyên'
      }],
      timeOptions: [{
        value: 'yyyy',
        label: 'yyyy（năm）'
      }, {
        value: 'yyyyMM',
        label: 'yyyyMM（năm/tháng）'
      }, {
        value: 'yyyyMMdd',
        label: 'yyyyMMdd（năm/tháng/ngày）'
      }],
      intervalOptions: [{
        value: 1,
        label: 'Mỗi ngày'
      }, {
        value: 2,
        label: 'Mỗi tháng'
      }, {
        value: 3,
        label: 'Mỗi năm'
      }, {
        value: 4,
        label: 'Không giới hạn'
      }],
      list: [] // 展示类型数据
    }
  },

  created() {
    this.getDetail()
  },

  methods: {
    /**
     * 获取详情
     */
    getDetail() {
      this.loading = true
      sysConfigNumberQueryAPI()
        .then(res => {
          this.loading = false
          this.list = res.data || []
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 增加类型
     */
    addItem(setting) {
      if (setting.length < 6) {
        setting.push({
          type: 1,
          value: ''
        })
      }
    },

    /**
     * 删除事项操作
     */
    deleteItem(setting, index) {
      if (setting.length > 2) {
        setting.splice(index, 1)
      }
    },

    /**
     * 类型修改
     */
    typeChange(typeItem, list, index) {
      if (typeItem.type == 3) {
        this.$set(list, index, {
          type: typeItem.type,
          value: '',
          increaseNumber: '',
          resetType: 4
        })
      } else if (typeItem.type == 2) {
        this.$set(list, index, {
          type: typeItem.type,
          value: 'yyyy'
        })
      } else {
        this.$set(list, index, {
          type: typeItem.type,
          value: ''
        })
      }
    },

    /**
     * 保存操作
     */
    save() {
      let pass = true
      for (let bIndex = 0; bIndex < this.list.length; bIndex++) {
        const big = this.list[bIndex]
        for (let index = 0; index < big.setting.length; index++) {
          const item = big.setting[index]
          if (item.type == 3) {
            if (item.increaseNumber === '' ||
          item.increaseNumber === undefined ||
           item.value === '' ||
            item.value === undefined) {
              pass = false
              break
            }
          } else if (item.type != 2) {
            if (item.value === '' ||
          item.value === undefined) {
              pass = false
              break
            }
          }
        }
      }

      if (pass) {
        this.loading = true
        sysConfigNumberSetAPI(this.list)
          .then(res => {
            this.loading = false
            this.getDetail()
            this.$message.success('Thành công')
          })
          .catch(() => {
            this.loading = false
          })
      } else {
        this.$message.error('Không thành công')
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.content-title {
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.content-title > span {
  display: inline-block;
  height: 36px;
  line-height: 36px;
  margin-left: 20px;
}

.content-body {
  height: calc(100% - 57px);
  padding: 30px;
  overflow-y: auto;
}

.rule-section {
  margin-top: 25px;
  .rule-header {
    margin-bottom: 8px;

    &-title {
      font-weight: bold;
    }

    .el-switch {
      margin-left: 8px;
    }

    .inactive {
      color: #ccc;
    }
  }

  .el-checkbox {
    margin-bottom: 8px;
  }

  .rule-body {
    position: relative;
    margin-top: 10px;
    background: #FAFAFA;
    padding: 20px 20px 10px;
    border-radius: 4px;
    border: 1px solid #f6f6f6;

    .rule {
      &-type {
        width: 80px;
        margin-left: 15px;
      }

      &-select,
      &-input {
        width: 200px;
        margin-left: 15px;
      }

      &-code-input {
        width: 140px;
      }

      &-code-span {
        margin-left: 15px;
      }

      .el-icon-remove {
        color: #ff6767;
        cursor: pointer;
        margin-left: 2px;
        display: none;
      }
    }
    .rule + .rule {
      margin-top: 8px;
    }
    .rule:hover {
      .el-icon-remove {
        display: inline;
      }
    }
  }

  .example {
    color: #666;
    margin-bottom: 10px;
  }
}

.rule-section + .rule-section {
  margin-top: 20px;
}
</style>
