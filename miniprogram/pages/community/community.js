const store = require("../../utils/store");
const app = getApp();

const ZONES = [
  { id: "contract", title: "未签书面合同", en: "Missing written contract", blurb: "事实劳动关系、二倍工资", keys: ["合同", "劳动", "入职", "签约"], note: "用工之日起应当订立书面劳动合同。超过一个月未签，可能涉及二倍工资。" },
  { id: "probation", title: "试用期与解除", en: "Probation and dismissal", blurb: "超长试用、违法解除", keys: ["试用", "辞退", "解雇", "裁员", "解除"], note: "试用期长度看合同期限，同一单位只能约定一次。" },
  { id: "hours", title: "加班与工时", en: "Overtime and hours", blurb: "自愿加班、调休", keys: ["加班", "996", "工时", "调休"], note: "群里一句自愿不能单独取消加班报酬。" },
  { id: "wage", title: "工资与补偿", en: "Wages and severance", blurb: "拖欠、克扣、补偿", keys: ["工资", "欠薪", "补偿", "赔偿"], note: "工资应当以货币按月支付。先分清是哪一种解除。" },
  { id: "noncompete", title: "竞业与保密", en: "Non-compete", blurb: "未补偿竞业", keys: ["竞业", "保密", "跳槽"], note: "竞业限制应按月给经济补偿。只限制、不补偿，不要直接签。" },
  { id: "bias", title: "就业歧视", en: "Hiring discrimination", blurb: "性别、婚育、地域", keys: ["歧视", "女生", "婚育", "户籍"], note: "与岗位无关的性别、婚育限制不能写成录用条件。" },
  { id: "intern", title: "实习与兼职", en: "Internship", blurb: "事实用工、随时终止", keys: ["实习", "兼职", "无薪"], note: "在校实习不等于当然不适用劳动规则。" },
  { id: "privacy", title: "个人信息与背调", en: "Personal data", blurb: "手机号、过度采集", keys: ["隐私", "个人信息", "手机号", "背调"], note: "招聘采集要最小必要。跨境提供另有条件。" },
  { id: "insure", title: "社保与工伤", en: "Insurance and injury", blurb: "不缴社保、实习受伤", keys: ["社保", "工伤", "公积金"], note: "约定工资里已含社保，不能代替申报缴纳。" },
];

const SECTION_NAME = { post: "帖子", hot: "热搜", column: "专栏", video: "视频" };
const SECTION_EN = { post: "Posts", hot: "Hot", column: "Columns", video: "Videos" };

function zoneById(id) {
  for (let i = 0; i < ZONES.length; i++) if (ZONES[i].id === id) return ZONES[i];
  return null;
}

function boardHits(list, zone) {
  if (!zone) return [];
  return (list || []).filter(function (item) {
    return zone.keys.some(function (key) { return String(item.title || "").indexOf(key) >= 0; });
  });
}

function hotBackdrop() {
  return "/assets/sky.jpg";
}

function hotStyle(id, hits) {
  return "background-image:url(" + hotBackdrop(id, hits) + ");background-size:cover;background-position:center top;";
}

function httpsItem(title, href, heat, source) {
  const name = String(title || "").trim().slice(0, 42);
  const link = String(href || "").trim();
  if (name.length < 2 || link.indexOf("https://") !== 0) return null;
  return { title: name, href: link, heat: String(heat || "").slice(0, 16), source: source };
}

