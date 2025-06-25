// --- AES Decryption ---
// 从原始 <script id=aes> 中提取
function removePadding(buffer) {
  const padding = buffer.byteLength && new DataView(buffer).getUint8(buffer.byteLength - 1);
  if (padding) {
    return buffer.slice(0, buffer.byteLength - padding);
  }
  return buffer;
}

class AESDecryptor {
  // 原始的 AESDecryptor 类的完整代码
  // ... (由于代码很长，这里省略，但您应从原始文件中复制 <script id=aes> 的内容到这里)
  // 为了简洁，我们只展示结构
  constructor() {
    this.rcon = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
    this.subMix = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
    this.invSubMix = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
    this.sBox = new Uint32Array(256);
    this.invSBox = new Uint32Array(256);
    this.key = new Uint32Array(0);
    this.initTable();
  }
  uint8ArrayToUint32Array_(i) { let t = new DataView(i), e = new Uint32Array(4); for (let i = 0; i < 4; i++)e[i] = t.getUint32(4 * i); return e }
  initTable() { let i = this.sBox, t = this.invSBox, e = this.subMix, r = e[0], n = e[1], s = e[2], o = e[3], h = this.invSubMix, y = h[0], a = h[1], w = h[2], u = h[3], d = new Uint32Array(256), v = 0, A = 0, l = 0; for (l = 0; l < 256; l++)d[l] = l < 128 ? l << 1 : l << 1 ^ 283; for (l = 0; l < 256; l++) { let e = A ^ A << 1 ^ A << 2 ^ A << 3 ^ A << 4; e = e >>> 8 ^ 255 & e ^ 99, i[v] = e, t[e] = v; let h = d[v], l = d[h], S = d[l], U = 257 * d[e] ^ 16843008 * e; r[v] = U << 24 | U >>> 8, n[v] = U << 16 | U >>> 16, s[v] = U << 8 | U >>> 24, o[v] = U, U = 16843009 * S ^ 65537 * l ^ 257 * h ^ 16843008 * v, y[e] = U << 24 | U >>> 8, a[e] = U << 16 | U >>> 16, w[e] = U << 8 | U >>> 24, u[e] = U, v ? (v = h ^ d[d[d[S ^ h]]], A ^= d[d[A]]) : v = A = 1 } }
  expandKey(i) { let t = this.uint8ArrayToUint32Array_(i), e = !0, r = 0; for (; r < t.length && e;)e = t[r] === this.key[r], r++; if (e) return; this.key = t; let n = this.keySize = t.length; if (4 !== n && 6 !== n && 8 !== n) throw new Error("Invalid aes key size=" + n); let s, o, h, y, a = this.ksRows = 4 * (n + 6 + 1), w = this.keySchedule = new Uint32Array(a), u = this.invKeySchedule = new Uint32Array(a), d = this.sBox, v = this.rcon, A = this.invSubMix, l = A[0], S = A[1], U = A[2], x = A[3]; for (s = 0; s < a; s++)s < n ? h = w[s] = t[s] : (y = h, s % n == 0 ? (y = y << 8 | y >>> 24, y = d[y >>> 24] << 24 | d[y >>> 16 & 255] << 16 | d[y >>> 8 & 255] << 8 | d[255 & y], y ^= v[s / n | 0] << 24) : n > 6 && s % n == 4 && (y = d[y >>> 24] << 24 | d[y >>> 16 & 255] << 16 | d[y >>> 8 & 255] << 8 | d[255 & y]), w[s] = h = (w[s - n] ^ y) >>> 0); for (o = 0; o < a; o++)s = a - o, y = 3 & o ? w[s] : w[s - 4], u[o] = o < 4 || s <= 4 ? y : l[d[y >>> 24]] ^ S[d[y >>> 16 & 255]] ^ U[d[y >>> 8 & 255]] ^ x[d[255 & y]], u[o] = u[o] >>> 0 }
  networkToHostOrderSwap(i) { return i << 24 | (65280 & i) << 8 | (16711680 & i) >> 8 | i >>> 24 }
  decrypt(i, t, e, r) { let n, s, o, h, y, a, w, u, d, v, A, l, S, U, x = this.keySize + 6, c = this.invKeySchedule, f = this.invSBox, k = this.invSubMix, b = k[0], g = k[1], B = k[2], M = k[3], T = this.uint8ArrayToUint32Array_(e), p = T[0], z = T[1], K = T[2], D = T[3], I = new Int32Array(i), _ = new Int32Array(I.length), m = this.networkToHostOrderSwap; for (; t < I.length;) { for (d = m(I[t]), v = m(I[t + 1]), A = m(I[t + 2]), l = m(I[t + 3]), y = d ^ c[0], a = l ^ c[1], w = A ^ c[2], u = v ^ c[3], S = 4, U = 1; U < x; U++)n = b[y >>> 24] ^ g[a >> 16 & 255] ^ B[w >> 8 & 255] ^ M[255 & u] ^ c[S], s = b[a >>> 24] ^ g[w >> 16 & 255] ^ B[u >> 8 & 255] ^ M[255 & y] ^ c[S + 1], o = b[w >>> 24] ^ g[u >> 16 & 255] ^ B[y >> 8 & 255] ^ M[255 & a] ^ c[S + 2], h = b[u >>> 24] ^ g[y >> 16 & 255] ^ B[a >> 8 & 255] ^ M[255 & w] ^ c[S + 3], y = n, a = s, w = o, u = h, S += 4; n = f[y >>> 24] << 24 ^ f[a >> 16 & 255] << 16 ^ f[w >> 8 & 255] << 8 ^ f[255 & u] ^ c[S], s = f[a >>> 24] << 24 ^ f[w >> 16 & 255] << 16 ^ f[u >> 8 & 255] << 8 ^ f[255 & y] ^ c[S + 1], o = f[w >>> 24] << 24 ^ f[u >> 16 & 255] << 16 ^ f[y >> 8 & 255] << 8 ^ f[255 & a] ^ c[S + 2], h = f[u >>> 24] << 24 ^ f[y >> 16 & 255] << 16 ^ f[a >> 8 & 255] << 8 ^ f[255 & w] ^ c[S + 3], S += 3, _[t] = m(n ^ p), _[t + 1] = m(h ^ z), _[t + 2] = m(o ^ K), _[t + 3] = m(s ^ D), p = d, z = v, K = A, D = l, t += 4 } return r ? removePadding(_.buffer) : _.buffer }
  destroy() { this.key = void 0, this.keySize = void 0, this.ksRows = void 0, this.sBox = void 0, this.invSBox = void 0, this.subMix = void 0, this.invSubMix = void 0, this.keySchedule = void 0, this.invKeySchedule = void 0, this.rcon = void 0 }
}


