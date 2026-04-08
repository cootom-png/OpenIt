var g, ve, T, N, Le, H, pe, z, D, K, G, ue, me, fe, C, Z, _e, Me, Ie, Ee, Ce, Re, we, R, J, b, he, Fe, d, v, Pe, L, ke, $, E, Ve, q, be, na, ta, W, Be, Oe, w, Q, ee, ae, Ue, He, re, Te, Ne, oa, Ge, Se, ne, ge, x, te, F, sa, y, ia, oe, P, xe, We, ye, k, se, V, ie, ca, Ae, B;
(g = {})[g.None = 0] = "None", g[g.Anonymous = 1] = "Anonymous", g[g.NonConstant = 2] = "NonConstant", g[g.Xref = 4] = "Xref", g[g.XrefOverlay = 8] = "XrefOverlay", g[g.ExternallyDependent = 16] = "ExternallyDependent", g[g.ResolvedOrDependent = 32] = "ResolvedOrDependent", g[g.ReferencedXref = 64] = "ReferencedXref";
(ve = {})[ve.BYBLOCK = 0] = "BYBLOCK", ve[ve.BYLAYER = 256] = "BYLAYER";
(T = {})[T.Rotated = 0] = "Rotated", T[T.Aligned = 1] = "Aligned", T[T.Angular = 2] = "Angular", T[T.Diameter = 3] = "Diameter", T[T.Radius = 4] = "Radius", T[T.Angular3Point = 5] = "Angular3Point", T[T.Ordinate = 6] = "Ordinate", T[T.ReferenceIsExclusive = 32] = "ReferenceIsExclusive", T[T.IsOrdinateXTypeFlag = 64] = "IsOrdinateXTypeFlag", T[T.IsCustomTextPositionFlag = 128] = "IsCustomTextPositionFlag";
(N = {})[N.TopLeft = 1] = "TopLeft", N[N.TopCenter = 2] = "TopCenter", N[N.TopRight = 3] = "TopRight", N[N.MiddleLeft = 4] = "MiddleLeft", N[N.MiddleCenter = 5] = "MiddleCenter", N[N.MiddleRight = 6] = "MiddleRight", N[N.BottomLeft = 7] = "BottomLeft", N[N.BottomCenter = 8] = "BottomCenter", N[N.BottomRight = 9] = "BottomRight";
(Le = {})[Le.AtLeast = 1] = "AtLeast", Le[Le.Exact = 2] = "Exact";
var fa = ((H = {})[H.Center = 0] = "Center", H[H.Above = 1] = "Above", H[H.Outside = 2] = "Outside", H[H.JIS = 3] = "JIS", H[H.Below = 4] = "Below", H);
(pe = {})[pe.WithDimension = 0] = "WithDimension", pe[pe.AddLeader = 1] = "AddLeader", pe[pe.Independent = 2] = "Independent";
(z = {})[z.BothOutside = 0] = "BothOutside", z[z.ArrowFirst = 1] = "ArrowFirst", z[z.TextFirst = 2] = "TextFirst", z[z.Auto = 3] = "Auto";
var De = ((D = {})[D.Feet = 0] = "Feet", D[D.None = 1] = "None", D[D.Inch = 2] = "Inch", D[D.FeetAndInch = 3] = "FeetAndInch", D[D.Leading = 4] = "Leading", D[D.Trailing = 8] = "Trailing", D[D.LeadingAndTrailing = 12] = "LeadingAndTrailing", D), Vr = ((K = {})[K.None = 0] = "None", K[K.Leading = 1] = "Leading", K[K.Trailing = 2] = "Trailing", K[K.LeadingAndTrailing = 3] = "LeadingAndTrailing", K), Br = ((G = {})[G.Center = 0] = "Center", G[G.First = 1] = "First", G[G.Second = 2] = "Second", G[G.OverFirst = 3] = "OverFirst", G[G.OverSecond = 4] = "OverSecond", G), Ur = ((ue = {})[ue.Bottom = 0] = "Bottom", ue[ue.Center = 1] = "Center", ue[ue.Top = 2] = "Top", ue);
(me = {})[me.None = 0] = "None", me[me.UseDrawingBackground = 1] = "UseDrawingBackground", me[me.Custom = 2] = "Custom";
(fe = {})[fe.Horizontal = 0] = "Horizontal", fe[fe.Diagonal = 1] = "Diagonal", fe[fe.NotStacked = 2] = "NotStacked";
(C = {})[C.Scientific = 1] = "Scientific", C[C.Decimal = 2] = "Decimal", C[C.Engineering = 3] = "Engineering", C[C.Architectural = 4] = "Architectural", C[C.Fractional = 5] = "Fractional", C[C.WindowDesktop = 6] = "WindowDesktop";
(Z = {})[Z.Decimal = 0] = "Decimal", Z[Z.DegreesMinutesSecond = 1] = "DegreesMinutesSecond", Z[Z.Gradian = 2] = "Gradian", Z[Z.Radian = 3] = "Radian";
(_e = {})[_e.PatternFill = 0] = "PatternFill", _e[_e.SolidFill = 1] = "SolidFill";
(Me = {})[Me.NonAssociative = 0] = "NonAssociative", Me[Me.Associative = 1] = "Associative";
(Ie = {})[Ie.Normal = 0] = "Normal", Ie[Ie.Outer = 1] = "Outer", Ie[Ie.Ignore = 2] = "Ignore";
(Ee = {})[Ee.UserDefined = 0] = "UserDefined", Ee[Ee.Predefined = 1] = "Predefined", Ee[Ee.Custom = 2] = "Custom";
(Ce = {})[Ce.NotAnnotated = 0] = "NotAnnotated", Ce[Ce.Annotated = 1] = "Annotated";
(Re = {})[Re.Solid = 0] = "Solid", Re[Re.Gradient = 1] = "Gradient";
(we = {})[we.TwoColor = 0] = "TwoColor", we[we.OneColor = 1] = "OneColor";
var Hr = ((R = {})[R.Default = 0] = "Default", R[R.External = 1] = "External", R[R.Polyline = 2] = "Polyline", R[R.Derived = 4] = "Derived", R[R.Textbox = 8] = "Textbox", R[R.Outermost = 16] = "Outermost", R), ze = ((J = {})[J.Line = 1] = "Line", J[J.Circular = 2] = "Circular", J[J.Elliptic = 3] = "Elliptic", J[J.Spline = 4] = "Spline", J), Gr = ((b = {})[b.Off = 0] = "Off", b[b.Solid = 1] = "Solid", b[b.Dashed = 2] = "Dashed", b[b.Dotted = 3] = "Dotted", b[b.ShotDash = 4] = "ShotDash", b[b.MediumDash = 5] = "MediumDash", b[b.LongDash = 6] = "LongDash", b[b.DoubleShortDash = 7] = "DoubleShortDash", b[b.DoubleMediumDash = 8] = "DoubleMediumDash", b[b.DoubleLongDash = 9] = "DoubleLongDash", b[b.DoubleMediumLongDash = 10] = "DoubleMediumLongDash", b[b.SparseDot = 11] = "SparseDot", b);
Gr.Off;
(he = {})[he.Standard = -3] = "Standard", he[he.ByLayer = -2] = "ByLayer", he[he.ByBlock = -1] = "ByBlock";
(Fe = {})[Fe.English = 0] = "English", Fe[Fe.Metric = 1] = "Metric";
(d = {})[d.PERSPECTIVE_MODE = 1] = "PERSPECTIVE_MODE", d[d.FRONT_CLIPPING = 2] = "FRONT_CLIPPING", d[d.BACK_CLIPPING = 4] = "BACK_CLIPPING", d[d.UCS_FOLLOW = 8] = "UCS_FOLLOW", d[d.FRONT_CLIP_NOT_AT_EYE = 16] = "FRONT_CLIP_NOT_AT_EYE", d[d.UCS_ICON_VISIBILITY = 32] = "UCS_ICON_VISIBILITY", d[d.UCS_ICON_AT_ORIGIN = 64] = "UCS_ICON_AT_ORIGIN", d[d.FAST_ZOOM = 128] = "FAST_ZOOM", d[d.SNAP_MODE = 256] = "SNAP_MODE", d[d.GRID_MODE = 512] = "GRID_MODE", d[d.ISOMETRIC_SNAP_STYLE = 1024] = "ISOMETRIC_SNAP_STYLE", d[d.HIDE_PLOT_MODE = 2048] = "HIDE_PLOT_MODE", d[d.K_ISO_PAIR_TOP = 4096] = "K_ISO_PAIR_TOP", d[d.K_ISO_PAIR_RIGHT = 8192] = "K_ISO_PAIR_RIGHT", d[d.VIEWPORT_ZOOM_LOCKING = 16384] = "VIEWPORT_ZOOM_LOCKING", d[d.UNUSED = 32768] = "UNUSED", d[d.NON_RECTANGULAR_CLIPPING = 65536] = "NON_RECTANGULAR_CLIPPING", d[d.VIEWPORT_OFF = 131072] = "VIEWPORT_OFF", d[d.GRID_BEYOND_DRAWING_LIMITS = 262144] = "GRID_BEYOND_DRAWING_LIMITS", d[d.ADAPTIVE_GRID_DISPLAY = 524288] = "ADAPTIVE_GRID_DISPLAY", d[d.SUBDIVISION_BELOW_SPACING = 1048576] = "SUBDIVISION_BELOW_SPACING", d[d.GRID_FOLLOWS_WORKPLANE = 2097152] = "GRID_FOLLOWS_WORKPLANE";
(v = {})[v.OPTIMIZED_2D = 0] = "OPTIMIZED_2D", v[v.WIREFRAME = 1] = "WIREFRAME", v[v.HIDDEN_LINE = 2] = "HIDDEN_LINE", v[v.FLAT_SHADED = 3] = "FLAT_SHADED", v[v.GOURAUD_SHADED = 4] = "GOURAUD_SHADED", v[v.FLAT_SHADED_WITH_WIREFRAME = 5] = "FLAT_SHADED_WITH_WIREFRAME", v[v.GOURAUD_SHADED_WITH_WIREFRAME = 6] = "GOURAUD_SHADED_WITH_WIREFRAME";
(Pe = {})[Pe.UCS_UNCHANGED = 0] = "UCS_UNCHANGED", Pe[Pe.HAS_OWN_UCS = 1] = "HAS_OWN_UCS";
(L = {})[L.NON_ORTHOGRAPHIC = 0] = "NON_ORTHOGRAPHIC", L[L.TOP = 1] = "TOP", L[L.BOTTOM = 2] = "BOTTOM", L[L.FRONT = 3] = "FRONT", L[L.BACK = 4] = "BACK", L[L.LEFT = 5] = "LEFT", L[L.RIGHT = 6] = "RIGHT";
(ke = {})[ke.ONE_DISTANT_LIGHT = 0] = "ONE_DISTANT_LIGHT", ke[ke.TWO_DISTANT_LIGHTS = 1] = "TWO_DISTANT_LIGHTS";
($ = {})[$.ByLayer = 0] = "ByLayer", $[$.ByBlock = 1] = "ByBlock", $[$.ByDictionaryDefault = 2] = "ByDictionaryDefault", $[$.ByObject = 3] = "ByObject";
(E = {})[E.NotAllowed = 0] = "NotAllowed", E[E.AllowErase = 1] = "AllowErase", E[E.AllowTransform = 2] = "AllowTransform", E[E.AllowChangeColor = 4] = "AllowChangeColor", E[E.AllowChangeLayer = 8] = "AllowChangeLayer", E[E.AllowChangeLinetype = 16] = "AllowChangeLinetype", E[E.AllowChangeLinetypeScale = 32] = "AllowChangeLinetypeScale", E[E.AllowChangeVisibility = 64] = "AllowChangeVisibility", E[E.AllowClone = 128] = "AllowClone", E[E.AllowChangeLineweight = 256] = "AllowChangeLineweight", E[E.AllowChangePlotStyleName = 512] = "AllowChangePlotStyleName", E[E.AllowAllExceptClone = 895] = "AllowAllExceptClone", E[E.AllowAll = 1023] = "AllowAll", E[E.DisableProxyWarning = 1024] = "DisableProxyWarning", E[E.R13FormatProxy = 32768] = "R13FormatProxy";
function u(e, r, n) {
  return e.code === r && (n == null || e.value === n);
}
function le(e) {
  let r = {};
  e.rewind();
  let n = e.next(), t = n.code;
  if (r.x = n.value, (n = e.next()).code !== t + 10) throw Error("Expected code for point value to be 20 but got " + n.code + ".");
  return r.y = n.value, (n = e.next()).code !== t + 20 ? e.rewind() : r.z = n.value, r;
}
let Xe = Symbol();
function c(e, r) {
  return (n, t, s) => {
    let i = function(m, S = !1) {
      return m.reduce((O, h) => {
        h.pushContext && O.push({});
        let A = O[O.length - 1];
        for (let _ of typeof h.code == "number" ? [h.code] : h.code) {
          let j = A[_] ?? (A[_] = []);
          h.isMultiple && j.length, j.push(h);
        }
        return O;
      }, [{}]);
    }(e, t.debug), l = !1, I = i.length - 1;
    for (; !u(n, 0, "EOF"); ) {
      let m = function(M, U, de) {
        return M.find((ra, kr) => {
          var ma;
          return kr >= de && ((ma = ra[U]) == null ? void 0 : ma.length);
        });
      }(i, n.code, I), S = m == null ? void 0 : m[n.code], O = S == null ? void 0 : S[S.length - 1];
      if (!m || !O) {
        t.rewind();
        break;
      }
      O.isMultiple || m[n.code].pop();
      let { name: h, parser: A, isMultiple: _, isReducible: j } = O, Y = A == null ? void 0 : A(n, t, s);
      if (Y === Xe) {
        t.rewind();
        break;
      }
      if (h) {
        let [M, U] = Wr(s, h);
        _ && !j ? (Object.prototype.hasOwnProperty.call(M, U) || (M[U] = []), M[U].push(Y)) : M[U] = Y;
      }
      O.pushContext && (I -= 1), l = !0, n = t.next();
    }
    return r && Object.setPrototypeOf(s, r), l;
  };
}
function Wr(e, r) {
  let n = r.split(".");
  if (!n.length) throw Error("[parserGenerator::getObjectByPath] Invalid empty path");
  let t = e;
  for (let s = 0; s < n.length - 1; ++s) {
    let i = la(n[s]), l = la(n[s + 1]);
    Object.prototype.hasOwnProperty.call(t, i) || (typeof l == "number" ? t[i] = [] : t[i] = {}), t = t[i];
  }
  return [t, la(n[n.length - 1])];
}
function la(e) {
  let r = Number.parseInt(e);
  return Number.isNaN(r) ? e : r;
}
function a({ value: e }) {
  return e;
}
function o(e, r) {
  return le(r);
}
function p({ value: e }) {
  return !!e;
}
function jr({ value: e }) {
  return e.trim();
}
let Yr = [{ code: 281, name: "isEntity", parser: p }, { code: 280, name: "wasProxy", parser: p }, { code: 91, name: "instanceCount", parser: a }, { code: 90, name: "proxyFlag", parser: a }, { code: 3, name: "appName", parser: a }, { code: 2, name: "cppClassName", parser: a }, { code: 1, name: "name", parser: a }], Xr = c(Yr), zr = [{ code: 0, name: "classes", isMultiple: !0, parser(e, r) {
  if (e.value !== "CLASS") return Xe;
  e = r.next();
  let n = {};
  return Xr(e, r, n), n;
} }], Kr = c(zr);
(Ve = {})[Ve.RayTrace = 0] = "RayTrace", Ve[Ve.ShadowMap = 1] = "ShadowMap";
function X(e, r, n) {
  for (; u(e, 102); ) {
    var t;
    let s = e.value;
    if (e = r.next(), !s.startsWith("{")) {
      r.debug, function(l, I) {
        for (; !u(l, 102) && !u(l, 0, "EOF"); ) l = I.next();
      }(e, r), e = r.next();
      continue;
    }
    let i = s.slice(1).trim();
    n.extensions ?? (n.extensions = {}), (t = n.extensions)[i] ?? (t[i] = []), function(l, I, m) {
      for (; !u(l, 102, "}") && !u(l, 0, "EOF"); ) m.push(l), l = I.next();
    }(e, r, n.extensions[i]), e = r.next();
  }
  r.rewind();
}
let Zr = [{ code: 1001, name: "xdata", isMultiple: !0, parser: Na }], Jr = /* @__PURE__ */ new Set([1010, 1011, 1012, 1013]);
function Na(e, r) {
  var s;
  if (!u(e, 1001)) throw Error("XData must starts with code 1001");
  let n = { appName: e.value, value: [] };
  e = r.next();
  let t = [n.value];
  for (; !u(e, 0, "EOF") && !u(e, 1001) && e.code >= 1e3; ) {
    let i = t[t.length - 1];
    if (e.code === 1002) {
      e.value === "{" ? t.push([]) : (t.pop(), (s = t[t.length - 1]) == null || s.push(i)), e = r.next();
      continue;
    }
    Jr.has(e.code) ? i.push(le(r)) : i.push(e.value), e = r.next();
  }
  return r.rewind(), n;
}
(q = {})[q.CAST_AND_RECEIVE = 0] = "CAST_AND_RECEIVE", q[q.CAST = 1] = "CAST", q[q.RECEIVE = 2] = "RECEIVE", q[q.IGNORE = 3] = "IGNORE";
let f = [...Zr, { code: 284, name: "shadowMode", parser: a }, { code: 390, name: "plotStyleHardId", parser: a }, { code: 380, name: "plotStyleType", parser: a }, { code: 440, name: "transparency", parser: a }, { code: 430, name: "colorName", parser: a }, { code: 420, name: "color", parser: a }, { code: 310, name: "proxyEntity", isMultiple: !0, isReducible: !0, parser: (e, r, n) => (n.proxyEntity ?? "") + e.value }, { code: [92, 160], name: "proxyByte", parser: a }, { code: 60, name: "isVisible", parser: p }, { code: 48, name: "lineTypeScale", parser: a }, { code: 370, name: "lineweight", parser: a }, { code: 62, name: "colorIndex", parser: a }, { code: 347, name: "materialObjectHardId", parser: a }, { code: 6, name: "lineType", parser: a }, { code: 8, name: "layer", parser: a }, { code: 410, name: "layoutTabName", parser: a }, { code: 67, name: "isInPaperSpace", parser: p }, { code: 100 }, { code: 330, name: "ownerBlockRecordSoftId", parser: a }, { code: 102, parser: X }, { code: 102, parser: X }, { code: 102, parser: X }, { code: 5, name: "handle", parser: a }];
function aa(e) {
  return [{ code: 3, name: e, parser: (r, n, t) => (t._code3text = (t._code3text ?? "") + r.value, t._code3text + (t._code1text ?? "")), isMultiple: !0, isReducible: !0 }, { code: 1, name: e, parser: (r, n, t) => (t._code1text = r.value, (t._code3text ?? "") + t._code1text) }];
}
function Sa(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
let $r = { extrusionDirection: { x: 0, y: 0, z: 1 } }, qr = [{ code: 210, name: "extrusionDirection", parser: o }, { code: 51, name: "endAngle", parser: a }, { code: 50, name: "startAngle", parser: a }, { code: 100, name: "subclassMarker", parser: a }, { code: 40, name: "radius", parser: a }, { code: 10, name: "center", parser: o }, { code: 39, name: "thickness", parser: a }, { code: 100 }, ...f];
class ga {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Sa(this, "parser", c(qr, $r));
  }
}
Sa(ga, "ForEntityName", "ARC");
(be = {})[be.BeforeText = 0] = "BeforeText", be[be.AboveText = 1] = "AboveText", be[be.None = 2] = "None";
let da = [{ name: "DIMPOST", code: 3 }, { name: "DIMAPOST", code: 4, defaultValue: "" }, { name: "DIMBLK_OBSOLETE", code: 5 }, { name: "DIMBLK1_OBSOLETE", code: 6 }, { name: "DIMBLK2_OBSOLETE", code: 7 }, { name: "DIMSCALE", code: 40, defaultValue: 1 }, { name: "DIMASZ", code: 41, defaultValue: 0.25 }, { name: "DIMEXO", code: 42, defaultValue: 0.625, defaultValueImperial: 0.0625 }, { name: "DIMDLI", code: 43, defaultValue: 3.75, defaultValueImperial: 0.38 }, { name: "DIMEXE", code: 44, defaultValue: 2.25, defaultValueImperial: 0.28 }, { name: "DIMRND", code: 45, defaultValue: 0 }, { name: "DIMDLE", code: 46, defaultValue: 0 }, { name: "DIMTP", code: 47, defaultValue: 0 }, { name: "DIMTM", code: 48, defaultValue: 0 }, { name: "DIMFXL", code: 49, defaultValue: 1 }, { name: "DIMJOGANG", code: 50, defaultValue: 45 }, { name: "DIMTFILL", code: 69, defaultValue: 0 }, { name: "DIMTFILLCLR", code: 70, defaultValue: 0 }, { name: "DIMTOL", code: 71, defaultValue: 0, defaultValueImperial: 1 }, { name: "DIMLIM", code: 72, defaultValue: 0 }, { name: "DIMTIH", code: 73, defaultValue: 0, defaultValueImperial: 1 }, { name: "DIMTOH", code: 74, defaultValue: 0, defaultValueImperial: 1 }, { name: "DIMSE1", code: 75, defaultValue: 0 }, { name: "DIMSE2", code: 76, defaultValue: 0 }, { name: "DIMTAD", code: 77, defaultValue: fa.Above, defaultValueImperial: fa.Center }, { name: "DIMZIN", code: 78, defaultValue: De.Trailing, defaultValueImperial: De.Feet }, { name: "DIMAZIN", code: 79, defaultValue: Vr.None }, { name: "DIMARCSYM", code: 90, defaultValue: 0 }, { name: "DIMTXT", code: 140, defaultValue: 2.5, defaultValueImperial: 0.28 }, { name: "DIMCEN", code: 141, defaultValue: 2.5, defaultValueImperial: 0.09 }, { name: "DIMTSZ", code: 142, defaultValue: 0 }, { name: "DIMALTF", code: 143, defaultValue: 25.4 }, { name: "DIMLFAC", code: 144, defaultValue: 1 }, { name: "DIMTVP", code: 145, defaultValue: 0 }, { name: "DIMTFAC", code: 146, defaultValue: 1 }, { name: "DIMGAP", code: 147, defaultValue: 0.625, defaultValueImperial: 0.09 }, { name: "DIMALTRND", code: 148, defaultValue: 0 }, { name: "DIMALT", code: 170, defaultValue: 0 }, { name: "DIMALTD", code: 171, defaultValue: 3, defaultValueImperial: 2 }, { name: "DIMTOFL", code: 172, defaultValue: 1, defaultValueImperial: 0 }, { name: "DIMSAH", code: 173, defaultValue: 0 }, { name: "DIMTIX", code: 174, defaultValue: 0 }, { name: "DIMSOXD", code: 175, defaultValue: 0 }, { name: "DIMCLRD", code: 176, defaultValue: 0 }, { name: "DIMCLRE", code: 177, defaultValue: 0 }, { name: "DIMCLRT", code: 178, defaultValue: 0 }, { name: "DIMADEC", code: 179, defaultValue: 0 }, { name: "DIMUNIT", code: 270 }, { name: "DIMDEC", code: 271, defaultValue: 2, defaultValueImperial: 4 }, { name: "DIMTDEC", code: 272, defaultValue: 2, defaultValueImperial: 4 }, { name: "DIMALTU", code: 273, defaultValue: 2 }, { name: "DIMALTTD", code: 274, defaultValue: 3, defaultValueImperial: 2 }, { name: "DIMAUNIT", code: 275, defaultValue: 0 }, { name: "DIMFRAC", code: 276, defaultValue: 0 }, { name: "DIMLUNIT", code: 277, defaultValue: 2 }, { name: "DIMDSEP", code: 278, defaultValue: 44, defaultValueImperial: 46 }, { name: "DIMTMOVE", code: 279, defaultValue: 0 }, { name: "DIMJUST", code: 280, defaultValue: Br.Center }, { name: "DIMSD1", code: 281, defaultValue: 0 }, { name: "DIMSD2", code: 282, defaultValue: 0 }, { name: "DIMTOLJ", code: 283, defaultValue: Ur.Center }, { name: "DIMTZIN", code: 284, defaultValue: De.Trailing, defaultValueImperial: De.Feet }, { name: "DIMALTZ", code: 285, defaultValue: De.Trailing }, { name: "DIMALTTZ", code: 286, defaultValue: De.Trailing }, { name: "DIMFIT", code: 287 }, { name: "DIMUPT", code: 288, defaultValue: 0 }, { name: "DIMATFIT", code: 289, defaultValue: 3 }, { name: "DIMFXLON", code: 290, defaultValue: 0 }, { name: "DIMTXTDIRECTION", code: 294, defaultValue: 0 }, { name: "DIMTXSTY", code: 340, defaultValue: "Standard" }, { name: "DIMLDRBLK", code: 341, defaultValue: "" }, { name: "DIMBLK", code: 342, defaultValue: "" }, { name: "DIMBLK1", code: 343, defaultValue: "" }, { name: "DIMBLK2", code: 344, defaultValue: "" }, { name: "DIMLTYPE", code: 345, defaultValue: "" }, { name: "DIMLTEX1", code: 346, defaultValue: "" }, { name: "DIMLTEX2", code: 347, defaultValue: "" }, { name: "DIMLWD", code: 371, defaultValue: -2 }, { name: "DIMLWE", code: 372, defaultValue: -2 }], xa = [{ code: 3, name: "styleName", parser: a }, { code: 210, name: "extrusionDirection", parser: o }, { code: 51, name: "ocsRotation", parser: a }, { code: 53, name: "textRotation", parser: a }, { code: 1, name: "text", parser: a }, { code: 42, name: "measurement", parser: a }, { code: 72, name: "textLineSpacingStyle", parser: a }, { code: 71, name: "attachmentPoint", parser: a }, { code: 70, name: "dimensionType", parser: a }, { code: 11, name: "textPoint", parser: o }, { code: 10, name: "definitionPoint", parser: o }, { code: 2, name: "name", parser: a }, { code: 280, name: "version", parser: a }, { code: 100 }], Qr = [{ code: 100 }, { code: 52, name: "obliqueAngle", parser: a }, { code: 50, name: "rotationAngle", parser: a }, { code: 14, name: "subDefinitionPoint2", parser: o }, { code: 13, name: "subDefinitionPoint1", parser: o }, { code: 12, name: "insertionPoint", parser: o }, { code: 100, name: "subclassMarker", parser: a }], en = [{ code: 16, name: "arcPoint", parser: o }, { code: 15, name: "centerPoint", parser: o }, { code: 14, name: "subDefinitionPoint2", parser: o }, { code: 13, name: "subDefinitionPoint1", parser: o }, { code: 100, name: "subclassMarker", parser: a }], an = [{ code: 14, name: "subDefinitionPoint2", parser: o }, { code: 13, name: "subDefinitionPoint1", parser: o }, { code: 100, name: "subclassMarker", parser: a }], rn = [{ code: 40, name: "leaderLength", parser: a }, { code: 15, name: "subDefinitionPoint", parser: o }, { code: 100, name: "subclassMarker", parser: a }], nn = [{ code: 100, parser(e, r, n) {
  let t = function(s) {
    switch (s) {
      case "AcDbAlignedDimension":
        return c(Qr);
      case "AcDb3PointAngularDimension":
      case "AcDb2LineAngularDimension":
        return c(en);
      case "AcDbOrdinateDimension":
        return c(an);
      case "AcDbRadialDimension":
      case "AcDbDiametricDimension":
        return c(rn);
    }
    return null;
  }(e.value);
  if (!t) return Xe;
  t(e, r, n);
}, pushContext: !0 }, ...da.map((e) => ({ ...e, parser: a })), ...xa, ...f];
class Ke {
  parseEntity(r, n) {
    let t = {};
    return c(nn)(n, r, t), t;
  }
}
(na = "ForEntityName") in Ke ? Object.defineProperty(Ke, na, { value: "DIMENSION", enumerable: !0, configurable: !0, writable: !0 }) : Ke[na] = "DIMENSION";
let tn = [{ code: 73 }, { code: 17, name: "leaderEnd", parser: o }, { code: 16, name: "leaderStart", parser: o }, { code: 71, name: "hasLeader", parser: p }, { code: 41, name: "endAngle", parser: a }, { code: 40, name: "startAngle", parser: a }, { code: 70, name: "isPartial", parser: p }, { code: 15, name: "centerPoint", parser: o }, { code: 14, name: "xline2Point", parser: o }, { code: 13, name: "xline1Point", parser: o }, { code: 100, name: "subclassMarker", parser: a, pushContext: !0 }, ...da.map((e) => ({ ...e, parser: a })), ...xa, ...f];
class Ze {
  parseEntity(r, n) {
    let t = {};
    return c(tn)(n, r, t), t;
  }
}
(ta = "ForEntityName") in Ze ? Object.defineProperty(Ze, ta, { value: "ARC_DIMENSION", enumerable: !0, configurable: !0, writable: !0 }) : Ze[ta] = "ARC_DIMENSION";
(W = {})[W.NONE = 0] = "NONE", W[W.INVISIBLE = 1] = "INVISIBLE", W[W.CONSTANT = 2] = "CONSTANT", W[W.VERIFICATION_REQUIRED = 4] = "VERIFICATION_REQUIRED", W[W.PRESET = 8] = "PRESET";
(Be = {})[Be.MULTILINE = 2] = "MULTILINE", Be[Be.CONSTANT_MULTILINE = 4] = "CONSTANT_MULTILINE";
(Oe = {})[Oe.NONE = 0] = "NONE", Oe[Oe.MIRRORED_X = 2] = "MIRRORED_X", Oe[Oe.MIRRORED_Y = 4] = "MIRRORED_Y";
var on = ((w = {})[w.LEFT = 0] = "LEFT", w[w.CENTER = 1] = "CENTER", w[w.RIGHT = 2] = "RIGHT", w[w.ALIGNED = 3] = "ALIGNED", w[w.MIDDLE = 4] = "MIDDLE", w[w.FIT = 5] = "FIT", w), sn = ((Q = {})[Q.BASELINE = 0] = "BASELINE", Q[Q.BOTTOM = 1] = "BOTTOM", Q[Q.MIDDLE = 2] = "MIDDLE", Q[Q.TOP = 3] = "TOP", Q);
function ya(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
let Aa = { thickness: 0, rotation: 0, xScale: 1, obliqueAngle: 0, styleName: "STANDARD", generationFlag: 0, halign: on.LEFT, valign: sn.BASELINE, extrusionDirection: { x: 0, y: 0, z: 1 } }, Da = [{ code: 73, name: "valign", parser: a }, { code: 100 }, { code: 210, name: "extrusionDirection", parser: o }, { code: 11, name: "endPoint", parser: o }, { code: 72, name: "valign", parser: a }, { code: 72, name: "halign", parser: a }, { code: 71, name: "generationFlag", parser: a }, { code: 7, name: "styleName", parser: a }, { code: 51, name: "obliqueAngle", parser: a }, { code: 41, name: "xScale", parser: a }, { code: 50, name: "rotation", parser: a }, { code: 1, name: "text", parser: a }, { code: 40, name: "textHeight", parser: a }, { code: 10, name: "startPoint", parser: o }, { code: 39, name: "thickness", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class va {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    ya(this, "parser", c(Da, Aa));
  }
}
function La(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
ya(va, "ForEntityName", "TEXT");
let cn = { ...Aa }, ln = [{ code: 2 }, { code: 40, name: "annotationScale", parser: a }, { code: 10, name: "alignmentPoint", parser: o }, { code: 340, name: "secondaryAttributesHardIds", isMultiple: !0, parser: a }, { code: 70, name: "numberOfSecondaryAttributes", parser: a }, { code: 70, name: "isReallyLocked", parser: p }, { code: 70, name: "mtextFlag", parser: a }, { code: 280, name: "isDuplicatedRecord", parser: p }, { code: 100 }, { code: 280, name: "isLocked", parser: p }, { code: 74, name: "valign", parser: a }, { code: 73 }, { code: 70, name: "attributeFlag", parser: a }, { code: 2, name: "tag", parser: a }, { code: 3, name: "prompt", parser: a }, { code: 280 }, { code: 100, name: "subclassMarker", parser: a }, ...Da.slice(2)];
class _a {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    La(this, "parser", c(ln, cn));
  }
}
function dn(e, r) {
  let n = {};
  for (let t of e) {
    let s = r(t);
    s != null && (n[s] ?? (n[s] = []), n[s].push(t));
  }
  return n;
}
function* ea(e, r = 1 / 0, n = 1) {
  for (let t = e; t !== r; t += n) yield t;
}
function Ia(e) {
  return { x: e.x ?? 0, y: e.y ?? 0, z: e.z ?? 0 };
}
La(_a, "ForEntityName", "ATTDEF");
var pn = [0, 16711680, 16776960, 65280, 65535, 255, 16711935, 16777215, 8421504, 12632256, 16711680, 16744319, 13369344, 13395558, 10027008, 10046540, 8323072, 8339263, 4980736, 4990502, 16727808, 16752511, 13382400, 13401958, 10036736, 10051404, 8331008, 8343359, 4985600, 4992806, 16744192, 16760703, 13395456, 13408614, 10046464, 10056268, 8339200, 8347455, 4990464, 4995366, 16760576, 16768895, 13408512, 13415014, 10056192, 10061132, 8347392, 8351551, 4995328, 4997670, 16776960, 16777087, 13421568, 13421670, 10000384, 10000460, 8355584, 8355647, 5000192, 5000230, 12582656, 14679935, 10079232, 11717734, 7510016, 8755276, 6258432, 7307071, 3755008, 4344870, 8388352, 12582783, 6736896, 10079334, 5019648, 7510092, 4161280, 6258495, 2509824, 3755046, 4194048, 10485631, 3394560, 8375398, 2529280, 6264908, 2064128, 5209919, 1264640, 3099686, 65280, 8388479, 52224, 6736998, 38912, 5019724, 32512, 4161343, 19456, 2509862, 65343, 8388511, 52275, 6737023, 38950, 5019743, 32543, 4161359, 19475, 2509871, 65407, 8388543, 52326, 6737049, 38988, 5019762, 32575, 4161375, 19494, 2509881, 65471, 8388575, 52377, 6737074, 39026, 5019781, 32607, 4161391, 19513, 2509890, 65535, 8388607, 52428, 6737100, 39064, 5019800, 32639, 4161407, 19532, 2509900, 49151, 8380415, 39372, 6730444, 29336, 5014936, 24447, 4157311, 14668, 2507340, 32767, 8372223, 26316, 6724044, 19608, 5010072, 16255, 4153215, 9804, 2505036, 16383, 8364031, 13260, 6717388, 9880, 5005208, 8063, 4149119, 4940, 2502476, 255, 8355839, 204, 6710988, 152, 5000344, 127, 4145023, 76, 2500172, 4129023, 10452991, 3342540, 8349388, 2490520, 6245528, 2031743, 5193599, 1245260, 3089996, 8323327, 12550143, 6684876, 10053324, 4980888, 7490712, 4128895, 6242175, 2490444, 3745356, 12517631, 14647295, 10027212, 11691724, 7471256, 8735896, 6226047, 7290751, 3735628, 4335180, 16711935, 16744447, 13369548, 13395660, 9961624, 9981080, 8323199, 8339327, 4980812, 4990540, 16711871, 16744415, 13369497, 13395634, 9961586, 9981061, 8323167, 8339311, 4980793, 4990530, 16711807, 16744383, 13369446, 13395609, 9961548, 9981042, 8323135, 8339295, 4980774, 4990521, 16711743, 16744351, 13369395, 13395583, 9961510, 9981023, 8323103, 8339279, 4980755, 4990511, 3355443, 5987163, 8684676, 11382189, 14079702, 16777215];
function un(e) {
  return pn[e];
}
function mn(e) {
  e.rewind();
  let r = e.next();
  if (r.code !== 101) throw Error("Bad call for skipEmbeddedObject()");
  do
    r = e.next();
  while (r.code !== 0);
  e.rewind();
}
function fn(e, r, n) {
  if (u(r, 102)) return X(r, n, e), !0;
  switch (r.code) {
    case 0:
      e.type = r.value;
      break;
    case 5:
      e.handle = r.value;
      break;
    case 330:
      e.ownerBlockRecordSoftId = r.value;
      break;
    case 67:
      e.isInPaperSpace = !!r.value;
      break;
    case 8:
      e.layer = r.value;
      break;
    case 6:
      e.lineType = r.value;
      break;
    case 347:
      e.materialObjectHardId = r.value;
      break;
    case 62:
      e.colorIndex = r.value, e.color = un(Math.abs(r.value));
      break;
    case 370:
      e.lineweight = r.value;
      break;
    case 48:
      e.lineTypeScale = r.value;
      break;
    case 60:
      e.isVisible = !!r.value;
      break;
    case 92:
      e.proxyByte = r.value;
      break;
    case 310:
      e.proxyEntity = r.value;
      break;
    case 100:
      break;
    case 420:
      e.color = r.value;
      break;
    case 430:
      e.transparency = r.value;
      break;
    case 390:
      e.plotStyleHardId = r.value;
      break;
    case 284:
      e.shadowMode = r.value;
      break;
    case 1001:
      (e.xdata ?? (e.xdata = [])).push(Na(r, n));
      break;
    default:
      return !1;
  }
  return !0;
}
function Ma(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
let In = { textStyle: "STANDARD", extrusionDirection: { x: 0, y: 0, z: 1 }, rotation: 0 }, Je = [{ code: 46, name: "annotationHeight", parser: a }, { code: 101, parser(e, r) {
  mn(r);
} }, { code: 50, name: "columnHeight", parser: a }, { code: 49, name: "columnGutter", parser: a }, { code: 48, name: "columnWidth", parser: a }, { code: 79, name: "columnAutoHeight", parser: a }, { code: 78, name: "columnFlowReversed", parser: a }, { code: 76, name: "columnCount", parser: a }, { code: 75, name: "columnType", parser: a }, { code: 441, name: "backgroundFillTransparency", parser: a }, { code: 63, name: "backgroundFillColor", parser: a }, { code: 45, name: "fillBoxScale", parser: a }, { code: [...ea(430, 440)], name: "backgroundColor", parser: a }, { code: [...ea(420, 430)], name: "backgroundColor", parser: a }, { code: 90, name: "backgroundFill", parser: a }, { code: 44, name: "lineSpacing", parser: a }, { code: 73, name: "lineSpacingStyle", parser: a }, { code: 50, name: "rotation", parser: a }, { code: 43 }, { code: 42 }, { code: 11, name: "direction", parser: o }, { code: 210, name: "extrusionDirection", parser: o }, { code: 7, name: "styleName", parser: a }, ...aa("text"), { code: 72, name: "drawingDirection", parser: a }, { code: 71, name: "attachmentPoint", parser: a }, { code: 41, name: "width", parser: a }, { code: 40, name: "height", parser: a }, { code: 10, name: "insertionPoint", parser: o }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class Ca {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Ma(this, "parser", c(Je, In));
  }
}
function Ra(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
Ma(Ca, "ForEntityName", "MTEXT");
let En = { thickness: 0, rotation: 0, scale: 1, obliqueAngle: 0, textStyle: "STANDARD", textGenerationFlag: 0, horizontalJustification: 0, verticalJustification: 0, extrusionDirection: { x: 0, y: 0, z: 1 } }, hn = [...Je.slice(Je.findIndex(({ name: e }) => e === "columnType"), Je.findIndex(({ name: e }) => e === "subclassMarker") + 1), { code: 100 }, { code: 0, parser(e) {
  if (!u(e, 0, "MTEXT")) return Xe;
} }, { code: 2, name: "definitionTag", parser: a }, { code: 40, name: "annotationScale", parser: a }, { code: 10, name: "alignmentPoint", parser: o }, { code: 340, name: "secondaryAttributesHardId", parser: a }, { code: 70, name: "numberOfSecondaryAttributes", parser: a }, { code: 70, name: "isReallyLocked", parser: p }, { code: 70, name: "mtextFlag", parser: a }, { code: 280, name: "isDuplicatedEntriesKeep", parser: p }, { code: 100 }, { code: 280, name: "lockPositionFlag", parser: p }, { code: 210, name: "extrusionDirection", parser: o }, { code: 11, name: "alignmentPoint", parser: o }, { code: 74, name: "verticalJustification", parser: a }, { code: 72, name: "horizontalJustification", parser: a }, { code: 71, name: "textGenerationFlag", parser: a }, { code: 7, name: "textStyle", parser: a }, { code: 51, name: "obliqueAngle", parser: a }, { code: 41, name: "scale", parser: a }, { code: 50, name: "rotation", parser: a }, { code: 73 }, { code: 70, name: "attributeFlag", parser: a }, { code: 2, name: "tag", parser: a }, { code: 280 }, { code: 100, name: "subclassMarker", parser: a }, { code: 1, name: "text", parser: a }, { code: 40, name: "textHeight", parser: a }, { code: 10, name: "startPoint", parser: o }, { code: 39, name: "thickness", parser: a }, { code: 100 }, ...f];
class wa {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Ra(this, "parser", c(hn, En));
  }
}
function Fa(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
Ra(wa, "ForEntityName", "ATTRIB");
let bn = [...aa("data"), { code: 70, name: "version", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class Pa {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Fa(this, "parser", c(bn));
  }
}
function ka(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
Fa(Pa, "ForEntityName", "BODY");
let On = { thickness: 0, extrusionDirection: { x: 0, y: 0, z: 1 } }, Tn = [{ code: 210, name: "extrusionDirection", parser: o }, { code: 40, name: "radius", parser: a }, { code: 10, name: "center", parser: o }, { code: 39, name: "thickness", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class Va {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    ka(this, "parser", c(Tn, On));
  }
}
function Ba(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
ka(Va, "ForEntityName", "CIRCLE");
let Nn = { extrusionDirection: { x: 0, y: 0, z: 1 } }, Sn = [{ code: 42, name: "endAngle", parser: a }, { code: 41, name: "startAngle", parser: a }, { code: 40, name: "axisRatio", parser: a }, { code: 210, name: "extrusionDirection", parser: o }, { code: 11, name: "majorAxisEndPoint", parser: o }, { code: 10, name: "center", parser: o }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class Ua {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Ba(this, "parser", c(Sn, Nn));
  }
}
function Ha(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
Ba(Ua, "ForEntityName", "ELLIPSE");
let gn = [{ code: 13, name: "vertices.3", parser: o }, { code: 12, name: "vertices.2", parser: o }, { code: 11, name: "vertices.1", parser: o }, { code: 10, name: "vertices.0", parser: o }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class Ga {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Ha(this, "parser", c(gn));
  }
}
Ha(Ga, "ForEntityName", "3DFACE");
(ee = {})[ee.First = 1] = "First", ee[ee.Second = 2] = "Second", ee[ee.Third = 4] = "Third", ee[ee.Fourth = 8] = "Fourth";
let Wa = [{ code: 330, name: "sourceBoundaryObjects", parser: a, isMultiple: !0 }, { code: 97, name: "numberOfSourceBoundaryObjects", parser: a }], xn = [{ code: 11, name: "end", parser: o }, { code: 10, name: "start", parser: o }], yn = [{ code: 73, name: "isCCW", parser: p }, { code: 51, name: "endAngle", parser: a }, { code: 50, name: "startAngle", parser: a }, { code: 40, name: "radius", parser: a }, { code: 10, name: "center", parser: o }], An = [{ code: 73, name: "isCCW", parser: p }, { code: 51, name: "endAngle", parser: a }, { code: 50, name: "startAngle", parser: a }, { code: 40, name: "lengthOfMinorAxis", parser: a }, { code: 11, name: "end", parser: o }, { code: 10, name: "center", parser: o }], Dn = [{ code: 13, name: "endTangent", parser: o }, { code: 12, name: "startTangent", parser: o }, { code: 11, name: "fitDatum", isMultiple: !0, parser: o }, { code: 97, name: "numberOfFitData", parser: a }, { code: 10, name: "controlPoints", isMultiple: !0, parser(e, r) {
  let n = { ...le(r), weight: 1 };
  return (e = r.next()).code === 42 ? n.weight = e.value : r.rewind(), n;
} }, { code: 40, name: "knots", isMultiple: !0, parser: a }, { code: 96, name: "numberOfControlPoints", parser: a }, { code: 95, name: "numberOfKnots", parser: a }, { code: 74, name: "isPeriodic", parser: p }, { code: 73, name: "splineFlag", parser: a }, { code: 94, name: "degree", parser: a }], vn = { [ze.Line]: xn, [ze.Circular]: yn, [ze.Elliptic]: An, [ze.Spline]: Dn }, Ln = [...Wa, { code: 72, name: "edges", parser(e, r) {
  let n = { type: e.value }, t = c(vn[n.type]);
  if (!t) throw Error(`Invalid edge type ${n.type}`);
  return t(e = r.next(), r, n), n;
}, isMultiple: !0 }, { code: 93, name: "numberOfEdges", parser: a }], _n = [...Wa, { code: 10, name: "vertices", parser(e, r) {
  let n = { ...le(r), bulge: 0 };
  return (e = r.next()).code === 42 ? n.bulge = e.value : r.rewind(), n;
}, isMultiple: !0 }, { code: 93, name: "numberOfVertices", parser: a }, { code: 73, name: "isClosed", parser: p }, { code: 72, name: "hasBulge", parser: p }];
function Mn(e, r) {
  let n = { boundaryPathTypeFlag: e.value }, t = n.boundaryPathTypeFlag & Hr.Polyline;
  return e = r.next(), t ? c(_n)(e, r, n) : c(Ln)(e, r, n), n;
}
let Cn = [{ code: 49, name: "dashLengths", parser: a, isMultiple: !0 }, { code: 79, name: "numberOfDashLengths", parser: a }, { code: 45, name: "offset", parser: Ea }, { code: 43, name: "base", parser: Ea }, { code: 53, name: "angle", parser: a }];
function Ea(e, r) {
  let n = e.code + 1, t = { x: e.value, y: 1 };
  return (e = r.next()).code === n ? t.y = e.value : r.rewind(), t;
}
function Rn(e, r) {
  let n = {};
  return c(Cn)(e, r, n), n;
}
function ja(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
let wn = { extrusionDirection: { x: 0, y: 0, z: 1 }, gradientRotation: 0, colorTint: 0 }, Fn = [{ code: 470 }, { code: 463 }, { code: 462, name: "colorTint", parser: a }, { code: 461, name: "gradientDefinition", parser: a }, { code: 460, name: "gradientRotation", parser: a }, { code: 453, name: "numberOfColors", parser: a }, { code: 452, name: "gradientColorFlag", parser: a }, { code: 451 }, { code: 450, name: "gradientFlag", parser: a }, { code: 10, name: "seedPoints", parser: o, isMultiple: !0 }, { code: 99 }, { code: 11, name: "offsetVector", parser: o }, { code: 98, name: "numberOfSeedPoints", parser: a }, { code: 47, name: "pixelSize", parser: a }, { code: 53, name: "definitionLines", parser: Rn, isMultiple: !0 }, { code: 78, name: "numberOfDefinitionLines", parser: a }, { code: 77, name: "isDouble", parser: p }, { code: 73, name: "isAnnotated", parser: p }, { code: 41, name: "patternScale", parser: a }, { code: 52, name: "patternAngle", parser: a }, { code: 76, name: "patternType", parser: a }, { code: 75, name: "hatchStyle", parser: a }, { code: 92, name: "boundaryPaths", parser: Mn, isMultiple: !0 }, { code: 91, name: "numberOfBoundaryPaths", parser: a }, { code: 71, name: "associativity", parser: a }, { code: 63, name: "patternFillColor", parser: a }, { code: 70, name: "solidFill", parser: a }, { code: 2, name: "patternName", parser: a }, { code: 210, name: "extrusionDirection", parser: o }, { code: 10, name: "elevationPoint", parser: o }, { code: 100, name: "subclassMarker", parser: a, pushContext: !0 }, ...f];
class Ya {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    ja(this, "parser", c(Fn, wn));
  }
}
function Xa(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
ja(Ya, "ForEntityName", "HATCH");
let Pn = { brightness: 50, contrast: 50, fade: 0, clippingBoundaryPath: [] }, kn = [{ code: 290, name: "clipMode", parser: a }, { code: 14, name: "clippingBoundaryPath", isMultiple: !0, parser: o }, { code: 91, name: "countBoundaryPoints", parser: a }, { code: 71, name: "clippingBoundaryType", parser: a }, { code: 360, name: "imageDefReactorHandle", parser: a }, { code: 283, name: "fade", parser: a }, { code: 282, name: "contrast", parser: a }, { code: 281, name: "brightness", parser: a }, { code: 280, name: "isClipped", parser: p }, { code: 70, name: "flags", parser: a }, { code: 340, name: "imageDefHandle", parser: a }, { code: 13, name: "imageSize", parser: o }, { code: 12, name: "vPixel", parser: o }, { code: 11, name: "uPixel", parser: o }, { code: 10, name: "position", parser: o }, { code: 90, name: "version", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class za {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Xa(this, "parser", c(kn, Pn));
  }
}
Xa(za, "ForEntityName", "IMAGE");
(ae = {})[ae.ShowImage = 1] = "ShowImage", ae[ae.ShowImageWhenNotAlignedWithScreen = 2] = "ShowImageWhenNotAlignedWithScreen", ae[ae.UseClippingBoundary = 4] = "UseClippingBoundary", ae[ae.TransparencyIsOn = 8] = "TransparencyIsOn";
(Ue = {})[Ue.Rectangular = 1] = "Rectangular", Ue[Ue.Polygonal = 2] = "Polygonal";
(He = {})[He.Outside = 0] = "Outside", He[He.Inside = 1] = "Inside";
function Ka(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
let Vn = { xScale: 1, yScale: 1, zScale: 1, rotation: 0, columnCount: 0, rowCount: 0, columnSpacing: 0, rowSpacing: 0, extrusionDirection: { x: 0, y: 0, z: 1 } }, Bn = [{ code: 210, name: "extrusionDirection", parser: o }, { code: 45, name: "rowSpacing", parser: a }, { code: 44, name: "columnSpacing", parser: a }, { code: 71, name: "rowCount", parser: a }, { code: 70, name: "columnCount", parser: a }, { code: 50, name: "rotation", parser: a }, { code: 43, name: "zScale", parser: a }, { code: 42, name: "yScale", parser: a }, { code: 41, name: "xScale", parser: a }, { code: 10, name: "insertionPoint", parser: o }, { code: 2, name: "name", parser: a }, { code: 66, name: "isVariableAttributes", parser: p }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class Za {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Ka(this, "parser", c(Bn, Vn));
  }
}
function Ja(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
Ka(Za, "ForEntityName", "INSERT");
let Un = { isArrowheadEnabled: !0 }, Hn = [{ code: 213, name: "offsetFromAnnotation", parser: o }, { code: 212, name: "offsetFromBlock", parser: o }, { code: 211, name: "horizontalDirection", parser: o }, { code: 210, name: "normal", parser: o }, { code: 340, name: "associatedAnnotation", parser: a }, { code: 77, name: "byBlockColor", parser: a }, { code: 10, name: "vertices", parser: o, isMultiple: !0 }, { code: 76, name: "numberOfVertices", parser: a }, { code: 41, name: "textWidth", parser: a }, { code: 40, name: "textHeight", parser: a }, { code: 75, name: "isHooklineExists", parser: p }, { code: 74, name: "isHooklineSameDirection", parser: p }, { code: 73, name: "leaderCreationFlag", parser: a }, { code: 72, name: "isSpline", parser: p }, { code: 71, name: "isArrowheadEnabled", parser: p }, { code: 3, name: "styleName", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class $a {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Ja(this, "parser", c(Hn, Un));
  }
}
Ja($a, "ForEntityName", "LEADER");
(re = {})[re.TextAnnotation = 0] = "TextAnnotation", re[re.ToleranceAnnotation = 1] = "ToleranceAnnotation", re[re.BlockReferenceAnnotation = 2] = "BlockReferenceAnnotation", re[re.NoAnnotation = 3] = "NoAnnotation";
function qa(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
let Gn = { thickness: 0, extrusionDirection: { x: 0, y: 0, z: 1 } }, Wn = [{ code: 210, name: "extrusionDirection", parser: o }, { code: 11, name: "endPoint", parser: o }, { code: 10, name: "startPoint", parser: o }, { code: 39, name: "thickness", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class Qa {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    qa(this, "parser", c(Wn, Gn));
  }
}
function er(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
qa(Qa, "ForEntityName", "LINE");
let jn = [{ code: 280, name: "shadowMapSoftness", parser: a }, { code: 91, name: "shadowMapSize", parser: a }, { code: 73, name: "shadowType", parser: a }, { code: 293, name: "isShadowCast", parser: p }, { code: 51, name: "falloffAngle", parser: a }, { code: 50, name: "hotspotAngle", parser: a }, { code: 42, name: "limitEnd", parser: a }, { code: 41, name: "limitStart", parser: a }, { code: 292, name: "isAttenuationLimited", parser: p }, { code: 72, name: "attenuationType", parser: a }, { code: 11, name: "target", parser: o }, { code: 10, name: "position", parser: o }, { code: 40, name: "intensity", parser: a }, { code: 291, name: "isPlotGlyph", parser: p }, { code: 290, name: "isOn", parser: p }, { code: 421, name: "lightColorInstance", parser: a }, { code: 63, name: "lightColorIndex", parser: a }, { code: 70, name: "lightType", parser: a }, { code: 1, name: "name", parser: a }, { code: 90, name: "version", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class ar {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    er(this, "parser", c(jn));
  }
}
er(ar, "ForEntityName", "LIGHT");
(Te = {})[Te.Distant = 1] = "Distant", Te[Te.Point = 2] = "Point", Te[Te.Spot = 3] = "Spot";
(Ne = {})[Ne.None = 0] = "None", Ne[Ne.InverseLinear = 1] = "InverseLinear", Ne[Ne.InverseSquare = 2] = "InverseSquare";
let Yn = { flag: 0, elevation: 0, thickness: 0, extrusionDirection: { x: 0, y: 0, z: 1 }, vertices: [] }, Xn = { bulge: 0 }, zn = [{ code: 42, name: "bulge", parser: a }, { code: 41, name: "endWidth", parser: a }, { code: 40, name: "startWidth", parser: a }, { code: 91, name: "id", parser: a }, { code: 20, name: "y", parser: a }, { code: 10, name: "x", parser: a }], Kn = [{ code: 210, name: "extrusionDirection", parser: o }, { code: 10, name: "vertices", isMultiple: !0, parser(e, r) {
  let n = {};
  return c(zn, Xn)(e, r, n), n;
} }, { code: 39, name: "thickness", parser: a }, { code: 38, name: "elevation", parser: a }, { code: 43, name: "constantWidth", parser: a }, { code: 70, name: "flag", parser: a }, { code: 90, name: "numberOfVertices", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class $e {
  parseEntity(r, n) {
    let t = {};
    return c(Kn, Yn)(n, r, t), t;
  }
}
(oa = "ForEntityName") in $e ? Object.defineProperty($e, oa, { value: "LWPOLYLINE", enumerable: !0, configurable: !0, writable: !0 }) : $e[oa] = "LWPOLYLINE";
(Ge = {})[Ge.IS_CLOSED = 1] = "IS_CLOSED", Ge[Ge.PLINE_GEN = 128] = "PLINE_GEN";
function rr(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
let Zn = [{ code: 90, name: "overridenSubEntityCount", parser: a }, { code: 140, name: "edgeCreaseWeights", parser: a, isMultiple: !0 }, { code: 95, name: "edgeCreaseCount", parser: a }, { code: 94, parser(e, r, n) {
  n.edgeCount = e.value, n.edgeIndices = [];
  for (let t = 0; t < n.edgeCount; ++t) {
    let s = [];
    e = r.next(), s[0] = e.value, e = r.next(), s[1] = e.value, n.edgeIndices.push(s);
  }
} }, { code: 93, parser(e, r, n) {
  n.totalFaceIndices = e.value, n.faceIndices = [];
  let t = [];
  for (let i = 0; i < n.totalFaceIndices && !u(e, 0); ++i) e = r.next(), t.push(e.value);
  let s = 0;
  for (; s < t.length; ) {
    let i = t[s++], l = [];
    for (let I = 0; I < i; ++I) l.push(t[s++]);
    n.faceIndices.push(l);
  }
} }, { code: 10, name: "vertices", parser: o, isMultiple: !0 }, { code: 92, name: "verticesCount", parser: a }, { code: 91, name: "subdivisionLevel", parser: a }, { code: 40, name: "blendCrease", parser: a }, { code: 72, name: "isBlendCreased", parser: p }, { code: 71, name: "version", parser: a }, { code: 100, name: "subclassMarker", parser: jr, pushContext: !0 }, ...f];
class nr {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    rr(this, "parser", c(Zn));
  }
}
function tr(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
rr(nr, "ForEntityName", "MESH");
let Jn = [{ code: 42, name: "fillParameters", parser: a, isMultiple: !0 }, { code: 75, name: "fillCount", parser: a }, { code: 41, name: "parameters", parser: a, isMultiple: !0 }, { code: 74, name: "parameterCount", parser: a }], $n = [{ code: [74, 41, 75, 42], name: "elements", parser(e, r) {
  let n = c(Jn), t = {};
  return n(e, r, t), t;
}, isMultiple: !0 }, { code: 13, name: "miterDirection", parser: o }, { code: 12, name: "direction", parser: o }, { code: 11, name: "position", parser: o }], qn = [{ code: [11, 12, 13], name: "segments", parser(e, r) {
  let n = c($n), t = {};
  return n(e, r, t), t;
}, isMultiple: !0 }, { code: 210, name: "extrusionDirection", parser: o }, { code: 10, name: "startPosition", parser: o }, { code: 73, name: "styleCount", parser: a }, { code: 72, name: "vertexCount", parser: a }, { code: 71, name: "flags", parser: a }, { code: 70, name: "justification", parser: a }, { code: 40, name: "scale", parser: a }, { code: 340, name: "styleObjectHandle", parser: a }, { code: 2, name: "name", parser: a }, { code: 100, name: "subclassMarker", parser: a, pushContext: !0 }, ...f];
class or {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    tr(this, "parser", c(qn));
  }
}
tr(or, "ForEntityName", "MLINE");
(Se = {})[Se.Top = 0] = "Top", Se[Se.Zero = 1] = "Zero", Se[Se.Bottom = 2] = "Bottom";
(ne = {})[ne.HasVertex = 1] = "HasVertex", ne[ne.Closed = 2] = "Closed", ne[ne.SuppressStartCaps = 4] = "SuppressStartCaps", ne[ne.SuppressEndCaps = 8] = "SuppressEndCaps";
(ge = {})[ge.LEFT_TO_RIGHT = 1] = "LEFT_TO_RIGHT", ge[ge.TOP_TO_BOTTOM = 3] = "TOP_TO_BOTTOM", ge[ge.BY_STYLE = 5] = "BY_STYLE";
function sr(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
let Qn = {}, et = [{ code: 170, name: "multileaderType", parser: a }, { code: 291, name: "doglegEnabled", parser: p }, { code: 40, name: "doglegLength", parser: a }, { code: 172, name: "contentType", parser: a }, { code: 3, name: "textContent", parser: a }, { code: 12, name: "textAnchor", parser: o }, { code: 344, name: "blockHandle", parser: a }, { code: 15, name: "blockPosition", parser: o }, { code: 302, name: "leaderSections", parser: function(e, r, n) {
  let t, s = { leaderLines: [] };
  for (; r.hasNext() && (t = r.next()).code !== 303; ) switch (t.code) {
    case 10:
      s.landingPoint = o(t.value, r);
      break;
    case 11:
      s.doglegVector = o(t.value, r);
      break;
    case 40:
      s.doglegLength = t.value;
      break;
    case 304:
      s.leaderLines.push(function(i) {
        let l, I = { vertices: [] };
        for (; i.hasNext() && (l = i.next()).code !== 305; ) l.code === 10 && I.vertices.push(o(l.value, i));
        return I;
      }(r));
  }
  return s;
}, isMultiple: !0 }, ...f];
class ir {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    sr(this, "parser", c(et, Qn));
  }
}
function cr(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
sr(ir, "ForEntityName", "MULTILEADER");
let at = { thickness: 0, extrusionDirection: { x: 0, y: 0, z: 1 }, angle: 0 }, rt = [{ code: 50, name: "angle", parser: a }, { code: 210, name: "extrusionDirection", parser: o }, { code: 39, name: "thickness", parser: a }, { code: 10, name: "position", parser: o }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class lr {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    cr(this, "parser", c(rt, at));
  }
}
function dr(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
cr(lr, "ForEntityName", "POINT");
let nt = { startWidth: 0, endWidth: 0, bulge: 0 }, tt = [{ code: 91, name: "id", parser: a }, { code: [...ea(71, 75)], name: "faces", isMultiple: !0, parser: a }, { code: 50, name: "tangentDirection", parser: a }, { code: 70, name: "flag", parser: a }, { code: 42, name: "bulge", parser: a }, { code: 41, name: "endWidth", parser: a }, { code: 40, name: "startWidth", parser: a }, { code: 30, name: "z", parser: a }, { code: 20, name: "y", parser: a }, { code: 10, name: "x", parser: a }, { code: 100, name: "subclassMarker", parser: a }, { code: 100 }, ...f];
class pa {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    dr(this, "parser", c(tt, nt));
  }
}
function pr(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
dr(pa, "ForEntityName", "VERTEX");
let ot = { thickness: 0, flag: 0, startWidth: 0, endWidth: 0, meshMVertexCount: 0, meshNVertexCount: 0, surfaceMDensity: 0, surfaceNDensity: 0, smoothType: 0, extrusionDirection: { x: 0, y: 0, z: 1 }, vertices: [] }, st = [{ code: 0, name: "vertices", isMultiple: !0, parser: (e, r) => u(e, 0, "VERTEX") ? (e = r.next(), new pa().parseEntity(r, e)) : Xe }, { code: 210, name: "extrusionDirection", parser: o }, { code: 75, name: "smoothType", parser: a }, { code: 74, name: "surfaceNDensity", parser: a }, { code: 73, name: "surfaceMDensity", parser: a }, { code: 72, name: "meshNVertexCount", parser: a }, { code: 71, name: "meshMVertexCount", parser: a }, { code: 41, name: "endWidth", parser: a }, { code: 40, name: "startWidth", parser: a }, { code: 70, name: "flag", parser: a }, { code: 39, name: "thickness", parser: a }, { code: 30, name: "elevation", parser: a }, { code: 20 }, { code: 10 }, { code: 66 }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class ur {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    pr(this, "parser", c(st, ot));
  }
}
pr(ur, "ForEntityName", "POLYLINE");
(x = {})[x.CLOSED_POLYLINE = 1] = "CLOSED_POLYLINE", x[x.CURVE_FIT = 2] = "CURVE_FIT", x[x.SPLINE_FIT = 4] = "SPLINE_FIT", x[x.POLYLINE_3D = 8] = "POLYLINE_3D", x[x.POLYGON_3D = 16] = "POLYGON_3D", x[x.CLOSED_POLYGON = 32] = "CLOSED_POLYGON", x[x.POLYFACE = 64] = "POLYFACE", x[x.CONTINUOUS = 128] = "CONTINUOUS";
(te = {})[te.NONE = 0] = "NONE", te[te.QUADRATIC = 5] = "QUADRATIC", te[te.CUBIC = 6] = "CUBIC", te[te.BEZIER = 8] = "BEZIER";
function mr(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
let it = [{ code: 11, name: "direction", parser: o }, { code: 10, name: "position", parser: o }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class fr {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    mr(this, "parser", c(it));
  }
}
function Ir(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
mr(fr, "ForEntityName", "RAY");
let ct = [...aa("data"), { code: 70, name: "version", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class Er {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Ir(this, "parser", c(ct));
  }
}
function hr(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
Ir(Er, "ForEntityName", "REGION");
let lt = { vertices: [], backLineVertices: [] }, dt = [{ code: 360, name: "geometrySettingHardId", parser: a }, { code: 12, name: "backLineVertices", isMultiple: !0, parser: o }, { code: 93, name: "numberOfBackLineVertices", parser: a }, { code: 11, name: "vertices", isMultiple: !0, parser: o }, { code: 92, name: "verticesCount", parser: a }, { code: [63, 411], name: "indicatorColor", parser: a }, { code: 70, name: "indicatorTransparency", parser: a }, { code: 41, name: "bottomHeight", parser: a }, { code: 40, name: "topHeight", parser: a }, { code: 10, name: "verticalDirection", parser: o }, { code: 1, name: "name", parser: a }, { code: 91, name: "flag", parser: a }, { code: 90, name: "state", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class br {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    hr(this, "parser", c(dt, lt));
  }
}
function Or(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
hr(br, "ForEntityName", "SECTION");
let pt = { points: [], thickness: 0, extrusionDirection: { x: 0, y: 0, z: 1 } }, ut = [{ code: 210, name: "extrusionDirection", parser: o }, { code: 39, name: "thickness", parser: a }, { code: [...ea(10, 14)], name: "points", isMultiple: !0, parser: o }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class Tr {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Or(this, "parser", c(ut, pt));
  }
}
function Nr(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
Or(Tr, "ForEntityName", "SOLID");
let mt = [{ code: 350, name: "historyObjectSoftId", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...aa("data"), { code: 70, name: "version", parser: a }, { code: 100 }, ...f];
class Sr {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Nr(this, "parser", c(mt));
  }
}
function gr(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
Nr(Sr, "ForEntityName", "3DSOLID");
let ft = { knotTolerance: 1e-6, controlTolerance: 1e-6, fitTolerance: 1e-9, knotValues: [], controlPoints: [], fitPoints: [] }, It = [{ code: 11, name: "fitPoints", isMultiple: !0, parser: o }, { code: 10, name: "controlPoints", isMultiple: !0, parser: o }, { code: 41, name: "weights", isMultiple: !0, parser: a }, { code: 40, name: "knots", isMultiple: !0, parser: a }, { code: 13, name: "endTangent", parser: o }, { code: 12, name: "startTangent", parser: o }, { code: 44, name: "fitTolerance", parser: a }, { code: 43, name: "controlTolerance", parser: a }, { code: 42, name: "knotTolerance", parser: a }, { code: 74, name: "numberOfFitPoints", parser: a }, { code: 73, name: "numberOfControlPoints", parser: a }, { code: 72, name: "numberOfKnots", parser: a }, { code: 71, name: "degree", parser: a }, { code: 70, name: "flag", parser: a }, { code: 210, name: "normal", parser: o }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class xr {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    gr(this, "parser", c(It, ft));
  }
}
gr(xr, "ForEntityName", "SPLINE");
(F = {})[F.NONE = 0] = "NONE", F[F.CLOSED = 1] = "CLOSED", F[F.PERIODIC = 2] = "PERIODIC", F[F.RATIONAL = 4] = "RATIONAL", F[F.PLANAR = 8] = "PLANAR", F[F.LINEAR = 16] = "LINEAR";
function yr(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
let Et = [{ code: 280, name: "shadowMapSoftness", parser: a }, { code: 71, name: "shadowMapSize", parser: a }, { code: 70, name: "shadowType", parser: a }, { code: 292, name: "isSummerTime", parser: p }, { code: 92, name: "time", parser: a }, { code: 91, name: "julianDay", parser: a }, { code: 291, name: "hasShadow", parser: p }, { code: 40, name: "intensity", parser: a }, { code: 421, name: "lightColorInstance", parser: a }, { code: 63, name: "lightColorIndex", parser: a }, { code: 290, name: "isOn", parser: p }, { code: 90, name: "version", parser: a }, { code: 100, name: "subclassMarker", parser: a, pushContext: !0 }, ...f.filter((e) => e.code !== 100)];
class Ar {
  parseEntity(r, n) {
    let t = { layer: "" };
    return this.parser(n, r, t), t;
  }
  constructor() {
    yr(this, "parser", c(Et));
  }
}
yr(Ar, "ForEntityName", "SUN");
class qe {
  parseEntity(r, n) {
    let t = {};
    for (; !r.isEOF(); ) {
      if (n.code === 0) {
        r.rewind();
        break;
      }
      switch (n.code) {
        case 100:
          t.subclassMarker = n.value, n = r.next();
          break;
        case 2:
          t.name = n.value, n = r.next();
          break;
        case 5:
          t.handle = n.value, n = r.next();
          break;
        case 10:
          t.startPoint = Ia(le(r)), n = r.lastReadGroup;
          break;
        case 11:
          t.directionVector = Ia(le(r)), n = r.lastReadGroup;
          break;
        case 90:
          t.tableValue = n.value, n = r.next();
          break;
        case 91:
          t.rowCount = n.value, n = r.next();
          break;
        case 92:
          t.columnCount = n.value, n = r.next();
          break;
        case 93:
          t.overrideFlag = n.value, n = r.next();
          break;
        case 94:
          t.borderColorOverrideFlag = n.value, n = r.next();
          break;
        case 95:
          t.borderLineWeightOverrideFlag = n.value, n = r.next();
          break;
        case 96:
          t.borderVisibilityOverrideFlag = n.value, n = r.next();
          break;
        case 141:
          t.rowHeightArr ?? (t.rowHeightArr = []), t.rowHeightArr.push(n.value), n = r.next();
          break;
        case 142:
          t.columnWidthArr ?? (t.columnWidthArr = []), t.columnWidthArr.push(n.value), n = r.next();
          break;
        case 280:
          t.version = n.value, n = r.next();
          break;
        case 310:
          t.bmpPreview ?? (t.bmpPreview = ""), t.bmpPreview += n.value, n = r.next();
          break;
        case 330:
          t.ownerDictionaryId = n.value, n = r.next();
          break;
        case 342:
          t.tableStyleId = n.value, n = r.next();
          break;
        case 343:
          t.blockRecordHandle = n.value, n = r.next();
          break;
        case 170:
          t.attachmentPoint = n.value, n = r.next();
          break;
        case 171:
          t.cells ?? (t.cells = []), t.cells.push(function(s, i) {
            let l = !1, I = !1, m = {};
            for (; !s.isEOF() && i.code !== 0 && !I; ) switch (i.code) {
              case 171:
                if (l) {
                  I = !0;
                  continue;
                }
                m.cellType = i.value, l = !0, i = s.next();
                break;
              case 172:
                m.flagValue = i.value, i = s.next();
                break;
              case 173:
                m.mergedValue = i.value, i = s.next();
                break;
              case 174:
                m.autoFit = i.value, i = s.next();
                break;
              case 175:
                m.borderWidth = i.value, i = s.next();
                break;
              case 176:
                m.borderHeight = i.value, i = s.next();
                break;
              case 91:
                m.overrideFlag = i.value, i = s.next();
                break;
              case 178:
                m.virtualEdgeFlag = i.value, i = s.next();
                break;
              case 145:
                m.rotation = i.value, i = s.next();
                break;
              case 345:
                m.fieldObjetId = i.value, i = s.next();
                break;
              case 340:
                m.blockTableRecordId = i.value, i = s.next();
                break;
              case 146:
                m.blockScale = i.value, i = s.next();
                break;
              case 177:
                m.blockAttrNum = i.value, i = s.next();
                break;
              case 7:
                m.textStyle = i.value, i = s.next();
                break;
              case 140:
                m.textHeight = i.value, i = s.next();
                break;
              case 170:
                m.attachmentPoint = i.value, i = s.next();
                break;
              case 92:
                m.extendedCellFlags = i.value, i = s.next();
                break;
              case 285:
                m.rightBorderVisibility = !!(i.value ?? !0), i = s.next();
                break;
              case 286:
                m.bottomBorderVisibility = !!(i.value ?? !0), i = s.next();
                break;
              case 288:
                m.leftBorderVisibility = !!(i.value ?? !0), i = s.next();
                break;
              case 289:
                m.topBorderVisibility = !!(i.value ?? !0), i = s.next();
                break;
              case 301:
                (function(S, O, h) {
                  for (; h.code !== 304; ) switch (h.code) {
                    case 301:
                    case 93:
                    case 90:
                    case 94:
                      h = O.next();
                      break;
                    case 1:
                      S.text = h.value, h = O.next();
                      break;
                    case 300:
                      S.attrText = h.value, h = O.next();
                      break;
                    case 302:
                      S.text = h.value ? h.value : S.text, h = O.next();
                      break;
                    default:
                      h = O.next();
                  }
                })(m, s, i), i = s.next();
                break;
              default:
                return m;
            }
            return l = !1, I = !1, m;
          }(r, n)), n = r.lastReadGroup;
          break;
        default:
          fn(t, n, r), n = r.next();
      }
    }
    return t;
  }
}
function Dr(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
(sa = "ForEntityName") in qe ? Object.defineProperty(qe, sa, { value: "ACAD_TABLE", enumerable: !0, configurable: !0, writable: !0 }) : qe[sa] = "ACAD_TABLE";
let ht = [{ code: 11, name: "xAxisDirection", parser: o }, { code: 210, name: "extrusionDirection", parser: o }, { code: 1, name: "text", parser: a }, { code: 10, name: "position", parser: o }, { code: 3, name: "styleName", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class vr {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Dr(this, "parser", c(ht));
  }
}
Dr(vr, "ForEntityName", "TOLERANCE");
(y = {})[y.CREATED_BY_CURVE_FIT = 1] = "CREATED_BY_CURVE_FIT", y[y.TANGENT_DEFINED = 2] = "TANGENT_DEFINED", y[y.NOT_USED = 4] = "NOT_USED", y[y.CREATED_BY_SPLINE_FIT = 8] = "CREATED_BY_SPLINE_FIT", y[y.SPLINE_CONTROL_POINT = 16] = "SPLINE_CONTROL_POINT", y[y.FOR_POLYLINE = 32] = "FOR_POLYLINE", y[y.FOR_POLYGON = 64] = "FOR_POLYGON", y[y.POLYFACE = 128] = "POLYFACE";
let bt = [{ code: [335, 343, 344, 91], name: "softPointers", isMultiple: !0, parser: a }, { code: 361, name: "sunId", parser: a }, { code: 431, name: "ambientLightColorName", parser: a }, { code: 421, name: "ambientLightColorInstance", parser: a }, { code: 63, name: "ambientLightColorIndex", parser: a }, { code: 142, name: "contrast", parser: a }, { code: 141, name: "brightness", parser: a }, { code: 282, name: "defaultLightingType", parser: a }, { code: 292, name: "isDefaultLighting", parser: p }, { code: 348, name: "visualStyleId", parser: a }, { code: 333, name: "shadePlotId", parser: a }, { code: 332, name: "backgroundId", parser: a }, { code: 61, name: "majorGridFrequency", parser: a }, { code: 170, name: "shadePlotMode", parser: a }, { code: 146, name: "elevation", parser: a }, { code: 79, name: "orthographicType", parser: a }, { code: 346, name: "ucsBaseId", parser: a }, { code: 345, name: "ucsId", parser: a }, { code: 112, name: "ucsYAxis", parser: o }, { code: 111, name: "ucsXAxis", parser: o }, { code: 110, name: "ucsOrigin", parser: o }, { code: 74, name: "iconFlag", parser: a }, { code: 71, name: "ucsPerViewport", parser: a }, { code: 281, name: "renderMode", parser: a }, { code: 1, name: "sheetName", parser: a }, { code: 340, name: "clippingBoundaryId", parser: a }, { code: 90, name: "statusBitFlags", parser: a }, { code: 331, name: "frozenLayerIds", isMultiple: !0, parser: a }, { code: 72, name: "circleZoomPercent", parser: a }, { code: 51, name: "viewTwistAngle", parser: a }, { code: 50, name: "snapAngle", parser: a }, { code: 45, name: "viewHeight", parser: a }, { code: 44, name: "backClipZ", parser: a }, { code: 43, name: "frontClipZ", parser: a }, { code: 42, name: "perspectiveLensLength", parser: a }, { code: 17, name: "targetPoint", parser: o }, { code: 16, name: "viewDirection", parser: o }, { code: 15, name: "gridSpacing", parser: o }, { code: 14, name: "snapSpacing", parser: o }, { code: 13, name: "snapBase", parser: o }, { code: 12, name: "displayCenter", parser: o }, { code: 69, name: "viewportId", parser: a }, { code: 68, name: "status", parser: a }, { code: 41, name: "height", parser: a }, { code: 40, name: "width", parser: a }, { code: 10, name: "viewportCenter", parser: o }, { code: 100, name: "subclassMarker", parser: a, pushContext: !0 }, ...f];
class Qe {
  parseEntity(r, n) {
    let t = {};
    return c(bt)(n, r, t), t;
  }
}
function Lr(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
(ia = "ForEntityName") in Qe ? Object.defineProperty(Qe, ia, { value: "VIEWPORT", enumerable: !0, configurable: !0, writable: !0 }) : Qe[ia] = "VIEWPORT";
let Ot = { brightness: 50, constrast: 50, fade: 0 }, Tt = [{ code: 14, name: "boundary", isMultiple: !0, parser: o }, { code: 91, name: "numberOfVertices", parser: a }, { code: 71, name: "boundaryType", parser: a }, { code: 360, name: "imageDefReactorHardId", parser: a }, { code: 283, name: "fade", parser: a }, { code: 282, name: "contrast", parser: a }, { code: 281, name: "brightness", parser: a }, { code: 280, name: "isClipping", parser: p }, { code: 70, name: "displayFlag", parser: a }, { code: 340, name: "imageDefHardId", parser: a }, { code: 13, name: "imageSize", parser: o }, { code: 12, name: "vDirection", parser: o }, { code: 11, name: "uDirection", parser: o }, { code: 10, name: "position", parser: o }, { code: 90, name: "classVersion", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class _r {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Lr(this, "parser", c(Tt, Ot));
  }
}
Lr(_r, "ForEntityName", "WIPEOUT");
(oe = {})[oe.ShowImage = 1] = "ShowImage", oe[oe.ShowImageWhenNotAligned = 2] = "ShowImageWhenNotAligned", oe[oe.UseClippingBoundary = 4] = "UseClippingBoundary", oe[oe.Transparency = 8] = "Transparency";
function Mr(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
let Nt = [{ code: 11, name: "direction", parser: o }, { code: 10, name: "position", parser: o }, { code: 100, name: "subclassMarker", parser: a }, ...f];
class Cr {
  parseEntity(r, n) {
    let t = {};
    return this.parser(n, r, t), t;
  }
  constructor() {
    Mr(this, "parser", c(Nt));
  }
}
Mr(Cr, "ForEntityName", "XLINE");
let St = 0;
function Rr(e) {
  if (!e) throw TypeError("entity cannot be undefined or null");
  e.handle || (e.handle = St++);
}
let gt = Object.fromEntries([ga, Ze, _a, wa, Pa, Va, Ke, Ua, Ga, za, Za, $a, Qa, ar, $e, nr, or, Ca, ir, lr, ur, fr, Er, br, Tr, Sr, xr, Ar, qe, va, vr, Ya, pa, Qe, _r, Cr].map((e) => [e.ForEntityName, new e()]));
function wr(e, r) {
  let n = [];
  for (; !u(e, 0, "EOF"); ) {
    if (e.code === 0) {
      if (e.value === "ENDBLK" || e.value === "ENDSEC") {
        r.rewind();
        break;
      }
      let t = gt[e.value];
      if (t) {
        let s = e.value;
        e = r.next();
        let i = t.parseEntity(r, e);
        i.type = s, Rr(i), n.push(i);
      } else r.debug;
    }
    e = r.next();
  }
  return n;
}
function je(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
class ha {
  next() {
    if (!this.hasNext()) return this._eof ? this.debug : this.debug, { code: 0, value: "EOF" };
    let r = parseInt(this._data[this._pointer++], 10), n = ba(r, this._data[this._pointer++], this.debug), t = { code: r, value: n };
    return u(t, 0, "EOF") && (this._eof = !0), this.lastReadGroup = t, t;
  }
  peek() {
    if (!this.hasNext()) throw this._eof ? Error("Cannot call 'next' after EOF group has been read") : Error("Unexpected end of input: EOF group not read before end of file. Ended on code " + this._data[this._pointer]);
    let r = { code: parseInt(this._data[this._pointer]), value: 0 };
    return r.value = ba(r.code, this._data[this._pointer + 1], this.debug), r;
  }
  rewind(r) {
    r = r || 1, this._pointer = this._pointer - 2 * r;
  }
  hasNext() {
    return !this._eof && !(this._pointer > this._data.length - 2);
  }
  isEOF() {
    return this._eof;
  }
  constructor(r, n = !1) {
    je(this, "_data", void 0), je(this, "debug", void 0), je(this, "_pointer", void 0), je(this, "_eof", void 0), je(this, "lastReadGroup", void 0), this._data = r, this.debug = n, this.lastReadGroup = { code: 0, value: 0 }, this._pointer = 0, this._eof = !1;
  }
}
function ba(e, r, n = !1) {
  return e <= 9 ? r : e >= 10 && e <= 59 ? parseFloat(r.trim()) : e >= 60 && e <= 99 ? parseInt(r.trim()) : e >= 100 && e <= 109 ? r : e >= 110 && e <= 149 ? parseFloat(r.trim()) : e >= 160 && e <= 179 ? parseInt(r.trim()) : e >= 210 && e <= 239 ? parseFloat(r.trim()) : e >= 270 && e <= 289 ? parseInt(r.trim()) : e >= 290 && e <= 299 ? function(t) {
    if (t === "0") return !1;
    if (t === "1") return !0;
    throw TypeError("String '" + t + "' cannot be cast to Boolean type");
  }(r.trim()) : e >= 300 && e <= 369 ? r : e >= 370 && e <= 389 ? parseInt(r.trim()) : e >= 390 && e <= 399 ? r : e >= 400 && e <= 409 ? parseInt(r.trim()) : e >= 410 && e <= 419 ? r : e >= 420 && e <= 429 ? parseInt(r.trim()) : e >= 430 && e <= 439 ? r : e >= 440 && e <= 459 ? parseInt(r.trim()) : e >= 460 && e <= 469 ? parseFloat(r.trim()) : e >= 470 && e <= 481 || e === 999 || e >= 1e3 && e <= 1009 ? r : e >= 1010 && e <= 1059 ? parseFloat(r.trim()) : e >= 1060 && e <= 1071 ? parseInt(r.trim()) : r;
}
function xt(e, r) {
  let n = null, t = {};
  for (; !u(e, 0, "EOF") && !u(e, 0, "ENDSEC"); ) e.code === 9 ? n = e.value : e.code === 10 ? t[n] = le(r) : t[n] = e.value, e = r.next();
  return t;
}
let ce = [{ code: 100, name: "subclassMarker", parser: a }, { code: 330, name: "ownerObjectId", parser: a }, { code: 102, isMultiple: !0, parser(e, r) {
  for (; !u(e, 0, "EOF") && !u(e, 102, "}"); ) e = r.next();
} }, { code: 5, name: "handle", parser: a }], yt = [{ code: 70, name: "flag", parser: a }, { code: 2, name: "appName", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...ce], At = c(yt), Dt = c([{ code: 310, name: "bmpPreview", parser: a }, { code: 281, name: "scalability", parser: a }, { code: 280, name: "explodability", parser: a }, { code: 70, name: "insertionUnits", parser: a }, { code: 340, name: "layoutObjects", parser: a }, { code: 2, name: "name", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...ce]), vt = c([...da.map((e) => ({ ...e, parser: a })), { code: 70, name: "standardFlag", parser: a }, { code: 2, name: "name", parser: a }, { code: 100, name: "subclassMarker", parser: a }, { code: 105, name: "handle", parser: a }, ...ce.filter((e) => e.code !== 5)]), Lt = c([{ code: 347, name: "materialObjectId", parser: a }, { code: 390, name: "plotStyleNameObjectId", parser: a }, { code: 370, name: "lineweight", parser: a }, { code: 290, name: "isPlotting", parser: p }, { code: 6, name: "lineType", parser: a }, { code: 62, name: "colorIndex", parser: a }, { code: 70, name: "standardFlag", parser: a }, { code: 2, name: "name", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...ce]), _t = c([{ code: 9, name: "text", parser: a }, { code: 45, name: "offsetY", parser: a }, { code: 44, name: "offsetX", parser: a }, { code: 50, name: "rotation", parser: a }, { code: 46, name: "scale", parser: a }, { code: 340, name: "styleObjectId", parser: a }, { code: 75, name: "shapeNumber", parser: a }, { code: 74, name: "elementTypeFlag", parser: a }, { code: 49, name: "elementLength", parser: a }], { elementTypeFlag: 0, elementLength: 0 }), Mt = c([{ code: 49, name: "pattern", parser(e, r) {
  let n = {};
  return _t(e, r, n), n;
}, isMultiple: !0 }, { code: 40, name: "totalPatternLength", parser: a }, { code: 73, name: "numberOfLineTypes", parser: a }, { code: 72, parser: a }, { code: 3, name: "description", parser: a }, { code: 70, name: "standardFlag", parser: a }, { code: 2, name: "name", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...ce]), Ct = c([{ code: 1e3, name: "extendedFont", parser: a }, { code: 1001 }, { code: 4, name: "bigFont", parser: a }, { code: 3, name: "font", parser: a }, { code: 42, name: "lastHeight", parser: a }, { code: 71, name: "textGenerationFlag", parser: a }, { code: 50, name: "obliqueAngle", parser: a }, { code: 41, name: "widthFactor", parser: a }, { code: 40, name: "fixedTextHeight", parser: a }, { code: 70, name: "standardFlag", parser: a }, { code: 2, name: "name", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...ce]), Rt = [{ code: 13, name: "orthographicOrigin", parser: o }, { code: 71, name: "orthographicType", parser: a }, { code: 346, name: "baseUcsHandle", parser: a }, { code: 146, name: "elevation", parser: a }, { code: 79, name: "isOrthographic", parser: p }, { code: 12, name: "yAxis", parser: o }, { code: 11, name: "xAxis", parser: o }, { code: 10, name: "origin", parser: o }, { code: 70, name: "flag", parser: a }, { code: 2, name: "name", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...ce], wt = c(Rt), Ft = [{ code: 346, name: "baseUcsId", parser: a }, { code: 345, name: "ucsId", parser: a }, { code: 146, name: "elevation", parser: a }, { code: 79, name: "orthographicType", parser: a }, { code: 112, name: "ucsYAxis", parser: o }, { code: 111, name: "ucsXAxis", parser: o }, { code: 110, name: "ucsOrigin", parser: o }, { code: 361, name: "sunHardId", parser: a }, { code: 348, name: "styleHardId", parser: a }, { code: 334, name: "liveSectionSoftId", parser: a }, { code: 332, name: "backgroundSoftId", parser: a }, { code: 73, name: "isPlottable", parser: p }, { code: 72, name: "isUcsAssociated", parser: p }, { code: 281, name: "renderMode", parser: a }, { code: 71, name: "viewMode", parser: a }, { code: 50, name: "twistAngle", parser: a }, { code: 44, name: "backClippingPlane", parser: a }, { code: 43, name: "frontClippingPlane", parser: a }, { code: 42, name: "lensLength", parser: a }, { code: 12, name: "target", parser: o }, { code: 11, name: "direction", parser: o }, { code: 10, name: "center", parser: o }, { code: 41, name: "width", parser: a }, { code: 40, name: "height", parser: a }, { code: 70, name: "flag", parser: a }, { code: 2, name: "name", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...ce], Pt = c(Ft), kt = c([{ code: [63, 421, 431], name: "ambientColor", parser: a }, { code: 142, name: "contrast", parser: a }, { code: 141, name: "brightness", parser: a }, { code: 282, name: "defaultLightingType", parser: a }, { code: 292, name: "isDefaultLightingOn", parser: p }, { code: 348, name: "visualStyleObjectId", parser: a }, { code: 333, name: "shadePlotObjectId", parser: a }, { code: 332, name: "backgroundObjectId", parser: a }, { code: 61, name: "majorGridLines", parser: a }, { code: 170, name: "shadePlotSetting", parser: a }, { code: 146, name: "elevation", parser: a }, { code: 79, name: "orthographicType", parser: a }, { code: 112, name: "ucsYAxis", parser: o }, { code: 111, name: "ucsXAxis", parser: o }, { code: 110, name: "ucsOrigin", parser: o }, { code: 74, name: "ucsIconSetting", parser: a }, { code: 71, name: "viewMode", parser: a }, { code: 281, name: "renderMode", parser: a }, { code: 1, name: "styleSheet", parser: a }, { code: [331, 441], name: "frozenLayers", parser: a, isMultiple: !0 }, { code: 72, name: "circleSides", parser: a }, { code: 51, name: "viewTwistAngle", parser: a }, { code: 50, name: "snapRotationAngle", parser: a }, { code: 45, name: "viewHeight", parser: a }, { code: 44, name: "backClippingPlane", parser: a }, { code: 43, name: "frontClippingPlane", parser: a }, { code: 42, name: "lensLength", parser: a }, { code: 17, name: "viewTarget", parser: o }, { code: 16, name: "viewDirectionFromTarget", parser: o }, { code: 15, name: "gridSpacing", parser: o }, { code: 14, name: "snapSpacing", parser: o }, { code: 13, name: "snapBasePoint", parser: o }, { code: 12, name: "center", parser: o }, { code: 11, name: "upperRightCorner", parser: o }, { code: 10, name: "lowerLeftCorner", parser: o }, { code: 70, name: "standardFlag", parser: a }, { code: 2, name: "name", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...ce]), Vt = { APPID: At, BLOCK_RECORD: Dt, DIMSTYLE: vt, LAYER: Lt, LTYPE: Mt, STYLE: Ct, UCS: wt, VIEW: Pt, VPORT: kt }, Bt = c([{ code: 70, name: "maxNumberOfEntries", parser: a }, { code: 100, name: "subclassMarker", parser: a }, { code: 330, name: "ownerObjectId", parser: a }, { code: 102, parser: X }, { code: 102, parser: X }, { code: 102, parser: X }, { code: 360, isMultiple: !0 }, { code: 5, name: "handle", parser: a }, { code: 2, name: "name", parser: a }]);
function Ut(e, r) {
  var t;
  let n = {};
  for (; !u(e, 0, "EOF") && !u(e, 0, "ENDSEC"); ) {
    if (u(e, 0, "TABLE")) {
      e = r.next();
      let s = { entries: [] };
      Bt(e, r, s), n[s.name] = s;
    }
    if (u(e, 0) && !u(e, 0, "ENDTAB")) {
      let s = e.value;
      e = r.next();
      let i = Vt[s];
      if (!i) {
        r.debug, e = r.next();
        continue;
      }
      let l = {};
      i(e, r, l), (t = n[s]) == null || t.entries.push(l);
    }
    e = r.next();
  }
  return n;
}
function Ht(e, r) {
  let n = {};
  for (; !u(e, 0, "EOF") && !u(e, 0, "ENDSEC"); ) {
    if (u(e, 0, "BLOCK")) {
      let t = Gt(e = r.next(), r);
      Rr(t), t.name && (n[t.name] = t);
    }
    e = r.next();
  }
  return n;
}
function Gt(e, r) {
  let n = {};
  for (; !u(e, 0, "EOF"); ) {
    if (u(e, 0, "ENDBLK")) {
      for (e = r.next(); !u(e, 0, "EOF"); ) {
        if (u(e, 100, "AcDbBlockEnd")) return n;
        e = r.next();
      }
      break;
    }
    switch (e.code) {
      case 1:
        n.xrefPath = e.value;
        break;
      case 2:
        n.name = e.value;
        break;
      case 3:
        n.name2 = e.value;
        break;
      case 5:
        n.handle = e.value;
        break;
      case 8:
        n.layer = e.value;
        break;
      case 10:
        n.position = le(r);
        break;
      case 67:
        n.paperSpace = !!e.value && e.value == 1;
        break;
      case 70:
        e.value !== 0 && (n.type = e.value);
        break;
      case 100:
        break;
      case 330:
        n.ownerHandle = e.value;
        break;
      case 0:
        n.entities = wr(e, r);
    }
    e = r.next();
  }
  return n;
}
let ua = [{ code: 330, name: "ownerObjectId", parser: a }, { code: 102, parser: X }, { code: 102, parser: X }, { code: 102, parser: X }, { code: 5, name: "handle", parser: a }], Fr = [{ code: 333, name: "shadePlotId", parser: a }, { code: 149, name: "imageOriginY", parser: a }, { code: 148, name: "imageOriginX", parser: a }, { code: 147, name: "scaleFactor", parser: a }, { code: 78, name: "shadePlotCustomDPI", parser: a }, { code: 77, name: "shadePlotResolution", parser: a }, { code: 76, name: "shadePlotMode", parser: a }, { code: 75, name: "standardScaleType", parser: a }, { code: 7, name: "currentStyleSheet", parser: a }, { code: 74, name: "plotType", parser: a }, { code: 73, name: "plotRotation", parser: a }, { code: 72, name: "plotPaperUnit", parser: a }, { code: 70, name: "layoutFlag", parser: a }, { code: 143, name: "printScaleDenominator", parser: a }, { code: 142, name: "printScaleNumerator", parser: a }, { code: 141, name: "windowAreaYMax", parser: a }, { code: 140, name: "windowAreaXMax", parser: a }, { code: 49, name: "windowAreaYMin", parser: a }, { code: 48, name: "windowAreaXMin", parser: a }, { code: 47, name: "plotOriginY", parser: a }, { code: 46, name: "plotOriginX", parser: a }, { code: 45, name: "paperHeight", parser: a }, { code: 44, name: "paperWidth", parser: a }, { code: 43, name: "marginTop", parser: a }, { code: 42, name: "marginRight", parser: a }, { code: 41, name: "marginBottom", parser: a }, { code: 40, name: "marginLeft", parser: a }, { code: 6, name: "plotViewName", parser: a }, { code: 4, name: "paperSize", parser: a }, { code: 2, name: "configName", parser: a }, { code: 1, name: "pageSetupName", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...ua], Wt = [{ code: 346, name: "orthographicUcsId", parser: a }, { code: 345, name: "namedUcsId", parser: a }, { code: 331, name: "viewportId", parser: a }, { code: 330, name: "paperSpaceTableId", parser: a }, { code: 76, name: "orthographicType", parser: a }, { code: 17, name: "ucsYAxis", parser: o }, { code: 16, name: "ucsXAxis", parser: o }, { code: 13, name: "ucsOrigin", parser: o }, { code: 146, name: "elevation", parser: a }, { code: 15, name: "maxExtent", parser: o }, { code: 14, name: "minExtent", parser: o }, { code: 12, name: "insertionPoint", parser: o }, { code: 11, name: "maxLimit", parser: o }, { code: 10, name: "minLimit", parser: o }, { code: 71, name: "tabOrder", parser: a }, { code: 70, name: "controlFlag", parser: a }, { code: 1, name: "layoutName", parser: a }, { code: 100, name: "subclassMarker", parser: a }, ...Fr], jt = [{ code: 3, name: "entries", parser: (e, r) => {
  let n = { name: e.value };
  return (e = r.next()).code === 350 ? n.objectSoftId = e.value : e.code === 360 ? n.objectHardId = e.value : r.rewind(), n;
}, isMultiple: !0 }, { code: 281, name: "recordCloneFlag", parser: a }, { code: 280, name: "isHardOwned", parser: p }, { code: 100, name: "subclassMarker", parser: a }, ...ua], Yt = [{ code: 40, name: "wcsToOCSTransform", parser: Oa }, { code: 40, name: "ocsToWCSTransform", parser: Oa }, { code: 41, name: "backClippingDistance", parser: a }, { code: 73, name: "isBackClipping", parser: p, pushContext: !0 }, { code: 40, name: "frontClippingDistance", parser: a }, { code: 72, name: "isFrontClipping", parser: p, pushContext: !0 }, { code: 71, name: "isClipBoundaryDisplayed", parser: p }, { code: 11, name: "position", parser: o }, { code: 210, name: "normal", parser: o }, { code: 10, name: "boundaryVertices", parser: o, isMultiple: !0 }, { code: 70, name: "boundaryCount", parser: a }, { code: 100, name: "subclassMarker", parser: a }, { code: 100 }, ...ua];
function Oa(e, r) {
  let n = [];
  for (let t = 0; t < 3 && u(e, 40); ++t) {
    let s = [];
    for (let i = 0; i < 4 && u(e, 40); ++i) s.push(e.value), e = r.next();
    n.push(s);
  }
  return r.rewind(), n;
}
let Xt = [{ code: 330, name: "imageDefReactorIdSoft", isMultiple: !0, parser: a }, { code: 90, name: "version", parser: a }, { code: 1, name: "fileName", parser: a }, { code: 10, name: "size", parser: o }, { code: 11, name: "sizeOfOnePixel", parser: o }, { code: 280, name: "isLoaded", parser: a }, { code: 281, name: "resolutionUnits", parser: a }, { code: 100, name: "subclassMarker", parser: a }], zt = { LAYOUT: Wt, PLOTSETTINGS: Fr, DICTIONARY: jt, SPATIAL_FILTER: Yt, IMAGEDEF: Xt };
function Kt(e, r) {
  let n = [];
  for (; e.code !== 0 || !["EOF", "ENDSEC"].includes(e.value); ) {
    let t = e.value, s = zt[t];
    if (e.code === 0 && (s != null && s.length)) {
      let i = c(s), l = { name: t };
      i(e = r.next(), r, l) ? (n.push(l), e = r.peek()) : e = r.next();
    } else e = r.next();
  }
  return { byName: dn(n, ({ name: t }) => t) };
}
function Ye(e, r, n) {
  return r in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
class Zt {
  constructor() {
    Ye(this, "encoding", "utf-8"), Ye(this, "encodingFailureFatal", !1), Ye(this, "thumbnailImageFormat", "base64");
  }
}
class Jt extends EventTarget {
  parseSync(r, n = !1) {
    let t = new ha(r.split(/\r\n|\r|\n/g), n);
    if (!t.hasNext()) throw Error("Empty file");
    return this.parseAll(t);
  }
  parseStream(r) {
    let n = "", t = this;
    return new Promise((s, i) => {
      r.on("data", (l) => {
        n += l;
      }), r.on("end", () => {
        try {
          let l = n.split(/\r\n|\r|\n/g), I = new ha(l);
          if (!I.hasNext()) throw Error("Empty file");
          s(t.parseAll(I));
        } catch (l) {
          i(l);
        }
      }), r.on("error", (l) => {
        i(l);
      });
    });
  }
  async parseFromUrl(r, n) {
    let t = await fetch(r, n);
    if (!t.body) return null;
    let s = t.body.getReader(), i = "";
    for (; ; ) {
      let { done: l, value: I } = await s.read();
      if (l) {
        i += this._decoder.decode(new ArrayBuffer(0), { stream: !1 });
        break;
      }
      i += this._decoder.decode(I, { stream: !0 });
    }
    return this.parseSync(i);
  }
  parseAll(r) {
    let n = { header: {}, blocks: {}, entities: [], tables: {}, objects: { byName: {}, byTree: void 0 } }, t = r.next();
    for (; !u(t, 0, "EOF"); ) u(t, 0, "SECTION") && (u(t = r.next(), 2, "HEADER") ? n.header = xt(t = r.next(), r) : u(t, 2, "CLASSES") ? Kr(t = r.next(), r, n) : u(t, 2, "BLOCKS") ? n.blocks = Ht(t = r.next(), r) : u(t, 2, "ENTITIES") ? n.entities = wr(t = r.next(), r) : u(t, 2, "TABLES") ? n.tables = Ut(t = r.next(), r) : u(t, 2, "OBJECTS") ? n.objects = Kt(t = r.next(), r) : u(t, 2, "THUMBNAILIMAGE") && (n.thumbnailImage = function(s, i, l = "base64") {
      let I, m = "", S = 0;
      for (; !u(s, 0, "EOF") && !u(s, 0, "ENDSEC"); ) s.code === 90 ? S = s.value : s.code === 310 && (m += s.value), s = i.next();
      if (l === "hex") I = m;
      else {
        let O = function(h) {
          let A = h.length / 2, _ = new Uint8Array(A);
          for (let j = 0; j < A; j++) _[j] = parseInt(h.substr(2 * j, 2), 16);
          return _;
        }(m);
        I = l === "buffer" ? O : function(h) {
          let A = "";
          for (let _ = 0; _ < h.length; _++) A += String.fromCharCode(h[_]);
          return btoa(A);
        }(O);
      }
      return { size: S, data: I };
    }(t = r.next(), r, this._options.thumbnailImageFormat))), t = r.next();
    return n;
  }
  constructor(r = {}) {
    super(), Ye(this, "_decoder", void 0), Ye(this, "_options", void 0);
    let n = new Zt();
    this._options = Object.assign(n, r), this._decoder = new TextDecoder(this._options.encoding, { fatal: this._options.encodingFailureFatal });
  }
}
(P = {})[P.NOT_APPLICABLE = 0] = "NOT_APPLICABLE", P[P.KEEP_EXISTING = 1] = "KEEP_EXISTING", P[P.USE_CLONE = 2] = "USE_CLONE", P[P.XREF_VALUE_NAME = 3] = "XREF_VALUE_NAME", P[P.VALUE_NAME = 4] = "VALUE_NAME", P[P.UNMANGLE_NAME = 5] = "UNMANGLE_NAME";
(xe = {})[xe.NOUNIT = 0] = "NOUNIT", xe[xe.CENTIMETERS = 2] = "CENTIMETERS", xe[xe.INCH = 5] = "INCH";
(We = {})[We.PSLTSCALE = 1] = "PSLTSCALE", We[We.LIMCHECK = 2] = "LIMCHECK";
(ye = {})[ye.INCHES = 0] = "INCHES", ye[ye.MILLIMETERS = 1] = "MILLIMETERS", ye[ye.PIXELS = 2] = "PIXELS";
(k = {})[k.LAST_SCREEN_DISPLAY = 0] = "LAST_SCREEN_DISPLAY", k[k.DRAWING_EXTENTS = 1] = "DRAWING_EXTENTS", k[k.DRAWING_LIMITS = 2] = "DRAWING_LIMITS", k[k.VIEW_SPECIFIED = 3] = "VIEW_SPECIFIED", k[k.WINDOW_SPECIFIED = 4] = "WINDOW_SPECIFIED", k[k.LAYOUT_INFORMATION = 5] = "LAYOUT_INFORMATION";
(se = {})[se.AS_DISPLAYED = 0] = "AS_DISPLAYED", se[se.WIREFRAME = 1] = "WIREFRAME", se[se.HIDDEN = 2] = "HIDDEN", se[se.RENDERED = 3] = "RENDERED";
(V = {})[V.DRAFT = 0] = "DRAFT", V[V.PREVIEW = 1] = "PREVIEW", V[V.NORMAL = 2] = "NORMAL", V[V.PRESENTATION = 3] = "PRESENTATION", V[V.MAXIMUM = 4] = "MAXIMUM", V[V.CUSTOM = 5] = "CUSTOM";
(ie = {})[ie.NONE = 0] = "NONE", ie[ie.AbsoluteRotation = 1] = "AbsoluteRotation", ie[ie.TextEmbedded = 2] = "TextEmbedded", ie[ie.ShapeEmbedded = 4] = "ShapeEmbedded";
(ca = {})[ca.PaperSpace = 1] = "PaperSpace";
(Ae = {})[Ae.XrefDependent = 16] = "XrefDependent", Ae[Ae.XrefResolved = 32] = "XrefResolved", Ae[Ae.Referenced = 64] = "Referenced";
(B = {})[B.Off = 0] = "Off", B[B.Perspective = 1] = "Perspective", B[B.ClipFront = 2] = "ClipFront", B[B.ClipBack = 4] = "ClipBack", B[B.UcsFollow = 8] = "UcsFollow", B[B.ClipFrontByFrontZ = 16] = "ClipFrontByFrontZ";
const Ta = [
  { name: "AC1.2", value: 1 },
  { name: "AC1.40", value: 2 },
  { name: "AC1.50", value: 3 },
  { name: "AC2.20", value: 4 },
  { name: "AC2.10", value: 5 },
  { name: "AC2.21", value: 6 },
  { name: "AC2.22", value: 7 },
  { name: "AC1001", value: 8 },
  { name: "AC1002", value: 9 },
  { name: "AC1003", value: 10 },
  { name: "AC1004", value: 11 },
  { name: "AC1005", value: 12 },
  { name: "AC1006", value: 13 },
  { name: "AC1007", value: 14 },
  { name: "AC1008", value: 15 },
  { name: "AC1009", value: 16 },
  { name: "AC1010", value: 17 },
  { name: "AC1011", value: 18 },
  { name: "AC1012", value: 19 },
  { name: "AC1013", value: 20 },
  { name: "AC1014", value: 21 },
  { name: "AC1500", value: 22 },
  { name: "AC1015", value: 23 },
  { name: "AC1800a", value: 24 },
  { name: "AC1018", value: 25 },
  { name: "AC2100a", value: 26 },
  { name: "AC1021", value: 27 },
  { name: "AC2400a", value: 28 },
  { name: "AC1024", value: 29 },
  { name: "AC1027", value: 31 },
  { name: "AC3200a", value: 32 },
  { name: "AC1032", value: 33 }
];
class $t {
  constructor(r) {
    if (typeof r == "string") {
      const n = Ta.find((t) => t.name === r);
      if (!n)
        throw new Error(`Unknown DWG version name: ${r}`);
      this.name = n.name, this.value = n.value;
      return;
    }
    if (typeof r == "number") {
      const n = Ta.find((t) => t.value === r);
      if (!n)
        throw new Error(`Unknown DWG version value: ${r}`);
      this.name = n.name, this.value = n.value;
      return;
    }
    throw new Error("Invalid constructor argument for AcDbDwgVersion");
  }
}
var Pr = /* @__PURE__ */ ((e) => (e[e.UTF8 = 0] = "UTF8", e[e.US_ASCII = 1] = "US_ASCII", e[e.ISO_8859_1 = 2] = "ISO_8859_1", e[e.ISO_8859_2 = 3] = "ISO_8859_2", e[e.ISO_8859_3 = 4] = "ISO_8859_3", e[e.ISO_8859_4 = 5] = "ISO_8859_4", e[e.ISO_8859_5 = 6] = "ISO_8859_5", e[e.ISO_8859_6 = 7] = "ISO_8859_6", e[e.ISO_8859_7 = 8] = "ISO_8859_7", e[e.ISO_8859_8 = 9] = "ISO_8859_8", e[e.ISO_8859_9 = 10] = "ISO_8859_9", e[e.CP437 = 11] = "CP437", e[e.CP850 = 12] = "CP850", e[e.CP852 = 13] = "CP852", e[e.CP855 = 14] = "CP855", e[e.CP857 = 15] = "CP857", e[e.CP860 = 16] = "CP860", e[e.CP861 = 17] = "CP861", e[e.CP863 = 18] = "CP863", e[e.CP864 = 19] = "CP864", e[e.CP865 = 20] = "CP865", e[e.CP869 = 21] = "CP869", e[e.CP932 = 22] = "CP932", e[e.MACINTOSH = 23] = "MACINTOSH", e[e.BIG5 = 24] = "BIG5", e[e.CP949 = 25] = "CP949", e[e.JOHAB = 26] = "JOHAB", e[e.CP866 = 27] = "CP866", e[e.ANSI_1250 = 28] = "ANSI_1250", e[e.ANSI_1251 = 29] = "ANSI_1251", e[e.ANSI_1252 = 30] = "ANSI_1252", e[e.GB2312 = 31] = "GB2312", e[e.ANSI_1253 = 32] = "ANSI_1253", e[e.ANSI_1254 = 33] = "ANSI_1254", e[e.ANSI_1255 = 34] = "ANSI_1255", e[e.ANSI_1256 = 35] = "ANSI_1256", e[e.ANSI_1257 = 36] = "ANSI_1257", e[e.ANSI_874 = 37] = "ANSI_874", e[e.ANSI_932 = 38] = "ANSI_932", e[e.ANSI_936 = 39] = "ANSI_936", e[e.ANSI_949 = 40] = "ANSI_949", e[e.ANSI_950 = 41] = "ANSI_950", e[e.ANSI_1361 = 42] = "ANSI_1361", e[e.UTF16 = 43] = "UTF16", e[e.ANSI_1258 = 44] = "ANSI_1258", e[e.UNDEFINED = 255] = "UNDEFINED", e))(Pr || {});
const qt = [
  "utf-8",
  "utf-8",
  "iso-8859-1",
  "iso-8859-2",
  "iso-8859-3",
  "iso-8859-4",
  "iso-8859-5",
  "iso-8859-6",
  "iso-8859-7",
  "iso-8859-8",
  "iso-8859-9",
  "utf-8",
  "utf-8",
  "utf-8",
  "utf-8",
  "utf-8",
  "utf-8",
  "utf-8",
  "utf-8",
  "utf-8",
  "utf-8",
  "utf-8",
  "shift-jis",
  "macintosh",
  "big5",
  "utf-8",
  "utf-8",
  "ibm866",
  "windows-1250",
  "windows-1251",
  "windows-1252",
  "gbk",
  "windows-1253",
  "windows-1254",
  "windows-1255",
  "windows-1256",
  "windows-1257",
  "windows-874",
  "shift-jis",
  "gbk",
  "euc-kr",
  "big5",
  "utf-8",
  "utf-16le",
  "windows-1258"
], Qt = (e) => qt[e];
class eo {
  parse(r) {
    const n = new Jt(), t = this.getDxfInfoFromBuffer(r);
    let s = "";
    return t.version && t.version.value <= 23 && t.encoding ? s = new TextDecoder(t.encoding).decode(r) : s = new TextDecoder().decode(r), n.parseSync(s);
  }
  getDxfInfoFromBuffer(r) {
    var S, O, h;
    const t = new TextDecoder("utf-8");
    let s = 0, i = "", l = null, I = null, m = !1;
    for (; s < r.byteLength; ) {
      const A = Math.min(s + 65536, r.byteLength), _ = r.slice(s, A);
      s = A;
      const Y = (i + t.decode(_, { stream: !0 })).split(/\r?\n/);
      i = Y.pop() ?? "";
      for (let M = 0; M < Y.length; M++) {
        const U = Y[M].trim();
        if (U === "SECTION" && ((S = Y[M + 2]) == null ? void 0 : S.trim()) === "HEADER")
          m = !0;
        else if (U === "ENDSEC" && m)
          return { version: l, encoding: I };
        if (m && U === "$ACADVER") {
          const de = (O = Y[M + 2]) == null ? void 0 : O.trim();
          de && (l = new $t(de));
        } else if (m && U === "$DWGCODEPAGE") {
          const de = (h = Y[M + 2]) == null ? void 0 : h.trim();
          if (de) {
            const ra = Pr[de];
            I = Qt(ra);
          }
        }
        if (l && I)
          return { version: l, encoding: I };
      }
    }
    return { version: l, encoding: I };
  }
}
class ao {
  constructor() {
    this.setupMessageHandler();
  }
  setupMessageHandler() {
    self.onmessage = async (r) => {
      const { id: n, input: t } = r.data;
      try {
        const s = await this.executeTask(t);
        this.sendResponse(n, !0, s);
      } catch (s) {
        this.sendResponse(
          n,
          !1,
          void 0,
          s instanceof Error ? s.message : String(s)
        );
      }
    };
  }
  sendResponse(r, n, t, s) {
    const i = {
      id: r,
      success: n,
      data: t,
      error: s
    };
    self.postMessage(i);
  }
}
class ro extends ao {
  async executeTask(r) {
    return new eo().parse(r);
  }
}
const no = new ro();
export {
  no as dxfParser
};
