<template>
  <div class="field-info-section">
    <div class="item-section">
      <div class="name">
        Tên trường
      </div>
      <el-input
        v-model="field.name"
        :disabled="disabled"/>
      <div class="input-tips"><span>*</span>Tên trường không được để trống</div>
    </div>
    <div class="item-section">
      <div class="name">
        Văn bản mô tả
      </div>
      <el-input
        v-model="field.inputTips"
        :rows="3"
        :disabled="disabled"
        type="textarea"
        resize="none"/>
      <div class="input-tips"><span>*</span>Văn bản mô tả được hiển thị ở phía bên phải của tên thẻ</div>
    </div>

    <div
      v-if="showSelect"
      class="item-section">
      <div class="name">
        Cài đặt tùy chọn<span v-if="field.fieldName == 'level'" class="field-tips">(If the high seas rules enable "set according to customer level", after adjusting the options, please adjust the high seas rules simultaneously, otherwise the high seas rules will become invalid)</span>
      </div>
      <el-radio-group
        v-if="field.formType == 'select'"
        ref="radioGroup"
        v-model="field.defaultValue"
        :disabled="disabled">
        <draggable
          :list="field.showSetting"
          :options="{group: 'list',forceFallback:false, fallbackClass:'draggingStyle',filter: '.el-input__inner', preventOnFilter: false}" >
          <div
            v-for="(item, index) in field.showSetting"
            :key="index"
            class="radio cursor-move">
            <el-radio
              :label="item.value"
              @click.native.prevent="radioChange(item.value)">
              <el-input
                v-model="item.value"
                :disabled="disabled"
                class="input"
                @focus="radioInputChange(field)"
                @blur="radioInputChange(field)"/>
            </el-radio>
            <i
              class="el-icon-circle-plus handle"
              @click="handleRadio('add', item, index)"/>
            <i
              v-if="field.showSetting.length > 1"
              class="el-icon-remove handle"
              @click="handleRadio('remove', item, index)"/>
          </div>
        </draggable>
      </el-radio-group>
      <el-checkbox-group
        v-if="field.formType == 'checkbox'"
        v-model="field.defaultValue"
        :disabled="disabled">
        <draggable
          :list="field.showSetting"
          :options="{group: 'list',forceFallback:false, fallbackClass:'draggingStyle',filter: '.el-input__inner', preventOnFilter: false}" >
          <div
            v-for="(item, index) in field.showSetting"
            :key="index"
            class="checkbox cursor-move">
            <el-checkbox :label="item.value"/>
            <el-input
              v-model="item.value"
              :disabled="disabled"
              class="input"
              @focus="checkboxInputChange(field)"
              @blur="checkboxInputChange(field)"/>
            <i
              class="el-icon-circle-plus handle"
              @click.stop="handleCheckbox('add', item, index)"/>
            <i
              v-if="field.showSetting.length > 1"
              class="el-icon-remove handle"
              @click.stop="handleCheckbox('remove', item, index)"/>
          </div>

        </draggable>
      </el-checkbox-group>
    </div>

    <div
      v-if="showDefaultValue&&!isUserStructure"
      class="item-section">
      <div class="name">
        Giá trị mặc định
      </div>
      <el-input
        v-if="!showDatepicker"
        v-model="field.defaultValue"
        :disabled="disabled"
        @blur="inputBlur"/>
      <el-date-picker
        v-if="showDatepicker"
        v-model="field.defaultValue"
        :disabled="disabled"
        :type="field.formType == 'date' ? 'date' : 'datetime'"
        :value-format="field.formType == 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss'"
        placeholder="Chọn ngày"/>
      <div
        v-if="defaultTips"
        class="input-tips"><span>*</span>{{ defaultTips }}</div>
    </div>

    <div
      v-if="showMaxInput"
      class="item-section">
      <div class="name">
        Độ dài tối đa
      </div>
      <el-input
        v-model="field.maxLength"
        :maxlength="4"
        :disabled="disabled"/>
      <div class="input-tips"><span>*</span>Tối đa 2000 ký tự</div>
    </div>

    <div
      v-if="canTransform && transformData && transformData[field.formType]"
      class="item-section">
      <div class="name">
        Trường khách hàng chuyển đổi
      </div>
      <el-select
        v-model="field.relevant"
        clearable>
        <el-option
          v-for="item in transformData[field.formType]"
          :key="item.value"
          :label="item.label"
          :value="item.value"/>
      </el-select>
    </div>

    <div class="item-check-section">
      <el-checkbox
        v-model="field.isNull"
        :disabled="disabled"
        @change="inNullChange">Trường bắt buộc</el-checkbox>
    </div>
    <div
      v-if="canUnique"
      class="item-check-section">
      <el-checkbox
        v-model="field.isUnique"
        :disabled="disabled">Trường duy nhất</el-checkbox>
    </div>
    <div
      v-if="showHidden"
      class="item-check-section">
      <el-checkbox
        v-model="field.isHidden"
        :disabled="disabled || isDisabledHidden">Trường bị ần</el-checkbox>
    </div>
    <!-- <div
      v-if="field.fieldType == 1"
      class="item-check-section">
      <el-checkbox
        v-model="field.isUnique"
        :disabled="hiddenDisabled">Trường bị ần</el-checkbox>
      <el-tooltip
        :content="hiddenTips"
        effect="dark"
        placement="top">
        <i class="wk wk-help wk-help-tips"/>
      </el-tooltip>
    </div> -->
  </div>
