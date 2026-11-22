Component({
  properties: { current: { type: String, value: "home" } },
  data: {
    items: [
      { id: "home", label: "首页", url: "/pages/home/home" },
      { id: "interview", label: "面试", url: "/pages/interview/interview" },
      { id: "legal", label: "法律", url: "/pages/legal/legal" },
      { id: "archive", label: "档案", url: "/pages/archive/archive" },
      { id: "community", label: "社群", url: "/pages/community/community" },
      { id: "abroad", label: "域外", url: "/pages/abroad/abroad" },
    ],
  },
  methods: {
    open(event) {
      const url = event.currentTarget.dataset.url;
      if (!url) return;
      wx.reLaunch({ url });
    },
  },
});
