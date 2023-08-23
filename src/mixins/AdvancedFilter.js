export default {
  methods: {
    /**
     * 根据类型获取条件
     * @param {*} formType
     */
    getAdvancedFilterOptions(formType) {
      if (
        formType == 'checkStatus' ||
        formType == 'dealStatus'
      ) {
        return [
          { value: 'is', label: 'bằng', disabled: false, type: 1 },
          { value: 'isNot', label: 'không bằng', disabled: false, type: 2 }
        ]
      } else if (
        formType == 'user' ||
        formType == 'single_user' ||
        formType == 'structure'
      ) {
        return [
          { value: 'contains', label: 'chứa', disabled: false, type: 3 },
          { value: 'notContains', label: 'không chứa', disabled: false, type: 4 }
        ]
      } else if (
        formType == 'select'
      ) {
        return [
          { value: 'in', label: 'bằng', disabled: false, type: 1 },
          { value: 'isNot', label: 'không bằng', disabled: false, type: 2 }
        ]
      } else if (
        formType == 'checkbox'
      ) {
        return [
          { value: 'is', label: 'là', disabled: false, type: 1 },
          { value: 'contains', label: 'có', disabled: false, type: 3 }
        ]
      } else if (
        formType == 'module' ||
        formType == 'text' ||
        formType == 'textarea'
      ) {
        return [
          { value: 'is', label: 'bằng', disabled: false, type: 1 },
          { value: 'isNot', label: 'không bằng', disabled: false, type: 2 },
          { value: 'contains', label: 'chứa', disabled: false, type: 3 },
          { value: 'notContains', label: 'không chứa', disabled: false, type: 4 }
        ]
      } else if (formType == 'floatnumber' || formType == 'number') {
        return [
          { value: 'is', label: 'bằng', disabled: false, type: 1 },
          { value: 'isNot', label: 'không bằng', disabled: false, type: 2 },
          { value: 'contains', label: 'chứa', disabled: false, type: 3 },
          { value: 'notContains', label: 'không chứa', disabled: false, type: 4 },
          { value: 'isNull', label: 'rỗng', disabled: false, type: 5 },
          { value: 'isNotNull', label: 'không rỗng', disabled: false, type: 6 },
          { value: 'gt', label: 'lớn hơn', disabled: false, type: 7 },
          { value: 'egt', label: 'lớn hơn bằng', disabled: false, type: 8 },
          { value: 'lt', label: 'nhỏ hơn', disabled: false, type: 9 },
          { value: 'elt', label: 'nhỏ hơn bằng', disabled: false, type: 10 }
        ]
      } else if (formType == 'category') {
        return [
          { value: 'is', label: 'bằng', disabled: false, type: 1 },
          { value: 'isnot', label: 'không bằng', disabled: false, type: 2 },
          { value: 'contains', label: 'chứa', disabled: false, type: 3 },
          { value: 'not_contain', label: 'không chứa', disabled: false, type: 4 }
        ]
      } else if (formType == 'mobile' || formType == 'email') {
        return [
          { value: 'is', label: 'bằng', disabled: false, type: 1 },
          { value: 'isNot', label: 'không bằng', disabled: false, type: 2 },
          { value: 'contains', label: 'chứa', disabled: false, type: 3 },
          { value: 'notContains', label: 'không chứa', disabled: false, type: 4 },
          { value: 'startWith', label: 'bắt đầu với', disabled: false, type: 8 },
          { value: 'endWith', label: 'kết thúc với', disabled: false, type: 10 },
          { value: 'isNull', label: 'rỗng', disabled: false, type: 5 },
          { value: 'isNotNull', label: 'không rỗng', disabled: false, type: 6 }
        ]
      } else {
        return [
          { value: 'is', label: 'bằng', disabled: false, type: 1 },
          { value: 'isNot', label: 'không bằng', disabled: false, type: 2 },
          { value: 'contains', label: 'chứa', disabled: false, type: 3 },
          { value: 'notContains', label: 'không chứa', disabled: false, type: 4 },
          { value: 'startWith', label: 'bắt đầu với', disabled: false, type: 8 },
          { value: 'endWith', label: 'kết thúc với', disabled: false, type: 10 },
          { value: 'isNull', label: 'rỗng', disabled: false, type: 5 },
          { value: 'isNotNull', label: 'không rỗng', disabled: false, type: 6 },
          { value: 'gt', label: 'lớn hơn', disabled: false, type: 7 },
          { value: 'egt', label: 'lớn hơn bằng', disabled: false, type: 8 },
          { value: 'lt', label: 'nhỏ hơn', disabled: false, type: 9 },
          { value: 'elt', label: 'nhỏ hơn bằng', disabled: false, type: 10 }
        ]
      }
    }
  }
}
