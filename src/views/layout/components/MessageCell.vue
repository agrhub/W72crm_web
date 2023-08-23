<template>
  <flexbox
    :class="{ 'is-unread' :data.isRead == 0 }"
    class="message-cell"
    align="stretch">
    <div class="message-cell__hd">
      <i
        :class="typeObj.icon"
      />
    </div>

    <div class="message-cell__bd">
      <span>{{ leftContent }}</span>
      <span :class="[{ 'is-invalid': isInvalid }, 'click-content']" @click="enterDetail">{{ centerCotent }}</span>
      <span>{{ rightContent }}</span>
    </div>

    <div class="message-cell__ft">
      <div>{{ data.createTime | formatTime }} </div>
      <div class="handle">
        <span class="check" @click="messageReadClick">Đã đọc</span>
        <span class="delete" @click="messageDeleteClick">Xóa</span>
      </div>
    </div>
  </flexbox>
</template>

<script>
// import moment from 'moment'
export default {
  // 消息cell
  name: 'MessageCell',
  components: {

  },
  props: {
    data: Object,
    dataIndex: Number
  },
  data() {
    return {}
  },
  computed: {
    typeObj() {
      const typesObj = {
        leads: {
          icon: 'wk wk-leads',
          color: '#6995FF',
          type: 'leads'
        },
        customer: {
          icon: 'wk wk-customer',
          color: '#6995FF',
          type: 'customer'
        },
        contacts: {
          icon: 'wk wk-contacts',
          color: '#6995FF',
          type: 'contacts'
        },
        business: {
          icon: 'wk wk-business',
          color: '#6995FF',
          type: 'business'
        },
        contract: {
          icon: 'wk wk-contract',
          color: '#6995FF',
          type: 'contract'
        },
        receivables: {
          icon: 'wk wk-receivables',
          color: '#6995FF',
          type: 'receivables'
        },
        product: {
          icon: 'wk wk-product',
          color: '#6995FF',
          type: 'product'
        },
        log: {
          icon: 'wk wk-log',
          color: '#6995FF',
          type: 'log'
        },
        examine: {
          icon: 'wk wk-approve',
          color: '#6995FF',
          type: 'examine'
        },
        task: {
          icon: 'wk wk-o-task',
          color: '#6995FF',
          type: 'task'
        },
        announcement: {
          icon: 'wk wk-announcement',
          color: '#6995FF',
          type: 'announcement'
        },
        schedule: {
          icon: 'wk wk-schedule',
          color: '#6995FF',
          type: 'schedule'
        },
        invoice: {
          icon: 'wk wk-invoice',
          color: '#6995FF',
          type: 'invoice'
        }
      }

      // 1 任务 2 日志 3 oa审批 4公告 5 日程 6 客户管理
      let key = ''
      if (this.data.label && this.data.label <= 5) {
        key = ['task', 'log', 'examine', 'announcement', 'schedule'][this.data.label - 1]
      } else {
        if ([1, 2, 3].includes(this.data.type)) {
          key = 'task'
        } else if ([4, 5, 34].includes(this.data.type)) {
          key = 'log'
        } else if ([6, 7, 25].includes(this.data.type)) {
          key = 'examine'
        } else if ([8].includes(this.data.type)) {
          key = 'announcement'
        } else if ([10, 11, 24, 26, 30, 33].includes(this.data.type)) {
          key = 'contract'
        } else if ([12, 13, 27].includes(this.data.type)) {
          key = 'receivables'
        } else if ([14, 15, 23, 29, 32].includes(this.data.type)) {
          key = 'customer'
        } else if ([16, 17].includes(this.data.type)) {
          key = 'contacts'
        } else if ([18, 19].includes(this.data.type)) {
          key = 'leads'
        } else if ([20, 21].includes(this.data.type)) {
          key = 'product'
        } else if ([22, 28, 31].includes(this.data.type)) {
          key = 'business'
        } else if ([35, 36, 37].includes(this.data.type)) {
          key = 'invoice'
        }
      }

      return typesObj[key]
    },

    leftContent() {
      return {
        1: `Bởi ${this.data.realname}`,
        2: `${this.data.realname} mời các bạn tham gia`,
        3: `Bởi ${this.data.realname}`,
        4: `${this.data.realname} đã trả lời của bạn`,
        5: `${this.data.realname} sẽ ghi lại`,
        6: `${this.data.realname} từ chối của bạn`,
        7: `${this.data.realname} đã phê duyệt cho bạn`,
        8: `Bạn có một thông báo mới`,
        9: `${this.data.realname} mời các bạn tham gia`,
        10: `${this.data.realname} từ chối bạn`,
        11: `${this.data.realname} đã phê duyệt cho bạn`,
        12: `${this.data.realname} từ chối bạn`,
        13: `${this.data.realname} Đã phê duyệt cho bạn`,
        14: `${this.data.realname} đã nhập dữ liệu khách hàng ${this.data.title} mục，${this.getImportContent(this.data)}`,
        15: `${this.data.realname} hủy nhập dữ liệu khách hàng，đã nhập ${this.data.title} mục，${this.getImportContent(this.data)}`,
        16: `${this.data.realname} đã nhập dữ liệu danh bạ ${this.data.title} mục，${this.getImportContent(this.data)}`,
        17: `${this.data.realname} hủy nhập dữ liệu danh bạ，đã nhập ${this.data.title} mục，${this.getImportContent(this.data)}`,
        18: `${this.data.realname} đã nhập dữ liệu khách hàng tiềm năng ${this.data.title} mục，${this.getImportContent(this.data)}`,
        19: `${this.data.realname} hủy nhập dữ liệu khách hàng tiềm năng， đã nhập ${this.data.title} mục，${this.getImportContent(this.data)}`,
        20: `${this.data.realname} đã nhập dữ liệu sản phẩm ${this.data.title} mục，${this.getImportContent(this.data)}`,
        21: `${this.data.realname} hủy nhập dữ liệu sản phẩm，đã nhập ${this.data.title} mục，${this.getImportContent(this.data)}`,
        22: `${this.data.realname} đã thêm bạn như một cơ hội`,
        23: `${this.data.realname} đã thêm bạn làm khách hàng`,
        24: `${this.data.realname} đã thêm bạn dưới dạng hợp đồng`,
        25: `${this.data.realname} đã nộp`,
        26: `${this.data.realname} đã nộp`,
        27: `${this.data.realname} đã nộp`,
        28: `${this.data.realname} đã rút khỏi cơ hội kinh doanh của bạn`,
        29: `${this.data.realname} đã thoát khỏi khách hàng của bạn`,
        30: `${this.data.realname} đã rút khỏi hợp đồng của bạn`,
        31: `${this.data.realname} đã xóa bạn khỏi cơ hội kinh doanh`,
        32: `${this.data.realname} đã xóa bạn khỏi khách hàng`,
        33: `${this.data.realname} đã xóa bạn khỏi hợp đồng`,
        34: `${this.data.realname} đã trả lời nhận xét của bạn`,
        35: `${this.data.realname} từ chối của bạn`,
        36: `${this.data.realname} đã phê duyệt cho bạn`,
        37: `${this.data.realname} đã nộp`
      }[this.data.type]
    },

    centerCotent() {
      // 导入提示与其他不一样
      if (this.isImportType) {
        // title 是总数 content 是错误数据 valid 错误文件是否有效 1 有效 0 失效
        const list = this.data.content.split(',') || []
        const errSize = Number(list[0] || 0)
        if (errSize > 0) {
          return this.data.valid === 0 ? 'Không hợp lệ' : 'Nhấp để tải xuống dữ liệu sai'
        }
        return ''
      } else {
        return `《${this.data.title}》`
      }
    },

    isInvalid() {
      if (this.isImportType) {
        // title 是总数 content 是错误数据 valid 错误文件是否有效 1 有效 0 失效
        return this.data.valid == 0
      } else {
        return false
      }
    },

    /**
     * 是导入type
     */
    isImportType() {
      return this.data.type >= 14 && this.data.type <= 21
    },

    rightContent() {
      return {
        1: `Công việc được giao cho bạn, vui lòng kiểm tra kịp thời`,
        2: `Công việc mới, vui lòng kiểm tra thời gian`,
        3: `Công việc được đánh dấu là hoàn thành`,
        4: `Báo cáo ：“${this.data.content}”，vui lòng kiểm tra thời gian`,
        5: `Đã gửi cho bạn, vui lòng kiểm tra thời gian`,
        6: `，Lý do từ chối：“${this.data.content}”，Hãy giải quyết kịp thời`,
        7: `，Vui lòng kiểm tra thời gian`,
        8: `，Vui lòng kiểm tra thời gian`,
        9: `Lịch biểu，${this.getStartTime(this.data.content)}, vui lòng kiểm tra thời gian`,
        10: `Phê duyệt hợp đồng, lý do từ chối：“${this.data.content}”，Hãy giải quyết kịp thời`,
        11: `Hợp đồng, vui lòng kiểm tra thời gian`,
        12: `Phê duyệt khoản thanh toán, lý do từ chối：“${this.data.content}”，Hãy giải quyết kịp thời`,
        13: `Vui lòng kiểm tra lại trong thời gian`,
        14: ``,
        15: ``,
        16: ``,
        17: ``,
        18: ``,
        19: ``,
        20: ``,
        21: ``,
        22: `thành viên của`,
        23: `thành viên của`,
        24: `thành viên của`,
        25: `，Hãy giải quyết kịp thời`,
        26: `Phê duyệt hợp đồng, vui lòng xử lý kịp thời`,
        27: `Vui lòng xử lý kịp thời để phê duyệt thanh toán`,
        28: `Nhóm`,
        29: `Nhóm`,
        30: `Nhóm`,
        31: `Nhóm`,
        32: `Nhóm`,
        33: `Nhóm`,
        34: `：“${this.data.content}”，Vui lòng kiểm tra thời gian`,
        35: `，Lý do từ chối：“${this.data.content}”，Hãy giải quyết kịp thời`,
        36: `Hóa đơn, vui lòng kiểm tra thời gian`,
        37: `Phê duyệt hóa đơn, vui lòng xử lý kịp thời`
      }[this.data.type]
    }
  },
  watch: {},
  mounted() {},

  beforeDestroy() {},
  methods: {
    enterDetail() {
      if (this.isInvalid) {
        return
      }

      // 是导入提醒
      if (this.isImportType) {
        this.$emit('download', this.data.messageId, this.dataIndex)
      } else {
        // 未读触发读
        if (this.data.isRead == 0) {
          this.$emit('read', this.data.messageId, this.dataIndex)
        }
        this.$emit('detail', this.typeObj.type, this.data.typeId, this.dataIndex, this.data)
      }
    },

    /**
     * 标记已读
     */
    messageReadClick() {
      this.$emit('read', this.data.messageId, this.dataIndex)
    },

    /**
     * 消息删除
     */
    messageDeleteClick() {
      this.$emit('delete', this.data.messageId, this.dataIndex)
    },

    /**
     * 日程提醒，多长时间后开始
     */
    getStartTime(content) {
      if (this.data.type != 9) {
        return
      }
      const timeObj = content ? JSON.parse(content) : { type: 0, value: '' }

      let dataValue = ''
      if (!timeObj.type) {
        dataValue = ''
      } else {
        dataValue = 'sẽ bắt đầu sau ' + timeObj.value + ['', ' phút', ' giờ', ' ngày'][timeObj.type]
      }
      return dataValue
    },

    getImportContent({ title, content }) {
      const countList = [14, 15, 16, 17, 18, 19, 20, 21, 50]
      if (!countList.includes(this.data.type)) {
        return
      }
      const list = content.split(',') || []
      const totalSize = Number(title || '0')
      const updateSize = Number(list[1] || '0')
      const errSize = Number(list[0] || '0')
      return `Tổng cộng ${updateSize} mục; Đã nhập thành công ${totalSize - errSize} mục; Nhập không thành công ${errSize} mục`
    }
  }
}
</script>

