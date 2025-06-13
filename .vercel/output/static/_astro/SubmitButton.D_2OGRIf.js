import { j as g } from "./jsx-runtime.BMmiHB9I.js";
import { r as p, R as $, a as ft } from "./index.Cj_FO6QK.js";
import "./index.DqldKjai.js";
function Ee(e, o) {
  if (typeof e == "function") return e(o);
  e != null && (e.current = o);
}
function _e(...e) {
  return (o) => {
    let t = !1;
    const r = e.map((n) => {
      const i = Ee(n, o);
      return !t && typeof i == "function" && (t = !0), i;
    });
    if (t)
      return () => {
        for (let n = 0; n < r.length; n++) {
          const i = r[n];
          typeof i == "function" ? i() : Ee(e[n], null);
        }
      };
  };
}
function H(...e) {
  return p.useCallback(_e(...e), e);
}
function ce(e) {
  const o = bt(e),
    t = p.forwardRef((r, n) => {
      const { children: i, ...s } = r,
        a = p.Children.toArray(i),
        l = a.find(ht);
      if (l) {
        const d = l.props.children,
          f = a.map((c) => (c === l ? (p.Children.count(d) > 1 ? p.Children.only(null) : p.isValidElement(d) ? d.props.children : null) : c));
        return g.jsx(o, { ...s, ref: n, children: p.isValidElement(d) ? p.cloneElement(d, void 0, f) : null });
      }
      return g.jsx(o, { ...s, ref: n, children: i });
    });
  return (t.displayName = `${e}.Slot`), t;
}
var pt = ce("Slot");
function bt(e) {
  const o = p.forwardRef((t, r) => {
    const { children: n, ...i } = t;
    if (p.isValidElement(n)) {
      const s = vt(n),
        a = xt(i, n.props);
      return n.type !== p.Fragment && (a.ref = r ? _e(r, s) : s), p.cloneElement(n, a);
    }
    return p.Children.count(n) > 1 ? p.Children.only(null) : null;
  });
  return (o.displayName = `${e}.SlotClone`), o;
}
var gt = Symbol("radix.slottable");
function ht(e) {
  return p.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === gt;
}
function xt(e, o) {
  const t = { ...o };
  for (const r in o) {
    const n = e[r],
      i = o[r];
    /^on[A-Z]/.test(r)
      ? n && i
        ? (t[r] = (...a) => {
            const l = i(...a);
            return n(...a), l;
          })
        : n && (t[r] = n)
      : r === "style"
        ? (t[r] = { ...n, ...i })
        : r === "className" && (t[r] = [n, i].filter(Boolean).join(" "));
  }
  return { ...e, ...t };
}
function vt(e) {
  let o = Object.getOwnPropertyDescriptor(e.props, "ref")?.get,
    t = o && "isReactWarning" in o && o.isReactWarning;
  return t
    ? e.ref
    : ((o = Object.getOwnPropertyDescriptor(e, "ref")?.get),
      (t = o && "isReactWarning" in o && o.isReactWarning),
      t ? e.props.ref : e.props.ref || e.ref);
}
function Te(e) {
  var o,
    t,
    r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object")
    if (Array.isArray(e)) {
      var n = e.length;
      for (o = 0; o < n; o++) e[o] && (t = Te(e[o])) && (r && (r += " "), (r += t));
    } else for (t in e) e[t] && (r && (r += " "), (r += t));
  return r;
}
function Ve() {
  for (var e, o, t = 0, r = "", n = arguments.length; t < n; t++) (e = arguments[t]) && (o = Te(e)) && (r && (r += " "), (r += o));
  return r;
}
const Me = (e) => (typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e),
  ze = Ve,
  yt = (e, o) => (t) => {
    var r;
    if (o?.variants == null) return ze(e, t?.class, t?.className);
    const { variants: n, defaultVariants: i } = o,
      s = Object.keys(n).map((d) => {
        const f = t?.[d],
          c = i?.[d];
        if (f === null) return null;
        const y = Me(f) || Me(c);
        return n[d][y];
      }),
      a =
        t &&
        Object.entries(t).reduce((d, f) => {
          let [c, y] = f;
          return y === void 0 || (d[c] = y), d;
        }, {}),
      l =
        o == null || (r = o.compoundVariants) === null || r === void 0
          ? void 0
          : r.reduce((d, f) => {
              let { class: c, className: y, ...C } = f;
              return Object.entries(C).every((k) => {
                let [v, h] = k;
                return Array.isArray(h) ? h.includes({ ...i, ...a }[v]) : { ...i, ...a }[v] === h;
              })
                ? [...d, c, y]
                : d;
            }, []);
    return ze(e, s, l, t?.class, t?.className);
  },
  we = "-",
  wt = (e) => {
    const o = St(e),
      { conflictingClassGroups: t, conflictingClassGroupModifiers: r } = e;
    return {
      getClassGroupId: (s) => {
        const a = s.split(we);
        return a[0] === "" && a.length !== 1 && a.shift(), De(a, o) || kt(s);
      },
      getConflictingClassGroupIds: (s, a) => {
        const l = t[s] || [];
        return a && r[s] ? [...l, ...r[s]] : l;
      },
    };
  },
  De = (e, o) => {
    if (e.length === 0) return o.classGroupId;
    const t = e[0],
      r = o.nextPart.get(t),
      n = r ? De(e.slice(1), r) : void 0;
    if (n) return n;
    if (o.validators.length === 0) return;
    const i = e.join(we);
    return o.validators.find(({ validator: s }) => s(i))?.classGroupId;
  },
  Ae = /^\[(.+)\]$/,
  kt = (e) => {
    if (Ae.test(e)) {
      const o = Ae.exec(e)[1],
        t = o?.substring(0, o.indexOf(":"));
      if (t) return "arbitrary.." + t;
    }
  },
  St = (e) => {
    const { theme: o, classGroups: t } = e,
      r = { nextPart: new Map(), validators: [] };
    for (const n in t) be(t[n], r, n, o);
    return r;
  },
  be = (e, o, t, r) => {
    e.forEach((n) => {
      if (typeof n == "string") {
        const i = n === "" ? o : Ie(o, n);
        i.classGroupId = t;
        return;
      }
      if (typeof n == "function") {
        if (Ct(n)) {
          be(n(r), o, t, r);
          return;
        }
        o.validators.push({ validator: n, classGroupId: t });
        return;
      }
      Object.entries(n).forEach(([i, s]) => {
        be(s, Ie(o, i), t, r);
      });
    });
  },
  Ie = (e, o) => {
    let t = e;
    return (
      o.split(we).forEach((r) => {
        t.nextPart.has(r) || t.nextPart.set(r, { nextPart: new Map(), validators: [] }), (t = t.nextPart.get(r));
      }),
      t
    );
  },
  Ct = (e) => e.isThemeGetter,
  Rt = (e) => {
    if (e < 1) return { get: () => {}, set: () => {} };
    let o = 0,
      t = new Map(),
      r = new Map();
    const n = (i, s) => {
      t.set(i, s), o++, o > e && ((o = 0), (r = t), (t = new Map()));
    };
    return {
      get(i) {
        let s = t.get(i);
        if (s !== void 0) return s;
        if ((s = r.get(i)) !== void 0) return n(i, s), s;
      },
      set(i, s) {
        t.has(i) ? t.set(i, s) : n(i, s);
      },
    };
  },
  ge = "!",
  he = ":",
  Pt = he.length,
  Et = (e) => {
    const { prefix: o, experimentalParseClassName: t } = e;
    let r = (n) => {
      const i = [];
      let s = 0,
        a = 0,
        l = 0,
        d;
      for (let k = 0; k < n.length; k++) {
        let v = n[k];
        if (s === 0 && a === 0) {
          if (v === he) {
            i.push(n.slice(l, k)), (l = k + Pt);
            continue;
          }
          if (v === "/") {
            d = k;
            continue;
          }
        }
        v === "[" ? s++ : v === "]" ? s-- : v === "(" ? a++ : v === ")" && a--;
      }
      const f = i.length === 0 ? n : n.substring(l),
        c = Mt(f),
        y = c !== f,
        C = d && d > l ? d - l : void 0;
      return { modifiers: i, hasImportantModifier: y, baseClassName: c, maybePostfixModifierPosition: C };
    };
    if (o) {
      const n = o + he,
        i = r;
      r = (s) =>
        s.startsWith(n)
          ? i(s.substring(n.length))
          : { isExternal: !0, modifiers: [], hasImportantModifier: !1, baseClassName: s, maybePostfixModifierPosition: void 0 };
    }
    if (t) {
      const n = r;
      r = (i) => t({ className: i, parseClassName: n });
    }
    return r;
  },
  Mt = (e) => (e.endsWith(ge) ? e.substring(0, e.length - 1) : e.startsWith(ge) ? e.substring(1) : e),
  zt = (e) => {
    const o = Object.fromEntries(e.orderSensitiveModifiers.map((r) => [r, !0]));
    return (r) => {
      if (r.length <= 1) return r;
      const n = [];
      let i = [];
      return (
        r.forEach((s) => {
          s[0] === "[" || o[s] ? (n.push(...i.sort(), s), (i = [])) : i.push(s);
        }),
        n.push(...i.sort()),
        n
      );
    };
  },
  At = (e) => ({ cache: Rt(e.cacheSize), parseClassName: Et(e), sortModifiers: zt(e), ...wt(e) }),
  It = /\s+/,
  Nt = (e, o) => {
    const { parseClassName: t, getClassGroupId: r, getConflictingClassGroupIds: n, sortModifiers: i } = o,
      s = [],
      a = e.trim().split(It);
    let l = "";
    for (let d = a.length - 1; d >= 0; d -= 1) {
      const f = a[d],
        { isExternal: c, modifiers: y, hasImportantModifier: C, baseClassName: k, maybePostfixModifierPosition: v } = t(f);
      if (c) {
        l = f + (l.length > 0 ? " " + l : l);
        continue;
      }
      let h = !!v,
        S = r(h ? k.substring(0, v) : k);
      if (!S) {
        if (!h) {
          l = f + (l.length > 0 ? " " + l : l);
          continue;
        }
        if (((S = r(k)), !S)) {
          l = f + (l.length > 0 ? " " + l : l);
          continue;
        }
        h = !1;
      }
      const E = i(y).join(":"),
        P = C ? E + ge : E,
        R = P + S;
      if (s.includes(R)) continue;
      s.push(R);
      const N = n(S, h);
      for (let I = 0; I < N.length; ++I) {
        const B = N[I];
        s.push(P + B);
      }
      l = f + (l.length > 0 ? " " + l : l);
    }
    return l;
  };
