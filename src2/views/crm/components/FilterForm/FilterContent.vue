<template>
  <div class="wrapper">
    <ul class="list">
      <li
        v-for="(item, index) in showObj.form"
        :key="index"
        class="list-item">
        <span v-if="item.formType == 'date'">{{ item.name +'&nbsp;“' + item.value[0] + '-' + item.value[1] + '”' }}</span>
        <span v-else-if="item.formType === 'datetime'">{{ item.name +'&nbsp;“' + item.value[0] + '-' + item.value[1] + '”' }}</span>
        <span v-else-if="item.formType === 'business_type'">{{ item.name +'&nbsp;“' + getTypesName(item) + getStatusName(item) + '”' }}</span>
        <span v-else-if="item.formType === 'map_address'">{{ `${item.name} ${item.address.state} ${item.address.city} ${item.address.area}` }}</span>
        <span v-else-if="item.formType === 'checkStatus'">{{ item.name +'&nbsp;“' + optionsNames[item.condition]+ '”'+'&nbsp;'+ getNameValue(item) }}</span>
        <span v-else-if="item.formType === 'dealStatus'">{{ item.name +'&nbsp;“' + optionsNames[item.condition]+ '”'+'&nbsp;'+ getDealStatus(item.value) }}</span>
        <span v-else-if="item.formType === 'user' || item.formType === 'single_user'">{{ item.name +'&nbsp;' + optionsNames[item.condition] + '“' + item.value[0].realname + '”' }}</span>
        <span v-else-if="item.formType === 'structure'">{{ item.name +'&nbsp;' + optionsNames[item.condition] + '“' + item.value[0].name + '”' }}</span>
        <span v-else-if="item.formType === 'category' && item.value.length > 0">{{ item.name +'&nbsp;“' + item.valueContent + '”' }}</span>
        <span v-else-if="item.formType === 'select' && getSettingValueType(item.setting) != 'string'">{{ item.name +'&nbsp;“' + getNameValue(item) + '”' }}</span>
        <span v-else>{{ item.name + '&nbsp;' + optionsNames[item.condition] + '“' + item.value + '”' }}</span>
        <i
          class="el-icon-close icon"
          @click="handleDelete(item, index)"/>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'FilterContent',
  props: {
    obj: {
      type: Object,
      required: true,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      // 获取条件名称
      optionsNames: {
        is: 'bằng',
        in: 'trong',
        isNot: 'không bằng',
        contains: 'chứa',
        notContains: 'không chứa',
        startWith: 'bắt đầu với',
        endWith: 'kết thúc với',
        isNull: 'rỗng',
        isNotNull: 'không rỗng',
        eq: 'bằng',
        neq: 'không bằng',
        gt: 'lớn hơn',
        egt: 'lớn hơn bằng',
        lt: 'nhỏ hơn',
        elt: 'nhỏ hơn bằng'
      },
      // 展示信息
      showObj: {}
    }
  },
  computed: {},
  watch: {
    obj: function(val) {
      this.showObj = val
    }
  },
  mounted() {
    this.showObj = this.obj
  },
  methods: {
    /**
     * 删除高级筛选条件
     * @param index
     */
    handleDelete(item, index) {
      this.showObj.obj.splice(index, 1)
      this.showObj.form.splice(index, 1)
      this.$emit('delete', { item: item, index: index, obj: this.showObj })
    },

    /**
     * 商机组展示名称
     */
    getTypesName(data) {
      if (data.typeId) {
        const obj = data.typeOption.find(item => {
          return item.typeId === data.typeId
        })
        return obj.name || ''
      }
      return ''
    },

    /**
     * 获取name value 对象展示值
     */
    getNameValue(data) {
      const obj = data.setting.find(item => item.value === data.value)
      return obj ? obj.name : ''
    },

    /**
     * 商机阶段展示名称
     */
    getStatusName(data) {
      if (data.statusId) {
        const obj = data.statusOption.find(item => {
          return item.statusId === data.statusId
        })
        if (obj.name) {
          return '-' + obj.name
        }
        return ''
      }
      return ''
    },

    /**
     * 成交状态名称
     */
    getDealStatus(type) {
      if (type == 0) {
        return 'Chưa bán'
      } else if (type == 1) {
        return 'Chốt đơn'
      }
      return ''
    },

    /**
     * 获取setting数据类型
     */
    getSettingValueType(setting) {
      if (setting && setting.length > 0) {
        const value = setting[0]
        return typeof value
      }
      return []
    }
  }
}
</script>

<style scoped lang="scss">
@mixin left() {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
@mixin center() {
  display: flex;
  justify-content: center;
  align-items: center;
}

.wrapper {
  width: 100%;
  min-height: 50px;
  background: white;
  border-top: 1px solid #e1e1e1;
  font-size: 13px;
  overflow-x: scroll;
  color: #aaa;
  @include left;
  .list {
    width: 100%;
    padding: 0 20px;
    margin-bottom: 10px;
    flex-shrink: 0;
    @include left;
    .list-item {
      height: 30px;
      padding: 0 10px;
      margin: 10px 15px 0 0;
      border: 1px solid #e1e1e1;
      border-radius: 3px;
      flex-shrink: 0;
      @include center;
      .icon {
        margin-left: 20px;
        cursor: pointer;
      }
    }
  }
}
</style>
