<template>
  <create-view
    :loading="loading"
    :body-style="{ height: '100%'}">
    <flexbox
      direction="column"
      align="stretch"
      class="pool-add-container">
      <flexbox class="pool-add-header">
        <div style="flex:1;font-size:17px;color:#333;font-weight: bold;">{{ title }}</div>
        <i
          class="el-icon-close close"
          @click="hidenView" />
      </flexbox>

      <div class="pool-add-content">
        <create-sections
          v-if="baseFrom"
          title="Thông tin cơ bản">
          <flexbox
            style="margin-top: 8px;"
            direction="column"
            align="stretch">
            <el-form
              ref="ruleForm"
              :model="baseFrom"
              :rules="baseRules"
              label-position="top"
              class="pool-add-items">
              <el-form-item
                prop="poolName"
                class="pool-add-item pool-add-item__left">
                <div
                  slot="label"
                  style="display: inline-block;">
                  <div class="xr-form-label">
                    Tên nơi chứa
                  </div>
                </div>
                <el-input v-model="baseFrom.poolName" :maxlength="100" />
              </el-form-item>
              <el-form-item
                prop="adminUsers"
                class="pool-add-item pool-add-item__right">
                <div
                  slot="label"
                  style="display: inline-block;">
                  <div class="xr-form-label">
                    Người quản lý<el-tooltip
                      content="The customer high seas administrator can collect, assign, delete, export and other operations for the customer high seas customers"
                      effect="dark"
                      placement="top">
                      <i class="wk wk-help wk-help-tips"/>
                    </el-tooltip>
                  </div>
                </div>
                <xh-user-cell
                  :radio="false"
                  :value="baseFrom.adminUsers"
                  @value-change="userChange" />
              </el-form-item>
              <el-form-item
                prop="memberUsers"
                class="pool-add-item pool-add-item__left">
                <div
                  slot="label"
                  style="display: inline-block;">
                  <div class="xr-form-label">
                    Thành viên<el-tooltip
                      content="The customer’s high seas rules are effective for the customer’s high seas members (except super administrators), and the customer’s high seas members can view and receive high seas customers"
                      effect="dark"
                      placement="top">
                      <i class="wk wk-help wk-help-tips"/>
                    </el-tooltip>
                  </div>
                </div>
                <xh-struc-user-cell
                  :value="baseFrom.memberUsers"
                  @value-change="strcUserChange" />
              </el-form-item>
            </el-form>
          </flexbox>
        </create-sections>
        <create-sections
          v-if="recycleRuleData"
          title="Cài đặt quy tắc">
          <flexbox
            class="row"
            align="stretch">
            <div class="row-label">Former person in charge collection rules</div>
            <div class="row-content">
              <el-radio-group v-model="baseFrom.preOwnerSetting">
                <el-radio :label="0">không giới hạn</el-radio>
                <el-radio :label="1">giới hạn</el-radio>
              </el-radio-group>
              <div v-if="baseFrom.preOwnerSetting === 1" class="xr-input">
                <span>Former person in charge</span>
                <el-input v-model="baseFrom.preOwnerSettingDay" @keyup.native="inputLimit('preOwnerSettingDay')" />
                <span>This customer is not allowed within days</span>
              </div>
            </div>
          </flexbox>

          <flexbox
            class="row"
            align="stretch">
            <div class="row-label">Get frequency rules</div>
            <div class="row-content">
              <el-radio-group v-model="baseFrom.receiveSetting">
                <el-radio :label="0">không giới hạn</el-radio>
                <el-radio :label="1">giới hạn</el-radio>
              </el-radio-group>
              <div v-if="baseFrom.receiveSetting === 1" class="xr-input">
                <span>Maximum claim per day</span>
                <el-input v-model="baseFrom.receiveNum" @keyup.native="inputLimit('receiveNum')" />
                <span>High seas clients</span>
              </div>
            </div>
          </flexbox>

          <flexbox
            class="row"
            align="stretch">
            <div class="row-label">Quy tắc nhắc nhở</div>
            <div class="row-content">
              <el-radio-group v-model="baseFrom.remindSetting">
                <el-radio :label="0">không giới hạn</el-radio>
                <el-radio :label="1">giới hạn</el-radio>
              </el-radio-group>
              <div v-if="baseFrom.remindSetting === 1" class="xr-input">
                <span>Trước</span>
                <el-input v-model="baseFrom.remindDay" @keyup.native="inputLimit('remindDay')" />
                <span>Nhắc nhở người phụ trách</span>
              </div>
            </div>
          </flexbox>

          <flexbox
            class="row"
            align="stretch">
            <div class="row-label">Withdrawal rules</div>
            <div class="row-content">
              <el-radio-group v-model="baseFrom.putInRule">
                <el-radio :label="1">Automatic recycling</el-radio>
                <el-radio :label="0">Do not automatically recycle</el-radio>
              </el-radio-group>
            </div>
          </flexbox>

          <template v-if="baseFrom.putInRule == 1">
            <recycle-rule
              v-for="(item, index) in recycleRuleData"
              :key="index"
              :data="item"
              :level-customer="levelCustomerName"
              :true-label="index + 1"
              :is-edit="isEdit"
            />
          </template>

          <flexbox
            class="row"
            align="stretch">
            <div class="row-label">High seas field settings</div>
            <div class="row-content">
              <div class="field-set">
                <div class="field-set__name">
                  Select high seas field
                </div>
                <flexbox
                  wrap="wrap">
                  <el-checkbox
                    v-for="(item, index) in customerPoolFields"
                    :key="index"
                    v-model="item.isHidden"
                    :true-label="0"
                    :false-label="1">{{ item.name }}</el-checkbox>
                </flexbox>
              </div>
            </div>
          </flexbox>
        </create-sections>
      </div>

      <div class="handle-bar">
        <el-button
          class="handle-button"
          @click.native="hidenView">Đóng</el-button>
        <el-button
          v-debounce="saveClick"
          class="handle-button"
          type="primary">Lưu</el-button>
      </div>
    </flexbox>
  </create-view>
