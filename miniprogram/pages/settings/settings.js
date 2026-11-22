const store = require("../../utils/store");
const app = getApp();

Page({
  data: { apiKey: "", models: ["deepseek-flash", "deepseek-v4-pro"], modelIndex: 0, phrase: "", hasHash: false, note: "" },
  onShow: function () {
    const data = store.load();
    const index = data.model === "deepseek-v4-pro" ? 1 : 0;
    this.setData({ apiKey: data.apiKey, modelIndex: index, hasHash: !!data.devHash });
  },
  onKey: function (e) { this.setData({ apiKey: e.detail.value }); },
  onModel: function (e) { this.setData({ modelIndex: Number(e.detail.value) }); },
  onPhrase: function (e) { this.setData({ phrase: e.detail.value }); },
  save: function () {
    store.save({ apiKey: this.data.apiKey.trim(), model: this.data.models[this.data.modelIndex] });
    wx.showToast({ title: "已保存" });
  },
  unlock: function () {
    const phrase = (this.data.phrase || "").trim();
    if (phrase.length < 6) {
      this.setData({ note: "口令至少 6 位" });
      return;
    }
    const hash = store.sha256(phrase);
    const saved = store.load();
    if (!saved.devHash) {
      store.save({ devHash: hash });
      app.globalData.devOn = true;
      this.setData({ hasHash: true, phrase: "", note: "已设为开发者，审核入口在社群里" });
      return;
    }
    const ok = hash === saved.devHash;
    app.globalData.devOn = ok;
    this.setData({ note: ok ? "已进入开发者模式" : "口令不对" });
  },
  lock: function () {
    app.globalData.devOn = false;
    this.setData({ note: "已退出审核" });
  },
});
