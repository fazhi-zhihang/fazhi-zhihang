const store = require("../../utils/store");
const app = getApp();

Page({
  data: { entered: false, hasKey: false, model: "deepseek-flash" },
  onShow: function () {
    const data = store.load();
    this.setData({ entered: !!app.globalData.entered, hasKey: !!data.apiKey, model: data.model });
  },
  enter: function () {
    app.globalData.entered = true;
    this.setData({ entered: true });
  },
});