function shape(page) {
  const posts = page.data.posts || [];
  const q = (page.data.query || "").trim().toLowerCase();
  const sort = page.data.sort || "new";
  let visible = posts.filter(function (post) { return !post.hidden; });
  if (q) {
    visible = visible.filter(function (post) {
      return ((post.text || "") + "\n" + (post.topic || "") + "\n" + (post.author || "")).toLowerCase().indexOf(q) >= 0;
    });
  }
  visible = visible.slice().sort(function (a, b) {
    if (sort === "likes") return (b.likes || 0) - (a.likes || 0) || (b.at || 0) - (a.at || 0);
    if (sort === "views") return (b.views || 0) - (a.views || 0) || (b.at || 0) - (a.at || 0);
    return (b.at || 0) - (a.at || 0);
  });
  let praised = posts.filter(function (post) {
    if (post.hidden || (post.likes || 0) < 1) return false;
    if (page.data.level === "detail" && page.data.zone && post.topic !== page.data.zone) return false;
    return true;
  }).slice().sort(function (a, b) { return (b.likes || 0) - (a.likes || 0); }).slice(0, 5);
  if (page.data.level === "detail" && page.data.zone) {
    const zone = page.data.zone;
    visible = visible.filter(function (post) { return post.topic === zone; });
  }
  const name = page.data.name;
  const columns = page.data.columns || [];
  const videos = page.data.videos || [];
  const zone = page.data.level === "detail" ? page.data.zone : "";
  return {
    visible: visible,
    praised: praised,
    liveColumns: columns.filter(function (item) { return item.status === "live" && (!zone || item.zone === zone); }),
    mineColumns: columns.filter(function (item) { return item.author === name && item.status !== "live"; }),
    liveVideos: videos.filter(function (item) { return item.status === "live" && (!zone || item.zone === zone); }),
    mineVideos: videos.filter(function (item) { return item.author === name && item.status !== "live"; }),
  };
}

