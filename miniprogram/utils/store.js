const KEY = "fazhi-store";

function load() {
  const data = wx.getStorageSync(KEY) || {};
  return {
    apiKey: data.apiKey || "",
    model: data.model || "deepseek-flash",
    profile: data.profile || { name: "", school: "", major: "法学", grade: "", city: "", langs: "", target: "" },
    sessions: data.sessions || [],
    docs: data.docs || [],
    identity: data.identity || { ready: false, mode: "real", alias: "" },
    posts: data.posts || [],
    columns: data.columns || [],
    videos: data.videos || [],
    devHash: data.devHash || "",
    videoEndpoint: data.videoEndpoint || "",
    videoApiKey: data.videoApiKey || "",
  };
}

function save(patch) {
  const next = Object.assign(load(), patch);
  wx.setStorageSync(KEY, next);
  return next;
}

function socialName(identity, profile) {
  if (!identity || identity.mode === "anon") return "匿名";
  if (identity.mode === "alias") return (identity.alias || "").trim() || "未命名";
  return ((profile && profile.name) || "").trim() || "未填姓名";
}

function spamReason(text) {
  const body = (text || "").trim();
  if (body.length < 80) return "正文至少 80 个字。只丢空文件或一句话，不会送审。";
  const compact = body.replace(/\s/g, "");
  const seen = {};
  for (let i = 0; i < compact.length; i++) seen[compact.charAt(i)] = 1;
  if (Object.keys(seen).length < 6) return "重复字符太多，这篇不会送审。";
  return "";
}

function rotr(x, n) {
  return (x >>> n) | (x << (32 - n));
}

function utf8(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 128) bytes.push(c);
    else if (c < 2048) bytes.push((c >> 6) | 192, (c & 63) | 128);
    else if (c >= 0xd800 && c <= 0xdbff) {
      const c2 = str.charCodeAt(++i);
      const u = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
      bytes.push((u >> 18) | 240, ((u >> 12) & 63) | 128, ((u >> 6) & 63) | 128, (u & 63) | 128);
    } else bytes.push((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128);
  }
  return bytes;
}

function sha256(input) {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const bytes = utf8(input);
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  for (let i = 3; i >= 0; i--) bytes.push((hi >>> (i * 8)) & 255);
  for (let i = 3; i >= 0; i--) bytes.push((lo >>> (i * 8)) & 255);
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const w = new Array(64);
  for (let i = 0; i < bytes.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      const o = i + t * 4;
      w[t] = ((bytes[o] << 24) | (bytes[o + 1] << 16) | (bytes[o + 2] << 8) | bytes[o + 3]) >>> 0;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = (rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3)) >>> 0;
      const s1 = (rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10)) >>> 0;
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let t = 0; t < 64; t++) {
      const s1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (h + s1 + ch + K[t] + w[t]) >>> 0;
      const s0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (s0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0; d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map(function (n) {
    return ("00000000" + n.toString(16)).slice(-8);
  }).join("");
}

module.exports = { load, save, socialName, spamReason, sha256 };