</template>

<script>
import {
  crmCustomerPoolQueryPoolFieldAPI,
  crmCustomerPoolSetAPI,
  crmCustomerPoolSetDetailAPI,
  crmCustomerPoolQueryLevelAPI
} from '@/api/crm/customer'

import CreateView from '@/components/CreateView'
import CreateSections from '@/components/CreateSections'
import {
  XhInput,
  XhUserCell,
  XhStrucUserCell
} from '@/components/CreateCom'
import RecycleRule from './RecycleRule'

export default {
  // 公海规则添加
  name: 'PoolAdd',
  components: {
    CreateView,
    CreateSections,
    XhInput,
    XhUserCell,
    XhStrucUserCell,
    RecycleRule
  },
  props: {
    /**
     * type save:添加、update:编辑
     */
    action: {
      type: Object,
      default: () => {
        return {
          type: 'save',
          id: '',
          data: {} // 编辑所需信息
        }
      }
    }
  },
  data() {
    const validateMemberUsers = (rule, value, callback) => {
      if (value && ((value.users && value.users.length) || (value.strucs && value.strucs.length))) {
        callback()
      } else {
        callback(new Error('Please select a member of the high seas'))
      }
    }

    return {
      loading: false,
      baseFrom: null,
      baseRules: {
        poolName: [
          { required: true, message: 'Please enter the name of the high seas', trigger: 'blur' }
        ],
        adminUsers: [
          { required: true, message: 'Please select high seas administrator', trigger: ['blur', 'change'] }
        ],
        memberUsers: [
          { required: true, validator: validateMemberUsers, trigger: ['blur', 'change'] }
        ]
      },
      recycleRuleData: null,
      levelCustomerName: [], // 客户级别数据源
      customerPoolFields: [],
      requestFields: {
        preOwnerSettingDay: 'The former person in charge restricts the number of days to receive must be greater than 0',
        receiveNum: 'The number of receiving frequency limits must be greater than 0',
        remindDay: 'Reminder rule days must be greater than 0'
      }
    }
  },
  computed: {
    title() {
      if (this.isEdit) {
        return 'Edit the high seas'
      }

      return 'New high seas'
    },

    isEdit() {
      return this.action && this.action.type == 'update'
    }
  },
  watch: {},
  created() {
    if (this.isEdit) {
      this.getDetail()
    } else {
      this.getCreateInfo()
    }

    this.getLevelCustomerData()
  },

  beforeDestroy() {},
  methods: {
    getLevelCustomerData() {
      crmCustomerPoolQueryLevelAPI().then(res => {
        this.levelCustomerName = res.data || []
      }).catch(() => {})
    },

    /**
     * 编辑操作
     */
    getDetail() {
      this.loading = true
      crmCustomerPoolSetDetailAPI({
        poolId: this.action.id
      }).then(res => {
        this.getEditInfo(res.data)
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    getEditInfo(data) {
      this.baseFrom = {
        poolName: data.poolName,
        adminUsers: data.adminUser,
        memberUsers: {
          users: data.memberUser,
          strucs: data.memberDept
        },
        preOwnerSetting: data.preOwnerSetting, // 前负责人领取规则 0不限制 1限制
        preOwnerSettingDay: data.preOwnerSettingDay,
        receiveSetting: data.receiveSetting, // 0 不启用 1 启用
        remindSetting: data.remindSetting, // 0 不提醒 1 提醒
        receiveNum: data.receiveNum, // 领取频率规则
        remindDay: data.remindDay, // 提醒规则天数
        putInRule: data.putInRule // 收回规则 0不自动收回 1自动收回
      }

      this.recycleRuleData = this.getEditRule(data.rule)
      this.getCustomerPoolFields(data.field || []).then(editFields => {
        this.customerPoolFields = editFields
      })
    },

    getEditRule(detailRule) {
      const baseRule = [
        {
          type: '',
          dealHandle: 1,
          businessHandle: 1,
          customerLevelSetting: 1,
          level: []
        },
        {
          type: '',
          dealHandle: 1,
          businessHandle: 1,
          customerLevelSetting: 1,
          level: []
        },
        {
          type: '',
          dealHandle: 1,
          businessHandle: 1,
          customerLevelSetting: 1,
          level: []
        }
      ]

      if (detailRule) {
        for (let index = 0; index < detailRule.length; index++) {
          const element = detailRule[index]
          element.level = element.levelSetting
          baseRule.splice(element.type - 1, 1, element)
        }
      }

      return baseRule
    },

    /**
     * 新建操作
     */
    getCreateInfo() {
      this.baseFrom = {
        poolName: '',
        adminUsers: [],
        memberUsers: {
          users: [],
          strucs: []
        },
        preOwnerSetting: 0, // 前负责人领取规则 0不限制 1限制
        preOwnerSettingDay: '',
        receiveSetting: 0, // 0 不启用 1 启用
        receiveNum: '', // 领取频率规则
        remindSetting: 0, // 0 不提醒 1 提醒
        remindDay: '', // 提醒规则天数
        putInRule: 1 // 收回规则 0不自动收回 1自动收回
      }

      this.recycleRuleData = this.getEditRule()

      this.getCustomerPoolFields().then(createFields => {
        this.customerPoolFields = createFields
      })
    },


    /**
     * 获取公海默认字段
     */
    getCustomerPoolFields(allFields) {
      return new Promise((resolve, reject) => {
        crmCustomerPoolQueryPoolFieldAPI().then(res => {
          const list = res.data || []
          const baseField = list.map(item => {
            item.isHidden = item.isHidden = allFields ? 1 : 0
            return item
          })
          if (allFields) {
            resolve(this.getEditFields(baseField, allFields))
          } else {
            resolve(baseField)
          }
        }).catch(() => {
          reject()
        })
      })
    },

    /**
     * 获取编辑展示字段
     */
    getEditFields(list, allFields) {
      for (let index = 0; index < list.length; index++) {
        const item = list[index]

        for (let editIndex = 0; editIndex < allFields.length; editIndex++) {
          const editItem = allFields[editIndex]
          // fieldId 存在 匹配fieldId 不存在 匹配 fieldName
          if (item.fieldId) {
            if (item.fieldId === editItem.fieldId) {
              item.settingId = editItem.settingId
              item.isHidden = editItem.isHidden
            }
          } else {
            if (item.fieldName === editItem.fieldName) {
              item.settingId = editItem.settingId
              item.isHidden = editItem.isHidden
            }
          }
        }
      }

      return list
    },


    /**
     * 员工选择
     */
    userChange(data) {
      this.baseFrom.adminUsers = data.value
      this.$refs.ruleForm.validateField('adminUsers')
    },

    strcUserChange(data) {
      this.baseFrom.memberUsers = data.value
      this.$refs.ruleForm.validateField('memberUsers')
    },

    /**
     * 保存数据
     */
    saveClick() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          const params = this.getRequestParams()
          if (params) {
            this.uploadPoolSet(params)
          }
        } else {
          // 提示第一个error
          if (this.$refs.ruleForm.fields) {
            for (
              let index = 0;
              index < this.$refs.ruleForm.fields.length;
              index++
            ) {
              const ruleField = this.$refs.ruleForm.fields[index]
              if (ruleField.validateState == 'error') {
                this.$message.error(ruleField.validateMessage)
                break
              }
            }
          }
          return false
        }
      })
    },

    /**
     * 提交请求
     */
    uploadPoolSet(params) {
      if (this.isEdit) {
        params.poolId = this.action.id
      }
      this.loading = true
      crmCustomerPoolSetAPI(params).then(res => {
        this.$emit('save')
        this.$message.success(this.isEdit ? 'Chỉnh sửa thành công' : 'Đã tạo thành công')
        this.loading = false
        this.hidenView()
      }).catch(() => {
        this.loading = false
      })
    },

    /**
     * 必填字段验证
     */
    requestFieldsVerify(key) {
      if (key == 'preOwnerSettingDay' && this.baseFrom.preOwnerSetting == 1 && (!this.baseFrom[key] || this.baseFrom[key] <= 0)) {
        return false
      } else if (key == 'receiveNum' && this.baseFrom.receiveSetting == 1 && (!this.baseFrom[key] || this.baseFrom[key] <= 0)) {
        return false
      } else if (key == 'remindDay' && this.baseFrom.remindSetting == 1 && (!this.baseFrom[key] || this.baseFrom[key] <= 0)) {
        return false
      }

      return true
    },

    /**
     * 获取请求参数
     */
    getRequestParams() {
      const params = {}

      for (const key in this.baseFrom) {
        if (!this.requestFieldsVerify(key)) {
          this.$message.error(this.requestFields[key])
          return
        } else {
          if (key == 'adminUsers') {
            const adminUsers = this.baseFrom.adminUsers || []
            params.adminUserId = adminUsers.map(item => {
              return item.userId
            }).join(',')
          } else if (key == 'memberUsers') {
            const memberUserObj = this.baseFrom.memberUsers || {}
            const adminUsers = memberUserObj.users || []
            const adminStrucs = memberUserObj.strucs || []
            params.memberUserId = adminUsers.map(item => {
              return item.userId
            }).join(',')
            params.memberDeptId = adminStrucs.map(item => {
              return item.id
            }).join(',')
          } else {
            params[key] = this.baseFrom[key]
          }
        }
      }

      // 收回规则 1 自动收回
      if (this.baseFrom.putInRule == 1) {
        const ruleVerify = this.recycleRuleData.filter(item => {
          return item.type
        })

        if (!ruleVerify.length) {
          this.$message.error('Please check the automatic recycling rules')
          return
        }

        const rule = []
        for (let index = 0; index < this.recycleRuleData.length; index++) {
          let ruleItem = this.recycleRuleData[index]
          ruleItem = { ...ruleItem }
          if (ruleItem.type) {
            let rulePass = false // 只要有一个填写 就通过
            const newLevel = []
            for (let levelIndex = 0; levelIndex < ruleItem.level.length; levelIndex++) {
              const levelItem = ruleItem.level[levelIndex]
              if (levelItem.limitDay && levelItem.limitDay > 0) {
                rulePass = true
                newLevel.push(levelItem)
              }
            }
            ruleItem.level = newLevel
            rule.push(ruleItem)

            if (!rulePass) {
              this.$message.error('The withdrawal rule must be greater than 0 if the number of days exceeds')
              return
            }
          }
        }

        params.rule = rule
      } else {
        params.rule = []
      }

      const showFields = this.customerPoolFields.filter(item => {
        return item.isHidden == 0
      })

      if (showFields.length < 2) {
        this.$message.error('At least two high sea fields must be displayed')
        return
      }
      // 公海字段
      params.field = this.customerPoolFields

      return params
    },

    /**
     * 关闭页面
     */
    hidenView() {
      this.$emit('hiden-view')
    },

    /**
     * 阻挡输入
     */
    inputLimit(key) {
      this.baseFrom[key] = this.baseFrom[key].replace(/[^0-9]/g, '')
    }
  }
}
</script>

