<template>
  <div class="condition-node">
    <div class="condition-node-wrap">
      <div :class="{'is-error': node.isError}" class="condition-wrap" @click="click">
        <div class="header">
          <el-input
            v-if="isEdit"
            ref="wkFlowInput"
            v-model="node.conditionName"
            type="text"
            size="mini"
            maxlength="20"
            @blur="nameInputBlur" />
          <span
            v-else
            class="title"
            @click.stop="titleEditClick">{{ node.conditionName }}</span>
          <span
            class="priority">Điều kiện tiên quyết {{ index + 1 }}</span>
          <i
            class="el-icon-close close"
            @click.stop="deleteClick" />
        </div>
        <div class="content">
          <template v-if="node.conditionDataList && node.conditionDataList.length > 0">
            {{ getConditonContent() }}
          </template>
          <template v-else>
            Không có điều kiện
          </template>
        </div>
      </div>
      <add-node-btn @command="handleCommand" />
    </div>
  </div>
</template>

<script>
import AddNodeBtn from './AddNodeBtn'

import { examineModel, conditionListModel } from './flowModel'
import { objDeepCopy } from '@/utils'
import {
  selectOptions,
  checkboxOptions,
  numberOptions,
  numberValueOptions,
  getOptionObj
} from './conditioModel'
import { isEmpty } from '@/utils/types'

export default {
  // 条件
  name: 'WkConditionNode',

  components: {
    AddNodeBtn
  },

  props: {
    index: Number,
    parent: Array,
    conditionParent: Array,
    node: {
      type: Object,
      default() {
        return {}
      }
    }
  },

  data() {
    return {
      selectOptionsObj: getOptionObj(selectOptions),
      checkboxOptionsObj: getOptionObj(checkboxOptions),
      numberOptionsObj: getOptionObj(numberOptions),
      numberValueOptionsObj: getOptionObj(numberValueOptions),
      isEdit: false
    }
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {},

  beforeDestroy() {},

  methods: {
    /**
     * 输入失去焦点
     */
    nameInputBlur() {
      this.isEdit = false
      if (this.node.conditionName === '') {
        this.node.conditionName = 'Điều kiện'
      }
    },

    /**
     * 编辑名称
     */
    titleEditClick() {
      if (!this.disabled) {
        this.isEdit = true
        this.$nextTick(() => {
          this.$refs.wkFlowInput.focus()
        })
      }
    },

    /**
     * 删除
     */
    deleteClick() {
      this.$emit('delete')
    },

    /**
     * 添加
     */
    handleCommand(command) {
      if (command === 'approve') {
        this.parent.splice(0, 0, objDeepCopy(examineModel))
      } else if (command === 'condition') {
        this.parent.splice(0, 0, objDeepCopy(conditionListModel))
      }
    },

    /**
     * 点击
     */
    click() {
      this.$emit('node-click', this.$props)
    },

    /**
     * 获得条件内容
     */
    getConditonContent() {
      const conditionDataList = this.node.conditionDataList

      return conditionDataList.map(item => {
        if (item.type === 3) {
          let values = item.values
          if (item.setting) {
            const showValues = []
            item.setting.forEach(setting => {
              if (setting.value != undefined && item.values.includes(setting.value)) {
                showValues.push(setting.label)
              }
            })
            if (showValues.length > 0) {
              values = showValues
            }
          }
          return `${item.name} ${this.selectOptionsObj[item.conditionType]} ${values.join(' hoặc ')}`
        } else if (item.type === 9) {
          return `${item.name} ${this.checkboxOptionsObj[item.conditionType]} ${item.values.join('、')}`
        } else {
          if (item.conditionType === 6) {
            return `${isEmpty(item.leftValue) ? '' : item.leftValue} ${this.numberValueOptionsObj[item.leftCondition]} ${item.name} ${this.numberValueOptionsObj[item.rightCondition]} ${isEmpty(item.rightValue) ? '' : item.rightValue}`
          } else if (item.conditionType === 8) {
            return `${item.name} thuộc ${item.deptList.map(item => item.name).join(' hoặc ')}${item.deptList.length > 0 && item.userList.length > 0 ? ' hoặc ' : ''}${item.userList.map(item => item.realname).join(' hoặc ')}${item.userList.length > 0 && item.roleList.length > 0 ? ' hoặc ' : ''}${item.roleList.map(item => item.roleName).join(' hoặc ')}`
          } else {
            return `${item.name} ${this.numberOptionsObj[item.conditionType]} ${item.values}`
          }
        }
      }).join(' và ')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
