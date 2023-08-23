<template>
  <div v-loading="loading">
    <div class="content-title">
      <span>Cài đặt quy tắc báo cáo</span>
      <el-tooltip
        content="You can configure log rules. In the log module, you can count the log completion status according to the log rules"
        effect="dark"
        placement="top">
        <i class="wk wk-help wk-help-tips"/>
      </el-tooltip>
      <el-button
        type="primary"
        class="rt"
        size="medium"
        @click="save">Lưu</el-button>
    </div>
    <div class="content-body">
      <create-sections title="Báo cáo hàng ngày">
        <div slot="header" :class="{ 'is-inactive': dayForm.status == 0}" class="rule-set">
          <el-switch
            v-model="dayForm.status"
            :active-value="1"
            :inactive-value="0"
            active-color="#2362FB"/>
          <span class="label">Kích hoạt</span>
        </div>

        <el-form ref="dayForm" :model="dayForm" label-width="120px">
          <el-form-item>
            <template slot="label">
              <span>Người nộp</span>
              <el-tooltip
                content="Mặc định tất cả nhân viên"
                effect="dark"
                placement="top">
                <i class="wk wk-help wk-help-tips"/>
              </el-tooltip>
            </template>
            <xh-user-cell
              :value="dayForm.memberUser"
              :radio="false"
              @value-change="dayUserChage"/>
          </el-form-item>

          <el-form-item label="Ngày nộp báo cáo trong tuần">
            <el-checkbox-group v-model="dayForm.effectiveDay">
              <el-checkbox v-for="item in weekDaysOptions" :label="item.value" :key="item.value">{{ item.label }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="Giờ bắt đầu nhận">
            <el-select v-model="dayForm.startTime" >
              <el-option
                v-for="item in dayTimeOptions"
                :key="item"
                :label="item"
                :value="item"/>
            </el-select>
          </el-form-item>

          <el-form-item label="Giờ kết thúc nhận">
            <el-select v-model="dayForm.endTime" >
              <el-option
                v-for="item in dayTimeOptions"
                :key="item"
                :label="item"
                :value="item"/>
            </el-select>
          </el-form-item>


        </el-form>
      </create-sections>
      <create-sections title="Báo cáo hàng tuần">
        <div slot="header" :class="{ 'is-inactive': weekForm.status == 0}" class="rule-set">
          <el-switch
            v-model="weekForm.status"
            :active-value="1"
            :inactive-value="0"
            active-color="#2362FB"/>
          <span class="label">Kích hoạt</span>
        </div>
        <el-form ref="weekForm" :model="weekForm" label-width="120px">
          <el-form-item>
            <template slot="label">
              <span>Người nộp</span>
              <el-tooltip
                content="Mặc định tất cả nhân viên"
                effect="dark"
                placement="top">
                <i class="wk wk-help wk-help-tips"/>
              </el-tooltip>
            </template>
            <xh-user-cell
              :value="weekForm.memberUser"
              :radio="false"
              @value-change="weekUserChage"/>
          </el-form-item>

          <el-form-item>
            <template slot="label">
              <span>Thời gian bắt đầu gửi</span>
              <el-tooltip
                content="Từ 00:00 ngày đã chọn"
                effect="dark"
                placement="top">
                <i class="wk wk-help wk-help-tips"/>
              </el-tooltip>
            </template>
            <el-select v-model="weekForm.startDay" >
              <el-option
                v-for="item in weekDaysOptions"
                :key="item.value"
                :label="`Mỗi ${item.label}`"
                :value="parseInt(item.value)"/>
            </el-select>
          </el-form-item>

          <el-form-item>
            <template slot="label">
              <span>Thời gian kết thúc nhận</span>
              <el-tooltip
                content="Trước 24:00 của ngày đã chọn"
                effect="dark"
                placement="top">
                <i class="wk wk-help wk-help-tips"/>
              </el-tooltip>
            </template>
            <el-select v-model="weekForm.endDay" >
              <el-option
                v-for="item in weekDaysOptions"
                :key="item.value"
                :label="`Mỗi ${item.label}`"
                :value="parseInt(item.value)"/>
            </el-select>
          </el-form-item>


        </el-form>
      </create-sections>
      <create-sections title="báo cáo tháng">
        <div slot="header" :class="{ 'is-inactive': monthForm.status == 0}" class="rule-set">
          <el-switch
            v-model="monthForm.status"
            :active-value="1"
            :inactive-value="0"
            active-color="#2362FB"/>
          <span class="label">Kích hoạt</span>
        </div>
        <el-form ref="monthForm" :model="monthForm" label-width="120px">
          <el-form-item>
            <template slot="label">
              <span>Người nộp</span>
              <el-tooltip
                content="Mặc định tất cả nhân viên"
                effect="dark"
                placement="top">
                <i class="wk wk-help wk-help-tips"/>
              </el-tooltip>
            </template>
            <xh-user-cell
              :value="monthForm.memberUser"
              :radio="false"
              @value-change="monthUserChage"/>
          </el-form-item>

          <el-form-item>
            <template slot="label">
              <span>Thời gian bắt đầu gửi</span>
              <el-tooltip
                content="Từ 00:00 ngày đã chọn"
                effect="dark"
                placement="top">
                <i class="wk wk-help wk-help-tips"/>
              </el-tooltip>
            </template>
            <el-select v-model="monthForm.startDay" >
              <el-option
                v-for="item in monthTimeOptions"
                :key="item.value"
                :label="`${item.label}`"
                :value="item.value"/>
            </el-select>
          </el-form-item>

          <el-form-item>
            <template slot="label">
              <span>Thời gian kết thúc nhận</span>
              <el-tooltip
                content="Trước 24:00 ngày đã chọn"
                effect="dark"
                placement="top">
                <i class="wk wk-help wk-help-tips"/>
              </el-tooltip>
            </template>
            <el-select v-model="monthForm.endDay" >
              <el-option
                v-for="item in monthTimeOptions"
                :key="item.value"
                :label="`${item.label}`"
                :value="item.value"/>
            </el-select>
          </el-form-item>


        </el-form>
      </create-sections>
    </div>
  </div>
</template>

<script>
import {
  oaLogRuleSetAPI,
  oaLogRuleQueryAPI
} from '@/api/admin/other'

import CreateSections from '@/components/CreateSections'
import { XhUserCell } from '@/components/CreateCom'


export default {
  name: 'LogRuleSet', // 日志规则设置

  components: {
    CreateSections,
    XhUserCell
  },

  data() {
    return {
      loading: false, // 展示加载中效果

      weekDaysOptions: [
        {
          label: 'CN',
          value: '1'
        },
        {
          label: 'T2',
          value: '2'
        },
        {
          label: 'T3',
          value: '3'
        },
        {
          label: 'T4',
          value: '4'
        },
        {
          label: 'T5',
          value: '5'
        },
        {
          label: 'T6',
          value: '6'
        },
        {
          label: 'T7',
          value: '7'
        }
      ],
      dayTimeOptions: [],
      monthTimeOptions: [],
      dayForm: {
        effectiveDay: ['1', '2', '3', '4', '5'],
        memberUser: []
      },
      weekForm: {
        memberUser: []
      },
      monthForm: {
        memberUser: []
      }
    }
  },

  created() {
    for (let index = 7; index <= 23; index++) {
      this.dayTimeOptions.push(index < 10 ? `0${index}:00` : `${index}:00`)
    }

    for (let index = 1; index <= 31; index++) {
      this.monthTimeOptions.push({
        label: `mỗi ${index} tháng`,
        value: index
      })
    }
    this.getDetail()
  },

  methods: {
    /**
     * 获取详情
     */
    getDetail() {
      this.loading = true
      oaLogRuleQueryAPI()
        .then(res => {
          this.loading = false
          const dayData = res.data[0] || {}
          this.dayForm = {
            type: dayData.type,
            status: dayData.status,
            ruleId: dayData.ruleId,
            memberUser: dayData.memberUser || [],
            effectiveDay: dayData.effectiveDay ? dayData.effectiveDay.split(',') : [],
            startTime: dayData.startTime,
            endTime: dayData.endTime
          }
          const weekData = res.data[1] || {}
          this.weekForm = {
            type: weekData.type,
            status: weekData.status,
            ruleId: weekData.ruleId,
            memberUser: weekData.memberUser || [],
            startDay: weekData.startDay,
            endDay: weekData.endDay
          }
          const monthData = res.data[2] || {}
          this.monthForm = {
            type: monthData.type,
            status: monthData.status,
            ruleId: monthData.ruleId,
            memberUser: monthData.memberUser || [],
            startDay: monthData.startDay,
            endDay: monthData.endDay
          }
        })
        .catch(() => {
          this.loading = false
        })
    },

    dayUserChage(data) {
      this.dayForm.memberUser = data.value || []
      this.dayForm.memberUserId = this.dayForm.memberUser.map(item => {
        return item.userId
      }).join(',')
    },

    weekUserChage(data) {
      this.weekForm.memberUser = data.value || []
      this.weekForm.memberUserId = this.weekForm.memberUser.map(item => {
        return item.userId
      }).join(',')
    },

    monthUserChage(data) {
      this.monthForm.memberUser = data.value || []
      this.monthForm.memberUserId = this.monthForm.memberUser.map(item => {
        return item.userId
      }).join(',')
    },

    /**
     * 保存操作
     */
    save() {
      if (this.dayForm.status == 1) {
        for (const key in this.dayForm) {
          const value = this.dayForm[key]
          // if (key == 'memberUser' && value.length == 0) {
          //   this.$message.error('请选择日报谁需要提交')
          //   return
          // } else
          if (key == 'weekDaysOptions' && value.length == 0) {
            this.$message.error('Vui lòng chọn báo cáo để được tính')
            return
          } else if ((key == 'startTime' || key == 'endTime') && !value) {
            this.$message.error('Vui lòng chọn thời gian báo cáo hàng ngày')
            return
          }
        }
      }

      if (this.weekForm.status == 1) {
        for (const key in this.weekForm) {
          const value = this.weekForm[key]
          // if (key == 'memberUser' && value.length == 0) {
          //   this.$message.error('请选择谁需要提交')
          //   return
          // } else
          if ((key == 'startDay' || key == 'endDay') && !value) {
            this.$message.error('Vui lòng chọn thời gian báo cáo hàng tuần')
            return
          }
        }
      }

      if (this.monthForm.status == 1) {
        for (const key in this.monthForm) {
          const value = this.monthForm[key]
          // if (key == 'memberUser' && value.length == 0) {
          //   this.$message.error('请选择谁需要提交')
          //   return
          // } else
          if ((key == 'startDay' || key == 'endDay') && !value) {
            this.$message.error('Vui lòng chọn thời gian báo cáo hàng tháng')
            return
          }
        }
      }

      this.loading = true
      const dayForm = { ...this.dayForm }
      dayForm.effectiveDay = dayForm.effectiveDay.join(',')
      oaLogRuleSetAPI([dayForm, this.weekForm, this.monthForm])
        .then(res => {
          this.loading = false
          this.getDetail()
          this.$message.success('Thành công')
        })
        .catch(() => {
          this.loading = false
        })
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
  height: calc(100% - 60px);
  padding: 15px 15px 30px;
  overflow-y: auto;
}

.el-form-item {
  margin-bottom: 10px;
}

.el-form {
  margin-top: 15px;
  width: 80%;
}

.user-container {
  width: 200px;
}

.rule-set {
  margin-left: 8px;

  &.is-inactive {
    color: #E2E2E2;
  }

  .label {
    font-size: 13px;
  }
}
</style>
