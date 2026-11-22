const store = require("../../utils/store");
const api = require("../../utils/api");

Page({
  data: {
    question: "",
    answer: "",
    fileName: "",
    quizNote: "",
    sources: false,
    laws: [
      { title: "劳动合同法", point: "书面合同、试用期上限、竞业按月补偿、未签书面合同的二倍工资风险。", href: "https://flk.npc.gov.cn/", label: "国家法律法规数据库" },
      { title: "劳动法", point: "工时、工资按月支付、休息休假。口头“加班自愿”不等于没有报酬。", href: "https://flk.npc.gov.cn/", label: "国家法律法规数据库" },
      { title: "就业促进法", point: "公平就业。与岗位无关的性别、婚育限制不能写成录用条件。", href: "https://flk.npc.gov.cn/", label: "国家法律法规数据库" },
      { title: "劳动争议调解仲裁法", point: "多数劳动争议先仲裁。时效一般一年；拖欠工资在职期间另有规则。", href: "https://flk.npc.gov.cn/", label: "国家法律法规数据库" },
      { title: "社会保险法", point: "单位应自行申报并按时足额缴纳。转正后再交，不等于此前没有用工事实。", href: "https://flk.npc.gov.cn/", label: "国家法律法规数据库" },
      { title: "个人信息保护法", point: "手机号导出要目的明确、最小必要，跨境另有条件。", href: "http://www.npc.gov.cn/", label: "中国人大网" },
      { title: "数据安全法", point: "账号、日志和导出要留痕。群里出现的生产口令视为已经泄露。", href: "https://flk.npc.gov.cn/", label: "国家法律法规数据库" },
      { title: "人社与最高法", point: "政策看人社部，司法解释看最高人民法院，公开裁判到裁判文书网核对。", href: "https://www.mohrss.gov.cn/", label: "人力资源社会保障部" },
      { title: "12333 / 12348", point: "人社服务与法律援助。先留证，再问受理范围。", href: "https://www.12348.gov.cn/", label: "中国法律服务网" },
      { title: "论文检索", point: "到国家哲社文献中心用“劳动合同”“就业歧视”“竞业限制”检索，不要编造篇名。", href: "https://www.ncpssd.org/", label: "国家哲社文献中心" },
    ],
    links: [
      { label: "微博热搜", href: "https://s.weibo.com/top/summary", note: "当日榜。广场里不跳转" },
      { label: "百度热搜", href: "https://top.baidu.com/board", note: "当日榜。广场里不跳转" },
      { label: "国家法律法规数据库", href: "https://flk.npc.gov.cn/", note: "查现行法律全文" },
      { label: "中国人大网", href: "https://www.npc.gov.cn/", note: "立法文本" },
      { label: "人力资源社会保障部", href: "https://www.mohrss.gov.cn/", note: "劳动用工政策" },
      { label: "中国裁判文书网", href: "https://wenshu.court.gov.cn/", note: "检索公开裁判" },
      { label: "中国法律服务网", href: "https://www.12348.gov.cn/", note: "法律援助指引" },
    ],
  },
  openSources: function () { this.setData({ sources: true }); },
  closeSources: function () { this.setData({ sources: false }); },
  onQ: function (e) { this.setData({ question: e.detail.value }); },
  open: function (e) { wx.setClipboardData({ data: e.currentTarget.dataset.url }); },
  choose: function () {
    wx.chooseMessageFile({
      count: 1,
      type: "file",
      extension: ["pdf", "doc", "docx", "wps"],
      success: (res) => {
        const file = res.tempFiles && res.tempFiles[0];
        this.setData({ fileName: file ? file.name : "已选择" });
      },
    });
  },
  ask: function () {
    const question = (this.data.question || "").trim();
    if (question.length < 2) return;
    const saved = store.load();
    const local = "先分清对方是谁、要你做什么、你留下了什么记录。具体程序看用工身份，可问学校法律援助、12333 或 12348。本回答仅供学习参考，不构成法律意见。";
    api.chat({
      apiKey: saved.apiKey,
      model: saved.model,
      maxTokens: 420,
      system: "你是就业法律素养助手。依据劳动合同法、就业促进法、个人信息保护法作原则说明。不要编造案号。结尾声明不构成法律意见。不超过220字。",
      user: question,
    }).then((res) => {
      this.setData({ answer: res.text || local });
    }).catch(() => this.setData({ answer: local }));
  },
  quiz: function (e) {
    const ok = e.currentTarget.dataset.ok === "1" || e.currentTarget.dataset.ok === 1;
    this.setData({ quizNote: ok ? "对。一年以上不满三年的，试用期不得超过二个月。" : "不对。签字不能把超长试用期变成合法约定。" });
  },
});