Page({
  data: {
    pane: "feed",
    level: "hub",
    section: "post",
    sectionTitle: "帖子",
    sectionEn: "Posts",
    zone: "",
    zoneTitle: "",
    zoneEn: "",
    zoneNote: "",
    zones: ZONES,
    compose: false,
    hotHits: [],
    hotBg: "/assets/pro.jpg",
    hotStyle: "",
    ready: false,
    mode: "real",
    alias: "",
    name: "",
    topic: "",
    draft: "",
    comment: "",
    openId: "",
    query: "",
    sort: "new",
    posts: [],
    visible: [],
    praised: [],
    weibo: [],
    baidu: [],
    hotNote: "打开热搜后读取今天的微博和百度。",
    columns: [],
    videos: [],
    liveColumns: [],
    mineColumns: [],
    liveVideos: [],
    mineVideos: [],
    colTitle: "",
    colBody: "",
    imagePath: "",
    vidTitle: "",
    vidNote: "",
    videoPath: "",
    devOn: false,
    hint: "",
  },
  onShow: function () {
    const saved = store.load();
    const identity = saved.identity || { ready: false, mode: "real", alias: "" };
    this.setData(Object.assign({
      ready: !!identity.ready,
      mode: identity.mode || "real",
      alias: identity.alias || "",
      name: store.socialName(identity, saved.profile),
      posts: saved.posts || [],
      columns: saved.columns || [],
      videos: saved.videos || [],
      devOn: !!app.globalData.devOn,
    }, {}));
    this.setData(shape(this));
  },
  setMode: function (e) { this.setData({ mode: e.currentTarget.dataset.mode }); },
  onAlias: function (e) { this.setData({ alias: e.detail.value }); },
  confirm: function () {
    if (this.data.mode === "alias" && !(this.data.alias || "").trim()) {
      wx.showToast({ title: "先写身份名", icon: "none" });
      return;
    }
    const saved = store.load();
    const identity = { ready: true, mode: this.data.mode, alias: (this.data.alias || "").trim() };
    store.save({ identity: identity });
    this.setData({ ready: true, name: store.socialName(identity, saved.profile) });
    this.setData(shape(this));
  },
  edit: function () { this.setData({ ready: false }); },
  openSection: function (e) {
    const section = e.currentTarget.dataset.section;
    this.setData({
      level: "zones",
      section: section,
      sectionTitle: SECTION_NAME[section] || "",
      sectionEn: SECTION_EN[section] || "",
      compose: false,
    });
    if (section === "hot") this.loadHot();
  },
  openZone: function (e) {
    const zone = zoneById(e.currentTarget.dataset.id);
    if (!zone) return;
    const hits = boardHits(this.data.weibo, zone).concat(boardHits(this.data.baidu, zone));
    this.setData({
      level: "detail",
      zone: zone.id,
      zoneTitle: zone.title,
      zoneEn: zone.en,
      zoneNote: zone.note,
      compose: false,
      hotHits: hits,
      hotBg: hotBackdrop(zone.id, hits),
      hotStyle: hotStyle(zone.id, hits),
    });
    this.setData(shape(this));
  },
  openReview: function () { this.setData({ level: "review" }); },
  back: function () {
    if (this.data.level === "detail") this.setData({ level: "zones", compose: false });
    else this.setData({ level: "hub", compose: false });
  },
  toggleCompose: function () { this.setData({ compose: !this.data.compose }); },
  tab: function (e) {
    const pane = e.currentTarget.dataset.pane;
    this.setData({ pane: pane });
    if (pane === "hot") this.loadHot();
  },
  loadHot: function () {
    const that = this;
    that.setData({ hotNote: "正在读取今天的微博和百度热搜…" });
    wx.request({
      url: "https://dabenshi.cn/other/api/hot.php?type=weibo",
      success: function (res) {
        const rows = (res.data && res.data.data) || [];
        const weibo = [];
        rows.forEach(function (item) {
          const next = httpsItem(item.title, item.url, item.hot, "微博");
          if (next && weibo.length < 8) weibo.push(next);
        });
        const at = (res.data && res.data.update_time) || "";
        const zone = zoneById(that.data.zone);
        const hits = boardHits(weibo, zone).concat(boardHits(that.data.baidu, zone));
        that.setData({
          weibo: weibo,
          hotHits: hits,
          hotBg: hotBackdrop(zone ? zone.id : "", hits),
          hotStyle: hotStyle(zone ? zone.id : "", hits),
          hotNote: (weibo.length ? "微博更新于 " + at : "微博榜这次没有取到") + " · " + (that.data.baidu.length ? "百度实时榜已更新" : "百度榜读取中"),
        });
      },
      fail: function () { that.setData({ weibo: [], hotNote: "微博榜这次没有取到" }); },
    });
    wx.request({
      url: "https://top.baidu.com/api/board?platform=wise&tab=realtime",
      success: function (res) {
        const cards = res.data && res.data.data && res.data.data.cards;
        const rows = (cards && cards[0] && cards[0].content && cards[0].content[0] && cards[0].content[0].content) || [];
        const baidu = [];
        rows.forEach(function (item) {
          const next = httpsItem(item.word, item.url, item.hotScore, "百度");
          if (next && baidu.length < 8) baidu.push(next);
        });
        const zone = zoneById(that.data.zone);
        const hits = boardHits(that.data.weibo, zone).concat(boardHits(baidu, zone));
        that.setData({
          baidu: baidu,
          hotHits: hits,
          hotBg: hotBackdrop(zone ? zone.id : "", hits),
          hotStyle: hotStyle(zone ? zone.id : "", hits),
          hotNote: (that.data.weibo.length ? "微博榜已更新" : "微博榜这次没有取到") + " · " + (baidu.length ? "百度实时榜已更新" : "百度榜这次没有取到"),
        });
      },
      fail: function () {
        that.setData({ baidu: [], hotNote: (that.data.hotNote || "") + " · 百度榜这次没有取到" });
      },
    });
  },
  pickHot: function (e) {
    this.setData({ query: e.currentTarget.dataset.title || "", pane: "feed" });
    this.setData(shape(this));
  },
  onQuery: function (e) { this.setData({ query: e.detail.value }); this.setData(shape(this)); },
  setSort: function (e) { this.setData({ sort: e.currentTarget.dataset.sort }); this.setData(shape(this)); },
  onTopic: function (e) { this.setData({ topic: e.detail.value }); },
  onDraft: function (e) { this.setData({ draft: e.detail.value }); },
  onComment: function (e) { this.setData({ comment: e.detail.value }); },
  publish: function () {
    const text = (this.data.draft || "").trim();
    if (text.length < 2) return;
    const saved = store.load();
    const post = {
      id: Date.now() + "",
      author: store.socialName(saved.identity, saved.profile),
      topic: this.data.zone,
      text: text,
      likes: 0,
      liked: false,
      comments: [],
      views: 0,
      hidden: false,
      at: Date.now(),
    };
    const posts = [post].concat(saved.posts || []).slice(0, 40);
    store.save({ posts: posts });
    this.setData({ posts: posts, draft: "" });
    this.setData(shape(this));
  },
  like: function (e) {
    const id = e.currentTarget.dataset.id;
    const posts = this.data.posts.map(function (post) {
      if (post.id !== id) return post;
      const liked = !post.liked;
      return Object.assign({}, post, { liked: liked, likes: liked ? post.likes + 1 : Math.max(0, post.likes - 1) });
    });
    store.save({ posts: posts });
    this.setData({ posts: posts });
    this.setData(shape(this));
  },
  toggle: function (e) {
    const id = e.currentTarget.dataset.id;
    const opening = this.data.openId !== id;
    const posts = this.data.posts.map(function (post) {
      if (!opening || post.id !== id) return post;
      return Object.assign({}, post, { views: (post.views || 0) + 1 });
    });
    store.save({ posts: posts });
    this.setData({ posts: posts, openId: opening ? id : "", comment: "" });
    this.setData(shape(this));
  },
  reply: function (e) {
    const id = e.currentTarget.dataset.id;
    const text = (this.data.comment || "").trim();
    if (!text) return;
    const saved = store.load();
    const author = store.socialName(saved.identity, saved.profile);
    const posts = this.data.posts.map(function (post) {
      if (post.id !== id) return post;
      const comments = (post.comments || []).concat([{ id: Date.now() + "", author: author, text: text }]);
      return Object.assign({}, post, { comments: comments });
    });
    store.save({ posts: posts });
    this.setData({ posts: posts, comment: "" });
    this.setData(shape(this));
  },
  remove: function (e) {
    const id = e.currentTarget.dataset.id;
    const posts = this.data.posts.filter(function (post) { return post.id !== id; });
    store.save({ posts: posts });
    this.setData({ posts: posts });
    this.setData(shape(this));
  },
  hidePost: function (e) {
    const id = e.currentTarget.dataset.id;
    const hidden = e.currentTarget.dataset.hidden !== "1" && e.currentTarget.dataset.hidden !== true;
    const posts = this.data.posts.map(function (post) {
      if (post.id !== id) return post;
      return Object.assign({}, post, { hidden: hidden });
    });
    store.save({ posts: posts });
    this.setData({ posts: posts });
    this.setData(shape(this));
  },
  onColTitle: function (e) { this.setData({ colTitle: e.detail.value }); },
  onColBody: function (e) { this.setData({ colBody: e.detail.value }); },
  pickImage: function () {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      success: function (res) {
        const file = res.tempFiles[0];
        if (file.size > 2 * 1024 * 1024) {
          wx.showToast({ title: "图片小于 2MB", icon: "none" });
          return;
        }
        const dest = wx.env.USER_DATA_PATH + "/img-" + Date.now() + ".jpg";
        wx.getFileSystemManager().saveFile({
          tempFilePath: file.tempFilePath,
          filePath: dest,
          success: function () { that.setData({ imagePath: dest, hint: "图片已附上。" }); },
        });
      },
    });
  },
  pickDoc: function () {
    const that = this;
    wx.chooseMessageFile({
      count: 1,
      type: "file",
      extension: ["pdf", "doc", "docx", "wps"],
      success: function (res) {
        const file = res.tempFiles[0];
        const extra = "\n（已选择文件 " + file.name + "。小程序里不能抽出正文，请把你的判断写进上面的正文。）";
        that.setData({ colBody: ((that.data.colBody || "") + extra).slice(0, 4000), hint: "文件名已记上。请自己写判断，不要只丢文件。" });
        if ((that.data.colTitle || "").trim().length < 4) {
          that.setData({ colTitle: file.name.replace(/\.[^.]+$/, "").slice(0, 32) });
        }
      },
    });
  },
  sendColumn: function () {
    const title = (this.data.colTitle || "").trim();
    const body = (this.data.colBody || "").trim();
    if (title.length < 4) { this.setData({ hint: "标题至少 4 个字" }); return; }
    const reason = store.spamReason(body);
    if (reason) { this.setData({ hint: reason }); return; }
    const saved = store.load();
    const author = store.socialName(saved.identity, saved.profile);
    const columns = saved.columns || [];
    const mine = columns.filter(function (item) { return item.author === author && item.status !== "hidden"; });
    if (mine.length >= 6) { this.setData({ hint: "每人最多保留 6 篇专栏" }); return; }
    const piece = {
      id: Date.now() + "",
      author: author,
      title: title.slice(0, 32),
      body: body.slice(0, 4000),
      imagePath: this.data.imagePath || "",
      zone: this.data.zone,
      status: "pending",
      at: Date.now(),
    };
    const next = [piece].concat(columns).slice(0, 40);
    store.save({ columns: next });
    this.setData({ columns: next, colTitle: "", colBody: "", imagePath: "", hint: "已送审。通过前不会公开。" });
    this.setData(shape(this));
  },
  onVidTitle: function (e) { this.setData({ vidTitle: e.detail.value }); },
  onVidNote: function (e) { this.setData({ vidNote: e.detail.value }); },
  pickVideo: function () {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ["video"],
      success: function (res) {
        const file = res.tempFiles[0];
        if (file.size > 18 * 1024 * 1024) {
          wx.showToast({ title: "视频小于 18MB", icon: "none" });
          return;
        }
        const dest = wx.env.USER_DATA_PATH + "/vid-" + Date.now() + ".mp4";
        wx.getFileSystemManager().saveFile({
          tempFilePath: file.tempFilePath,
          filePath: dest,
          success: function () { that.setData({ videoPath: dest, hint: "视频已选好。填写标题和说明后送审。" }); },
          fail: function () { that.setData({ hint: "视频没有保存下来。" }); },
        });
      },
    });
  },
  sendVideo: function () {
    const title = (this.data.vidTitle || "").trim();
    if (title.length < 2) { this.setData({ hint: "先写视频标题" }); return; }
    if (!this.data.videoPath) { this.setData({ hint: "还没有视频文件" }); return; }
    const saved = store.load();
    const author = store.socialName(saved.identity, saved.profile);
    const videos = saved.videos || [];
    const mine = videos.filter(function (item) { return item.author === author && item.status !== "hidden"; });
    if (mine.length >= 4) { this.setData({ hint: "每人最多 4 条视频" }); return; }
    const piece = {
      id: Date.now() + "",
      author: author,
      title: title.slice(0, 32),
      note: (this.data.vidNote || "").trim().slice(0, 200),
      videoPath: this.data.videoPath,
      zone: this.data.zone,
      status: "pending",
      at: Date.now(),
    };
    const next = [piece].concat(videos).slice(0, 24);
    store.save({ videos: next });
    this.setData({ videos: next, vidTitle: "", vidNote: "", videoPath: "", hint: "已送审。通过前不会公开播放。" });
    this.setData(shape(this));
  },
  setColumnStatus: function (e) {
    const id = e.currentTarget.dataset.id;
    const status = e.currentTarget.dataset.status;
    const columns = this.data.columns.map(function (item) {
      return item.id === id ? Object.assign({}, item, { status: status }) : item;
    });
    store.save({ columns: columns });
    this.setData({ columns: columns });
    this.setData(shape(this));
  },
  setVideoStatus: function (e) {
    const id = e.currentTarget.dataset.id;
    const status = e.currentTarget.dataset.status;
    const videos = this.data.videos.map(function (item) {
      return item.id === id ? Object.assign({}, item, { status: status }) : item;
    });
    store.save({ videos: videos });
    this.setData({ videos: videos });
    this.setData(shape(this));
  },
});
