const store = require("../../utils/store");
const api = require("../../utils/api");

const ROLES = [
  { id: "counsel", photo: "/assets/role-counsel.jpg", title: "企业法务", en: "Corporate Counsel", brief: "合同审查与争议预判", opening: "请用两分钟讲一次你拆过的合同争议：争议点、依据、你建议怎么做。" },
  { id: "ip", photo: "/assets/role-ip.jpg", title: "知识产权专员", en: "IP Specialist", brief: "上线前的权利核查", opening: "一个还没注册的名称要印上包装。上线前你先做哪三件核查？" },
  { id: "compliance", photo: "/assets/role-compliance.jpg", title: "合规与风控", en: "Compliance and Risk", brief: "个人信息与供应商边界", opening: "业务要把用户手机号导出给外部供应商。决定能不能给之前，你问哪几个问题？" },
  { id: "clerk", photo: "/assets/role-clerk.jpg", title: "律师助理", en: "Legal Assistant", brief: "检索、证据、期限", opening: "明天开庭，证据目录还没装订。你今晚先做哪三件事？" },
  { id: "hr", photo: "/assets/role-hr.jpg", title: "人力资源", en: "Human Resources", brief: "公平招聘与试用期", opening: "部门负责人说这个岗位只要男生。你怎么回应，流程上怎么改？" },
  { id: "backend", photo: "/assets/role-backend.jpg", title: "后端工程", en: "Backend Engineer", brief: "接口与一致性", opening: "下单接口偶发重复扣款。你先看哪三类记录，怎么判断是重试还是幂等没做好？" },
  { id: "frontend", photo: "/assets/role-frontend.jpg", title: "前端工程", en: "Frontend Engineer", brief: "状态与弱网", opening: "弱网下简历会被连点提交两次。前端做哪两层防护，哪一层必须后端也做？" },
  { id: "algo", photo: "/assets/role-algo.jpg", title: "算法工程", en: "Algorithm Engineer", brief: "坏案例与目标函数", opening: "人岗匹配把法学生大量推到销售岗。你先怀疑数据、特征还是目标？举一个坏案例。" },
  { id: "data", photo: "/assets/role-data.jpg", title: "数据工程", en: "Data Engineer", brief: "口径、权限、可追溯", opening: "辅导员要导出全院手机号和求职状态。哪些字段可以给，导出要留下什么？" },
  { id: "sec", photo: "/assets/role-sec.jpg", title: "网络安全", en: "Cybersecurity", brief: "账号与日志", opening: "有人把生产库账号发在群里。你的第一反应是什么，事后怎么确认有没有被用过？" },
  { id: "qa", photo: "/assets/role-qa.jpg", title: "测试开发", en: "QA Engineer", brief: "复现与回归", opening: "docx 能传，WPS 另存的文件偶发失败。你怎么写一条能复现的缺陷？" },
  { id: "cross", photo: "/assets/role-cross.jpg", title: "跨境商务", en: "Cross-border Business", brief: "双语条款", opening: "对方把实习写成无薪、随时终止、不得对外提及。用中文指出两个必须改的点，并给一句英文。" },
  { id: "translate", photo: "/assets/role-translate.jpg", title: "商务英语", en: "Business English", brief: "不把法律概念译歪", opening: "请区分竞业限制和保密义务，各给一句你会写进邮件的解释，不要只给单词。" },
  { id: "fintech", photo: "/assets/role-fintech.jpg", title: "金融科技产品", en: "FinTech Product", brief: "收费与招聘边界", opening: "业务想做“付费保 offer”。你怎么拒，或改成什么才可能不踩招聘收费的线？" },
];

function intro(title) {
  return "你好，我是今天的面试官。这场按校招结构化顺序走：自我介绍、求职动机、一道专业题、一个过往事例，最后给你反问。\n\n先请用大约一分钟介绍你自己：你是谁、和「" + title + "」最相关的一段经历、你为什么投这个岗位。不要把简历从头念到尾。";
}

function line(stage, title, skill, held, skipped, closed) {
  if (held) return "我先停一下。刚才这句没有进入当前环节，我也不会把原题再念一遍。请重新说：先给结论，再补一件具体的事。";
  if (closed) return "本场已经结束，我不再提问。请点结束并锁定评测。";
  var lead = skipped ? "上一环节没有有效内容，记为未作答。我们进入下一段。" : "";
  if (stage >= 5) return lead + "今天的面试到此结束。五个环节已经走完，我不再追加问题。请结束并锁定评测。";
  if (stage === 1) return lead + "自我介绍收到。下一问只谈动机：你为什么投「" + title + "」，而不是一个相邻岗位？请说出你为它做过的一件准备。";
  if (stage === 2) return lead + "动机先到这里。专业题只有一道，请直接作答：" + skill;
  if (stage === 3) return lead + "专业题收到。请讲一件你真正做过、和这个岗位有关的事。四句即可：当时的情况、你负责什么、你做了哪一步、结果如何。";
  return lead + "事例先收到。题问完了，现在轮到你。请向我提一个和这个岗位日常工作有关的问题。薪资留到后面，这里先不要问。";
}

const NAMES = ["自我介绍", "求职动机", "专业一题", "过往事例", "你的反问", "结束"];

