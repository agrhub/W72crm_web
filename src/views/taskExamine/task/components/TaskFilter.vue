<template>
  <div class="task-filter">
    <div class="task-filter__header">
      <span class="task-filter__title">Bộ lọc</span>
    </div>
    <div class="task-filter__body">
      <el-form ref="form" label-width="80px">
        <el-form-item label="Quản lý">
          <xh-user-cell
            :value="users"
            class="handle-item-content"
            @value-change="userChage"/>
        </el-form-item>
        <el-form-item label="Hạn chót">
          <el-date-picker
            v-elclickoutside="handleDateClose"
            ref="filterDatePicker"
            v-model="dueDateValue"
            type="date"
            placeholder="Chọn ngày"
            value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="Độ ưu tiên">
          <el-select
            v-model="priorityValue">
            <el-option
              v-for="item in priorityOptions"
              :key="item.key"
              :label="item.label"
              :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="Trạng thái">
          <el-switch
            v-model="doneValue"/>
        </el-form-item>
      </el-form>
    </div>
    <div class="task-filter__footer">
      <span
        slot="footer"
        class="dialog-footer">
        <el-button @click.native="closeClick">Hủy</el-button>
        <el-button
          v-debounce="saveClick"
          type="primary">Lưu</el-button>
      </span>
    </div>
  </div>
</template>

<script>
import { XhUserCell } from '@/components/CreateCom'

import { objDeepCopy } from '@/utils'

export default {
  // 任务筛选
  name: 'TaskFilter',
  components: {
    XhUserCell
  },
  props: {
    dueDate: String,
    priority: String,
    users: Array,
    done: Boolean
  },
  data() {
    return {
      dueDateValue: '',
      priorityValue: '',
      doneValue: false,
      usersList: [],
      // 优先级
      priorityOptions: [
        { label: 'Tất cả', key: '' },
        { label: 'Cao', key: '3' },
        { label: 'TB', key: '2' },
        { label: 'Thấp', key: '1' },
        { label: 'N/A', key: '0' }
      ]
    }
  },
  computed: {},
  watch: {},
  created() {
    this.dueDateValue = this.dueDate
    this.priorityValue = this.priority
    this.doneValue = this.done
    this.usersList = objDeepCopy(this.users)
  },

  beforeDestroy() {},
  methods: {
    closeClick() {
      this.$emit('close')
    },

    userChage(data) {
      this.usersList = data.value
    },

    saveClick() {
      this.$emit('save', this.dueDateValue, this.priorityValue, this.doneValue, this.usersList)
      this.$emit('close')
    },

    /**
     * datepicker 不关闭的问题
     */
    handleDateClose() {
      this.$refs.filterDatePicker.pickerVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.task-filter {
  &__header {
    padding: 20px;
    padding-bottom: 10px;
  }

  &__title {
    line-height: 24px;
    font-size: 18px;
    color: #333;
    font-weight: 600
  }

  &__body {
    padding: 10px 15px;
    color: #666;
    font-size: 14px;
    word-break: break-all;

    .el-date-editor {
      width: 100%;
    }
  }

  &__footer {
    text-align: right;
    padding: 10px;
    background-color: #F7F8FA;
    border-top: 1px solid #e6e6e6;
  }
}
</style>
