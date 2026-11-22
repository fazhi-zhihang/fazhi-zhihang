function chat(options) {
  const apiKey = options.apiKey;
  const model = options.model || "deepseek-flash";
  return new Promise(function (resolve, reject) {
    if (!apiKey) {
      resolve({ source: "local", text: "" });
      return;
    }
    wx.request({
      url: "https://api.deepseek.com/chat/completions",
      method: "POST",
      timeout: 28000,
      header: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      data: {
        model: model,
        max_tokens: options.maxTokens || 320,
        thinking: { type: "disabled" },
        messages: [
          { role: "system", content: options.system },
          { role: "user", content: options.user },
        ],
      },
      success: function (res) {
        const text = res.data && res.data.choices && res.data.choices[0] && res.data.choices[0].message && res.data.choices[0].message.content;
        if (res.statusCode >= 200 && res.statusCode < 300 && text) resolve({ source: "model", text: text });
        else reject(new Error("DeepSeek " + res.statusCode));
      },
      fail: function (err) {
        reject(err);
      },
    });
  });
}

function isThin(text) {
  const value = (text || "").trim();
  if (value.length < 6) return true;
  return /^(?:哈+|啊+|嗯+|不知道|不会|随便|测试|test|asdf)$/i.test(value);
}

module.exports = { chat, isThin };
