/// Pure Motoko SHA-256 implementation.
/// Returns the lowercase hex-encoded SHA-256 digest of a Text (UTF-8 encoded).
import Nat8   "mo:core/Nat8";
import Nat32  "mo:core/Nat32";
import Array  "mo:core/Array";
import Text   "mo:core/Text";
import Blob   "mo:core/Blob";

module {

  // ── Round constants ───────────────────────────────────────────────────────

  private let K : [Nat32] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  // ── Bitwise helpers ───────────────────────────────────────────────────────

  private func rotr(x : Nat32, n : Nat32) : Nat32 {
    (x >> n) | (x << (32 -% n))
  };

  private func ch(x : Nat32, y : Nat32, z : Nat32) : Nat32 {
    (x & y) ^ (^x & z)
  };

  private func maj(x : Nat32, y : Nat32, z : Nat32) : Nat32 {
    (x & y) ^ (x & z) ^ (y & z)
  };

  private func ep0(x : Nat32) : Nat32 {
    rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22)
  };

  private func ep1(x : Nat32) : Nat32 {
    rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25)
  };

  private func sig0(x : Nat32) : Nat32 {
    rotr(x, 7) ^ rotr(x, 18) ^ (x >> 3)
  };

  private func sig1(x : Nat32) : Nat32 {
    rotr(x, 17) ^ rotr(x, 19) ^ (x >> 10)
  };

  // ── Big-endian byte helpers ───────────────────────────────────────────────

  /// Write `value` as big-endian 8 bytes into `buf` starting at `offset`.
  private func writeBE64(buf : [var Nat8], offset : Nat, value : Nat) {
    buf[offset]     := Nat8.fromNat((value / 0x100000000000000) % 256);
    buf[offset + 1] := Nat8.fromNat((value / 0x1000000000000)   % 256);
    buf[offset + 2] := Nat8.fromNat((value / 0x10000000000)     % 256);
    buf[offset + 3] := Nat8.fromNat((value / 0x100000000)       % 256);
    buf[offset + 4] := Nat8.fromNat((value / 0x1000000)         % 256);
    buf[offset + 5] := Nat8.fromNat((value / 0x10000)           % 256);
    buf[offset + 6] := Nat8.fromNat((value / 0x100)             % 256);
    buf[offset + 7] := Nat8.fromNat( value                      % 256);
  };

  // ── SHA-256 core ──────────────────────────────────────────────────────────

  /// Compute SHA-256 of raw bytes. Returns 32-byte digest.
  public func hashBytes(input : [Nat8]) : [Nat8] {
    let len = input.size();
    let bitLen = len * 8;

    // Padding: message || 0x80 || zeros || 8-byte big-endian bit-length
    // paddedLen ≡ 0 (mod 64) and original+1 ≡ 56 (mod 64) before length
    let zeroCount : Nat = (55 + 64 - (len % 64)) % 64;
    let paddedLen = len + 1 + zeroCount + 8;

    let msg : [var Nat8] = Array.tabulate<Nat8>(paddedLen, func _ = 0).toVarArray();
    // Copy input
    var i = 0;
    while (i < len) { msg[i] := input[i]; i += 1 };
    // Append 0x80
    msg[len] := 0x80;
    // Zero bytes are already 0
    // Write bit length as big-endian 64-bit
    writeBE64(msg, paddedLen - 8, bitLen);

    // Initial hash values (H0..H7)
    let h : [var Nat32] = [var
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ];

    // Message schedule
    let w : [var Nat32] = Array.tabulate<Nat32>(64, func _ = 0).toVarArray();

    var blockIdx = 0;
    let numBlocks = paddedLen / 64;
    while (blockIdx < numBlocks) {
      let base = blockIdx * 64;

      // Prepare message schedule
      i := 0;
      while (i < 16) {
        let b = base + i * 4;
        w[i] := (Nat32.fromNat(msg[b].toNat())     << 24)
               | (Nat32.fromNat(msg[b + 1].toNat()) << 16)
               | (Nat32.fromNat(msg[b + 2].toNat()) << 8)
               |  Nat32.fromNat(msg[b + 3].toNat());
        i += 1;
      };
      while (i < 64) {
        w[i] := sig1(w[i - 2]) +% w[i - 7] +% sig0(w[i - 15]) +% w[i - 16];
        i += 1;
      };

      // Compression
      var a = h[0]; var b2 = h[1]; var c = h[2]; var d = h[3];
      var e = h[4]; var f = h[5]; var g = h[6]; var hh = h[7];

      i := 0;
      while (i < 64) {
        let t1 = hh +% ep1(e) +% ch(e, f, g) +% K[i] +% w[i];
        let t2 = ep0(a) +% maj(a, b2, c);
        hh := g; g := f; f := e; e := d +% t1;
        d  := c; c := b2; b2 := a; a := t1 +% t2;
        i += 1;
      };

      h[0] +%= a;  h[1] +%= b2; h[2] +%= c;  h[3] +%= d;
      h[4] +%= e;  h[5] +%= f;  h[6] +%= g;  h[7] +%= hh;
      blockIdx += 1;
    };

    // Produce 32-byte digest (big-endian words)
    Array.tabulate<Nat8>(32, func(j) {
      let word = h[j / 4];
      let shift = Nat32.fromNat((3 - (j % 4)) * 8);
      Nat8.fromNat(((word >> shift) & 0xff).toNat())
    })
  };

  // ── Hex encoding ─────────────────────────────────────────────────────────

  private let HEX : [Char] = [
    '0','1','2','3','4','5','6','7',
    '8','9','a','b','c','d','e','f',
  ];

  private func byteToHex(b : Nat8) : Text {
    let n = b.toNat();
    Text.fromChar(HEX[n / 16]) # Text.fromChar(HEX[n % 16])
  };

  // ── Public API ─────────────────────────────────────────────────────────────

  /// Returns the lowercase hex SHA-256 digest of `text` (UTF-8).
  public func hash(text : Text) : Text {
    let bytes = text.encodeUtf8().toArray();
    let digest = hashBytes(bytes);
    var result = "";
    for (b in digest.values()) {
      result #= byteToHex(b);
    };
    result
  };

};
