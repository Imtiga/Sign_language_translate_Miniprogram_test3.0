//pages/scan.js   
import { getBLEName } from '../../utils/tools'

var app = getApp();
Page({
  data: {
    sousuo: "",
    status: "",
    devices: []
  },
  onLoad: function () {
    var that = this;
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter({
        success: function (res) {
          //得到蓝牙状态
          wx.getBluetoothAdapterState({
            success: function (res) {
              //that.data.isbleok = res.available;
              if (res.available) {
              }
              that.setData({
                //msg: "蓝牙状态" + ":" + JSON.stringify(res.errMsg),
                sousuo: res.discovering ? "在搜索。" : "未搜索。",
                status: res.available ? "蓝牙可用。" : "蓝牙不可用。",
              })
              //监听蓝牙适配器状态  
              wx.onBluetoothAdapterStateChange(function (res) {
                that.data.isbleok = res.available;
                that.setData({
                  sousuo: res.discovering ? "在搜索。" : "未搜索。",
                  status: res.available ? "蓝牙可用。" : "蓝牙不可用。",
                })
              })
            },
            fail: function () {
              wx.showModal({
                title: '蓝牙连接',
                content: '请手动在系统设置打开蓝牙',
                showCancel: false
              })
            }
          })
        },
        fail: function () {
          wx.showModal({
            title: '蓝牙连接',
            content: '请手动在系统设置打开蓝牙',
            showCancel: false
          })
        }
      })

    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示  
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
        showCancel: false
      })
    }
  },
  scandev: function () {
    //首先要PUSH已经有的设备 
    var that = this;
    wx.getBluetoothDevices({
      success: function (res) {
        var isfound = false;
        console.log("getBluetoothDevices", res);
        //console.log('搜到的蓝牙设备数目：' + res.devices.length);
        //console.log('获取到周边搜到的设备信息：' + JSON.stringify(res.devices))
        //that.setData({ msg: JSON.stringify(res.devices) });  
        that.scan();
      }
    });
  },
  scan: function () {
    var that = this;
    //开始搜索
    this.setData({ devices: [] });
    wx.showLoading({
      title: '正在搜索',
      mask: true,
    })
    setTimeout(function () {
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          wx.hideLoading();
          console.log(res)
        },
        fail: function () {
          wx.hideLoading();
          wx.showModal({
            title: '蓝牙连接',
            content: '停止搜索失败',
          })
        }
      })

    }, 1000 * 1)  //搜索1秒
    setTimeout(function () {
      wx.startBluetoothDevicesDiscovery({
        success: function (res) {
          console.log("startBluetoothDevicesDiscovery", res);
          that.onBluetoothDeviceFound(); //启动设备发现
        },
        fail: function (res) {
          wx.hideLoading();
          wx.showModal({
            title: '搜索失败',
            content: res.errMsg,
          })
        }
      })
    }, 100)
  },
  onBluetoothDeviceFound: function () {
    var that = this;
    console.log('onBluetoothDeviceFound');
    wx.onBluetoothDeviceFound(function (res) {
      console.log("onBluetoothDeviceFound", res);
      if (res.devices[0]) {
        //*try {
        var mac = ab2hex(res.devices[0].advertisData);
        var sn = mac.slice(4, 8);   //88a0     
        if (sn == getBLEName()) {
          var isexist = false;
          var devs = that.data.devices;
          mac = mac.slice(8, 20);//取MAC D8A98B7FFD8F
          devs.forEach(function (row, index) {
            if (mac == row.mac) {
              console.log("找到");
              isexist = true;
            }
          })
          if (!isexist) {//搜索到JDY-08
            devs.push({ name: res.devices[0].name, mac: mac, RSSI: res.devices[0].RSSI })
            console.log(devs);
            that.setData({ devices: devs });
          }
        }

        //   } catch (e) {
        //   console.log(e)
        //  }
      }       //[0]  
    })
  },
  //开始蓝牙连接 安卓可以直接这步
  StartConectDev: function () {
    var that = this;
    console.log("开始连接");
    wx.showLoading({
      title: '连接中',
    })
    console.log("devid: " + that.data.connectedDeviceId);
    wx.createBLEConnection({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log(res.errMsg);
        // 获取连接设备的service服务  
        setTimeout(function () {
          that.getBLEService();
        }, 100);
      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
        wx.showModal({
          title: '蓝牙连接',
          content: '连接设备失败,请重试', // + that.data.connectedDeviceId,
          showCancel: false
        })
      }
    })
  },
  // 获取连接设备的service服务  
  getBLEService: function () {
    var that = this;
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log('device services:', JSON.stringify(res.services));
        that.setData({
          services: res.services,
          // msg: JSON.stringify(res.services),
        }),
          setTimeout(function () {
            that.getBLEcharac();//获取characterstic值
          }, 100)

      },
      fail: function (res) {
        wx.hideLoading();
        wx.showModal({
          title: '获取service服务失败',
          content: res.errMsg,
        })
      }
    })
  },
  //获取连接设备的所有特征值  for循环获取不到值  
  //注意services是个数组
  getBLEcharac: function () {
    var that = this;
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      // serviceId: that.data.services[0].uuid,
      serviceId: that.data.serviceId,
      success: function (res) {
        for (var i = 0; i < res.characteristics.length; i++) {
          if (res.characteristics[i].properties.notify) {
            //console.log("1", that.data.services[0].uuid);
            console.log("2  ", i, "  ", res.characteristics[i].uuid);
            that.setData({
              notifyServicweId: that.data.serviceId,
              notifyCharacteristicsId: res.characteristics[0].uuid,
            })
          }
          if (res.characteristics[i].properties.write) {
            that.setData({
              //writeServicweId: that.data.services[0].uuid,
              writeServicweId: that.data.serviceId,
              writeCharacteristicsId: res.characteristics[0].uuid,
            })

          } else if (res.characteristics[i].properties.read) {
            that.setData({
              //readServicweId: that.data.services[0].uuid,
              readServicweId: that.data.serviceId,
              readCharacteristicsId: res.characteristics[0].uuid,
            })
          }
        }
        console.log('device getBLEDeviceCharacteristics:', res.characteristics);
        //开启监听
        //监听值变化
        setTimeout(function () {
          wx.notifyBLECharacteristicValueChange({
            state: true, // 启用 notify 功能  
            // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
            deviceId: that.data.connectedDeviceId,
            // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
            serviceId: that.data.notifyServicweId,
            // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取  
            characteristicId: that.data.notifyCharacteristicsId,
            success: function (res) {
              console.log('notifyBLECharacteristicValueChange success: ', res.errMsg)
              // 这里的回调可以获取到 write 导致的特征值改变  
              wx.onBLECharacteristicValueChange(function (characteristic) {
                let buffer = characteristic.value //特征值最新的值
                //console.log(buffer, "  ");
                let dataView = new DataView(buffer) // create an ArrayBuffer with a size in bytes
                var xx = "";
                var zt = "";
                var len2 = dataView.byteLength;
                var mycheckcode = 0;
                for (let i = 0; i < dataView.byteLength; i++) {
                  //console.log("0x" + dataView.getUint8(i).toString(16))            
                  try {
                    xx = xx + " " + dataView.getUint8(i).toString(16);
                    if (i < dataView.byteLength - 1) { //计算校验码
                      mycheckcode += dataView.getUint8(i);
                    }
                  }
                  catch (err) {
                    console.log("接收错误" + err);
                    that.setData({ msg: err })
                    return;
                  }
                }
                console.log("返回指令" + xx);
              })

            },
            fail: function (res) {
              console.log(res.errMsg);
              wx.showModal({
                title: '监听特征值失败',
                content: res.errMsg,
                showCancel: false
              })

            }, complete: function () {
              wx.hideLoading(); //连接结束了
            }
          }) //nofify
        }, 0)  //监听


      },
      fail: function () {
        console.log("fail");
      },
      complete: function () {
        console.log("complete");
      }
    })
  },
  gotoSend: function (event) {
    var mac = event.currentTarget.dataset.mac;
    console.log("goto send");
    wx.navigateTo(
      {
        url: "../chat1/chat1?mac=" + mac
        //url: "../head/head?mac=" + mac
      }
    )
  },
  gotoHead: function (event) {
    var mac = event.currentTarget.dataset.mac;
    console.log("goto head");
    wx.navigateTo({
      url: "../chat1/chat1?mac=" + mac
    })
  },

  reconvert: function () {   //数据接收解析

  }
})

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}
