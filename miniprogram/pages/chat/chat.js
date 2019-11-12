// pages/chat/chat.js
var app = getApp();//取得全局App({..})实例
var lanya_test = app.globalData.lanya_test;//取得全局变量需要的值
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!lanya_test) {
      wx.showModal({
        title: '提示',
        content: '请先连接蓝牙',
        showCancel: false,
        confirmText: "确定",
        success: function (res) {
          wx.navigateTo({
            url: '/pages/scan/scan',
          })
        }
      })
    } 

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})