</template>
<script type="text/javascript">
import draggable from 'vuedraggable'
import { regexIsCRMMobile, regexIsCRMEmail } from '@/utils'

export default {
  name: 'FieldInfo', // 自定义字段 字段详情
  components: {
    draggable
  },
  props: {
    // 单个字段详情
    field: {
      type: Object,
      default: () => {
        return {
          name: '', //  标识名
          formType: '', // 字段类型
          isUnique: false, // 是否唯一
          isNull: false, // 是否必填
          isHidden: false, // 是否隐藏字段
          inputTips: '', // 输入提示
          maxLength: '', // textarea 多行文本有最大数量
          defaultValue: '', // 默认值
          setting: '', // 接口返回setting数据
          showSetting: '', // 单选选项
          relevant: '' // 转移字段
        }
      }
    },
    // 是否开启转移  转移对应数据
    canTransform: Boolean,
    transformData: Object,
    // 是否能设置唯一
    canUnique: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {}
  },
  computed: {
    defaultTips() {
      if (this.field.formType == 'floatnumber') {
        return 'Phần nguyên của đơn vị tiền tệ phải dưới 15 chữ số và phần thập phân phải ít hơn 2 chữ số'
      } else if (this.field.formType == 'number') {
        return 'Phần nguyên của số phải có ít hơn 15 chữ số và phần thập phân phải có ít hơn 4 chữ số'
      }
      return ''
    },
    // 是否展示隐藏操作
    showHidden() {
      return this.$route.params.type !== 'oa_examine' // 办公审批不展示隐藏操作
    },
    /** 展示最大输入 */
    showMaxInput() {
      // if (this.field.formType == 'textarea') {
      //   return true
      // }
      return false
    },
    /** 展示默认值块 */
    showDefaultValue() {
      if (
        this.field.formType == 'select' ||
        this.field.formType == 'checkbox'
      ) {
        return false
      }
      return true
    },
    /** 展示单选多选 */
    showSelect() {
      if (
        this.field.formType == 'select' ||
        this.field.formType == 'checkbox'
      ) {
        return true
      }
      return false
    },
    /** 展示时间选择 */
    showDatepicker() {
      if (this.field.formType == 'date' || this.field.formType == 'datetime') {
        return true
      }
      return false
    },
    /** 控制人员和部分不展示默认值 */
    isUserStructure() {
      if (this.field.formType == 'user' || this.field.formType == 'structure') {
        return true
      }
      return false
    },
    /** 只读 */
    disabled() {
      // operating 0 改删 1改 2删 3无
      if (this.field.operating == 2 || this.field.operating == 3) {
        return true
      }
      return false
    },
    /**
     * 控制是否可隐藏系统字段
     */
    hiddenDisabled() {
      return this.field.fieldType != 1 || this.field.isNull == 1
    },

    hiddenTips() {
      return this.field.isNull == 1 ? 'Trường này là bắt buộc và không thể đặt thành ẩn' : 'Trường này không bắt buộc. Nó sẽ không được hiển thị khi bạn tạo một trường mới sau khi đặt nó làm trường ẩn'
    },

    /**
     * 禁用隐藏操作
     * 1: 'leads',
     * 2: 'customer',
     * 3: 'contacts',
     * 4: 'product',
     * 5: 'business',
     * 6: 'contract',
     * 7: 'receivables',
     * 8: 'receivables_plan',
     * 9: 'pool',
     * 17: 'visit',
     * 18: 'invoice'
     */
    isDisabledHidden() {
      if (this.field.label == 1) {
        return ['leads_id', 'leads_name', 'level'].includes(this.field.fieldName)
      } else if (this.field.label == 2) {
        return ['customer_name', 'level'].includes(this.field.fieldName)
      } else if (this.field.label == 3) {
        return ['customer_id', 'name'].includes(this.field.fieldName)
      } else if (this.field.label == 4) {
        return ['name', 'category_id', 'price', 'status'].includes(this.field.fieldName)
      } else if (this.field.label == 5) {
        return ['business_name', 'contract_id'].includes(this.field.fieldName)
      } else if (this.field.label == 6) {
        return ['customer_id', 'business_id', 'num', 'money', 'order_date'].includes(this.field.fieldName)
      } else if (this.field.label == 7) {
        return ['customer_id', 'contract_id', 'number', 'plan_id'].includes(this.field.fieldName)
      } else if (this.field.label == 17) {
        return ['customer_id', 'contract_id'].includes(this.field.fieldName)
      }
    }
  },
  watch: {
    field() {
      if (this.showSelect && this.field.showSetting.length == 0) {
        this.field.showSetting = [
          { value: 'Chọn 1' },
          { value: 'Chọn 2' },
          { value: 'Chọn 3' }
        ]
      }
    }
  },
  mounted() {
    if (this.showSelect && this.field.showSetting.length == 0) {
      this.field.showSetting = [
        { value: 'Chọn 1' },
        { value: 'Chọn 2' },
        { value: 'Chọn 3' }
      ]
    }
  },
  methods: {
    // 当选的操作
    handleRadio(type, item, index) {
      if (this.disabled) {
        // 不能点击
        return
      }
      if (type == 'add') {
        this.field.showSetting.push({
          value: 'Đã chọn ' + (this.field.showSetting.length + 1)
        })
      } else if (type == 'remove') {
        if (item.value == this.field.defaultValue) {
          this.field.defaultValue = ''
        }
        this.field.showSetting.splice(index, 1)
      }
    },
    radioChange(val) {
      this.field.defaultValue == val
        ? (this.field.defaultValue = '')
        : (this.field.defaultValue = val)
    },

    radioInputChange(field) {
      if (this.field.defaultValue) {
        let has = false
        for (let index = 0; index < field.showSetting.length; index++) {
          const item = field.showSetting
          if (this.field.defaultValue == item.value) {
            has = true
          }
        }

        if (!has) {
          this.field.defaultValue = ''
        }
      }
    },

    /**
     * 多选
     */
    handleCheckbox(type, item, index) {
      if (this.disabled) {
        // 不能点击
        return
      }
      if (type == 'add') {
        this.field.showSetting.push({
          value: 'Đã chọn ' + (this.field.showSetting.length + 1)
        })
      } else if (type == 'remove') {
        const removeIndex = this.field.defaultValue.indexOf(item.value)
        if (removeIndex != -1) {
          this.field.defaultValue.splice(removeIndex, 1)
        }
        this.field.showSetting.splice(index, 1)
      }
    },

    checkboxInputChange(field) {
      if (this.field.defaultValue && this.field.defaultValue.length) {
        const datas = this.field.showSetting.map(item => item.value)
        const newValue = []

        for (let index = 0; index < this.field.defaultValue.length; index++) {
          const item = this.field.defaultValue[index]
          if (datas.includes(item)) {
            newValue.push(item)
          }
        }

        if (this.field.defaultValue.length != newValue.length) {
          this.field.defaultValue = newValue
        }
      }
    },

    /** * 输入默认值触发 */
    inputBlur(e) {
      if (this.field.formType == 'mobile' && this.field.defaultValue) {
        if (!regexIsCRMMobile(this.field.defaultValue)) {
          this.$message({
            message: 'Sai định dạng số di động',
            type: 'error'
          })
        }
      } else if (this.field.formType == 'email' && this.field.defaultValue) {
        if (!regexIsCRMEmail(this.field.defaultValue)) {
          this.$message({
            message: 'Sai định dạng email',
            type: 'error'
          })
        }
      }
    },
    /**
     * 必填勾选改变
     */
    inNullChange(val) {
    }
  }
}
</script>
<style lang="scss" scoped>
.field-info-section {
  padding: 0 20px 20px;
}