function jt() {
  let e = 0,
    o,
    t,
    r = "";
  for (; e < arguments.length; ) (o = arguments[e++]) && (t = Be(o)) && (r && (r += " "), (r += t));
  return r;
}
const Be = (e) => {
  if (typeof e == "string") return e;
  let o,
    t = "";
  for (let r = 0; r < e.length; r++) e[r] && (o = Be(e[r])) && (t && (t += " "), (t += o));
  return t;
};
function _t(e, ...o) {
  let t,
    r,
    n,
    i = s;
  function s(l) {
    const d = o.reduce((f, c) => c(f), e());
    return (t = At(d)), (r = t.cache.get), (n = t.cache.set), (i = a), a(l);
  }
  function a(l) {
    const d = r(l);
    if (d) return d;
    const f = Nt(l, t);
    return n(l, f), f;
  }
  return function () {
    return i(jt.apply(null, arguments));
  };
}
const M = (e) => {
    const o = (t) => t[e] || [];
    return (o.isThemeGetter = !0), o;
  },
  Oe = /^\[(?:(\w[\w-]*):)?(.+)\]$/i,
  Le = /^\((?:(\w[\w-]*):)?(.+)\)$/i,
  Tt = /^\d+\/\d+$/,
  Vt = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,
  Dt = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,
  Bt = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,
  Ot = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,
  Lt = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,
  X = (e) => Tt.test(e),
  w = (e) => !!e && !Number.isNaN(Number(e)),
  K = (e) => !!e && Number.isInteger(Number(e)),
  fe = (e) => e.endsWith("%") && w(e.slice(0, -1)),
  G = (e) => Vt.test(e),
  $t = () => !0,
  Gt = (e) => Dt.test(e) && !Bt.test(e),
  $e = () => !1,
  Ft = (e) => Ot.test(e),
  Kt = (e) => Lt.test(e),
  Ht = (e) => !u(e) && !m(e),
  Wt = (e) => J(e, Ke, $e),
  u = (e) => Oe.test(e),
  W = (e) => J(e, He, Gt),
  pe = (e) => J(e, Jt, w),
  Ne = (e) => J(e, Ge, $e),
  Ut = (e) => J(e, Fe, Kt),
  ae = (e) => J(e, We, Ft),
  m = (e) => Le.test(e),
  te = (e) => Z(e, He),
  Yt = (e) => Z(e, Zt),
  je = (e) => Z(e, Ge),
  Xt = (e) => Z(e, Ke),
  qt = (e) => Z(e, Fe),
  le = (e) => Z(e, We, !0),
  J = (e, o, t) => {
    const r = Oe.exec(e);
    return r ? (r[1] ? o(r[1]) : t(r[2])) : !1;
  },
  Z = (e, o, t = !1) => {
    const r = Le.exec(e);
    return r ? (r[1] ? o(r[1]) : t) : !1;
  },
  Ge = (e) => e === "position" || e === "percentage",
  Fe = (e) => e === "image" || e === "url",
  Ke = (e) => e === "length" || e === "size" || e === "bg-size",
  He = (e) => e === "length",
  Jt = (e) => e === "number",
  Zt = (e) => e === "family-name",
  We = (e) => e === "shadow",
  Qt = () => {
    const e = M("color"),
      o = M("font"),
      t = M("text"),
      r = M("font-weight"),
      n = M("tracking"),
      i = M("leading"),
      s = M("breakpoint"),
      a = M("container"),
      l = M("spacing"),
      d = M("radius"),
      f = M("shadow"),
      c = M("inset-shadow"),
      y = M("text-shadow"),
      C = M("drop-shadow"),
      k = M("blur"),
      v = M("perspective"),
      h = M("aspect"),
      S = M("ease"),
      E = M("animate"),
      P = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"],
      R = () => [
        "center",
        "top",
        "bottom",
        "left",
        "right",
        "top-left",
        "left-top",
        "top-right",
        "right-top",
        "bottom-right",
        "right-bottom",
        "bottom-left",
        "left-bottom",
      ],
      N = () => [...R(), m, u],
      I = () => ["auto", "hidden", "clip", "visible", "scroll"],
      B = () => ["auto", "contain", "none"],
      x = () => [m, u, l],
      O = () => [X, "full", "auto", ...x()],
      F = () => [K, "none", "subgrid", m, u],
      A = () => ["auto", { span: ["full", K, m, u] }, K, m, u],
      D = () => [K, "auto", m, u],
      U = () => ["auto", "min", "max", "fr", m, u],
      Y = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"],
      L = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"],
      j = () => ["auto", ...x()],
      T = () => [X, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...x()],
      b = () => [e, m, u],
      ee = () => [...R(), je, Ne, { position: [m, u] }],
      Se = () => ["no-repeat", { repeat: ["", "x", "y", "space", "round"] }],
      Ce = () => ["auto", "cover", "contain", Xt, Wt, { size: [m, u] }],
      ue = () => [fe, te, W],
      _ = () => ["", "none", "full", d, m, u],
      V = () => ["", w, te, W],
      re = () => ["solid", "dashed", "dotted", "double"],
      Re = () => [
        "normal",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "color-dodge",
        "color-burn",
        "hard-light",
        "soft-light",
        "difference",
        "exclusion",
        "hue",
        "saturation",
        "color",
        "luminosity",
      ],
      z = () => [w, fe, je, Ne],
      Pe = () => ["", "none", k, m, u],
      ne = () => ["none", w, m, u],
      se = () => ["none", w, m, u],
      me = () => [w, m, u],
      ie = () => [X, "full", ...x()];
    return {
      cacheSize: 500,
      theme: {
        animate: ["spin", "ping", "pulse", "bounce"],
        aspect: ["video"],
        blur: [G],
        breakpoint: [G],
        color: [$t],
        container: [G],
        "drop-shadow": [G],
        ease: ["in", "out", "in-out"],
        font: [Ht],
        "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
        "inset-shadow": [G],
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
        perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
        radius: [G],
        shadow: [G],
        spacing: ["px", w],
        text: [G],
        "text-shadow": [G],
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"],
      },
      classGroups: {
        aspect: [{ aspect: ["auto", "square", X, u, m, h] }],
        container: ["container"],
        columns: [{ columns: [w, u, m, a] }],
        "break-after": [{ "break-after": P() }],
        "break-before": [{ "break-before": P() }],
        "break-inside": [{ "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"] }],
        "box-decoration": [{ "box-decoration": ["slice", "clone"] }],
        box: [{ box: ["border", "content"] }],
        display: [
          "block",
          "inline-block",
          "inline",
          "flex",
          "inline-flex",
          "table",
          "inline-table",
          "table-caption",
          "table-cell",
          "table-column",
          "table-column-group",
          "table-footer-group",
          "table-header-group",
          "table-row-group",
          "table-row",
          "flow-root",
          "grid",
          "inline-grid",
          "contents",
          "list-item",
          "hidden",
        ],
        sr: ["sr-only", "not-sr-only"],
        float: [{ float: ["right", "left", "none", "start", "end"] }],
        clear: [{ clear: ["left", "right", "both", "none", "start", "end"] }],
        isolation: ["isolate", "isolation-auto"],
        "object-fit": [{ object: ["contain", "cover", "fill", "none", "scale-down"] }],
        "object-position": [{ object: N() }],
        overflow: [{ overflow: I() }],
        "overflow-x": [{ "overflow-x": I() }],
        "overflow-y": [{ "overflow-y": I() }],
        overscroll: [{ overscroll: B() }],
        "overscroll-x": [{ "overscroll-x": B() }],
        "overscroll-y": [{ "overscroll-y": B() }],
        position: ["static", "fixed", "absolute", "relative", "sticky"],
        inset: [{ inset: O() }],
        "inset-x": [{ "inset-x": O() }],
        "inset-y": [{ "inset-y": O() }],
        start: [{ start: O() }],
        end: [{ end: O() }],
        top: [{ top: O() }],
        right: [{ right: O() }],
        bottom: [{ bottom: O() }],
        left: [{ left: O() }],
        visibility: ["visible", "invisible", "collapse"],
        z: [{ z: [K, "auto", m, u] }],
        basis: [{ basis: [X, "full", "auto", a, ...x()] }],
        "flex-direction": [{ flex: ["row", "row-reverse", "col", "col-reverse"] }],
        "flex-wrap": [{ flex: ["nowrap", "wrap", "wrap-reverse"] }],
        flex: [{ flex: [w, X, "auto", "initial", "none", u] }],
        grow: [{ grow: ["", w, m, u] }],
        shrink: [{ shrink: ["", w, m, u] }],
        order: [{ order: [K, "first", "last", "none", m, u] }],
        "grid-cols": [{ "grid-cols": F() }],
        "col-start-end": [{ col: A() }],
        "col-start": [{ "col-start": D() }],
        "col-end": [{ "col-end": D() }],
        "grid-rows": [{ "grid-rows": F() }],
        "row-start-end": [{ row: A() }],
        "row-start": [{ "row-start": D() }],
        "row-end": [{ "row-end": D() }],
        "grid-flow": [{ "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"] }],
        "auto-cols": [{ "auto-cols": U() }],
        "auto-rows": [{ "auto-rows": U() }],
        gap: [{ gap: x() }],
        "gap-x": [{ "gap-x": x() }],
        "gap-y": [{ "gap-y": x() }],
        "justify-content": [{ justify: [...Y(), "normal"] }],
        "justify-items": [{ "justify-items": [...L(), "normal"] }],
        "justify-self": [{ "justify-self": ["auto", ...L()] }],
        "align-content": [{ content: ["normal", ...Y()] }],
        "align-items": [{ items: [...L(), { baseline: ["", "last"] }] }],
        "align-self": [{ self: ["auto", ...L(), { baseline: ["", "last"] }] }],
        "place-content": [{ "place-content": Y() }],
        "place-items": [{ "place-items": [...L(), "baseline"] }],
        "place-self": [{ "place-self": ["auto", ...L()] }],
        p: [{ p: x() }],
        px: [{ px: x() }],
        py: [{ py: x() }],
        ps: [{ ps: x() }],
        pe: [{ pe: x() }],
        pt: [{ pt: x() }],
        pr: [{ pr: x() }],
        pb: [{ pb: x() }],
        pl: [{ pl: x() }],
        m: [{ m: j() }],
        mx: [{ mx: j() }],
        my: [{ my: j() }],
        ms: [{ ms: j() }],
        me: [{ me: j() }],
        mt: [{ mt: j() }],
        mr: [{ mr: j() }],
        mb: [{ mb: j() }],
        ml: [{ ml: j() }],
        "space-x": [{ "space-x": x() }],
        "space-x-reverse": ["space-x-reverse"],
        "space-y": [{ "space-y": x() }],
        "space-y-reverse": ["space-y-reverse"],
        size: [{ size: T() }],
        w: [{ w: [a, "screen", ...T()] }],
        "min-w": [{ "min-w": [a, "screen", "none", ...T()] }],
        "max-w": [{ "max-w": [a, "screen", "none", "prose", { screen: [s] }, ...T()] }],
        h: [{ h: ["screen", "lh", ...T()] }],
        "min-h": [{ "min-h": ["screen", "lh", "none", ...T()] }],
        "max-h": [{ "max-h": ["screen", "lh", ...T()] }],
        "font-size": [{ text: ["base", t, te, W] }],
        "font-smoothing": ["antialiased", "subpixel-antialiased"],
        "font-style": ["italic", "not-italic"],
        "font-weight": [{ font: [r, m, pe] }],
        "font-stretch": [
          {
            "font-stretch": [
              "ultra-condensed",
              "extra-condensed",
              "condensed",
              "semi-condensed",
              "normal",
              "semi-expanded",
              "expanded",
              "extra-expanded",
              "ultra-expanded",
              fe,
              u,
            ],
          },
        ],
        "font-family": [{ font: [Yt, u, o] }],
        "fvn-normal": ["normal-nums"],
        "fvn-ordinal": ["ordinal"],
        "fvn-slashed-zero": ["slashed-zero"],
        "fvn-figure": ["lining-nums", "oldstyle-nums"],
        "fvn-spacing": ["proportional-nums", "tabular-nums"],
        "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
        tracking: [{ tracking: [n, m, u] }],
        "line-clamp": [{ "line-clamp": [w, "none", m, pe] }],
        leading: [{ leading: [i, ...x()] }],
        "list-image": [{ "list-image": ["none", m, u] }],
        "list-style-position": [{ list: ["inside", "outside"] }],
        "list-style-type": [{ list: ["disc", "decimal", "none", m, u] }],
        "text-alignment": [{ text: ["left", "center", "right", "justify", "start", "end"] }],
        "placeholder-color": [{ placeholder: b() }],
        "text-color": [{ text: b() }],
        "text-decoration": ["underline", "overline", "line-through", "no-underline"],
        "text-decoration-style": [{ decoration: [...re(), "wavy"] }],
        "text-decoration-thickness": [{ decoration: [w, "from-font", "auto", m, W] }],
        "text-decoration-color": [{ decoration: b() }],
        "underline-offset": [{ "underline-offset": [w, "auto", m, u] }],
        "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
        "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
        "text-wrap": [{ text: ["wrap", "nowrap", "balance", "pretty"] }],
        indent: [{ indent: x() }],
        "vertical-align": [{ align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", m, u] }],
        whitespace: [{ whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"] }],
        break: [{ break: ["normal", "words", "all", "keep"] }],
        wrap: [{ wrap: ["break-word", "anywhere", "normal"] }],
        hyphens: [{ hyphens: ["none", "manual", "auto"] }],
        content: [{ content: ["none", m, u] }],
        "bg-attachment": [{ bg: ["fixed", "local", "scroll"] }],
        "bg-clip": [{ "bg-clip": ["border", "padding", "content", "text"] }],
        "bg-origin": [{ "bg-origin": ["border", "padding", "content"] }],
        "bg-position": [{ bg: ee() }],
        "bg-repeat": [{ bg: Se() }],
        "bg-size": [{ bg: Ce() }],
        "bg-image": [
          { bg: ["none", { linear: [{ to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"] }, K, m, u], radial: ["", m, u], conic: [K, m, u] }, qt, Ut] },
        ],
        "bg-color": [{ bg: b() }],
        "gradient-from-pos": [{ from: ue() }],
        "gradient-via-pos": [{ via: ue() }],
        "gradient-to-pos": [{ to: ue() }],
        "gradient-from": [{ from: b() }],
        "gradient-via": [{ via: b() }],
        "gradient-to": [{ to: b() }],
        rounded: [{ rounded: _() }],
        "rounded-s": [{ "rounded-s": _() }],
        "rounded-e": [{ "rounded-e": _() }],
        "rounded-t": [{ "rounded-t": _() }],
        "rounded-r": [{ "rounded-r": _() }],
        "rounded-b": [{ "rounded-b": _() }],
        "rounded-l": [{ "rounded-l": _() }],
        "rounded-ss": [{ "rounded-ss": _() }],
        "rounded-se": [{ "rounded-se": _() }],
        "rounded-ee": [{ "rounded-ee": _() }],
        "rounded-es": [{ "rounded-es": _() }],
        "rounded-tl": [{ "rounded-tl": _() }],
        "rounded-tr": [{ "rounded-tr": _() }],
        "rounded-br": [{ "rounded-br": _() }],
        "rounded-bl": [{ "rounded-bl": _() }],
        "border-w": [{ border: V() }],
        "border-w-x": [{ "border-x": V() }],
        "border-w-y": [{ "border-y": V() }],
        "border-w-s": [{ "border-s": V() }],
        "border-w-e": [{ "border-e": V() }],
        "border-w-t": [{ "border-t": V() }],
        "border-w-r": [{ "border-r": V() }],
        "border-w-b": [{ "border-b": V() }],
        "border-w-l": [{ "border-l": V() }],
        "divide-x": [{ "divide-x": V() }],
        "divide-x-reverse": ["divide-x-reverse"],
        "divide-y": [{ "divide-y": V() }],
        "divide-y-reverse": ["divide-y-reverse"],
        "border-style": [{ border: [...re(), "hidden", "none"] }],
        "divide-style": [{ divide: [...re(), "hidden", "none"] }],
        "border-color": [{ border: b() }],
        "border-color-x": [{ "border-x": b() }],
        "border-color-y": [{ "border-y": b() }],
        "border-color-s": [{ "border-s": b() }],
        "border-color-e": [{ "border-e": b() }],
        "border-color-t": [{ "border-t": b() }],
        "border-color-r": [{ "border-r": b() }],
        "border-color-b": [{ "border-b": b() }],
        "border-color-l": [{ "border-l": b() }],
        "divide-color": [{ divide: b() }],
        "outline-style": [{ outline: [...re(), "none", "hidden"] }],
        "outline-offset": [{ "outline-offset": [w, m, u] }],
        "outline-w": [{ outline: ["", w, te, W] }],
        "outline-color": [{ outline: b() }],
        shadow: [{ shadow: ["", "none", f, le, ae] }],
        "shadow-color": [{ shadow: b() }],
        "inset-shadow": [{ "inset-shadow": ["none", c, le, ae] }],
        "inset-shadow-color": [{ "inset-shadow": b() }],
        "ring-w": [{ ring: V() }],
        "ring-w-inset": ["ring-inset"],
        "ring-color": [{ ring: b() }],
        "ring-offset-w": [{ "ring-offset": [w, W] }],
        "ring-offset-color": [{ "ring-offset": b() }],
        "inset-ring-w": [{ "inset-ring": V() }],
        "inset-ring-color": [{ "inset-ring": b() }],
        "text-shadow": [{ "text-shadow": ["none", y, le, ae] }],
        "text-shadow-color": [{ "text-shadow": b() }],
        opacity: [{ opacity: [w, m, u] }],
        "mix-blend": [{ "mix-blend": [...Re(), "plus-darker", "plus-lighter"] }],
        "bg-blend": [{ "bg-blend": Re() }],
        "mask-clip": [{ "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"] }, "mask-no-clip"],
        "mask-composite": [{ mask: ["add", "subtract", "intersect", "exclude"] }],
        "mask-image-linear-pos": [{ "mask-linear": [w] }],
        "mask-image-linear-from-pos": [{ "mask-linear-from": z() }],
        "mask-image-linear-to-pos": [{ "mask-linear-to": z() }],
        "mask-image-linear-from-color": [{ "mask-linear-from": b() }],
        "mask-image-linear-to-color": [{ "mask-linear-to": b() }],
        "mask-image-t-from-pos": [{ "mask-t-from": z() }],
        "mask-image-t-to-pos": [{ "mask-t-to": z() }],
        "mask-image-t-from-color": [{ "mask-t-from": b() }],
        "mask-image-t-to-color": [{ "mask-t-to": b() }],
        "mask-image-r-from-pos": [{ "mask-r-from": z() }],
        "mask-image-r-to-pos": [{ "mask-r-to": z() }],
        "mask-image-r-from-color": [{ "mask-r-from": b() }],
        "mask-image-r-to-color": [{ "mask-r-to": b() }],
        "mask-image-b-from-pos": [{ "mask-b-from": z() }],
        "mask-image-b-to-pos": [{ "mask-b-to": z() }],
        "mask-image-b-from-color": [{ "mask-b-from": b() }],
        "mask-image-b-to-color": [{ "mask-b-to": b() }],
        "mask-image-l-from-pos": [{ "mask-l-from": z() }],
        "mask-image-l-to-pos": [{ "mask-l-to": z() }],
        "mask-image-l-from-color": [{ "mask-l-from": b() }],
        "mask-image-l-to-color": [{ "mask-l-to": b() }],
        "mask-image-x-from-pos": [{ "mask-x-from": z() }],
        "mask-image-x-to-pos": [{ "mask-x-to": z() }],
        "mask-image-x-from-color": [{ "mask-x-from": b() }],
        "mask-image-x-to-color": [{ "mask-x-to": b() }],
        "mask-image-y-from-pos": [{ "mask-y-from": z() }],
        "mask-image-y-to-pos": [{ "mask-y-to": z() }],
        "mask-image-y-from-color": [{ "mask-y-from": b() }],
        "mask-image-y-to-color": [{ "mask-y-to": b() }],
        "mask-image-radial": [{ "mask-radial": [m, u] }],
        "mask-image-radial-from-pos": [{ "mask-radial-from": z() }],
        "mask-image-radial-to-pos": [{ "mask-radial-to": z() }],
        "mask-image-radial-from-color": [{ "mask-radial-from": b() }],
        "mask-image-radial-to-color": [{ "mask-radial-to": b() }],
        "mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
        "mask-image-radial-size": [{ "mask-radial": [{ closest: ["side", "corner"], farthest: ["side", "corner"] }] }],
        "mask-image-radial-pos": [{ "mask-radial-at": R() }],
        "mask-image-conic-pos": [{ "mask-conic": [w] }],
        "mask-image-conic-from-pos": [{ "mask-conic-from": z() }],
        "mask-image-conic-to-pos": [{ "mask-conic-to": z() }],
        "mask-image-conic-from-color": [{ "mask-conic-from": b() }],
        "mask-image-conic-to-color": [{ "mask-conic-to": b() }],
        "mask-mode": [{ mask: ["alpha", "luminance", "match"] }],
        "mask-origin": [{ "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"] }],
        "mask-position": [{ mask: ee() }],
        "mask-repeat": [{ mask: Se() }],
        "mask-size": [{ mask: Ce() }],
        "mask-type": [{ "mask-type": ["alpha", "luminance"] }],
        "mask-image": [{ mask: ["none", m, u] }],
        filter: [{ filter: ["", "none", m, u] }],
        blur: [{ blur: Pe() }],
        brightness: [{ brightness: [w, m, u] }],
        contrast: [{ contrast: [w, m, u] }],
        "drop-shadow": [{ "drop-shadow": ["", "none", C, le, ae] }],
        "drop-shadow-color": [{ "drop-shadow": b() }],
        grayscale: [{ grayscale: ["", w, m, u] }],
        "hue-rotate": [{ "hue-rotate": [w, m, u] }],
        invert: [{ invert: ["", w, m, u] }],
        saturate: [{ saturate: [w, m, u] }],
        sepia: [{ sepia: ["", w, m, u] }],
        "backdrop-filter": [{ "backdrop-filter": ["", "none", m, u] }],
        "backdrop-blur": [{ "backdrop-blur": Pe() }],
        "backdrop-brightness": [{ "backdrop-brightness": [w, m, u] }],
        "backdrop-contrast": [{ "backdrop-contrast": [w, m, u] }],
        "backdrop-grayscale": [{ "backdrop-grayscale": ["", w, m, u] }],
        "backdrop-hue-rotate": [{ "backdrop-hue-rotate": [w, m, u] }],
        "backdrop-invert": [{ "backdrop-invert": ["", w, m, u] }],
        "backdrop-opacity": [{ "backdrop-opacity": [w, m, u] }],
        "backdrop-saturate": [{ "backdrop-saturate": [w, m, u] }],
        "backdrop-sepia": [{ "backdrop-sepia": ["", w, m, u] }],
        "border-collapse": [{ border: ["collapse", "separate"] }],
        "border-spacing": [{ "border-spacing": x() }],
        "border-spacing-x": [{ "border-spacing-x": x() }],
        "border-spacing-y": [{ "border-spacing-y": x() }],
        "table-layout": [{ table: ["auto", "fixed"] }],
        caption: [{ caption: ["top", "bottom"] }],
        transition: [{ transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", m, u] }],
        "transition-behavior": [{ transition: ["normal", "discrete"] }],
        duration: [{ duration: [w, "initial", m, u] }],
        ease: [{ ease: ["linear", "initial", S, m, u] }],
        delay: [{ delay: [w, m, u] }],
        animate: [{ animate: ["none", E, m, u] }],
        backface: [{ backface: ["hidden", "visible"] }],
        perspective: [{ perspective: [v, m, u] }],
        "perspective-origin": [{ "perspective-origin": N() }],
        rotate: [{ rotate: ne() }],
        "rotate-x": [{ "rotate-x": ne() }],
        "rotate-y": [{ "rotate-y": ne() }],
        "rotate-z": [{ "rotate-z": ne() }],
        scale: [{ scale: se() }],
        "scale-x": [{ "scale-x": se() }],
        "scale-y": [{ "scale-y": se() }],
        "scale-z": [{ "scale-z": se() }],
        "scale-3d": ["scale-3d"],
        skew: [{ skew: me() }],
        "skew-x": [{ "skew-x": me() }],
        "skew-y": [{ "skew-y": me() }],
        transform: [{ transform: [m, u, "", "none", "gpu", "cpu"] }],
        "transform-origin": [{ origin: N() }],
        "transform-style": [{ transform: ["3d", "flat"] }],
        translate: [{ translate: ie() }],
        "translate-x": [{ "translate-x": ie() }],
        "translate-y": [{ "translate-y": ie() }],
        "translate-z": [{ "translate-z": ie() }],
        "translate-none": ["translate-none"],
        accent: [{ accent: b() }],
        appearance: [{ appearance: ["none", "auto"] }],
        "caret-color": [{ caret: b() }],
        "color-scheme": [{ scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"] }],
        cursor: [
          {
            cursor: [
              "auto",
              "default",
              "pointer",
              "wait",
              "text",
              "move",
              "help",
              "not-allowed",
              "none",
              "context-menu",
              "progress",
              "cell",
              "crosshair",
              "vertical-text",
              "alias",
              "copy",
              "no-drop",
              "grab",
              "grabbing",
              "all-scroll",
              "col-resize",
              "row-resize",
              "n-resize",
              "e-resize",
              "s-resize",
              "w-resize",
              "ne-resize",
              "nw-resize",
              "se-resize",
              "sw-resize",
              "ew-resize",
              "ns-resize",
              "nesw-resize",
              "nwse-resize",
              "zoom-in",
              "zoom-out",
              m,
              u,
            ],
          },
        ],
        "field-sizing": [{ "field-sizing": ["fixed", "content"] }],
        "pointer-events": [{ "pointer-events": ["auto", "none"] }],
        resize: [{ resize: ["none", "", "y", "x"] }],
        "scroll-behavior": [{ scroll: ["auto", "smooth"] }],
        "scroll-m": [{ "scroll-m": x() }],
        "scroll-mx": [{ "scroll-mx": x() }],
        "scroll-my": [{ "scroll-my": x() }],
        "scroll-ms": [{ "scroll-ms": x() }],
        "scroll-me": [{ "scroll-me": x() }],
        "scroll-mt": [{ "scroll-mt": x() }],
        "scroll-mr": [{ "scroll-mr": x() }],
        "scroll-mb": [{ "scroll-mb": x() }],
        "scroll-ml": [{ "scroll-ml": x() }],
        "scroll-p": [{ "scroll-p": x() }],
        "scroll-px": [{ "scroll-px": x() }],
        "scroll-py": [{ "scroll-py": x() }],
        "scroll-ps": [{ "scroll-ps": x() }],
        "scroll-pe": [{ "scroll-pe": x() }],
        "scroll-pt": [{ "scroll-pt": x() }],
        "scroll-pr": [{ "scroll-pr": x() }],
        "scroll-pb": [{ "scroll-pb": x() }],
        "scroll-pl": [{ "scroll-pl": x() }],
        "snap-align": [{ snap: ["start", "end", "center", "align-none"] }],
        "snap-stop": [{ snap: ["normal", "always"] }],
        "snap-type": [{ snap: ["none", "x", "y", "both"] }],
        "snap-strictness": [{ snap: ["mandatory", "proximity"] }],
        touch: [{ touch: ["auto", "none", "manipulation"] }],
        "touch-x": [{ "touch-pan": ["x", "left", "right"] }],
        "touch-y": [{ "touch-pan": ["y", "up", "down"] }],
        "touch-pz": ["touch-pinch-zoom"],
        select: [{ select: ["none", "text", "all", "auto"] }],
        "will-change": [{ "will-change": ["auto", "scroll", "contents", "transform", m, u] }],
        fill: [{ fill: ["none", ...b()] }],
        "stroke-w": [{ stroke: [w, te, W, pe] }],
        stroke: [{ stroke: ["none", ...b()] }],
        "forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }],
      },
      conflictingClassGroups: {
        overflow: ["overflow-x", "overflow-y"],
        overscroll: ["overscroll-x", "overscroll-y"],
        inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"],
        "inset-x": ["right", "left"],
        "inset-y": ["top", "bottom"],
        flex: ["basis", "grow", "shrink"],
        gap: ["gap-x", "gap-y"],
        p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
        px: ["pr", "pl"],
        py: ["pt", "pb"],
        m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
        mx: ["mr", "ml"],
        my: ["mt", "mb"],
        size: ["w", "h"],
        "font-size": ["leading"],
        "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
        "fvn-ordinal": ["fvn-normal"],
        "fvn-slashed-zero": ["fvn-normal"],
        "fvn-figure": ["fvn-normal"],
        "fvn-spacing": ["fvn-normal"],
        "fvn-fraction": ["fvn-normal"],
        "line-clamp": ["display", "overflow"],
        rounded: [
          "rounded-s",
          "rounded-e",
          "rounded-t",
          "rounded-r",
          "rounded-b",
          "rounded-l",
          "rounded-ss",
          "rounded-se",
          "rounded-ee",
          "rounded-es",
          "rounded-tl",
          "rounded-tr",
          "rounded-br",
          "rounded-bl",
        ],
        "rounded-s": ["rounded-ss", "rounded-es"],
        "rounded-e": ["rounded-se", "rounded-ee"],
        "rounded-t": ["rounded-tl", "rounded-tr"],
        "rounded-r": ["rounded-tr", "rounded-br"],
        "rounded-b": ["rounded-br", "rounded-bl"],
        "rounded-l": ["rounded-tl", "rounded-bl"],
        "border-spacing": ["border-spacing-x", "border-spacing-y"],
        "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
        "border-w-x": ["border-w-r", "border-w-l"],
        "border-w-y": ["border-w-t", "border-w-b"],
        "border-color": [
          "border-color-x",
          "border-color-y",
          "border-color-s",
          "border-color-e",
          "border-color-t",
          "border-color-r",
          "border-color-b",
          "border-color-l",
        ],
        "border-color-x": ["border-color-r", "border-color-l"],
        "border-color-y": ["border-color-t", "border-color-b"],
        translate: ["translate-x", "translate-y", "translate-none"],
        "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
        "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
        "scroll-mx": ["scroll-mr", "scroll-ml"],
        "scroll-my": ["scroll-mt", "scroll-mb"],
        "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
        "scroll-px": ["scroll-pr", "scroll-pl"],
        "scroll-py": ["scroll-pt", "scroll-pb"],
        touch: ["touch-x", "touch-y", "touch-pz"],
        "touch-x": ["touch"],
        "touch-y": ["touch"],
        "touch-pz": ["touch"],
      },
      conflictingClassGroupModifiers: { "font-size": ["leading"] },
      orderSensitiveModifiers: [
        "*",
        "**",
        "after",
        "backdrop",
        "before",
        "details-content",
        "file",
        "first-letter",
        "first-line",
        "marker",
        "placeholder",
        "selection",
      ],
    };
  },
  eo = _t(Qt);
function Ue(...e) {
  return eo(Ve(e));
}
const to = yt(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "dark:hover:opacity-70",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
function oo({ className: e, variant: o, size: t, asChild: r = !1, loading: n = !1, disabled: i, children: s, ...a }) {
  const l = r ? pt : "button";
  return g.jsx(l, {
    "data-slot": "button",
    className: Ue(to({ variant: o, size: t, className: e })),
    disabled: n || i,
    "aria-disabled": n || i,
    ...a,
    children: n ? "Processing..." : s,
  });
}
const ro = "bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6";
function Ye({ errors: e, render: o }) {
  const t = !!e && (!Array.isArray(e) || e.length > 0),
    r = e ? (Array.isArray(e) ? e : [e]) : [];
  return g.jsx("div", {
    role: "alert",
    "aria-live": "assertive",
    className: ro,
    style: t ? void 0 : { display: "none" },
    "aria-hidden": !t,
    children:
      t &&
      g.jsxs("div", {
        className: "flex",
        children: [
          g.jsx("div", {
            className: "flex-shrink-0",
            children: g.jsx("svg", {
              className: "h-5 w-5 text-red-500",
              fill: "currentColor",
              viewBox: "0 0 20 20",
              children: g.jsx("path", {
                fillRule: "evenodd",
                d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
                clipRule: "evenodd",
              }),
            }),
          }),
          g.jsxs("div", {
            className: "ml-3",
            children: [
              g.jsxs("h3", { className: "text-sm font-medium text-red-800", children: ["Error", r.length > 1 ? "s" : ""] }),
              g.jsx("div", {
                className: "mt-2 text-sm",
                children: g.jsx("ul", {
                  className: "list-disc pl-5 space-y-1",
                  children: r.map((n, i) =>
                    g.jsx("li", { children: o ? o(n) : typeof n == "string" ? g.jsx("span", { dangerouslySetInnerHTML: { __html: n } }) : n }, i)
                  ),
                }),
              }),
            ],
          }),
        ],
      }),
  });
}
const no = $.memo(Ye);
no.displayName = "ErrorAlert";
function so({
  id: e,
  name: o,
  label: t,
  type: r = "text",
  required: n = !1,
  placeholder: i,
  value: s = "",
  onChange: a,
  error: l,
  forceShowError: d = !1,
  ...f
}) {
  const [c, y] = p.useState(!1),
    C = `${e}-error`,
    k = p.useCallback(
      (S) => {
        const E = S.target.value;
        a?.(E);
      },
      [a]
    ),
    v = p.useCallback(() => {
      y(!0);
    }, []),
    h = (c || d) && !!l;
  return g.jsxs("div", {
    className: "mb-4",
    children: [
      g.jsxs("label", {
        htmlFor: e,
        className: "block text-sm font-medium text-gray-700 mb-1",
        children: [t, n && g.jsx("span", { className: "text-red-500 ml-1", "aria-hidden": "true", children: "*" })],
      }),
      g.jsx("input", {
        id: e,
        name: o || e,
        type: r,
        defaultValue: s,
        onChange: k,
        onBlur: v,
        placeholder: i,
        required: n,
        "aria-required": n,
        "aria-invalid": h,
        "aria-describedby": h ? C : void 0,
        className: Ue(
          "w-full p-2 border rounded focus:ring-2 focus:outline-none",
          h ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
        ),
        ...f,
      }),
      h && g.jsx(Ye, { errors: l }),
    ],
  });
}
const io = $.memo(so);
io.displayName = "InputField";
function Xe(e, [o, t]) {
  return Math.min(t, Math.max(o, e));
}
function q(e, o, { checkForDefaultPrevented: t = !0 } = {}) {
  return function (n) {
    if ((e?.(n), t === !1 || !n.defaultPrevented)) return o?.(n);
  };
}
function qe(e, o = []) {
  let t = [];
  function r(i, s) {
    const a = p.createContext(s),
      l = t.length;
    t = [...t, s];
    const d = (c) => {
      const { scope: y, children: C, ...k } = c,
        v = y?.[e]?.[l] || a,
        h = p.useMemo(() => k, Object.values(k));
      return g.jsx(v.Provider, { value: h, children: C });
    };
    d.displayName = i + "Provider";
    function f(c, y) {
      const C = y?.[e]?.[l] || a,
        k = p.useContext(C);
      if (k) return k;
      if (s !== void 0) return s;
      throw new Error(`\`${c}\` must be used within \`${i}\``);
    }
    return [d, f];
  }
  const n = () => {
    const i = t.map((s) => p.createContext(s));
    return function (a) {
      const l = a?.[e] || i;
      return p.useMemo(() => ({ [`__scope${e}`]: { ...a, [e]: l } }), [a, l]);
    };
  };
  return (n.scopeName = e), [r, ao(n, ...o)];
}
function ao(...e) {
  const o = e[0];
  if (e.length === 1) return o;
  const t = () => {
    const r = e.map((n) => ({ useScope: n(), scopeName: n.scopeName }));
    return function (i) {
      const s = r.reduce((a, { useScope: l, scopeName: d }) => {
        const c = l(i)[`__scope${d}`];
        return { ...a, ...c };
      }, {});
      return p.useMemo(() => ({ [`__scope${o.scopeName}`]: s }), [s]);
    };
  };
  return (t.scopeName = o.scopeName), t;
}
var Je = globalThis?.document ? p.useLayoutEffect : () => {},
  lo = ft[" useInsertionEffect ".trim().toString()] || Je;
function co({ prop: e, defaultProp: o, onChange: t = () => {}, caller: r }) {
  const [n, i, s] = uo({ defaultProp: o, onChange: t }),
    a = e !== void 0,
    l = a ? e : n;
  {
    const f = p.useRef(e !== void 0);
    p.useEffect(() => {
      const c = f.current;
      c !== a &&
        console.warn(
          `${r} is changing from ${c ? "controlled" : "uncontrolled"} to ${a ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
        ),
        (f.current = a);
    }, [a, r]);
  }
  const d = p.useCallback(
    (f) => {
      if (a) {
        const c = mo(f) ? f(e) : f;
        c !== e && s.current?.(c);
      } else i(f);
    },
    [a, e, i, s]
  );
  return [l, d];
}
function uo({ defaultProp: e, onChange: o }) {
  const [t, r] = p.useState(e),
    n = p.useRef(t),
    i = p.useRef(o);
  return (
    lo(() => {
      i.current = o;
    }, [o]),
    p.useEffect(() => {
      n.current !== t && (i.current?.(t), (n.current = t));
    }, [t, n]),
    [t, r, i]
  );
}
function mo(e) {
  return typeof e == "function";
}
var fo = p.createContext(void 0);
function po(e) {
  const o = p.useContext(fo);
  return e || o || "ltr";
}
function bo(e) {
  const o = p.useRef({ value: e, previous: e });
  return p.useMemo(() => (o.current.value !== e && ((o.current.previous = o.current.value), (o.current.value = e)), o.current.previous), [e]);
}
function go(e) {
  const [o, t] = p.useState(void 0);
  return (
    Je(() => {
      if (e) {
        t({ width: e.offsetWidth, height: e.offsetHeight });
        const r = new ResizeObserver((n) => {
          if (!Array.isArray(n) || !n.length) return;
          const i = n[0];
          let s, a;
          if ("borderBoxSize" in i) {
            const l = i.borderBoxSize,
              d = Array.isArray(l) ? l[0] : l;
            (s = d.inlineSize), (a = d.blockSize);
          } else (s = e.offsetWidth), (a = e.offsetHeight);
          t({ width: s, height: a });
        });
        return r.observe(e, { box: "border-box" }), () => r.unobserve(e);
      } else t(void 0);
    }, [e]),
    o
  );
}
var ho = ["a", "button", "div", "form", "h2", "h3", "img", "input", "label", "li", "nav", "ol", "p", "select", "span", "svg", "ul"],
  oe = ho.reduce((e, o) => {
    const t = ce(`Primitive.${o}`),
      r = p.forwardRef((n, i) => {
        const { asChild: s, ...a } = n,
          l = s ? t : o;
        return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), g.jsx(l, { ...a, ref: i });
      });
    return (r.displayName = `Primitive.${o}`), { ...e, [o]: r };
  }, {});
function xo(e) {
  const o = e + "CollectionProvider",
    [t, r] = qe(o),
    [n, i] = t(o, { collectionRef: { current: null }, itemMap: new Map() }),
    s = (v) => {
      const { scope: h, children: S } = v,
        E = $.useRef(null),
        P = $.useRef(new Map()).current;
      return g.jsx(n, { scope: h, itemMap: P, collectionRef: E, children: S });
    };
  s.displayName = o;
  const a = e + "CollectionSlot",
    l = ce(a),
    d = $.forwardRef((v, h) => {
      const { scope: S, children: E } = v,
        P = i(a, S),
        R = H(h, P.collectionRef);
      return g.jsx(l, { ref: R, children: E });
    });
  d.displayName = a;
  const f = e + "CollectionItemSlot",
    c = "data-radix-collection-item",
    y = ce(f),
    C = $.forwardRef((v, h) => {
      const { scope: S, children: E, ...P } = v,
        R = $.useRef(null),
        N = H(h, R),
        I = i(f, S);
      return $.useEffect(() => (I.itemMap.set(R, { ref: R, ...P }), () => void I.itemMap.delete(R))), g.jsx(y, { [c]: "", ref: N, children: E });
    });
  C.displayName = f;
  function k(v) {
    const h = i(e + "CollectionConsumer", v);
    return $.useCallback(() => {
      const E = h.collectionRef.current;
      if (!E) return [];
      const P = Array.from(E.querySelectorAll(`[${c}]`));
      return Array.from(h.itemMap.values()).sort((I, B) => P.indexOf(I.ref.current) - P.indexOf(B.ref.current));
    }, [h.collectionRef, h.itemMap]);
  }
  return [{ Provider: s, Slot: d, ItemSlot: C }, k, r];
}
var Ze = ["PageUp", "PageDown"],
  Qe = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
  et = {
    "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
    "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
    "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
    "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"],
  },
  Q = "Slider",
  [xe, vo, yo] = xo(Q),
  [tt, Go] = qe(Q, [yo]),
  [wo, de] = tt(Q),
  ot = p.forwardRef((e, o) => {
    const {
        name: t,
        min: r = 0,
        max: n = 100,
        step: i = 1,
        orientation: s = "horizontal",
        disabled: a = !1,
        minStepsBetweenThumbs: l = 0,
        defaultValue: d = [r],
        value: f,
        onValueChange: c = () => {},
        onValueCommit: y = () => {},
        inverted: C = !1,
        form: k,
        ...v
      } = e,
      h = p.useRef(new Set()),
      S = p.useRef(0),
      P = s === "horizontal" ? ko : So,
      [R = [], N] = co({
        prop: f,
        defaultProp: d,
        onChange: (A) => {
          [...h.current][S.current]?.focus(), c(A);
        },
      }),
      I = p.useRef(R);
    function B(A) {
      const D = Mo(R, A);
      F(A, D);
    }
    function x(A) {
      F(A, S.current);
    }
    function O() {
      const A = I.current[S.current];
      R[S.current] !== A && y(R);
    }
    function F(A, D, { commit: U } = { commit: !1 }) {
      const Y = No(i),
        L = jo(Math.round((A - r) / i) * i + r, Y),
        j = Xe(L, [r, n]);
      N((T = []) => {
        const b = Po(T, j, D);
        if (Io(b, l * i)) {
          S.current = b.indexOf(j);
          const ee = String(b) !== String(T);
          return ee && U && y(b), ee ? b : T;
        } else return T;
      });
    }
    return g.jsx(wo, {
      scope: e.__scopeSlider,
      name: t,
      disabled: a,
      min: r,
      max: n,
      valueIndexToChangeRef: S,
      thumbs: h.current,
      values: R,
      orientation: s,
      form: k,
      children: g.jsx(xe.Provider, {
        scope: e.__scopeSlider,
        children: g.jsx(xe.Slot, {
          scope: e.__scopeSlider,
          children: g.jsx(P, {
            "aria-disabled": a,
            "data-disabled": a ? "" : void 0,
            ...v,
            ref: o,
            onPointerDown: q(v.onPointerDown, () => {
              a || (I.current = R);
            }),
            min: r,
            max: n,
            inverted: C,
            onSlideStart: a ? void 0 : B,
            onSlideMove: a ? void 0 : x,
            onSlideEnd: a ? void 0 : O,
            onHomeKeyDown: () => !a && F(r, 0, { commit: !0 }),
            onEndKeyDown: () => !a && F(n, R.length - 1, { commit: !0 }),
            onStepKeyDown: ({ event: A, direction: D }) => {
              if (!a) {
                const L = Ze.includes(A.key) || (A.shiftKey && Qe.includes(A.key)) ? 10 : 1,
                  j = S.current,
                  T = R[j],
                  b = i * L * D;
                F(T + b, j, { commit: !0 });
              }
            },
          }),
        }),
      }),
    });
  });
ot.displayName = Q;
var [rt, nt] = tt(Q, { startEdge: "left", endEdge: "right", size: "width", direction: 1 }),
  ko = p.forwardRef((e, o) => {
    const { min: t, max: r, dir: n, inverted: i, onSlideStart: s, onSlideMove: a, onSlideEnd: l, onStepKeyDown: d, ...f } = e,
      [c, y] = p.useState(null),
      C = H(o, (P) => y(P)),
      k = p.useRef(void 0),
      v = po(n),
      h = v === "ltr",
      S = (h && !i) || (!h && i);
    function E(P) {
      const R = k.current || c.getBoundingClientRect(),
        N = [0, R.width],
        B = ke(N, S ? [t, r] : [r, t]);
      return (k.current = R), B(P - R.left);
    }
    return g.jsx(rt, {
      scope: e.__scopeSlider,
      startEdge: S ? "left" : "right",
      endEdge: S ? "right" : "left",
      direction: S ? 1 : -1,
      size: "width",
      children: g.jsx(st, {
        dir: v,
        "data-orientation": "horizontal",
        ...f,
        ref: C,
        style: { ...f.style, "--radix-slider-thumb-transform": "translateX(-50%)" },
        onSlideStart: (P) => {
          const R = E(P.clientX);
          s?.(R);
        },
        onSlideMove: (P) => {
          const R = E(P.clientX);
          a?.(R);
        },
        onSlideEnd: () => {
          (k.current = void 0), l?.();
        },
        onStepKeyDown: (P) => {
          const N = et[S ? "from-left" : "from-right"].includes(P.key);
          d?.({ event: P, direction: N ? -1 : 1 });
        },
      }),
    });
  }),
  So = p.forwardRef((e, o) => {
    const { min: t, max: r, inverted: n, onSlideStart: i, onSlideMove: s, onSlideEnd: a, onStepKeyDown: l, ...d } = e,
      f = p.useRef(null),
      c = H(o, f),
      y = p.useRef(void 0),
      C = !n;
    function k(v) {
      const h = y.current || f.current.getBoundingClientRect(),
        S = [0, h.height],
        P = ke(S, C ? [r, t] : [t, r]);
      return (y.current = h), P(v - h.top);
    }
    return g.jsx(rt, {
      scope: e.__scopeSlider,
      startEdge: C ? "bottom" : "top",
      endEdge: C ? "top" : "bottom",
      size: "height",
      direction: C ? 1 : -1,
      children: g.jsx(st, {
        "data-orientation": "vertical",
        ...d,
        ref: c,
        style: { ...d.style, "--radix-slider-thumb-transform": "translateY(50%)" },
        onSlideStart: (v) => {
          const h = k(v.clientY);
          i?.(h);
        },
        onSlideMove: (v) => {
          const h = k(v.clientY);
          s?.(h);
        },
        onSlideEnd: () => {
          (y.current = void 0), a?.();
        },
        onStepKeyDown: (v) => {
          const S = et[C ? "from-bottom" : "from-top"].includes(v.key);
          l?.({ event: v, direction: S ? -1 : 1 });
        },
      }),
    });
  }),
  st = p.forwardRef((e, o) => {
    const { __scopeSlider: t, onSlideStart: r, onSlideMove: n, onSlideEnd: i, onHomeKeyDown: s, onEndKeyDown: a, onStepKeyDown: l, ...d } = e,
      f = de(Q, t);
    return g.jsx(oe.span, {
      ...d,
      ref: o,
      onKeyDown: q(e.onKeyDown, (c) => {
        c.key === "Home"
          ? (s(c), c.preventDefault())
          : c.key === "End"
            ? (a(c), c.preventDefault())
            : Ze.concat(Qe).includes(c.key) && (l(c), c.preventDefault());
      }),
      onPointerDown: q(e.onPointerDown, (c) => {
        const y = c.target;
        y.setPointerCapture(c.pointerId), c.preventDefault(), f.thumbs.has(y) ? y.focus() : r(c);
      }),
      onPointerMove: q(e.onPointerMove, (c) => {
        c.target.hasPointerCapture(c.pointerId) && n(c);
      }),
      onPointerUp: q(e.onPointerUp, (c) => {
        const y = c.target;
        y.hasPointerCapture(c.pointerId) && (y.releasePointerCapture(c.pointerId), i(c));
      }),
    });
  }),
  it = "SliderTrack",
  at = p.forwardRef((e, o) => {
    const { __scopeSlider: t, ...r } = e,
      n = de(it, t);
    return g.jsx(oe.span, { "data-disabled": n.disabled ? "" : void 0, "data-orientation": n.orientation, ...r, ref: o });
  });
at.displayName = it;
var ve = "SliderRange",
  lt = p.forwardRef((e, o) => {
    const { __scopeSlider: t, ...r } = e,
      n = de(ve, t),
      i = nt(ve, t),
      s = p.useRef(null),
      a = H(o, s),
      l = n.values.length,
      d = n.values.map((y) => ut(y, n.min, n.max)),
      f = l > 1 ? Math.min(...d) : 0,
      c = 100 - Math.max(...d);
    return g.jsx(oe.span, {
      "data-orientation": n.orientation,
      "data-disabled": n.disabled ? "" : void 0,
      ...r,
      ref: a,
      style: { ...e.style, [i.startEdge]: f + "%", [i.endEdge]: c + "%" },
    });
  });
lt.displayName = ve;
var ye = "SliderThumb",
  ct = p.forwardRef((e, o) => {
    const t = vo(e.__scopeSlider),
      [r, n] = p.useState(null),
      i = H(o, (a) => n(a)),
      s = p.useMemo(() => (r ? t().findIndex((a) => a.ref.current === r) : -1), [t, r]);
    return g.jsx(Co, { ...e, ref: i, index: s });
  }),
  Co = p.forwardRef((e, o) => {
    const { __scopeSlider: t, index: r, name: n, ...i } = e,
      s = de(ye, t),
      a = nt(ye, t),
      [l, d] = p.useState(null),
      f = H(o, (E) => d(E)),
      c = l ? s.form || !!l.closest("form") : !0,
      y = go(l),
      C = s.values[r],
      k = C === void 0 ? 0 : ut(C, s.min, s.max),
      v = Eo(r, s.values.length),
      h = y?.[a.size],
      S = h ? zo(h, k, a.direction) : 0;
    return (
      p.useEffect(() => {
        if (l)
          return (
            s.thumbs.add(l),
            () => {
              s.thumbs.delete(l);
            }
          );
      }, [l, s.thumbs]),
      g.jsxs("span", {
        style: { transform: "var(--radix-slider-thumb-transform)", position: "absolute", [a.startEdge]: `calc(${k}% + ${S}px)` },
        children: [
          g.jsx(xe.ItemSlot, {
            scope: e.__scopeSlider,
            children: g.jsx(oe.span, {
              role: "slider",
              "aria-label": e["aria-label"] || v,
              "aria-valuemin": s.min,
              "aria-valuenow": C,
              "aria-valuemax": s.max,
              "aria-orientation": s.orientation,
              "data-orientation": s.orientation,
              "data-disabled": s.disabled ? "" : void 0,
              tabIndex: s.disabled ? void 0 : 0,
              ...i,
              ref: f,
              style: C === void 0 ? { display: "none" } : e.style,
              onFocus: q(e.onFocus, () => {
                s.valueIndexToChangeRef.current = r;
              }),
            }),
          }),
          c && g.jsx(dt, { name: n ?? (s.name ? s.name + (s.values.length > 1 ? "[]" : "") : void 0), form: s.form, value: C }, r),
        ],
      })
    );
  });
ct.displayName = ye;
var Ro = "RadioBubbleInput",
  dt = p.forwardRef(({ __scopeSlider: e, value: o, ...t }, r) => {
    const n = p.useRef(null),
      i = H(n, r),
      s = bo(o);
    return (
      p.useEffect(() => {
        const a = n.current;
        if (!a) return;
        const l = window.HTMLInputElement.prototype,
          f = Object.getOwnPropertyDescriptor(l, "value").set;
        if (s !== o && f) {
          const c = new Event("input", { bubbles: !0 });
          f.call(a, o), a.dispatchEvent(c);
        }
      }, [s, o]),
      g.jsx(oe.input, { style: { display: "none" }, ...t, ref: i, defaultValue: o })
    );
  });
dt.displayName = Ro;
function Po(e = [], o, t) {
  const r = [...e];
  return (r[t] = o), r.sort((n, i) => n - i);
}
function ut(e, o, t) {
  const i = (100 / (t - o)) * (e - o);
  return Xe(i, [0, 100]);
}
function Eo(e, o) {
  return o > 2 ? `Value ${e + 1} of ${o}` : o === 2 ? ["Minimum", "Maximum"][e] : void 0;
}
function Mo(e, o) {
  if (e.length === 1) return 0;
  const t = e.map((n) => Math.abs(n - o)),
    r = Math.min(...t);
  return t.indexOf(r);
}
function zo(e, o, t) {
  const r = e / 2,
    i = ke([0, 50], [0, r]);
  return (r - i(o) * t) * t;
}
function Ao(e) {
  return e.slice(0, -1).map((o, t) => e[t + 1] - o);
}
function Io(e, o) {
  if (o > 0) {
    const t = Ao(e);
    return Math.min(...t) >= o;
  }
  return !0;
}
function ke(e, o) {
  return (t) => {
    if (e[0] === e[1] || o[0] === o[1]) return o[0];
    const r = (o[1] - o[0]) / (e[1] - e[0]);
    return o[0] + r * (t - e[0]);
  };
}
function No(e) {
  return (String(e).split(".")[1] || "").length;
}
function jo(e, o) {
  const t = Math.pow(10, o);
  return Math.round(e * t) / t;
}
var mt = ot,
  _o = at,
  To = lt,
  Vo = ct;
const Do = p.forwardRef((e, o) => {
  const t = (d) => (d <= 3 ? "#10b981" : d <= 6 ? "#fbbf24" : "#ef4444"),
    r = e.value?.[0] ?? 0,
    n = t(r),
    s = ((d) => {
      const f = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(d);
      return f ? { r: parseInt(f[1], 16), g: parseInt(f[2], 16), b: parseInt(f[3], 16) } : null;
    })(n),
    a = s ? `rgba(${s.r}, ${s.g}, ${s.b}, 0.3)` : "rgba(0, 0, 0, 0.3)",
    l = s ? `rgba(${s.r}, ${s.g}, ${s.b}, 0.5)` : "rgba(0, 0, 0, 0.5)";
  return g.jsxs("div", {
    style: { padding: "15px 0" },
    children: [
      g.jsx("style", {
        children: `
          .slider-root {
            position: relative;
            display: flex;
            align-items: center;
            user-select: none;
            touch-action: none;
            width: 100%;
            height: 20px;
          }
          
          .slider-track {
            background: linear-gradient(to right, #10b981, #fbbf24, #ef4444);
            position: relative;
            flex-grow: 1;
            height: 10px;
            border-radius: 9999px;
          }
          
          .slider-range {
            position: absolute;
            background-color: rgba(255, 255, 255, 0.3);
            height: 100%;
          }
          
          .slider-thumb {
            display: block;
            width: 28px;
            height: 28px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .slider-thumb:hover {
            filter: brightness(0.95);
          }
          
          .slider-thumb:focus {
            outline: none;
          }

          .slider-thumb-heartbeat {
            animation: steady-pulse 1s ease-in-out infinite;
          }

          @keyframes steady-pulse {
            0% {
              transform: scale(0.95);
              box-shadow: 0 2px 10px var(--thumb-color-shadow, rgba(0, 0, 0, 0.3));
            }
            50% {
              transform: scale(0.99);
              box-shadow: 0 0 20px var(--thumb-color-glow, rgba(0, 0, 0, 0.5));
            }
            100% {
              transform: scale(1);
              box-shadow: 0 2px 10px var(--thumb-color-shadow, rgba(0, 0, 0, 0.3));
            }
          }
        `,
      }),
      g.jsxs(mt, {
        ref: o,
        className: "slider-root",
        ...e,
        children: [
          g.jsx(_o, { className: "slider-track", children: g.jsx(To, { className: "slider-range" }) }),
          g.jsx(Vo, {
            className: "slider-thumb slider-thumb-heartbeat",
            style: {
              backgroundColor: n,
              border: `2px solid ${n}`,
              boxShadow: `0 0 0 5px ${n}33`,
              "--thumb-color-shadow": a,
              "--thumb-color-glow": l,
            },
          }),
        ],
      }),
    ],
  });
});
Do.displayName = mt.displayName;
const Bo = $.memo(function ({ loading: o = !1, className: t, children: r, ...n }) {
  return g.jsx(oo, { type: "submit", size: "lg", loading: o, className: t, ...n, children: r });
});
Bo.displayName = "SubmitButton";
export { oo as B, Ye as E, io as I, Bo as S, Do as a, Ue as c };
