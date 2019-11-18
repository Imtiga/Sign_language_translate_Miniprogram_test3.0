// pages/contact/contact.js
import { getBLEName } from '../../utils/tools'
var app = getApp();
var inputVal = '';
var msgList = [];
var windowWidth = wx.getSystemInfoSync().windowWidth;
var windowHeight = wx.getSystemInfoSync().windowHeight;
var keyHeight = 0;
let bluetooth_msg = '0';
let bufferStringformat = '';

/**
 * 初始化数据
 */
function initData(that) {
  inputVal = '';

  msgList = [{
    speaker: 'server',
    contentType: 'text',
    content: '欢迎'
  },
  {
    speaker: 'customer',
    contentType: 'text',
    content: '欢迎'
  }
  ]
  that.setData({
    msgList,
    inputVal
  })
}

//本地函数处理手套数据
function calllocal(buffer){
  //原本想用云函数解决数据
  // wx.cloud.callFunction({
  //   name: 'recieve',
  //   data: {
  //     //a: buffer,
  //     a: 1,
  //   },
  //   success: res => {
  //     bluetooth_msg = res.result;
  //     console.log(bluetooth_msg) // 3
  //   },
  //   fail: err => {
  //     bluetooth_msg = 'error',
  //       console.error('[云函数] [sum] 调用失败：', err)
  //   }
  // })
  bluetooth_msg = buffer;
  return ab2str(bluetooth_msg);
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollHeight: '100vh',
    inputBottom: 0,
    item: [
      { name: 'Hex收', value: 'Hex收' },
    ],
    wcharffex: "FFE1",
    HEXRev: true,
    receivcedata: "",

    scene: "",  //存放扫码的MAC地址
    mac: "11",
    connectedDeviceId: "", //已连接设备uuid  
    services: "", // 连接设备的服务集合  
    serviceId: "", //可以操作的服务 0000FFE0-0000-1000-8000-00805F9B34FB
    characteristics: "",   // 连接设备的状态值  
    writeServicweId: "", // 可写服务uuid  
    writeCharacteristicsId: "",//可写特征值uuid  

    readServicweId: "", // 可读服务uuid  
    readCharacteristicsId: "",//可读特征值uuid  
    notifyServicweId: "", //通知服务UUid  
    notifyCharacteristicsId: "", //通知特征值UUID 
  },
  revChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    if (e.detail.value.length > 0) {
      this.setData({ HEXRev: true })
    } else {
      this.setData({ HEXRev: false })
    }
  },

  onLoad: function (option) {
    var that = this;
    this.setData({
      mac: option.mac,
    });
    wx.getSystemInfo({
      success: function (res) {//获取系统信息,判断系统ios 或andro
        //that.data.systeminfo = res.platform;
        if (res.platform == "ios") {
          that.IOSconnect();
        } else {
          // that.IOSconnect();
          var mymac = "";
          for (var i = 0; i < option.mac.length; i += 2) {
            console.log(option.mac.substr(i, 2));
            mymac = mymac + ":" + option.mac.substr(i, 2);
          }
          mymac = mymac.substr(1, 18).toUpperCase();
          that.setData({ connectedDeviceId: mymac });
          that.StartConectDev();
        }
      },
      fail: function (res) {
        wx.showToast({
          title: res.errMsg,
        })
      }
    });
  },
  IOSconnect: function () {
    //首先要获取已经连接的设备 
    var that = this;
    wx.getBluetoothDevices({
      success: function (res) {
        var isfound = false;
        console.log("getBluetoothDevices", res);
        //that.setData({ msg: JSON.stringify(res.devices) });
        if (res.devices.length != 0) {
          //如果没有匹配的,也要去发现     
          for (var i = 0; i < res.devices.length; i++) {
            try {
              var mac = ab2hex(res.devices[i].advertisData);
              mac = mac.slice(8, 20);//取MAC
              var maccode = that.data.mac.replace(/:/g, "");
              if (mac.toUpperCase() == maccode.toUpperCase()) {
                var deviceId = res.devices[i]['deviceId'];
                //that.data.connectedDeviceId = deviceId;
                that.setData({ connectedDeviceId: deviceId });
                console.log("已经连上的" + deviceId);
                isfound = true;
                break;
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
        if (!isfound) {
          //没有已连接的设备开启扫描
          wx.showLoading({
            title: '扫描',
          })
          setTimeout(function () {
            that.ScanBLDevice();  //开启扫描找啊找
          }, 100)
        } else {
          //连接设备
          setTimeout(function () {
            that.StartConectDev();
          }, 100)
        }
      }
    });
  },
  //设备可能有多个...
  onBluetoothDeviceFound: function () {
    var that = this;
    console.log('onBluetoothDeviceFound');
    wx.onBluetoothDeviceFound(function (res) {
      console.log(res);
      if (res.devices[0]) {
        //*try {
        var mac = ab2hex(res.devices[0].advertisData);
        var sn = mac.slice(4, 8);
        console.log(sn);
        if (sn == getBLEName()) {

          mac = mac.slice(8, 20);//取MAC
          var maccode = that.data.mac.replace(/:/g, "");
          console.log("mac" + mac);
          console.log("maccode" + maccode);
          console.log("当前:" + that.data.connectedDeviceId);
          if (mac.toUpperCase() == maccode.toUpperCase()) {
            wx.hideLoading(); //关闭掉扫描           
            var deviceId = res.devices[0]['deviceId'];
            that.setData({ connectedDeviceId: deviceId });
            console.log("扫描到" + deviceId);
            //停止扫描
            wx.stopBluetoothDevicesDiscovery({
              success: function (res) {
                console.log(res)
              }
            })
            //开始连接设备
            setTimeout(function () {
              that.StartConectDev();
            }, 100)

          }
        }
      }       //[0]  
    })
  },

  ScanBLDevice: function () {
    var that = this;
    //开始搜索咯
    wx.startBluetoothDevicesDiscovery({
      success: function (res) {
        if (!res.isDiscovering) {
          //that.getBluetoothAdapterState();
          wx.showModal({
            title: '蓝牙连接',
            content: '搜索失败',
          })
        } else {
          //setTimeout(function(){
          that.onBluetoothDeviceFound(); //启动设备发现
          // },100)

        }
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showModal({
          title: '搜索失败',
          content: res.errMsg,
        })
      }
    })
  },
  //开始蓝牙连接 安卓可以直接这步
  StartConectDev: function () {
    var that = this;
    console.log("开始连接");
    wx.showLoading({
      title: '连接中',
    })
    console.log("devid" + that.data.connectedDeviceId);
    wx.createBLEConnection({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log(res.errMsg);
        // 获取连接设备的service服务  
        setTimeout(function () {
          that.getBLService();
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
  getBLService: function () {
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
            that.getBLcharac();//获取characterstic值
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
  getBLcharac: function () {
    var that = this;
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取  
      deviceId: that.data.connectedDeviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取  
      serviceId: that.data.services[0].uuid,
      //serviceId: that.data.serviceId,
      success: function (res) {
        for (var i = 0; i < res.characteristics.length; i++) {
          if (res.characteristics[i].properties.notify) {
            //console.log("1", that.data.services[0].uuid);
            console.log("2", res.characteristics[i].uuid);
            console.log("notify: characteristics[", i, "]");
            that.setData({
              // notifyServicweId: that.data.serviceId,
              notifyServicweId: that.data.services[0].uuid,
              notifyCharacteristicsId: res.characteristics[0].uuid,
            })
          }
          if (res.characteristics[i].properties.write) {
            console.log("write: characteristics[", i, "]");
            if (res.characteristics.length >= 2) {
              var FFE2 = res.characteristics[1].uuid
            } else {
              var FFE2 = ""
            }
            //console.log(FFE2);
            that.setData({
              writeServicweId: that.data.services[0].uuid,
              //writeServicweId: that.data.serviceId,
              writeCharacteristicsId: res.characteristics[0].uuid,
              FFE2: FFE2

            })

          } else if (res.characteristics[i].properties.read) {
            console.log("read: characteristics[", i, "]");
            that.setData({
              readServicweId: that.data.services[0].uuid,
              //readServicweId: that.data.serviceId,
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
              console.log('notifyBLECharacteristicValueChange success', res.errMsg)
              // 这里的回调可以获取到 write 导致的特征值改变  

              //这里监听蓝牙发送过来的值(buffer类),characteristic.value是Arraybuffer类型，蓝牙传过来的值存放在这个里面
              wx.onBLECharacteristicValueChange(function (characteristic) {

                //console.log('characteristic value comed:', ab2hex(characteristic.value))
                let buffer = characteristic.value
                let dataView = new DataView(buffer);
                var len2 = dataView.byteLength;
                that.setData({ receivcedatacount: that.data.receivcedatacount + len2 });
                console.log("接收数据:" + ab2str(buffer));

                if (that.data.HEXRev) {
                  console.log("16进制收");
                  console.log(ab2str(buffer));
                  //that.setData({ receivcedata: that.data.receivcedata + ab2hex(buffer) });
                  bufferStringformat = ab2str(buffer)
                  //ab2str函数在cloud.callfunction不能用
                  //先把buffer转成string格式
                  //再导入到data中
                  wx.cloud.callFunction({
                    name: 'recieve',
                    data: {
                      a: bufferStringformat,
                      //a: 1,//测试用
                    },
                    success: res => {
                      bluetooth_msg = res.result;

                      msgList.push({
                        speaker: 'server',
                        contentType: 'text',
                        //content: cloudcalllocal(buffer)//调用本地函数
                        //JSON.stringify将bluetooth_msg转换成string格式方便输出
                        //substring，字符串专有的函数，用于裁剪字符串，输出想要的部分
                        content: JSON.stringify(bluetooth_msg).substring(21,                             JSON.stringify(bluetooth_msg).length - 2)
                      })
                      that.setData({
                        msgList,
                      })

                      console.log(bluetooth_msg) // 3
                    },
                    fail: err => {
                      bluetooth_msg = 'error',
                        console.error('[云函数] [sum] 调用失败：', err)
                    }
                  })
                  //使用云函数请打开371-398行的wx.cloud.callfunction函数

                  //左边是聋哑人手套发来的信息，就是server
                  // msgList.push({
                  //   speaker: 'server',
                  //   contentType: 'text',
                  //   content: calllocal(buffer)//调用本地函数

                  //   //content: ab2str(bluetooth_msg)
                  //   //content就是手语手套发过来的内容
                  //   //对这个进行处理就行
                  //   //buffer就是手语手套通过蓝牙发给小程序的信息
                  // })
                  // that.setData({
                  //   msgList,
                  // });
                  //使用本地函数请打开上面的405-413行


                } 
                /*else {
                  console.log("ASCII收");
                  //that.setData({ receivcedata: that.data.receivcedata + ab2str(buffer) });
                  msgList.push({
                    speaker: 'server',
                    contentType: 'text',
                    content: ab2str(buffer)
                  })
                  this.setData({
                    msgList,
                  });
                }*/
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
  reconvert: function () {   //数据接收解析

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  onUnload: function () {
    var that = this;
    wx.closeBLEConnection({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log(res)
      }
    })
  },

  /**
   * 获取聚焦
   */
  focus: function (e) {
    keyHeight = e.detail.height;
    this.setData({
      scrollHeight: (windowHeight - keyHeight) + 'px'
    });
    this.setData({
      toView: 'msg-' + (msgList.length - 1),
      inputBottom: keyHeight + 'px'
    })
    //计算msg高度
    // calScrollHeight(this, keyHeight);

  },

  //失去聚焦(软键盘消失)
  blur: function (e) {
    this.setData({
      scrollHeight: '100vh',
      inputBottom: 0
    })
    this.setData({
      toView: 'msg-' + (msgList.length - 1)
    })

  },

  /**
   * 发送点击监听
   */
  //右边是customer，用户
  //左边是聋哑人手套发的信息并显示
  //sendclick就是customer（正常人）键入的消息
  sendClick: function (e) {
    msgList.push({//通过该函数将content显示在对话框中
      speaker: 'customer',
      contentType: 'text',
      content: e.detail.value
    })
    inputVal = '';
    this.setData({
      msgList,
      inputVal
    });
  },

  /**
   * 退回上一页
   */
  toBackClick: function () {
    wx.navigateBack({})
  },


  revInput: function (e) {//no use?
    this.setData({
      receivedata: e.detail.value,
    })
  },
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

// ArrayBuffer转为字符串，参数为ArrayBuffer对象
function ab2str(buf) {
  let dataView = new DataView(buf)
  var len2 = dataView.byteLength;
  var xx = "";
  for (let i = 0; i < dataView.byteLength; i++) {
    //console.log("0x" + dataView.getUint8(i).toString(16))           
    //dataView.getUint8(i).toString(16);
    //console.log(dataView.getUint8(i));
    xx = xx + String.fromCharCode(dataView.getUint8(i))
  }
  return xx;
}

