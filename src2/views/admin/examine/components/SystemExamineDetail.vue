<template>
  <slide-view
    :listener-ids="['manager-main-container']"
    :no-listener-class="['el-table__body']"
    :append-to-body="true"
    :body-style="{padding: '10px 30px', height: '100%'}"
    class="d-view"
    @close="hideView">
    <flexbox
      orient="vertical"
      style="height: 100%;">
      <div class="header">
        <flexbox class="detail-header">
          <div class="header-name">{{ showData.name }}<i
            class="el-icon-delete delete"
            @click="deleteClick"/></div>
        </flexbox>
        <div class="detail-header-des">
          <div class="status">Trạng thái：{{ showData.status == 0 ? 'Hủy kích hoạt' : 'Kích hoạt' }}</div>
          <div class="status-handle">
            Thay đổi
            <el-switch
              v-model="examineStatus"
              @change="examineStatusChange"/>
          </div>
        </div>
      </div>
      <div class="detail-body">
        <create-sections
          title="Thông tin cơ bản"
          class="create-sections">
          <div class="create-sections-content">
            <div class="dialog-content">
              <flexbox class="content-items">
                <div class="content-items-name">Tên phê duyệt</div>
                <div class="content-items-value">{{ showData.name }}</div>
              </flexbox>
              <flexbox class="content-items">
                <div class="content-items-name">Người phê duyệt</div>
                <div class="content-items-value">{{ showData|formatedScopeInfo }}</div>
              </flexbox>
              <flexbox class="content-items">
                <div class="content-items-name">Ghi chú</div>
                <div class="content-items-value">{{ showData.remarks }}</div>
              </flexbox>
            </div>
          </div>
        </create-sections>
        <create-sections
          title="Quá trình"
          class="create-sections">
          <div
            v-if="showData.examineType == 1"
            class="create-sections-content">
            <flexbox
              v-for="(item, index) in showData.stepList"
              :key="index"
              align="stretch"
              class="examine-flow">
              <div class="examine-flow-header">
                <div class="mark-circle"/>
                <div
                  v-if="index != 0"
                  class="mark-top-line"/>
                <div
                  v-if="index < showData.stepList.length - 1"
                  class="mark-bottom-line"/>
              </div>
              <div class="examine-flow-body">
                <div class="body-header"><span class="body-header-name">{{ index + 1|toRowName }}</span><span class="body-header-des">（{{ item|toRowNameDes }}）</span></div>
                <flexbox
                  v-if="item.userList.length > 0"
                  class="examine-users">
                  <div
                    v-for="(userItem, userIndex) in item.userList"
                    :key="userIndex"
                    class="examine-users-item">
                    <xr-avatar
                      :name="userItem.realname"
                      :size="40"
                      :src="userItem.img" />
                    <div class="name">{{ userItem.realname }}</div>
                  </div>
                </flexbox>
              </div>
            </flexbox>
          </div>
          <div
            v-else
            class="create-sections-content">Người phê duyệt được ủy quyền</div>
        </create-sections>
      </div>
    </flexbox>
  </slide-view>
</template>

<script>
import SlideView from '@/components/SlideView'
import CreateSections from '@/components/CreateSections'
import Nzhcn from 'nzh/cn'
import {
  crmExamineUpdateStatusAPI
} from '@/api/examine'