// --- Utility Functions ---

const ajax = (options) => {
  options = options || {};
  const xhr = new XMLHttpRequest();
  if (options.type === 'file') {
    xhr.responseType = 'arraybuffer';
  }

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      const status = xhr.status;
      if (status >= 200 && status < 300) {
        options.success && options.success(xhr.response);
      } else {
        options.fail && options.fail(status);
      }
    }
  };

  xhr.open("GET", options.url, true);
  xhr.send(null);
};

const applyURL = (url, base) => {
  base = base || location.href;
  if (url.indexOf('http') === 0) {
    if (location.href.indexOf('https') === 0) {
      return url.replace('http://', 'https://');
    }
    return url;
  }
  if (url[0] === '/') {
    const domain = base.split('/');
    return domain[0] + '//' + domain[2] + url;
  }
  const path = base.split('/');
  path.pop();
  return path.join('/') + '/' + url;
};

const formatTime = (date, fmt) => {
  const o = {
    'Y': date.getFullYear(),
    'M': date.getMonth() + 1,
    'D': date.getDate(),
    'h': date.getHours(),
    'm': date.getMinutes(),
    's': date.getSeconds(),
  };
  return fmt.replace(/Y+|M+|D+|h+|m+|s+/g, (k) => (new Array(k.length).join('0') + o[k[0]]).substr(-k.length));
};

export default {
  install(app) {
    const utils = {
      ajax,
      applyURL,
      formatTime,
      AESDecryptor,
    };
    
    // 挂载到全局属性，方便模板和 Options API 中使用
    app.config.globalProperties.$downloader = utils;

    // 也提供给 Composition API 使用
    app.provide('downloader', utils);
  }
};