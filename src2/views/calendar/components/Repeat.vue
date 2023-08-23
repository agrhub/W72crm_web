<template>
  <div class="repeat-box">
    <el-form ref="ruleForm" :rules="rules" :model="form" label-width="80px" label-position="left">
      <el-form-item label="Lặp lại">
        <el-select
          v-model="form.repetitionType"
          placeholder="Chọn loại lặp lại"
          @change="changeRepeat">
          <el-option
            v-for="item in repeatList"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </el-form-item>
      <template v-if="form.repetitionType != 1">
        <el-form-item label="Tần suất lặp lại" style="whiteSpace: nowrap" prop="repeatRate" class="form_1">
          <el-input
            v-model.number="form.repeatRate"
            type="number"
            min="0"
            autocomplete="off"/>
          <span>{{ timeList[form.repetitionType] }}</span>
        </el-form-item>
        <el-form-item
          v-if="form.repetitionType != 2 && form.repetitionType != 5"
          class="form_1"
          label="Thời gian lặp lại"
          prop="repeatTime">
          <el-checkbox-group
            v-if="form.repetitionType == 3"
            v-model="checkedRepeatTime"
            @change="changeRepeatTime">
            <el-checkbox
              v-for="item in repeatTimeList"
              :label="item.label"
              :value="item.value"
              :key="item.value"/>
          </el-checkbox-group>
          <el-select v-else v-model="form.repeatTime" >
            <el-option
              v-for="item in dayList"
              :key="item"
              :label="item"
              :value="item"/>
          </el-select>
        </el-form-item>
        <el-form-item label="Kết thúc" class="form_radio" prop="endTypeConfig">
          <el-radio-group v-model="form.endType" @change="changeEndDate">
            <el-radio label="1">Không kết thúc</el-radio>
            <el-radio label="2">Lặp lại
              <el-input
                :disabled="!(form.endType == 2)"
                v-model="endCount"
                type="number"
                class="radio_input"/> Sau
            </el-radio>
            <el-radio label="3">
              <span class="date_span"> Ngày cuối</span>
              <el-date-picker
                :disabled="!(form.endType == 3)"
                v-model="endDate"
                class="form_date"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                placeholder="Chọn ngày"/>
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </template>
      <el-form-item label="Tóm lược" class="form_bottom">
        <div class="bottom-text" v-text="summaryText()"/>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'Repeat',
  props: {
    repeatType: {
      type: Number,
      default: 0
    },
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      form: {
        repeatTime: '',
        repeatRate: '', // 重复频率
        endType: '1', // 结束类型
        endTypeConfig: '', // 结束次数/时间
        repetitionType: 0
      },
      endDate: '',
      endCount: '',
      repeatList: [
        { label: 'Không lặp lại', value: 1 },
        { label: 'Hằng ngày', value: 2 },
        { label: 'Hàng tuần', value: 3 },
        { label: 'Mỗi tháng', value: 4 },
        { label: 'Mỗi năm', value: 5 }
      ],
      timeList: ['', '', 'ngày', 'tuần', 'tháng', 'năm'],
      checkedRepeatTime: [],
      repeatTimeList: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
        { label: '5', value: '5' },
        { label: '6', value: '6' },
        { label: '7', value: '7' }
      ],
      dayList: [],
      rules: {
        repeatRate: [
          { required: true, message: 'Không được để trống tần số lặp lại', trigger: 'blur' }
        ],
        endTypeConfig: [
          { required: true, message: 'Vui lòng nhập số lần lặp lại hoặc ngày kết thúc', trigger: 'change' }
        ],
        repeatTime: [
          { required: true, message: 'Vui lòng chọn thời gian lặp lại', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    endDate(val) {
      this.form.endTypeConfig = val
      this.$refs['ruleForm'].validateField('endTypeConfig')
    },
    endCount(val) {
      this.form.endTypeConfig = val
      this.$refs['ruleForm'].validateField('endTypeConfig')
    }
  },
  mounted() {
    this.dayList = []
    this.changeEndDate(1)
    this.form.repetitionType = this.repeatType
    if (Object.keys(this.detail).length) {
      this.form.repetitionType = this.detail.repetitionType
      this.form.repeatTime = this.detail.repeatTime || ''
      this.form.repeatRate = this.detail.repeatRate || ''
      this.form.endType = this.detail.endType + '' || ''
      if (this.detail.endType == 2) {
        this.endCount = this.detail.endTypeConfig
        this.endDate = ''
      } else if (this.detail.endType == 3) {
        this.endDate = this.detail.endTypeConfig
        this.endCount = ''
      }
      this.form.endTypeConfig = this.detail.endTypeConfig
      if (this.form.endType == 1 || !this.form.endType) {
        this.form.endTypeConfig = this.detail.endTypeConfig || 'useless'
      }
    }
    for (let i = 1; i <= 31; i++) {
      this.dayList.push(i)
    }
  },
  methods: {
    /**
     * 摘要文字
     */
    summaryText() {
      if (this.form.repetitionType === 1) {
        return 'Không lặp lại'
      } else if (this.form.repetitionType === 2) {
        return `Mỗi ${this.form.repeatRate} ngày`
      } else if (this.form.repetitionType === 3) {
        return `Mỗi ${this.form.repeatRate} tuần, Mỗi ${this.checkedRepeatTime.join('、')}`
      } else if (this.form.repetitionType === 4) {
        return `Mỗi ${this.form.repeatRate} tháng，Mỗi ${this.form.repeatTime} ngày`
      } else if (this.form.repetitionType === 5) {
        return `Mỗi ${this.form.repeatRate} năm`
      }
    },

    /**
     * 改变结束类型
     */
    changeEndDate(value) {
      if (value == 1) {
        // 此值没有仅作为表单验证使用，没有任何意义
        this.form.endTypeConfig = 'useless'
        this.endDate = ''
        this.endCount = ''
      } else if (value == 2) {
        this.endDate = ''
        this.form.endTypeConfig = ''
      } else if (value == 3) {
        this.endCount = ''
        this.form.endTypeConfig = ''
      }
      this.$refs['ruleForm'].validateField('endTypeConfig')
    },

    /**
     * 改变重复类型
     */
    changeRepeat(value) {
      this.form = {
        repetitionType: value,
        repeatTime: '',
        repeatRate: '', // 重复频率
        endType: '1', // 结束类型
        endTypeConfig: '' // 结束次数/时间
      }
      this.changeEndDate(1)
    },

    /**
     * 改变重复时间
     */
    changeRepeatTime() {
      if (this.checkedRepeatTime.length) {
        const list = []
        this.repeatTimeList.forEach(item => {
          this.checkedRepeatTime.forEach(element => {
            if (item.label === element) {
              list.push(item.value)
            }
          })
        })
        this.form.repeatTime = list.join(',')
        this.$refs['ruleForm'].validateField('repeatTime')
      } else {
        this.form.repeatTime = ''
        this.$refs['ruleForm'].validateField('repeatTime')
      }
    }
  }
}
</script>
<style scoped lang="scss">
.bottom-text{
  color: #666;
}
/deep/.el-form-item__content{
  width: 443px;
}
/deep/.el-radio{
  display: block;
  line-height: 46px;
  height: 46px;
}
/deep/.form_radio{
  margin-bottom: 10px;
  /deep/.el-form-item__content{
    margin-top: 0px;
    }
  .el-form-item__error{
    left: 100px !important;
    }
}
.form_bottom{
  margin-bottom: 10px;
}
.radio_input{
  width: 200px !important;
  /deep/.el-input__inner{
    width: 145px !important;
    margin-left: 50px !important;
  }
 }
 .form_date{
   width: 200px !important;
   /deep/.el-input__inner{
     width: 200px !important;
   }
 }
 .date_span{
   display: inline-block;
   margin-right: 24px;
 }
</style>