export default {
  /** 系统审批详情 */
  name: 'SystemExamineDetail',
  components: {
    SlideView,
    CreateSections
  },
  filters: {
    formatedScopeInfo(data) {
      const structures = data['deptList'] || []
      let strName = structures
        .map(item => item.name)
        .join('、')

      const users = data['userList'] || []
      const userName = users
        .map(item => item.realname)
        .join('、')

      if (strName && userName) {
        strName += '、'
      }
      const name = strName + userName
      return name || 'Toàn công ty'
    },
    // 标题
    toRowName: function(value) {
      return 'Trang trước' + Nzhcn.encodeS(value) + 'Trang sau'
    },
    // 标题描述
    toRowNameDes: function(data) {
      if (data.stepType == 1) {
        return 'Người quản lý'
      } else if (data.stepType == 2) {
        return data.userList.length + ' người duyệt(một trong số ký duyệt)'
      } else if (data.stepType == 3) {
        return data.userList.length + ' người duyệt(tất cả ký duyệt)'
      } else if (data.stepType == 4) {
        return 'Cấp trên của người quản lý'
      }
      return ''
    }
  },
  props: {
    // 详情信息
    data: Object
  },
  data() {
    return {
      showData: {},
      examineStatus: false
    }
  },
  computed: {},
  watch: {
    data: function(value) {
      this.getShowData()
    }
  },
  mounted() {
    this.getShowData()
  },
  methods: {
    deleteClick() {
      // 启用停用
      this.$confirm('Xác nhận xóa?', 'Thông báo', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(() => {
          crmExamineUpdateStatusAPI({
            examineId: this.data['examineId'],
            status: 2 //  1 启用 0 禁用 2 删除
          })
            .then(res => {
              this.$emit('refresh')
              this.hideView()
              this.$message({
                type: 'success',
                message: 'Thành công'
              })
            })
            .catch(() => {})
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Không thành công'
          })
        })
    },
    getShowData() {
      this.showData = Object.assign({}, this.data)
      this.examineStatus = this.showData.status != 0
    },
    // 切换审批状态
    examineStatusChange(status) {
      this.showData.status = status ? 1 : 0
      // 启用停用
      this.$confirm(
        'Xác nhận ' + (status ? 'kích hoạt' : 'hủy kích hoạt') + 'quy trình?',
        'Thông báo',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
        .then(() => {
          crmExamineUpdateStatusAPI({
            examineId: this.data['examineId'],
            status: status ? 1 : 0
          })
            .then(res => {
              this.$emit('refresh')
              this.$message({
                type: 'success',
                message: 'Thành công'
              })
            })
            .catch(() => {
              this.cancelStatusChange()
            })
        })
        .catch(() => {
          this.cancelStatusChange()
          this.$message({
            type: 'info',
            message: 'Không thành công'
          })
        })
    },
    cancelStatusChange() {
      this.examineStatus = !this.examineStatus
      this.showData.status = this.examineStatus ? 1 : 0
    },
    //* * 点击关闭按钮隐藏视图 */
    hideView() {
      this.$emit('hide-view')
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  width: 100%;
  margin-bottom: 30px;
}
.detail-header {
  position: relative;
  min-height: 60px;
  .header-name {
    font-size: 14px;
    color: #333333;
    flex: 1;
    .delete {
      color: #2362FB;
      padding: 0 10px;
      font-size: 13px;
      cursor: pointer;
    }
  }
  .header-close {
    display: block;
    width: 30px;
    height: 30px;
    margin-left: 20px;
    padding: 5px;
    cursor: pointer;
  }
}

.detail-header-des {
  color: #999999;
  font-size: 12px;
  .status {
    float: left;
  }
  .status-handle {
    float: right;
  }
}

.detail-body {
  flex: 1;
  overflow-y: auto;
  width: 100%;

  .create-sections {
    padding: 5px 0;
    /deep/ .section-header {
      padding: 5px 0;
    }
  }

  .create-sections-content {
    padding: 0;
  }

  .dialog-content {
    margin-top: 10px;
    .content-items {
      padding: 10px 0;
      .content-items-name {
        width: 132px;
        color: #777;
        flex-shrink: 0;
      }
      .content-items-value {
        flex: 1;
      }
    }
  }
}
// 审批流
.examine-flow {
  .examine-flow-header {
    position: relative;
    .mark-circle {
      width: 8px;
      height: 8px;
      border-radius: $xr-border-radius-base;
      background-color: #ee7228;
      margin: 11px 20px 0 5px;
    }
    .mark-top-line {
      width: 1px;
      background-color: #e6e6e6;
      position: absolute;
      top: 0;
      left: 9px;
      height: 11px;
    }
    .mark-bottom-line {
      width: 1px;
      background-color: #e6e6e6;
      position: absolute;
      top: 19px;
      left: 9px;
      bottom: 0;
    }
  }

  .examine-flow-body {
    .body-header {
      padding: 8px 0;
      font-size: 13px;
      .body-header-name {
        color: #333333;
      }
      .body-header-des {
        color: #777777;
      }
    }
  }
}

// 人信息
.examine-users {
  text-align: center;
  .examine-users-item {
    padding: 10px 20px 10px 0;
    .name {
      color: #333333;
      font-size: 12px;
      padding: 2px 0;
      width: 60px;
      overflow: hidden;
    }
  }
}
// 授权审批信息

.d-view {
  position: fixed;
  width: 500px;
  top: 60px;
  bottom: 0px;
  right: 0px;

  /deep/ .el-card__body {
    background-color: white;
  }
}
</style>

