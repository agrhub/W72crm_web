<template>
  <flexbox align="stretch">
    <flexbox-item style="margin-right: 50px;">
      <div class="area-title">Tìm kiếm địa điểm</div>
      <el-autocomplete
        v-model="searchInput"
        :fetch-suggestions="querySearchAsync"
        style="width: 100%;"
        placeholder="Vui lòng nhập địa điểm"
        @blur="inputBlur"
        @focus="inputFocus"
        @select="handleSelect">
        <template slot-scope="{ item }">
          <div class="name">{{ item.description }}</div>
        </template>
      </el-autocomplete>
      <div
        ref="choicemap"
        class="map"/>
      <div class="area-title">Địa chỉ chi tiết</div>
      <el-input
        v-model="detailAddress"
        placeholder=""/>
    </flexbox-item>
    <flexbox-item>
      <div class="area-title">Tỉnh/Thành phố - Quận/Huyện - Xã/Phường</div>
      <el-input
        v-model="addressSelect.province"
        :disabled="true"
        placeholder="Tỉnh/Thành Phố" />
      <el-row :gutter="10">
        <el-col :span="12">
          <el-input
            v-model="addressSelect.city"
            :disabled="true"
            placeholder="Quận/Huyện" />
        </el-col>
        <el-col :span="12">
          <el-input
            v-model="addressSelect.area"
            :disabled="true"
            placeholder="Xã/Phường" />
        </el-col>
      </el-row>
      <!-- <v-distpicker
        :province="addressSelect.province"
        :city="addressSelect.city"
        :area="addressSelect.area"
        @province="selectProvince"
        @city="selectCity"
        @area="selectArea"/> -->
    </flexbox-item>
  </flexbox>
</template>
<script type="text/javascript">
import VDistpicker from '@/components/VDistpicker'
import { getGoogleMap } from '@/utils'

