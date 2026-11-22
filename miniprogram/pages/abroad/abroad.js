const PAIRS = [
  { id: "atwill", title: "书面合同与雇佣随意", en: "Written contract and at-will", cn: "内地用工应当订立书面劳动合同。不能用一封英文 offer 把关系说成随时可以无理由结束。", foreign: "美国多数州是 at-will，仍受歧视法和裁员通知限制。英国普通不当解雇一般还要看连续受雇是否满资格期。", ask: "Is this engagement a fixed-term contract, or employment at will?" },
  { id: "noncompete", title: "竞业限制", en: "Post-employment non-compete", cn: "竞业限制限于负有保密义务的人员，并应按月给经济补偿。", foreign: "美国加州原则上否定雇佣后的竞业。德国离职后竞业通常要有补偿。不要把一个法域的句子译进另一份合同。", ask: "Will the non-compete be paid, and where is it enforced?" },
  { id: "intern", title: "无薪实习", en: "Unpaid internship", cn: "接受管理、做实际业务、按月拿报酬时，要先核对是不是事实用工。", foreign: "美国盈利机构的无薪实习要看实习生是不是主要受益者。香港学生实习豁免最低工资有单独条件。", ask: "Is this internship paid, and which statute decides if it is employment?" },
  { id: "hours", title: "工时与加班", en: "Working time", cn: "标准工时一般每日八小时、每周四十小时。自愿两个字不能单独取消报酬。", foreign: "欧盟以每周平均四十八小时为常见上限。美国联邦法主要给非豁免雇员加班费，没有同样的每日上限。", ask: "Am I overtime-exempt, and what weekly limit applies?" },
  { id: "dismiss", title: "解雇保护", en: "Dismissal and severance", cn: "协商解除、违法解除、到期不续，补偿不是同一档。", foreign: "英国不当解雇看公平理由和程序。美国 at-will 之外，歧视、报复和大规模裁员仍可能担责。", ask: "If the role ends early, is notice or severance required?" },
  { id: "data", title: "个人信息跨境", en: "Cross-border personal data", cn: "把候选人名单提供到境外，可能要单独同意、标准合同或安全评估。", foreign: "欧盟常见工具是充分性认定或标准合同条款。香港跨境条文长期未全面生效，不等于可以把名单随意带出去。", ask: "Where will my résumé be stored, and what transfer tool do you use?" },
  { id: "offer", title: "录用通知与劳动合同", en: "Offer letter", cn: "录用通知不能代替一个月内应当订立的书面劳动合同。", foreign: "英美 offer 有时本身就是合同，有时写明以正式合同为准。签证和工作许可通常是生效条件。", ask: "Does this offer bind us now, or is it subject to a later contract?" },
  { id: "bias", title: "招聘歧视", en: "Hiring discrimination", cn: "与岗位无关的性别、婚育限制不能写成录用条件。先保存招聘原文。", foreign: "美国 Title VII 覆盖种族、肤色、宗教、性别和来源国。英国平等法还有年龄、残疾、怀孕等受保护特征。", ask: "Which personal information on this form is required for the job?" },
];

const LAWS = [
  { id: "bpc-16600", title: "加州禁止雇佣竞业", en: "Cal. Bus. & Prof. Code § 16600", place: "美国加利福尼亚州", text: "Except as provided in this chapter, every contract by which anyone is restrained from engaging in a lawful profession, trade, or business of any kind is to that extent void. This section shall be read broadly to void any noncompete agreement in an employment context that does not satisfy an exception in this chapter.", use: "不要把加州竞业译成按月补偿就有效。" },
  { id: "flsa-207", title: "美国加班", en: "29 U.S.C. § 207(a)(1)", place: "美国联邦", text: "No employer shall employ any employee for a workweek longer than forty hours unless that employee receives compensation of at least one and one-half times the regular rate.", use: "先问是不是豁免雇员，再和内地每日工时分开。" },
  { id: "flsa-intern", title: "美国无薪实习", en: "DOL Fact Sheet #71", place: "美国联邦", text: "The primary beneficiary test looks at expectation of pay, training similar to education, a tie to a formal program, academic commitments, a limited learning period, whether the work complements rather than displaces paid employees, and whether a paid job is promised.", use: "盈利机构的 unpaid internship 要用这组因素问，不能只接受“这是学习”。" },
  { id: "wtd-6", title: "欧盟每周工时", en: "Directive 2003/88/EC, Art. 6", place: "欧盟", text: "Member States shall ensure that average working time for each seven-day period, including overtime, does not exceed 48 hours.", use: "先看每周平均四十八小时，再看该国能否选择退出。" },
  { id: "era-94", title: "英国不被不当解雇", en: "Employment Rights Act 1996, s. 94", place: "英国", text: "An employee has the right not to be unfairly dismissed by his employer.", use: "这只是权利本身。理由和程序看第 98 条。" },
  { id: "era-98", title: "英国解雇是否公平", en: "Employment Rights Act 1996, s. 98", place: "英国", text: "It is for the employer to show the reason for the dismissal and that it is a permitted or substantial reason. Fairness then depends on whether the employer acted reasonably, judged with equity and the substantial merits of the case.", use: "不要把 severance 直接换成 N 或 2N。" },
  { id: "gdpr-44", title: "欧盟数据跨境", en: "GDPR Article 44", place: "欧盟", text: "A transfer of personal data to a third country or an international organisation shall take place only if the conditions in this Chapter are complied with, so that the level of protection is not undermined.", use: "简历传到欧盟以外，先问充分性认定或标准合同条款。" },
];

Page({
  data: { pairs: PAIRS, laws: LAWS, open: null, current: null, library: false, law: null, query: "" },
  open: function (e) {
    const id = e.currentTarget.dataset.id;
    const current = PAIRS.filter(function (item) { return item.id === id; })[0] || null;
    this.setData({ open: id, current: current });
  },
  close: function () { this.setData({ open: null, current: null }); },
  showLibrary: function () { this.setData({ library: true, law: null, query: "" }); },
  hideLibrary: function () { this.setData({ library: false, law: null, query: "" }); },
  onQuery: function (e) { this.setData({ query: e.detail.value || "" }); },
  openLaw: function (e) {
    const id = e.currentTarget.dataset.id;
    const law = LAWS.filter(function (item) { return item.id === id; })[0] || null;
    this.setData({ law: law });
  },
  closeLaw: function () { this.setData({ law: null }); },
});

