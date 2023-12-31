class Field {
  constructor(obj) {
    this.fieldType = 0 // 新增字段默认加入0 1是系统字段 2 客户行业 级别 来源 等 3 特殊
    this.fieldId = obj.fieldId || '' //  字段id  1
    this.name = obj.name || '' //  标识名  1
    this.formType = obj.formType || '' // 字段类型  1
    this.isUnique = obj.isUnique || false // 是否唯一
    this.isNull = obj.isNull || false // 是否必填
    this.isHidden = obj.isHidden || false // 是否隐藏字段
    this.inputTips = obj.inputTips || '' // 输入提示
    if (this.formType === 'textarea') {
      this.maxLength = obj.maxLength || 1000 // textarea 多行文本有最大数量
    }

    if (this.formType === 'checkbox') {
      this.defaultValue = obj.defaultValue || []
    } else {
      this.defaultValue = obj.defaultValue || ''
    }

    // 表格的特殊处理
    if (this.formType === 'form') {
      this.formValue = obj.formValue || [] // 内部布局
    }

    this.setting = obj.setting || [] // 单选选项
    this.showSetting = obj.showSetting || [] // 单选选项
    this.componentName = '' // 组件名字
    this.isDeleted = 0 // 是删除标示这个字段是无效的 1是无效的
  }

  // 校验数据
  check() {
    if (this.name === '') {
      return 'Tên trường không được để trống'
    }
    return ''
  }
}

export default Field