Page({
  data: { phase: "pick", roles: ROLES, customTitle: "", title: "", stageLabel: "自我介绍", messages: [], draft: "", strikes: 0, stage: 0, thinking: false, summary: "", advice: "", devOn: false, videoEndpoint: "", videoApiKey: "" },
  onShow: function () {
    const app = getApp();
    const saved = store.load();
    this.setData({
      devOn: !!app.globalData.devOn,
      videoEndpoint: saved.videoEndpoint || "",
      videoApiKey: saved.videoApiKey || "",
    });
  },
  onVideoEndpoint: function (e) {
    const videoEndpoint = e.detail.value || "";
    store.save({ videoEndpoint: videoEndpoint });
    this.setData({ videoEndpoint: videoEndpoint });
  },
  onVideoKey: function (e) {
    const videoApiKey = e.detail.value || "";
    store.save({ videoApiKey: videoApiKey });
    this.setData({ videoApiKey: videoApiKey });
  },
  pick: function (event) {
    const ds = event.currentTarget.dataset;
    this.start(ds.title, ds.opening);
  },
  onCustom: function (event) { this.setData({ customTitle: event.detail.value }); },
  startCustom: function () {
    const title = (this.data.customTitle || "").trim();
    if (title.length < 2) { wx.showToast({ title: "先写岗位名", icon: "none" }); return; }
    this.start(title, "我们按「" + title + "」来谈。请举一个你匹配它的具体事例，不要背模板。");
  },
  start: function (title, opening) {
    this.skill = opening;
    this.miss = 0;
    this.setData({
      phase: "chat",
      title: title,
      strikes: 0,
      stage: 0,
      stageLabel: NAMES[0],
      messages: [{ role: "interviewer", content: intro(title) }],
      draft: "",
    });
  },
  onDraft: function (event) { this.setData({ draft: event.detail.value }); },
  send: function () {
    const message = (this.data.draft || "").trim();
    if (!message || this.data.thinking) return;
    const messages = this.data.messages.concat([{ role: "user", content: message }]);
    const thin = api.isThin(message);
    const strikes = this.data.strikes + (thin ? 1 : 0);
    let stage = this.data.stage;
    let miss = this.miss || 0;
    let held = false;
    let skipped = false;
    let closed = false;
    if (stage >= 5) closed = true;
    else if (thin) {
      miss += 1;
      if (miss >= 2) {
        stage += 1;
        miss = 0;
        skipped = true;
      } else held = true;
    } else {
      stage += 1;
      miss = 0;
    }
    this.miss = miss;
    const local = line(stage, this.data.title, this.skill || "", held, skipped, closed);
    this.setData({ messages: messages, draft: "", thinking: true, strikes: strikes, stage: stage, stageLabel: NAMES[Math.min(stage, 5)] });
    const saved = store.load();
    const history = messages.map(function (item) { return (item.role === "user" ? "候选人：" : "面试官：") + item.content; }).join("\n");
    api.chat({
      apiKey: saved.apiKey,
      model: saved.model,
      system: "你是校招面试官。整场只有自我介绍、动机、一道专业题、一个事例、候选人反问，然后必须结束，禁止加题。本轮请完成这段任务，用自己的话，不要改环节：" + local,
      user: history,
    }).then((res) => {
      let text = res.source === "model" && res.text ? res.text : local;
      if ((stage >= 5 || closed) && /[?？]/.test(text)) text = local;
      this.setData({ thinking: false, messages: this.data.messages.concat([{ role: "interviewer", content: text }]) });
    }).catch(() => {
      this.setData({ thinking: false, messages: this.data.messages.concat([{ role: "interviewer", content: local }]) });
    });
  },
  finish: function () {
    const users = this.data.messages.filter(function (item) { return item.role === "user"; });
    if (!users.length) return;
    const saved = store.load();
    const history = this.data.messages.map(function (item) { return (item.role === "user" ? "候选人：" : "面试官：") + item.content; }).join("\n");
    this.setData({ thinking: true });
    api.chat({
      apiKey: saved.apiKey,
      model: saved.model,
      maxTokens: 480,
      system: "根据面试给两句总评和一句改进建议。敷衍要明确写出来。不要给高分式客气话。",
      user: "岗位：" + this.data.title + "\n无效次数：" + this.data.strikes + "\n" + history,
    }).then((res) => {
      const text = res.text || "有效内容不足。下一场每一答都要带一个条款、日志或你亲自做过的步骤。";
      this.setData({ thinking: false, phase: "report", summary: text, advice: "系统记录将锁定，不能回改。" });
    }).catch(() => {
      this.setData({ thinking: false, phase: "report", summary: "本地记录：无效回答 " + this.data.strikes + " 次。", advice: "填好密钥后可改为 DeepSeek 评测。" });
    });
  },
  lock: function () {
    const saved = store.load();
    const sessions = [{ title: this.data.title, summary: this.data.summary, advice: this.data.advice, at: Date.now(), locked: true }].concat(saved.sessions).slice(0, 16);
    store.save({ sessions: sessions });
    wx.showToast({ title: "已锁定进档案" });
    this.setData({ phase: "pick", messages: [] });
  },
});
