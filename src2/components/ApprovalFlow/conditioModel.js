export const selectOptions = [{
  label: 'Thuộc về',
  value: 7
}]

export const checkboxOptions = [{
  label: 'Chính xác bằng',
  value: 11
}, {
  label: 'Chứa bất kỳ',
  value: 7
}]

export const numberOptions = [{
  label: 'Ít hơn',
  value: 3
}, {
  label: 'Nhiều hơn',
  value: 2
}, {
  label: 'Ít hơn hoặc bằng',
  value: 5
}, {
  label: 'Bằng',
  value: 1
}, {
  label: 'Lớn hơn hoặc bằng',
  value: 4
}, {
  label: 'Giữa (giữa hai số)',
  value: 6
}]

export const numberValueOptions = [{
  label: '<',
  value: 1
}, {
  label: '≤',
  value: 2
}]

export function getOptionObj(list) {
  const obj = {}
  list.forEach(item => {
    obj[item.value] = item.label
  })
  return obj
}
// type 连接条件 1 等于 2 大于 3 小于 4 大于等于 5 小于等于 6 两者之间 7 包含 8 员工/部门/角色 11完全等于
export function getSendObj(checked) {
  return {
    name: 'Người tạo',
    conditionType: 8,
    // 用于展示
    userList: [],
    deptList: [],
    roleList: [],
    values: {
      userList: [],
      deptList: [],
      roleList: []
    },
    checked
  }
}