<style lang="scss" scoped>
.pool-add-container {
  position: relative;
  height: 100%;
}

.pool-add-content {
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  flex: 1;
}

.pool-add-header {
  height: 40px;
  margin-bottom: 20px;
  padding: 0 10px;
  flex-shrink: 0;
  .close {
    display: block;
    font-size: 24px;
    color: #909399;
    margin-right: -10px;
    padding: 10px;
    cursor: pointer;
  }
  .close:hover {
    color: $xr-color-primary;
  }
}

.el-form-item /deep/ .el-form-item__label {
  line-height: normal;
  font-size: 13px;
  color: #333333;
  position: relative;
  padding-left: 8px;
  padding-bottom: 0;
}

.el-form /deep/ .el-form-item {
  margin-bottom: 0px;
}

.el-form /deep/ .el-form-item.is-required .el-form-item__label:before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
  position: absolute;
  left: 0;
  top: 5px;
}

.pool-add-items {
  display: flex;
  flex-wrap: wrap;
  padding: 0 10px 15px;
}

.pool-add-item {
  flex: 0 0 50%;
  flex-shrink: 0;
  // overflow: hidden;
  padding-bottom: 10px;
  &__left {
    padding-right: 25px;
  }
  &__right {
    padding-left: 25px;
  }
}