<style lang="scss" scoped>
.message-cell {
  position: relative;
  font-size: 14px;
  color: #333;
  padding: 15px 20px 15px 15px;
  line-height: 1.5;

  &__hd {
    flex-shrink: 0;
    margin-right: 15px;
    background-color: $xr-color-primary;
    text-align: center;
    width: 28px;
    height: 28px;
    line-height: 28px;
    border-radius: 14px;

    .wk {
      color: white;
      font-size: 13px;
    }
  }

  &__bd {
    flex: 1;
    white-space: pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
  }

  &__ft {
    flex-shrink: 0;
    font-size: 12px;
    color: #999;
    width: 85px;
    margin-left: 35px;
    text-align: right;
    position: relative;

    .handle {
      position: absolute;
      top: 20px;
      right: 0;
      font-size: 12px;
      color: #999;
      .check,
      .delete {
        visibility: hidden;
        cursor: pointer;
      }

      .check + .delete {
        margin-left: 5px;
      }

      .check:hover {
        color: $xr-color-primary;
      }
      .delete:hover {
        color: #F56C6C;
      }
    }
  }

  &.is-unread::before {
    content: '';
    position: absolute;
    top: 20px;
    right: 8px;
    width: 6px;
    height: 6px;
    border-radius: 3px;
    background-color: #f94e4e;
  }

  &:hover {
    background-color: #f7f8fa;
    .delete {
      visibility: visible;
    }
  }

  &.is-unread:hover {
    .check {
      visibility: visible;
    }
  }
}


.click-content {
  color: $xr-color-primary;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.is-invalid {
  color: #999;
  pointer-events: none;
  cursor: initial;
}
</style>
