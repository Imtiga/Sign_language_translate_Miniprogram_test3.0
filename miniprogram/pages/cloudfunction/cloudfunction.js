// pages/addFunction/addFunction.js
var app = getApp();//取得全局App({..})实例
const code = `// 云函数入口函数
exports.main = (event, context) => {
  console.log(event)
  console.log(context)
  return {
    sum: event.a + event.b
  }
}`

let bluetooth1 = '0';

Page({

  data: {
    result: '',
    canIUseClipboard: wx.canIUse('setClipboardData'),
  },

  onLoad: function (options) {

  },

  copyCode: function () {
    wx.setClipboardData({
      data: code,
      success: function () {
        wx.showToast({
          title: '复制成功',
        })
      }
    })
  },

  // testFunction() {
  //   wx.cloud.callFunction({
  //     name: 'recieve',
  //     data: {
  //       a: 2,
  //       b: 3,
  //     },
  //     success: res => {
  //       wx.showToast({
  //         title: '调用成功',
  //       })
  //       this.setData({
  //         result: JSON.stringify(res.result)
  //       })
  //       console.log(res.result) // 3
  //     },
  //     fail: err => {
  //       wx.showToast({
  //         icon: 'none',
  //         title: '调用失败',
  //       })
  //       console.error('[云函数] [sum] 调用失败：', err)
  //     }
  //   })
  // },

  

  testFunction() {
    wx.cloud.callFunction({
      name: 'recieve',
      data: {
        a: 2,
      },
      success: res => {
        bluetooth1 = res.result;
        this.setData({
          //result: JSON.stringify(bluetooth1)
          result: JSON.stringify(bluetooth1).substring(20, JSON.stringify(bluetooth1).length-1)
        })
        console.log(bluetooth1) // 3
      },
      fail: err => {
        console.error('[云函数] [sum] 调用失败：', err)
      }
    })
  },

})