.item-section {
  padding: 10px 0 12px 0;
  border-bottom: 1px solid #e6e6e6;
  .name {
    font-size: 13px;
    font-size: 500;
    color: #333;
    margin: 10px 0;
  }
}

.input-tips {
  font-size: 12px;
  margin-top: 10px;
  color: #999;
  span {
    color: red;
  }
}

.el-checkbox /deep/ .el-checkbox__label {
  font-size: 13px;
  color: #333333;
}

.item-check-section {
  margin-top: 15px;
}

.radio {
  margin-top: 5px;
  margin-left: 0;
  /deep/ .el-radio {
    margin-right: 10px !important;
  }
  .input {
    display: inline-block;
    width: 180px;
  }
  .handle {
    cursor: pointer;
    color: #ccc;
    font-size: 20px;
  }
}

.checkbox {
  display: block;
  margin-left: 0;
  margin-top: 5px;
  /deep/.el-checkbox {
    margin-right: 10px;
    .el-checkbox__label {
      display: none;
    }
  }
  .input {
    display: inline-block;
    width: 180px;
  }
  .handle {
    cursor: pointer;
    color: #ccc;
    font-size: 20px;
  }
}

.cursor-move {
  cursor: move;
}

.field-tips {
  color: #999;
  line-height: 1.5;
}
</style>
