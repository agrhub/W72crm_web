<template>
  <editor
    ref="mceEditor"
    :id="id"
    v-model="dataValue"
    v-bind="$attrs"
    :init="showInit"
    :plugins="showPlugins"
    :toolbar="showToolbar"
    tinymce-script-src="https://agrhub.com/assets/globals/plugins/tinymce/tinymce.min.js"
    v-on="$listeners"
  />
</template>

<script>
import { webFileSaveAPI } from '@/api/common'
import Editor from '@tinymce/tinymce-vue'

import plugins from './plugins'
import toolbar from './toolbar'

let unique = 0

export default {
  name: 'Tinymce',
  components: {
    Editor
  },
  inheritAttrs: false,
  props: {
    /**
     *  apiKey: String,
        cloudChannel: String,
        id: String,
        init: Object,
        initialValue: String,
        inline: Boolean,
        modelEvents: [String, Array],
        plugins: [String, Array],
        tagName: String,
        toolbar: [String, Array],
        value: String,
        disabled: Boolean,
        tinymceScriptSrc: String,
        outputFormat: {
          type: String,
          validator: (prop: string) => prop === 'html' || prop === 'text'
        }
     */
    value: String,
    init: Object,
    height: [String, Number],
    plugins: [String, Array],
    toolbar: [String, Array],
    menubar: [String, Array]
  },
  data() {
    return {
      id: this.uuid(),
      dataValue: '',
      languageTypeList: {
        'en': 'en',
        'vi': 'vi_VN',
        'es': 'es_MX',
        'ja': 'ja'
      },
      showInit: {}
    }
  },
  computed: {
    editor() {
      return window.tinymce.get(this.id)
    },

    showToolbar() {
      return this.toolbar != undefined ? this.toolbar : toolbar
    },

    showPlugins() {
      return this.plugins != undefined ? this.plugins : plugins
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val != this.dataValue) {
          this.dataValue = val
        }
      },
      immediate: true,
      deep: true
    },
    dataValue() {
      this.$emit('input', this.dataValue)
    },
    init: {
      handler() {
        this.initTinymce()
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
  },
  methods: {
    initTinymce() {
      const initDefault = {
        skin: 'wukong',
        resize: false,
        branding: false,
        language: this.languageTypeList['en'],
        menubar: this.menubar ? this.menubar : false,
        body_class: 'panel-body',
        image_advtab: true,
        end_container_on_empty_block: true,
        powerpaste_word_import: 'clean',
        content_css: ['/static/tinymce/css/tiny-wukong.css'],
        fontsize_formats: '12px 14px 16px 18px 24px 36px 48px 56px 72px',
        font_formats: 'Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats;Helvetica Neue,PingFang SC,sans-serif;Microsoft YaHei,sans-serif,serif',
        code_dialog_height: 450,
        code_dialog_width: 1000,
        advlist_bullet_styles: 'square',
        advlist_number_styles: 'default',
        imagetools_cors_hosts: ['www.tinymce.com', 'codepen.io'],
        default_link_target: '_blank',
        link_title: false,
        quickbars_insert_toolbar: false,
        nonbreaking_force_tab: true,
        convert_urls: false,
        toolbar_mode: 'sliding',
        images_upload_handler: function(blobInfo, success, failure, progress) {
          progress(0)
          webFileSaveAPI({
            file: blobInfo.blob()
          }).then(res => {
            success(res.data.url)
            progress(100)
          }).catch(() => {
            failure('Đã xảy ra sự cố không xác định, hãy làm mới trang hoặc liên hệ với quản trị viên')
          })
        },
        ...this.init
      }

      /**
       * statusbar 隐藏底部状态栏
       */

      if (this.height != undefined) {
        initDefault.height = this.height
      }

      this.showInit = initDefault

      // 整合七牛上传
      // images_dataimg_filter(img) {
      //   setTimeout(() => {
      //     const $image = $(img);
      //     $image.removeAttr('width');
      //     $image.removeAttr('height');
      //     if ($image[0].height && $image[0].width) {
      //       $image.attr('data-wscntype', 'image');
      //       $image.attr('data-wscnh', $image[0].height);
      //       $image.attr('data-wscnw', $image[0].width);
      //       $image.addClass('wscnph');
      //     }
      //   }, 0);
      //   return img
      // },
      // images_upload_handler(blobInfo, success, failure, progress) {
      //   progress(0);
      //   const token = _this.$store.getters.token;
      //   getToken(token).then(response => {
      //     const url = response.data.qiniu_url;
      //     const formData = new FormData();
      //     formData.append('token', response.data.qiniu_token);
      //     formData.append('key', response.data.qiniu_key);
      //     formData.append('file', blobInfo.blob(), url);
      //     upload(formData).then(() => {
      //       success(url);
      //       progress(100);
      //     })
      //   }).catch(err => {
      //     failure('Đã xảy ra sự cố không xác định, hãy làm mới trang hoặc liên hệ với quản trị viên')
      //     console.log(err);
      //   });
      // },
    },
    uuid() {
      const time = Date.now()
      const random = Math.floor(Math.random() * 1000000000)

      unique++

      return 'wukong_' + random + unique + String(time)
    },
    imageSuccessCBK(arr) {
      arr.forEach(v => {
        this.editor.insertContent(`<img class="wscnph" src="${v.url}" >`)
      })
    }
  }
}
</script>

<style lang="scss">
.tinymce-container {
  position: relative;
  line-height: normal;
}
.tinymce-container>>>.mce-fullscreen {
  z-index: 10000;
}
.tinymce-textarea {
  visibility: hidden;
  z-index: -1;
}
.tox-tinymce-aux {
  z-index: 10001 !important;
}
</style>