export default {
  name: 'XhCustomerAddress', // 新建 客户位置
  components: {
    VDistpicker
  },
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    },
    /** 索引值 用于更新数据 */
    index: Number,
    /** 包含数据源 */
    item: Object
  },
  data() {
    return {
      map: null,
      /** 搜索地图输入框 */
      searchInput: '',
      searchCopyInput: '', // 避免修改
      /** 完整地址输入框 */
      detailAddress: '',
      pointAddress: null, // 经纬度点
      /** 区域选择 */
      addressSelect: {
        province: '',
        city: '',
        area: ''
      },
      /** 防止联动情况  */
      canExecute: true
    }
  },
  computed: {},
  watch: {
    pointAddress: function(newValue) {
      this.valueChange()
    },
    detailAddress: function(newValue) {
      this.valueChange()
    }
  },
  mounted() {
    getGoogleMap()
      .then(() => {
        const point = { lat: 10.774362, lng: 106.6684306 }
        var map = new GMap.maps.Map(this.$refs.choicemap, {
          zoom: 14,
          center: point
        })
        // 'choicemap', { enableMapClick: false })
        // map.centerAndZoom(new GMap.Point(106.6684306, 10.774362), 14)
        // map.disableDragging() //禁止拖拽
        // map.disableDoubleClickZoom()
        // map.disableScrollWheelZoom()
        // map.disableContinuousZoom()
        // map.enableScrollWheelZoom()
        this.map = map
        if (this.value && JSON.stringify(this.value) !== '{}') {
          this.initInfo(this.value)
        } else {
          // 定位逻辑
          // var geolocation = new GMap.Geolocation()
          // var self = this
          // geolocation.getCurrentPosition(
          //   function(r) {
          //     if (this.getStatus() == GMap_STATUS_SUCCESS) {
          //       self.addMarkerLabel(r.point)
          //     }
          //   },
          //   { enableHighAccuracy: true }
          // )
        }
        // this.initQuerySearchField()
      })
  },
  methods: {
    initInfo(val) {
      this.searchInput = val.location
      this.detailAddress = val.detailAddress
      if (Object.prototype.toString.call(val.address) == '[object Array]') {
        var address = {}
        for (let index = 0; index < val.address.length; index++) {
          index === 0 ? (address['province'] = val.address[0]) : ''
          index === 1 ? (address['city'] = val.address[1]) : ''
          index === 2 ? (address['area'] = val.address[2]) : ''
        }
        this.addressSelect = address
      }
      if (val.lng != 0 && val.lat != 0) {
        this.pointAddress = new GMap.Point(val.lng, val.lat)
        this.addMarkerLabel(this.pointAddress)
      }
    },
    querySearchAsync(queryString, cb) {
      if (queryString) {
        var mapSearch = new GMap.maps.places.AutocompleteService()
        if (mapSearch) {
          var options = {
            'input': queryString,
            'componentRestrictions': {
              'country': 'VN'
            }
          }
          mapSearch.getQueryPredictions(options, function(results, status) {
            if (status == GMap.maps.GeocoderStatus.OK) {
              console.log(results)
              var address = []
              for (var i = 0; i < results.length; i++) {
                address.push(results[i])
              }
              cb(address)
            } else {
              console.log('Geocoding failed: ' + status)
              cb([])
            }
          })
        } else {
          cb([])
        }
      } else {
        cb([])
      }
    },
    /* initQuerySearchField() {
      var autocomplete = new GMap.maps.places.Autocomplete(this.$refs.querySearch)
      autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace()
        if (place && place.address_components) {
          console.log(place.address_components)
        }
      })
    }, */
    /** 搜索结果选择 */
    handleSelect(item) {
      this.searchInput = item.description // + item.title
      this.searchCopyInput = this.searchInput // 只能通过这种方式修改

      this.detailAddress = this.searchInput
      this.mapSelectArea(item.description)
      // console.log(item.description)
    },
    /** Input 失去焦点  searchInput 只能通过选择更改*/
    inputBlur() {
      if (this.searchCopyInput !== this.searchInput) {
        this.searchInput = this.searchCopyInput
      }
    },
    inputFocus() {
      this.searchCopyInput = this.searchInput
    },
    // 创建标注
    addMarkerLabel(point) {
      // this.map.clearOverlays()
      // this.map.centerAndZoom(point, 14)
      // this.map.addOverlay(new GMap.Marker(point))

      this.map.setCenter(point)
      var marker = new GMap.maps.Marker({
        'map': this.map,
        'position': point
      })
    },
    /** 区域选择 */
    selectProvince(value) {
      this.addressSelect.province = value.value
      this.valueChange()
    },
    selectCity(value) {
      this.addressSelect.city = value.value
      this.valueChange()
    },
    selectArea(value) {
      this.addressSelect.area = value.value
      this.valueChange()
    },
    /** 地图选择区域 */
    mapSelectArea(queryString) {
      var self = this
      if (this.canExecute) {
        this.canExecute = false
        var geocoder = new GMap.maps.Geocoder()
        if (geocoder) {
          var options = {
            'address': queryString,
            'componentRestrictions': {
              'country': 'VN'
            }
          }
          geocoder.geocode(options, function(results, status) {
            if (status == GMap.maps.GeocoderStatus.OK) {
              // console.log(results)
              if (results.length > 0) {
                const item = results[0]
                if (item.address_components.length == 5) {
                  self.addressSelect.province = item.address_components[3]
                    ? item.address_components[3].long_name
                    : ''
                  self.addressSelect.city = item.address_components[2]
                    ? item.address_components[2].long_name
                    : ''
                  self.addressSelect.area = item.address_components[1]
                    ? item.address_components[1].long_name
                    : ''
                } else if (item.address_components.length == 4) {
                  self.addressSelect.province = item.address_components[2]
                    ? item.address_components[2].long_name
                    : ''
                  self.addressSelect.city = item.address_components[1]
                    ? item.address_components[1].long_name
                    : ''
                  self.addressSelect.area = item.address_components[0]
                    ? item.address_components[0].long_name
                    : ''
                } else if (item.address_components.length == 3) {
                  self.addressSelect.province = item.address_components[1]
                    ? item.address_components[1].long_name
                    : ''
                  self.addressSelect.city = item.address_components[0]
                    ? item.address_components[0].long_name
                    : ''
                  self.addressSelect.area = ''
                }
                self.addMarkerLabel(item.geometry.location)
                self.pointAddress = item.geometry.location
              }
            } else {
              console.log('Geocoding failed: ' + status)
            }
          })
        }
        setTimeout(() => {
          self.canExecute = true
        }, 500)
      }
    },
    // 值更新的回调
    valueChange() {
      this.$emit('value-change', {
        index: this.index,
        value: {
          address: [
            this.addressSelect.province,
            this.addressSelect.city,
            this.addressSelect.area
          ],
          location: this.searchInput,
          detailAddress: this.detailAddress,
          lat: this.pointAddress ? this.pointAddress.lat : '',
          lng: this.pointAddress ? this.pointAddress.lng : ''
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.map {
  height: 150px;
  width: 100%;
  overflow: hidden;
  margin-top: 5px;
}

.area-title {
  font-size: 12px;
  color: #aaa;
  padding-left: 10px;
}
</style>
