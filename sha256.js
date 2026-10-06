// Small ES5 SHA-256 so the gate works on old TV browsers without WebCrypto.
function sha256(str) {
  var K = [], H = [], primes = 0, isComp = {}, i, j;
  for (var c = 2; primes < 64; c++) {
    if (!isComp[c]) {
      for (i = c * c; i < 313; i += c) isComp[i] = 1;
      if (primes < 8) H[primes] = (Math.pow(c, 0.5) * 4294967296) | 0;
      K[primes++] = (Math.pow(c, 1 / 3) * 4294967296) | 0;
    }
  }
  var bytes = [];
  for (i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i) & 255);
  var bitLen = bytes.length * 8;
  bytes.push(128);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (i = 7; i >= 0; i--) bytes.push(i > 3 ? 0 : (bitLen >>> (i * 8)) & 255);

  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  for (var off = 0; off < bytes.length; off += 64) {
    var w = [];
    for (i = 0; i < 16; i++) {
      j = off + i * 4;
      w[i] = (bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3];
    }
    for (i = 16; i < 64; i++) {
      var s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      var s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    var a = H[0], b = H[1], cc = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (i = 0; i < 64; i++) {
      var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      var ch = (e & f) ^ (~e & g);
      var t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      var maj = (a & b) ^ (a & cc) ^ (b & cc);
      var t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0;
      d = cc; cc = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + cc) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  var hex = "";
  for (i = 0; i < 8; i++) hex += ("00000000" + (H[i] >>> 0).toString(16)).slice(-8);
  return hex;
}
