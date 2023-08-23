<template>
  <flexbox
    class="main"
    direction="column"
    align="stretch">
    <xr-header
      icon-class="wk wk-all"
      icon-color="#FD964A"
      label="Quản lý ứng dụng" />
    <div
      v-loading="loading"
      class="body">
      <div
        v-for="(bigItem, bigIndex) in allList"
        :key="bigIndex"
        class="section">
        <flexbox class="section-header">
          {{ bigItem.name }}
        </flexbox>
        <flexbox
          wrap="wrap"
          class="section-body">
          <flexbox
            v-for="(item, index) in bigItem.sublist"
            :key="index"
            class="section-item">
            <img
              :src="getModuleIcon(item.status, item.module)"
              class="item-icon" >
            <span class="item-name">{{ item.name }}</span>
            <el-dropdown
              v-if="item.canEdit && configSetAuth"
              class="more-menu"
              @command="handleMoreCommand($event, item)">
              <i class="el-icon-more"/>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="item.status ? 'disable' : 'enable'">{{ item.status ? 'Tắt' : 'Kích hoạt' }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </flexbox>
        </flexbox>
      </div>
    </div>
  </flexbox>
</template>

<script>
import {
  adminConfigsetIndexAPI,
  adminConfigsetUpdateAPI
} from '@/api/admin/application'

import { mapGetters } from 'vuex'

import XrHeader from '@/components/XrHeader'


export default {
  /** 系统管理 的 应用管理 */
  name: 'SystemModule',
  components: {
    XrHeader
  },
  mixins: [],
  data() {
    return {
      loading: false,
      allList: [
        {
          name: 'Ứng dụng đã kích hoạt',
          type: 1,
          status: 1,
          sublist: []
        },
        {
          name: 'Ứng dụng chưa kích hoạt',
          type: 1,
          status: 0,
          sublist: []
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['manage']),
    configSetAuth() {
      return this.manage && this.manage.configSet && this.manage.configSet.update
    }
  },
  mounted() {
    this.getDetail()
  },
  methods: {
    /**
     * 详情
     */
    getDetail() {
      this.loading = true
      adminConfigsetIndexAPI()
        .then(res => {
          this.loading = false
          res.data.forEach(o => {
            if (o.type == 1) {
              o.canEdit = o.module != 'crm'
            } else {
              o.canEdit = false
            }
          })
          for (let index = 0; index < this.allList.length; index++) {
            const element = this.allList[index]
            element.sublist = res.data.filter(o => {
              if (element.type != o.type) return false
              return element.hasOwnProperty('status') ? element.status == o.status : true
            })
          }
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 更多操作
     */
    handleMoreCommand(command, item) {
      this.getConfirmMessage(command, item, () => {
        this.loading = true
        adminConfigsetUpdateAPI({
          settingId: item.settingId,
          status: command == 'disable' ? 0 : 1
        })
          .then(res => {
            this.$message.success('Thành công')
            this.loading = false
            window.location.reload()
          })
          .catch(() => {
            this.loading = false
          })
      })
    },

    /**
     * 操作提示
     */
    getConfirmMessage(command, item, result) {
      if (command == 'enable') {
        result()
      } else {
        this.$confirm(`Xác nhận tắt ứng dụng ${item.name}，tất cả nhân viên của công ty sẽ không thể sử dụng tính năng này. Bạn có chắc chắn muốn hủy kích hoạt không？`, 'Thông báo', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            result()
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: 'Không thành công'
            })
          })
      }
    },

    getModuleIcon(status, moduleType) {
      if (moduleType == 'call') {
        return require('@/assets/img/system/app/call_enable.png')
      } else {
        const allModule = {
          oa: {
            disable: require('@/assets/img/system/app/oa_disable.png'),
            enable: require('@/assets/img/system/app/oa_enable.png')
          },
          crm: {
            disable: require('@/assets/img/system/app/crm_disable.png'),
            enable: require('@/assets/img/system/app/crm_enable.png')
          },
          project: {
            disable: require('@/assets/img/system/app/project_disable.png'),
            enable: require('@/assets/img/system/app/project_enable.png')
          },
          log: {
            disable: require('@/assets/img/system/app/log_disable.png'),
            enable: require('@/assets/img/system/app/log_enable.png')
          },
          book: {
            disable: require('@/assets/img/system/app/book_disable.png'),
            enable: require('@/assets/img/system/app/book_enable.png')
          },
          taskExamine: {
            disable: require('@/assets/img/system/app/oa_disable.png'),
            enable: require('@/assets/img/system/app/oa_enable.png')
          },
          bi: {
            disable: require('@/assets/img/system/app/bi_disable.png'),
            enable: require('@/assets/img/system/app/bi_enable.png')
          },
          calendar: {
            disable: require('@/assets/img/system/app/ce_disable.png'),
            enable: require('@/assets/img/system/app/ce_enable.png')
          }
        }

        if (allModule[moduleType]) {
          return allModule[moduleType][status == 1 ? 'enable' : 'disable']
        } else {
          return {
            disable: require('@/assets/img/system/app/other_disable.png'),
            enable: require('@/assets/img/system/app/other_enable.png')
          }[status == 1 ? 'enable' : 'disable']
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  padding: 0 15px;
  height: 100%;
}

.body {
  flex: 1;
  overflow-y: auto;
  padding-top: 20px;
  background-color: white;
  border: 1px solid $xr-border-line-color;
  border-radius: $xr-border-radius-base;
}

.section-header {
  padding: 3px 20px;
  font-size: 12px;
  color: #999;
}

.section-body {
  padding: 20px;
  .section-item {
    width: auto;
    min-width: 240px;
    position: relative;
    padding: 20px 35px 12px 20px;
    border: 1px solid #ebeef5;
    border-radius: $xr-border-radius-base;
    margin-right: 15px;
    margin-bottom: 10px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    vertical-align: middle;
    .item-icon {
      width: 40px;
      height: 40px;
      margin-right: 15px;
    }
    .item-name {
      font-size: 14px;
      color: #333333;
    }
  }
}

.el-icon-more {
  color: #cdcdcd;
  transform: rotate(90deg);
  cursor: pointer;
}

.more-menu {
  position: absolute;
  top: 8px;
  right: 8px;
}

.detail-button {
  position: absolute;
  top: 0px;
  right: 8px;
  color: #999;
  font-size: 12px;
}

.more-mark {
  color: #b3884f;
  font-size: 12px;
  background: linear-gradient(to right, #f9f3ed, #f8e1be);
  padding: 5px;
  border-radius: 2px;
  transform: scale(0.8);
  position: absolute;
  top: 6px;
  right: 4px;
}
</style>
