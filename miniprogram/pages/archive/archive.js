const store = require("../../utils/store");
Page({
  data: { profile: {}, sessions: [] },
  onShow: function () {
    const data = store.load();
    this.setData({ profile: data.profile, sessions: data.sessions });
  },
  onField: function (e) {
    const key = e.currentTarget.dataset.k;
    const profile = Object.assign({}, this.data.profile);
    profile[key] = e.detail.value;
    this.setData({ profile: profile });
  },
  saveProfile: function () {
    store.save({ profile: this.data.profile });
    wx.showToast({ title: "基础信息已保存" });
  },
});