.xr-form-label {
  margin: 5px 0;
  font-size: 12px;
  word-wrap: break-word;
  word-break: break-all;
  .wk-help {
    margin-left: 5px;
  }
}

// 行布局
.row {
  padding: 8px 15px 0;
  font-size: 13px;
  color: #333;
  &-label {
    width: 120px;
    margin-top: 10px;
    flex-shrink: 0;
  }

  &-content {
    flex: 1;
    margin-left: 20px;
    .el-radio-group {
      margin: 8px 0;
    }

    .xr-input {
      margin-bottom: 8px;
      .el-input {
        width: 80px;
        margin: 0 8px;
      }
    }
  }
}

.recycle-rule {
  padding-left: 155px;
  margin-top: 20px;
}

// 字段设置
.field-set {
  margin-top: 10px;
  margin-bottom: 40px;
  padding: 15px;
  border: 1px solid $xr-border-color-base;
  border-radius: $xr-border-radius-base;

  &__name {
    margin-bottom: 8px;
  }

  .el-checkbox {
    flex: 0 0 30%;
    margin-right: 8px;
    margin-bottom: 8px;
  }
}

.handle-bar {
  position: relative;
  .handle-button {
    float: right;
    margin-top: 5px;
    margin-right: 20px;
  }
}
</style>
