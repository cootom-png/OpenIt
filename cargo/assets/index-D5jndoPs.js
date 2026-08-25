(function() {
    const t = document.createElement("link").relList;
    if (t && t.supports && t.supports("modulepreload")) return;
    for (const s of document.querySelectorAll('link[rel="modulepreload"]')) n(s);
    new MutationObserver(s => {
        for (const r of s)
            if (r.type === "childList")
                for (const a of r.addedNodes) a.tagName === "LINK" && a.rel === "modulepreload" && n(a)
    }).observe(document, {
        childList: !0,
        subtree: !0
    });

    function e(s) {
        const r = {};
        return s.integrity && (r.integrity = s.integrity), s.referrerPolicy && (r.referrerPolicy = s.referrerPolicy), s.crossOrigin === "use-credentials" ? r.credentials = "include" : s.crossOrigin === "anonymous" ? r.credentials = "omit" : r.credentials = "same-origin", r
    }

    function n(s) {
        if (s.ep) return;
        s.ep = !0;
        const r = e(s);
        fetch(s.href, r)
    }
})();
const gl = [{
    code: "LWH",
    axes: ["lengthMm", "widthMm", "heightMm"],
    sideLoaded: !1,
    upsideDown: !1,
    horizontallyRotated: !1
}, {
    code: "WLH",
    axes: ["widthMm", "lengthMm", "heightMm"],
    sideLoaded: !1,
    upsideDown: !1,
    horizontallyRotated: !0
}, {
    code: "LHW",
    axes: ["lengthMm", "heightMm", "widthMm"],
    sideLoaded: !0,
    upsideDown: !1,
    horizontallyRotated: !1
}, {
    code: "HLW",
    axes: ["heightMm", "lengthMm", "widthMm"],
    sideLoaded: !0,
    upsideDown: !1,
    horizontallyRotated: !0
}, {
    code: "WHL",
    axes: ["widthMm", "heightMm", "lengthMm"],
    sideLoaded: !0,
    upsideDown: !1,
    horizontallyRotated: !1
}, {
    code: "HWL",
    axes: ["heightMm", "widthMm", "lengthMm"],
    sideLoaded: !0,
    upsideDown: !1,
    horizontallyRotated: !0
}, {
    code: "LWH_INVERTED",
    axes: ["lengthMm", "widthMm", "heightMm"],
    sideLoaded: !1,
    upsideDown: !0,
    horizontallyRotated: !1
}, {
    code: "WLH_INVERTED",
    axes: ["widthMm", "lengthMm", "heightMm"],
    sideLoaded: !1,
    upsideDown: !0,
    horizontallyRotated: !0
}, {
    code: "LHW_INVERTED",
    axes: ["lengthMm", "heightMm", "widthMm"],
    sideLoaded: !0,
    upsideDown: !0,
    horizontallyRotated: !1
}, {
    code: "HLW_INVERTED",
    axes: ["heightMm", "lengthMm", "widthMm"],
    sideLoaded: !0,
    upsideDown: !0,
    horizontallyRotated: !0
}, {
    code: "WHL_INVERTED",
    axes: ["widthMm", "heightMm", "lengthMm"],
    sideLoaded: !0,
    upsideDown: !0,
    horizontallyRotated: !1
}, {
    code: "HWL_INVERTED",
    axes: ["heightMm", "widthMm", "lengthMm"],
    sideLoaded: !0,
    upsideDown: !0,
    horizontallyRotated: !0
}];

function xl(i, t) {
    return !(i.mustStayUpright && (t.sideLoaded || t.upsideDown) || t.sideLoaded && !i.allowSideLoading || t.upsideDown && !i.allowUpsideDown || t.horizontallyRotated && !i.allowHorizontalRotation || i.allowedOrientations !== void 0 && !i.allowedOrientations.includes(t.code))
}

function Po(i) {
    const t = [],
        e = new Set;
    for (const n of gl) {
        if (!xl(i, n)) continue;
        const [s, r, a] = n.axes, o = {
            code: n.code,
            lengthMm: i[s],
            widthMm: i[r],
            heightMm: i[a],
            sideLoaded: n.sideLoaded,
            upsideDown: n.upsideDown
        }, c = `${o.lengthMm}:${o.widthMm}:${o.heightMm}:${o.upsideDown}`;
        e.has(c) || (e.add(c), t.push(o))
    }
    return t
}
const Vt = 1e-6;

function Nn(i, t, e, n, s, r) {
    return {
        x: i,
        y: t,
        z: e,
        x2: i + n,
        y2: t + s,
        z2: e + r,
        length: n,
        width: s,
        height: r
    }
}

function vl(i, t) {
    return i.x < t.x2 - Vt && i.x2 > t.x + Vt && i.y < t.y2 - Vt && i.y2 > t.y + Vt && i.z < t.z2 - Vt && i.z2 > t.z + Vt
}

function Ml(i, t) {
    return i.x >= t.x - Vt && i.x2 <= t.x2 + Vt && i.y >= t.y - Vt && i.y2 <= t.y2 + Vt && i.z >= t.z - Vt && i.z2 <= t.z2 + Vt
}

function Sl(i, t) {
    const e = [];
    if (t.x2 < i.x2 - Vt && e.push(Nn(t.x2, i.y, i.z, i.x2 - t.x2, i.width, i.height)), t.y2 < i.y2 - Vt) {
        const n = i.x,
            s = Math.min(i.x2, t.x2);
        s - n > Vt && e.push(Nn(n, t.y2, i.z, s - n, i.y2 - t.y2, i.height))
    } else t.y2 >= i.y2 - Vt && t.x2 < i.x2 - Vt;
    if (t.z2 < i.z2 - Vt) {
        const n = i.x,
            s = Math.min(i.x2, t.x2),
            r = i.y,
            a = Math.min(i.y2, t.y2);
        s - n > Vt && a - r > Vt && e.push(Nn(n, r, t.z2, s - n, a - r, i.z2 - t.z2))
    }
    return e.filter(n => n.length > Vt && n.width > Vt && n.height > Vt)
}

function El(i) {
    return {
        enforceSupport: i?.enforceSupport ?? !0,
        enforceTopLoad: i?.enforceTopLoad ?? !0,
        maxPlacementsPerContainer: i?.maxPlacementsPerContainer ?? 5e4
    }
}
class yl {
    options;
    constructor(t) {
        this.options = El(t)
    }
    solve(t) {
        if (t.products.length === 0) throw new Error("PlanInput 至少需要一个产品。");
        if (t.containerTypes.length === 0) throw new Error("PlanInput 至少需要一种柜型。");
        const e = t.products.map((_, u) => ({
                productIndex: u,
                sku: _.sku,
                weightG: _.weightG,
                quantity: _.quantity
            })),
            n = new Map;
        t.products.forEach((_, u) => n.set(u, Po(_)));
        const s = [];
        let r = 0;
        for (const _ of t.containerTypes)
            for (let u = 0; u < _.quantity; u += 1) s.push({
                containerIndex: r,
                type: _
            }), r += 1;
        const a = s.reduce((_, u) => _ + u.type.innerLengthMm * u.type.innerWidthMm * u.type.innerHeightMm, 0),
            o = s.reduce((_, u) => _ + u.type.maxPayloadG, 0),
            c = [],
            l = e.map(_ => ({
                ..._
            }));
        const looseCargoMaxGapMm = Math.max(0, t.looseCargoMaxGapMm ?? 50);
        for (const {
                containerIndex: _,
                type: u
            }
            of s) {
            if (l.every(E => E.quantity <= 0)) break;
            const h = {
                spaces: [Nn(0, 0, 0, u.innerLengthMm, u.innerWidthMm, u.innerHeightMm)],
                placed: [],
                usedWeightG: 0
            };
            let w = 0,
                T = !0;
            for (; T && w < this.options.maxPlacementsPerContainer;) {
                T = !1;
                let E = null,
                    P = Number.NEGATIVE_INFINITY;
                for (let R = 0; R < h.spaces.length; R += 1) {
                    const b = h.spaces[R];
                    let I = !1;
                    for (let M = 0; M < l.length; M += 1) {
                        const S = l[M];
                        if (S.quantity <= 0) continue;
                        const A = n.get(S.productIndex) ?? [];
                        for (const G of A)
                            if (G.lengthMm <= b.length + Vt && G.widthMm <= b.width + Vt && G.heightMm <= b.height + Vt) {
                                I = !0;
                                break
                            } if (I) break
                    }
                    if (I)
                        for (let M = 0; M < l.length; M += 1) {
                            const S = l[M];
                            if (S.quantity <= 0) continue;
                            const A = t.products[S.productIndex],
                                G = n.get(S.productIndex) ?? [];
                            for (const O of G) {
                                if (O.lengthMm > b.length + Vt || O.widthMm > b.width + Vt) continue;
                                const N = O.heightMm,
                                    q = Math.floor(b.height / N + Vt);
                                if (q < 1) continue;
                                // Place one carton at a time. Fill the deepest longitudinal
                                // section from bottom to top before advancing toward the door,
                                // leaving one continuous empty area for later products.
                                let V = 1;
                                if (this.options.enforceSupport) {
                                    const tt = Nn(b.x, b.y, b.z, O.lengthMm, O.widthMm, O.heightMm);
                                    if (!Tl(tt, h.placed, t.minimumSupportRatio)) continue
                                }
                                if (h.usedWeightG + S.weightG > u.maxPayloadG) continue;
                                if (this.options.enforceTopLoad && A.maxTopLoadG !== void 0) {
                                    const tt = A.maxTopLoadG / S.weightG + 1;
                                    V = Math.min(V, Math.max(1, Math.floor(tt)))
                                }
                                if (V < 1) continue;
                                const K = V * N,
                                    z = Nn(b.x, b.y, b.z, O.lengthMm, O.widthMm, K);
                                if (z.x2 > b.x2 + Vt || z.y2 > b.y2 + Vt || z.z2 > b.z2 + Vt) continue;
                                const st = z.length * z.width * z.height,
                                    isBoundedSectionSpace = b.length < u.innerLengthMm - b.x - Vt,
                                    longitudinalRemainder = Math.max(0, b.length - O.lengthMm),
                                    fragmentsCurrentSection = isBoundedSectionSpace && longitudinalRemainder > looseCargoMaxGapMm + Vt,
                                    isEarlierLoadPosition = E === null ||
                                    E.fragmentsCurrentSection && !fragmentsCurrentSection ||
                                    E.fragmentsCurrentSection === fragmentsCurrentSection && (
                                    z.x < E.box.x - Vt ||
                                    Math.abs(z.x - E.box.x) <= Vt && z.z < E.box.z - Vt ||
                                    Math.abs(z.x - E.box.x) <= Vt && Math.abs(z.z - E.box.z) <= Vt && z.y < E.box.y - Vt ||
                                    Math.abs(z.x - E.box.x) <= Vt && Math.abs(z.z - E.box.z) <= Vt && Math.abs(z.y - E.box.y) <= Vt && st > P);
                                isEarlierLoadPosition && (P = st, E = {
                                    box: z,
                                    orientation: O,
                                    height: N,
                                    count: V,
                                    productIndex: S.productIndex,
                                    fragmentsCurrentSection
                                })
                            }
                        }
                }
                if (E !== null) {
                    const R = l[E.productIndex],
                        b = Math.min(E.count, R.quantity);
                    for (let M = 0; M < b; M += 1) {
                        const S = E.box.z + M * E.height,
                            A = Nn(E.box.x, E.box.y, S, E.orientation.lengthMm, E.orientation.widthMm, E.height);
                        c.push({
                            productIndex: R.productIndex,
                            sku: R.sku,
                            orientation: E.orientation,
                            x: A.x,
                            y: A.y,
                            z: A.z,
                            containerIndex: _
                        }), h.placed.push({
                            box: A,
                            productIndex: R.productIndex,
                            weightG: R.weightG
                        }), h.usedWeightG += R.weightG
                    }
                    R.quantity -= b, w += b, T = !0;
                    const I = [];
                    for (const M of h.spaces) {
                        if (!vl(M, E.box)) {
                            I.push(M);
                            continue
                        }
                        const S = Sl(M, E.box);
                        for (const A of S) h.placed.some(G => G.box !== E.box && Ml(A, G.box)) || I.push(A)
                    }
                    h.spaces = I
                } else T = !1
            }
        }
        const d = l.filter(_ => _.quantity > 0).map(_ => ({
                sku: _.sku,
                productIndex: _.productIndex,
                remaining: _.quantity
            })),
            f = c.reduce((_, u) => _ + u.orientation.lengthMm * u.orientation.widthMm * u.orientation.heightMm, 0),
            p = c.reduce((_, u) => _ + (t.products[u.productIndex]?.weightG ?? 0), 0),
            m = new Set(c.map(_ => _.containerIndex)),
            gapStats = computeLooseGapStats(c, looseCargoMaxGapMm),
            x = [];
        d.length > 0 && x.push("存在未能装入的货物，请增加容器数量或放宽约束。");
        gapStats.oversizedGapCount > 0 && x.push(`检测到 ${gapStats.oversizedGapCount} 处纵向内部空隙超过 ${looseCargoMaxGapMm} mm（最大 ${Math.round(gapStats.maxInternalGapMm)} mm），请调整箱型组合或使用衬垫、充气袋、挡木固定。`);
        return {
            placements: c,
            unloaded: d,
            metrics: {
                loadedVolumeMm3: f,
                containerVolumeMm3: a,
                volumeRatio: a > 0 ? f / a : 0,
                loadedWeightG: p,
                containerPayloadG: o,
                weightRatio: o > 0 ? p / o : 0,
                containersUsed: m.size,
                maxInternalGapMm: gapStats.maxInternalGapMm,
                oversizedGapCount: gapStats.oversizedGapCount,
                looseCargoMaxGapMm
            },
            warnings: x,
            solverVersion: "cross-section-compact/0.4.0"
        }
    }
}

function computeLooseGapStats(i, t) {
    let e = 0;
    const n = new Set,
        s = new Map;
    for (const r of i) {
        const a = s.get(r.containerIndex) ?? [];
        a.push(r);
        s.set(r.containerIndex, a)
    }
    for (const r of s.values()) r.sort((a, o) => a.x - o.x);
    for (const r of i) {
        const a = r.x + r.orientation.lengthMm,
            o = s.get(r.containerIndex) ?? [];
        let c = Number.POSITIVE_INFINITY;
        for (const d of o) {
            if (d === r || d.x < a - Vt) continue;
            if (Number.isFinite(c) && d.x - a > c + Vt) break;
            const l = Math.min(r.y + r.orientation.widthMm, d.y + d.orientation.widthMm) - Math.max(r.y, d.y),
                h = Math.min(r.z + r.orientation.heightMm, d.z + d.orientation.heightMm) - Math.max(r.z, d.z);
            if (l <= Vt || h <= Vt) continue;
            c = Math.min(c, d.x - a)
        }
        if (Number.isFinite(c) && c > t + Vt) {
            n.add(`${r.containerIndex}:${Math.round(a)}:${Math.round(a+c)}`);
            e = Math.max(e, c)
        }
    }
    return { maxInternalGapMm: e, oversizedGapCount: n.size }
}

function Tl(i, t, e) {
    if (i.z <= Vt) return !0;
    const n = i.length * i.width;
    let s = 0;
    for (const r of t)
        if (Math.abs(r.box.z2 - i.z) <= Vt + 1) {
            const a = Math.max(0, Math.min(i.x2, r.box.x2) - Math.max(i.x, r.box.x)),
                o = Math.max(0, Math.min(i.y2, r.box.y2) - Math.max(i.y, r.box.y));
            s += a * o
        } return s / n >= e - Vt
}

function bl(i, t) {
    return new yl(t).solve(i)
}
const se = 1e-6;

function Al(i, t, e, n, s, r) {
    return {
        x: i,
        y: t,
        z: e,
        length: n,
        width: s,
        height: r,
        x2: i + n,
        y2: t + s,
        z2: e + r
    }
}

function wl(i) {
    const t = i?.stabilityLevel ?? "balanced";
    let e;
    return t === "strict" ? e = .8 : t === "relaxed" ? e = .4 : e = .6, {
        mode: i?.mode ?? "mixed-max",
        allowLooseCargo: i?.allowLooseCargo ?? !0,
        layerInterlock: i?.layerInterlock ?? !0,
        maxItemsPerPallet: i?.maxItemsPerPallet ?? 2e3,
        stabilityLevel: t,
        minSupportRatio: i?.minSupportRatio ?? e
    }
}
class Rl {
    options;
    constructor(t) {
        this.options = wl(t)
    }
    solve(t) {
        const e = [],
            n = new Map;
        t.products.forEach((_, u) => n.set(u, Po(t.products[u])));
        const s = new Map,
            r = [];
        t.products.forEach((_, u) => {
            if (_.quantity <= 0 || _.palletPolicy === "forbidden") return;
            const h = _.eligiblePalletTypeIds ?? t.palletTypes.map(T => T.id),
                w = t.palletTypes.findIndex(T => h.includes(T.id));
            w >= 0 ? (s.set(u, w), r.push(u)) : _.palletPolicy === "required" && e.push(`SKU ${_.sku} 必须打托但没有可用托盘，跳过。`)
        }), r.sort((_, u) => {
            const h = t.products[_],
                w = t.products[u];
            if (h.palletPolicy === "required" && w.palletPolicy !== "required") return -1;
            if (w.palletPolicy === "required" && h.palletPolicy !== "required") return 1;
            const T = h.lengthMm * h.widthMm * h.heightMm;
            return w.lengthMm * w.widthMm * w.heightMm - T || _ - u
        });
        const a = t.products.map((_, u) => ({
                productIndex: u,
                sku: _.sku,
                weightG: _.weightG,
                quantity: _.quantity
            })),
            o = [];
        let c = 0;
        const l = 1e5 + t.products.reduce((_, u) => _ + u.quantity, 0);
        for (; c < l;) {
            c += 1;
            let _ = -1,
                u = -1;
            for (const T of r)
                if (a[T].quantity > 0) {
                    _ = s.get(T), u = T;
                    break
                } if (_ < 0) break;
            const h = t.palletTypes[_],
                w = this.buildPalletUnit(t, a, _, h, n, e, this.options.mode === "single-sku" ? u : void 0);
            if (w.items.length === 0) {
                if (a.every(T => T.quantity <= 0 || t.products[T.productIndex].palletPolicy === "forbidden")) break;
                break
            }
            o.push(w);
            for (const T of w.items) {
                const E = a[T.productIndex];
                E && (E.quantity -= 1)
            }
        }
        const d = a.filter(_ => _.quantity > 0).map(_ => ({
                sku: _.sku,
                productIndex: _.productIndex,
                remaining: _.quantity
            })),
            f = o.reduce((_, u) => _ + u.items.reduce((h, w) => h + w.orientation.lengthMm * w.orientation.widthMm * w.orientation.heightMm, 0), 0),
            p = o.reduce((_, u) => _ + u.palletLengthMm * u.palletWidthMm * Math.max(0, u.totalHeightMm - u.palletHeightMm), 0),
            m = o.reduce((_, u) => _ + u.totalWeightG, 0),
            x = new Map;
        for (const _ of o) x.set(_.palletTypeId, (x.get(_.palletTypeId) ?? 0) + 1);
        return {
            pallets: o,
            unloaded: d,
            metrics: {
                palletsUsed: o.length,
                totalVolumeMm3: f,
                volumeRatio: p > 0 ? f / p : 0,
                totalWeightG: m,
                weightRatio: 0,
                palletsByType: [...x.entries()].map(([_, u]) => ({
                    palletTypeId: _,
                    used: u
                }))
            },
            warnings: e,
            solverVersion: "pallet-layer/0.1.0"
        }
    }
    buildPalletUnit(t, e, n, s, r, a, o) {
        const c = s.heightMm,
            l = s.maxLoadedHeightMm,
            d = s.maxLoadG,
            f = s.lengthMm,
            p = s.widthMm,
            m = f,
            x = p,
            _ = [],
            u = [],
            h = new Map,
            w = new Map;
        let T = 0,
            E = 0,
            P = 0,
            R = 0;
        const b = new Map,
            I = e.filter(O => O.quantity > 0).length,
            M = this.options.layerInterlock && I === 1;
        for (; E < this.options.maxItemsPerPallet;) {
            const O = [];
            for (let $ = 0; $ < e.length; $ += 1) {
                if (o !== void 0 && $ !== o) continue;
                const Z = e[$];
                if (Z.quantity <= 0) continue;
                const ut = r.get(Z.productIndex) ?? [];
                let dt = null,
                    wt = -1 / 0;
                for (const jt of ut)
                    if (jt.lengthMm <= m + se && jt.widthMm <= x + se) {
                        if (R + jt.heightMm > l - c + se || T + Z.weightG > d + se) continue;
                        const Dt = this.scoreOrientation(jt, m, x);
                        Dt > wt && (wt = Dt, dt = jt)
                    } dt && O.push({
                    pendingIndex: $,
                    orientation: dt,
                    weightG: Z.weightG,
                    score: wt
                })
            }
            if (O.length === 0) break;
            O.sort(($, Z) => {
                const ut = $.orientation.lengthMm * $.orientation.widthMm * $.orientation.heightMm;
                return Z.orientation.lengthMm * Z.orientation.widthMm * Z.orientation.heightMm - ut
            });
            let N = null;
            for (const $ of O) {
                const Z = e[$.pendingIndex].quantity - (b.get($.pendingIndex) ?? 0),
                    ut = this.dynamicGap($.orientation),
                    dt = Math.floor((m + se) / $.orientation.lengthMm) * Math.floor((x + ut + se) / ($.orientation.widthMm + ut));
                if (Z > 0 && (this.options.allowLooseCargo || Z >= dt)) {
                    N = $;
                    break
                }
            }
            if (!N) break;
            const q = this.dynamicGap(N.orientation),
                V = N.orientation.lengthMm * N.orientation.widthMm * N.orientation.heightMm,
                K = [];
            if (this.options.mode === "mixed-max" && this.options.allowLooseCargo)
                for (const $ of O) {
                    if ($ === N || $.orientation.lengthMm * $.orientation.widthMm * $.orientation.heightMm > V || Math.abs($.orientation.heightMm - N.orientation.heightMm) > 20) continue;
                    e[$.pendingIndex].quantity - (b.get($.pendingIndex) ?? 0) > 0 && K.push($)
                }
            K.sort(($, Z) => {
                const ut = e[$.pendingIndex].quantity - (b.get($.pendingIndex) ?? 0);
                return e[Z.pendingIndex].quantity - (b.get(Z.pendingIndex) ?? 0) - ut
            });
            const z = [N, ...K],
                st = N.orientation.heightMm,
                tt = N.orientation.widthMm;
            if (R + st > l - c + se) break;
            const ft = [],
                Ut = [...z];
            M && P % 2 === 1 && Ut.reverse();
            let $t = 0,
                Yt = 0,
                X = !0;
            for (; X && $t + se < x;) {
                X = !1;
                let $ = 0,
                    Z = !1;
                for (; !Z;) {
                    let ut = !1;
                    for (const dt of Ut) {
                        const wt = b.get(dt.pendingIndex) ?? 0,
                            jt = e[dt.pendingIndex].quantity;
                        if (wt >= jt) continue;
                        const Dt = Al($, $t, R, dt.orientation.lengthMm, dt.orientation.widthMm, dt.orientation.heightMm);
                        if ($ + Dt.length > m + se || $t + Dt.width > x + se || u.some(qt => Cl(qt, Dt))) continue;
                        if (T + dt.weightG > d + se) break;
                        if (R > 0 && this.calculateSupportRatio(Dt, u) < this.options.minSupportRatio - se) continue;
                        if (!(dt === N)) {
                            const qt = ft.filter(Gt => Gt.cand === N).length;
                            if (ft.filter(Gt => Gt.cand !== N).length >= qt * .25) continue
                        }
                        ft.push({
                            cand: dt,
                            box: Dt
                        }), b.set(dt.pendingIndex, wt + 1), u.push(Dt), T += dt.weightG, $ += Dt.length + 0, Yt += 1, ut = !0, X = !0, $ + se >= m && (Z = !0);
                        break
                    }
                    if (!ut || Z) {
                        ut || (Z = !0);
                        break
                    }
                }
                $t += tt + q
            }
            if (Yt === 0) break;
            for (const $ of ft) {
                const ut = e[$.cand.pendingIndex].sku;
                _.push({
                    productIndex: $.cand.pendingIndex,
                    sku: ut,
                    x: $.box.x,
                    y: $.box.y,
                    z: $.box.z,
                    orientation: $.cand.orientation,
                    layerIndex: P
                }), h.set(ut, (h.get(ut) ?? 0) + 1), w.has(ut) || w.set(ut, P), E += 1
            }
            R += st, P += 1
        }
        const S = [];
        for (let O = 0; O < P; O++) {
            const N = _.filter(tt => tt.layerIndex === O);
            if (N.length === 0) continue;
            const q = N.reduce((tt, ft) => tt + ft.orientation.lengthMm * ft.orientation.widthMm * ft.orientation.heightMm, 0),
                V = Math.max(...N.map(tt => tt.z + tt.orientation.heightMm)) - Math.min(...N.map(tt => tt.z)),
                K = m * x * V,
                z = new Map;
            for (const tt of N) z.set(tt.sku, (z.get(tt.sku) ?? 0) + 1);
            const st = [...z.entries()].reduce((tt, ft) => tt[1] > ft[1] ? tt : ft)[0];
            S.push({
                layerIndex: O,
                utilization: K > 0 ? q / K : 0,
                itemCount: N.length,
                mainSku: st
            })
        }
        const A = _.reduce((O, N) => O + N.orientation.lengthMm * N.orientation.widthMm * N.orientation.heightMm, 0),
            G = m * x * R;
        return {
            palletTypeIndex: n,
            palletTypeId: s.id,
            palletCode: s.code,
            palletLengthMm: s.lengthMm,
            palletWidthMm: s.widthMm,
            palletHeightMm: s.heightMm,
            skuSummary: [...h.entries()].map(([O, N]) => {
                const q = _.find(V => V.sku === O).productIndex;
                return {
                    sku: O,
                    productIndex: q,
                    quantity: N
                }
            }),
            items: _,
            totalHeightMm: c + R,
            totalWeightG: T + (s.emptyWeightG ?? 0),
            layerCount: P,
            utilization: G > 0 ? A / G : 0,
            layerUtilizations: S
        }
    }
    dynamicGap(t) {
        return Math.max(2, Math.min(5, Math.min(t.lengthMm, t.widthMm) * .01))
    }
    scoreOrientation(t, e, n) {
        let s = 0;
        t.lengthMm >= t.widthMm && (s += 100), s += (1e3 - t.heightMm) * .1;
        const r = e % t.lengthMm,
            a = n % t.widthMm;
        r < 10 && (s += 50), a < 10 && (s += 50);
        const o = Math.floor(e / t.lengthMm),
            c = Math.floor(n / t.widthMm);
        return s += o * c * .5, s
    }
    calculateSupportRatio(t, e) {
        const n = e.filter(a => Math.abs(a.z2 - t.z) < se);
        if (n.length === 0) return t.z <= se ? 1 : 0;
        const s = t.length * t.width;
        let r = 0;
        for (const a of n) {
            const o = Math.max(t.x, a.x),
                c = Math.min(t.x2, a.x2),
                l = Math.max(t.y, a.y),
                d = Math.min(t.y2, a.y2);
            if (c > o + se && d > l + se) {
                const f = (c - o) * (d - l);
                r += f
            }
        }
        return s > se ? Math.min(1, r / s) : 0
    }
}

function Cl(i, t) {
    return i.x < t.x2 - se && i.x2 > t.x + se && i.y < t.y2 - se && i.y2 > t.y + se && i.z < t.z2 - se && i.z2 > t.z + se
}

function Pl(i, t) {
    return new Rl(t).solve(i)
}
const re = 1e-6,
    ga = 50;

function bi(i, t, e, n, s, r) {
    return {
        x: i,
        y: t,
        z: e,
        x2: i + n,
        y2: t + s,
        z2: e + r,
        length: n,
        width: s,
        height: r
    }
}

function xa(i, t) {
    return i.x < t.x2 - re && i.x2 > t.x + re && i.y < t.y2 - re && i.y2 > t.y + re && i.z < t.z2 - re && i.z2 > t.z + re
}

function Dl(i, t) {
    return i.x >= t.x - re && i.x2 <= t.x2 + re && i.y >= t.y - re && i.y2 <= t.y2 + re && i.z >= t.z - re && i.z2 <= t.z2 + re
}

function Ll(i, t) {
    const e = [];
    if (t.x2 < i.x2 - re && e.push(bi(t.x2, i.y, i.z, i.x2 - t.x2, i.width, i.height)), t.y2 < i.y2 - re) {
        const n = i.x,
            s = Math.min(i.x2, t.x2);
        s - n > re && e.push(bi(n, t.y2, i.z, s - n, i.y2 - t.y2, i.height))
    }
    if (t.z2 < i.z2 - re) {
        const n = i.x,
            s = Math.min(i.x2, t.x2),
            r = i.y,
            a = Math.min(i.y2, t.y2);
        s - n > re && a - r > re && e.push(bi(n, r, t.z2, s - n, a - r, i.z2 - t.z2))
    }
    return e.filter(n => n.length > re && n.width > re && n.height > re)
}

function Il(i) {
    return {
        allowPalletRotation: i?.allowPalletRotation ?? !0,
        maxPalletsPerContainer: i?.maxPalletsPerContainer ?? 1e3
    }
}
class Ul {
    options;
    constructor(t) {
        this.options = Il(t)
    }
    solve(t, e) {
        if (t.length === 0) return {
            placements: [],
            unloaded: [],
            metrics: {
                loadedVolumeMm3: 0,
                containerVolumeMm3: 0,
                volumeRatio: 0,
                loadedWeightG: 0,
                containerPayloadG: 0,
                weightRatio: 0,
                containersUsed: 0
            },
            warnings: [],
            solverVersion: "pallet-loading/0.1.0"
        };
        if (e.containerTypes.length === 0) throw new Error("PlanInput 至少需要一种柜型。");
        const n = t.map((_, u) => ({
            unit: _,
            index: u
        }));
        n.sort((_, u) => {
            const h = _.unit.palletLengthMm * _.unit.palletWidthMm * _.unit.totalHeightMm;
            return u.unit.palletLengthMm * u.unit.palletWidthMm * u.unit.totalHeightMm - h
        });
        const s = [];
        let r = 0;
        for (const _ of e.containerTypes)
            for (let u = 0; u < _.quantity; u += 1) s.push({
                containerIndex: r,
                type: _
            }), r += 1;
        const a = s.reduce((_, u) => _ + u.type.innerLengthMm * u.type.innerWidthMm * u.type.innerHeightMm, 0),
            o = s.reduce((_, u) => _ + u.type.maxPayloadG, 0),
            c = [],
            l = n.map(_ => ({
                ..._
            })),
            d = [];
        for (const {
                containerIndex: _,
                type: u
            }
            of s) {
            if (l.every(E => E.unit === null)) break;
            const h = {
                spaces: [bi(0, 0, 0, u.innerLengthMm, u.innerWidthMm, u.innerHeightMm)],
                placed: [],
                usedWeightG: 0
            };
            let w = 0,
                T = !0;
            for (; T && w < this.options.maxPalletsPerContainer;) {
                T = !1;
                let E = null,
                    P = Number.NEGATIVE_INFINITY;
                for (const R of h.spaces)
                    for (let b = 0; b < l.length; b += 1) {
                        const I = l[b];
                        if (!I || I.unit === null) continue;
                        const M = I.unit,
                            S = M.totalWeightG;
                        if (h.usedWeightG + S > u.maxPayloadG) continue;
                        const A = [{
                            length: M.palletLengthMm,
                            width: M.palletWidthMm,
                            height: M.totalHeightMm,
                            rotated: !1
                        }];
                        this.options.allowPalletRotation && A.push({
                            length: M.palletWidthMm,
                            width: M.palletLengthMm,
                            height: M.totalHeightMm,
                            rotated: !0
                        });
                        for (const G of A) {
                            const O = G.length + ga,
                                N = G.width + ga,
                                q = G.height;
                            if (O > R.length + re || N > R.width + re || q > R.height + re) continue;
                            const V = bi(R.x, R.y, R.z, O, N, q);
                            let K = !1;
                            for (const st of h.placed)
                                if (xa(V, st.box)) {
                                    K = !0;
                                    break
                                } if (K) continue;
                            const z = G.length * G.width * G.height;
                            z > P && (P = z, E = {
                                space: R,
                                unit: M,
                                box: V,
                                pendingIndex: b,
                                rotated: G.rotated
                            })
                        }
                    }
                if (E !== null) {
                    const {
                        unit: R,
                        box: b,
                        pendingIndex: I,
                        rotated: M
                    } = E, S = b.x, A = b.y, G = b.z;
                    h.placed.push({
                        box: b,
                        unit: R,
                        globalX: S,
                        globalY: A,
                        globalZ: G
                    }), h.usedWeightG += R.totalWeightG;
                    for (const N of R.items) {
                        let q = N.x,
                            V = N.y,
                            K = N.z,
                            z = N.orientation;
                        if (M) {
                            const st = N.y,
                                tt = R.palletLengthMm - N.x - N.orientation.lengthMm;
                            q = st, V = tt, z = {
                                ...N.orientation,
                                lengthMm: N.orientation.widthMm,
                                widthMm: N.orientation.lengthMm
                            }
                        }
                        c.push({
                            productIndex: N.productIndex,
                            sku: N.sku,
                            orientation: z,
                            x: S + q,
                            y: A + V,
                            z: G + K + R.palletHeightMm,
                            containerIndex: _
                        })
                    }
                    l[I].unit = null, w += 1, T = !0;
                    const O = [];
                    for (const N of h.spaces) {
                        if (!xa(N, b)) {
                            O.push(N);
                            continue
                        }
                        const q = Ll(N, b);
                        for (const V of q) h.placed.some(K => K.box !== b && Dl(V, K.box)) || O.push(V)
                    }
                    h.spaces = O
                } else T = !1
            }
            w >= this.options.maxPalletsPerContainer && d.push(`容器 ${_} 达到最大托盘数保护（${this.options.maxPalletsPerContainer}）。`)
        }
        const f = [];
        for (const _ of l)
            if (_.unit !== null)
                for (const u of _.unit.skuSummary) {
                    const h = f.find(w => w.sku === u.sku);
                    h ? h.remaining += u.quantity : f.push({
                        sku: u.sku,
                        productIndex: u.productIndex,
                        remaining: u.quantity
                    })
                }
        const p = c.reduce((_, u) => _ + u.orientation.lengthMm * u.orientation.widthMm * u.orientation.heightMm, 0),
            m = c.reduce((_, u) => {
                const h = e.products[u.productIndex];
                return _ + (h?.weightG ?? 0)
            }, 0),
            x = new Set(c.map(_ => _.containerIndex));
        return f.length > 0 && d.push("存在未能装入的托盘货物，请增加容器数量。"), {
            placements: c,
            unloaded: f,
            metrics: {
                loadedVolumeMm3: p,
                containerVolumeMm3: a,
                volumeRatio: a > 0 ? p / a : 0,
                loadedWeightG: m,
                containerPayloadG: o,
                weightRatio: o > 0 ? m / o : 0,
                containersUsed: x.size
            },
            warnings: d,
            solverVersion: "pallet-loading/0.1.0"
        }
    }
}

function Nl(i, t, e) {
    return new Ul(e).solve(i, t)
}

function Jr(i, t, e) {
    return {
        ...e,
        dimensionsMm: t,
        originMm: {
            x: i.x,
            y: i.y,
            z: i.z
        },
        centerMm: {
            x: i.x + t.length / 2,
            y: i.y + t.width / 2,
            z: i.z + t.height / 2
        }
    }
}

function Fl(i, t, e) {
    const n = i.l !== i.w && i.l !== 0 ? `${i.l}×${i.w}×${i.h}` : "默认";
    return Jr(i, {
        length: i.l,
        width: i.w,
        height: i.h
    }, {
        id: `cargo-${i.ci}-${e}`,
        kind: "cargo",
        sku: t.sku,
        productIndex: i.pi,
        containerIndex: i.ci,
        orientation: n,
        color: t.color
    })
}

function Ol(i, t, e) {
    const {
        lengthMm: n,
        widthMm: s,
        heightMm: r,
        code: a
    } = i.orientation;
    return Jr(i, {
        length: n,
        width: s,
        height: r
    }, {
        id: `cargo-${i.containerIndex}-${e}`,
        kind: "cargo",
        sku: i.sku,
        productIndex: i.productIndex,
        containerIndex: i.containerIndex,
        loadSequence: e + 1,
        orientation: a,
        color: t
    })
}

function Bl(i, t) {
    return Jr(i, {
        length: i.l,
        width: i.w,
        height: i.h
    }, {
        id: `pallet-${i.ci}-${t}`,
        kind: "pallet",
        sku: `托盘 ${t+1}`,
        productIndex: -1,
        containerIndex: i.ci,
        orientation: "托盘",
        color: "#b78346"
    })
}

function zl(i) {
    return i.products.map((t, e) => ({
        id: `browser-product-${e}`,
        sku: t.sku,
        name: t.name,
        lengthMm: t.l,
        widthMm: t.w,
        heightMm: t.h,
        weightG: Math.round(t.kg * 1e3),
        quantity: t.q,
        allowHorizontalRotation: t.rotate,
        allowSideLoading: t.side,
        allowUpsideDown: !1,
        mustStayUpright: !0,
        stackable: !0,
        palletPolicy: i.mode === "pallet" ? "required" : "auto",
        priority: e
    }))
}

function Hl(i) {
    return {
        id: i.id,
        code: i.code,
        name: i.code,
        innerLengthMm: i.l,
        innerWidthMm: i.w,
        innerHeightMm: i.h,
        doorWidthMm: i.w,
        doorHeightMm: i.h,
        maxPayloadG: Math.round(i.kg * 1e3),
        quantity: i.quantity
    }
}

function kl(i) {
    return {
        id: "browser-pallet",
        code: "BROWSER",
        name: "页面输入托盘",
        lengthMm: i.l,
        widthMm: i.w,
        heightMm: 144,
        supplyMode: "unlimited",
        maxLoadG: 1e6,
        maxLoadedHeightMm: Math.max(1, i.maxH - 144),
        overhangMm: 0,
        allowHorizontalRotation: !0,
        allowDoubleStack: !1,
        minimumGapMm: Math.max(50, i.gap)
    }
}

function Gl(i) {
    return {
        id: "browser-plan",
        mode: i.mode,
        allocationStrategy: "LARGE_FIRST",
        products: zl(i),
        palletTypes: i.pallet ? [kl(i.pallet)] : [],
        containerTypes: [Hl(i.container)],
        minimumSupportRatio: 1,
        looseCargoMaxGapMm: Math.max(0, i.looseCargoMaxGapMm ?? 50)
    }
}

function Vl(i, t) {
    return i.placements.map((e, n) => Ol(e, t[e.productIndex] ?? "#8794a1", n))
}

function Wl(i, t) {
    const e = i.map(() => 0);
    for (const n of t.placements) e[n.productIndex] = (e[n.productIndex] ?? 0) + 1;
    return e
}

function va(i, t, e, n) {
    return {
        sceneItems: Vl(i, n),
        loadedByProduct: Wl(t, i),
        warnings: i.warnings,
        metrics: {
            volumeRatio: i.metrics.volumeRatio,
            weightRatio: i.metrics.weightRatio,
            containersUsed: i.metrics.containersUsed,
            maxInternalGapMm: i.metrics.maxInternalGapMm ?? 0,
            oversizedGapCount: i.metrics.oversizedGapCount ?? 0,
            looseCargoMaxGapMm: i.metrics.looseCargoMaxGapMm ?? 50
        },
        solverVersion: i.solverVersion,
        palletsUsed: e
    }
}

function Xl(i) {
    const t = Gl(i),
        e = i.products.map(r => r.color);
    if (i.mode === "loose") {
        const r = bl(t);
        return va(r, t.products, 0, e)
    }
    const n = Pl(t, {
            mode: i.pallet?.packingMode ?? "mixed-max",
            allowLooseCargo: i.pallet?.allowLooseCargo ?? !0
        }),
        s = Nl(n.pallets, t);
    return va(s, t.products, n.metrics.palletsUsed, e)
}
const Qr = "179",
    cn = {
        ROTATE: 0,
        DOLLY: 1,
        PAN: 2
    },
    si = {
        ROTATE: 0,
        PAN: 1,
        DOLLY_PAN: 2,
        DOLLY_ROTATE: 3
    },
    ql = 0,
    Ma = 1,
    Yl = 2,
    Do = 1,
    Lo = 2,
    on = 3,
    En = 0,
    we = 1,
    Ye = 2,
    Mn = 0,
    ai = 1,
    Sa = 2,
    Ea = 3,
    ya = 4,
    Kl = 5,
    In = 100,
    $l = 101,
    jl = 102,
    Zl = 103,
    Jl = 104,
    Ql = 200,
    tc = 201,
    ec = 202,
    nc = 203,
    lr = 204,
    cr = 205,
    ic = 206,
    sc = 207,
    rc = 208,
    ac = 209,
    oc = 210,
    lc = 211,
    cc = 212,
    hc = 213,
    uc = 214,
    hr = 0,
    ur = 1,
    dr = 2,
    ci = 3,
    fr = 4,
    pr = 5,
    mr = 6,
    _r = 7,
    Io = 0,
    dc = 1,
    fc = 2,
    Sn = 0,
    pc = 1,
    mc = 2,
    _c = 3,
    gc = 4,
    xc = 5,
    vc = 6,
    Mc = 7,
    Uo = 300,
    hi = 301,
    ui = 302,
    gr = 303,
    xr = 304,
    Es = 306,
    vr = 1e3,
    Fn = 1001,
    Mr = 1002,
    We = 1003,
    Sc = 1004,
    Oi = 1005,
    Ke = 1006,
    Rs = 1007,
    On = 1008,
    Je = 1009,
    No = 1010,
    Fo = 1011,
    wi = 1012,
    ta = 1013,
    Bn = 1014,
    ln = 1015,
    Di = 1016,
    ea = 1017,
    na = 1018,
    Ri = 1020,
    Oo = 35902,
    Bo = 1021,
    zo = 1022,
    Ve = 1023,
    Ci = 1026,
    Pi = 1027,
    Ho = 1028,
    ia = 1029,
    ko = 1030,
    sa = 1031,
    ra = 1033,
    hs = 33776,
    us = 33777,
    ds = 33778,
    fs = 33779,
    Sr = 35840,
    Er = 35841,
    yr = 35842,
    Tr = 35843,
    br = 36196,
    Ar = 37492,
    wr = 37496,
    Rr = 37808,
    Cr = 37809,
    Pr = 37810,
    Dr = 37811,
    Lr = 37812,
    Ir = 37813,
    Ur = 37814,
    Nr = 37815,
    Fr = 37816,
    Or = 37817,
    Br = 37818,
    zr = 37819,
    Hr = 37820,
    kr = 37821,
    ps = 36492,
    Gr = 36494,
    Vr = 36495,
    Go = 36283,
    Wr = 36284,
    Xr = 36285,
    qr = 36286,
    Ec = 3200,
    yc = 3201,
    Vo = 0,
    Tc = 1,
    vn = "",
    Ie = "srgb",
    di = "srgb-linear",
    gs = "linear",
    Jt = "srgb",
    Wn = 7680,
    Ta = 519,
    bc = 512,
    Ac = 513,
    wc = 514,
    Wo = 515,
    Rc = 516,
    Cc = 517,
    Pc = 518,
    Dc = 519,
    ba = 35044,
    Aa = "300 es",
    $e = 2e3,
    xs = 2001;
class Gn {
    addEventListener(t, e) {
        this._listeners === void 0 && (this._listeners = {});
        const n = this._listeners;
        n[t] === void 0 && (n[t] = []), n[t].indexOf(e) === -1 && n[t].push(e)
    }
    hasEventListener(t, e) {
        const n = this._listeners;
        return n === void 0 ? !1 : n[t] !== void 0 && n[t].indexOf(e) !== -1
    }
    removeEventListener(t, e) {
        const n = this._listeners;
        if (n === void 0) return;
        const s = n[t];
        if (s !== void 0) {
            const r = s.indexOf(e);
            r !== -1 && s.splice(r, 1)
        }
    }
    dispatchEvent(t) {
        const e = this._listeners;
        if (e === void 0) return;
        const n = e[t.type];
        if (n !== void 0) {
            t.target = this;
            const s = n.slice(0);
            for (let r = 0, a = s.length; r < a; r++) s[r].call(this, t);
            t.target = null
        }
    }
}
const ve = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"],
    Ai = Math.PI / 180,
    Yr = 180 / Math.PI;

function Li() {
    const i = Math.random() * 4294967295 | 0,
        t = Math.random() * 4294967295 | 0,
        e = Math.random() * 4294967295 | 0,
        n = Math.random() * 4294967295 | 0;
    return (ve[i & 255] + ve[i >> 8 & 255] + ve[i >> 16 & 255] + ve[i >> 24 & 255] + "-" + ve[t & 255] + ve[t >> 8 & 255] + "-" + ve[t >> 16 & 15 | 64] + ve[t >> 24 & 255] + "-" + ve[e & 63 | 128] + ve[e >> 8 & 255] + "-" + ve[e >> 16 & 255] + ve[e >> 24 & 255] + ve[n & 255] + ve[n >> 8 & 255] + ve[n >> 16 & 255] + ve[n >> 24 & 255]).toLowerCase()
}

function zt(i, t, e) {
    return Math.max(t, Math.min(e, i))
}

function Lc(i, t) {
    return (i % t + t) % t
}

function Cs(i, t, e) {
    return (1 - e) * i + e * t
}

function gi(i, t) {
    switch (t.constructor) {
        case Float32Array:
            return i;
        case Uint32Array:
            return i / 4294967295;
        case Uint16Array:
            return i / 65535;
        case Uint8Array:
            return i / 255;
        case Int32Array:
            return Math.max(i / 2147483647, -1);
        case Int16Array:
            return Math.max(i / 32767, -1);
        case Int8Array:
            return Math.max(i / 127, -1);
        default:
            throw new Error("Invalid component type.")
    }
}

function be(i, t) {
    switch (t.constructor) {
        case Float32Array:
            return i;
        case Uint32Array:
            return Math.round(i * 4294967295);
        case Uint16Array:
            return Math.round(i * 65535);
        case Uint8Array:
            return Math.round(i * 255);
        case Int32Array:
            return Math.round(i * 2147483647);
        case Int16Array:
            return Math.round(i * 32767);
        case Int8Array:
            return Math.round(i * 127);
        default:
            throw new Error("Invalid component type.")
    }
}
const Ic = {
    DEG2RAD: Ai
};
class Lt {
    constructor(t = 0, e = 0) {
        Lt.prototype.isVector2 = !0, this.x = t, this.y = e
    }
    get width() {
        return this.x
    }
    set width(t) {
        this.x = t
    }
    get height() {
        return this.y
    }
    set height(t) {
        this.y = t
    }
    set(t, e) {
        return this.x = t, this.y = e, this
    }
    setScalar(t) {
        return this.x = t, this.y = t, this
    }
    setX(t) {
        return this.x = t, this
    }
    setY(t) {
        return this.y = t, this
    }
    setComponent(t, e) {
        switch (t) {
            case 0:
                this.x = e;
                break;
            case 1:
                this.y = e;
                break;
            default:
                throw new Error("index is out of range: " + t)
        }
        return this
    }
    getComponent(t) {
        switch (t) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            default:
                throw new Error("index is out of range: " + t)
        }
    }
    clone() {
        return new this.constructor(this.x, this.y)
    }
    copy(t) {
        return this.x = t.x, this.y = t.y, this
    }
    add(t) {
        return this.x += t.x, this.y += t.y, this
    }
    addScalar(t) {
        return this.x += t, this.y += t, this
    }
    addVectors(t, e) {
        return this.x = t.x + e.x, this.y = t.y + e.y, this
    }
    addScaledVector(t, e) {
        return this.x += t.x * e, this.y += t.y * e, this
    }
    sub(t) {
        return this.x -= t.x, this.y -= t.y, this
    }
    subScalar(t) {
        return this.x -= t, this.y -= t, this
    }
    subVectors(t, e) {
        return this.x = t.x - e.x, this.y = t.y - e.y, this
    }
    multiply(t) {
        return this.x *= t.x, this.y *= t.y, this
    }
    multiplyScalar(t) {
        return this.x *= t, this.y *= t, this
    }
    divide(t) {
        return this.x /= t.x, this.y /= t.y, this
    }
    divideScalar(t) {
        return this.multiplyScalar(1 / t)
    }
    applyMatrix3(t) {
        const e = this.x,
            n = this.y,
            s = t.elements;
        return this.x = s[0] * e + s[3] * n + s[6], this.y = s[1] * e + s[4] * n + s[7], this
    }
    min(t) {
        return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this
    }
    max(t) {
        return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this
    }
    clamp(t, e) {
        return this.x = zt(this.x, t.x, e.x), this.y = zt(this.y, t.y, e.y), this
    }
    clampScalar(t, e) {
        return this.x = zt(this.x, t, e), this.y = zt(this.y, t, e), this
    }
    clampLength(t, e) {
        const n = this.length();
        return this.divideScalar(n || 1).multiplyScalar(zt(n, t, e))
    }
    floor() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this
    }
    ceil() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this
    }
    round() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this
    }
    roundToZero() {
        return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this
    }
    negate() {
        return this.x = -this.x, this.y = -this.y, this
    }
    dot(t) {
        return this.x * t.x + this.y * t.y
    }
    cross(t) {
        return this.x * t.y - this.y * t.x
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y)
    }
    normalize() {
        return this.divideScalar(this.length() || 1)
    }
    angle() {
        return Math.atan2(-this.y, -this.x) + Math.PI
    }
    angleTo(t) {
        const e = Math.sqrt(this.lengthSq() * t.lengthSq());
        if (e === 0) return Math.PI / 2;
        const n = this.dot(t) / e;
        return Math.acos(zt(n, -1, 1))
    }
    distanceTo(t) {
        return Math.sqrt(this.distanceToSquared(t))
    }
    distanceToSquared(t) {
        const e = this.x - t.x,
            n = this.y - t.y;
        return e * e + n * n
    }
    manhattanDistanceTo(t) {
        return Math.abs(this.x - t.x) + Math.abs(this.y - t.y)
    }
    setLength(t) {
        return this.normalize().multiplyScalar(t)
    }
    lerp(t, e) {
        return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this
    }
    lerpVectors(t, e, n) {
        return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this
    }
    equals(t) {
        return t.x === this.x && t.y === this.y
    }
    fromArray(t, e = 0) {
        return this.x = t[e], this.y = t[e + 1], this
    }
    toArray(t = [], e = 0) {
        return t[e] = this.x, t[e + 1] = this.y, t
    }
    fromBufferAttribute(t, e) {
        return this.x = t.getX(e), this.y = t.getY(e), this
    }
    rotateAround(t, e) {
        const n = Math.cos(e),
            s = Math.sin(e),
            r = this.x - t.x,
            a = this.y - t.y;
        return this.x = r * n - a * s + t.x, this.y = r * s + a * n + t.y, this
    }
    random() {
        return this.x = Math.random(), this.y = Math.random(), this
    }*[Symbol.iterator]() {
        yield this.x, yield this.y
    }
}
class zn {
    constructor(t = 0, e = 0, n = 0, s = 1) {
        this.isQuaternion = !0, this._x = t, this._y = e, this._z = n, this._w = s
    }
    static slerpFlat(t, e, n, s, r, a, o) {
        let c = n[s + 0],
            l = n[s + 1],
            d = n[s + 2],
            f = n[s + 3];
        const p = r[a + 0],
            m = r[a + 1],
            x = r[a + 2],
            _ = r[a + 3];
        if (o === 0) {
            t[e + 0] = c, t[e + 1] = l, t[e + 2] = d, t[e + 3] = f;
            return
        }
        if (o === 1) {
            t[e + 0] = p, t[e + 1] = m, t[e + 2] = x, t[e + 3] = _;
            return
        }
        if (f !== _ || c !== p || l !== m || d !== x) {
            let u = 1 - o;
            const h = c * p + l * m + d * x + f * _,
                w = h >= 0 ? 1 : -1,
                T = 1 - h * h;
            if (T > Number.EPSILON) {
                const P = Math.sqrt(T),
                    R = Math.atan2(P, h * w);
                u = Math.sin(u * R) / P, o = Math.sin(o * R) / P
            }
            const E = o * w;
            if (c = c * u + p * E, l = l * u + m * E, d = d * u + x * E, f = f * u + _ * E, u === 1 - o) {
                const P = 1 / Math.sqrt(c * c + l * l + d * d + f * f);
                c *= P, l *= P, d *= P, f *= P
            }
        }
        t[e] = c, t[e + 1] = l, t[e + 2] = d, t[e + 3] = f
    }
    static multiplyQuaternionsFlat(t, e, n, s, r, a) {
        const o = n[s],
            c = n[s + 1],
            l = n[s + 2],
            d = n[s + 3],
            f = r[a],
            p = r[a + 1],
            m = r[a + 2],
            x = r[a + 3];
        return t[e] = o * x + d * f + c * m - l * p, t[e + 1] = c * x + d * p + l * f - o * m, t[e + 2] = l * x + d * m + o * p - c * f, t[e + 3] = d * x - o * f - c * p - l * m, t
    }
    get x() {
        return this._x
    }
    set x(t) {
        this._x = t, this._onChangeCallback()
    }
    get y() {
        return this._y
    }
    set y(t) {
        this._y = t, this._onChangeCallback()
    }
    get z() {
        return this._z
    }
    set z(t) {
        this._z = t, this._onChangeCallback()
    }
    get w() {
        return this._w
    }
    set w(t) {
        this._w = t, this._onChangeCallback()
    }
    set(t, e, n, s) {
        return this._x = t, this._y = e, this._z = n, this._w = s, this._onChangeCallback(), this
    }
    clone() {
        return new this.constructor(this._x, this._y, this._z, this._w)
    }
    copy(t) {
        return this._x = t.x, this._y = t.y, this._z = t.z, this._w = t.w, this._onChangeCallback(), this
    }
    setFromEuler(t, e = !0) {
        const n = t._x,
            s = t._y,
            r = t._z,
            a = t._order,
            o = Math.cos,
            c = Math.sin,
            l = o(n / 2),
            d = o(s / 2),
            f = o(r / 2),
            p = c(n / 2),
            m = c(s / 2),
            x = c(r / 2);
        switch (a) {
            case "XYZ":
                this._x = p * d * f + l * m * x, this._y = l * m * f - p * d * x, this._z = l * d * x + p * m * f, this._w = l * d * f - p * m * x;
                break;
            case "YXZ":
                this._x = p * d * f + l * m * x, this._y = l * m * f - p * d * x, this._z = l * d * x - p * m * f, this._w = l * d * f + p * m * x;
                break;
            case "ZXY":
                this._x = p * d * f - l * m * x, this._y = l * m * f + p * d * x, this._z = l * d * x + p * m * f, this._w = l * d * f - p * m * x;
                break;
            case "ZYX":
                this._x = p * d * f - l * m * x, this._y = l * m * f + p * d * x, this._z = l * d * x - p * m * f, this._w = l * d * f + p * m * x;
                break;
            case "YZX":
                this._x = p * d * f + l * m * x, this._y = l * m * f + p * d * x, this._z = l * d * x - p * m * f, this._w = l * d * f - p * m * x;
                break;
            case "XZY":
                this._x = p * d * f - l * m * x, this._y = l * m * f - p * d * x, this._z = l * d * x + p * m * f, this._w = l * d * f + p * m * x;
                break;
            default:
                console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + a)
        }
        return e === !0 && this._onChangeCallback(), this
    }
    setFromAxisAngle(t, e) {
        const n = e / 2,
            s = Math.sin(n);
        return this._x = t.x * s, this._y = t.y * s, this._z = t.z * s, this._w = Math.cos(n), this._onChangeCallback(), this
    }
    setFromRotationMatrix(t) {
        const e = t.elements,
            n = e[0],
            s = e[4],
            r = e[8],
            a = e[1],
            o = e[5],
            c = e[9],
            l = e[2],
            d = e[6],
            f = e[10],
            p = n + o + f;
        if (p > 0) {
            const m = .5 / Math.sqrt(p + 1);
            this._w = .25 / m, this._x = (d - c) * m, this._y = (r - l) * m, this._z = (a - s) * m
        } else if (n > o && n > f) {
            const m = 2 * Math.sqrt(1 + n - o - f);
            this._w = (d - c) / m, this._x = .25 * m, this._y = (s + a) / m, this._z = (r + l) / m
        } else if (o > f) {
            const m = 2 * Math.sqrt(1 + o - n - f);
            this._w = (r - l) / m, this._x = (s + a) / m, this._y = .25 * m, this._z = (c + d) / m
        } else {
            const m = 2 * Math.sqrt(1 + f - n - o);
            this._w = (a - s) / m, this._x = (r + l) / m, this._y = (c + d) / m, this._z = .25 * m
        }
        return this._onChangeCallback(), this
    }
    setFromUnitVectors(t, e) {
        let n = t.dot(e) + 1;
        return n < 1e-8 ? (n = 0, Math.abs(t.x) > Math.abs(t.z) ? (this._x = -t.y, this._y = t.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -t.z, this._z = t.y, this._w = n)) : (this._x = t.y * e.z - t.z * e.y, this._y = t.z * e.x - t.x * e.z, this._z = t.x * e.y - t.y * e.x, this._w = n), this.normalize()
    }
    angleTo(t) {
        return 2 * Math.acos(Math.abs(zt(this.dot(t), -1, 1)))
    }
    rotateTowards(t, e) {
        const n = this.angleTo(t);
        if (n === 0) return this;
        const s = Math.min(1, e / n);
        return this.slerp(t, s), this
    }
    identity() {
        return this.set(0, 0, 0, 1)
    }
    invert() {
        return this.conjugate()
    }
    conjugate() {
        return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this
    }
    dot(t) {
        return this._x * t._x + this._y * t._y + this._z * t._z + this._w * t._w
    }
    lengthSq() {
        return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w
    }
    length() {
        return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w)
    }
    normalize() {
        let t = this.length();
        return t === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (t = 1 / t, this._x = this._x * t, this._y = this._y * t, this._z = this._z * t, this._w = this._w * t), this._onChangeCallback(), this
    }
    multiply(t) {
        return this.multiplyQuaternions(this, t)
    }
    premultiply(t) {
        return this.multiplyQuaternions(t, this)
    }
    multiplyQuaternions(t, e) {
        const n = t._x,
            s = t._y,
            r = t._z,
            a = t._w,
            o = e._x,
            c = e._y,
            l = e._z,
            d = e._w;
        return this._x = n * d + a * o + s * l - r * c, this._y = s * d + a * c + r * o - n * l, this._z = r * d + a * l + n * c - s * o, this._w = a * d - n * o - s * c - r * l, this._onChangeCallback(), this
    }
    slerp(t, e) {
        if (e === 0) return this;
        if (e === 1) return this.copy(t);
        const n = this._x,
            s = this._y,
            r = this._z,
            a = this._w;
        let o = a * t._w + n * t._x + s * t._y + r * t._z;
        if (o < 0 ? (this._w = -t._w, this._x = -t._x, this._y = -t._y, this._z = -t._z, o = -o) : this.copy(t), o >= 1) return this._w = a, this._x = n, this._y = s, this._z = r, this;
        const c = 1 - o * o;
        if (c <= Number.EPSILON) {
            const m = 1 - e;
            return this._w = m * a + e * this._w, this._x = m * n + e * this._x, this._y = m * s + e * this._y, this._z = m * r + e * this._z, this.normalize(), this
        }
        const l = Math.sqrt(c),
            d = Math.atan2(l, o),
            f = Math.sin((1 - e) * d) / l,
            p = Math.sin(e * d) / l;
        return this._w = a * f + this._w * p, this._x = n * f + this._x * p, this._y = s * f + this._y * p, this._z = r * f + this._z * p, this._onChangeCallback(), this
    }
    slerpQuaternions(t, e, n) {
        return this.copy(t).slerp(e, n)
    }
    random() {
        const t = 2 * Math.PI * Math.random(),
            e = 2 * Math.PI * Math.random(),
            n = Math.random(),
            s = Math.sqrt(1 - n),
            r = Math.sqrt(n);
        return this.set(s * Math.sin(t), s * Math.cos(t), r * Math.sin(e), r * Math.cos(e))
    }
    equals(t) {
        return t._x === this._x && t._y === this._y && t._z === this._z && t._w === this._w
    }
    fromArray(t, e = 0) {
        return this._x = t[e], this._y = t[e + 1], this._z = t[e + 2], this._w = t[e + 3], this._onChangeCallback(), this
    }
    toArray(t = [], e = 0) {
        return t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._w, t
    }
    fromBufferAttribute(t, e) {
        return this._x = t.getX(e), this._y = t.getY(e), this._z = t.getZ(e), this._w = t.getW(e), this._onChangeCallback(), this
    }
    toJSON() {
        return this.toArray()
    }
    _onChange(t) {
        return this._onChangeCallback = t, this
    }
    _onChangeCallback() {}*[Symbol.iterator]() {
        yield this._x, yield this._y, yield this._z, yield this._w
    }
}
class F {
    constructor(t = 0, e = 0, n = 0) {
        F.prototype.isVector3 = !0, this.x = t, this.y = e, this.z = n
    }
    set(t, e, n) {
        return n === void 0 && (n = this.z), this.x = t, this.y = e, this.z = n, this
    }
    setScalar(t) {
        return this.x = t, this.y = t, this.z = t, this
    }
    setX(t) {
        return this.x = t, this
    }
    setY(t) {
        return this.y = t, this
    }
    setZ(t) {
        return this.z = t, this
    }
    setComponent(t, e) {
        switch (t) {
            case 0:
                this.x = e;
                break;
            case 1:
                this.y = e;
                break;
            case 2:
                this.z = e;
                break;
            default:
                throw new Error("index is out of range: " + t)
        }
        return this
    }
    getComponent(t) {
        switch (t) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            case 2:
                return this.z;
            default:
                throw new Error("index is out of range: " + t)
        }
    }
    clone() {
        return new this.constructor(this.x, this.y, this.z)
    }
    copy(t) {
        return this.x = t.x, this.y = t.y, this.z = t.z, this
    }
    add(t) {
        return this.x += t.x, this.y += t.y, this.z += t.z, this
    }
    addScalar(t) {
        return this.x += t, this.y += t, this.z += t, this
    }
    addVectors(t, e) {
        return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this
    }
    addScaledVector(t, e) {
        return this.x += t.x * e, this.y += t.y * e, this.z += t.z * e, this
    }
    sub(t) {
        return this.x -= t.x, this.y -= t.y, this.z -= t.z, this
    }
    subScalar(t) {
        return this.x -= t, this.y -= t, this.z -= t, this
    }
    subVectors(t, e) {
        return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this
    }
    multiply(t) {
        return this.x *= t.x, this.y *= t.y, this.z *= t.z, this
    }
    multiplyScalar(t) {
        return this.x *= t, this.y *= t, this.z *= t, this
    }
    multiplyVectors(t, e) {
        return this.x = t.x * e.x, this.y = t.y * e.y, this.z = t.z * e.z, this
    }
    applyEuler(t) {
        return this.applyQuaternion(wa.setFromEuler(t))
    }
    applyAxisAngle(t, e) {
        return this.applyQuaternion(wa.setFromAxisAngle(t, e))
    }
    applyMatrix3(t) {
        const e = this.x,
            n = this.y,
            s = this.z,
            r = t.elements;
        return this.x = r[0] * e + r[3] * n + r[6] * s, this.y = r[1] * e + r[4] * n + r[7] * s, this.z = r[2] * e + r[5] * n + r[8] * s, this
    }
    applyNormalMatrix(t) {
        return this.applyMatrix3(t).normalize()
    }
    applyMatrix4(t) {
        const e = this.x,
            n = this.y,
            s = this.z,
            r = t.elements,
            a = 1 / (r[3] * e + r[7] * n + r[11] * s + r[15]);
        return this.x = (r[0] * e + r[4] * n + r[8] * s + r[12]) * a, this.y = (r[1] * e + r[5] * n + r[9] * s + r[13]) * a, this.z = (r[2] * e + r[6] * n + r[10] * s + r[14]) * a, this
    }
    applyQuaternion(t) {
        const e = this.x,
            n = this.y,
            s = this.z,
            r = t.x,
            a = t.y,
            o = t.z,
            c = t.w,
            l = 2 * (a * s - o * n),
            d = 2 * (o * e - r * s),
            f = 2 * (r * n - a * e);
        return this.x = e + c * l + a * f - o * d, this.y = n + c * d + o * l - r * f, this.z = s + c * f + r * d - a * l, this
    }
    project(t) {
        return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)
    }
    unproject(t) {
        return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)
    }
    transformDirection(t) {
        const e = this.x,
            n = this.y,
            s = this.z,
            r = t.elements;
        return this.x = r[0] * e + r[4] * n + r[8] * s, this.y = r[1] * e + r[5] * n + r[9] * s, this.z = r[2] * e + r[6] * n + r[10] * s, this.normalize()
    }
    divide(t) {
        return this.x /= t.x, this.y /= t.y, this.z /= t.z, this
    }
    divideScalar(t) {
        return this.multiplyScalar(1 / t)
    }
    min(t) {
        return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this
    }
    max(t) {
        return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this
    }
    clamp(t, e) {
        return this.x = zt(this.x, t.x, e.x), this.y = zt(this.y, t.y, e.y), this.z = zt(this.z, t.z, e.z), this
    }
    clampScalar(t, e) {
        return this.x = zt(this.x, t, e), this.y = zt(this.y, t, e), this.z = zt(this.z, t, e), this
    }
    clampLength(t, e) {
        const n = this.length();
        return this.divideScalar(n || 1).multiplyScalar(zt(n, t, e))
    }
    floor() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this
    }
    ceil() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this
    }
    round() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this
    }
    roundToZero() {
        return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this
    }
    negate() {
        return this.x = -this.x, this.y = -this.y, this.z = -this.z, this
    }
    dot(t) {
        return this.x * t.x + this.y * t.y + this.z * t.z
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z)
    }
    normalize() {
        return this.divideScalar(this.length() || 1)
    }
    setLength(t) {
        return this.normalize().multiplyScalar(t)
    }
    lerp(t, e) {
        return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this
    }
    lerpVectors(t, e, n) {
        return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this.z = t.z + (e.z - t.z) * n, this
    }
    cross(t) {
        return this.crossVectors(this, t)
    }
    crossVectors(t, e) {
        const n = t.x,
            s = t.y,
            r = t.z,
            a = e.x,
            o = e.y,
            c = e.z;
        return this.x = s * c - r * o, this.y = r * a - n * c, this.z = n * o - s * a, this
    }
    projectOnVector(t) {
        const e = t.lengthSq();
        if (e === 0) return this.set(0, 0, 0);
        const n = t.dot(this) / e;
        return this.copy(t).multiplyScalar(n)
    }
    projectOnPlane(t) {
        return Ps.copy(this).projectOnVector(t), this.sub(Ps)
    }
    reflect(t) {
        return this.sub(Ps.copy(t).multiplyScalar(2 * this.dot(t)))
    }
    angleTo(t) {
        const e = Math.sqrt(this.lengthSq() * t.lengthSq());
        if (e === 0) return Math.PI / 2;
        const n = this.dot(t) / e;
        return Math.acos(zt(n, -1, 1))
    }
    distanceTo(t) {
        return Math.sqrt(this.distanceToSquared(t))
    }
    distanceToSquared(t) {
        const e = this.x - t.x,
            n = this.y - t.y,
            s = this.z - t.z;
        return e * e + n * n + s * s
    }
    manhattanDistanceTo(t) {
        return Math.abs(this.x - t.x) + Math.abs(this.y - t.y) + Math.abs(this.z - t.z)
    }
    setFromSpherical(t) {
        return this.setFromSphericalCoords(t.radius, t.phi, t.theta)
    }
    setFromSphericalCoords(t, e, n) {
        const s = Math.sin(e) * t;
        return this.x = s * Math.sin(n), this.y = Math.cos(e) * t, this.z = s * Math.cos(n), this
    }
    setFromCylindrical(t) {
        return this.setFromCylindricalCoords(t.radius, t.theta, t.y)
    }
    setFromCylindricalCoords(t, e, n) {
        return this.x = t * Math.sin(e), this.y = n, this.z = t * Math.cos(e), this
    }
    setFromMatrixPosition(t) {
        const e = t.elements;
        return this.x = e[12], this.y = e[13], this.z = e[14], this
    }
    setFromMatrixScale(t) {
        const e = this.setFromMatrixColumn(t, 0).length(),
            n = this.setFromMatrixColumn(t, 1).length(),
            s = this.setFromMatrixColumn(t, 2).length();
        return this.x = e, this.y = n, this.z = s, this
    }
    setFromMatrixColumn(t, e) {
        return this.fromArray(t.elements, e * 4)
    }
    setFromMatrix3Column(t, e) {
        return this.fromArray(t.elements, e * 3)
    }
    setFromEuler(t) {
        return this.x = t._x, this.y = t._y, this.z = t._z, this
    }
    setFromColor(t) {
        return this.x = t.r, this.y = t.g, this.z = t.b, this
    }
    equals(t) {
        return t.x === this.x && t.y === this.y && t.z === this.z
    }
    fromArray(t, e = 0) {
        return this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this
    }
    toArray(t = [], e = 0) {
        return t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t
    }
    fromBufferAttribute(t, e) {
        return this.x = t.getX(e), this.y = t.getY(e), this.z = t.getZ(e), this
    }
    random() {
        return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this
    }
    randomDirection() {
        const t = Math.random() * Math.PI * 2,
            e = Math.random() * 2 - 1,
            n = Math.sqrt(1 - e * e);
        return this.x = n * Math.cos(t), this.y = e, this.z = n * Math.sin(t), this
    }*[Symbol.iterator]() {
        yield this.x, yield this.y, yield this.z
    }
}
const Ps = new F,
    wa = new zn;
class Ft {
    constructor(t, e, n, s, r, a, o, c, l) {
        Ft.prototype.isMatrix3 = !0, this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1], t !== void 0 && this.set(t, e, n, s, r, a, o, c, l)
    }
    set(t, e, n, s, r, a, o, c, l) {
        const d = this.elements;
        return d[0] = t, d[1] = s, d[2] = o, d[3] = e, d[4] = r, d[5] = c, d[6] = n, d[7] = a, d[8] = l, this
    }
    identity() {
        return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this
    }
    copy(t) {
        const e = this.elements,
            n = t.elements;
        return e[0] = n[0], e[1] = n[1], e[2] = n[2], e[3] = n[3], e[4] = n[4], e[5] = n[5], e[6] = n[6], e[7] = n[7], e[8] = n[8], this
    }
    extractBasis(t, e, n) {
        return t.setFromMatrix3Column(this, 0), e.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this
    }
    setFromMatrix4(t) {
        const e = t.elements;
        return this.set(e[0], e[4], e[8], e[1], e[5], e[9], e[2], e[6], e[10]), this
    }
    multiply(t) {
        return this.multiplyMatrices(this, t)
    }
    premultiply(t) {
        return this.multiplyMatrices(t, this)
    }
    multiplyMatrices(t, e) {
        const n = t.elements,
            s = e.elements,
            r = this.elements,
            a = n[0],
            o = n[3],
            c = n[6],
            l = n[1],
            d = n[4],
            f = n[7],
            p = n[2],
            m = n[5],
            x = n[8],
            _ = s[0],
            u = s[3],
            h = s[6],
            w = s[1],
            T = s[4],
            E = s[7],
            P = s[2],
            R = s[5],
            b = s[8];
        return r[0] = a * _ + o * w + c * P, r[3] = a * u + o * T + c * R, r[6] = a * h + o * E + c * b, r[1] = l * _ + d * w + f * P, r[4] = l * u + d * T + f * R, r[7] = l * h + d * E + f * b, r[2] = p * _ + m * w + x * P, r[5] = p * u + m * T + x * R, r[8] = p * h + m * E + x * b, this
    }
    multiplyScalar(t) {
        const e = this.elements;
        return e[0] *= t, e[3] *= t, e[6] *= t, e[1] *= t, e[4] *= t, e[7] *= t, e[2] *= t, e[5] *= t, e[8] *= t, this
    }
    determinant() {
        const t = this.elements,
            e = t[0],
            n = t[1],
            s = t[2],
            r = t[3],
            a = t[4],
            o = t[5],
            c = t[6],
            l = t[7],
            d = t[8];
        return e * a * d - e * o * l - n * r * d + n * o * c + s * r * l - s * a * c
    }
    invert() {
        const t = this.elements,
            e = t[0],
            n = t[1],
            s = t[2],
            r = t[3],
            a = t[4],
            o = t[5],
            c = t[6],
            l = t[7],
            d = t[8],
            f = d * a - o * l,
            p = o * c - d * r,
            m = l * r - a * c,
            x = e * f + n * p + s * m;
        if (x === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
        const _ = 1 / x;
        return t[0] = f * _, t[1] = (s * l - d * n) * _, t[2] = (o * n - s * a) * _, t[3] = p * _, t[4] = (d * e - s * c) * _, t[5] = (s * r - o * e) * _, t[6] = m * _, t[7] = (n * c - l * e) * _, t[8] = (a * e - n * r) * _, this
    }
    transpose() {
        let t;
        const e = this.elements;
        return t = e[1], e[1] = e[3], e[3] = t, t = e[2], e[2] = e[6], e[6] = t, t = e[5], e[5] = e[7], e[7] = t, this
    }
    getNormalMatrix(t) {
        return this.setFromMatrix4(t).invert().transpose()
    }
    transposeIntoArray(t) {
        const e = this.elements;
        return t[0] = e[0], t[1] = e[3], t[2] = e[6], t[3] = e[1], t[4] = e[4], t[5] = e[7], t[6] = e[2], t[7] = e[5], t[8] = e[8], this
    }
    setUvTransform(t, e, n, s, r, a, o) {
        const c = Math.cos(r),
            l = Math.sin(r);
        return this.set(n * c, n * l, -n * (c * a + l * o) + a + t, -s * l, s * c, -s * (-l * a + c * o) + o + e, 0, 0, 1), this
    }
    scale(t, e) {
        return this.premultiply(Ds.makeScale(t, e)), this
    }
    rotate(t) {
        return this.premultiply(Ds.makeRotation(-t)), this
    }
    translate(t, e) {
        return this.premultiply(Ds.makeTranslation(t, e)), this
    }
    makeTranslation(t, e) {
        return t.isVector2 ? this.set(1, 0, t.x, 0, 1, t.y, 0, 0, 1) : this.set(1, 0, t, 0, 1, e, 0, 0, 1), this
    }
    makeRotation(t) {
        const e = Math.cos(t),
            n = Math.sin(t);
        return this.set(e, -n, 0, n, e, 0, 0, 0, 1), this
    }
    makeScale(t, e) {
        return this.set(t, 0, 0, 0, e, 0, 0, 0, 1), this
    }
    equals(t) {
        const e = this.elements,
            n = t.elements;
        for (let s = 0; s < 9; s++)
            if (e[s] !== n[s]) return !1;
        return !0
    }
    fromArray(t, e = 0) {
        for (let n = 0; n < 9; n++) this.elements[n] = t[n + e];
        return this
    }
    toArray(t = [], e = 0) {
        const n = this.elements;
        return t[e] = n[0], t[e + 1] = n[1], t[e + 2] = n[2], t[e + 3] = n[3], t[e + 4] = n[4], t[e + 5] = n[5], t[e + 6] = n[6], t[e + 7] = n[7], t[e + 8] = n[8], t
    }
    clone() {
        return new this.constructor().fromArray(this.elements)
    }
}
const Ds = new Ft;

function Xo(i) {
    for (let t = i.length - 1; t >= 0; --t)
        if (i[t] >= 65535) return !0;
    return !1
}

function vs(i) {
    return document.createElementNS("http://www.w3.org/1999/xhtml", i)
}

function Uc() {
    const i = vs("canvas");
    return i.style.display = "block", i
}
const Ra = {};

function oi(i) {
    i in Ra || (Ra[i] = !0, console.warn(i))
}

function Nc(i, t, e) {
    return new Promise(function(n, s) {
        function r() {
            switch (i.clientWaitSync(t, i.SYNC_FLUSH_COMMANDS_BIT, 0)) {
                case i.WAIT_FAILED:
                    s();
                    break;
                case i.TIMEOUT_EXPIRED:
                    setTimeout(r, e);
                    break;
                default:
                    n()
            }
        }
        setTimeout(r, e)
    })
}
const Ca = new Ft().set(.4123908, .3575843, .1804808, .212639, .7151687, .0721923, .0193308, .1191948, .9505322),
    Pa = new Ft().set(3.2409699, -1.5373832, -.4986108, -.9692436, 1.8759675, .0415551, .0556301, -.203977, 1.0569715);

function Fc() {
    const i = {
            enabled: !0,
            workingColorSpace: di,
            spaces: {},
            convert: function(s, r, a) {
                return this.enabled === !1 || r === a || !r || !a || (this.spaces[r].transfer === Jt && (s.r = hn(s.r), s.g = hn(s.g), s.b = hn(s.b)), this.spaces[r].primaries !== this.spaces[a].primaries && (s.applyMatrix3(this.spaces[r].toXYZ), s.applyMatrix3(this.spaces[a].fromXYZ)), this.spaces[a].transfer === Jt && (s.r = li(s.r), s.g = li(s.g), s.b = li(s.b))), s
            },
            workingToColorSpace: function(s, r) {
                return this.convert(s, this.workingColorSpace, r)
            },
            colorSpaceToWorking: function(s, r) {
                return this.convert(s, r, this.workingColorSpace)
            },
            getPrimaries: function(s) {
                return this.spaces[s].primaries
            },
            getTransfer: function(s) {
                return s === vn ? gs : this.spaces[s].transfer
            },
            getLuminanceCoefficients: function(s, r = this.workingColorSpace) {
                return s.fromArray(this.spaces[r].luminanceCoefficients)
            },
            define: function(s) {
                Object.assign(this.spaces, s)
            },
            _getMatrix: function(s, r, a) {
                return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)
            },
            _getDrawingBufferColorSpace: function(s) {
                return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace
            },
            _getUnpackColorSpace: function(s = this.workingColorSpace) {
                return this.spaces[s].workingColorSpaceConfig.unpackColorSpace
            },
            fromWorkingColorSpace: function(s, r) {
                return oi("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."), i.workingToColorSpace(s, r)
            },
            toWorkingColorSpace: function(s, r) {
                return oi("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."), i.colorSpaceToWorking(s, r)
            }
        },
        t = [.64, .33, .3, .6, .15, .06],
        e = [.2126, .7152, .0722],
        n = [.3127, .329];
    return i.define({
        [di]: {
            primaries: t,
            whitePoint: n,
            transfer: gs,
            toXYZ: Ca,
            fromXYZ: Pa,
            luminanceCoefficients: e,
            workingColorSpaceConfig: {
                unpackColorSpace: Ie
            },
            outputColorSpaceConfig: {
                drawingBufferColorSpace: Ie
            }
        },
        [Ie]: {
            primaries: t,
            whitePoint: n,
            transfer: Jt,
            toXYZ: Ca,
            fromXYZ: Pa,
            luminanceCoefficients: e,
            outputColorSpaceConfig: {
                drawingBufferColorSpace: Ie
            }
        }
    }), i
}
const Xt = Fc();

function hn(i) {
    return i < .04045 ? i * .0773993808 : Math.pow(i * .9478672986 + .0521327014, 2.4)
}

function li(i) {
    return i < .0031308 ? i * 12.92 : 1.055 * Math.pow(i, .41666) - .055
}
let Xn;
class Oc {
    static getDataURL(t, e = "image/png") {
        if (/^data:/i.test(t.src) || typeof HTMLCanvasElement > "u") return t.src;
        let n;
        if (t instanceof HTMLCanvasElement) n = t;
        else {
            Xn === void 0 && (Xn = vs("canvas")), Xn.width = t.width, Xn.height = t.height;
            const s = Xn.getContext("2d");
            t instanceof ImageData ? s.putImageData(t, 0, 0) : s.drawImage(t, 0, 0, t.width, t.height), n = Xn
        }
        return n.toDataURL(e)
    }
    static sRGBToLinear(t) {
        if (typeof HTMLImageElement < "u" && t instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && t instanceof ImageBitmap) {
            const e = vs("canvas");
            e.width = t.width, e.height = t.height;
            const n = e.getContext("2d");
            n.drawImage(t, 0, 0, t.width, t.height);
            const s = n.getImageData(0, 0, t.width, t.height),
                r = s.data;
            for (let a = 0; a < r.length; a++) r[a] = hn(r[a] / 255) * 255;
            return n.putImageData(s, 0, 0), e
        } else if (t.data) {
            const e = t.data.slice(0);
            for (let n = 0; n < e.length; n++) e instanceof Uint8Array || e instanceof Uint8ClampedArray ? e[n] = Math.floor(hn(e[n] / 255) * 255) : e[n] = hn(e[n]);
            return {
                data: e,
                width: t.width,
                height: t.height
            }
        } else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), t
    }
}
let Bc = 0;
class aa {
    constructor(t = null) {
        this.isSource = !0, Object.defineProperty(this, "id", {
            value: Bc++
        }), this.uuid = Li(), this.data = t, this.dataReady = !0, this.version = 0
    }
    getSize(t) {
        const e = this.data;
        return e instanceof HTMLVideoElement ? t.set(e.videoWidth, e.videoHeight, 0) : e instanceof VideoFrame ? t.set(e.displayHeight, e.displayWidth, 0) : e !== null ? t.set(e.width, e.height, e.depth || 0) : t.set(0, 0, 0), t
    }
    set needsUpdate(t) {
        t === !0 && this.version++
    }
    toJSON(t) {
        const e = t === void 0 || typeof t == "string";
        if (!e && t.images[this.uuid] !== void 0) return t.images[this.uuid];
        const n = {
                uuid: this.uuid,
                url: ""
            },
            s = this.data;
        if (s !== null) {
            let r;
            if (Array.isArray(s)) {
                r = [];
                for (let a = 0, o = s.length; a < o; a++) s[a].isDataTexture ? r.push(Ls(s[a].image)) : r.push(Ls(s[a]))
            } else r = Ls(s);
            n.url = r
        }
        return e || (t.images[this.uuid] = n), n
    }
}

function Ls(i) {
    return typeof HTMLImageElement < "u" && i instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && i instanceof ImageBitmap ? Oc.getDataURL(i) : i.data ? {
        data: Array.from(i.data),
        width: i.width,
        height: i.height,
        type: i.data.constructor.name
    } : (console.warn("THREE.Texture: Unable to serialize Texture."), {})
}
let zc = 0;
const Is = new F;
class Re extends Gn {
    constructor(t = Re.DEFAULT_IMAGE, e = Re.DEFAULT_MAPPING, n = Fn, s = Fn, r = Ke, a = On, o = Ve, c = Je, l = Re.DEFAULT_ANISOTROPY, d = vn) {
        super(), this.isTexture = !0, Object.defineProperty(this, "id", {
            value: zc++
        }), this.uuid = Li(), this.name = "", this.source = new aa(t), this.mipmaps = [], this.mapping = e, this.channel = 0, this.wrapS = n, this.wrapT = s, this.magFilter = r, this.minFilter = a, this.anisotropy = l, this.format = o, this.internalFormat = null, this.type = c, this.offset = new Lt(0, 0), this.repeat = new Lt(1, 1), this.center = new Lt(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Ft, this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = d, this.userData = {}, this.updateRanges = [], this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = !1, this.isArrayTexture = !!(t && t.depth && t.depth > 1), this.pmremVersion = 0
    }
    get width() {
        return this.source.getSize(Is).x
    }
    get height() {
        return this.source.getSize(Is).y
    }
    get depth() {
        return this.source.getSize(Is).z
    }
    get image() {
        return this.source.data
    }
    set image(t = null) {
        this.source.data = t
    }
    updateMatrix() {
        this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y)
    }
    addUpdateRange(t, e) {
        this.updateRanges.push({
            start: t,
            count: e
        })
    }
    clearUpdateRanges() {
        this.updateRanges.length = 0
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(t) {
        return this.name = t.name, this.source = t.source, this.mipmaps = t.mipmaps.slice(0), this.mapping = t.mapping, this.channel = t.channel, this.wrapS = t.wrapS, this.wrapT = t.wrapT, this.magFilter = t.magFilter, this.minFilter = t.minFilter, this.anisotropy = t.anisotropy, this.format = t.format, this.internalFormat = t.internalFormat, this.type = t.type, this.offset.copy(t.offset), this.repeat.copy(t.repeat), this.center.copy(t.center), this.rotation = t.rotation, this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrix.copy(t.matrix), this.generateMipmaps = t.generateMipmaps, this.premultiplyAlpha = t.premultiplyAlpha, this.flipY = t.flipY, this.unpackAlignment = t.unpackAlignment, this.colorSpace = t.colorSpace, this.renderTarget = t.renderTarget, this.isRenderTargetTexture = t.isRenderTargetTexture, this.isArrayTexture = t.isArrayTexture, this.userData = JSON.parse(JSON.stringify(t.userData)), this.needsUpdate = !0, this
    }
    setValues(t) {
        for (const e in t) {
            const n = t[e];
            if (n === void 0) {
                console.warn(`THREE.Texture.setValues(): parameter '${e}' has value of undefined.`);
                continue
            }
            const s = this[e];
            if (s === void 0) {
                console.warn(`THREE.Texture.setValues(): property '${e}' does not exist.`);
                continue
            }
            s && n && s.isVector2 && n.isVector2 || s && n && s.isVector3 && n.isVector3 || s && n && s.isMatrix3 && n.isMatrix3 ? s.copy(n) : this[e] = n
        }
    }
    toJSON(t) {
        const e = t === void 0 || typeof t == "string";
        if (!e && t.textures[this.uuid] !== void 0) return t.textures[this.uuid];
        const n = {
            metadata: {
                version: 4.7,
                type: "Texture",
                generator: "Texture.toJSON"
            },
            uuid: this.uuid,
            name: this.name,
            image: this.source.toJSON(t).uuid,
            mapping: this.mapping,
            channel: this.channel,
            repeat: [this.repeat.x, this.repeat.y],
            offset: [this.offset.x, this.offset.y],
            center: [this.center.x, this.center.y],
            rotation: this.rotation,
            wrap: [this.wrapS, this.wrapT],
            format: this.format,
            internalFormat: this.internalFormat,
            type: this.type,
            colorSpace: this.colorSpace,
            minFilter: this.minFilter,
            magFilter: this.magFilter,
            anisotropy: this.anisotropy,
            flipY: this.flipY,
            generateMipmaps: this.generateMipmaps,
            premultiplyAlpha: this.premultiplyAlpha,
            unpackAlignment: this.unpackAlignment
        };
        return Object.keys(this.userData).length > 0 && (n.userData = this.userData), e || (t.textures[this.uuid] = n), n
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
    transformUv(t) {
        if (this.mapping !== Uo) return t;
        if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1) switch (this.wrapS) {
            case vr:
                t.x = t.x - Math.floor(t.x);
                break;
            case Fn:
                t.x = t.x < 0 ? 0 : 1;
                break;
            case Mr:
                Math.abs(Math.floor(t.x) % 2) === 1 ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
                break
        }
        if (t.y < 0 || t.y > 1) switch (this.wrapT) {
            case vr:
                t.y = t.y - Math.floor(t.y);
                break;
            case Fn:
                t.y = t.y < 0 ? 0 : 1;
                break;
            case Mr:
                Math.abs(Math.floor(t.y) % 2) === 1 ? t.y = Math.ceil(t.y) - t.y : t.y = t.y - Math.floor(t.y);
                break
        }
        return this.flipY && (t.y = 1 - t.y), t
    }
    set needsUpdate(t) {
        t === !0 && (this.version++, this.source.needsUpdate = !0)
    }
    set needsPMREMUpdate(t) {
        t === !0 && this.pmremVersion++
    }
}
Re.DEFAULT_IMAGE = null;
Re.DEFAULT_MAPPING = Uo;
Re.DEFAULT_ANISOTROPY = 1;
class he {
    constructor(t = 0, e = 0, n = 0, s = 1) {
        he.prototype.isVector4 = !0, this.x = t, this.y = e, this.z = n, this.w = s
    }
    get width() {
        return this.z
    }
    set width(t) {
        this.z = t
    }
    get height() {
        return this.w
    }
    set height(t) {
        this.w = t
    }
    set(t, e, n, s) {
        return this.x = t, this.y = e, this.z = n, this.w = s, this
    }
    setScalar(t) {
        return this.x = t, this.y = t, this.z = t, this.w = t, this
    }
    setX(t) {
        return this.x = t, this
    }
    setY(t) {
        return this.y = t, this
    }
    setZ(t) {
        return this.z = t, this
    }
    setW(t) {
        return this.w = t, this
    }
    setComponent(t, e) {
        switch (t) {
            case 0:
                this.x = e;
                break;
            case 1:
                this.y = e;
                break;
            case 2:
                this.z = e;
                break;
            case 3:
                this.w = e;
                break;
            default:
                throw new Error("index is out of range: " + t)
        }
        return this
    }
    getComponent(t) {
        switch (t) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            case 2:
                return this.z;
            case 3:
                return this.w;
            default:
                throw new Error("index is out of range: " + t)
        }
    }
    clone() {
        return new this.constructor(this.x, this.y, this.z, this.w)
    }
    copy(t) {
        return this.x = t.x, this.y = t.y, this.z = t.z, this.w = t.w !== void 0 ? t.w : 1, this
    }
    add(t) {
        return this.x += t.x, this.y += t.y, this.z += t.z, this.w += t.w, this
    }
    addScalar(t) {
        return this.x += t, this.y += t, this.z += t, this.w += t, this
    }
    addVectors(t, e) {
        return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this.w = t.w + e.w, this
    }
    addScaledVector(t, e) {
        return this.x += t.x * e, this.y += t.y * e, this.z += t.z * e, this.w += t.w * e, this
    }
    sub(t) {
        return this.x -= t.x, this.y -= t.y, this.z -= t.z, this.w -= t.w, this
    }
    subScalar(t) {
        return this.x -= t, this.y -= t, this.z -= t, this.w -= t, this
    }
    subVectors(t, e) {
        return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this.w = t.w - e.w, this
    }
    multiply(t) {
        return this.x *= t.x, this.y *= t.y, this.z *= t.z, this.w *= t.w, this
    }
    multiplyScalar(t) {
        return this.x *= t, this.y *= t, this.z *= t, this.w *= t, this
    }
    applyMatrix4(t) {
        const e = this.x,
            n = this.y,
            s = this.z,
            r = this.w,
            a = t.elements;
        return this.x = a[0] * e + a[4] * n + a[8] * s + a[12] * r, this.y = a[1] * e + a[5] * n + a[9] * s + a[13] * r, this.z = a[2] * e + a[6] * n + a[10] * s + a[14] * r, this.w = a[3] * e + a[7] * n + a[11] * s + a[15] * r, this
    }
    divide(t) {
        return this.x /= t.x, this.y /= t.y, this.z /= t.z, this.w /= t.w, this
    }
    divideScalar(t) {
        return this.multiplyScalar(1 / t)
    }
    setAxisAngleFromQuaternion(t) {
        this.w = 2 * Math.acos(t.w);
        const e = Math.sqrt(1 - t.w * t.w);
        return e < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = t.x / e, this.y = t.y / e, this.z = t.z / e), this
    }
    setAxisAngleFromRotationMatrix(t) {
        let e, n, s, r;
        const c = t.elements,
            l = c[0],
            d = c[4],
            f = c[8],
            p = c[1],
            m = c[5],
            x = c[9],
            _ = c[2],
            u = c[6],
            h = c[10];
        if (Math.abs(d - p) < .01 && Math.abs(f - _) < .01 && Math.abs(x - u) < .01) {
            if (Math.abs(d + p) < .1 && Math.abs(f + _) < .1 && Math.abs(x + u) < .1 && Math.abs(l + m + h - 3) < .1) return this.set(1, 0, 0, 0), this;
            e = Math.PI;
            const T = (l + 1) / 2,
                E = (m + 1) / 2,
                P = (h + 1) / 2,
                R = (d + p) / 4,
                b = (f + _) / 4,
                I = (x + u) / 4;
            return T > E && T > P ? T < .01 ? (n = 0, s = .707106781, r = .707106781) : (n = Math.sqrt(T), s = R / n, r = b / n) : E > P ? E < .01 ? (n = .707106781, s = 0, r = .707106781) : (s = Math.sqrt(E), n = R / s, r = I / s) : P < .01 ? (n = .707106781, s = .707106781, r = 0) : (r = Math.sqrt(P), n = b / r, s = I / r), this.set(n, s, r, e), this
        }
        let w = Math.sqrt((u - x) * (u - x) + (f - _) * (f - _) + (p - d) * (p - d));
        return Math.abs(w) < .001 && (w = 1), this.x = (u - x) / w, this.y = (f - _) / w, this.z = (p - d) / w, this.w = Math.acos((l + m + h - 1) / 2), this
    }
    setFromMatrixPosition(t) {
        const e = t.elements;
        return this.x = e[12], this.y = e[13], this.z = e[14], this.w = e[15], this
    }
    min(t) {
        return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this.w = Math.min(this.w, t.w), this
    }
    max(t) {
        return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this.w = Math.max(this.w, t.w), this
    }
    clamp(t, e) {
        return this.x = zt(this.x, t.x, e.x), this.y = zt(this.y, t.y, e.y), this.z = zt(this.z, t.z, e.z), this.w = zt(this.w, t.w, e.w), this
    }
    clampScalar(t, e) {
        return this.x = zt(this.x, t, e), this.y = zt(this.y, t, e), this.z = zt(this.z, t, e), this.w = zt(this.w, t, e), this
    }
    clampLength(t, e) {
        const n = this.length();
        return this.divideScalar(n || 1).multiplyScalar(zt(n, t, e))
    }
    floor() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this
    }
    ceil() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this
    }
    round() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this
    }
    roundToZero() {
        return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this
    }
    negate() {
        return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this
    }
    dot(t) {
        return this.x * t.x + this.y * t.y + this.z * t.z + this.w * t.w
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w)
    }
    normalize() {
        return this.divideScalar(this.length() || 1)
    }
    setLength(t) {
        return this.normalize().multiplyScalar(t)
    }
    lerp(t, e) {
        return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this.w += (t.w - this.w) * e, this
    }
    lerpVectors(t, e, n) {
        return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this.z = t.z + (e.z - t.z) * n, this.w = t.w + (e.w - t.w) * n, this
    }
    equals(t) {
        return t.x === this.x && t.y === this.y && t.z === this.z && t.w === this.w
    }
    fromArray(t, e = 0) {
        return this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this.w = t[e + 3], this
    }
    toArray(t = [], e = 0) {
        return t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t[e + 3] = this.w, t
    }
    fromBufferAttribute(t, e) {
        return this.x = t.getX(e), this.y = t.getY(e), this.z = t.getZ(e), this.w = t.getW(e), this
    }
    random() {
        return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this
    }*[Symbol.iterator]() {
        yield this.x, yield this.y, yield this.z, yield this.w
    }
}
class Hc extends Gn {
    constructor(t = 1, e = 1, n = {}) {
        super(), n = Object.assign({
            generateMipmaps: !1,
            internalFormat: null,
            minFilter: Ke,
            depthBuffer: !0,
            stencilBuffer: !1,
            resolveDepthBuffer: !0,
            resolveStencilBuffer: !0,
            depthTexture: null,
            samples: 0,
            count: 1,
            depth: 1,
            multiview: !1
        }, n), this.isRenderTarget = !0, this.width = t, this.height = e, this.depth = n.depth, this.scissor = new he(0, 0, t, e), this.scissorTest = !1, this.viewport = new he(0, 0, t, e);
        const s = {
                width: t,
                height: e,
                depth: n.depth
            },
            r = new Re(s);
        this.textures = [];
        const a = n.count;
        for (let o = 0; o < a; o++) this.textures[o] = r.clone(), this.textures[o].isRenderTargetTexture = !0, this.textures[o].renderTarget = this;
        this._setTextureOptions(n), this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this._depthTexture = null, this.depthTexture = n.depthTexture, this.samples = n.samples, this.multiview = n.multiview
    }
    _setTextureOptions(t = {}) {
        const e = {
            minFilter: Ke,
            generateMipmaps: !1,
            flipY: !1,
            internalFormat: null
        };
        t.mapping !== void 0 && (e.mapping = t.mapping), t.wrapS !== void 0 && (e.wrapS = t.wrapS), t.wrapT !== void 0 && (e.wrapT = t.wrapT), t.wrapR !== void 0 && (e.wrapR = t.wrapR), t.magFilter !== void 0 && (e.magFilter = t.magFilter), t.minFilter !== void 0 && (e.minFilter = t.minFilter), t.format !== void 0 && (e.format = t.format), t.type !== void 0 && (e.type = t.type), t.anisotropy !== void 0 && (e.anisotropy = t.anisotropy), t.colorSpace !== void 0 && (e.colorSpace = t.colorSpace), t.flipY !== void 0 && (e.flipY = t.flipY), t.generateMipmaps !== void 0 && (e.generateMipmaps = t.generateMipmaps), t.internalFormat !== void 0 && (e.internalFormat = t.internalFormat);
        for (let n = 0; n < this.textures.length; n++) this.textures[n].setValues(e)
    }
    get texture() {
        return this.textures[0]
    }
    set texture(t) {
        this.textures[0] = t
    }
    set depthTexture(t) {
        this._depthTexture !== null && (this._depthTexture.renderTarget = null), t !== null && (t.renderTarget = this), this._depthTexture = t
    }
    get depthTexture() {
        return this._depthTexture
    }
    setSize(t, e, n = 1) {
        if (this.width !== t || this.height !== e || this.depth !== n) {
            this.width = t, this.height = e, this.depth = n;
            for (let s = 0, r = this.textures.length; s < r; s++) this.textures[s].image.width = t, this.textures[s].image.height = e, this.textures[s].image.depth = n, this.textures[s].isArrayTexture = this.textures[s].image.depth > 1;
            this.dispose()
        }
        this.viewport.set(0, 0, t, e), this.scissor.set(0, 0, t, e)
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(t) {
        this.width = t.width, this.height = t.height, this.depth = t.depth, this.scissor.copy(t.scissor), this.scissorTest = t.scissorTest, this.viewport.copy(t.viewport), this.textures.length = 0;
        for (let e = 0, n = t.textures.length; e < n; e++) {
            this.textures[e] = t.textures[e].clone(), this.textures[e].isRenderTargetTexture = !0, this.textures[e].renderTarget = this;
            const s = Object.assign({}, t.textures[e].image);
            this.textures[e].source = new aa(s)
        }
        return this.depthBuffer = t.depthBuffer, this.stencilBuffer = t.stencilBuffer, this.resolveDepthBuffer = t.resolveDepthBuffer, this.resolveStencilBuffer = t.resolveStencilBuffer, t.depthTexture !== null && (this.depthTexture = t.depthTexture.clone()), this.samples = t.samples, this
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
}
class Hn extends Hc {
    constructor(t = 1, e = 1, n = {}) {
        super(t, e, n), this.isWebGLRenderTarget = !0
    }
}
class qo extends Re {
    constructor(t = null, e = 1, n = 1, s = 1) {
        super(null), this.isDataArrayTexture = !0, this.image = {
            data: t,
            width: e,
            height: n,
            depth: s
        }, this.magFilter = We, this.minFilter = We, this.wrapR = Fn, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = new Set
    }
    addLayerUpdate(t) {
        this.layerUpdates.add(t)
    }
    clearLayerUpdates() {
        this.layerUpdates.clear()
    }
}
class kc extends Re {
    constructor(t = null, e = 1, n = 1, s = 1) {
        super(null), this.isData3DTexture = !0, this.image = {
            data: t,
            width: e,
            height: n,
            depth: s
        }, this.magFilter = We, this.minFilter = We, this.wrapR = Fn, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1
    }
}
class Ii {
    constructor(t = new F(1 / 0, 1 / 0, 1 / 0), e = new F(-1 / 0, -1 / 0, -1 / 0)) {
        this.isBox3 = !0, this.min = t, this.max = e
    }
    set(t, e) {
        return this.min.copy(t), this.max.copy(e), this
    }
    setFromArray(t) {
        this.makeEmpty();
        for (let e = 0, n = t.length; e < n; e += 3) this.expandByPoint(He.fromArray(t, e));
        return this
    }
    setFromBufferAttribute(t) {
        this.makeEmpty();
        for (let e = 0, n = t.count; e < n; e++) this.expandByPoint(He.fromBufferAttribute(t, e));
        return this
    }
    setFromPoints(t) {
        this.makeEmpty();
        for (let e = 0, n = t.length; e < n; e++) this.expandByPoint(t[e]);
        return this
    }
    setFromCenterAndSize(t, e) {
        const n = He.copy(e).multiplyScalar(.5);
        return this.min.copy(t).sub(n), this.max.copy(t).add(n), this
    }
    setFromObject(t, e = !1) {
        return this.makeEmpty(), this.expandByObject(t, e)
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(t) {
        return this.min.copy(t.min), this.max.copy(t.max), this
    }
    makeEmpty() {
        return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this
    }
    isEmpty() {
        return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z
    }
    getCenter(t) {
        return this.isEmpty() ? t.set(0, 0, 0) : t.addVectors(this.min, this.max).multiplyScalar(.5)
    }
    getSize(t) {
        return this.isEmpty() ? t.set(0, 0, 0) : t.subVectors(this.max, this.min)
    }
    expandByPoint(t) {
        return this.min.min(t), this.max.max(t), this
    }
    expandByVector(t) {
        return this.min.sub(t), this.max.add(t), this
    }
    expandByScalar(t) {
        return this.min.addScalar(-t), this.max.addScalar(t), this
    }
    expandByObject(t, e = !1) {
        t.updateWorldMatrix(!1, !1);
        const n = t.geometry;
        if (n !== void 0) {
            const r = n.getAttribute("position");
            if (e === !0 && r !== void 0 && t.isInstancedMesh !== !0)
                for (let a = 0, o = r.count; a < o; a++) t.isMesh === !0 ? t.getVertexPosition(a, He) : He.fromBufferAttribute(r, a), He.applyMatrix4(t.matrixWorld), this.expandByPoint(He);
            else t.boundingBox !== void 0 ? (t.boundingBox === null && t.computeBoundingBox(), Bi.copy(t.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), Bi.copy(n.boundingBox)), Bi.applyMatrix4(t.matrixWorld), this.union(Bi)
        }
        const s = t.children;
        for (let r = 0, a = s.length; r < a; r++) this.expandByObject(s[r], e);
        return this
    }
    containsPoint(t) {
        return t.x >= this.min.x && t.x <= this.max.x && t.y >= this.min.y && t.y <= this.max.y && t.z >= this.min.z && t.z <= this.max.z
    }
    containsBox(t) {
        return this.min.x <= t.min.x && t.max.x <= this.max.x && this.min.y <= t.min.y && t.max.y <= this.max.y && this.min.z <= t.min.z && t.max.z <= this.max.z
    }
    getParameter(t, e) {
        return e.set((t.x - this.min.x) / (this.max.x - this.min.x), (t.y - this.min.y) / (this.max.y - this.min.y), (t.z - this.min.z) / (this.max.z - this.min.z))
    }
    intersectsBox(t) {
        return t.max.x >= this.min.x && t.min.x <= this.max.x && t.max.y >= this.min.y && t.min.y <= this.max.y && t.max.z >= this.min.z && t.min.z <= this.max.z
    }
    intersectsSphere(t) {
        return this.clampPoint(t.center, He), He.distanceToSquared(t.center) <= t.radius * t.radius
    }
    intersectsPlane(t) {
        let e, n;
        return t.normal.x > 0 ? (e = t.normal.x * this.min.x, n = t.normal.x * this.max.x) : (e = t.normal.x * this.max.x, n = t.normal.x * this.min.x), t.normal.y > 0 ? (e += t.normal.y * this.min.y, n += t.normal.y * this.max.y) : (e += t.normal.y * this.max.y, n += t.normal.y * this.min.y), t.normal.z > 0 ? (e += t.normal.z * this.min.z, n += t.normal.z * this.max.z) : (e += t.normal.z * this.max.z, n += t.normal.z * this.min.z), e <= -t.constant && n >= -t.constant
    }
    intersectsTriangle(t) {
        if (this.isEmpty()) return !1;
        this.getCenter(xi), zi.subVectors(this.max, xi), qn.subVectors(t.a, xi), Yn.subVectors(t.b, xi), Kn.subVectors(t.c, xi), dn.subVectors(Yn, qn), fn.subVectors(Kn, Yn), An.subVectors(qn, Kn);
        let e = [0, -dn.z, dn.y, 0, -fn.z, fn.y, 0, -An.z, An.y, dn.z, 0, -dn.x, fn.z, 0, -fn.x, An.z, 0, -An.x, -dn.y, dn.x, 0, -fn.y, fn.x, 0, -An.y, An.x, 0];
        return !Us(e, qn, Yn, Kn, zi) || (e = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Us(e, qn, Yn, Kn, zi)) ? !1 : (Hi.crossVectors(dn, fn), e = [Hi.x, Hi.y, Hi.z], Us(e, qn, Yn, Kn, zi))
    }
    clampPoint(t, e) {
        return e.copy(t).clamp(this.min, this.max)
    }
    distanceToPoint(t) {
        return this.clampPoint(t, He).distanceTo(t)
    }
    getBoundingSphere(t) {
        return this.isEmpty() ? t.makeEmpty() : (this.getCenter(t.center), t.radius = this.getSize(He).length() * .5), t
    }
    intersect(t) {
        return this.min.max(t.min), this.max.min(t.max), this.isEmpty() && this.makeEmpty(), this
    }
    union(t) {
        return this.min.min(t.min), this.max.max(t.max), this
    }
    applyMatrix4(t) {
        return this.isEmpty() ? this : (en[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t), en[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t), en[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t), en[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t), en[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t), en[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t), en[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t), en[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t), this.setFromPoints(en), this)
    }
    translate(t) {
        return this.min.add(t), this.max.add(t), this
    }
    equals(t) {
        return t.min.equals(this.min) && t.max.equals(this.max)
    }
    toJSON() {
        return {
            min: this.min.toArray(),
            max: this.max.toArray()
        }
    }
    fromJSON(t) {
        return this.min.fromArray(t.min), this.max.fromArray(t.max), this
    }
}
const en = [new F, new F, new F, new F, new F, new F, new F, new F],
    He = new F,
    Bi = new Ii,
    qn = new F,
    Yn = new F,
    Kn = new F,
    dn = new F,
    fn = new F,
    An = new F,
    xi = new F,
    zi = new F,
    Hi = new F,
    wn = new F;

function Us(i, t, e, n, s) {
    for (let r = 0, a = i.length - 3; r <= a; r += 3) {
        wn.fromArray(i, r);
        const o = s.x * Math.abs(wn.x) + s.y * Math.abs(wn.y) + s.z * Math.abs(wn.z),
            c = t.dot(wn),
            l = e.dot(wn),
            d = n.dot(wn);
        if (Math.max(-Math.max(c, l, d), Math.min(c, l, d)) > o) return !1
    }
    return !0
}
const Gc = new Ii,
    vi = new F,
    Ns = new F;
class ys {
    constructor(t = new F, e = -1) {
        this.isSphere = !0, this.center = t, this.radius = e
    }
    set(t, e) {
        return this.center.copy(t), this.radius = e, this
    }
    setFromPoints(t, e) {
        const n = this.center;
        e !== void 0 ? n.copy(e) : Gc.setFromPoints(t).getCenter(n);
        let s = 0;
        for (let r = 0, a = t.length; r < a; r++) s = Math.max(s, n.distanceToSquared(t[r]));
        return this.radius = Math.sqrt(s), this
    }
    copy(t) {
        return this.center.copy(t.center), this.radius = t.radius, this
    }
    isEmpty() {
        return this.radius < 0
    }
    makeEmpty() {
        return this.center.set(0, 0, 0), this.radius = -1, this
    }
    containsPoint(t) {
        return t.distanceToSquared(this.center) <= this.radius * this.radius
    }
    distanceToPoint(t) {
        return t.distanceTo(this.center) - this.radius
    }
    intersectsSphere(t) {
        const e = this.radius + t.radius;
        return t.center.distanceToSquared(this.center) <= e * e
    }
    intersectsBox(t) {
        return t.intersectsSphere(this)
    }
    intersectsPlane(t) {
        return Math.abs(t.distanceToPoint(this.center)) <= this.radius
    }
    clampPoint(t, e) {
        const n = this.center.distanceToSquared(t);
        return e.copy(t), n > this.radius * this.radius && (e.sub(this.center).normalize(), e.multiplyScalar(this.radius).add(this.center)), e
    }
    getBoundingBox(t) {
        return this.isEmpty() ? (t.makeEmpty(), t) : (t.set(this.center, this.center), t.expandByScalar(this.radius), t)
    }
    applyMatrix4(t) {
        return this.center.applyMatrix4(t), this.radius = this.radius * t.getMaxScaleOnAxis(), this
    }
    translate(t) {
        return this.center.add(t), this
    }
    expandByPoint(t) {
        if (this.isEmpty()) return this.center.copy(t), this.radius = 0, this;
        vi.subVectors(t, this.center);
        const e = vi.lengthSq();
        if (e > this.radius * this.radius) {
            const n = Math.sqrt(e),
                s = (n - this.radius) * .5;
            this.center.addScaledVector(vi, s / n), this.radius += s
        }
        return this
    }
    union(t) {
        return t.isEmpty() ? this : this.isEmpty() ? (this.copy(t), this) : (this.center.equals(t.center) === !0 ? this.radius = Math.max(this.radius, t.radius) : (Ns.subVectors(t.center, this.center).setLength(t.radius), this.expandByPoint(vi.copy(t.center).add(Ns)), this.expandByPoint(vi.copy(t.center).sub(Ns))), this)
    }
    equals(t) {
        return t.center.equals(this.center) && t.radius === this.radius
    }
    clone() {
        return new this.constructor().copy(this)
    }
    toJSON() {
        return {
            radius: this.radius,
            center: this.center.toArray()
        }
    }
    fromJSON(t) {
        return this.radius = t.radius, this.center.fromArray(t.center), this
    }
}
const nn = new F,
    Fs = new F,
    ki = new F,
    pn = new F,
    Os = new F,
    Gi = new F,
    Bs = new F;
class Ts {
    constructor(t = new F, e = new F(0, 0, -1)) {
        this.origin = t, this.direction = e
    }
    set(t, e) {
        return this.origin.copy(t), this.direction.copy(e), this
    }
    copy(t) {
        return this.origin.copy(t.origin), this.direction.copy(t.direction), this
    }
    at(t, e) {
        return e.copy(this.origin).addScaledVector(this.direction, t)
    }
    lookAt(t) {
        return this.direction.copy(t).sub(this.origin).normalize(), this
    }
    recast(t) {
        return this.origin.copy(this.at(t, nn)), this
    }
    closestPointToPoint(t, e) {
        e.subVectors(t, this.origin);
        const n = e.dot(this.direction);
        return n < 0 ? e.copy(this.origin) : e.copy(this.origin).addScaledVector(this.direction, n)
    }
    distanceToPoint(t) {
        return Math.sqrt(this.distanceSqToPoint(t))
    }
    distanceSqToPoint(t) {
        const e = nn.subVectors(t, this.origin).dot(this.direction);
        return e < 0 ? this.origin.distanceToSquared(t) : (nn.copy(this.origin).addScaledVector(this.direction, e), nn.distanceToSquared(t))
    }
    distanceSqToSegment(t, e, n, s) {
        Fs.copy(t).add(e).multiplyScalar(.5), ki.copy(e).sub(t).normalize(), pn.copy(this.origin).sub(Fs);
        const r = t.distanceTo(e) * .5,
            a = -this.direction.dot(ki),
            o = pn.dot(this.direction),
            c = -pn.dot(ki),
            l = pn.lengthSq(),
            d = Math.abs(1 - a * a);
        let f, p, m, x;
        if (d > 0)
            if (f = a * c - o, p = a * o - c, x = r * d, f >= 0)
                if (p >= -x)
                    if (p <= x) {
                        const _ = 1 / d;
                        f *= _, p *= _, m = f * (f + a * p + 2 * o) + p * (a * f + p + 2 * c) + l
                    } else p = r, f = Math.max(0, -(a * p + o)), m = -f * f + p * (p + 2 * c) + l;
        else p = -r, f = Math.max(0, -(a * p + o)), m = -f * f + p * (p + 2 * c) + l;
        else p <= -x ? (f = Math.max(0, -(-a * r + o)), p = f > 0 ? -r : Math.min(Math.max(-r, -c), r), m = -f * f + p * (p + 2 * c) + l) : p <= x ? (f = 0, p = Math.min(Math.max(-r, -c), r), m = p * (p + 2 * c) + l) : (f = Math.max(0, -(a * r + o)), p = f > 0 ? r : Math.min(Math.max(-r, -c), r), m = -f * f + p * (p + 2 * c) + l);
        else p = a > 0 ? -r : r, f = Math.max(0, -(a * p + o)), m = -f * f + p * (p + 2 * c) + l;
        return n && n.copy(this.origin).addScaledVector(this.direction, f), s && s.copy(Fs).addScaledVector(ki, p), m
    }
    intersectSphere(t, e) {
        nn.subVectors(t.center, this.origin);
        const n = nn.dot(this.direction),
            s = nn.dot(nn) - n * n,
            r = t.radius * t.radius;
        if (s > r) return null;
        const a = Math.sqrt(r - s),
            o = n - a,
            c = n + a;
        return c < 0 ? null : o < 0 ? this.at(c, e) : this.at(o, e)
    }
    intersectsSphere(t) {
        return t.radius < 0 ? !1 : this.distanceSqToPoint(t.center) <= t.radius * t.radius
    }
    distanceToPlane(t) {
        const e = t.normal.dot(this.direction);
        if (e === 0) return t.distanceToPoint(this.origin) === 0 ? 0 : null;
        const n = -(this.origin.dot(t.normal) + t.constant) / e;
        return n >= 0 ? n : null
    }
    intersectPlane(t, e) {
        const n = this.distanceToPlane(t);
        return n === null ? null : this.at(n, e)
    }
    intersectsPlane(t) {
        const e = t.distanceToPoint(this.origin);
        return e === 0 || t.normal.dot(this.direction) * e < 0
    }
    intersectBox(t, e) {
        let n, s, r, a, o, c;
        const l = 1 / this.direction.x,
            d = 1 / this.direction.y,
            f = 1 / this.direction.z,
            p = this.origin;
        return l >= 0 ? (n = (t.min.x - p.x) * l, s = (t.max.x - p.x) * l) : (n = (t.max.x - p.x) * l, s = (t.min.x - p.x) * l), d >= 0 ? (r = (t.min.y - p.y) * d, a = (t.max.y - p.y) * d) : (r = (t.max.y - p.y) * d, a = (t.min.y - p.y) * d), n > a || r > s || ((r > n || isNaN(n)) && (n = r), (a < s || isNaN(s)) && (s = a), f >= 0 ? (o = (t.min.z - p.z) * f, c = (t.max.z - p.z) * f) : (o = (t.max.z - p.z) * f, c = (t.min.z - p.z) * f), n > c || o > s) || ((o > n || n !== n) && (n = o), (c < s || s !== s) && (s = c), s < 0) ? null : this.at(n >= 0 ? n : s, e)
    }
    intersectsBox(t) {
        return this.intersectBox(t, nn) !== null
    }
    intersectTriangle(t, e, n, s, r) {
        Os.subVectors(e, t), Gi.subVectors(n, t), Bs.crossVectors(Os, Gi);
        let a = this.direction.dot(Bs),
            o;
        if (a > 0) {
            if (s) return null;
            o = 1
        } else if (a < 0) o = -1, a = -a;
        else return null;
        pn.subVectors(this.origin, t);
        const c = o * this.direction.dot(Gi.crossVectors(pn, Gi));
        if (c < 0) return null;
        const l = o * this.direction.dot(Os.cross(pn));
        if (l < 0 || c + l > a) return null;
        const d = -o * pn.dot(Bs);
        return d < 0 ? null : this.at(d / a, r)
    }
    applyMatrix4(t) {
        return this.origin.applyMatrix4(t), this.direction.transformDirection(t), this
    }
    equals(t) {
        return t.origin.equals(this.origin) && t.direction.equals(this.direction)
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
class le {
    constructor(t, e, n, s, r, a, o, c, l, d, f, p, m, x, _, u) {
        le.prototype.isMatrix4 = !0, this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], t !== void 0 && this.set(t, e, n, s, r, a, o, c, l, d, f, p, m, x, _, u)
    }
    set(t, e, n, s, r, a, o, c, l, d, f, p, m, x, _, u) {
        const h = this.elements;
        return h[0] = t, h[4] = e, h[8] = n, h[12] = s, h[1] = r, h[5] = a, h[9] = o, h[13] = c, h[2] = l, h[6] = d, h[10] = f, h[14] = p, h[3] = m, h[7] = x, h[11] = _, h[15] = u, this
    }
    identity() {
        return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
    }
    clone() {
        return new le().fromArray(this.elements)
    }
    copy(t) {
        const e = this.elements,
            n = t.elements;
        return e[0] = n[0], e[1] = n[1], e[2] = n[2], e[3] = n[3], e[4] = n[4], e[5] = n[5], e[6] = n[6], e[7] = n[7], e[8] = n[8], e[9] = n[9], e[10] = n[10], e[11] = n[11], e[12] = n[12], e[13] = n[13], e[14] = n[14], e[15] = n[15], this
    }
    copyPosition(t) {
        const e = this.elements,
            n = t.elements;
        return e[12] = n[12], e[13] = n[13], e[14] = n[14], this
    }
    setFromMatrix3(t) {
        const e = t.elements;
        return this.set(e[0], e[3], e[6], 0, e[1], e[4], e[7], 0, e[2], e[5], e[8], 0, 0, 0, 0, 1), this
    }
    extractBasis(t, e, n) {
        return t.setFromMatrixColumn(this, 0), e.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this
    }
    makeBasis(t, e, n) {
        return this.set(t.x, e.x, n.x, 0, t.y, e.y, n.y, 0, t.z, e.z, n.z, 0, 0, 0, 0, 1), this
    }
    extractRotation(t) {
        const e = this.elements,
            n = t.elements,
            s = 1 / $n.setFromMatrixColumn(t, 0).length(),
            r = 1 / $n.setFromMatrixColumn(t, 1).length(),
            a = 1 / $n.setFromMatrixColumn(t, 2).length();
        return e[0] = n[0] * s, e[1] = n[1] * s, e[2] = n[2] * s, e[3] = 0, e[4] = n[4] * r, e[5] = n[5] * r, e[6] = n[6] * r, e[7] = 0, e[8] = n[8] * a, e[9] = n[9] * a, e[10] = n[10] * a, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this
    }
    makeRotationFromEuler(t) {
        const e = this.elements,
            n = t.x,
            s = t.y,
            r = t.z,
            a = Math.cos(n),
            o = Math.sin(n),
            c = Math.cos(s),
            l = Math.sin(s),
            d = Math.cos(r),
            f = Math.sin(r);
        if (t.order === "XYZ") {
            const p = a * d,
                m = a * f,
                x = o * d,
                _ = o * f;
            e[0] = c * d, e[4] = -c * f, e[8] = l, e[1] = m + x * l, e[5] = p - _ * l, e[9] = -o * c, e[2] = _ - p * l, e[6] = x + m * l, e[10] = a * c
        } else if (t.order === "YXZ") {
            const p = c * d,
                m = c * f,
                x = l * d,
                _ = l * f;
            e[0] = p + _ * o, e[4] = x * o - m, e[8] = a * l, e[1] = a * f, e[5] = a * d, e[9] = -o, e[2] = m * o - x, e[6] = _ + p * o, e[10] = a * c
        } else if (t.order === "ZXY") {
            const p = c * d,
                m = c * f,
                x = l * d,
                _ = l * f;
            e[0] = p - _ * o, e[4] = -a * f, e[8] = x + m * o, e[1] = m + x * o, e[5] = a * d, e[9] = _ - p * o, e[2] = -a * l, e[6] = o, e[10] = a * c
        } else if (t.order === "ZYX") {
            const p = a * d,
                m = a * f,
                x = o * d,
                _ = o * f;
            e[0] = c * d, e[4] = x * l - m, e[8] = p * l + _, e[1] = c * f, e[5] = _ * l + p, e[9] = m * l - x, e[2] = -l, e[6] = o * c, e[10] = a * c
        } else if (t.order === "YZX") {
            const p = a * c,
                m = a * l,
                x = o * c,
                _ = o * l;
            e[0] = c * d, e[4] = _ - p * f, e[8] = x * f + m, e[1] = f, e[5] = a * d, e[9] = -o * d, e[2] = -l * d, e[6] = m * f + x, e[10] = p - _ * f
        } else if (t.order === "XZY") {
            const p = a * c,
                m = a * l,
                x = o * c,
                _ = o * l;
            e[0] = c * d, e[4] = -f, e[8] = l * d, e[1] = p * f + _, e[5] = a * d, e[9] = m * f - x, e[2] = x * f - m, e[6] = o * d, e[10] = _ * f + p
        }
        return e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this
    }
    makeRotationFromQuaternion(t) {
        return this.compose(Vc, t, Wc)
    }
    lookAt(t, e, n) {
        const s = this.elements;
        return De.subVectors(t, e), De.lengthSq() === 0 && (De.z = 1), De.normalize(), mn.crossVectors(n, De), mn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? De.x += 1e-4 : De.z += 1e-4, De.normalize(), mn.crossVectors(n, De)), mn.normalize(), Vi.crossVectors(De, mn), s[0] = mn.x, s[4] = Vi.x, s[8] = De.x, s[1] = mn.y, s[5] = Vi.y, s[9] = De.y, s[2] = mn.z, s[6] = Vi.z, s[10] = De.z, this
    }
    multiply(t) {
        return this.multiplyMatrices(this, t)
    }
    premultiply(t) {
        return this.multiplyMatrices(t, this)
    }
    multiplyMatrices(t, e) {
        const n = t.elements,
            s = e.elements,
            r = this.elements,
            a = n[0],
            o = n[4],
            c = n[8],
            l = n[12],
            d = n[1],
            f = n[5],
            p = n[9],
            m = n[13],
            x = n[2],
            _ = n[6],
            u = n[10],
            h = n[14],
            w = n[3],
            T = n[7],
            E = n[11],
            P = n[15],
            R = s[0],
            b = s[4],
            I = s[8],
            M = s[12],
            S = s[1],
            A = s[5],
            G = s[9],
            O = s[13],
            N = s[2],
            q = s[6],
            V = s[10],
            K = s[14],
            z = s[3],
            st = s[7],
            tt = s[11],
            ft = s[15];
        return r[0] = a * R + o * S + c * N + l * z, r[4] = a * b + o * A + c * q + l * st, r[8] = a * I + o * G + c * V + l * tt, r[12] = a * M + o * O + c * K + l * ft, r[1] = d * R + f * S + p * N + m * z, r[5] = d * b + f * A + p * q + m * st, r[9] = d * I + f * G + p * V + m * tt, r[13] = d * M + f * O + p * K + m * ft, r[2] = x * R + _ * S + u * N + h * z, r[6] = x * b + _ * A + u * q + h * st, r[10] = x * I + _ * G + u * V + h * tt, r[14] = x * M + _ * O + u * K + h * ft, r[3] = w * R + T * S + E * N + P * z, r[7] = w * b + T * A + E * q + P * st, r[11] = w * I + T * G + E * V + P * tt, r[15] = w * M + T * O + E * K + P * ft, this
    }
    multiplyScalar(t) {
        const e = this.elements;
        return e[0] *= t, e[4] *= t, e[8] *= t, e[12] *= t, e[1] *= t, e[5] *= t, e[9] *= t, e[13] *= t, e[2] *= t, e[6] *= t, e[10] *= t, e[14] *= t, e[3] *= t, e[7] *= t, e[11] *= t, e[15] *= t, this
    }
    determinant() {
        const t = this.elements,
            e = t[0],
            n = t[4],
            s = t[8],
            r = t[12],
            a = t[1],
            o = t[5],
            c = t[9],
            l = t[13],
            d = t[2],
            f = t[6],
            p = t[10],
            m = t[14],
            x = t[3],
            _ = t[7],
            u = t[11],
            h = t[15];
        return x * (+r * c * f - s * l * f - r * o * p + n * l * p + s * o * m - n * c * m) + _ * (+e * c * m - e * l * p + r * a * p - s * a * m + s * l * d - r * c * d) + u * (+e * l * f - e * o * m - r * a * f + n * a * m + r * o * d - n * l * d) + h * (-s * o * d - e * c * f + e * o * p + s * a * f - n * a * p + n * c * d)
    }
    transpose() {
        const t = this.elements;
        let e;
        return e = t[1], t[1] = t[4], t[4] = e, e = t[2], t[2] = t[8], t[8] = e, e = t[6], t[6] = t[9], t[9] = e, e = t[3], t[3] = t[12], t[12] = e, e = t[7], t[7] = t[13], t[13] = e, e = t[11], t[11] = t[14], t[14] = e, this
    }
    setPosition(t, e, n) {
        const s = this.elements;
        return t.isVector3 ? (s[12] = t.x, s[13] = t.y, s[14] = t.z) : (s[12] = t, s[13] = e, s[14] = n), this
    }
    invert() {
        const t = this.elements,
            e = t[0],
            n = t[1],
            s = t[2],
            r = t[3],
            a = t[4],
            o = t[5],
            c = t[6],
            l = t[7],
            d = t[8],
            f = t[9],
            p = t[10],
            m = t[11],
            x = t[12],
            _ = t[13],
            u = t[14],
            h = t[15],
            w = f * u * l - _ * p * l + _ * c * m - o * u * m - f * c * h + o * p * h,
            T = x * p * l - d * u * l - x * c * m + a * u * m + d * c * h - a * p * h,
            E = d * _ * l - x * f * l + x * o * m - a * _ * m - d * o * h + a * f * h,
            P = x * f * c - d * _ * c - x * o * p + a * _ * p + d * o * u - a * f * u,
            R = e * w + n * T + s * E + r * P;
        if (R === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        const b = 1 / R;
        return t[0] = w * b, t[1] = (_ * p * r - f * u * r - _ * s * m + n * u * m + f * s * h - n * p * h) * b, t[2] = (o * u * r - _ * c * r + _ * s * l - n * u * l - o * s * h + n * c * h) * b, t[3] = (f * c * r - o * p * r - f * s * l + n * p * l + o * s * m - n * c * m) * b, t[4] = T * b, t[5] = (d * u * r - x * p * r + x * s * m - e * u * m - d * s * h + e * p * h) * b, t[6] = (x * c * r - a * u * r - x * s * l + e * u * l + a * s * h - e * c * h) * b, t[7] = (a * p * r - d * c * r + d * s * l - e * p * l - a * s * m + e * c * m) * b, t[8] = E * b, t[9] = (x * f * r - d * _ * r - x * n * m + e * _ * m + d * n * h - e * f * h) * b, t[10] = (a * _ * r - x * o * r + x * n * l - e * _ * l - a * n * h + e * o * h) * b, t[11] = (d * o * r - a * f * r - d * n * l + e * f * l + a * n * m - e * o * m) * b, t[12] = P * b, t[13] = (d * _ * s - x * f * s + x * n * p - e * _ * p - d * n * u + e * f * u) * b, t[14] = (x * o * s - a * _ * s - x * n * c + e * _ * c + a * n * u - e * o * u) * b, t[15] = (a * f * s - d * o * s + d * n * c - e * f * c - a * n * p + e * o * p) * b, this
    }
    scale(t) {
        const e = this.elements,
            n = t.x,
            s = t.y,
            r = t.z;
        return e[0] *= n, e[4] *= s, e[8] *= r, e[1] *= n, e[5] *= s, e[9] *= r, e[2] *= n, e[6] *= s, e[10] *= r, e[3] *= n, e[7] *= s, e[11] *= r, this
    }
    getMaxScaleOnAxis() {
        const t = this.elements,
            e = t[0] * t[0] + t[1] * t[1] + t[2] * t[2],
            n = t[4] * t[4] + t[5] * t[5] + t[6] * t[6],
            s = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
        return Math.sqrt(Math.max(e, n, s))
    }
    makeTranslation(t, e, n) {
        return t.isVector3 ? this.set(1, 0, 0, t.x, 0, 1, 0, t.y, 0, 0, 1, t.z, 0, 0, 0, 1) : this.set(1, 0, 0, t, 0, 1, 0, e, 0, 0, 1, n, 0, 0, 0, 1), this
    }
    makeRotationX(t) {
        const e = Math.cos(t),
            n = Math.sin(t);
        return this.set(1, 0, 0, 0, 0, e, -n, 0, 0, n, e, 0, 0, 0, 0, 1), this
    }
    makeRotationY(t) {
        const e = Math.cos(t),
            n = Math.sin(t);
        return this.set(e, 0, n, 0, 0, 1, 0, 0, -n, 0, e, 0, 0, 0, 0, 1), this
    }
    makeRotationZ(t) {
        const e = Math.cos(t),
            n = Math.sin(t);
        return this.set(e, -n, 0, 0, n, e, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
    }
    makeRotationAxis(t, e) {
        const n = Math.cos(e),
            s = Math.sin(e),
            r = 1 - n,
            a = t.x,
            o = t.y,
            c = t.z,
            l = r * a,
            d = r * o;
        return this.set(l * a + n, l * o - s * c, l * c + s * o, 0, l * o + s * c, d * o + n, d * c - s * a, 0, l * c - s * o, d * c + s * a, r * c * c + n, 0, 0, 0, 0, 1), this
    }
    makeScale(t, e, n) {
        return this.set(t, 0, 0, 0, 0, e, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this
    }
    makeShear(t, e, n, s, r, a) {
        return this.set(1, n, r, 0, t, 1, a, 0, e, s, 1, 0, 0, 0, 0, 1), this
    }
    compose(t, e, n) {
        const s = this.elements,
            r = e._x,
            a = e._y,
            o = e._z,
            c = e._w,
            l = r + r,
            d = a + a,
            f = o + o,
            p = r * l,
            m = r * d,
            x = r * f,
            _ = a * d,
            u = a * f,
            h = o * f,
            w = c * l,
            T = c * d,
            E = c * f,
            P = n.x,
            R = n.y,
            b = n.z;
        return s[0] = (1 - (_ + h)) * P, s[1] = (m + E) * P, s[2] = (x - T) * P, s[3] = 0, s[4] = (m - E) * R, s[5] = (1 - (p + h)) * R, s[6] = (u + w) * R, s[7] = 0, s[8] = (x + T) * b, s[9] = (u - w) * b, s[10] = (1 - (p + _)) * b, s[11] = 0, s[12] = t.x, s[13] = t.y, s[14] = t.z, s[15] = 1, this
    }
    decompose(t, e, n) {
        const s = this.elements;
        let r = $n.set(s[0], s[1], s[2]).length();
        const a = $n.set(s[4], s[5], s[6]).length(),
            o = $n.set(s[8], s[9], s[10]).length();
        this.determinant() < 0 && (r = -r), t.x = s[12], t.y = s[13], t.z = s[14], ke.copy(this);
        const l = 1 / r,
            d = 1 / a,
            f = 1 / o;
        return ke.elements[0] *= l, ke.elements[1] *= l, ke.elements[2] *= l, ke.elements[4] *= d, ke.elements[5] *= d, ke.elements[6] *= d, ke.elements[8] *= f, ke.elements[9] *= f, ke.elements[10] *= f, e.setFromRotationMatrix(ke), n.x = r, n.y = a, n.z = o, this
    }
    makePerspective(t, e, n, s, r, a, o = $e, c = !1) {
        const l = this.elements,
            d = 2 * r / (e - t),
            f = 2 * r / (n - s),
            p = (e + t) / (e - t),
            m = (n + s) / (n - s);
        let x, _;
        if (c) x = r / (a - r), _ = a * r / (a - r);
        else if (o === $e) x = -(a + r) / (a - r), _ = -2 * a * r / (a - r);
        else if (o === xs) x = -a / (a - r), _ = -a * r / (a - r);
        else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
        return l[0] = d, l[4] = 0, l[8] = p, l[12] = 0, l[1] = 0, l[5] = f, l[9] = m, l[13] = 0, l[2] = 0, l[6] = 0, l[10] = x, l[14] = _, l[3] = 0, l[7] = 0, l[11] = -1, l[15] = 0, this
    }
    makeOrthographic(t, e, n, s, r, a, o = $e, c = !1) {
        const l = this.elements,
            d = 2 / (e - t),
            f = 2 / (n - s),
            p = -(e + t) / (e - t),
            m = -(n + s) / (n - s);
        let x, _;
        if (c) x = 1 / (a - r), _ = a / (a - r);
        else if (o === $e) x = -2 / (a - r), _ = -(a + r) / (a - r);
        else if (o === xs) x = -1 / (a - r), _ = -r / (a - r);
        else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
        return l[0] = d, l[4] = 0, l[8] = 0, l[12] = p, l[1] = 0, l[5] = f, l[9] = 0, l[13] = m, l[2] = 0, l[6] = 0, l[10] = x, l[14] = _, l[3] = 0, l[7] = 0, l[11] = 0, l[15] = 1, this
    }
    equals(t) {
        const e = this.elements,
            n = t.elements;
        for (let s = 0; s < 16; s++)
            if (e[s] !== n[s]) return !1;
        return !0
    }
    fromArray(t, e = 0) {
        for (let n = 0; n < 16; n++) this.elements[n] = t[n + e];
        return this
    }
    toArray(t = [], e = 0) {
        const n = this.elements;
        return t[e] = n[0], t[e + 1] = n[1], t[e + 2] = n[2], t[e + 3] = n[3], t[e + 4] = n[4], t[e + 5] = n[5], t[e + 6] = n[6], t[e + 7] = n[7], t[e + 8] = n[8], t[e + 9] = n[9], t[e + 10] = n[10], t[e + 11] = n[11], t[e + 12] = n[12], t[e + 13] = n[13], t[e + 14] = n[14], t[e + 15] = n[15], t
    }
}
const $n = new F,
    ke = new le,
    Vc = new F(0, 0, 0),
    Wc = new F(1, 1, 1),
    mn = new F,
    Vi = new F,
    De = new F,
    Da = new le,
    La = new zn;
class Qe {
    constructor(t = 0, e = 0, n = 0, s = Qe.DEFAULT_ORDER) {
        this.isEuler = !0, this._x = t, this._y = e, this._z = n, this._order = s
    }
    get x() {
        return this._x
    }
    set x(t) {
        this._x = t, this._onChangeCallback()
    }
    get y() {
        return this._y
    }
    set y(t) {
        this._y = t, this._onChangeCallback()
    }
    get z() {
        return this._z
    }
    set z(t) {
        this._z = t, this._onChangeCallback()
    }
    get order() {
        return this._order
    }
    set order(t) {
        this._order = t, this._onChangeCallback()
    }
    set(t, e, n, s = this._order) {
        return this._x = t, this._y = e, this._z = n, this._order = s, this._onChangeCallback(), this
    }
    clone() {
        return new this.constructor(this._x, this._y, this._z, this._order)
    }
    copy(t) {
        return this._x = t._x, this._y = t._y, this._z = t._z, this._order = t._order, this._onChangeCallback(), this
    }
    setFromRotationMatrix(t, e = this._order, n = !0) {
        const s = t.elements,
            r = s[0],
            a = s[4],
            o = s[8],
            c = s[1],
            l = s[5],
            d = s[9],
            f = s[2],
            p = s[6],
            m = s[10];
        switch (e) {
            case "XYZ":
                this._y = Math.asin(zt(o, -1, 1)), Math.abs(o) < .9999999 ? (this._x = Math.atan2(-d, m), this._z = Math.atan2(-a, r)) : (this._x = Math.atan2(p, l), this._z = 0);
                break;
            case "YXZ":
                this._x = Math.asin(-zt(d, -1, 1)), Math.abs(d) < .9999999 ? (this._y = Math.atan2(o, m), this._z = Math.atan2(c, l)) : (this._y = Math.atan2(-f, r), this._z = 0);
                break;
            case "ZXY":
                this._x = Math.asin(zt(p, -1, 1)), Math.abs(p) < .9999999 ? (this._y = Math.atan2(-f, m), this._z = Math.atan2(-a, l)) : (this._y = 0, this._z = Math.atan2(c, r));
                break;
            case "ZYX":
                this._y = Math.asin(-zt(f, -1, 1)), Math.abs(f) < .9999999 ? (this._x = Math.atan2(p, m), this._z = Math.atan2(c, r)) : (this._x = 0, this._z = Math.atan2(-a, l));
                break;
            case "YZX":
                this._z = Math.asin(zt(c, -1, 1)), Math.abs(c) < .9999999 ? (this._x = Math.atan2(-d, l), this._y = Math.atan2(-f, r)) : (this._x = 0, this._y = Math.atan2(o, m));
                break;
            case "XZY":
                this._z = Math.asin(-zt(a, -1, 1)), Math.abs(a) < .9999999 ? (this._x = Math.atan2(p, l), this._y = Math.atan2(o, r)) : (this._x = Math.atan2(-d, m), this._y = 0);
                break;
            default:
                console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + e)
        }
        return this._order = e, n === !0 && this._onChangeCallback(), this
    }
    setFromQuaternion(t, e, n) {
        return Da.makeRotationFromQuaternion(t), this.setFromRotationMatrix(Da, e, n)
    }
    setFromVector3(t, e = this._order) {
        return this.set(t.x, t.y, t.z, e)
    }
    reorder(t) {
        return La.setFromEuler(this), this.setFromQuaternion(La, t)
    }
    equals(t) {
        return t._x === this._x && t._y === this._y && t._z === this._z && t._order === this._order
    }
    fromArray(t) {
        return this._x = t[0], this._y = t[1], this._z = t[2], t[3] !== void 0 && (this._order = t[3]), this._onChangeCallback(), this
    }
    toArray(t = [], e = 0) {
        return t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._order, t
    }
    _onChange(t) {
        return this._onChangeCallback = t, this
    }
    _onChangeCallback() {}*[Symbol.iterator]() {
        yield this._x, yield this._y, yield this._z, yield this._order
    }
}
Qe.DEFAULT_ORDER = "XYZ";
class oa {
    constructor() {
        this.mask = 1
    }
    set(t) {
        this.mask = (1 << t | 0) >>> 0
    }
    enable(t) {
        this.mask |= 1 << t | 0
    }
    enableAll() {
        this.mask = -1
    }
    toggle(t) {
        this.mask ^= 1 << t | 0
    }
    disable(t) {
        this.mask &= ~(1 << t | 0)
    }
    disableAll() {
        this.mask = 0
    }
    test(t) {
        return (this.mask & t.mask) !== 0
    }
    isEnabled(t) {
        return (this.mask & (1 << t | 0)) !== 0
    }
}
let Xc = 0;
const Ia = new F,
    jn = new zn,
    sn = new le,
    Wi = new F,
    Mi = new F,
    qc = new F,
    Yc = new zn,
    Ua = new F(1, 0, 0),
    Na = new F(0, 1, 0),
    Fa = new F(0, 0, 1),
    Oa = {
        type: "added"
    },
    Kc = {
        type: "removed"
    },
    Zn = {
        type: "childadded",
        child: null
    },
    zs = {
        type: "childremoved",
        child: null
    };
class xe extends Gn {
    constructor() {
        super(), this.isObject3D = !0, Object.defineProperty(this, "id", {
            value: Xc++
        }), this.uuid = Li(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = xe.DEFAULT_UP.clone();
        const t = new F,
            e = new Qe,
            n = new zn,
            s = new F(1, 1, 1);

        function r() {
            n.setFromEuler(e, !1)
        }

        function a() {
            e.setFromQuaternion(n, void 0, !1)
        }
        e._onChange(r), n._onChange(a), Object.defineProperties(this, {
            position: {
                configurable: !0,
                enumerable: !0,
                value: t
            },
            rotation: {
                configurable: !0,
                enumerable: !0,
                value: e
            },
            quaternion: {
                configurable: !0,
                enumerable: !0,
                value: n
            },
            scale: {
                configurable: !0,
                enumerable: !0,
                value: s
            },
            modelViewMatrix: {
                value: new le
            },
            normalMatrix: {
                value: new Ft
            }
        }), this.matrix = new le, this.matrixWorld = new le, this.matrixAutoUpdate = xe.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = xe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new oa, this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.customDepthMaterial = void 0, this.customDistanceMaterial = void 0, this.userData = {}
    }
    onBeforeShadow() {}
    onAfterShadow() {}
    onBeforeRender() {}
    onAfterRender() {}
    applyMatrix4(t) {
        this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(t), this.matrix.decompose(this.position, this.quaternion, this.scale)
    }
    applyQuaternion(t) {
        return this.quaternion.premultiply(t), this
    }
    setRotationFromAxisAngle(t, e) {
        this.quaternion.setFromAxisAngle(t, e)
    }
    setRotationFromEuler(t) {
        this.quaternion.setFromEuler(t, !0)
    }
    setRotationFromMatrix(t) {
        this.quaternion.setFromRotationMatrix(t)
    }
    setRotationFromQuaternion(t) {
        this.quaternion.copy(t)
    }
    rotateOnAxis(t, e) {
        return jn.setFromAxisAngle(t, e), this.quaternion.multiply(jn), this
    }
    rotateOnWorldAxis(t, e) {
        return jn.setFromAxisAngle(t, e), this.quaternion.premultiply(jn), this
    }
    rotateX(t) {
        return this.rotateOnAxis(Ua, t)
    }
    rotateY(t) {
        return this.rotateOnAxis(Na, t)
    }
    rotateZ(t) {
        return this.rotateOnAxis(Fa, t)
    }
    translateOnAxis(t, e) {
        return Ia.copy(t).applyQuaternion(this.quaternion), this.position.add(Ia.multiplyScalar(e)), this
    }
    translateX(t) {
        return this.translateOnAxis(Ua, t)
    }
    translateY(t) {
        return this.translateOnAxis(Na, t)
    }
    translateZ(t) {
        return this.translateOnAxis(Fa, t)
    }
    localToWorld(t) {
        return this.updateWorldMatrix(!0, !1), t.applyMatrix4(this.matrixWorld)
    }
    worldToLocal(t) {
        return this.updateWorldMatrix(!0, !1), t.applyMatrix4(sn.copy(this.matrixWorld).invert())
    }
    lookAt(t, e, n) {
        t.isVector3 ? Wi.copy(t) : Wi.set(t, e, n);
        const s = this.parent;
        this.updateWorldMatrix(!0, !1), Mi.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? sn.lookAt(Mi, Wi, this.up) : sn.lookAt(Wi, Mi, this.up), this.quaternion.setFromRotationMatrix(sn), s && (sn.extractRotation(s.matrixWorld), jn.setFromRotationMatrix(sn), this.quaternion.premultiply(jn.invert()))
    }
    add(t) {
        if (arguments.length > 1) {
            for (let e = 0; e < arguments.length; e++) this.add(arguments[e]);
            return this
        }
        return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(Oa), Zn.child = t, this.dispatchEvent(Zn), Zn.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this)
    }
    remove(t) {
        if (arguments.length > 1) {
            for (let n = 0; n < arguments.length; n++) this.remove(arguments[n]);
            return this
        }
        const e = this.children.indexOf(t);
        return e !== -1 && (t.parent = null, this.children.splice(e, 1), t.dispatchEvent(Kc), zs.child = t, this.dispatchEvent(zs), zs.child = null), this
    }
    removeFromParent() {
        const t = this.parent;
        return t !== null && t.remove(this), this
    }
    clear() {
        return this.remove(...this.children)
    }
    attach(t) {
        return this.updateWorldMatrix(!0, !1), sn.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(!0, !1), sn.multiply(t.parent.matrixWorld)), t.applyMatrix4(sn), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(!1, !0), t.dispatchEvent(Oa), Zn.child = t, this.dispatchEvent(Zn), Zn.child = null, this
    }
    getObjectById(t) {
        return this.getObjectByProperty("id", t)
    }
    getObjectByName(t) {
        return this.getObjectByProperty("name", t)
    }
    getObjectByProperty(t, e) {
        if (this[t] === e) return this;
        for (let n = 0, s = this.children.length; n < s; n++) {
            const a = this.children[n].getObjectByProperty(t, e);
            if (a !== void 0) return a
        }
    }
    getObjectsByProperty(t, e, n = []) {
        this[t] === e && n.push(this);
        const s = this.children;
        for (let r = 0, a = s.length; r < a; r++) s[r].getObjectsByProperty(t, e, n);
        return n
    }
    getWorldPosition(t) {
        return this.updateWorldMatrix(!0, !1), t.setFromMatrixPosition(this.matrixWorld)
    }
    getWorldQuaternion(t) {
        return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Mi, t, qc), t
    }
    getWorldScale(t) {
        return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Mi, Yc, t), t
    }
    getWorldDirection(t) {
        this.updateWorldMatrix(!0, !1);
        const e = this.matrixWorld.elements;
        return t.set(e[8], e[9], e[10]).normalize()
    }
    raycast() {}
    traverse(t) {
        t(this);
        const e = this.children;
        for (let n = 0, s = e.length; n < s; n++) e[n].traverse(t)
    }
    traverseVisible(t) {
        if (this.visible === !1) return;
        t(this);
        const e = this.children;
        for (let n = 0, s = e.length; n < s; n++) e[n].traverseVisible(t)
    }
    traverseAncestors(t) {
        const e = this.parent;
        e !== null && (t(e), e.traverseAncestors(t))
    }
    updateMatrix() {
        this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0
    }
    updateMatrixWorld(t) {
        this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || t) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, t = !0);
        const e = this.children;
        for (let n = 0, s = e.length; n < s; n++) e[n].updateMatrixWorld(t)
    }
    updateWorldMatrix(t, e) {
        const n = this.parent;
        if (t === !0 && n !== null && n.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), e === !0) {
            const s = this.children;
            for (let r = 0, a = s.length; r < a; r++) s[r].updateWorldMatrix(!1, !0)
        }
    }
    toJSON(t) {
        const e = t === void 0 || typeof t == "string",
            n = {};
        e && (t = {
            geometries: {},
            materials: {},
            textures: {},
            images: {},
            shapes: {},
            skeletons: {},
            animations: {},
            nodes: {}
        }, n.metadata = {
            version: 4.7,
            type: "Object",
            generator: "Object3D.toJSON"
        });
        const s = {};
        s.uuid = this.uuid, s.type = this.type, this.name !== "" && (s.name = this.name), this.castShadow === !0 && (s.castShadow = !0), this.receiveShadow === !0 && (s.receiveShadow = !0), this.visible === !1 && (s.visible = !1), this.frustumCulled === !1 && (s.frustumCulled = !1), this.renderOrder !== 0 && (s.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (s.userData = this.userData), s.layers = this.layers.mask, s.matrix = this.matrix.toArray(), s.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (s.matrixAutoUpdate = !1), this.isInstancedMesh && (s.type = "InstancedMesh", s.count = this.count, s.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (s.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (s.type = "BatchedMesh", s.perObjectFrustumCulled = this.perObjectFrustumCulled, s.sortObjects = this.sortObjects, s.drawRanges = this._drawRanges, s.reservedRanges = this._reservedRanges, s.geometryInfo = this._geometryInfo.map(o => ({
            ...o,
            boundingBox: o.boundingBox ? o.boundingBox.toJSON() : void 0,
            boundingSphere: o.boundingSphere ? o.boundingSphere.toJSON() : void 0
        })), s.instanceInfo = this._instanceInfo.map(o => ({
            ...o
        })), s.availableInstanceIds = this._availableInstanceIds.slice(), s.availableGeometryIds = this._availableGeometryIds.slice(), s.nextIndexStart = this._nextIndexStart, s.nextVertexStart = this._nextVertexStart, s.geometryCount = this._geometryCount, s.maxInstanceCount = this._maxInstanceCount, s.maxVertexCount = this._maxVertexCount, s.maxIndexCount = this._maxIndexCount, s.geometryInitialized = this._geometryInitialized, s.matricesTexture = this._matricesTexture.toJSON(t), s.indirectTexture = this._indirectTexture.toJSON(t), this._colorsTexture !== null && (s.colorsTexture = this._colorsTexture.toJSON(t)), this.boundingSphere !== null && (s.boundingSphere = this.boundingSphere.toJSON()), this.boundingBox !== null && (s.boundingBox = this.boundingBox.toJSON()));

        function r(o, c) {
            return o[c.uuid] === void 0 && (o[c.uuid] = c.toJSON(t)), c.uuid
        }
        if (this.isScene) this.background && (this.background.isColor ? s.background = this.background.toJSON() : this.background.isTexture && (s.background = this.background.toJSON(t).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (s.environment = this.environment.toJSON(t).uuid);
        else if (this.isMesh || this.isLine || this.isPoints) {
            s.geometry = r(t.geometries, this.geometry);
            const o = this.geometry.parameters;
            if (o !== void 0 && o.shapes !== void 0) {
                const c = o.shapes;
                if (Array.isArray(c))
                    for (let l = 0, d = c.length; l < d; l++) {
                        const f = c[l];
                        r(t.shapes, f)
                    } else r(t.shapes, c)
            }
        }
        if (this.isSkinnedMesh && (s.bindMode = this.bindMode, s.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (r(t.skeletons, this.skeleton), s.skeleton = this.skeleton.uuid)), this.material !== void 0)
            if (Array.isArray(this.material)) {
                const o = [];
                for (let c = 0, l = this.material.length; c < l; c++) o.push(r(t.materials, this.material[c]));
                s.material = o
            } else s.material = r(t.materials, this.material);
        if (this.children.length > 0) {
            s.children = [];
            for (let o = 0; o < this.children.length; o++) s.children.push(this.children[o].toJSON(t).object)
        }
        if (this.animations.length > 0) {
            s.animations = [];
            for (let o = 0; o < this.animations.length; o++) {
                const c = this.animations[o];
                s.animations.push(r(t.animations, c))
            }
        }
        if (e) {
            const o = a(t.geometries),
                c = a(t.materials),
                l = a(t.textures),
                d = a(t.images),
                f = a(t.shapes),
                p = a(t.skeletons),
                m = a(t.animations),
                x = a(t.nodes);
            o.length > 0 && (n.geometries = o), c.length > 0 && (n.materials = c), l.length > 0 && (n.textures = l), d.length > 0 && (n.images = d), f.length > 0 && (n.shapes = f), p.length > 0 && (n.skeletons = p), m.length > 0 && (n.animations = m), x.length > 0 && (n.nodes = x)
        }
        return n.object = s, n;

        function a(o) {
            const c = [];
            for (const l in o) {
                const d = o[l];
                delete d.metadata, c.push(d)
            }
            return c
        }
    }
    clone(t) {
        return new this.constructor().copy(this, t)
    }
    copy(t, e = !0) {
        if (this.name = t.name, this.up.copy(t.up), this.position.copy(t.position), this.rotation.order = t.rotation.order, this.quaternion.copy(t.quaternion), this.scale.copy(t.scale), this.matrix.copy(t.matrix), this.matrixWorld.copy(t.matrixWorld), this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrixWorldAutoUpdate = t.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate, this.layers.mask = t.layers.mask, this.visible = t.visible, this.castShadow = t.castShadow, this.receiveShadow = t.receiveShadow, this.frustumCulled = t.frustumCulled, this.renderOrder = t.renderOrder, this.animations = t.animations.slice(), this.userData = JSON.parse(JSON.stringify(t.userData)), e === !0)
            for (let n = 0; n < t.children.length; n++) {
                const s = t.children[n];
                this.add(s.clone())
            }
        return this
    }
}
xe.DEFAULT_UP = new F(0, 1, 0);
xe.DEFAULT_MATRIX_AUTO_UPDATE = !0;
xe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const Ge = new F,
    rn = new F,
    Hs = new F,
    an = new F,
    Jn = new F,
    Qn = new F,
    Ba = new F,
    ks = new F,
    Gs = new F,
    Vs = new F,
    Ws = new he,
    Xs = new he,
    qs = new he;
class Be {
    constructor(t = new F, e = new F, n = new F) {
        this.a = t, this.b = e, this.c = n
    }
    static getNormal(t, e, n, s) {
        s.subVectors(n, e), Ge.subVectors(t, e), s.cross(Ge);
        const r = s.lengthSq();
        return r > 0 ? s.multiplyScalar(1 / Math.sqrt(r)) : s.set(0, 0, 0)
    }
    static getBarycoord(t, e, n, s, r) {
        Ge.subVectors(s, e), rn.subVectors(n, e), Hs.subVectors(t, e);
        const a = Ge.dot(Ge),
            o = Ge.dot(rn),
            c = Ge.dot(Hs),
            l = rn.dot(rn),
            d = rn.dot(Hs),
            f = a * l - o * o;
        if (f === 0) return r.set(0, 0, 0), null;
        const p = 1 / f,
            m = (l * c - o * d) * p,
            x = (a * d - o * c) * p;
        return r.set(1 - m - x, x, m)
    }
    static containsPoint(t, e, n, s) {
        return this.getBarycoord(t, e, n, s, an) === null ? !1 : an.x >= 0 && an.y >= 0 && an.x + an.y <= 1
    }
    static getInterpolation(t, e, n, s, r, a, o, c) {
        return this.getBarycoord(t, e, n, s, an) === null ? (c.x = 0, c.y = 0, "z" in c && (c.z = 0), "w" in c && (c.w = 0), null) : (c.setScalar(0), c.addScaledVector(r, an.x), c.addScaledVector(a, an.y), c.addScaledVector(o, an.z), c)
    }
    static getInterpolatedAttribute(t, e, n, s, r, a) {
        return Ws.setScalar(0), Xs.setScalar(0), qs.setScalar(0), Ws.fromBufferAttribute(t, e), Xs.fromBufferAttribute(t, n), qs.fromBufferAttribute(t, s), a.setScalar(0), a.addScaledVector(Ws, r.x), a.addScaledVector(Xs, r.y), a.addScaledVector(qs, r.z), a
    }
    static isFrontFacing(t, e, n, s) {
        return Ge.subVectors(n, e), rn.subVectors(t, e), Ge.cross(rn).dot(s) < 0
    }
    set(t, e, n) {
        return this.a.copy(t), this.b.copy(e), this.c.copy(n), this
    }
    setFromPointsAndIndices(t, e, n, s) {
        return this.a.copy(t[e]), this.b.copy(t[n]), this.c.copy(t[s]), this
    }
    setFromAttributeAndIndices(t, e, n, s) {
        return this.a.fromBufferAttribute(t, e), this.b.fromBufferAttribute(t, n), this.c.fromBufferAttribute(t, s), this
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(t) {
        return this.a.copy(t.a), this.b.copy(t.b), this.c.copy(t.c), this
    }
    getArea() {
        return Ge.subVectors(this.c, this.b), rn.subVectors(this.a, this.b), Ge.cross(rn).length() * .5
    }
    getMidpoint(t) {
        return t.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3)
    }
    getNormal(t) {
        return Be.getNormal(this.a, this.b, this.c, t)
    }
    getPlane(t) {
        return t.setFromCoplanarPoints(this.a, this.b, this.c)
    }
    getBarycoord(t, e) {
        return Be.getBarycoord(t, this.a, this.b, this.c, e)
    }
    getInterpolation(t, e, n, s, r) {
        return Be.getInterpolation(t, this.a, this.b, this.c, e, n, s, r)
    }
    containsPoint(t) {
        return Be.containsPoint(t, this.a, this.b, this.c)
    }
    isFrontFacing(t) {
        return Be.isFrontFacing(this.a, this.b, this.c, t)
    }
    intersectsBox(t) {
        return t.intersectsTriangle(this)
    }
    closestPointToPoint(t, e) {
        const n = this.a,
            s = this.b,
            r = this.c;
        let a, o;
        Jn.subVectors(s, n), Qn.subVectors(r, n), ks.subVectors(t, n);
        const c = Jn.dot(ks),
            l = Qn.dot(ks);
        if (c <= 0 && l <= 0) return e.copy(n);
        Gs.subVectors(t, s);
        const d = Jn.dot(Gs),
            f = Qn.dot(Gs);
        if (d >= 0 && f <= d) return e.copy(s);
        const p = c * f - d * l;
        if (p <= 0 && c >= 0 && d <= 0) return a = c / (c - d), e.copy(n).addScaledVector(Jn, a);
        Vs.subVectors(t, r);
        const m = Jn.dot(Vs),
            x = Qn.dot(Vs);
        if (x >= 0 && m <= x) return e.copy(r);
        const _ = m * l - c * x;
        if (_ <= 0 && l >= 0 && x <= 0) return o = l / (l - x), e.copy(n).addScaledVector(Qn, o);
        const u = d * x - m * f;
        if (u <= 0 && f - d >= 0 && m - x >= 0) return Ba.subVectors(r, s), o = (f - d) / (f - d + (m - x)), e.copy(s).addScaledVector(Ba, o);
        const h = 1 / (u + _ + p);
        return a = _ * h, o = p * h, e.copy(n).addScaledVector(Jn, a).addScaledVector(Qn, o)
    }
    equals(t) {
        return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c)
    }
}
const Yo = {
        aliceblue: 15792383,
        antiquewhite: 16444375,
        aqua: 65535,
        aquamarine: 8388564,
        azure: 15794175,
        beige: 16119260,
        bisque: 16770244,
        black: 0,
        blanchedalmond: 16772045,
        blue: 255,
        blueviolet: 9055202,
        brown: 10824234,
        burlywood: 14596231,
        cadetblue: 6266528,
        chartreuse: 8388352,
        chocolate: 13789470,
        coral: 16744272,
        cornflowerblue: 6591981,
        cornsilk: 16775388,
        crimson: 14423100,
        cyan: 65535,
        darkblue: 139,
        darkcyan: 35723,
        darkgoldenrod: 12092939,
        darkgray: 11119017,
        darkgreen: 25600,
        darkgrey: 11119017,
        darkkhaki: 12433259,
        darkmagenta: 9109643,
        darkolivegreen: 5597999,
        darkorange: 16747520,
        darkorchid: 10040012,
        darkred: 9109504,
        darksalmon: 15308410,
        darkseagreen: 9419919,
        darkslateblue: 4734347,
        darkslategray: 3100495,
        darkslategrey: 3100495,
        darkturquoise: 52945,
        darkviolet: 9699539,
        deeppink: 16716947,
        deepskyblue: 49151,
        dimgray: 6908265,
        dimgrey: 6908265,
        dodgerblue: 2003199,
        firebrick: 11674146,
        floralwhite: 16775920,
        forestgreen: 2263842,
        fuchsia: 16711935,
        gainsboro: 14474460,
        ghostwhite: 16316671,
        gold: 16766720,
        goldenrod: 14329120,
        gray: 8421504,
        green: 32768,
        greenyellow: 11403055,
        grey: 8421504,
        honeydew: 15794160,
        hotpink: 16738740,
        indianred: 13458524,
        indigo: 4915330,
        ivory: 16777200,
        khaki: 15787660,
        lavender: 15132410,
        lavenderblush: 16773365,
        lawngreen: 8190976,
        lemonchiffon: 16775885,
        lightblue: 11393254,
        lightcoral: 15761536,
        lightcyan: 14745599,
        lightgoldenrodyellow: 16448210,
        lightgray: 13882323,
        lightgreen: 9498256,
        lightgrey: 13882323,
        lightpink: 16758465,
        lightsalmon: 16752762,
        lightseagreen: 2142890,
        lightskyblue: 8900346,
        lightslategray: 7833753,
        lightslategrey: 7833753,
        lightsteelblue: 11584734,
        lightyellow: 16777184,
        lime: 65280,
        limegreen: 3329330,
        linen: 16445670,
        magenta: 16711935,
        maroon: 8388608,
        mediumaquamarine: 6737322,
        mediumblue: 205,
        mediumorchid: 12211667,
        mediumpurple: 9662683,
        mediumseagreen: 3978097,
        mediumslateblue: 8087790,
        mediumspringgreen: 64154,
        mediumturquoise: 4772300,
        mediumvioletred: 13047173,
        midnightblue: 1644912,
        mintcream: 16121850,
        mistyrose: 16770273,
        moccasin: 16770229,
        navajowhite: 16768685,
        navy: 128,
        oldlace: 16643558,
        olive: 8421376,
        olivedrab: 7048739,
        orange: 16753920,
        orangered: 16729344,
        orchid: 14315734,
        palegoldenrod: 15657130,
        palegreen: 10025880,
        paleturquoise: 11529966,
        palevioletred: 14381203,
        papayawhip: 16773077,
        peachpuff: 16767673,
        peru: 13468991,
        pink: 16761035,
        plum: 14524637,
        powderblue: 11591910,
        purple: 8388736,
        rebeccapurple: 6697881,
        red: 16711680,
        rosybrown: 12357519,
        royalblue: 4286945,
        saddlebrown: 9127187,
        salmon: 16416882,
        sandybrown: 16032864,
        seagreen: 3050327,
        seashell: 16774638,
        sienna: 10506797,
        silver: 12632256,
        skyblue: 8900331,
        slateblue: 6970061,
        slategray: 7372944,
        slategrey: 7372944,
        snow: 16775930,
        springgreen: 65407,
        steelblue: 4620980,
        tan: 13808780,
        teal: 32896,
        thistle: 14204888,
        tomato: 16737095,
        turquoise: 4251856,
        violet: 15631086,
        wheat: 16113331,
        white: 16777215,
        whitesmoke: 16119285,
        yellow: 16776960,
        yellowgreen: 10145074
    },
    _n = {
        h: 0,
        s: 0,
        l: 0
    },
    Xi = {
        h: 0,
        s: 0,
        l: 0
    };

function Ys(i, t, e) {
    return e < 0 && (e += 1), e > 1 && (e -= 1), e < 1 / 6 ? i + (t - i) * 6 * e : e < 1 / 2 ? t : e < 2 / 3 ? i + (t - i) * 6 * (2 / 3 - e) : i
}
class Ht {
    constructor(t, e, n) {
        return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(t, e, n)
    }
    set(t, e, n) {
        if (e === void 0 && n === void 0) {
            const s = t;
            s && s.isColor ? this.copy(s) : typeof s == "number" ? this.setHex(s) : typeof s == "string" && this.setStyle(s)
        } else this.setRGB(t, e, n);
        return this
    }
    setScalar(t) {
        return this.r = t, this.g = t, this.b = t, this
    }
    setHex(t, e = Ie) {
        return t = Math.floor(t), this.r = (t >> 16 & 255) / 255, this.g = (t >> 8 & 255) / 255, this.b = (t & 255) / 255, Xt.colorSpaceToWorking(this, e), this
    }
    setRGB(t, e, n, s = Xt.workingColorSpace) {
        return this.r = t, this.g = e, this.b = n, Xt.colorSpaceToWorking(this, s), this
    }
    setHSL(t, e, n, s = Xt.workingColorSpace) {
        if (t = Lc(t, 1), e = zt(e, 0, 1), n = zt(n, 0, 1), e === 0) this.r = this.g = this.b = n;
        else {
            const r = n <= .5 ? n * (1 + e) : n + e - n * e,
                a = 2 * n - r;
            this.r = Ys(a, r, t + 1 / 3), this.g = Ys(a, r, t), this.b = Ys(a, r, t - 1 / 3)
        }
        return Xt.colorSpaceToWorking(this, s), this
    }
    setStyle(t, e = Ie) {
        function n(r) {
            r !== void 0 && parseFloat(r) < 1 && console.warn("THREE.Color: Alpha component of " + t + " will be ignored.")
        }
        let s;
        if (s = /^(\w+)\(([^\)]*)\)/.exec(t)) {
            let r;
            const a = s[1],
                o = s[2];
            switch (a) {
                case "rgb":
                case "rgba":
                    if (r = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) return n(r[4]), this.setRGB(Math.min(255, parseInt(r[1], 10)) / 255, Math.min(255, parseInt(r[2], 10)) / 255, Math.min(255, parseInt(r[3], 10)) / 255, e);
                    if (r = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) return n(r[4]), this.setRGB(Math.min(100, parseInt(r[1], 10)) / 100, Math.min(100, parseInt(r[2], 10)) / 100, Math.min(100, parseInt(r[3], 10)) / 100, e);
                    break;
                case "hsl":
                case "hsla":
                    if (r = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) return n(r[4]), this.setHSL(parseFloat(r[1]) / 360, parseFloat(r[2]) / 100, parseFloat(r[3]) / 100, e);
                    break;
                default:
                    console.warn("THREE.Color: Unknown color model " + t)
            }
        } else if (s = /^\#([A-Fa-f\d]+)$/.exec(t)) {
            const r = s[1],
                a = r.length;
            if (a === 3) return this.setRGB(parseInt(r.charAt(0), 16) / 15, parseInt(r.charAt(1), 16) / 15, parseInt(r.charAt(2), 16) / 15, e);
            if (a === 6) return this.setHex(parseInt(r, 16), e);
            console.warn("THREE.Color: Invalid hex color " + t)
        } else if (t && t.length > 0) return this.setColorName(t, e);
        return this
    }
    setColorName(t, e = Ie) {
        const n = Yo[t.toLowerCase()];
        return n !== void 0 ? this.setHex(n, e) : console.warn("THREE.Color: Unknown color " + t), this
    }
    clone() {
        return new this.constructor(this.r, this.g, this.b)
    }
    copy(t) {
        return this.r = t.r, this.g = t.g, this.b = t.b, this
    }
    copySRGBToLinear(t) {
        return this.r = hn(t.r), this.g = hn(t.g), this.b = hn(t.b), this
    }
    copyLinearToSRGB(t) {
        return this.r = li(t.r), this.g = li(t.g), this.b = li(t.b), this
    }
    convertSRGBToLinear() {
        return this.copySRGBToLinear(this), this
    }
    convertLinearToSRGB() {
        return this.copyLinearToSRGB(this), this
    }
    getHex(t = Ie) {
        return Xt.workingToColorSpace(Me.copy(this), t), Math.round(zt(Me.r * 255, 0, 255)) * 65536 + Math.round(zt(Me.g * 255, 0, 255)) * 256 + Math.round(zt(Me.b * 255, 0, 255))
    }
    getHexString(t = Ie) {
        return ("000000" + this.getHex(t).toString(16)).slice(-6)
    }
    getHSL(t, e = Xt.workingColorSpace) {
        Xt.workingToColorSpace(Me.copy(this), e);
        const n = Me.r,
            s = Me.g,
            r = Me.b,
            a = Math.max(n, s, r),
            o = Math.min(n, s, r);
        let c, l;
        const d = (o + a) / 2;
        if (o === a) c = 0, l = 0;
        else {
            const f = a - o;
            switch (l = d <= .5 ? f / (a + o) : f / (2 - a - o), a) {
                case n:
                    c = (s - r) / f + (s < r ? 6 : 0);
                    break;
                case s:
                    c = (r - n) / f + 2;
                    break;
                case r:
                    c = (n - s) / f + 4;
                    break
            }
            c /= 6
        }
        return t.h = c, t.s = l, t.l = d, t
    }
    getRGB(t, e = Xt.workingColorSpace) {
        return Xt.workingToColorSpace(Me.copy(this), e), t.r = Me.r, t.g = Me.g, t.b = Me.b, t
    }
    getStyle(t = Ie) {
        Xt.workingToColorSpace(Me.copy(this), t);
        const e = Me.r,
            n = Me.g,
            s = Me.b;
        return t !== Ie ? `color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})` : `rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`
    }
    offsetHSL(t, e, n) {
        return this.getHSL(_n), this.setHSL(_n.h + t, _n.s + e, _n.l + n)
    }
    add(t) {
        return this.r += t.r, this.g += t.g, this.b += t.b, this
    }
    addColors(t, e) {
        return this.r = t.r + e.r, this.g = t.g + e.g, this.b = t.b + e.b, this
    }
    addScalar(t) {
        return this.r += t, this.g += t, this.b += t, this
    }
    sub(t) {
        return this.r = Math.max(0, this.r - t.r), this.g = Math.max(0, this.g - t.g), this.b = Math.max(0, this.b - t.b), this
    }
    multiply(t) {
        return this.r *= t.r, this.g *= t.g, this.b *= t.b, this
    }
    multiplyScalar(t) {
        return this.r *= t, this.g *= t, this.b *= t, this
    }
    lerp(t, e) {
        return this.r += (t.r - this.r) * e, this.g += (t.g - this.g) * e, this.b += (t.b - this.b) * e, this
    }
    lerpColors(t, e, n) {
        return this.r = t.r + (e.r - t.r) * n, this.g = t.g + (e.g - t.g) * n, this.b = t.b + (e.b - t.b) * n, this
    }
    lerpHSL(t, e) {
        this.getHSL(_n), t.getHSL(Xi);
        const n = Cs(_n.h, Xi.h, e),
            s = Cs(_n.s, Xi.s, e),
            r = Cs(_n.l, Xi.l, e);
        return this.setHSL(n, s, r), this
    }
    setFromVector3(t) {
        return this.r = t.x, this.g = t.y, this.b = t.z, this
    }
    applyMatrix3(t) {
        const e = this.r,
            n = this.g,
            s = this.b,
            r = t.elements;
        return this.r = r[0] * e + r[3] * n + r[6] * s, this.g = r[1] * e + r[4] * n + r[7] * s, this.b = r[2] * e + r[5] * n + r[8] * s, this
    }
    equals(t) {
        return t.r === this.r && t.g === this.g && t.b === this.b
    }
    fromArray(t, e = 0) {
        return this.r = t[e], this.g = t[e + 1], this.b = t[e + 2], this
    }
    toArray(t = [], e = 0) {
        return t[e] = this.r, t[e + 1] = this.g, t[e + 2] = this.b, t
    }
    fromBufferAttribute(t, e) {
        return this.r = t.getX(e), this.g = t.getY(e), this.b = t.getZ(e), this
    }
    toJSON() {
        return this.getHex()
    }*[Symbol.iterator]() {
        yield this.r, yield this.g, yield this.b
    }
}
const Me = new Ht;
Ht.NAMES = Yo;
let $c = 0;
class pi extends Gn {
    constructor() {
        super(), this.isMaterial = !0, Object.defineProperty(this, "id", {
            value: $c++
        }), this.uuid = Li(), this.name = "", this.type = "Material", this.blending = ai, this.side = En, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = lr, this.blendDst = cr, this.blendEquation = In, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Ht(0, 0, 0), this.blendAlpha = 0, this.depthFunc = ci, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = Ta, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = Wn, this.stencilZFail = Wn, this.stencilZPass = Wn, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.allowOverride = !0, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0
    }
    get alphaTest() {
        return this._alphaTest
    }
    set alphaTest(t) {
        this._alphaTest > 0 != t > 0 && this.version++, this._alphaTest = t
    }
    onBeforeRender() {}
    onBeforeCompile() {}
    customProgramCacheKey() {
        return this.onBeforeCompile.toString()
    }
    setValues(t) {
        if (t !== void 0)
            for (const e in t) {
                const n = t[e];
                if (n === void 0) {
                    console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);
                    continue
                }
                const s = this[e];
                if (s === void 0) {
                    console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);
                    continue
                }
                s && s.isColor ? s.set(n) : s && s.isVector3 && n && n.isVector3 ? s.copy(n) : this[e] = n
            }
    }
    toJSON(t) {
        const e = t === void 0 || typeof t == "string";
        e && (t = {
            textures: {},
            images: {}
        });
        const n = {
            metadata: {
                version: 4.7,
                type: "Material",
                generator: "Material.toJSON"
            }
        };
        n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(t).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(t).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(t).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(t).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(t).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(t).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(t).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(t).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(t).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(t).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(t).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(t).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(t).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(t).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(t).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(t).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(t).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(t).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(t).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(t).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(t).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== ai && (n.blending = this.blending), this.side !== En && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== lr && (n.blendSrc = this.blendSrc), this.blendDst !== cr && (n.blendDst = this.blendDst), this.blendEquation !== In && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== ci && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== Ta && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== Wn && (n.stencilFail = this.stencilFail), this.stencilZFail !== Wn && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== Wn && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);

        function s(r) {
            const a = [];
            for (const o in r) {
                const c = r[o];
                delete c.metadata, a.push(c)
            }
            return a
        }
        if (e) {
            const r = s(t.textures),
                a = s(t.images);
            r.length > 0 && (n.textures = r), a.length > 0 && (n.images = a)
        }
        return n
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(t) {
        this.name = t.name, this.blending = t.blending, this.side = t.side, this.vertexColors = t.vertexColors, this.opacity = t.opacity, this.transparent = t.transparent, this.blendSrc = t.blendSrc, this.blendDst = t.blendDst, this.blendEquation = t.blendEquation, this.blendSrcAlpha = t.blendSrcAlpha, this.blendDstAlpha = t.blendDstAlpha, this.blendEquationAlpha = t.blendEquationAlpha, this.blendColor.copy(t.blendColor), this.blendAlpha = t.blendAlpha, this.depthFunc = t.depthFunc, this.depthTest = t.depthTest, this.depthWrite = t.depthWrite, this.stencilWriteMask = t.stencilWriteMask, this.stencilFunc = t.stencilFunc, this.stencilRef = t.stencilRef, this.stencilFuncMask = t.stencilFuncMask, this.stencilFail = t.stencilFail, this.stencilZFail = t.stencilZFail, this.stencilZPass = t.stencilZPass, this.stencilWrite = t.stencilWrite;
        const e = t.clippingPlanes;
        let n = null;
        if (e !== null) {
            const s = e.length;
            n = new Array(s);
            for (let r = 0; r !== s; ++r) n[r] = e[r].clone()
        }
        return this.clippingPlanes = n, this.clipIntersection = t.clipIntersection, this.clipShadows = t.clipShadows, this.shadowSide = t.shadowSide, this.colorWrite = t.colorWrite, this.precision = t.precision, this.polygonOffset = t.polygonOffset, this.polygonOffsetFactor = t.polygonOffsetFactor, this.polygonOffsetUnits = t.polygonOffsetUnits, this.dithering = t.dithering, this.alphaTest = t.alphaTest, this.alphaHash = t.alphaHash, this.alphaToCoverage = t.alphaToCoverage, this.premultipliedAlpha = t.premultipliedAlpha, this.forceSinglePass = t.forceSinglePass, this.visible = t.visible, this.toneMapped = t.toneMapped, this.userData = JSON.parse(JSON.stringify(t.userData)), this
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
    set needsUpdate(t) {
        t === !0 && this.version++
    }
}
class Ko extends pi {
    constructor(t) {
        super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new Ht(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Qe, this.combine = Io, this.reflectivity = 1, this.refractionRatio = .98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(t)
    }
    copy(t) {
        return super.copy(t), this.color.copy(t.color), this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.specularMap = t.specularMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.combine = t.combine, this.reflectivity = t.reflectivity, this.refractionRatio = t.refractionRatio, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.fog = t.fog, this
    }
}
const de = new F,
    qi = new Lt;
let jc = 0;
class je {
    constructor(t, e, n = !1) {
        if (Array.isArray(t)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
        this.isBufferAttribute = !0, Object.defineProperty(this, "id", {
            value: jc++
        }), this.name = "", this.array = t, this.itemSize = e, this.count = t !== void 0 ? t.length / e : 0, this.normalized = n, this.usage = ba, this.updateRanges = [], this.gpuType = ln, this.version = 0
    }
    onUploadCallback() {}
    set needsUpdate(t) {
        t === !0 && this.version++
    }
    setUsage(t) {
        return this.usage = t, this
    }
    addUpdateRange(t, e) {
        this.updateRanges.push({
            start: t,
            count: e
        })
    }
    clearUpdateRanges() {
        this.updateRanges.length = 0
    }
    copy(t) {
        return this.name = t.name, this.array = new t.array.constructor(t.array), this.itemSize = t.itemSize, this.count = t.count, this.normalized = t.normalized, this.usage = t.usage, this.gpuType = t.gpuType, this
    }
    copyAt(t, e, n) {
        t *= this.itemSize, n *= e.itemSize;
        for (let s = 0, r = this.itemSize; s < r; s++) this.array[t + s] = e.array[n + s];
        return this
    }
    copyArray(t) {
        return this.array.set(t), this
    }
    applyMatrix3(t) {
        if (this.itemSize === 2)
            for (let e = 0, n = this.count; e < n; e++) qi.fromBufferAttribute(this, e), qi.applyMatrix3(t), this.setXY(e, qi.x, qi.y);
        else if (this.itemSize === 3)
            for (let e = 0, n = this.count; e < n; e++) de.fromBufferAttribute(this, e), de.applyMatrix3(t), this.setXYZ(e, de.x, de.y, de.z);
        return this
    }
    applyMatrix4(t) {
        for (let e = 0, n = this.count; e < n; e++) de.fromBufferAttribute(this, e), de.applyMatrix4(t), this.setXYZ(e, de.x, de.y, de.z);
        return this
    }
    applyNormalMatrix(t) {
        for (let e = 0, n = this.count; e < n; e++) de.fromBufferAttribute(this, e), de.applyNormalMatrix(t), this.setXYZ(e, de.x, de.y, de.z);
        return this
    }
    transformDirection(t) {
        for (let e = 0, n = this.count; e < n; e++) de.fromBufferAttribute(this, e), de.transformDirection(t), this.setXYZ(e, de.x, de.y, de.z);
        return this
    }
    set(t, e = 0) {
        return this.array.set(t, e), this
    }
    getComponent(t, e) {
        let n = this.array[t * this.itemSize + e];
        return this.normalized && (n = gi(n, this.array)), n
    }
    setComponent(t, e, n) {
        return this.normalized && (n = be(n, this.array)), this.array[t * this.itemSize + e] = n, this
    }
    getX(t) {
        let e = this.array[t * this.itemSize];
        return this.normalized && (e = gi(e, this.array)), e
    }
    setX(t, e) {
        return this.normalized && (e = be(e, this.array)), this.array[t * this.itemSize] = e, this
    }
    getY(t) {
        let e = this.array[t * this.itemSize + 1];
        return this.normalized && (e = gi(e, this.array)), e
    }
    setY(t, e) {
        return this.normalized && (e = be(e, this.array)), this.array[t * this.itemSize + 1] = e, this
    }
    getZ(t) {
        let e = this.array[t * this.itemSize + 2];
        return this.normalized && (e = gi(e, this.array)), e
    }
    setZ(t, e) {
        return this.normalized && (e = be(e, this.array)), this.array[t * this.itemSize + 2] = e, this
    }
    getW(t) {
        let e = this.array[t * this.itemSize + 3];
        return this.normalized && (e = gi(e, this.array)), e
    }
    setW(t, e) {
        return this.normalized && (e = be(e, this.array)), this.array[t * this.itemSize + 3] = e, this
    }
    setXY(t, e, n) {
        return t *= this.itemSize, this.normalized && (e = be(e, this.array), n = be(n, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this
    }
    setXYZ(t, e, n, s) {
        return t *= this.itemSize, this.normalized && (e = be(e, this.array), n = be(n, this.array), s = be(s, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = s, this
    }
    setXYZW(t, e, n, s, r) {
        return t *= this.itemSize, this.normalized && (e = be(e, this.array), n = be(n, this.array), s = be(s, this.array), r = be(r, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = s, this.array[t + 3] = r, this
    }
    onUpload(t) {
        return this.onUploadCallback = t, this
    }
    clone() {
        return new this.constructor(this.array, this.itemSize).copy(this)
    }
    toJSON() {
        const t = {
            itemSize: this.itemSize,
            type: this.array.constructor.name,
            array: Array.from(this.array),
            normalized: this.normalized
        };
        return this.name !== "" && (t.name = this.name), this.usage !== ba && (t.usage = this.usage), t
    }
}
class $o extends je {
    constructor(t, e, n) {
        super(new Uint16Array(t), e, n)
    }
}
class jo extends je {
    constructor(t, e, n) {
        super(new Uint32Array(t), e, n)
    }
}
class Ze extends je {
    constructor(t, e, n) {
        super(new Float32Array(t), e, n)
    }
}
let Zc = 0;
const Fe = new le,
    Ks = new xe,
    ti = new F,
    Le = new Ii,
    Si = new Ii,
    ge = new F;
class un extends Gn {
    constructor() {
        super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", {
            value: Zc++
        }), this.uuid = Li(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
            start: 0,
            count: 1 / 0
        }, this.userData = {}
    }
    getIndex() {
        return this.index
    }
    setIndex(t) {
        return Array.isArray(t) ? this.index = new(Xo(t) ? jo : $o)(t, 1) : this.index = t, this
    }
    setIndirect(t) {
        return this.indirect = t, this
    }
    getIndirect() {
        return this.indirect
    }
    getAttribute(t) {
        return this.attributes[t]
    }
    setAttribute(t, e) {
        return this.attributes[t] = e, this
    }
    deleteAttribute(t) {
        return delete this.attributes[t], this
    }
    hasAttribute(t) {
        return this.attributes[t] !== void 0
    }
    addGroup(t, e, n = 0) {
        this.groups.push({
            start: t,
            count: e,
            materialIndex: n
        })
    }
    clearGroups() {
        this.groups = []
    }
    setDrawRange(t, e) {
        this.drawRange.start = t, this.drawRange.count = e
    }
    applyMatrix4(t) {
        const e = this.attributes.position;
        e !== void 0 && (e.applyMatrix4(t), e.needsUpdate = !0);
        const n = this.attributes.normal;
        if (n !== void 0) {
            const r = new Ft().getNormalMatrix(t);
            n.applyNormalMatrix(r), n.needsUpdate = !0
        }
        const s = this.attributes.tangent;
        return s !== void 0 && (s.transformDirection(t), s.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this
    }
    applyQuaternion(t) {
        return Fe.makeRotationFromQuaternion(t), this.applyMatrix4(Fe), this
    }
    rotateX(t) {
        return Fe.makeRotationX(t), this.applyMatrix4(Fe), this
    }
    rotateY(t) {
        return Fe.makeRotationY(t), this.applyMatrix4(Fe), this
    }
    rotateZ(t) {
        return Fe.makeRotationZ(t), this.applyMatrix4(Fe), this
    }
    translate(t, e, n) {
        return Fe.makeTranslation(t, e, n), this.applyMatrix4(Fe), this
    }
    scale(t, e, n) {
        return Fe.makeScale(t, e, n), this.applyMatrix4(Fe), this
    }
    lookAt(t) {
        return Ks.lookAt(t), Ks.updateMatrix(), this.applyMatrix4(Ks.matrix), this
    }
    center() {
        return this.computeBoundingBox(), this.boundingBox.getCenter(ti).negate(), this.translate(ti.x, ti.y, ti.z), this
    }
    setFromPoints(t) {
        const e = this.getAttribute("position");
        if (e === void 0) {
            const n = [];
            for (let s = 0, r = t.length; s < r; s++) {
                const a = t[s];
                n.push(a.x, a.y, a.z || 0)
            }
            this.setAttribute("position", new Ze(n, 3))
        } else {
            const n = Math.min(t.length, e.count);
            for (let s = 0; s < n; s++) {
                const r = t[s];
                e.setXYZ(s, r.x, r.y, r.z || 0)
            }
            t.length > e.count && console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), e.needsUpdate = !0
        }
        return this
    }
    computeBoundingBox() {
        this.boundingBox === null && (this.boundingBox = new Ii);
        const t = this.attributes.position,
            e = this.morphAttributes.position;
        if (t && t.isGLBufferAttribute) {
            console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new F(-1 / 0, -1 / 0, -1 / 0), new F(1 / 0, 1 / 0, 1 / 0));
            return
        }
        if (t !== void 0) {
            if (this.boundingBox.setFromBufferAttribute(t), e)
                for (let n = 0, s = e.length; n < s; n++) {
                    const r = e[n];
                    Le.setFromBufferAttribute(r), this.morphTargetsRelative ? (ge.addVectors(this.boundingBox.min, Le.min), this.boundingBox.expandByPoint(ge), ge.addVectors(this.boundingBox.max, Le.max), this.boundingBox.expandByPoint(ge)) : (this.boundingBox.expandByPoint(Le.min), this.boundingBox.expandByPoint(Le.max))
                }
        } else this.boundingBox.makeEmpty();
        (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this)
    }
    computeBoundingSphere() {
        this.boundingSphere === null && (this.boundingSphere = new ys);
        const t = this.attributes.position,
            e = this.morphAttributes.position;
        if (t && t.isGLBufferAttribute) {
            console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new F, 1 / 0);
            return
        }
        if (t) {
            const n = this.boundingSphere.center;
            if (Le.setFromBufferAttribute(t), e)
                for (let r = 0, a = e.length; r < a; r++) {
                    const o = e[r];
                    Si.setFromBufferAttribute(o), this.morphTargetsRelative ? (ge.addVectors(Le.min, Si.min), Le.expandByPoint(ge), ge.addVectors(Le.max, Si.max), Le.expandByPoint(ge)) : (Le.expandByPoint(Si.min), Le.expandByPoint(Si.max))
                }
            Le.getCenter(n);
            let s = 0;
            for (let r = 0, a = t.count; r < a; r++) ge.fromBufferAttribute(t, r), s = Math.max(s, n.distanceToSquared(ge));
            if (e)
                for (let r = 0, a = e.length; r < a; r++) {
                    const o = e[r],
                        c = this.morphTargetsRelative;
                    for (let l = 0, d = o.count; l < d; l++) ge.fromBufferAttribute(o, l), c && (ti.fromBufferAttribute(t, l), ge.add(ti)), s = Math.max(s, n.distanceToSquared(ge))
                }
            this.boundingSphere.radius = Math.sqrt(s), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this)
        }
    }
    computeTangents() {
        const t = this.index,
            e = this.attributes;
        if (t === null || e.position === void 0 || e.normal === void 0 || e.uv === void 0) {
            console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
            return
        }
        const n = e.position,
            s = e.normal,
            r = e.uv;
        this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new je(new Float32Array(4 * n.count), 4));
        const a = this.getAttribute("tangent"),
            o = [],
            c = [];
        for (let I = 0; I < n.count; I++) o[I] = new F, c[I] = new F;
        const l = new F,
            d = new F,
            f = new F,
            p = new Lt,
            m = new Lt,
            x = new Lt,
            _ = new F,
            u = new F;

        function h(I, M, S) {
            l.fromBufferAttribute(n, I), d.fromBufferAttribute(n, M), f.fromBufferAttribute(n, S), p.fromBufferAttribute(r, I), m.fromBufferAttribute(r, M), x.fromBufferAttribute(r, S), d.sub(l), f.sub(l), m.sub(p), x.sub(p);
            const A = 1 / (m.x * x.y - x.x * m.y);
            isFinite(A) && (_.copy(d).multiplyScalar(x.y).addScaledVector(f, -m.y).multiplyScalar(A), u.copy(f).multiplyScalar(m.x).addScaledVector(d, -x.x).multiplyScalar(A), o[I].add(_), o[M].add(_), o[S].add(_), c[I].add(u), c[M].add(u), c[S].add(u))
        }
        let w = this.groups;
        w.length === 0 && (w = [{
            start: 0,
            count: t.count
        }]);
        for (let I = 0, M = w.length; I < M; ++I) {
            const S = w[I],
                A = S.start,
                G = S.count;
            for (let O = A, N = A + G; O < N; O += 3) h(t.getX(O + 0), t.getX(O + 1), t.getX(O + 2))
        }
        const T = new F,
            E = new F,
            P = new F,
            R = new F;

        function b(I) {
            P.fromBufferAttribute(s, I), R.copy(P);
            const M = o[I];
            T.copy(M), T.sub(P.multiplyScalar(P.dot(M))).normalize(), E.crossVectors(R, M);
            const A = E.dot(c[I]) < 0 ? -1 : 1;
            a.setXYZW(I, T.x, T.y, T.z, A)
        }
        for (let I = 0, M = w.length; I < M; ++I) {
            const S = w[I],
                A = S.start,
                G = S.count;
            for (let O = A, N = A + G; O < N; O += 3) b(t.getX(O + 0)), b(t.getX(O + 1)), b(t.getX(O + 2))
        }
    }
    computeVertexNormals() {
        const t = this.index,
            e = this.getAttribute("position");
        if (e !== void 0) {
            let n = this.getAttribute("normal");
            if (n === void 0) n = new je(new Float32Array(e.count * 3), 3), this.setAttribute("normal", n);
            else
                for (let p = 0, m = n.count; p < m; p++) n.setXYZ(p, 0, 0, 0);
            const s = new F,
                r = new F,
                a = new F,
                o = new F,
                c = new F,
                l = new F,
                d = new F,
                f = new F;
            if (t)
                for (let p = 0, m = t.count; p < m; p += 3) {
                    const x = t.getX(p + 0),
                        _ = t.getX(p + 1),
                        u = t.getX(p + 2);
                    s.fromBufferAttribute(e, x), r.fromBufferAttribute(e, _), a.fromBufferAttribute(e, u), d.subVectors(a, r), f.subVectors(s, r), d.cross(f), o.fromBufferAttribute(n, x), c.fromBufferAttribute(n, _), l.fromBufferAttribute(n, u), o.add(d), c.add(d), l.add(d), n.setXYZ(x, o.x, o.y, o.z), n.setXYZ(_, c.x, c.y, c.z), n.setXYZ(u, l.x, l.y, l.z)
                } else
                    for (let p = 0, m = e.count; p < m; p += 3) s.fromBufferAttribute(e, p + 0), r.fromBufferAttribute(e, p + 1), a.fromBufferAttribute(e, p + 2), d.subVectors(a, r), f.subVectors(s, r), d.cross(f), n.setXYZ(p + 0, d.x, d.y, d.z), n.setXYZ(p + 1, d.x, d.y, d.z), n.setXYZ(p + 2, d.x, d.y, d.z);
            this.normalizeNormals(), n.needsUpdate = !0
        }
    }
    normalizeNormals() {
        const t = this.attributes.normal;
        for (let e = 0, n = t.count; e < n; e++) ge.fromBufferAttribute(t, e), ge.normalize(), t.setXYZ(e, ge.x, ge.y, ge.z)
    }
    toNonIndexed() {
        function t(o, c) {
            const l = o.array,
                d = o.itemSize,
                f = o.normalized,
                p = new l.constructor(c.length * d);
            let m = 0,
                x = 0;
            for (let _ = 0, u = c.length; _ < u; _++) {
                o.isInterleavedBufferAttribute ? m = c[_] * o.data.stride + o.offset : m = c[_] * d;
                for (let h = 0; h < d; h++) p[x++] = l[m++]
            }
            return new je(p, d, f)
        }
        if (this.index === null) return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
        const e = new un,
            n = this.index.array,
            s = this.attributes;
        for (const o in s) {
            const c = s[o],
                l = t(c, n);
            e.setAttribute(o, l)
        }
        const r = this.morphAttributes;
        for (const o in r) {
            const c = [],
                l = r[o];
            for (let d = 0, f = l.length; d < f; d++) {
                const p = l[d],
                    m = t(p, n);
                c.push(m)
            }
            e.morphAttributes[o] = c
        }
        e.morphTargetsRelative = this.morphTargetsRelative;
        const a = this.groups;
        for (let o = 0, c = a.length; o < c; o++) {
            const l = a[o];
            e.addGroup(l.start, l.count, l.materialIndex)
        }
        return e
    }
    toJSON() {
        const t = {
            metadata: {
                version: 4.7,
                type: "BufferGeometry",
                generator: "BufferGeometry.toJSON"
            }
        };
        if (t.uuid = this.uuid, t.type = this.type, this.name !== "" && (t.name = this.name), Object.keys(this.userData).length > 0 && (t.userData = this.userData), this.parameters !== void 0) {
            const c = this.parameters;
            for (const l in c) c[l] !== void 0 && (t[l] = c[l]);
            return t
        }
        t.data = {
            attributes: {}
        };
        const e = this.index;
        e !== null && (t.data.index = {
            type: e.array.constructor.name,
            array: Array.prototype.slice.call(e.array)
        });
        const n = this.attributes;
        for (const c in n) {
            const l = n[c];
            t.data.attributes[c] = l.toJSON(t.data)
        }
        const s = {};
        let r = !1;
        for (const c in this.morphAttributes) {
            const l = this.morphAttributes[c],
                d = [];
            for (let f = 0, p = l.length; f < p; f++) {
                const m = l[f];
                d.push(m.toJSON(t.data))
            }
            d.length > 0 && (s[c] = d, r = !0)
        }
        r && (t.data.morphAttributes = s, t.data.morphTargetsRelative = this.morphTargetsRelative);
        const a = this.groups;
        a.length > 0 && (t.data.groups = JSON.parse(JSON.stringify(a)));
        const o = this.boundingSphere;
        return o !== null && (t.data.boundingSphere = o.toJSON()), t
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(t) {
        this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
        const e = {};
        this.name = t.name;
        const n = t.index;
        n !== null && this.setIndex(n.clone());
        const s = t.attributes;
        for (const l in s) {
            const d = s[l];
            this.setAttribute(l, d.clone(e))
        }
        const r = t.morphAttributes;
        for (const l in r) {
            const d = [],
                f = r[l];
            for (let p = 0, m = f.length; p < m; p++) d.push(f[p].clone(e));
            this.morphAttributes[l] = d
        }
        this.morphTargetsRelative = t.morphTargetsRelative;
        const a = t.groups;
        for (let l = 0, d = a.length; l < d; l++) {
            const f = a[l];
            this.addGroup(f.start, f.count, f.materialIndex)
        }
        const o = t.boundingBox;
        o !== null && (this.boundingBox = o.clone());
        const c = t.boundingSphere;
        return c !== null && (this.boundingSphere = c.clone()), this.drawRange.start = t.drawRange.start, this.drawRange.count = t.drawRange.count, this.userData = t.userData, this
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
}
const za = new le,
    Rn = new Ts,
    Yi = new ys,
    Ha = new F,
    Ki = new F,
    $i = new F,
    ji = new F,
    $s = new F,
    Zi = new F,
    ka = new F,
    Ji = new F;
class ze extends xe {
    constructor(t = new un, e = new Ko) {
        super(), this.isMesh = !0, this.type = "Mesh", this.geometry = t, this.material = e, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.count = 1, this.updateMorphTargets()
    }
    copy(t, e) {
        return super.copy(t, e), t.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = t.morphTargetInfluences.slice()), t.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, t.morphTargetDictionary)), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this
    }
    updateMorphTargets() {
        const e = this.geometry.morphAttributes,
            n = Object.keys(e);
        if (n.length > 0) {
            const s = e[n[0]];
            if (s !== void 0) {
                this.morphTargetInfluences = [], this.morphTargetDictionary = {};
                for (let r = 0, a = s.length; r < a; r++) {
                    const o = s[r].name || String(r);
                    this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r
                }
            }
        }
    }
    getVertexPosition(t, e) {
        const n = this.geometry,
            s = n.attributes.position,
            r = n.morphAttributes.position,
            a = n.morphTargetsRelative;
        e.fromBufferAttribute(s, t);
        const o = this.morphTargetInfluences;
        if (r && o) {
            Zi.set(0, 0, 0);
            for (let c = 0, l = r.length; c < l; c++) {
                const d = o[c],
                    f = r[c];
                d !== 0 && ($s.fromBufferAttribute(f, t), a ? Zi.addScaledVector($s, d) : Zi.addScaledVector($s.sub(e), d))
            }
            e.add(Zi)
        }
        return e
    }
    raycast(t, e) {
        const n = this.geometry,
            s = this.material,
            r = this.matrixWorld;
        s !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), Yi.copy(n.boundingSphere), Yi.applyMatrix4(r), Rn.copy(t.ray).recast(t.near), !(Yi.containsPoint(Rn.origin) === !1 && (Rn.intersectSphere(Yi, Ha) === null || Rn.origin.distanceToSquared(Ha) > (t.far - t.near) ** 2)) && (za.copy(r).invert(), Rn.copy(t.ray).applyMatrix4(za), !(n.boundingBox !== null && Rn.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(t, e, Rn)))
    }
    _computeIntersections(t, e, n) {
        let s;
        const r = this.geometry,
            a = this.material,
            o = r.index,
            c = r.attributes.position,
            l = r.attributes.uv,
            d = r.attributes.uv1,
            f = r.attributes.normal,
            p = r.groups,
            m = r.drawRange;
        if (o !== null)
            if (Array.isArray(a))
                for (let x = 0, _ = p.length; x < _; x++) {
                    const u = p[x],
                        h = a[u.materialIndex],
                        w = Math.max(u.start, m.start),
                        T = Math.min(o.count, Math.min(u.start + u.count, m.start + m.count));
                    for (let E = w, P = T; E < P; E += 3) {
                        const R = o.getX(E),
                            b = o.getX(E + 1),
                            I = o.getX(E + 2);
                        s = Qi(this, h, t, n, l, d, f, R, b, I), s && (s.faceIndex = Math.floor(E / 3), s.face.materialIndex = u.materialIndex, e.push(s))
                    }
                } else {
                    const x = Math.max(0, m.start),
                        _ = Math.min(o.count, m.start + m.count);
                    for (let u = x, h = _; u < h; u += 3) {
                        const w = o.getX(u),
                            T = o.getX(u + 1),
                            E = o.getX(u + 2);
                        s = Qi(this, a, t, n, l, d, f, w, T, E), s && (s.faceIndex = Math.floor(u / 3), e.push(s))
                    }
                } else if (c !== void 0)
                    if (Array.isArray(a))
                        for (let x = 0, _ = p.length; x < _; x++) {
                            const u = p[x],
                                h = a[u.materialIndex],
                                w = Math.max(u.start, m.start),
                                T = Math.min(c.count, Math.min(u.start + u.count, m.start + m.count));
                            for (let E = w, P = T; E < P; E += 3) {
                                const R = E,
                                    b = E + 1,
                                    I = E + 2;
                                s = Qi(this, h, t, n, l, d, f, R, b, I), s && (s.faceIndex = Math.floor(E / 3), s.face.materialIndex = u.materialIndex, e.push(s))
                            }
                        } else {
                            const x = Math.max(0, m.start),
                                _ = Math.min(c.count, m.start + m.count);
                            for (let u = x, h = _; u < h; u += 3) {
                                const w = u,
                                    T = u + 1,
                                    E = u + 2;
                                s = Qi(this, a, t, n, l, d, f, w, T, E), s && (s.faceIndex = Math.floor(u / 3), e.push(s))
                            }
                        }
    }
}

function Jc(i, t, e, n, s, r, a, o) {
    let c;
    if (t.side === we ? c = n.intersectTriangle(a, r, s, !0, o) : c = n.intersectTriangle(s, r, a, t.side === En, o), c === null) return null;
    Ji.copy(o), Ji.applyMatrix4(i.matrixWorld);
    const l = e.ray.origin.distanceTo(Ji);
    return l < e.near || l > e.far ? null : {
        distance: l,
        point: Ji.clone(),
        object: i
    }
}

function Qi(i, t, e, n, s, r, a, o, c, l) {
    i.getVertexPosition(o, Ki), i.getVertexPosition(c, $i), i.getVertexPosition(l, ji);
    const d = Jc(i, t, e, n, Ki, $i, ji, ka);
    if (d) {
        const f = new F;
        Be.getBarycoord(ka, Ki, $i, ji, f), s && (d.uv = Be.getInterpolatedAttribute(s, o, c, l, f, new Lt)), r && (d.uv1 = Be.getInterpolatedAttribute(r, o, c, l, f, new Lt)), a && (d.normal = Be.getInterpolatedAttribute(a, o, c, l, f, new F), d.normal.dot(n.direction) > 0 && d.normal.multiplyScalar(-1));
        const p = {
            a: o,
            b: c,
            c: l,
            normal: new F,
            materialIndex: 0
        };
        Be.getNormal(Ki, $i, ji, p.normal), d.face = p, d.barycoord = f
    }
    return d
}
class kn extends un {
    constructor(t = 1, e = 1, n = 1, s = 1, r = 1, a = 1) {
        super(), this.type = "BoxGeometry", this.parameters = {
            width: t,
            height: e,
            depth: n,
            widthSegments: s,
            heightSegments: r,
            depthSegments: a
        };
        const o = this;
        s = Math.floor(s), r = Math.floor(r), a = Math.floor(a);
        const c = [],
            l = [],
            d = [],
            f = [];
        let p = 0,
            m = 0;
        x("z", "y", "x", -1, -1, n, e, t, a, r, 0), x("z", "y", "x", 1, -1, n, e, -t, a, r, 1), x("x", "z", "y", 1, 1, t, n, e, s, a, 2), x("x", "z", "y", 1, -1, t, n, -e, s, a, 3), x("x", "y", "z", 1, -1, t, e, n, s, r, 4), x("x", "y", "z", -1, -1, t, e, -n, s, r, 5), this.setIndex(c), this.setAttribute("position", new Ze(l, 3)), this.setAttribute("normal", new Ze(d, 3)), this.setAttribute("uv", new Ze(f, 2));

        function x(_, u, h, w, T, E, P, R, b, I, M) {
            const S = E / b,
                A = P / I,
                G = E / 2,
                O = P / 2,
                N = R / 2,
                q = b + 1,
                V = I + 1;
            let K = 0,
                z = 0;
            const st = new F;
            for (let tt = 0; tt < V; tt++) {
                const ft = tt * A - O;
                for (let Ut = 0; Ut < q; Ut++) {
                    const $t = Ut * S - G;
                    st[_] = $t * w, st[u] = ft * T, st[h] = N, l.push(st.x, st.y, st.z), st[_] = 0, st[u] = 0, st[h] = R > 0 ? 1 : -1, d.push(st.x, st.y, st.z), f.push(Ut / b), f.push(1 - tt / I), K += 1
                }
            }
            for (let tt = 0; tt < I; tt++)
                for (let ft = 0; ft < b; ft++) {
                    const Ut = p + ft + q * tt,
                        $t = p + ft + q * (tt + 1),
                        Yt = p + (ft + 1) + q * (tt + 1),
                        X = p + (ft + 1) + q * tt;
                    c.push(Ut, $t, X), c.push($t, Yt, X), z += 6
                }
            o.addGroup(m, z, M), m += z, p += K
        }
    }
    copy(t) {
        return super.copy(t), this.parameters = Object.assign({}, t.parameters), this
    }
    static fromJSON(t) {
        return new kn(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments)
    }
}

function fi(i) {
    const t = {};
    for (const e in i) {
        t[e] = {};
        for (const n in i[e]) {
            const s = i[e][n];
            s && (s.isColor || s.isMatrix3 || s.isMatrix4 || s.isVector2 || s.isVector3 || s.isVector4 || s.isTexture || s.isQuaternion) ? s.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), t[e][n] = null) : t[e][n] = s.clone() : Array.isArray(s) ? t[e][n] = s.slice() : t[e][n] = s
        }
    }
    return t
}

function ye(i) {
    const t = {};
    for (let e = 0; e < i.length; e++) {
        const n = fi(i[e]);
        for (const s in n) t[s] = n[s]
    }
    return t
}

function Qc(i) {
    const t = [];
    for (let e = 0; e < i.length; e++) t.push(i[e].clone());
    return t
}

function Zo(i) {
    const t = i.getRenderTarget();
    return t === null ? i.outputColorSpace : t.isXRRenderTarget === !0 ? t.texture.colorSpace : Xt.workingColorSpace
}
const th = {
    clone: fi,
    merge: ye
};
var eh = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
    nh = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class yn extends pi {
    constructor(t) {
        super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = eh, this.fragmentShader = nh, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
            clipCullDistance: !1,
            multiDraw: !1
        }, this.defaultAttributeValues = {
            color: [1, 1, 1],
            uv: [0, 0],
            uv1: [0, 0]
        }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, t !== void 0 && this.setValues(t)
    }
    copy(t) {
        return super.copy(t), this.fragmentShader = t.fragmentShader, this.vertexShader = t.vertexShader, this.uniforms = fi(t.uniforms), this.uniformsGroups = Qc(t.uniformsGroups), this.defines = Object.assign({}, t.defines), this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.fog = t.fog, this.lights = t.lights, this.clipping = t.clipping, this.extensions = Object.assign({}, t.extensions), this.glslVersion = t.glslVersion, this
    }
    toJSON(t) {
        const e = super.toJSON(t);
        e.glslVersion = this.glslVersion, e.uniforms = {};
        for (const s in this.uniforms) {
            const a = this.uniforms[s].value;
            a && a.isTexture ? e.uniforms[s] = {
                type: "t",
                value: a.toJSON(t).uuid
            } : a && a.isColor ? e.uniforms[s] = {
                type: "c",
                value: a.getHex()
            } : a && a.isVector2 ? e.uniforms[s] = {
                type: "v2",
                value: a.toArray()
            } : a && a.isVector3 ? e.uniforms[s] = {
                type: "v3",
                value: a.toArray()
            } : a && a.isVector4 ? e.uniforms[s] = {
                type: "v4",
                value: a.toArray()
            } : a && a.isMatrix3 ? e.uniforms[s] = {
                type: "m3",
                value: a.toArray()
            } : a && a.isMatrix4 ? e.uniforms[s] = {
                type: "m4",
                value: a.toArray()
            } : e.uniforms[s] = {
                value: a
            }
        }
        Object.keys(this.defines).length > 0 && (e.defines = this.defines), e.vertexShader = this.vertexShader, e.fragmentShader = this.fragmentShader, e.lights = this.lights, e.clipping = this.clipping;
        const n = {};
        for (const s in this.extensions) this.extensions[s] === !0 && (n[s] = !0);
        return Object.keys(n).length > 0 && (e.extensions = n), e
    }
}
class Jo extends xe {
    constructor() {
        super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new le, this.projectionMatrix = new le, this.projectionMatrixInverse = new le, this.coordinateSystem = $e, this._reversedDepth = !1
    }
    get reversedDepth() {
        return this._reversedDepth
    }
    copy(t, e) {
        return super.copy(t, e), this.matrixWorldInverse.copy(t.matrixWorldInverse), this.projectionMatrix.copy(t.projectionMatrix), this.projectionMatrixInverse.copy(t.projectionMatrixInverse), this.coordinateSystem = t.coordinateSystem, this
    }
    getWorldDirection(t) {
        return super.getWorldDirection(t).negate()
    }
    updateMatrixWorld(t) {
        super.updateMatrixWorld(t), this.matrixWorldInverse.copy(this.matrixWorld).invert()
    }
    updateWorldMatrix(t, e) {
        super.updateWorldMatrix(t, e), this.matrixWorldInverse.copy(this.matrixWorld).invert()
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
const gn = new F,
    Ga = new Lt,
    Va = new Lt;
class Oe extends Jo {
    constructor(t = 50, e = 1, n = .1, s = 2e3) {
        super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = t, this.zoom = 1, this.near = n, this.far = s, this.focus = 10, this.aspect = e, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix()
    }
    copy(t, e) {
        return super.copy(t, e), this.fov = t.fov, this.zoom = t.zoom, this.near = t.near, this.far = t.far, this.focus = t.focus, this.aspect = t.aspect, this.view = t.view === null ? null : Object.assign({}, t.view), this.filmGauge = t.filmGauge, this.filmOffset = t.filmOffset, this
    }
    setFocalLength(t) {
        const e = .5 * this.getFilmHeight() / t;
        this.fov = Yr * 2 * Math.atan(e), this.updateProjectionMatrix()
    }
    getFocalLength() {
        const t = Math.tan(Ai * .5 * this.fov);
        return .5 * this.getFilmHeight() / t
    }
    getEffectiveFOV() {
        return Yr * 2 * Math.atan(Math.tan(Ai * .5 * this.fov) / this.zoom)
    }
    getFilmWidth() {
        return this.filmGauge * Math.min(this.aspect, 1)
    }
    getFilmHeight() {
        return this.filmGauge / Math.max(this.aspect, 1)
    }
    getViewBounds(t, e, n) {
        gn.set(-1, -1, .5).applyMatrix4(this.projectionMatrixInverse), e.set(gn.x, gn.y).multiplyScalar(-t / gn.z), gn.set(1, 1, .5).applyMatrix4(this.projectionMatrixInverse), n.set(gn.x, gn.y).multiplyScalar(-t / gn.z)
    }
    getViewSize(t, e) {
        return this.getViewBounds(t, Ga, Va), e.subVectors(Va, Ga)
    }
    setViewOffset(t, e, n, s, r, a) {
        this.aspect = t / e, this.view === null && (this.view = {
            enabled: !0,
            fullWidth: 1,
            fullHeight: 1,
            offsetX: 0,
            offsetY: 0,
            width: 1,
            height: 1
        }), this.view.enabled = !0, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = n, this.view.offsetY = s, this.view.width = r, this.view.height = a, this.updateProjectionMatrix()
    }
    clearViewOffset() {
        this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix()
    }
    updateProjectionMatrix() {
        const t = this.near;
        let e = t * Math.tan(Ai * .5 * this.fov) / this.zoom,
            n = 2 * e,
            s = this.aspect * n,
            r = -.5 * s;
        const a = this.view;
        if (this.view !== null && this.view.enabled) {
            const c = a.fullWidth,
                l = a.fullHeight;
            r += a.offsetX * s / c, e -= a.offsetY * n / l, s *= a.width / c, n *= a.height / l
        }
        const o = this.filmOffset;
        o !== 0 && (r += t * o / this.getFilmWidth()), this.projectionMatrix.makePerspective(r, r + s, e, e - n, t, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert()
    }
    toJSON(t) {
        const e = super.toJSON(t);
        return e.object.fov = this.fov, e.object.zoom = this.zoom, e.object.near = this.near, e.object.far = this.far, e.object.focus = this.focus, e.object.aspect = this.aspect, this.view !== null && (e.object.view = Object.assign({}, this.view)), e.object.filmGauge = this.filmGauge, e.object.filmOffset = this.filmOffset, e
    }
}
const ei = -90,
    ni = 1;
class ih extends xe {
    constructor(t, e, n) {
        super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
        const s = new Oe(ei, ni, t, e);
        s.layers = this.layers, this.add(s);
        const r = new Oe(ei, ni, t, e);
        r.layers = this.layers, this.add(r);
        const a = new Oe(ei, ni, t, e);
        a.layers = this.layers, this.add(a);
        const o = new Oe(ei, ni, t, e);
        o.layers = this.layers, this.add(o);
        const c = new Oe(ei, ni, t, e);
        c.layers = this.layers, this.add(c);
        const l = new Oe(ei, ni, t, e);
        l.layers = this.layers, this.add(l)
    }
    updateCoordinateSystem() {
        const t = this.coordinateSystem,
            e = this.children.concat(),
            [n, s, r, a, o, c] = e;
        for (const l of e) this.remove(l);
        if (t === $e) n.up.set(0, 1, 0), n.lookAt(1, 0, 0), s.up.set(0, 1, 0), s.lookAt(-1, 0, 0), r.up.set(0, 0, -1), r.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), c.up.set(0, 1, 0), c.lookAt(0, 0, -1);
        else if (t === xs) n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), s.up.set(0, -1, 0), s.lookAt(1, 0, 0), r.up.set(0, 0, 1), r.lookAt(0, 1, 0), a.up.set(0, 0, -1), a.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), c.up.set(0, -1, 0), c.lookAt(0, 0, -1);
        else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + t);
        for (const l of e) this.add(l), l.updateMatrixWorld()
    }
    update(t, e) {
        this.parent === null && this.updateMatrixWorld();
        const {
            renderTarget: n,
            activeMipmapLevel: s
        } = this;
        this.coordinateSystem !== t.coordinateSystem && (this.coordinateSystem = t.coordinateSystem, this.updateCoordinateSystem());
        const [r, a, o, c, l, d] = this.children, f = t.getRenderTarget(), p = t.getActiveCubeFace(), m = t.getActiveMipmapLevel(), x = t.xr.enabled;
        t.xr.enabled = !1;
        const _ = n.texture.generateMipmaps;
        n.texture.generateMipmaps = !1, t.setRenderTarget(n, 0, s), t.render(e, r), t.setRenderTarget(n, 1, s), t.render(e, a), t.setRenderTarget(n, 2, s), t.render(e, o), t.setRenderTarget(n, 3, s), t.render(e, c), t.setRenderTarget(n, 4, s), t.render(e, l), n.texture.generateMipmaps = _, t.setRenderTarget(n, 5, s), t.render(e, d), t.setRenderTarget(f, p, m), t.xr.enabled = x, n.texture.needsPMREMUpdate = !0
    }
}
class Qo extends Re {
    constructor(t = [], e = hi, n, s, r, a, o, c, l, d) {
        super(t, e, n, s, r, a, o, c, l, d), this.isCubeTexture = !0, this.flipY = !1
    }
    get images() {
        return this.image
    }
    set images(t) {
        this.image = t
    }
}
class sh extends Hn {
    constructor(t = 1, e = {}) {
        super(t, t, e), this.isWebGLCubeRenderTarget = !0;
        const n = {
                width: t,
                height: t,
                depth: 1
            },
            s = [n, n, n, n, n, n];
        this.texture = new Qo(s), this._setTextureOptions(e), this.texture.isRenderTargetTexture = !0
    }
    fromEquirectangularTexture(t, e) {
        this.texture.type = e.type, this.texture.colorSpace = e.colorSpace, this.texture.generateMipmaps = e.generateMipmaps, this.texture.minFilter = e.minFilter, this.texture.magFilter = e.magFilter;
        const n = {
                uniforms: {
                    tEquirect: {
                        value: null
                    }
                },
                vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,
                fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
            },
            s = new kn(5, 5, 5),
            r = new yn({
                name: "CubemapFromEquirect",
                uniforms: fi(n.uniforms),
                vertexShader: n.vertexShader,
                fragmentShader: n.fragmentShader,
                side: we,
                blending: Mn
            });
        r.uniforms.tEquirect.value = e;
        const a = new ze(s, r),
            o = e.minFilter;
        return e.minFilter === On && (e.minFilter = Ke), new ih(1, 10, this).update(t, a), e.minFilter = o, a.geometry.dispose(), a.material.dispose(), this
    }
    clear(t, e = !0, n = !0, s = !0) {
        const r = t.getRenderTarget();
        for (let a = 0; a < 6; a++) t.setRenderTarget(this, a), t.clear(e, n, s);
        t.setRenderTarget(r)
    }
}
class yi extends xe {
    constructor() {
        super(), this.isGroup = !0, this.type = "Group"
    }
}
const rh = {
    type: "move"
};
class js {
    constructor() {
        this._targetRay = null, this._grip = null, this._hand = null
    }
    getHandSpace() {
        return this._hand === null && (this._hand = new yi, this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = {
            pinching: !1
        }), this._hand
    }
    getTargetRaySpace() {
        return this._targetRay === null && (this._targetRay = new yi, this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new F, this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new F), this._targetRay
    }
    getGripSpace() {
        return this._grip === null && (this._grip = new yi, this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new F, this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new F), this._grip
    }
    dispatchEvent(t) {
        return this._targetRay !== null && this._targetRay.dispatchEvent(t), this._grip !== null && this._grip.dispatchEvent(t), this._hand !== null && this._hand.dispatchEvent(t), this
    }
    connect(t) {
        if (t && t.hand) {
            const e = this._hand;
            if (e)
                for (const n of t.hand.values()) this._getHandJoint(e, n)
        }
        return this.dispatchEvent({
            type: "connected",
            data: t
        }), this
    }
    disconnect(t) {
        return this.dispatchEvent({
            type: "disconnected",
            data: t
        }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this
    }
    update(t, e, n) {
        let s = null,
            r = null,
            a = null;
        const o = this._targetRay,
            c = this._grip,
            l = this._hand;
        if (t && e.session.visibilityState !== "visible-blurred") {
            if (l && t.hand) {
                a = !0;
                for (const _ of t.hand.values()) {
                    const u = e.getJointPose(_, n),
                        h = this._getHandJoint(l, _);
                    u !== null && (h.matrix.fromArray(u.transform.matrix), h.matrix.decompose(h.position, h.rotation, h.scale), h.matrixWorldNeedsUpdate = !0, h.jointRadius = u.radius), h.visible = u !== null
                }
                const d = l.joints["index-finger-tip"],
                    f = l.joints["thumb-tip"],
                    p = d.position.distanceTo(f.position),
                    m = .02,
                    x = .005;
                l.inputState.pinching && p > m + x ? (l.inputState.pinching = !1, this.dispatchEvent({
                    type: "pinchend",
                    handedness: t.handedness,
                    target: this
                })) : !l.inputState.pinching && p <= m - x && (l.inputState.pinching = !0, this.dispatchEvent({
                    type: "pinchstart",
                    handedness: t.handedness,
                    target: this
                }))
            } else c !== null && t.gripSpace && (r = e.getPose(t.gripSpace, n), r !== null && (c.matrix.fromArray(r.transform.matrix), c.matrix.decompose(c.position, c.rotation, c.scale), c.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (c.hasLinearVelocity = !0, c.linearVelocity.copy(r.linearVelocity)) : c.hasLinearVelocity = !1, r.angularVelocity ? (c.hasAngularVelocity = !0, c.angularVelocity.copy(r.angularVelocity)) : c.hasAngularVelocity = !1));
            o !== null && (s = e.getPose(t.targetRaySpace, n), s === null && r !== null && (s = r), s !== null && (o.matrix.fromArray(s.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, s.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(s.linearVelocity)) : o.hasLinearVelocity = !1, s.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(s.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(rh)))
        }
        return o !== null && (o.visible = s !== null), c !== null && (c.visible = r !== null), l !== null && (l.visible = a !== null), this
    }
    _getHandJoint(t, e) {
        if (t.joints[e.jointName] === void 0) {
            const n = new yi;
            n.matrixAutoUpdate = !1, n.visible = !1, t.joints[e.jointName] = n, t.add(n)
        }
        return t.joints[e.jointName]
    }
}
class ah extends xe {
    constructor() {
        super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new Qe, this.environmentIntensity = 1, this.environmentRotation = new Qe, this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
            detail: this
        }))
    }
    copy(t, e) {
        return super.copy(t, e), t.background !== null && (this.background = t.background.clone()), t.environment !== null && (this.environment = t.environment.clone()), t.fog !== null && (this.fog = t.fog.clone()), this.backgroundBlurriness = t.backgroundBlurriness, this.backgroundIntensity = t.backgroundIntensity, this.backgroundRotation.copy(t.backgroundRotation), this.environmentIntensity = t.environmentIntensity, this.environmentRotation.copy(t.environmentRotation), t.overrideMaterial !== null && (this.overrideMaterial = t.overrideMaterial.clone()), this.matrixAutoUpdate = t.matrixAutoUpdate, this
    }
    toJSON(t) {
        const e = super.toJSON(t);
        return this.fog !== null && (e.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (e.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (e.object.backgroundIntensity = this.backgroundIntensity), e.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (e.object.environmentIntensity = this.environmentIntensity), e.object.environmentRotation = this.environmentRotation.toArray(), e
    }
}
const Zs = new F,
    oh = new F,
    lh = new Ft;
class xn {
    constructor(t = new F(1, 0, 0), e = 0) {
        this.isPlane = !0, this.normal = t, this.constant = e
    }
    set(t, e) {
        return this.normal.copy(t), this.constant = e, this
    }
    setComponents(t, e, n, s) {
        return this.normal.set(t, e, n), this.constant = s, this
    }
    setFromNormalAndCoplanarPoint(t, e) {
        return this.normal.copy(t), this.constant = -e.dot(this.normal), this
    }
    setFromCoplanarPoints(t, e, n) {
        const s = Zs.subVectors(n, e).cross(oh.subVectors(t, e)).normalize();
        return this.setFromNormalAndCoplanarPoint(s, t), this
    }
    copy(t) {
        return this.normal.copy(t.normal), this.constant = t.constant, this
    }
    normalize() {
        const t = 1 / this.normal.length();
        return this.normal.multiplyScalar(t), this.constant *= t, this
    }
    negate() {
        return this.constant *= -1, this.normal.negate(), this
    }
    distanceToPoint(t) {
        return this.normal.dot(t) + this.constant
    }
    distanceToSphere(t) {
        return this.distanceToPoint(t.center) - t.radius
    }
    projectPoint(t, e) {
        return e.copy(t).addScaledVector(this.normal, -this.distanceToPoint(t))
    }
    intersectLine(t, e) {
        const n = t.delta(Zs),
            s = this.normal.dot(n);
        if (s === 0) return this.distanceToPoint(t.start) === 0 ? e.copy(t.start) : null;
        const r = -(t.start.dot(this.normal) + this.constant) / s;
        return r < 0 || r > 1 ? null : e.copy(t.start).addScaledVector(n, r)
    }
    intersectsLine(t) {
        const e = this.distanceToPoint(t.start),
            n = this.distanceToPoint(t.end);
        return e < 0 && n > 0 || n < 0 && e > 0
    }
    intersectsBox(t) {
        return t.intersectsPlane(this)
    }
    intersectsSphere(t) {
        return t.intersectsPlane(this)
    }
    coplanarPoint(t) {
        return t.copy(this.normal).multiplyScalar(-this.constant)
    }
    applyMatrix4(t, e) {
        const n = e || lh.getNormalMatrix(t),
            s = this.coplanarPoint(Zs).applyMatrix4(t),
            r = this.normal.applyMatrix3(n).normalize();
        return this.constant = -s.dot(r), this
    }
    translate(t) {
        return this.constant -= t.dot(this.normal), this
    }
    equals(t) {
        return t.normal.equals(this.normal) && t.constant === this.constant
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
const Cn = new ys,
    ch = new Lt(.5, .5),
    ts = new F;
class la {
    constructor(t = new xn, e = new xn, n = new xn, s = new xn, r = new xn, a = new xn) {
        this.planes = [t, e, n, s, r, a]
    }
    set(t, e, n, s, r, a) {
        const o = this.planes;
        return o[0].copy(t), o[1].copy(e), o[2].copy(n), o[3].copy(s), o[4].copy(r), o[5].copy(a), this
    }
    copy(t) {
        const e = this.planes;
        for (let n = 0; n < 6; n++) e[n].copy(t.planes[n]);
        return this
    }
    setFromProjectionMatrix(t, e = $e, n = !1) {
        const s = this.planes,
            r = t.elements,
            a = r[0],
            o = r[1],
            c = r[2],
            l = r[3],
            d = r[4],
            f = r[5],
            p = r[6],
            m = r[7],
            x = r[8],
            _ = r[9],
            u = r[10],
            h = r[11],
            w = r[12],
            T = r[13],
            E = r[14],
            P = r[15];
        if (s[0].setComponents(l - a, m - d, h - x, P - w).normalize(), s[1].setComponents(l + a, m + d, h + x, P + w).normalize(), s[2].setComponents(l + o, m + f, h + _, P + T).normalize(), s[3].setComponents(l - o, m - f, h - _, P - T).normalize(), n) s[4].setComponents(c, p, u, E).normalize(), s[5].setComponents(l - c, m - p, h - u, P - E).normalize();
        else if (s[4].setComponents(l - c, m - p, h - u, P - E).normalize(), e === $e) s[5].setComponents(l + c, m + p, h + u, P + E).normalize();
        else if (e === xs) s[5].setComponents(c, p, u, E).normalize();
        else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + e);
        return this
    }
    intersectsObject(t) {
        if (t.boundingSphere !== void 0) t.boundingSphere === null && t.computeBoundingSphere(), Cn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);
        else {
            const e = t.geometry;
            e.boundingSphere === null && e.computeBoundingSphere(), Cn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)
        }
        return this.intersectsSphere(Cn)
    }
    intersectsSprite(t) {
        Cn.center.set(0, 0, 0);
        const e = ch.distanceTo(t.center);
        return Cn.radius = .7071067811865476 + e, Cn.applyMatrix4(t.matrixWorld), this.intersectsSphere(Cn)
    }
    intersectsSphere(t) {
        const e = this.planes,
            n = t.center,
            s = -t.radius;
        for (let r = 0; r < 6; r++)
            if (e[r].distanceToPoint(n) < s) return !1;
        return !0
    }
    intersectsBox(t) {
        const e = this.planes;
        for (let n = 0; n < 6; n++) {
            const s = e[n];
            if (ts.x = s.normal.x > 0 ? t.max.x : t.min.x, ts.y = s.normal.y > 0 ? t.max.y : t.min.y, ts.z = s.normal.z > 0 ? t.max.z : t.min.z, s.distanceToPoint(ts) < 0) return !1
        }
        return !0
    }
    containsPoint(t) {
        const e = this.planes;
        for (let n = 0; n < 6; n++)
            if (e[n].distanceToPoint(t) < 0) return !1;
        return !0
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
class Kr extends pi {
    constructor(t) {
        super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new Ht(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(t)
    }
    copy(t) {
        return super.copy(t), this.color.copy(t.color), this.map = t.map, this.linewidth = t.linewidth, this.linecap = t.linecap, this.linejoin = t.linejoin, this.fog = t.fog, this
    }
}
const Ms = new F,
    Ss = new F,
    Wa = new le,
    Ei = new Ts,
    es = new ys,
    Js = new F,
    Xa = new F;
class hh extends xe {
    constructor(t = new un, e = new Kr) {
        super(), this.isLine = !0, this.type = "Line", this.geometry = t, this.material = e, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets()
    }
    copy(t, e) {
        return super.copy(t, e), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this
    }
    computeLineDistances() {
        const t = this.geometry;
        if (t.index === null) {
            const e = t.attributes.position,
                n = [0];
            for (let s = 1, r = e.count; s < r; s++) Ms.fromBufferAttribute(e, s - 1), Ss.fromBufferAttribute(e, s), n[s] = n[s - 1], n[s] += Ms.distanceTo(Ss);
            t.setAttribute("lineDistance", new Ze(n, 1))
        } else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
        return this
    }
    raycast(t, e) {
        const n = this.geometry,
            s = this.matrixWorld,
            r = t.params.Line.threshold,
            a = n.drawRange;
        if (n.boundingSphere === null && n.computeBoundingSphere(), es.copy(n.boundingSphere), es.applyMatrix4(s), es.radius += r, t.ray.intersectsSphere(es) === !1) return;
        Wa.copy(s).invert(), Ei.copy(t.ray).applyMatrix4(Wa);
        const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3),
            c = o * o,
            l = this.isLineSegments ? 2 : 1,
            d = n.index,
            p = n.attributes.position;
        if (d !== null) {
            const m = Math.max(0, a.start),
                x = Math.min(d.count, a.start + a.count);
            for (let _ = m, u = x - 1; _ < u; _ += l) {
                const h = d.getX(_),
                    w = d.getX(_ + 1),
                    T = ns(this, t, Ei, c, h, w, _);
                T && e.push(T)
            }
            if (this.isLineLoop) {
                const _ = d.getX(x - 1),
                    u = d.getX(m),
                    h = ns(this, t, Ei, c, _, u, x - 1);
                h && e.push(h)
            }
        } else {
            const m = Math.max(0, a.start),
                x = Math.min(p.count, a.start + a.count);
            for (let _ = m, u = x - 1; _ < u; _ += l) {
                const h = ns(this, t, Ei, c, _, _ + 1, _);
                h && e.push(h)
            }
            if (this.isLineLoop) {
                const _ = ns(this, t, Ei, c, x - 1, m, x - 1);
                _ && e.push(_)
            }
        }
    }
    updateMorphTargets() {
        const e = this.geometry.morphAttributes,
            n = Object.keys(e);
        if (n.length > 0) {
            const s = e[n[0]];
            if (s !== void 0) {
                this.morphTargetInfluences = [], this.morphTargetDictionary = {};
                for (let r = 0, a = s.length; r < a; r++) {
                    const o = s[r].name || String(r);
                    this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r
                }
            }
        }
    }
}

function ns(i, t, e, n, s, r, a) {
    const o = i.geometry.attributes.position;
    if (Ms.fromBufferAttribute(o, s), Ss.fromBufferAttribute(o, r), e.distanceSqToSegment(Ms, Ss, Js, Xa) > n) return;
    Js.applyMatrix4(i.matrixWorld);
    const l = t.ray.origin.distanceTo(Js);
    if (!(l < t.near || l > t.far)) return {
        distance: l,
        point: Xa.clone().applyMatrix4(i.matrixWorld),
        index: a,
        face: null,
        faceIndex: null,
        barycoord: null,
        object: i
    }
}
const qa = new F,
    Ya = new F;
class Ka extends hh {
    constructor(t, e) {
        super(t, e), this.isLineSegments = !0, this.type = "LineSegments"
    }
    computeLineDistances() {
        const t = this.geometry;
        if (t.index === null) {
            const e = t.attributes.position,
                n = [];
            for (let s = 0, r = e.count; s < r; s += 2) qa.fromBufferAttribute(e, s), Ya.fromBufferAttribute(e, s + 1), n[s] = s === 0 ? 0 : n[s - 1], n[s + 1] = n[s] + qa.distanceTo(Ya);
            t.setAttribute("lineDistance", new Ze(n, 1))
        } else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
        return this
    }
}
class tl extends Re {
    constructor(t, e, n = Bn, s, r, a, o = We, c = We, l, d = Ci, f = 1) {
        if (d !== Ci && d !== Pi) throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
        const p = {
            width: t,
            height: e,
            depth: f
        };
        super(p, s, r, a, o, c, d, n, l), this.isDepthTexture = !0, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null
    }
    copy(t) {
        return super.copy(t), this.source = new aa(Object.assign({}, t.image)), this.compareFunction = t.compareFunction, this
    }
    toJSON(t) {
        const e = super.toJSON(t);
        return this.compareFunction !== null && (e.compareFunction = this.compareFunction), e
    }
}
const is = new F,
    ss = new F,
    Qs = new F,
    rs = new Be;
class $a extends un {
    constructor(t = null, e = 1) {
        if (super(), this.type = "EdgesGeometry", this.parameters = {
                geometry: t,
                thresholdAngle: e
            }, t !== null) {
            const s = Math.pow(10, 4),
                r = Math.cos(Ai * e),
                a = t.getIndex(),
                o = t.getAttribute("position"),
                c = a ? a.count : o.count,
                l = [0, 0, 0],
                d = ["a", "b", "c"],
                f = new Array(3),
                p = {},
                m = [];
            for (let x = 0; x < c; x += 3) {
                a ? (l[0] = a.getX(x), l[1] = a.getX(x + 1), l[2] = a.getX(x + 2)) : (l[0] = x, l[1] = x + 1, l[2] = x + 2);
                const {
                    a: _,
                    b: u,
                    c: h
                } = rs;
                if (_.fromBufferAttribute(o, l[0]), u.fromBufferAttribute(o, l[1]), h.fromBufferAttribute(o, l[2]), rs.getNormal(Qs), f[0] = `${Math.round(_.x*s)},${Math.round(_.y*s)},${Math.round(_.z*s)}`, f[1] = `${Math.round(u.x*s)},${Math.round(u.y*s)},${Math.round(u.z*s)}`, f[2] = `${Math.round(h.x*s)},${Math.round(h.y*s)},${Math.round(h.z*s)}`, !(f[0] === f[1] || f[1] === f[2] || f[2] === f[0]))
                    for (let w = 0; w < 3; w++) {
                        const T = (w + 1) % 3,
                            E = f[w],
                            P = f[T],
                            R = rs[d[w]],
                            b = rs[d[T]],
                            I = `${E}_${P}`,
                            M = `${P}_${E}`;
                        M in p && p[M] ? (Qs.dot(p[M].normal) <= r && (m.push(R.x, R.y, R.z), m.push(b.x, b.y, b.z)), p[M] = null) : I in p || (p[I] = {
                            index0: l[w],
                            index1: l[T],
                            normal: Qs.clone()
                        })
                    }
            }
            for (const x in p)
                if (p[x]) {
                    const {
                        index0: _,
                        index1: u
                    } = p[x];
                    is.fromBufferAttribute(o, _), ss.fromBufferAttribute(o, u), m.push(is.x, is.y, is.z), m.push(ss.x, ss.y, ss.z)
                } this.setAttribute("position", new Ze(m, 3))
        }
    }
    copy(t) {
        return super.copy(t), this.parameters = Object.assign({}, t.parameters), this
    }
}
class Ui extends un {
    constructor(t = 1, e = 1, n = 1, s = 1) {
        super(), this.type = "PlaneGeometry", this.parameters = {
            width: t,
            height: e,
            widthSegments: n,
            heightSegments: s
        };
        const r = t / 2,
            a = e / 2,
            o = Math.floor(n),
            c = Math.floor(s),
            l = o + 1,
            d = c + 1,
            f = t / o,
            p = e / c,
            m = [],
            x = [],
            _ = [],
            u = [];
        for (let h = 0; h < d; h++) {
            const w = h * p - a;
            for (let T = 0; T < l; T++) {
                const E = T * f - r;
                x.push(E, -w, 0), _.push(0, 0, 1), u.push(T / o), u.push(1 - h / c)
            }
        }
        for (let h = 0; h < c; h++)
            for (let w = 0; w < o; w++) {
                const T = w + l * h,
                    E = w + l * (h + 1),
                    P = w + 1 + l * (h + 1),
                    R = w + 1 + l * h;
                m.push(T, E, R), m.push(E, P, R)
            }
        this.setIndex(m), this.setAttribute("position", new Ze(x, 3)), this.setAttribute("normal", new Ze(_, 3)), this.setAttribute("uv", new Ze(u, 2))
    }
    copy(t) {
        return super.copy(t), this.parameters = Object.assign({}, t.parameters), this
    }
    static fromJSON(t) {
        return new Ui(t.width, t.height, t.widthSegments, t.heightSegments)
    }
}
class ms extends pi {
    constructor(t) {
        super(), this.isMeshStandardMaterial = !0, this.type = "MeshStandardMaterial", this.defines = {
            STANDARD: ""
        }, this.color = new Ht(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Ht(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = Vo, this.normalScale = new Lt(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Qe, this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(t)
    }
    copy(t) {
        return super.copy(t), this.defines = {
            STANDARD: ""
        }, this.color.copy(t.color), this.roughness = t.roughness, this.metalness = t.metalness, this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.emissive.copy(t.emissive), this.emissiveMap = t.emissiveMap, this.emissiveIntensity = t.emissiveIntensity, this.bumpMap = t.bumpMap, this.bumpScale = t.bumpScale, this.normalMap = t.normalMap, this.normalMapType = t.normalMapType, this.normalScale.copy(t.normalScale), this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.roughnessMap = t.roughnessMap, this.metalnessMap = t.metalnessMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.envMapIntensity = t.envMapIntensity, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.flatShading = t.flatShading, this.fog = t.fog, this
    }
}
class uh extends ms {
    constructor(t) {
        super(), this.isMeshPhysicalMaterial = !0, this.defines = {
            STANDARD: "",
            PHYSICAL: ""
        }, this.type = "MeshPhysicalMaterial", this.anisotropyRotation = 0, this.anisotropyMap = null, this.clearcoatMap = null, this.clearcoatRoughness = 0, this.clearcoatRoughnessMap = null, this.clearcoatNormalScale = new Lt(1, 1), this.clearcoatNormalMap = null, this.ior = 1.5, Object.defineProperty(this, "reflectivity", {
            get: function() {
                return zt(2.5 * (this.ior - 1) / (this.ior + 1), 0, 1)
            },
            set: function(e) {
                this.ior = (1 + .4 * e) / (1 - .4 * e)
            }
        }), this.iridescenceMap = null, this.iridescenceIOR = 1.3, this.iridescenceThicknessRange = [100, 400], this.iridescenceThicknessMap = null, this.sheenColor = new Ht(0), this.sheenColorMap = null, this.sheenRoughness = 1, this.sheenRoughnessMap = null, this.transmissionMap = null, this.thickness = 0, this.thicknessMap = null, this.attenuationDistance = 1 / 0, this.attenuationColor = new Ht(1, 1, 1), this.specularIntensity = 1, this.specularIntensityMap = null, this.specularColor = new Ht(1, 1, 1), this.specularColorMap = null, this._anisotropy = 0, this._clearcoat = 0, this._dispersion = 0, this._iridescence = 0, this._sheen = 0, this._transmission = 0, this.setValues(t)
    }
    get anisotropy() {
        return this._anisotropy
    }
    set anisotropy(t) {
        this._anisotropy > 0 != t > 0 && this.version++, this._anisotropy = t
    }
    get clearcoat() {
        return this._clearcoat
    }
    set clearcoat(t) {
        this._clearcoat > 0 != t > 0 && this.version++, this._clearcoat = t
    }
    get iridescence() {
        return this._iridescence
    }
    set iridescence(t) {
        this._iridescence > 0 != t > 0 && this.version++, this._iridescence = t
    }
    get dispersion() {
        return this._dispersion
    }
    set dispersion(t) {
        this._dispersion > 0 != t > 0 && this.version++, this._dispersion = t
    }
    get sheen() {
        return this._sheen
    }
    set sheen(t) {
        this._sheen > 0 != t > 0 && this.version++, this._sheen = t
    }
    get transmission() {
        return this._transmission
    }
    set transmission(t) {
        this._transmission > 0 != t > 0 && this.version++, this._transmission = t
    }
    copy(t) {
        return super.copy(t), this.defines = {
            STANDARD: "",
            PHYSICAL: ""
        }, this.anisotropy = t.anisotropy, this.anisotropyRotation = t.anisotropyRotation, this.anisotropyMap = t.anisotropyMap, this.clearcoat = t.clearcoat, this.clearcoatMap = t.clearcoatMap, this.clearcoatRoughness = t.clearcoatRoughness, this.clearcoatRoughnessMap = t.clearcoatRoughnessMap, this.clearcoatNormalMap = t.clearcoatNormalMap, this.clearcoatNormalScale.copy(t.clearcoatNormalScale), this.dispersion = t.dispersion, this.ior = t.ior, this.iridescence = t.iridescence, this.iridescenceMap = t.iridescenceMap, this.iridescenceIOR = t.iridescenceIOR, this.iridescenceThicknessRange = [...t.iridescenceThicknessRange], this.iridescenceThicknessMap = t.iridescenceThicknessMap, this.sheen = t.sheen, this.sheenColor.copy(t.sheenColor), this.sheenColorMap = t.sheenColorMap, this.sheenRoughness = t.sheenRoughness, this.sheenRoughnessMap = t.sheenRoughnessMap, this.transmission = t.transmission, this.transmissionMap = t.transmissionMap, this.thickness = t.thickness, this.thicknessMap = t.thicknessMap, this.attenuationDistance = t.attenuationDistance, this.attenuationColor.copy(t.attenuationColor), this.specularIntensity = t.specularIntensity, this.specularIntensityMap = t.specularIntensityMap, this.specularColor.copy(t.specularColor), this.specularColorMap = t.specularColorMap, this
    }
}
class dh extends pi {
    constructor(t) {
        super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = Ec, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(t)
    }
    copy(t) {
        return super.copy(t), this.depthPacking = t.depthPacking, this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this
    }
}
class fh extends pi {
    constructor(t) {
        super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(t)
    }
    copy(t) {
        return super.copy(t), this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this
    }
}
class el extends xe {
    constructor(t, e = 1) {
        super(), this.isLight = !0, this.type = "Light", this.color = new Ht(t), this.intensity = e
    }
    dispose() {}
    copy(t, e) {
        return super.copy(t, e), this.color.copy(t.color), this.intensity = t.intensity, this
    }
    toJSON(t) {
        const e = super.toJSON(t);
        return e.object.color = this.color.getHex(), e.object.intensity = this.intensity, this.groundColor !== void 0 && (e.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (e.object.distance = this.distance), this.angle !== void 0 && (e.object.angle = this.angle), this.decay !== void 0 && (e.object.decay = this.decay), this.penumbra !== void 0 && (e.object.penumbra = this.penumbra), this.shadow !== void 0 && (e.object.shadow = this.shadow.toJSON()), this.target !== void 0 && (e.object.target = this.target.uuid), e
    }
}
class ph extends el {
    constructor(t, e, n) {
        super(t, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(xe.DEFAULT_UP), this.updateMatrix(), this.groundColor = new Ht(e)
    }
    copy(t, e) {
        return super.copy(t, e), this.groundColor.copy(t.groundColor), this
    }
}
const tr = new le,
    ja = new F,
    Za = new F;
class mh {
    constructor(t) {
        this.camera = t, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new Lt(512, 512), this.mapType = Je, this.map = null, this.mapPass = null, this.matrix = new le, this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new la, this._frameExtents = new Lt(1, 1), this._viewportCount = 1, this._viewports = [new he(0, 0, 1, 1)]
    }
    getViewportCount() {
        return this._viewportCount
    }
    getFrustum() {
        return this._frustum
    }
    updateMatrices(t) {
        const e = this.camera,
            n = this.matrix;
        ja.setFromMatrixPosition(t.matrixWorld), e.position.copy(ja), Za.setFromMatrixPosition(t.target.matrixWorld), e.lookAt(Za), e.updateMatrixWorld(), tr.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), this._frustum.setFromProjectionMatrix(tr, e.coordinateSystem, e.reversedDepth), e.reversedDepth ? n.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, 1, 0, 0, 0, 0, 1) : n.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1), n.multiply(tr)
    }
    getViewport(t) {
        return this._viewports[t]
    }
    getFrameExtents() {
        return this._frameExtents
    }
    dispose() {
        this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose()
    }
    copy(t) {
        return this.camera = t.camera.clone(), this.intensity = t.intensity, this.bias = t.bias, this.radius = t.radius, this.autoUpdate = t.autoUpdate, this.needsUpdate = t.needsUpdate, this.normalBias = t.normalBias, this.blurSamples = t.blurSamples, this.mapSize.copy(t.mapSize), this
    }
    clone() {
        return new this.constructor().copy(this)
    }
    toJSON() {
        const t = {};
        return this.intensity !== 1 && (t.intensity = this.intensity), this.bias !== 0 && (t.bias = this.bias), this.normalBias !== 0 && (t.normalBias = this.normalBias), this.radius !== 1 && (t.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (t.mapSize = this.mapSize.toArray()), t.camera = this.camera.toJSON(!1).object, delete t.camera.matrix, t
    }
}
class nl extends Jo {
    constructor(t = -1, e = 1, n = 1, s = -1, r = .1, a = 2e3) {
        super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = t, this.right = e, this.top = n, this.bottom = s, this.near = r, this.far = a, this.updateProjectionMatrix()
    }
    copy(t, e) {
        return super.copy(t, e), this.left = t.left, this.right = t.right, this.top = t.top, this.bottom = t.bottom, this.near = t.near, this.far = t.far, this.zoom = t.zoom, this.view = t.view === null ? null : Object.assign({}, t.view), this
    }
    setViewOffset(t, e, n, s, r, a) {
        this.view === null && (this.view = {
            enabled: !0,
            fullWidth: 1,
            fullHeight: 1,
            offsetX: 0,
            offsetY: 0,
            width: 1,
            height: 1
        }), this.view.enabled = !0, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = n, this.view.offsetY = s, this.view.width = r, this.view.height = a, this.updateProjectionMatrix()
    }
    clearViewOffset() {
        this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix()
    }
    updateProjectionMatrix() {
        const t = (this.right - this.left) / (2 * this.zoom),
            e = (this.top - this.bottom) / (2 * this.zoom),
            n = (this.right + this.left) / 2,
            s = (this.top + this.bottom) / 2;
        let r = n - t,
            a = n + t,
            o = s + e,
            c = s - e;
        if (this.view !== null && this.view.enabled) {
            const l = (this.right - this.left) / this.view.fullWidth / this.zoom,
                d = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
            r += l * this.view.offsetX, a = r + l * this.view.width, o -= d * this.view.offsetY, c = o - d * this.view.height
        }
        this.projectionMatrix.makeOrthographic(r, a, o, c, this.near, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert()
    }
    toJSON(t) {
        const e = super.toJSON(t);
        return e.object.zoom = this.zoom, e.object.left = this.left, e.object.right = this.right, e.object.top = this.top, e.object.bottom = this.bottom, e.object.near = this.near, e.object.far = this.far, this.view !== null && (e.object.view = Object.assign({}, this.view)), e
    }
}
class _h extends mh {
    constructor() {
        super(new nl(-5, 5, 5, -5, .5, 500)), this.isDirectionalLightShadow = !0
    }
}
class gh extends el {
    constructor(t, e) {
        super(t, e), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(xe.DEFAULT_UP), this.updateMatrix(), this.target = new xe, this.shadow = new _h
    }
    dispose() {
        this.shadow.dispose()
    }
    copy(t) {
        return super.copy(t), this.target = t.target.clone(), this.shadow = t.shadow.clone(), this
    }
}
class xh extends Oe {
    constructor(t = []) {
        super(), this.isArrayCamera = !0, this.isMultiViewCamera = !1, this.cameras = t
    }
}
const Ja = new le;
class vh {
    constructor(t, e, n = 0, s = 1 / 0) {
        this.ray = new Ts(t, e), this.near = n, this.far = s, this.camera = null, this.layers = new oa, this.params = {
            Mesh: {},
            Line: {
                threshold: 1
            },
            LOD: {},
            Points: {
                threshold: 1
            },
            Sprite: {}
        }
    }
    set(t, e) {
        this.ray.set(t, e)
    }
    setFromCamera(t, e) {
        e.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(t.x, t.y, .5).unproject(e).sub(this.ray.origin).normalize(), this.camera = e) : e.isOrthographicCamera ? (this.ray.origin.set(t.x, t.y, (e.near + e.far) / (e.near - e.far)).unproject(e), this.ray.direction.set(0, 0, -1).transformDirection(e.matrixWorld), this.camera = e) : console.error("THREE.Raycaster: Unsupported camera type: " + e.type)
    }
    setFromXRController(t) {
        return Ja.identity().extractRotation(t.matrixWorld), this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(Ja), this
    }
    intersectObject(t, e = !0, n = []) {
        return $r(t, this, n, e), n.sort(Qa), n
    }
    intersectObjects(t, e = !0, n = []) {
        for (let s = 0, r = t.length; s < r; s++) $r(t[s], this, n, e);
        return n.sort(Qa), n
    }
}

function Qa(i, t) {
    return i.distance - t.distance
}

function $r(i, t, e, n) {
    let s = !0;
    if (i.layers.test(t.layers) && i.raycast(t, e) === !1 && (s = !1), s === !0 && n === !0) {
        const r = i.children;
        for (let a = 0, o = r.length; a < o; a++) $r(r[a], t, e, !0)
    }
}
class to {
    constructor(t = 1, e = 0, n = 0) {
        this.radius = t, this.phi = e, this.theta = n
    }
    set(t, e, n) {
        return this.radius = t, this.phi = e, this.theta = n, this
    }
    copy(t) {
        return this.radius = t.radius, this.phi = t.phi, this.theta = t.theta, this
    }
    makeSafe() {
        return this.phi = zt(this.phi, 1e-6, Math.PI - 1e-6), this
    }
    setFromVector3(t) {
        return this.setFromCartesianCoords(t.x, t.y, t.z)
    }
    setFromCartesianCoords(t, e, n) {
        return this.radius = Math.sqrt(t * t + e * e + n * n), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(t, n), this.phi = Math.acos(zt(e / this.radius, -1, 1))), this
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
class Mh extends Gn {
    constructor(t, e = null) {
        super(), this.object = t, this.domElement = e, this.enabled = !0, this.state = -1, this.keys = {}, this.mouseButtons = {
            LEFT: null,
            MIDDLE: null,
            RIGHT: null
        }, this.touches = {
            ONE: null,
            TWO: null
        }
    }
    connect(t) {
        if (t === void 0) {
            console.warn("THREE.Controls: connect() now requires an element.");
            return
        }
        this.domElement !== null && this.disconnect(), this.domElement = t
    }
    disconnect() {}
    dispose() {}
    update() {}
}

function eo(i, t, e, n) {
    const s = Sh(n);
    switch (e) {
        case Bo:
            return i * t;
        case Ho:
            return i * t / s.components * s.byteLength;
        case ia:
            return i * t / s.components * s.byteLength;
        case ko:
            return i * t * 2 / s.components * s.byteLength;
        case sa:
            return i * t * 2 / s.components * s.byteLength;
        case zo:
            return i * t * 3 / s.components * s.byteLength;
        case Ve:
            return i * t * 4 / s.components * s.byteLength;
        case ra:
            return i * t * 4 / s.components * s.byteLength;
        case hs:
        case us:
            return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
        case ds:
        case fs:
            return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
        case Er:
        case Tr:
            return Math.max(i, 16) * Math.max(t, 8) / 4;
        case Sr:
        case yr:
            return Math.max(i, 8) * Math.max(t, 8) / 2;
        case br:
        case Ar:
            return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
        case wr:
            return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
        case Rr:
            return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
        case Cr:
            return Math.floor((i + 4) / 5) * Math.floor((t + 3) / 4) * 16;
        case Pr:
            return Math.floor((i + 4) / 5) * Math.floor((t + 4) / 5) * 16;
        case Dr:
            return Math.floor((i + 5) / 6) * Math.floor((t + 4) / 5) * 16;
        case Lr:
            return Math.floor((i + 5) / 6) * Math.floor((t + 5) / 6) * 16;
        case Ir:
            return Math.floor((i + 7) / 8) * Math.floor((t + 4) / 5) * 16;
        case Ur:
            return Math.floor((i + 7) / 8) * Math.floor((t + 5) / 6) * 16;
        case Nr:
            return Math.floor((i + 7) / 8) * Math.floor((t + 7) / 8) * 16;
        case Fr:
            return Math.floor((i + 9) / 10) * Math.floor((t + 4) / 5) * 16;
        case Or:
            return Math.floor((i + 9) / 10) * Math.floor((t + 5) / 6) * 16;
        case Br:
            return Math.floor((i + 9) / 10) * Math.floor((t + 7) / 8) * 16;
        case zr:
            return Math.floor((i + 9) / 10) * Math.floor((t + 9) / 10) * 16;
        case Hr:
            return Math.floor((i + 11) / 12) * Math.floor((t + 9) / 10) * 16;
        case kr:
            return Math.floor((i + 11) / 12) * Math.floor((t + 11) / 12) * 16;
        case ps:
        case Gr:
        case Vr:
            return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
        case Go:
        case Wr:
            return Math.ceil(i / 4) * Math.ceil(t / 4) * 8;
        case Xr:
        case qr:
            return Math.ceil(i / 4) * Math.ceil(t / 4) * 16
    }
    throw new Error(`Unable to determine texture byte length for ${e} format.`)
}

function Sh(i) {
    switch (i) {
        case Je:
        case No:
            return {
                byteLength: 1, components: 1
            };
        case wi:
        case Fo:
        case Di:
            return {
                byteLength: 2, components: 1
            };
        case ea:
        case na:
            return {
                byteLength: 2, components: 4
            };
        case Bn:
        case ta:
        case ln:
            return {
                byteLength: 4, components: 1
            };
        case Oo:
            return {
                byteLength: 4, components: 3
            }
    }
    throw new Error(`Unknown texture type ${i}.`)
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", {
    detail: {
        revision: Qr
    }
}));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = Qr);

function il() {
    let i = null,
        t = !1,
        e = null,
        n = null;

    function s(r, a) {
        e(r, a), n = i.requestAnimationFrame(s)
    }
    return {
        start: function() {
            t !== !0 && e !== null && (n = i.requestAnimationFrame(s), t = !0)
        },
        stop: function() {
            i.cancelAnimationFrame(n), t = !1
        },
        setAnimationLoop: function(r) {
            e = r
        },
        setContext: function(r) {
            i = r
        }
    }
}

function Eh(i) {
    const t = new WeakMap;

    function e(o, c) {
        const l = o.array,
            d = o.usage,
            f = l.byteLength,
            p = i.createBuffer();
        i.bindBuffer(c, p), i.bufferData(c, l, d), o.onUploadCallback();
        let m;
        if (l instanceof Float32Array) m = i.FLOAT;
        else if (typeof Float16Array < "u" && l instanceof Float16Array) m = i.HALF_FLOAT;
        else if (l instanceof Uint16Array) o.isFloat16BufferAttribute ? m = i.HALF_FLOAT : m = i.UNSIGNED_SHORT;
        else if (l instanceof Int16Array) m = i.SHORT;
        else if (l instanceof Uint32Array) m = i.UNSIGNED_INT;
        else if (l instanceof Int32Array) m = i.INT;
        else if (l instanceof Int8Array) m = i.BYTE;
        else if (l instanceof Uint8Array) m = i.UNSIGNED_BYTE;
        else if (l instanceof Uint8ClampedArray) m = i.UNSIGNED_BYTE;
        else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + l);
        return {
            buffer: p,
            type: m,
            bytesPerElement: l.BYTES_PER_ELEMENT,
            version: o.version,
            size: f
        }
    }

    function n(o, c, l) {
        const d = c.array,
            f = c.updateRanges;
        if (i.bindBuffer(l, o), f.length === 0) i.bufferSubData(l, 0, d);
        else {
            f.sort((m, x) => m.start - x.start);
            let p = 0;
            for (let m = 1; m < f.length; m++) {
                const x = f[p],
                    _ = f[m];
                _.start <= x.start + x.count + 1 ? x.count = Math.max(x.count, _.start + _.count - x.start) : (++p, f[p] = _)
            }
            f.length = p + 1;
            for (let m = 0, x = f.length; m < x; m++) {
                const _ = f[m];
                i.bufferSubData(l, _.start * d.BYTES_PER_ELEMENT, d, _.start, _.count)
            }
            c.clearUpdateRanges()
        }
        c.onUploadCallback()
    }

    function s(o) {
        return o.isInterleavedBufferAttribute && (o = o.data), t.get(o)
    }

    function r(o) {
        o.isInterleavedBufferAttribute && (o = o.data);
        const c = t.get(o);
        c && (i.deleteBuffer(c.buffer), t.delete(o))
    }

    function a(o, c) {
        if (o.isInterleavedBufferAttribute && (o = o.data), o.isGLBufferAttribute) {
            const d = t.get(o);
            (!d || d.version < o.version) && t.set(o, {
                buffer: o.buffer,
                type: o.type,
                bytesPerElement: o.elementSize,
                version: o.version
            });
            return
        }
        const l = t.get(o);
        if (l === void 0) t.set(o, e(o, c));
        else if (l.version < o.version) {
            if (l.size !== o.array.byteLength) throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
            n(l.buffer, o, c), l.version = o.version
        }
    }
    return {
        get: s,
        remove: r,
        update: a
    }
}
var yh = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,
    Th = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,
    bh = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,
    Ah = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
    wh = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,
    Rh = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,
    Ch = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,
    Ph = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,
    Dh = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,
    Lh = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,
    Ih = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,
    Uh = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,
    Nh = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,
    Fh = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,
    Oh = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,
    Bh = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,
    zh = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,
    Hh = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,
    kh = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,
    Gh = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,
    Vh = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,
    Wh = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,
    Xh = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,
    qh = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,
    Yh = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,
    Kh = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,
    $h = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,
    jh = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,
    Zh = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,
    Jh = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,
    Qh = "gl_FragColor = linearToOutputTexel( gl_FragColor );",
    tu = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,
    eu = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,
    nu = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,
    iu = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,
    su = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,
    ru = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,
    au = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,
    ou = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`,
    lu = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,
    cu = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,
    hu = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,
    uu = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,
    du = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,
    fu = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,
    pu = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,
    mu = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,
    _u = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,
    gu = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,
    xu = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,
    vu = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,
    Mu = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,
    Su = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,
    Eu = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,
    yu = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,
    Tu = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,
    bu = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,
    Au = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
    wu = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
    Ru = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,
    Cu = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,
    Pu = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`,
    Du = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,
    Lu = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
    Iu = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,
    Uu = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,
    Nu = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,
    Fu = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,
    Ou = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
    Bu = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,
    zu = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
    Hu = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,
    ku = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,
    Gu = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
    Vu = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
    Wu = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,
    Xu = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,
    qu = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,
    Yu = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,
    Ku = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,
    $u = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,
    ju = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
    Zu = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,
    Ju = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,
    Qu = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,
    td = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,
    ed = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,
    nd = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,
    id = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,
    sd = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSEDEPTHBUF
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSEDEPTHBUF
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare , distribution.x );
		#endif
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,
    rd = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,
    ad = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,
    od = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,
    ld = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,
    cd = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,
    hd = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,
    ud = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,
    dd = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,
    fd = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,
    pd = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,
    md = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,
    _d = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,
    gd = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,
    xd = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
    vd = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
    Md = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,
    Sd = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const Ed = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,
    yd = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
    Td = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
    bd = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
    Ad = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
    wd = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
    Rd = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,
    Cd = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSEDEPTHBUF
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,
    Pd = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,
    Dd = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,
    Ld = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,
    Id = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
    Ud = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
    Nd = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
    Fd = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,
    Od = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    Bd = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
    zd = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    Hd = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,
    kd = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    Gd = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,
    Vd = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,
    Wd = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
    Xd = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    qd = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,
    Yd = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    Kd = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
    $d = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
    jd = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,
    Zd = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
    Jd = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
    Qd = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
    tf = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
    ef = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
    Ot = {
        alphahash_fragment: yh,
        alphahash_pars_fragment: Th,
        alphamap_fragment: bh,
        alphamap_pars_fragment: Ah,
        alphatest_fragment: wh,
        alphatest_pars_fragment: Rh,
        aomap_fragment: Ch,
        aomap_pars_fragment: Ph,
        batching_pars_vertex: Dh,
        batching_vertex: Lh,
        begin_vertex: Ih,
        beginnormal_vertex: Uh,
        bsdfs: Nh,
        iridescence_fragment: Fh,
        bumpmap_pars_fragment: Oh,
        clipping_planes_fragment: Bh,
        clipping_planes_pars_fragment: zh,
        clipping_planes_pars_vertex: Hh,
        clipping_planes_vertex: kh,
        color_fragment: Gh,
        color_pars_fragment: Vh,
        color_pars_vertex: Wh,
        color_vertex: Xh,
        common: qh,
        cube_uv_reflection_fragment: Yh,
        defaultnormal_vertex: Kh,
        displacementmap_pars_vertex: $h,
        displacementmap_vertex: jh,
        emissivemap_fragment: Zh,
        emissivemap_pars_fragment: Jh,
        colorspace_fragment: Qh,
        colorspace_pars_fragment: tu,
        envmap_fragment: eu,
        envmap_common_pars_fragment: nu,
        envmap_pars_fragment: iu,
        envmap_pars_vertex: su,
        envmap_physical_pars_fragment: mu,
        envmap_vertex: ru,
        fog_vertex: au,
        fog_pars_vertex: ou,
        fog_fragment: lu,
        fog_pars_fragment: cu,
        gradientmap_pars_fragment: hu,
        lightmap_pars_fragment: uu,
        lights_lambert_fragment: du,
        lights_lambert_pars_fragment: fu,
        lights_pars_begin: pu,
        lights_toon_fragment: _u,
        lights_toon_pars_fragment: gu,
        lights_phong_fragment: xu,
        lights_phong_pars_fragment: vu,
        lights_physical_fragment: Mu,
        lights_physical_pars_fragment: Su,
        lights_fragment_begin: Eu,
        lights_fragment_maps: yu,
        lights_fragment_end: Tu,
        logdepthbuf_fragment: bu,
        logdepthbuf_pars_fragment: Au,
        logdepthbuf_pars_vertex: wu,
        logdepthbuf_vertex: Ru,
        map_fragment: Cu,
        map_pars_fragment: Pu,
        map_particle_fragment: Du,
        map_particle_pars_fragment: Lu,
        metalnessmap_fragment: Iu,
        metalnessmap_pars_fragment: Uu,
        morphinstance_vertex: Nu,
        morphcolor_vertex: Fu,
        morphnormal_vertex: Ou,
        morphtarget_pars_vertex: Bu,
        morphtarget_vertex: zu,
        normal_fragment_begin: Hu,
        normal_fragment_maps: ku,
        normal_pars_fragment: Gu,
        normal_pars_vertex: Vu,
        normal_vertex: Wu,
        normalmap_pars_fragment: Xu,
        clearcoat_normal_fragment_begin: qu,
        clearcoat_normal_fragment_maps: Yu,
        clearcoat_pars_fragment: Ku,
        iridescence_pars_fragment: $u,
        opaque_fragment: ju,
        packing: Zu,
        premultiplied_alpha_fragment: Ju,
        project_vertex: Qu,
        dithering_fragment: td,
        dithering_pars_fragment: ed,
        roughnessmap_fragment: nd,
        roughnessmap_pars_fragment: id,
        shadowmap_pars_fragment: sd,
        shadowmap_pars_vertex: rd,
        shadowmap_vertex: ad,
        shadowmask_pars_fragment: od,
        skinbase_vertex: ld,
        skinning_pars_vertex: cd,
        skinning_vertex: hd,
        skinnormal_vertex: ud,
        specularmap_fragment: dd,
        specularmap_pars_fragment: fd,
        tonemapping_fragment: pd,
        tonemapping_pars_fragment: md,
        transmission_fragment: _d,
        transmission_pars_fragment: gd,
        uv_pars_fragment: xd,
        uv_pars_vertex: vd,
        uv_vertex: Md,
        worldpos_vertex: Sd,
        background_vert: Ed,
        background_frag: yd,
        backgroundCube_vert: Td,
        backgroundCube_frag: bd,
        cube_vert: Ad,
        cube_frag: wd,
        depth_vert: Rd,
        depth_frag: Cd,
        distanceRGBA_vert: Pd,
        distanceRGBA_frag: Dd,
        equirect_vert: Ld,
        equirect_frag: Id,
        linedashed_vert: Ud,
        linedashed_frag: Nd,
        meshbasic_vert: Fd,
        meshbasic_frag: Od,
        meshlambert_vert: Bd,
        meshlambert_frag: zd,
        meshmatcap_vert: Hd,
        meshmatcap_frag: kd,
        meshnormal_vert: Gd,
        meshnormal_frag: Vd,
        meshphong_vert: Wd,
        meshphong_frag: Xd,
        meshphysical_vert: qd,
        meshphysical_frag: Yd,
        meshtoon_vert: Kd,
        meshtoon_frag: $d,
        points_vert: jd,
        points_frag: Zd,
        shadow_vert: Jd,
        shadow_frag: Qd,
        sprite_vert: tf,
        sprite_frag: ef
    },
    ot = {
        common: {
            diffuse: {
                value: new Ht(16777215)
            },
            opacity: {
                value: 1
            },
            map: {
                value: null
            },
            mapTransform: {
                value: new Ft
            },
            alphaMap: {
                value: null
            },
            alphaMapTransform: {
                value: new Ft
            },
            alphaTest: {
                value: 0
            }
        },
        specularmap: {
            specularMap: {
                value: null
            },
            specularMapTransform: {
                value: new Ft
            }
        },
        envmap: {
            envMap: {
                value: null
            },
            envMapRotation: {
                value: new Ft
            },
            flipEnvMap: {
                value: -1
            },
            reflectivity: {
                value: 1
            },
            ior: {
                value: 1.5
            },
            refractionRatio: {
                value: .98
            }
        },
        aomap: {
            aoMap: {
                value: null
            },
            aoMapIntensity: {
                value: 1
            },
            aoMapTransform: {
                value: new Ft
            }
        },
        lightmap: {
            lightMap: {
                value: null
            },
            lightMapIntensity: {
                value: 1
            },
            lightMapTransform: {
                value: new Ft
            }
        },
        bumpmap: {
            bumpMap: {
                value: null
            },
            bumpMapTransform: {
                value: new Ft
            },
            bumpScale: {
                value: 1
            }
        },
        normalmap: {
            normalMap: {
                value: null
            },
            normalMapTransform: {
                value: new Ft
            },
            normalScale: {
                value: new Lt(1, 1)
            }
        },
        displacementmap: {
            displacementMap: {
                value: null
            },
            displacementMapTransform: {
                value: new Ft
            },
            displacementScale: {
                value: 1
            },
            displacementBias: {
                value: 0
            }
        },
        emissivemap: {
            emissiveMap: {
                value: null
            },
            emissiveMapTransform: {
                value: new Ft
            }
        },
        metalnessmap: {
            metalnessMap: {
                value: null
            },
            metalnessMapTransform: {
                value: new Ft
            }
        },
        roughnessmap: {
            roughnessMap: {
                value: null
            },
            roughnessMapTransform: {
                value: new Ft
            }
        },
        gradientmap: {
            gradientMap: {
                value: null
            }
        },
        fog: {
            fogDensity: {
                value: 25e-5
            },
            fogNear: {
                value: 1
            },
            fogFar: {
                value: 2e3
            },
            fogColor: {
                value: new Ht(16777215)
            }
        },
        lights: {
            ambientLightColor: {
                value: []
            },
            lightProbe: {
                value: []
            },
            directionalLights: {
                value: [],
                properties: {
                    direction: {},
                    color: {}
                }
            },
            directionalLightShadows: {
                value: [],
                properties: {
                    shadowIntensity: 1,
                    shadowBias: {},
                    shadowNormalBias: {},
                    shadowRadius: {},
                    shadowMapSize: {}
                }
            },
            directionalShadowMap: {
                value: []
            },
            directionalShadowMatrix: {
                value: []
            },
            spotLights: {
                value: [],
                properties: {
                    color: {},
                    position: {},
                    direction: {},
                    distance: {},
                    coneCos: {},
                    penumbraCos: {},
                    decay: {}
                }
            },
            spotLightShadows: {
                value: [],
                properties: {
                    shadowIntensity: 1,
                    shadowBias: {},
                    shadowNormalBias: {},
                    shadowRadius: {},
                    shadowMapSize: {}
                }
            },
            spotLightMap: {
                value: []
            },
            spotShadowMap: {
                value: []
            },
            spotLightMatrix: {
                value: []
            },
            pointLights: {
                value: [],
                properties: {
                    color: {},
                    position: {},
                    decay: {},
                    distance: {}
                }
            },
            pointLightShadows: {
                value: [],
                properties: {
                    shadowIntensity: 1,
                    shadowBias: {},
                    shadowNormalBias: {},
                    shadowRadius: {},
                    shadowMapSize: {},
                    shadowCameraNear: {},
                    shadowCameraFar: {}
                }
            },
            pointShadowMap: {
                value: []
            },
            pointShadowMatrix: {
                value: []
            },
            hemisphereLights: {
                value: [],
                properties: {
                    direction: {},
                    skyColor: {},
                    groundColor: {}
                }
            },
            rectAreaLights: {
                value: [],
                properties: {
                    color: {},
                    position: {},
                    width: {},
                    height: {}
                }
            },
            ltc_1: {
                value: null
            },
            ltc_2: {
                value: null
            }
        },
        points: {
            diffuse: {
                value: new Ht(16777215)
            },
            opacity: {
                value: 1
            },
            size: {
                value: 1
            },
            scale: {
                value: 1
            },
            map: {
                value: null
            },
            alphaMap: {
                value: null
            },
            alphaMapTransform: {
                value: new Ft
            },
            alphaTest: {
                value: 0
            },
            uvTransform: {
                value: new Ft
            }
        },
        sprite: {
            diffuse: {
                value: new Ht(16777215)
            },
            opacity: {
                value: 1
            },
            center: {
                value: new Lt(.5, .5)
            },
            rotation: {
                value: 0
            },
            map: {
                value: null
            },
            mapTransform: {
                value: new Ft
            },
            alphaMap: {
                value: null
            },
            alphaMapTransform: {
                value: new Ft
            },
            alphaTest: {
                value: 0
            }
        }
    },
    qe = {
        basic: {
            uniforms: ye([ot.common, ot.specularmap, ot.envmap, ot.aomap, ot.lightmap, ot.fog]),
            vertexShader: Ot.meshbasic_vert,
            fragmentShader: Ot.meshbasic_frag
        },
        lambert: {
            uniforms: ye([ot.common, ot.specularmap, ot.envmap, ot.aomap, ot.lightmap, ot.emissivemap, ot.bumpmap, ot.normalmap, ot.displacementmap, ot.fog, ot.lights, {
                emissive: {
                    value: new Ht(0)
                }
            }]),
            vertexShader: Ot.meshlambert_vert,
            fragmentShader: Ot.meshlambert_frag
        },
        phong: {
            uniforms: ye([ot.common, ot.specularmap, ot.envmap, ot.aomap, ot.lightmap, ot.emissivemap, ot.bumpmap, ot.normalmap, ot.displacementmap, ot.fog, ot.lights, {
                emissive: {
                    value: new Ht(0)
                },
                specular: {
                    value: new Ht(1118481)
                },
                shininess: {
                    value: 30
                }
            }]),
            vertexShader: Ot.meshphong_vert,
            fragmentShader: Ot.meshphong_frag
        },
        standard: {
            uniforms: ye([ot.common, ot.envmap, ot.aomap, ot.lightmap, ot.emissivemap, ot.bumpmap, ot.normalmap, ot.displacementmap, ot.roughnessmap, ot.metalnessmap, ot.fog, ot.lights, {
                emissive: {
                    value: new Ht(0)
                },
                roughness: {
                    value: 1
                },
                metalness: {
                    value: 0
                },
                envMapIntensity: {
                    value: 1
                }
            }]),
            vertexShader: Ot.meshphysical_vert,
            fragmentShader: Ot.meshphysical_frag
        },
        toon: {
            uniforms: ye([ot.common, ot.aomap, ot.lightmap, ot.emissivemap, ot.bumpmap, ot.normalmap, ot.displacementmap, ot.gradientmap, ot.fog, ot.lights, {
                emissive: {
                    value: new Ht(0)
                }
            }]),
            vertexShader: Ot.meshtoon_vert,
            fragmentShader: Ot.meshtoon_frag
        },
        matcap: {
            uniforms: ye([ot.common, ot.bumpmap, ot.normalmap, ot.displacementmap, ot.fog, {
                matcap: {
                    value: null
                }
            }]),
            vertexShader: Ot.meshmatcap_vert,
            fragmentShader: Ot.meshmatcap_frag
        },
        points: {
            uniforms: ye([ot.points, ot.fog]),
            vertexShader: Ot.points_vert,
            fragmentShader: Ot.points_frag
        },
        dashed: {
            uniforms: ye([ot.common, ot.fog, {
                scale: {
                    value: 1
                },
                dashSize: {
                    value: 1
                },
                totalSize: {
                    value: 2
                }
            }]),
            vertexShader: Ot.linedashed_vert,
            fragmentShader: Ot.linedashed_frag
        },
        depth: {
            uniforms: ye([ot.common, ot.displacementmap]),
            vertexShader: Ot.depth_vert,
            fragmentShader: Ot.depth_frag
        },
        normal: {
            uniforms: ye([ot.common, ot.bumpmap, ot.normalmap, ot.displacementmap, {
                opacity: {
                    value: 1
                }
            }]),
            vertexShader: Ot.meshnormal_vert,
            fragmentShader: Ot.meshnormal_frag
        },
        sprite: {
            uniforms: ye([ot.sprite, ot.fog]),
            vertexShader: Ot.sprite_vert,
            fragmentShader: Ot.sprite_frag
        },
        background: {
            uniforms: {
                uvTransform: {
                    value: new Ft
                },
                t2D: {
                    value: null
                },
                backgroundIntensity: {
                    value: 1
                }
            },
            vertexShader: Ot.background_vert,
            fragmentShader: Ot.background_frag
        },
        backgroundCube: {
            uniforms: {
                envMap: {
                    value: null
                },
                flipEnvMap: {
                    value: -1
                },
                backgroundBlurriness: {
                    value: 0
                },
                backgroundIntensity: {
                    value: 1
                },
                backgroundRotation: {
                    value: new Ft
                }
            },
            vertexShader: Ot.backgroundCube_vert,
            fragmentShader: Ot.backgroundCube_frag
        },
        cube: {
            uniforms: {
                tCube: {
                    value: null
                },
                tFlip: {
                    value: -1
                },
                opacity: {
                    value: 1
                }
            },
            vertexShader: Ot.cube_vert,
            fragmentShader: Ot.cube_frag
        },
        equirect: {
            uniforms: {
                tEquirect: {
                    value: null
                }
            },
            vertexShader: Ot.equirect_vert,
            fragmentShader: Ot.equirect_frag
        },
        distanceRGBA: {
            uniforms: ye([ot.common, ot.displacementmap, {
                referencePosition: {
                    value: new F
                },
                nearDistance: {
                    value: 1
                },
                farDistance: {
                    value: 1e3
                }
            }]),
            vertexShader: Ot.distanceRGBA_vert,
            fragmentShader: Ot.distanceRGBA_frag
        },
        shadow: {
            uniforms: ye([ot.lights, ot.fog, {
                color: {
                    value: new Ht(0)
                },
                opacity: {
                    value: 1
                }
            }]),
            vertexShader: Ot.shadow_vert,
            fragmentShader: Ot.shadow_frag
        }
    };
qe.physical = {
    uniforms: ye([qe.standard.uniforms, {
        clearcoat: {
            value: 0
        },
        clearcoatMap: {
            value: null
        },
        clearcoatMapTransform: {
            value: new Ft
        },
        clearcoatNormalMap: {
            value: null
        },
        clearcoatNormalMapTransform: {
            value: new Ft
        },
        clearcoatNormalScale: {
            value: new Lt(1, 1)
        },
        clearcoatRoughness: {
            value: 0
        },
        clearcoatRoughnessMap: {
            value: null
        },
        clearcoatRoughnessMapTransform: {
            value: new Ft
        },
        dispersion: {
            value: 0
        },
        iridescence: {
            value: 0
        },
        iridescenceMap: {
            value: null
        },
        iridescenceMapTransform: {
            value: new Ft
        },
        iridescenceIOR: {
            value: 1.3
        },
        iridescenceThicknessMinimum: {
            value: 100
        },
        iridescenceThicknessMaximum: {
            value: 400
        },
        iridescenceThicknessMap: {
            value: null
        },
        iridescenceThicknessMapTransform: {
            value: new Ft
        },
        sheen: {
            value: 0
        },
        sheenColor: {
            value: new Ht(0)
        },
        sheenColorMap: {
            value: null
        },
        sheenColorMapTransform: {
            value: new Ft
        },
        sheenRoughness: {
            value: 1
        },
        sheenRoughnessMap: {
            value: null
        },
        sheenRoughnessMapTransform: {
            value: new Ft
        },
        transmission: {
            value: 0
        },
        transmissionMap: {
            value: null
        },
        transmissionMapTransform: {
            value: new Ft
        },
        transmissionSamplerSize: {
            value: new Lt
        },
        transmissionSamplerMap: {
            value: null
        },
        thickness: {
            value: 0
        },
        thicknessMap: {
            value: null
        },
        thicknessMapTransform: {
            value: new Ft
        },
        attenuationDistance: {
            value: 0
        },
        attenuationColor: {
            value: new Ht(0)
        },
        specularColor: {
            value: new Ht(1, 1, 1)
        },
        specularColorMap: {
            value: null
        },
        specularColorMapTransform: {
            value: new Ft
        },
        specularIntensity: {
            value: 1
        },
        specularIntensityMap: {
            value: null
        },
        specularIntensityMapTransform: {
            value: new Ft
        },
        anisotropyVector: {
            value: new Lt
        },
        anisotropyMap: {
            value: null
        },
        anisotropyMapTransform: {
            value: new Ft
        }
    }]),
    vertexShader: Ot.meshphysical_vert,
    fragmentShader: Ot.meshphysical_frag
};
const as = {
        r: 0,
        b: 0,
        g: 0
    },
    Pn = new Qe,
    nf = new le;

function sf(i, t, e, n, s, r, a) {
    const o = new Ht(0);
    let c = r === !0 ? 0 : 1,
        l, d, f = null,
        p = 0,
        m = null;

    function x(T) {
        let E = T.isScene === !0 ? T.background : null;
        return E && E.isTexture && (E = (T.backgroundBlurriness > 0 ? e : t).get(E)), E
    }

    function _(T) {
        let E = !1;
        const P = x(T);
        P === null ? h(o, c) : P && P.isColor && (h(P, 1), E = !0);
        const R = i.xr.getEnvironmentBlendMode();
        R === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : R === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (i.autoClear || E) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil))
    }

    function u(T, E) {
        const P = x(E);
        P && (P.isCubeTexture || P.mapping === Es) ? (d === void 0 && (d = new ze(new kn(1, 1, 1), new yn({
            name: "BackgroundCubeMaterial",
            uniforms: fi(qe.backgroundCube.uniforms),
            vertexShader: qe.backgroundCube.vertexShader,
            fragmentShader: qe.backgroundCube.fragmentShader,
            side: we,
            depthTest: !1,
            depthWrite: !1,
            fog: !1,
            allowOverride: !1
        })), d.geometry.deleteAttribute("normal"), d.geometry.deleteAttribute("uv"), d.onBeforeRender = function(R, b, I) {
            this.matrixWorld.copyPosition(I.matrixWorld)
        }, Object.defineProperty(d.material, "envMap", {
            get: function() {
                return this.uniforms.envMap.value
            }
        }), s.update(d)), Pn.copy(E.backgroundRotation), Pn.x *= -1, Pn.y *= -1, Pn.z *= -1, P.isCubeTexture && P.isRenderTargetTexture === !1 && (Pn.y *= -1, Pn.z *= -1), d.material.uniforms.envMap.value = P, d.material.uniforms.flipEnvMap.value = P.isCubeTexture && P.isRenderTargetTexture === !1 ? -1 : 1, d.material.uniforms.backgroundBlurriness.value = E.backgroundBlurriness, d.material.uniforms.backgroundIntensity.value = E.backgroundIntensity, d.material.uniforms.backgroundRotation.value.setFromMatrix4(nf.makeRotationFromEuler(Pn)), d.material.toneMapped = Xt.getTransfer(P.colorSpace) !== Jt, (f !== P || p !== P.version || m !== i.toneMapping) && (d.material.needsUpdate = !0, f = P, p = P.version, m = i.toneMapping), d.layers.enableAll(), T.unshift(d, d.geometry, d.material, 0, 0, null)) : P && P.isTexture && (l === void 0 && (l = new ze(new Ui(2, 2), new yn({
            name: "BackgroundMaterial",
            uniforms: fi(qe.background.uniforms),
            vertexShader: qe.background.vertexShader,
            fragmentShader: qe.background.fragmentShader,
            side: En,
            depthTest: !1,
            depthWrite: !1,
            fog: !1,
            allowOverride: !1
        })), l.geometry.deleteAttribute("normal"), Object.defineProperty(l.material, "map", {
            get: function() {
                return this.uniforms.t2D.value
            }
        }), s.update(l)), l.material.uniforms.t2D.value = P, l.material.uniforms.backgroundIntensity.value = E.backgroundIntensity, l.material.toneMapped = Xt.getTransfer(P.colorSpace) !== Jt, P.matrixAutoUpdate === !0 && P.updateMatrix(), l.material.uniforms.uvTransform.value.copy(P.matrix), (f !== P || p !== P.version || m !== i.toneMapping) && (l.material.needsUpdate = !0, f = P, p = P.version, m = i.toneMapping), l.layers.enableAll(), T.unshift(l, l.geometry, l.material, 0, 0, null))
    }

    function h(T, E) {
        T.getRGB(as, Zo(i)), n.buffers.color.setClear(as.r, as.g, as.b, E, a)
    }

    function w() {
        d !== void 0 && (d.geometry.dispose(), d.material.dispose(), d = void 0), l !== void 0 && (l.geometry.dispose(), l.material.dispose(), l = void 0)
    }
    return {
        getClearColor: function() {
            return o
        },
        setClearColor: function(T, E = 1) {
            o.set(T), c = E, h(o, c)
        },
        getClearAlpha: function() {
            return c
        },
        setClearAlpha: function(T) {
            c = T, h(o, c)
        },
        render: _,
        addToRenderList: u,
        dispose: w
    }
}

function rf(i, t) {
    const e = i.getParameter(i.MAX_VERTEX_ATTRIBS),
        n = {},
        s = p(null);
    let r = s,
        a = !1;

    function o(S, A, G, O, N) {
        let q = !1;
        const V = f(O, G, A);
        r !== V && (r = V, l(r.object)), q = m(S, O, G, N), q && x(S, O, G, N), N !== null && t.update(N, i.ELEMENT_ARRAY_BUFFER), (q || a) && (a = !1, E(S, A, G, O), N !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, t.get(N).buffer))
    }

    function c() {
        return i.createVertexArray()
    }

    function l(S) {
        return i.bindVertexArray(S)
    }

    function d(S) {
        return i.deleteVertexArray(S)
    }

    function f(S, A, G) {
        const O = G.wireframe === !0;
        let N = n[S.id];
        N === void 0 && (N = {}, n[S.id] = N);
        let q = N[A.id];
        q === void 0 && (q = {}, N[A.id] = q);
        let V = q[O];
        return V === void 0 && (V = p(c()), q[O] = V), V
    }

    function p(S) {
        const A = [],
            G = [],
            O = [];
        for (let N = 0; N < e; N++) A[N] = 0, G[N] = 0, O[N] = 0;
        return {
            geometry: null,
            program: null,
            wireframe: !1,
            newAttributes: A,
            enabledAttributes: G,
            attributeDivisors: O,
            object: S,
            attributes: {},
            index: null
        }
    }

    function m(S, A, G, O) {
        const N = r.attributes,
            q = A.attributes;
        let V = 0;
        const K = G.getAttributes();
        for (const z in K)
            if (K[z].location >= 0) {
                const tt = N[z];
                let ft = q[z];
                if (ft === void 0 && (z === "instanceMatrix" && S.instanceMatrix && (ft = S.instanceMatrix), z === "instanceColor" && S.instanceColor && (ft = S.instanceColor)), tt === void 0 || tt.attribute !== ft || ft && tt.data !== ft.data) return !0;
                V++
            } return r.attributesNum !== V || r.index !== O
    }

    function x(S, A, G, O) {
        const N = {},
            q = A.attributes;
        let V = 0;
        const K = G.getAttributes();
        for (const z in K)
            if (K[z].location >= 0) {
                let tt = q[z];
                tt === void 0 && (z === "instanceMatrix" && S.instanceMatrix && (tt = S.instanceMatrix), z === "instanceColor" && S.instanceColor && (tt = S.instanceColor));
                const ft = {};
                ft.attribute = tt, tt && tt.data && (ft.data = tt.data), N[z] = ft, V++
            } r.attributes = N, r.attributesNum = V, r.index = O
    }

    function _() {
        const S = r.newAttributes;
        for (let A = 0, G = S.length; A < G; A++) S[A] = 0
    }

    function u(S) {
        h(S, 0)
    }

    function h(S, A) {
        const G = r.newAttributes,
            O = r.enabledAttributes,
            N = r.attributeDivisors;
        G[S] = 1, O[S] === 0 && (i.enableVertexAttribArray(S), O[S] = 1), N[S] !== A && (i.vertexAttribDivisor(S, A), N[S] = A)
    }

    function w() {
        const S = r.newAttributes,
            A = r.enabledAttributes;
        for (let G = 0, O = A.length; G < O; G++) A[G] !== S[G] && (i.disableVertexAttribArray(G), A[G] = 0)
    }

    function T(S, A, G, O, N, q, V) {
        V === !0 ? i.vertexAttribIPointer(S, A, G, N, q) : i.vertexAttribPointer(S, A, G, O, N, q)
    }

    function E(S, A, G, O) {
        _();
        const N = O.attributes,
            q = G.getAttributes(),
            V = A.defaultAttributeValues;
        for (const K in q) {
            const z = q[K];
            if (z.location >= 0) {
                let st = N[K];
                if (st === void 0 && (K === "instanceMatrix" && S.instanceMatrix && (st = S.instanceMatrix), K === "instanceColor" && S.instanceColor && (st = S.instanceColor)), st !== void 0) {
                    const tt = st.normalized,
                        ft = st.itemSize,
                        Ut = t.get(st);
                    if (Ut === void 0) continue;
                    const $t = Ut.buffer,
                        Yt = Ut.type,
                        X = Ut.bytesPerElement,
                        $ = Yt === i.INT || Yt === i.UNSIGNED_INT || st.gpuType === ta;
                    if (st.isInterleavedBufferAttribute) {
                        const Z = st.data,
                            ut = Z.stride,
                            dt = st.offset;
                        if (Z.isInstancedInterleavedBuffer) {
                            for (let wt = 0; wt < z.locationSize; wt++) h(z.location + wt, Z.meshPerAttribute);
                            S.isInstancedMesh !== !0 && O._maxInstanceCount === void 0 && (O._maxInstanceCount = Z.meshPerAttribute * Z.count)
                        } else
                            for (let wt = 0; wt < z.locationSize; wt++) u(z.location + wt);
                        i.bindBuffer(i.ARRAY_BUFFER, $t);
                        for (let wt = 0; wt < z.locationSize; wt++) T(z.location + wt, ft / z.locationSize, Yt, tt, ut * X, (dt + ft / z.locationSize * wt) * X, $)
                    } else {
                        if (st.isInstancedBufferAttribute) {
                            for (let Z = 0; Z < z.locationSize; Z++) h(z.location + Z, st.meshPerAttribute);
                            S.isInstancedMesh !== !0 && O._maxInstanceCount === void 0 && (O._maxInstanceCount = st.meshPerAttribute * st.count)
                        } else
                            for (let Z = 0; Z < z.locationSize; Z++) u(z.location + Z);
                        i.bindBuffer(i.ARRAY_BUFFER, $t);
                        for (let Z = 0; Z < z.locationSize; Z++) T(z.location + Z, ft / z.locationSize, Yt, tt, ft * X, ft / z.locationSize * Z * X, $)
                    }
                } else if (V !== void 0) {
                    const tt = V[K];
                    if (tt !== void 0) switch (tt.length) {
                        case 2:
                            i.vertexAttrib2fv(z.location, tt);
                            break;
                        case 3:
                            i.vertexAttrib3fv(z.location, tt);
                            break;
                        case 4:
                            i.vertexAttrib4fv(z.location, tt);
                            break;
                        default:
                            i.vertexAttrib1fv(z.location, tt)
                    }
                }
            }
        }
        w()
    }

    function P() {
        I();
        for (const S in n) {
            const A = n[S];
            for (const G in A) {
                const O = A[G];
                for (const N in O) d(O[N].object), delete O[N];
                delete A[G]
            }
            delete n[S]
        }
    }

    function R(S) {
        if (n[S.id] === void 0) return;
        const A = n[S.id];
        for (const G in A) {
            const O = A[G];
            for (const N in O) d(O[N].object), delete O[N];
            delete A[G]
        }
        delete n[S.id]
    }

    function b(S) {
        for (const A in n) {
            const G = n[A];
            if (G[S.id] === void 0) continue;
            const O = G[S.id];
            for (const N in O) d(O[N].object), delete O[N];
            delete G[S.id]
        }
    }

    function I() {
        M(), a = !0, r !== s && (r = s, l(r.object))
    }

    function M() {
        s.geometry = null, s.program = null, s.wireframe = !1
    }
    return {
        setup: o,
        reset: I,
        resetDefaultState: M,
        dispose: P,
        releaseStatesOfGeometry: R,
        releaseStatesOfProgram: b,
        initAttributes: _,
        enableAttribute: u,
        disableUnusedAttributes: w
    }
}

function af(i, t, e) {
    let n;

    function s(l) {
        n = l
    }

    function r(l, d) {
        i.drawArrays(n, l, d), e.update(d, n, 1)
    }

    function a(l, d, f) {
        f !== 0 && (i.drawArraysInstanced(n, l, d, f), e.update(d, n, f))
    }

    function o(l, d, f) {
        if (f === 0) return;
        t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, l, 0, d, 0, f);
        let m = 0;
        for (let x = 0; x < f; x++) m += d[x];
        e.update(m, n, 1)
    }

    function c(l, d, f, p) {
        if (f === 0) return;
        const m = t.get("WEBGL_multi_draw");
        if (m === null)
            for (let x = 0; x < l.length; x++) a(l[x], d[x], p[x]);
        else {
            m.multiDrawArraysInstancedWEBGL(n, l, 0, d, 0, p, 0, f);
            let x = 0;
            for (let _ = 0; _ < f; _++) x += d[_] * p[_];
            e.update(x, n, 1)
        }
    }
    this.setMode = s, this.render = r, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = c
}

function of(i, t, e, n) {
    let s;

    function r() {
        if (s !== void 0) return s;
        if (t.has("EXT_texture_filter_anisotropic") === !0) {
            const b = t.get("EXT_texture_filter_anisotropic");
            s = i.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
        } else s = 0;
        return s
    }

    function a(b) {
        return !(b !== Ve && n.convert(b) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))
    }

    function o(b) {
        const I = b === Di && (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
        return !(b !== Je && n.convert(b) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) && b !== ln && !I)
    }

    function c(b) {
        if (b === "highp") {
            if (i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.HIGH_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.HIGH_FLOAT).precision > 0) return "highp";
            b = "mediump"
        }
        return b === "mediump" && i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.MEDIUM_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp"
    }
    let l = e.precision !== void 0 ? e.precision : "highp";
    const d = c(l);
    d !== l && (console.warn("THREE.WebGLRenderer:", l, "not supported, using", d, "instead."), l = d);
    const f = e.logarithmicDepthBuffer === !0,
        p = e.reversedDepthBuffer === !0 && t.has("EXT_clip_control"),
        m = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),
        x = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
        _ = i.getParameter(i.MAX_TEXTURE_SIZE),
        u = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),
        h = i.getParameter(i.MAX_VERTEX_ATTRIBS),
        w = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),
        T = i.getParameter(i.MAX_VARYING_VECTORS),
        E = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),
        P = x > 0,
        R = i.getParameter(i.MAX_SAMPLES);
    return {
        isWebGL2: !0,
        getMaxAnisotropy: r,
        getMaxPrecision: c,
        textureFormatReadable: a,
        textureTypeReadable: o,
        precision: l,
        logarithmicDepthBuffer: f,
        reversedDepthBuffer: p,
        maxTextures: m,
        maxVertexTextures: x,
        maxTextureSize: _,
        maxCubemapSize: u,
        maxAttributes: h,
        maxVertexUniforms: w,
        maxVaryings: T,
        maxFragmentUniforms: E,
        vertexTextures: P,
        maxSamples: R
    }
}

function lf(i) {
    const t = this;
    let e = null,
        n = 0,
        s = !1,
        r = !1;
    const a = new xn,
        o = new Ft,
        c = {
            value: null,
            needsUpdate: !1
        };
    this.uniform = c, this.numPlanes = 0, this.numIntersection = 0, this.init = function(f, p) {
        const m = f.length !== 0 || p || n !== 0 || s;
        return s = p, n = f.length, m
    }, this.beginShadows = function() {
        r = !0, d(null)
    }, this.endShadows = function() {
        r = !1
    }, this.setGlobalState = function(f, p) {
        e = d(f, p, 0)
    }, this.setState = function(f, p, m) {
        const x = f.clippingPlanes,
            _ = f.clipIntersection,
            u = f.clipShadows,
            h = i.get(f);
        if (!s || x === null || x.length === 0 || r && !u) r ? d(null) : l();
        else {
            const w = r ? 0 : n,
                T = w * 4;
            let E = h.clippingState || null;
            c.value = E, E = d(x, p, T, m);
            for (let P = 0; P !== T; ++P) E[P] = e[P];
            h.clippingState = E, this.numIntersection = _ ? this.numPlanes : 0, this.numPlanes += w
        }
    };

    function l() {
        c.value !== e && (c.value = e, c.needsUpdate = n > 0), t.numPlanes = n, t.numIntersection = 0
    }

    function d(f, p, m, x) {
        const _ = f !== null ? f.length : 0;
        let u = null;
        if (_ !== 0) {
            if (u = c.value, x !== !0 || u === null) {
                const h = m + _ * 4,
                    w = p.matrixWorldInverse;
                o.getNormalMatrix(w), (u === null || u.length < h) && (u = new Float32Array(h));
                for (let T = 0, E = m; T !== _; ++T, E += 4) a.copy(f[T]).applyMatrix4(w, o), a.normal.toArray(u, E), u[E + 3] = a.constant
            }
            c.value = u, c.needsUpdate = !0
        }
        return t.numPlanes = _, t.numIntersection = 0, u
    }
}

function cf(i) {
    let t = new WeakMap;

    function e(a, o) {
        return o === gr ? a.mapping = hi : o === xr && (a.mapping = ui), a
    }

    function n(a) {
        if (a && a.isTexture) {
            const o = a.mapping;
            if (o === gr || o === xr)
                if (t.has(a)) {
                    const c = t.get(a).texture;
                    return e(c, a.mapping)
                } else {
                    const c = a.image;
                    if (c && c.height > 0) {
                        const l = new sh(c.height);
                        return l.fromEquirectangularTexture(i, a), t.set(a, l), a.addEventListener("dispose", s), e(l.texture, a.mapping)
                    } else return null
                }
        }
        return a
    }

    function s(a) {
        const o = a.target;
        o.removeEventListener("dispose", s);
        const c = t.get(o);
        c !== void 0 && (t.delete(o), c.dispose())
    }

    function r() {
        t = new WeakMap
    }
    return {
        get: n,
        dispose: r
    }
}
const ri = 4,
    no = [.125, .215, .35, .446, .526, .582],
    Un = 20,
    er = new nl,
    io = new Ht;
let nr = null,
    ir = 0,
    sr = 0,
    rr = !1;
const Ln = (1 + Math.sqrt(5)) / 2,
    ii = 1 / Ln,
    so = [new F(-Ln, ii, 0), new F(Ln, ii, 0), new F(-ii, 0, Ln), new F(ii, 0, Ln), new F(0, Ln, -ii), new F(0, Ln, ii), new F(-1, 1, -1), new F(1, 1, -1), new F(-1, 1, 1), new F(1, 1, 1)],
    hf = new F;
class ro {
    constructor(t) {
        this._renderer = t, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial)
    }
    fromScene(t, e = 0, n = .1, s = 100, r = {}) {
        const {
            size: a = 256,
            position: o = hf
        } = r;
        nr = this._renderer.getRenderTarget(), ir = this._renderer.getActiveCubeFace(), sr = this._renderer.getActiveMipmapLevel(), rr = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(a);
        const c = this._allocateTargets();
        return c.depthBuffer = !0, this._sceneToCubeUV(t, n, s, c, o), e > 0 && this._blur(c, 0, 0, e), this._applyPMREM(c), this._cleanup(c), c
    }
    fromEquirectangular(t, e = null) {
        return this._fromTexture(t, e)
    }
    fromCubemap(t, e = null) {
        return this._fromTexture(t, e)
    }
    compileCubemapShader() {
        this._cubemapMaterial === null && (this._cubemapMaterial = lo(), this._compileMaterial(this._cubemapMaterial))
    }
    compileEquirectangularShader() {
        this._equirectMaterial === null && (this._equirectMaterial = oo(), this._compileMaterial(this._equirectMaterial))
    }
    dispose() {
        this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose()
    }
    _setSize(t) {
        this._lodMax = Math.floor(Math.log2(t)), this._cubeSize = Math.pow(2, this._lodMax)
    }
    _dispose() {
        this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
        for (let t = 0; t < this._lodPlanes.length; t++) this._lodPlanes[t].dispose()
    }
    _cleanup(t) {
        this._renderer.setRenderTarget(nr, ir, sr), this._renderer.xr.enabled = rr, t.scissorTest = !1, os(t, 0, 0, t.width, t.height)
    }
    _fromTexture(t, e) {
        t.mapping === hi || t.mapping === ui ? this._setSize(t.image.length === 0 ? 16 : t.image[0].width || t.image[0].image.width) : this._setSize(t.image.width / 4), nr = this._renderer.getRenderTarget(), ir = this._renderer.getActiveCubeFace(), sr = this._renderer.getActiveMipmapLevel(), rr = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
        const n = e || this._allocateTargets();
        return this._textureToCubeUV(t, n), this._applyPMREM(n), this._cleanup(n), n
    }
    _allocateTargets() {
        const t = 3 * Math.max(this._cubeSize, 112),
            e = 4 * this._cubeSize,
            n = {
                magFilter: Ke,
                minFilter: Ke,
                generateMipmaps: !1,
                type: Di,
                format: Ve,
                colorSpace: di,
                depthBuffer: !1
            },
            s = ao(t, e, n);
        if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== t || this._pingPongRenderTarget.height !== e) {
            this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = ao(t, e, n);
            const {
                _lodMax: r
            } = this;
            ({
                sizeLods: this._sizeLods,
                lodPlanes: this._lodPlanes,
                sigmas: this._sigmas
            } = uf(r)), this._blurMaterial = df(r, t, e)
        }
        return s
    }
    _compileMaterial(t) {
        const e = new ze(this._lodPlanes[0], t);
        this._renderer.compile(e, er)
    }
    _sceneToCubeUV(t, e, n, s, r) {
        const c = new Oe(90, 1, e, n),
            l = [1, -1, 1, 1, 1, 1],
            d = [1, 1, 1, -1, -1, -1],
            f = this._renderer,
            p = f.autoClear,
            m = f.toneMapping;
        f.getClearColor(io), f.toneMapping = Sn, f.autoClear = !1, f.state.buffers.depth.getReversed() && (f.setRenderTarget(s), f.clearDepth(), f.setRenderTarget(null));
        const _ = new Ko({
                name: "PMREM.Background",
                side: we,
                depthWrite: !1,
                depthTest: !1
            }),
            u = new ze(new kn, _);
        let h = !1;
        const w = t.background;
        w ? w.isColor && (_.color.copy(w), t.background = null, h = !0) : (_.color.copy(io), h = !0);
        for (let T = 0; T < 6; T++) {
            const E = T % 3;
            E === 0 ? (c.up.set(0, l[T], 0), c.position.set(r.x, r.y, r.z), c.lookAt(r.x + d[T], r.y, r.z)) : E === 1 ? (c.up.set(0, 0, l[T]), c.position.set(r.x, r.y, r.z), c.lookAt(r.x, r.y + d[T], r.z)) : (c.up.set(0, l[T], 0), c.position.set(r.x, r.y, r.z), c.lookAt(r.x, r.y, r.z + d[T]));
            const P = this._cubeSize;
            os(s, E * P, T > 2 ? P : 0, P, P), f.setRenderTarget(s), h && f.render(u, c), f.render(t, c)
        }
        u.geometry.dispose(), u.material.dispose(), f.toneMapping = m, f.autoClear = p, t.background = w
    }
    _textureToCubeUV(t, e) {
        const n = this._renderer,
            s = t.mapping === hi || t.mapping === ui;
        s ? (this._cubemapMaterial === null && (this._cubemapMaterial = lo()), this._cubemapMaterial.uniforms.flipEnvMap.value = t.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = oo());
        const r = s ? this._cubemapMaterial : this._equirectMaterial,
            a = new ze(this._lodPlanes[0], r),
            o = r.uniforms;
        o.envMap.value = t;
        const c = this._cubeSize;
        os(e, 0, 0, 3 * c, 2 * c), n.setRenderTarget(e), n.render(a, er)
    }
    _applyPMREM(t) {
        const e = this._renderer,
            n = e.autoClear;
        e.autoClear = !1;
        const s = this._lodPlanes.length;
        for (let r = 1; r < s; r++) {
            const a = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]),
                o = so[(s - r - 1) % so.length];
            this._blur(t, r - 1, r, a, o)
        }
        e.autoClear = n
    }
    _blur(t, e, n, s, r) {
        const a = this._pingPongRenderTarget;
        this._halfBlur(t, a, e, n, s, "latitudinal", r), this._halfBlur(a, t, n, n, s, "longitudinal", r)
    }
    _halfBlur(t, e, n, s, r, a, o) {
        const c = this._renderer,
            l = this._blurMaterial;
        a !== "latitudinal" && a !== "longitudinal" && console.error("blur direction must be either latitudinal or longitudinal!");
        const d = 3,
            f = new ze(this._lodPlanes[s], l),
            p = l.uniforms,
            m = this._sizeLods[n] - 1,
            x = isFinite(r) ? Math.PI / (2 * m) : 2 * Math.PI / (2 * Un - 1),
            _ = r / x,
            u = isFinite(r) ? 1 + Math.floor(d * _) : Un;
        u > Un && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${u} samples when the maximum is set to ${Un}`);
        const h = [];
        let w = 0;
        for (let b = 0; b < Un; ++b) {
            const I = b / _,
                M = Math.exp(-I * I / 2);
            h.push(M), b === 0 ? w += M : b < u && (w += 2 * M)
        }
        for (let b = 0; b < h.length; b++) h[b] = h[b] / w;
        p.envMap.value = t.texture, p.samples.value = u, p.weights.value = h, p.latitudinal.value = a === "latitudinal", o && (p.poleAxis.value = o);
        const {
            _lodMax: T
        } = this;
        p.dTheta.value = x, p.mipInt.value = T - n;
        const E = this._sizeLods[s],
            P = 3 * E * (s > T - ri ? s - T + ri : 0),
            R = 4 * (this._cubeSize - E);
        os(e, P, R, 3 * E, 2 * E), c.setRenderTarget(e), c.render(f, er)
    }
}

function uf(i) {
    const t = [],
        e = [],
        n = [];
    let s = i;
    const r = i - ri + 1 + no.length;
    for (let a = 0; a < r; a++) {
        const o = Math.pow(2, s);
        e.push(o);
        let c = 1 / o;
        a > i - ri ? c = no[a - i + ri - 1] : a === 0 && (c = 0), n.push(c);
        const l = 1 / (o - 2),
            d = -l,
            f = 1 + l,
            p = [d, d, f, d, f, f, d, d, f, f, d, f],
            m = 6,
            x = 6,
            _ = 3,
            u = 2,
            h = 1,
            w = new Float32Array(_ * x * m),
            T = new Float32Array(u * x * m),
            E = new Float32Array(h * x * m);
        for (let R = 0; R < m; R++) {
            const b = R % 3 * 2 / 3 - 1,
                I = R > 2 ? 0 : -1,
                M = [b, I, 0, b + 2 / 3, I, 0, b + 2 / 3, I + 1, 0, b, I, 0, b + 2 / 3, I + 1, 0, b, I + 1, 0];
            w.set(M, _ * x * R), T.set(p, u * x * R);
            const S = [R, R, R, R, R, R];
            E.set(S, h * x * R)
        }
        const P = new un;
        P.setAttribute("position", new je(w, _)), P.setAttribute("uv", new je(T, u)), P.setAttribute("faceIndex", new je(E, h)), t.push(P), s > ri && s--
    }
    return {
        lodPlanes: t,
        sizeLods: e,
        sigmas: n
    }
}

function ao(i, t, e) {
    const n = new Hn(i, t, e);
    return n.texture.mapping = Es, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n
}

function os(i, t, e, n, s) {
    i.viewport.set(t, e, n, s), i.scissor.set(t, e, n, s)
}

function df(i, t, e) {
    const n = new Float32Array(Un),
        s = new F(0, 1, 0);
    return new yn({
        name: "SphericalGaussianBlur",
        defines: {
            n: Un,
            CUBEUV_TEXEL_WIDTH: 1 / t,
            CUBEUV_TEXEL_HEIGHT: 1 / e,
            CUBEUV_MAX_MIP: `${i}.0`
        },
        uniforms: {
            envMap: {
                value: null
            },
            samples: {
                value: 1
            },
            weights: {
                value: n
            },
            latitudinal: {
                value: !1
            },
            dTheta: {
                value: 0
            },
            mipInt: {
                value: 0
            },
            poleAxis: {
                value: s
            }
        },
        vertexShader: ca(),
        fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,
        blending: Mn,
        depthTest: !1,
        depthWrite: !1
    })
}

function oo() {
    return new yn({
        name: "EquirectangularToCubeUV",
        uniforms: {
            envMap: {
                value: null
            }
        },
        vertexShader: ca(),
        fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,
        blending: Mn,
        depthTest: !1,
        depthWrite: !1
    })
}

function lo() {
    return new yn({
        name: "CubemapToCubeUV",
        uniforms: {
            envMap: {
                value: null
            },
            flipEnvMap: {
                value: -1
            }
        },
        vertexShader: ca(),
        fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,
        blending: Mn,
        depthTest: !1,
        depthWrite: !1
    })
}

function ca() {
    return `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`
}

function ff(i) {
    let t = new WeakMap,
        e = null;

    function n(o) {
        if (o && o.isTexture) {
            const c = o.mapping,
                l = c === gr || c === xr,
                d = c === hi || c === ui;
            if (l || d) {
                let f = t.get(o);
                const p = f !== void 0 ? f.texture.pmremVersion : 0;
                if (o.isRenderTargetTexture && o.pmremVersion !== p) return e === null && (e = new ro(i)), f = l ? e.fromEquirectangular(o, f) : e.fromCubemap(o, f), f.texture.pmremVersion = o.pmremVersion, t.set(o, f), f.texture;
                if (f !== void 0) return f.texture;
                {
                    const m = o.image;
                    return l && m && m.height > 0 || d && m && s(m) ? (e === null && (e = new ro(i)), f = l ? e.fromEquirectangular(o) : e.fromCubemap(o), f.texture.pmremVersion = o.pmremVersion, t.set(o, f), o.addEventListener("dispose", r), f.texture) : null
                }
            }
        }
        return o
    }

    function s(o) {
        let c = 0;
        const l = 6;
        for (let d = 0; d < l; d++) o[d] !== void 0 && c++;
        return c === l
    }

    function r(o) {
        const c = o.target;
        c.removeEventListener("dispose", r);
        const l = t.get(c);
        l !== void 0 && (t.delete(c), l.dispose())
    }

    function a() {
        t = new WeakMap, e !== null && (e.dispose(), e = null)
    }
    return {
        get: n,
        dispose: a
    }
}

function pf(i) {
    const t = {};

    function e(n) {
        if (t[n] !== void 0) return t[n];
        let s;
        switch (n) {
            case "WEBGL_depth_texture":
                s = i.getExtension("WEBGL_depth_texture") || i.getExtension("MOZ_WEBGL_depth_texture") || i.getExtension("WEBKIT_WEBGL_depth_texture");
                break;
            case "EXT_texture_filter_anisotropic":
                s = i.getExtension("EXT_texture_filter_anisotropic") || i.getExtension("MOZ_EXT_texture_filter_anisotropic") || i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
                break;
            case "WEBGL_compressed_texture_s3tc":
                s = i.getExtension("WEBGL_compressed_texture_s3tc") || i.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
                break;
            case "WEBGL_compressed_texture_pvrtc":
                s = i.getExtension("WEBGL_compressed_texture_pvrtc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
                break;
            default:
                s = i.getExtension(n)
        }
        return t[n] = s, s
    }
    return {
        has: function(n) {
            return e(n) !== null
        },
        init: function() {
            e("EXT_color_buffer_float"), e("WEBGL_clip_cull_distance"), e("OES_texture_float_linear"), e("EXT_color_buffer_half_float"), e("WEBGL_multisampled_render_to_texture"), e("WEBGL_render_shared_exponent")
        },
        get: function(n) {
            const s = e(n);
            return s === null && oi("THREE.WebGLRenderer: " + n + " extension not supported."), s
        }
    }
}

function mf(i, t, e, n) {
    const s = {},
        r = new WeakMap;

    function a(f) {
        const p = f.target;
        p.index !== null && t.remove(p.index);
        for (const x in p.attributes) t.remove(p.attributes[x]);
        p.removeEventListener("dispose", a), delete s[p.id];
        const m = r.get(p);
        m && (t.remove(m), r.delete(p)), n.releaseStatesOfGeometry(p), p.isInstancedBufferGeometry === !0 && delete p._maxInstanceCount, e.memory.geometries--
    }

    function o(f, p) {
        return s[p.id] === !0 || (p.addEventListener("dispose", a), s[p.id] = !0, e.memory.geometries++), p
    }

    function c(f) {
        const p = f.attributes;
        for (const m in p) t.update(p[m], i.ARRAY_BUFFER)
    }

    function l(f) {
        const p = [],
            m = f.index,
            x = f.attributes.position;
        let _ = 0;
        if (m !== null) {
            const w = m.array;
            _ = m.version;
            for (let T = 0, E = w.length; T < E; T += 3) {
                const P = w[T + 0],
                    R = w[T + 1],
                    b = w[T + 2];
                p.push(P, R, R, b, b, P)
            }
        } else if (x !== void 0) {
            const w = x.array;
            _ = x.version;
            for (let T = 0, E = w.length / 3 - 1; T < E; T += 3) {
                const P = T + 0,
                    R = T + 1,
                    b = T + 2;
                p.push(P, R, R, b, b, P)
            }
        } else return;
        const u = new(Xo(p) ? jo : $o)(p, 1);
        u.version = _;
        const h = r.get(f);
        h && t.remove(h), r.set(f, u)
    }

    function d(f) {
        const p = r.get(f);
        if (p) {
            const m = f.index;
            m !== null && p.version < m.version && l(f)
        } else l(f);
        return r.get(f)
    }
    return {
        get: o,
        update: c,
        getWireframeAttribute: d
    }
}

function _f(i, t, e) {
    let n;

    function s(p) {
        n = p
    }
    let r, a;

    function o(p) {
        r = p.type, a = p.bytesPerElement
    }

    function c(p, m) {
        i.drawElements(n, m, r, p * a), e.update(m, n, 1)
    }

    function l(p, m, x) {
        x !== 0 && (i.drawElementsInstanced(n, m, r, p * a, x), e.update(m, n, x))
    }

    function d(p, m, x) {
        if (x === 0) return;
        t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, m, 0, r, p, 0, x);
        let u = 0;
        for (let h = 0; h < x; h++) u += m[h];
        e.update(u, n, 1)
    }

    function f(p, m, x, _) {
        if (x === 0) return;
        const u = t.get("WEBGL_multi_draw");
        if (u === null)
            for (let h = 0; h < p.length; h++) l(p[h] / a, m[h], _[h]);
        else {
            u.multiDrawElementsInstancedWEBGL(n, m, 0, r, p, 0, _, 0, x);
            let h = 0;
            for (let w = 0; w < x; w++) h += m[w] * _[w];
            e.update(h, n, 1)
        }
    }
    this.setMode = s, this.setIndex = o, this.render = c, this.renderInstances = l, this.renderMultiDraw = d, this.renderMultiDrawInstances = f
}

function gf(i) {
    const t = {
            geometries: 0,
            textures: 0
        },
        e = {
            frame: 0,
            calls: 0,
            triangles: 0,
            points: 0,
            lines: 0
        };

    function n(r, a, o) {
        switch (e.calls++, a) {
            case i.TRIANGLES:
                e.triangles += o * (r / 3);
                break;
            case i.LINES:
                e.lines += o * (r / 2);
                break;
            case i.LINE_STRIP:
                e.lines += o * (r - 1);
                break;
            case i.LINE_LOOP:
                e.lines += o * r;
                break;
            case i.POINTS:
                e.points += o * r;
                break;
            default:
                console.error("THREE.WebGLInfo: Unknown draw mode:", a);
                break
        }
    }

    function s() {
        e.calls = 0, e.triangles = 0, e.points = 0, e.lines = 0
    }
    return {
        memory: t,
        render: e,
        programs: null,
        autoReset: !0,
        reset: s,
        update: n
    }
}

function xf(i, t, e) {
    const n = new WeakMap,
        s = new he;

    function r(a, o, c) {
        const l = a.morphTargetInfluences,
            d = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color,
            f = d !== void 0 ? d.length : 0;
        let p = n.get(o);
        if (p === void 0 || p.count !== f) {
            let S = function() {
                I.dispose(), n.delete(o), o.removeEventListener("dispose", S)
            };
            var m = S;
            p !== void 0 && p.texture.dispose();
            const x = o.morphAttributes.position !== void 0,
                _ = o.morphAttributes.normal !== void 0,
                u = o.morphAttributes.color !== void 0,
                h = o.morphAttributes.position || [],
                w = o.morphAttributes.normal || [],
                T = o.morphAttributes.color || [];
            let E = 0;
            x === !0 && (E = 1), _ === !0 && (E = 2), u === !0 && (E = 3);
            let P = o.attributes.position.count * E,
                R = 1;
            P > t.maxTextureSize && (R = Math.ceil(P / t.maxTextureSize), P = t.maxTextureSize);
            const b = new Float32Array(P * R * 4 * f),
                I = new qo(b, P, R, f);
            I.type = ln, I.needsUpdate = !0;
            const M = E * 4;
            for (let A = 0; A < f; A++) {
                const G = h[A],
                    O = w[A],
                    N = T[A],
                    q = P * R * 4 * A;
                for (let V = 0; V < G.count; V++) {
                    const K = V * M;
                    x === !0 && (s.fromBufferAttribute(G, V), b[q + K + 0] = s.x, b[q + K + 1] = s.y, b[q + K + 2] = s.z, b[q + K + 3] = 0), _ === !0 && (s.fromBufferAttribute(O, V), b[q + K + 4] = s.x, b[q + K + 5] = s.y, b[q + K + 6] = s.z, b[q + K + 7] = 0), u === !0 && (s.fromBufferAttribute(N, V), b[q + K + 8] = s.x, b[q + K + 9] = s.y, b[q + K + 10] = s.z, b[q + K + 11] = N.itemSize === 4 ? s.w : 1)
                }
            }
            p = {
                count: f,
                texture: I,
                size: new Lt(P, R)
            }, n.set(o, p), o.addEventListener("dispose", S)
        }
        if (a.isInstancedMesh === !0 && a.morphTexture !== null) c.getUniforms().setValue(i, "morphTexture", a.morphTexture, e);
        else {
            let x = 0;
            for (let u = 0; u < l.length; u++) x += l[u];
            const _ = o.morphTargetsRelative ? 1 : 1 - x;
            c.getUniforms().setValue(i, "morphTargetBaseInfluence", _), c.getUniforms().setValue(i, "morphTargetInfluences", l)
        }
        c.getUniforms().setValue(i, "morphTargetsTexture", p.texture, e), c.getUniforms().setValue(i, "morphTargetsTextureSize", p.size)
    }
    return {
        update: r
    }
}

function vf(i, t, e, n) {
    let s = new WeakMap;

    function r(c) {
        const l = n.render.frame,
            d = c.geometry,
            f = t.get(c, d);
        if (s.get(f) !== l && (t.update(f), s.set(f, l)), c.isInstancedMesh && (c.hasEventListener("dispose", o) === !1 && c.addEventListener("dispose", o), s.get(c) !== l && (e.update(c.instanceMatrix, i.ARRAY_BUFFER), c.instanceColor !== null && e.update(c.instanceColor, i.ARRAY_BUFFER), s.set(c, l))), c.isSkinnedMesh) {
            const p = c.skeleton;
            s.get(p) !== l && (p.update(), s.set(p, l))
        }
        return f
    }

    function a() {
        s = new WeakMap
    }

    function o(c) {
        const l = c.target;
        l.removeEventListener("dispose", o), e.remove(l.instanceMatrix), l.instanceColor !== null && e.remove(l.instanceColor)
    }
    return {
        update: r,
        dispose: a
    }
}
const sl = new Re,
    co = new tl(1, 1),
    rl = new qo,
    al = new kc,
    ol = new Qo,
    ho = [],
    uo = [],
    fo = new Float32Array(16),
    po = new Float32Array(9),
    mo = new Float32Array(4);

function mi(i, t, e) {
    const n = i[0];
    if (n <= 0 || n > 0) return i;
    const s = t * e;
    let r = ho[s];
    if (r === void 0 && (r = new Float32Array(s), ho[s] = r), t !== 0) {
        n.toArray(r, 0);
        for (let a = 1, o = 0; a !== t; ++a) o += e, i[a].toArray(r, o)
    }
    return r
}

function pe(i, t) {
    if (i.length !== t.length) return !1;
    for (let e = 0, n = i.length; e < n; e++)
        if (i[e] !== t[e]) return !1;
    return !0
}

function me(i, t) {
    for (let e = 0, n = t.length; e < n; e++) i[e] = t[e]
}

function bs(i, t) {
    let e = uo[t];
    e === void 0 && (e = new Int32Array(t), uo[t] = e);
    for (let n = 0; n !== t; ++n) e[n] = i.allocateTextureUnit();
    return e
}

function Mf(i, t) {
    const e = this.cache;
    e[0] !== t && (i.uniform1f(this.addr, t), e[0] = t)
}

function Sf(i, t) {
    const e = this.cache;
    if (t.x !== void 0)(e[0] !== t.x || e[1] !== t.y) && (i.uniform2f(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
    else {
        if (pe(e, t)) return;
        i.uniform2fv(this.addr, t), me(e, t)
    }
}

function Ef(i, t) {
    const e = this.cache;
    if (t.x !== void 0)(e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3f(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
    else if (t.r !== void 0)(e[0] !== t.r || e[1] !== t.g || e[2] !== t.b) && (i.uniform3f(this.addr, t.r, t.g, t.b), e[0] = t.r, e[1] = t.g, e[2] = t.b);
    else {
        if (pe(e, t)) return;
        i.uniform3fv(this.addr, t), me(e, t)
    }
}

function yf(i, t) {
    const e = this.cache;
    if (t.x !== void 0)(e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4f(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
    else {
        if (pe(e, t)) return;
        i.uniform4fv(this.addr, t), me(e, t)
    }
}

function Tf(i, t) {
    const e = this.cache,
        n = t.elements;
    if (n === void 0) {
        if (pe(e, t)) return;
        i.uniformMatrix2fv(this.addr, !1, t), me(e, t)
    } else {
        if (pe(e, n)) return;
        mo.set(n), i.uniformMatrix2fv(this.addr, !1, mo), me(e, n)
    }
}

function bf(i, t) {
    const e = this.cache,
        n = t.elements;
    if (n === void 0) {
        if (pe(e, t)) return;
        i.uniformMatrix3fv(this.addr, !1, t), me(e, t)
    } else {
        if (pe(e, n)) return;
        po.set(n), i.uniformMatrix3fv(this.addr, !1, po), me(e, n)
    }
}

function Af(i, t) {
    const e = this.cache,
        n = t.elements;
    if (n === void 0) {
        if (pe(e, t)) return;
        i.uniformMatrix4fv(this.addr, !1, t), me(e, t)
    } else {
        if (pe(e, n)) return;
        fo.set(n), i.uniformMatrix4fv(this.addr, !1, fo), me(e, n)
    }
}

function wf(i, t) {
    const e = this.cache;
    e[0] !== t && (i.uniform1i(this.addr, t), e[0] = t)
}

function Rf(i, t) {
    const e = this.cache;
    if (t.x !== void 0)(e[0] !== t.x || e[1] !== t.y) && (i.uniform2i(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
    else {
        if (pe(e, t)) return;
        i.uniform2iv(this.addr, t), me(e, t)
    }
}

function Cf(i, t) {
    const e = this.cache;
    if (t.x !== void 0)(e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3i(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
    else {
        if (pe(e, t)) return;
        i.uniform3iv(this.addr, t), me(e, t)
    }
}

function Pf(i, t) {
    const e = this.cache;
    if (t.x !== void 0)(e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4i(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
    else {
        if (pe(e, t)) return;
        i.uniform4iv(this.addr, t), me(e, t)
    }
}

function Df(i, t) {
    const e = this.cache;
    e[0] !== t && (i.uniform1ui(this.addr, t), e[0] = t)
}

function Lf(i, t) {
    const e = this.cache;
    if (t.x !== void 0)(e[0] !== t.x || e[1] !== t.y) && (i.uniform2ui(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
    else {
        if (pe(e, t)) return;
        i.uniform2uiv(this.addr, t), me(e, t)
    }
}

function If(i, t) {
    const e = this.cache;
    if (t.x !== void 0)(e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3ui(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
    else {
        if (pe(e, t)) return;
        i.uniform3uiv(this.addr, t), me(e, t)
    }
}

function Uf(i, t) {
    const e = this.cache;
    if (t.x !== void 0)(e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4ui(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
    else {
        if (pe(e, t)) return;
        i.uniform4uiv(this.addr, t), me(e, t)
    }
}

function Nf(i, t, e) {
    const n = this.cache,
        s = e.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s);
    let r;
    this.type === i.SAMPLER_2D_SHADOW ? (co.compareFunction = Wo, r = co) : r = sl, e.setTexture2D(t || r, s)
}

function Ff(i, t, e) {
    const n = this.cache,
        s = e.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTexture3D(t || al, s)
}

function Of(i, t, e) {
    const n = this.cache,
        s = e.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTextureCube(t || ol, s)
}

function Bf(i, t, e) {
    const n = this.cache,
        s = e.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTexture2DArray(t || rl, s)
}

function zf(i) {
    switch (i) {
        case 5126:
            return Mf;
        case 35664:
            return Sf;
        case 35665:
            return Ef;
        case 35666:
            return yf;
        case 35674:
            return Tf;
        case 35675:
            return bf;
        case 35676:
            return Af;
        case 5124:
        case 35670:
            return wf;
        case 35667:
        case 35671:
            return Rf;
        case 35668:
        case 35672:
            return Cf;
        case 35669:
        case 35673:
            return Pf;
        case 5125:
            return Df;
        case 36294:
            return Lf;
        case 36295:
            return If;
        case 36296:
            return Uf;
        case 35678:
        case 36198:
        case 36298:
        case 36306:
        case 35682:
            return Nf;
        case 35679:
        case 36299:
        case 36307:
            return Ff;
        case 35680:
        case 36300:
        case 36308:
        case 36293:
            return Of;
        case 36289:
        case 36303:
        case 36311:
        case 36292:
            return Bf
    }
}

function Hf(i, t) {
    i.uniform1fv(this.addr, t)
}

function kf(i, t) {
    const e = mi(t, this.size, 2);
    i.uniform2fv(this.addr, e)
}

function Gf(i, t) {
    const e = mi(t, this.size, 3);
    i.uniform3fv(this.addr, e)
}

function Vf(i, t) {
    const e = mi(t, this.size, 4);
    i.uniform4fv(this.addr, e)
}

function Wf(i, t) {
    const e = mi(t, this.size, 4);
    i.uniformMatrix2fv(this.addr, !1, e)
}

function Xf(i, t) {
    const e = mi(t, this.size, 9);
    i.uniformMatrix3fv(this.addr, !1, e)
}

function qf(i, t) {
    const e = mi(t, this.size, 16);
    i.uniformMatrix4fv(this.addr, !1, e)
}

function Yf(i, t) {
    i.uniform1iv(this.addr, t)
}

function Kf(i, t) {
    i.uniform2iv(this.addr, t)
}

function $f(i, t) {
    i.uniform3iv(this.addr, t)
}

function jf(i, t) {
    i.uniform4iv(this.addr, t)
}

function Zf(i, t) {
    i.uniform1uiv(this.addr, t)
}

function Jf(i, t) {
    i.uniform2uiv(this.addr, t)
}

function Qf(i, t) {
    i.uniform3uiv(this.addr, t)
}

function tp(i, t) {
    i.uniform4uiv(this.addr, t)
}

function ep(i, t, e) {
    const n = this.cache,
        s = t.length,
        r = bs(e, s);
    pe(n, r) || (i.uniform1iv(this.addr, r), me(n, r));
    for (let a = 0; a !== s; ++a) e.setTexture2D(t[a] || sl, r[a])
}

function np(i, t, e) {
    const n = this.cache,
        s = t.length,
        r = bs(e, s);
    pe(n, r) || (i.uniform1iv(this.addr, r), me(n, r));
    for (let a = 0; a !== s; ++a) e.setTexture3D(t[a] || al, r[a])
}

function ip(i, t, e) {
    const n = this.cache,
        s = t.length,
        r = bs(e, s);
    pe(n, r) || (i.uniform1iv(this.addr, r), me(n, r));
    for (let a = 0; a !== s; ++a) e.setTextureCube(t[a] || ol, r[a])
}

function sp(i, t, e) {
    const n = this.cache,
        s = t.length,
        r = bs(e, s);
    pe(n, r) || (i.uniform1iv(this.addr, r), me(n, r));
    for (let a = 0; a !== s; ++a) e.setTexture2DArray(t[a] || rl, r[a])
}

function rp(i) {
    switch (i) {
        case 5126:
            return Hf;
        case 35664:
            return kf;
        case 35665:
            return Gf;
        case 35666:
            return Vf;
        case 35674:
            return Wf;
        case 35675:
            return Xf;
        case 35676:
            return qf;
        case 5124:
        case 35670:
            return Yf;
        case 35667:
        case 35671:
            return Kf;
        case 35668:
        case 35672:
            return $f;
        case 35669:
        case 35673:
            return jf;
        case 5125:
            return Zf;
        case 36294:
            return Jf;
        case 36295:
            return Qf;
        case 36296:
            return tp;
        case 35678:
        case 36198:
        case 36298:
        case 36306:
        case 35682:
            return ep;
        case 35679:
        case 36299:
        case 36307:
            return np;
        case 35680:
        case 36300:
        case 36308:
        case 36293:
            return ip;
        case 36289:
        case 36303:
        case 36311:
        case 36292:
            return sp
    }
}
class ap {
    constructor(t, e, n) {
        this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.setValue = zf(e.type)
    }
}
class op {
    constructor(t, e, n) {
        this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.size = e.size, this.setValue = rp(e.type)
    }
}
class lp {
    constructor(t) {
        this.id = t, this.seq = [], this.map = {}
    }
    setValue(t, e, n) {
        const s = this.seq;
        for (let r = 0, a = s.length; r !== a; ++r) {
            const o = s[r];
            o.setValue(t, e[o.id], n)
        }
    }
}
const ar = /(\w+)(\])?(\[|\.)?/g;

function _o(i, t) {
    i.seq.push(t), i.map[t.id] = t
}

function cp(i, t, e) {
    const n = i.name,
        s = n.length;
    for (ar.lastIndex = 0;;) {
        const r = ar.exec(n),
            a = ar.lastIndex;
        let o = r[1];
        const c = r[2] === "]",
            l = r[3];
        if (c && (o = o | 0), l === void 0 || l === "[" && a + 2 === s) {
            _o(e, l === void 0 ? new ap(o, i, t) : new op(o, i, t));
            break
        } else {
            let f = e.map[o];
            f === void 0 && (f = new lp(o), _o(e, f)), e = f
        }
    }
}
class _s {
    constructor(t, e) {
        this.seq = [], this.map = {};
        const n = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
        for (let s = 0; s < n; ++s) {
            const r = t.getActiveUniform(e, s),
                a = t.getUniformLocation(e, r.name);
            cp(r, a, this)
        }
    }
    setValue(t, e, n, s) {
        const r = this.map[e];
        r !== void 0 && r.setValue(t, n, s)
    }
    setOptional(t, e, n) {
        const s = e[n];
        s !== void 0 && this.setValue(t, n, s)
    }
    static upload(t, e, n, s) {
        for (let r = 0, a = e.length; r !== a; ++r) {
            const o = e[r],
                c = n[o.id];
            c.needsUpdate !== !1 && o.setValue(t, c.value, s)
        }
    }
    static seqWithValue(t, e) {
        const n = [];
        for (let s = 0, r = t.length; s !== r; ++s) {
            const a = t[s];
            a.id in e && n.push(a)
        }
        return n
    }
}

function go(i, t, e) {
    const n = i.createShader(t);
    return i.shaderSource(n, e), i.compileShader(n), n
}
const hp = 37297;
let up = 0;

function dp(i, t) {
    const e = i.split(`
`),
        n = [],
        s = Math.max(t - 6, 0),
        r = Math.min(t + 6, e.length);
    for (let a = s; a < r; a++) {
        const o = a + 1;
        n.push(`${o===t?">":" "} ${o}: ${e[a]}`)
    }
    return n.join(`
`)
}
const xo = new Ft;

function fp(i) {
    Xt._getMatrix(xo, Xt.workingColorSpace, i);
    const t = `mat3( ${xo.elements.map(e=>e.toFixed(4))} )`;
    switch (Xt.getTransfer(i)) {
        case gs:
            return [t, "LinearTransferOETF"];
        case Jt:
            return [t, "sRGBTransferOETF"];
        default:
            return console.warn("THREE.WebGLProgram: Unsupported color space: ", i), [t, "LinearTransferOETF"]
    }
}

function vo(i, t, e) {
    const n = i.getShaderParameter(t, i.COMPILE_STATUS),
        r = (i.getShaderInfoLog(t) || "").trim();
    if (n && r === "") return "";
    const a = /ERROR: 0:(\d+)/.exec(r);
    if (a) {
        const o = parseInt(a[1]);
        return e.toUpperCase() + `

` + r + `

` + dp(i.getShaderSource(t), o)
    } else return r
}

function pp(i, t) {
    const e = fp(t);
    return [`vec4 ${i}( vec4 value ) {`, `	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`, "}"].join(`
`)
}

function mp(i, t) {
    let e;
    switch (t) {
        case pc:
            e = "Linear";
            break;
        case mc:
            e = "Reinhard";
            break;
        case _c:
            e = "Cineon";
            break;
        case gc:
            e = "ACESFilmic";
            break;
        case vc:
            e = "AgX";
            break;
        case Mc:
            e = "Neutral";
            break;
        case xc:
            e = "Custom";
            break;
        default:
            console.warn("THREE.WebGLProgram: Unsupported toneMapping:", t), e = "Linear"
    }
    return "vec3 " + i + "( vec3 color ) { return " + e + "ToneMapping( color ); }"
}
const ls = new F;

function _p() {
    Xt.getLuminanceCoefficients(ls);
    const i = ls.x.toFixed(4),
        t = ls.y.toFixed(4),
        e = ls.z.toFixed(4);
    return ["float luminance( const in vec3 rgb ) {", `	const vec3 weights = vec3( ${i}, ${t}, ${e} );`, "	return dot( weights, rgb );", "}"].join(`
`)
}

function gp(i) {
    return [i.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "", i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""].filter(Ti).join(`
`)
}

function xp(i) {
    const t = [];
    for (const e in i) {
        const n = i[e];
        n !== !1 && t.push("#define " + e + " " + n)
    }
    return t.join(`
`)
}

function vp(i, t) {
    const e = {},
        n = i.getProgramParameter(t, i.ACTIVE_ATTRIBUTES);
    for (let s = 0; s < n; s++) {
        const r = i.getActiveAttrib(t, s),
            a = r.name;
        let o = 1;
        r.type === i.FLOAT_MAT2 && (o = 2), r.type === i.FLOAT_MAT3 && (o = 3), r.type === i.FLOAT_MAT4 && (o = 4), e[a] = {
            type: r.type,
            location: i.getAttribLocation(t, a),
            locationSize: o
        }
    }
    return e
}

function Ti(i) {
    return i !== ""
}

function Mo(i, t) {
    const e = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
    return i.replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, e).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows)
}

function So(i, t) {
    return i.replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection)
}
const Mp = /^[ \t]*#include +<([\w\d./]+)>/gm;

function jr(i) {
    return i.replace(Mp, Ep)
}
const Sp = new Map;

function Ep(i, t) {
    let e = Ot[t];
    if (e === void 0) {
        const n = Sp.get(t);
        if (n !== void 0) e = Ot[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', t, n);
        else throw new Error("Can not resolve #include <" + t + ">")
    }
    return jr(e)
}
const yp = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;

function Eo(i) {
    return i.replace(yp, Tp)
}

function Tp(i, t, e, n) {
    let s = "";
    for (let r = parseInt(t); r < parseInt(e); r++) s += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
    return s
}

function yo(i) {
    let t = `precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;
    return i.precision === "highp" ? t += `
#define HIGH_PRECISION` : i.precision === "mediump" ? t += `
#define MEDIUM_PRECISION` : i.precision === "lowp" && (t += `
#define LOW_PRECISION`), t
}

function bp(i) {
    let t = "SHADOWMAP_TYPE_BASIC";
    return i.shadowMapType === Do ? t = "SHADOWMAP_TYPE_PCF" : i.shadowMapType === Lo ? t = "SHADOWMAP_TYPE_PCF_SOFT" : i.shadowMapType === on && (t = "SHADOWMAP_TYPE_VSM"), t
}

function Ap(i) {
    let t = "ENVMAP_TYPE_CUBE";
    if (i.envMap) switch (i.envMapMode) {
        case hi:
        case ui:
            t = "ENVMAP_TYPE_CUBE";
            break;
        case Es:
            t = "ENVMAP_TYPE_CUBE_UV";
            break
    }
    return t
}

function wp(i) {
    let t = "ENVMAP_MODE_REFLECTION";
    return i.envMap && i.envMapMode === ui && (t = "ENVMAP_MODE_REFRACTION"), t
}

function Rp(i) {
    let t = "ENVMAP_BLENDING_NONE";
    if (i.envMap) switch (i.combine) {
        case Io:
            t = "ENVMAP_BLENDING_MULTIPLY";
            break;
        case dc:
            t = "ENVMAP_BLENDING_MIX";
            break;
        case fc:
            t = "ENVMAP_BLENDING_ADD";
            break
    }
    return t
}

function Cp(i) {
    const t = i.envMapCubeUVHeight;
    if (t === null) return null;
    const e = Math.log2(t) - 2,
        n = 1 / t;
    return {
        texelWidth: 1 / (3 * Math.max(Math.pow(2, e), 112)),
        texelHeight: n,
        maxMip: e
    }
}

function Pp(i, t, e, n) {
    const s = i.getContext(),
        r = e.defines;
    let a = e.vertexShader,
        o = e.fragmentShader;
    const c = bp(e),
        l = Ap(e),
        d = wp(e),
        f = Rp(e),
        p = Cp(e),
        m = gp(e),
        x = xp(r),
        _ = s.createProgram();
    let u, h, w = e.glslVersion ? "#version " + e.glslVersion + `
` : "";
    e.isRawShaderMaterial ? (u = ["#define SHADER_TYPE " + e.shaderType, "#define SHADER_NAME " + e.shaderName, x].filter(Ti).join(`
`), u.length > 0 && (u += `
`), h = ["#define SHADER_TYPE " + e.shaderType, "#define SHADER_NAME " + e.shaderName, x].filter(Ti).join(`
`), h.length > 0 && (h += `
`)) : (u = [yo(e), "#define SHADER_TYPE " + e.shaderType, "#define SHADER_NAME " + e.shaderName, x, e.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "", e.batching ? "#define USE_BATCHING" : "", e.batchingColor ? "#define USE_BATCHING_COLOR" : "", e.instancing ? "#define USE_INSTANCING" : "", e.instancingColor ? "#define USE_INSTANCING_COLOR" : "", e.instancingMorph ? "#define USE_INSTANCING_MORPH" : "", e.useFog && e.fog ? "#define USE_FOG" : "", e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "", e.map ? "#define USE_MAP" : "", e.envMap ? "#define USE_ENVMAP" : "", e.envMap ? "#define " + d : "", e.lightMap ? "#define USE_LIGHTMAP" : "", e.aoMap ? "#define USE_AOMAP" : "", e.bumpMap ? "#define USE_BUMPMAP" : "", e.normalMap ? "#define USE_NORMALMAP" : "", e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", e.displacementMap ? "#define USE_DISPLACEMENTMAP" : "", e.emissiveMap ? "#define USE_EMISSIVEMAP" : "", e.anisotropy ? "#define USE_ANISOTROPY" : "", e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "", e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", e.specularMap ? "#define USE_SPECULARMAP" : "", e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", e.metalnessMap ? "#define USE_METALNESSMAP" : "", e.alphaMap ? "#define USE_ALPHAMAP" : "", e.alphaHash ? "#define USE_ALPHAHASH" : "", e.transmission ? "#define USE_TRANSMISSION" : "", e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", e.thicknessMap ? "#define USE_THICKNESSMAP" : "", e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", e.mapUv ? "#define MAP_UV " + e.mapUv : "", e.alphaMapUv ? "#define ALPHAMAP_UV " + e.alphaMapUv : "", e.lightMapUv ? "#define LIGHTMAP_UV " + e.lightMapUv : "", e.aoMapUv ? "#define AOMAP_UV " + e.aoMapUv : "", e.emissiveMapUv ? "#define EMISSIVEMAP_UV " + e.emissiveMapUv : "", e.bumpMapUv ? "#define BUMPMAP_UV " + e.bumpMapUv : "", e.normalMapUv ? "#define NORMALMAP_UV " + e.normalMapUv : "", e.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + e.displacementMapUv : "", e.metalnessMapUv ? "#define METALNESSMAP_UV " + e.metalnessMapUv : "", e.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + e.roughnessMapUv : "", e.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + e.anisotropyMapUv : "", e.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + e.clearcoatMapUv : "", e.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + e.clearcoatNormalMapUv : "", e.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + e.clearcoatRoughnessMapUv : "", e.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + e.iridescenceMapUv : "", e.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + e.iridescenceThicknessMapUv : "", e.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + e.sheenColorMapUv : "", e.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + e.sheenRoughnessMapUv : "", e.specularMapUv ? "#define SPECULARMAP_UV " + e.specularMapUv : "", e.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + e.specularColorMapUv : "", e.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + e.specularIntensityMapUv : "", e.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + e.transmissionMapUv : "", e.thicknessMapUv ? "#define THICKNESSMAP_UV " + e.thicknessMapUv : "", e.vertexTangents && e.flatShading === !1 ? "#define USE_TANGENT" : "", e.vertexColors ? "#define USE_COLOR" : "", e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", e.vertexUv1s ? "#define USE_UV1" : "", e.vertexUv2s ? "#define USE_UV2" : "", e.vertexUv3s ? "#define USE_UV3" : "", e.pointsUvs ? "#define USE_POINTS_UV" : "", e.flatShading ? "#define FLAT_SHADED" : "", e.skinning ? "#define USE_SKINNING" : "", e.morphTargets ? "#define USE_MORPHTARGETS" : "", e.morphNormals && e.flatShading === !1 ? "#define USE_MORPHNORMALS" : "", e.morphColors ? "#define USE_MORPHCOLORS" : "", e.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + e.morphTextureStride : "", e.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + e.morphTargetsCount : "", e.doubleSided ? "#define DOUBLE_SIDED" : "", e.flipSided ? "#define FLIP_SIDED" : "", e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", e.shadowMapEnabled ? "#define " + c : "", e.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "", e.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", e.reversedDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "", "uniform mat4 modelMatrix;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform mat4 viewMatrix;", "uniform mat3 normalMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", "#ifdef USE_INSTANCING", "	attribute mat4 instanceMatrix;", "#endif", "#ifdef USE_INSTANCING_COLOR", "	attribute vec3 instanceColor;", "#endif", "#ifdef USE_INSTANCING_MORPH", "	uniform sampler2D morphTexture;", "#endif", "attribute vec3 position;", "attribute vec3 normal;", "attribute vec2 uv;", "#ifdef USE_UV1", "	attribute vec2 uv1;", "#endif", "#ifdef USE_UV2", "	attribute vec2 uv2;", "#endif", "#ifdef USE_UV3", "	attribute vec2 uv3;", "#endif", "#ifdef USE_TANGENT", "	attribute vec4 tangent;", "#endif", "#if defined( USE_COLOR_ALPHA )", "	attribute vec4 color;", "#elif defined( USE_COLOR )", "	attribute vec3 color;", "#endif", "#ifdef USE_SKINNING", "	attribute vec4 skinIndex;", "	attribute vec4 skinWeight;", "#endif", `
`].filter(Ti).join(`
`), h = [yo(e), "#define SHADER_TYPE " + e.shaderType, "#define SHADER_NAME " + e.shaderName, x, e.useFog && e.fog ? "#define USE_FOG" : "", e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "", e.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "", e.map ? "#define USE_MAP" : "", e.matcap ? "#define USE_MATCAP" : "", e.envMap ? "#define USE_ENVMAP" : "", e.envMap ? "#define " + l : "", e.envMap ? "#define " + d : "", e.envMap ? "#define " + f : "", p ? "#define CUBEUV_TEXEL_WIDTH " + p.texelWidth : "", p ? "#define CUBEUV_TEXEL_HEIGHT " + p.texelHeight : "", p ? "#define CUBEUV_MAX_MIP " + p.maxMip + ".0" : "", e.lightMap ? "#define USE_LIGHTMAP" : "", e.aoMap ? "#define USE_AOMAP" : "", e.bumpMap ? "#define USE_BUMPMAP" : "", e.normalMap ? "#define USE_NORMALMAP" : "", e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", e.emissiveMap ? "#define USE_EMISSIVEMAP" : "", e.anisotropy ? "#define USE_ANISOTROPY" : "", e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "", e.clearcoat ? "#define USE_CLEARCOAT" : "", e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", e.dispersion ? "#define USE_DISPERSION" : "", e.iridescence ? "#define USE_IRIDESCENCE" : "", e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", e.specularMap ? "#define USE_SPECULARMAP" : "", e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", e.metalnessMap ? "#define USE_METALNESSMAP" : "", e.alphaMap ? "#define USE_ALPHAMAP" : "", e.alphaTest ? "#define USE_ALPHATEST" : "", e.alphaHash ? "#define USE_ALPHAHASH" : "", e.sheen ? "#define USE_SHEEN" : "", e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", e.transmission ? "#define USE_TRANSMISSION" : "", e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", e.thicknessMap ? "#define USE_THICKNESSMAP" : "", e.vertexTangents && e.flatShading === !1 ? "#define USE_TANGENT" : "", e.vertexColors || e.instancingColor || e.batchingColor ? "#define USE_COLOR" : "", e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", e.vertexUv1s ? "#define USE_UV1" : "", e.vertexUv2s ? "#define USE_UV2" : "", e.vertexUv3s ? "#define USE_UV3" : "", e.pointsUvs ? "#define USE_POINTS_UV" : "", e.gradientMap ? "#define USE_GRADIENTMAP" : "", e.flatShading ? "#define FLAT_SHADED" : "", e.doubleSided ? "#define DOUBLE_SIDED" : "", e.flipSided ? "#define FLIP_SIDED" : "", e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", e.shadowMapEnabled ? "#define " + c : "", e.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "", e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "", e.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "", e.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "", e.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", e.reversedDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "", "uniform mat4 viewMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", e.toneMapping !== Sn ? "#define TONE_MAPPING" : "", e.toneMapping !== Sn ? Ot.tonemapping_pars_fragment : "", e.toneMapping !== Sn ? mp("toneMapping", e.toneMapping) : "", e.dithering ? "#define DITHERING" : "", e.opaque ? "#define OPAQUE" : "", Ot.colorspace_pars_fragment, pp("linearToOutputTexel", e.outputColorSpace), _p(), e.useDepthPacking ? "#define DEPTH_PACKING " + e.depthPacking : "", `
`].filter(Ti).join(`
`)), a = jr(a), a = Mo(a, e), a = So(a, e), o = jr(o), o = Mo(o, e), o = So(o, e), a = Eo(a), o = Eo(o), e.isRawShaderMaterial !== !0 && (w = `#version 300 es
`, u = [m, "#define attribute in", "#define varying out", "#define texture2D texture"].join(`
`) + `
` + u, h = ["#define varying in", e.glslVersion === Aa ? "" : "layout(location = 0) out highp vec4 pc_fragColor;", e.glslVersion === Aa ? "" : "#define gl_FragColor pc_fragColor", "#define gl_FragDepthEXT gl_FragDepth", "#define texture2D texture", "#define textureCube texture", "#define texture2DProj textureProj", "#define texture2DLodEXT textureLod", "#define texture2DProjLodEXT textureProjLod", "#define textureCubeLodEXT textureLod", "#define texture2DGradEXT textureGrad", "#define texture2DProjGradEXT textureProjGrad", "#define textureCubeGradEXT textureGrad"].join(`
`) + `
` + h);
    const T = w + u + a,
        E = w + h + o,
        P = go(s, s.VERTEX_SHADER, T),
        R = go(s, s.FRAGMENT_SHADER, E);
    s.attachShader(_, P), s.attachShader(_, R), e.index0AttributeName !== void 0 ? s.bindAttribLocation(_, 0, e.index0AttributeName) : e.morphTargets === !0 && s.bindAttribLocation(_, 0, "position"), s.linkProgram(_);

    function b(A) {
        if (i.debug.checkShaderErrors) {
            const G = s.getProgramInfoLog(_) || "",
                O = s.getShaderInfoLog(P) || "",
                N = s.getShaderInfoLog(R) || "",
                q = G.trim(),
                V = O.trim(),
                K = N.trim();
            let z = !0,
                st = !0;
            if (s.getProgramParameter(_, s.LINK_STATUS) === !1)
                if (z = !1, typeof i.debug.onShaderError == "function") i.debug.onShaderError(s, _, P, R);
                else {
                    const tt = vo(s, P, "vertex"),
                        ft = vo(s, R, "fragment");
                    console.error("THREE.WebGLProgram: Shader Error " + s.getError() + " - VALIDATE_STATUS " + s.getProgramParameter(_, s.VALIDATE_STATUS) + `

Material Name: ` + A.name + `
Material Type: ` + A.type + `

Program Info Log: ` + q + `
` + tt + `
` + ft)
                }
            else q !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", q) : (V === "" || K === "") && (st = !1);
            st && (A.diagnostics = {
                runnable: z,
                programLog: q,
                vertexShader: {
                    log: V,
                    prefix: u
                },
                fragmentShader: {
                    log: K,
                    prefix: h
                }
            })
        }
        s.deleteShader(P), s.deleteShader(R), I = new _s(s, _), M = vp(s, _)
    }
    let I;
    this.getUniforms = function() {
        return I === void 0 && b(this), I
    };
    let M;
    this.getAttributes = function() {
        return M === void 0 && b(this), M
    };
    let S = e.rendererExtensionParallelShaderCompile === !1;
    return this.isReady = function() {
        return S === !1 && (S = s.getProgramParameter(_, hp)), S
    }, this.destroy = function() {
        n.releaseStatesOfProgram(this), s.deleteProgram(_), this.program = void 0
    }, this.type = e.shaderType, this.name = e.shaderName, this.id = up++, this.cacheKey = t, this.usedTimes = 1, this.program = _, this.vertexShader = P, this.fragmentShader = R, this
}
let Dp = 0;
class Lp {
    constructor() {
        this.shaderCache = new Map, this.materialCache = new Map
    }
    update(t) {
        const e = t.vertexShader,
            n = t.fragmentShader,
            s = this._getShaderStage(e),
            r = this._getShaderStage(n),
            a = this._getShaderCacheForMaterial(t);
        return a.has(s) === !1 && (a.add(s), s.usedTimes++), a.has(r) === !1 && (a.add(r), r.usedTimes++), this
    }
    remove(t) {
        const e = this.materialCache.get(t);
        for (const n of e) n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
        return this.materialCache.delete(t), this
    }
    getVertexShaderID(t) {
        return this._getShaderStage(t.vertexShader).id
    }
    getFragmentShaderID(t) {
        return this._getShaderStage(t.fragmentShader).id
    }
    dispose() {
        this.shaderCache.clear(), this.materialCache.clear()
    }
    _getShaderCacheForMaterial(t) {
        const e = this.materialCache;
        let n = e.get(t);
        return n === void 0 && (n = new Set, e.set(t, n)), n
    }
    _getShaderStage(t) {
        const e = this.shaderCache;
        let n = e.get(t);
        return n === void 0 && (n = new Ip(t), e.set(t, n)), n
    }
}
class Ip {
    constructor(t) {
        this.id = Dp++, this.code = t, this.usedTimes = 0
    }
}

function Up(i, t, e, n, s, r, a) {
    const o = new oa,
        c = new Lp,
        l = new Set,
        d = [],
        f = s.logarithmicDepthBuffer,
        p = s.vertexTextures;
    let m = s.precision;
    const x = {
        MeshDepthMaterial: "depth",
        MeshDistanceMaterial: "distanceRGBA",
        MeshNormalMaterial: "normal",
        MeshBasicMaterial: "basic",
        MeshLambertMaterial: "lambert",
        MeshPhongMaterial: "phong",
        MeshToonMaterial: "toon",
        MeshStandardMaterial: "physical",
        MeshPhysicalMaterial: "physical",
        MeshMatcapMaterial: "matcap",
        LineBasicMaterial: "basic",
        LineDashedMaterial: "dashed",
        PointsMaterial: "points",
        ShadowMaterial: "shadow",
        SpriteMaterial: "sprite"
    };

    function _(M) {
        return l.add(M), M === 0 ? "uv" : `uv${M}`
    }

    function u(M, S, A, G, O) {
        const N = G.fog,
            q = O.geometry,
            V = M.isMeshStandardMaterial ? G.environment : null,
            K = (M.isMeshStandardMaterial ? e : t).get(M.envMap || V),
            z = K && K.mapping === Es ? K.image.height : null,
            st = x[M.type];
        M.precision !== null && (m = s.getMaxPrecision(M.precision), m !== M.precision && console.warn("THREE.WebGLProgram.getParameters:", M.precision, "not supported, using", m, "instead."));
        const tt = q.morphAttributes.position || q.morphAttributes.normal || q.morphAttributes.color,
            ft = tt !== void 0 ? tt.length : 0;
        let Ut = 0;
        q.morphAttributes.position !== void 0 && (Ut = 1), q.morphAttributes.normal !== void 0 && (Ut = 2), q.morphAttributes.color !== void 0 && (Ut = 3);
        let $t, Yt, X, $;
        if (st) {
            const Kt = qe[st];
            $t = Kt.vertexShader, Yt = Kt.fragmentShader
        } else $t = M.vertexShader, Yt = M.fragmentShader, c.update(M), X = c.getVertexShaderID(M), $ = c.getFragmentShaderID(M);
        const Z = i.getRenderTarget(),
            ut = i.state.buffers.depth.getReversed(),
            dt = O.isInstancedMesh === !0,
            wt = O.isBatchedMesh === !0,
            jt = !!M.map,
            Dt = !!M.matcap,
            C = !!K,
            qt = !!M.aoMap,
            bt = !!M.lightMap,
            Gt = !!M.bumpMap,
            yt = !!M.normalMap,
            ie = !!M.displacementMap,
            _t = !!M.emissiveMap,
            Bt = !!M.metalnessMap,
            _e = !!M.roughnessMap,
            ue = M.anisotropy > 0,
            y = M.clearcoat > 0,
            g = M.dispersion > 0,
            B = M.iridescence > 0,
            Y = M.sheen > 0,
            J = M.transmission > 0,
            W = ue && !!M.anisotropyMap,
            Et = y && !!M.clearcoatMap,
            rt = y && !!M.clearcoatNormalMap,
            vt = y && !!M.clearcoatRoughnessMap,
            Mt = B && !!M.iridescenceMap,
            nt = B && !!M.iridescenceThicknessMap,
            ht = Y && !!M.sheenColorMap,
            Ct = Y && !!M.sheenRoughnessMap,
            St = !!M.specularMap,
            lt = !!M.specularColorMap,
            Nt = !!M.specularIntensityMap,
            D = J && !!M.transmissionMap,
            it = J && !!M.thicknessMap,
            at = !!M.gradientMap,
            mt = !!M.alphaMap,
            Q = M.alphaTest > 0,
            j = !!M.alphaHash,
            xt = !!M.extensions;
        let It = Sn;
        M.toneMapped && (Z === null || Z.isXRRenderTarget === !0) && (It = i.toneMapping);
        const ee = {
            shaderID: st,
            shaderType: M.type,
            shaderName: M.name,
            vertexShader: $t,
            fragmentShader: Yt,
            defines: M.defines,
            customVertexShaderID: X,
            customFragmentShaderID: $,
            isRawShaderMaterial: M.isRawShaderMaterial === !0,
            glslVersion: M.glslVersion,
            precision: m,
            batching: wt,
            batchingColor: wt && O._colorsTexture !== null,
            instancing: dt,
            instancingColor: dt && O.instanceColor !== null,
            instancingMorph: dt && O.morphTexture !== null,
            supportsVertexTextures: p,
            outputColorSpace: Z === null ? i.outputColorSpace : Z.isXRRenderTarget === !0 ? Z.texture.colorSpace : di,
            alphaToCoverage: !!M.alphaToCoverage,
            map: jt,
            matcap: Dt,
            envMap: C,
            envMapMode: C && K.mapping,
            envMapCubeUVHeight: z,
            aoMap: qt,
            lightMap: bt,
            bumpMap: Gt,
            normalMap: yt,
            displacementMap: p && ie,
            emissiveMap: _t,
            normalMapObjectSpace: yt && M.normalMapType === Tc,
            normalMapTangentSpace: yt && M.normalMapType === Vo,
            metalnessMap: Bt,
            roughnessMap: _e,
            anisotropy: ue,
            anisotropyMap: W,
            clearcoat: y,
            clearcoatMap: Et,
            clearcoatNormalMap: rt,
            clearcoatRoughnessMap: vt,
            dispersion: g,
            iridescence: B,
            iridescenceMap: Mt,
            iridescenceThicknessMap: nt,
            sheen: Y,
            sheenColorMap: ht,
            sheenRoughnessMap: Ct,
            specularMap: St,
            specularColorMap: lt,
            specularIntensityMap: Nt,
            transmission: J,
            transmissionMap: D,
            thicknessMap: it,
            gradientMap: at,
            opaque: M.transparent === !1 && M.blending === ai && M.alphaToCoverage === !1,
            alphaMap: mt,
            alphaTest: Q,
            alphaHash: j,
            combine: M.combine,
            mapUv: jt && _(M.map.channel),
            aoMapUv: qt && _(M.aoMap.channel),
            lightMapUv: bt && _(M.lightMap.channel),
            bumpMapUv: Gt && _(M.bumpMap.channel),
            normalMapUv: yt && _(M.normalMap.channel),
            displacementMapUv: ie && _(M.displacementMap.channel),
            emissiveMapUv: _t && _(M.emissiveMap.channel),
            metalnessMapUv: Bt && _(M.metalnessMap.channel),
            roughnessMapUv: _e && _(M.roughnessMap.channel),
            anisotropyMapUv: W && _(M.anisotropyMap.channel),
            clearcoatMapUv: Et && _(M.clearcoatMap.channel),
            clearcoatNormalMapUv: rt && _(M.clearcoatNormalMap.channel),
            clearcoatRoughnessMapUv: vt && _(M.clearcoatRoughnessMap.channel),
            iridescenceMapUv: Mt && _(M.iridescenceMap.channel),
            iridescenceThicknessMapUv: nt && _(M.iridescenceThicknessMap.channel),
            sheenColorMapUv: ht && _(M.sheenColorMap.channel),
            sheenRoughnessMapUv: Ct && _(M.sheenRoughnessMap.channel),
            specularMapUv: St && _(M.specularMap.channel),
            specularColorMapUv: lt && _(M.specularColorMap.channel),
            specularIntensityMapUv: Nt && _(M.specularIntensityMap.channel),
            transmissionMapUv: D && _(M.transmissionMap.channel),
            thicknessMapUv: it && _(M.thicknessMap.channel),
            alphaMapUv: mt && _(M.alphaMap.channel),
            vertexTangents: !!q.attributes.tangent && (yt || ue),
            vertexColors: M.vertexColors,
            vertexAlphas: M.vertexColors === !0 && !!q.attributes.color && q.attributes.color.itemSize === 4,
            pointsUvs: O.isPoints === !0 && !!q.attributes.uv && (jt || mt),
            fog: !!N,
            useFog: M.fog === !0,
            fogExp2: !!N && N.isFogExp2,
            flatShading: M.flatShading === !0 && M.wireframe === !1,
            sizeAttenuation: M.sizeAttenuation === !0,
            logarithmicDepthBuffer: f,
            reversedDepthBuffer: ut,
            skinning: O.isSkinnedMesh === !0,
            morphTargets: q.morphAttributes.position !== void 0,
            morphNormals: q.morphAttributes.normal !== void 0,
            morphColors: q.morphAttributes.color !== void 0,
            morphTargetsCount: ft,
            morphTextureStride: Ut,
            numDirLights: S.directional.length,
            numPointLights: S.point.length,
            numSpotLights: S.spot.length,
            numSpotLightMaps: S.spotLightMap.length,
            numRectAreaLights: S.rectArea.length,
            numHemiLights: S.hemi.length,
            numDirLightShadows: S.directionalShadowMap.length,
            numPointLightShadows: S.pointShadowMap.length,
            numSpotLightShadows: S.spotShadowMap.length,
            numSpotLightShadowsWithMaps: S.numSpotLightShadowsWithMaps,
            numLightProbes: S.numLightProbes,
            numClippingPlanes: a.numPlanes,
            numClipIntersection: a.numIntersection,
            dithering: M.dithering,
            shadowMapEnabled: i.shadowMap.enabled && A.length > 0,
            shadowMapType: i.shadowMap.type,
            toneMapping: It,
            decodeVideoTexture: jt && M.map.isVideoTexture === !0 && Xt.getTransfer(M.map.colorSpace) === Jt,
            decodeVideoTextureEmissive: _t && M.emissiveMap.isVideoTexture === !0 && Xt.getTransfer(M.emissiveMap.colorSpace) === Jt,
            premultipliedAlpha: M.premultipliedAlpha,
            doubleSided: M.side === Ye,
            flipSided: M.side === we,
            useDepthPacking: M.depthPacking >= 0,
            depthPacking: M.depthPacking || 0,
            index0AttributeName: M.index0AttributeName,
            extensionClipCullDistance: xt && M.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
            extensionMultiDraw: (xt && M.extensions.multiDraw === !0 || wt) && n.has("WEBGL_multi_draw"),
            rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
            customProgramCacheKey: M.customProgramCacheKey()
        };
        return ee.vertexUv1s = l.has(1), ee.vertexUv2s = l.has(2), ee.vertexUv3s = l.has(3), l.clear(), ee
    }

    function h(M) {
        const S = [];
        if (M.shaderID ? S.push(M.shaderID) : (S.push(M.customVertexShaderID), S.push(M.customFragmentShaderID)), M.defines !== void 0)
            for (const A in M.defines) S.push(A), S.push(M.defines[A]);
        return M.isRawShaderMaterial === !1 && (w(S, M), T(S, M), S.push(i.outputColorSpace)), S.push(M.customProgramCacheKey), S.join()
    }

    function w(M, S) {
        M.push(S.precision), M.push(S.outputColorSpace), M.push(S.envMapMode), M.push(S.envMapCubeUVHeight), M.push(S.mapUv), M.push(S.alphaMapUv), M.push(S.lightMapUv), M.push(S.aoMapUv), M.push(S.bumpMapUv), M.push(S.normalMapUv), M.push(S.displacementMapUv), M.push(S.emissiveMapUv), M.push(S.metalnessMapUv), M.push(S.roughnessMapUv), M.push(S.anisotropyMapUv), M.push(S.clearcoatMapUv), M.push(S.clearcoatNormalMapUv), M.push(S.clearcoatRoughnessMapUv), M.push(S.iridescenceMapUv), M.push(S.iridescenceThicknessMapUv), M.push(S.sheenColorMapUv), M.push(S.sheenRoughnessMapUv), M.push(S.specularMapUv), M.push(S.specularColorMapUv), M.push(S.specularIntensityMapUv), M.push(S.transmissionMapUv), M.push(S.thicknessMapUv), M.push(S.combine), M.push(S.fogExp2), M.push(S.sizeAttenuation), M.push(S.morphTargetsCount), M.push(S.morphAttributeCount), M.push(S.numDirLights), M.push(S.numPointLights), M.push(S.numSpotLights), M.push(S.numSpotLightMaps), M.push(S.numHemiLights), M.push(S.numRectAreaLights), M.push(S.numDirLightShadows), M.push(S.numPointLightShadows), M.push(S.numSpotLightShadows), M.push(S.numSpotLightShadowsWithMaps), M.push(S.numLightProbes), M.push(S.shadowMapType), M.push(S.toneMapping), M.push(S.numClippingPlanes), M.push(S.numClipIntersection), M.push(S.depthPacking)
    }

    function T(M, S) {
        o.disableAll(), S.supportsVertexTextures && o.enable(0), S.instancing && o.enable(1), S.instancingColor && o.enable(2), S.instancingMorph && o.enable(3), S.matcap && o.enable(4), S.envMap && o.enable(5), S.normalMapObjectSpace && o.enable(6), S.normalMapTangentSpace && o.enable(7), S.clearcoat && o.enable(8), S.iridescence && o.enable(9), S.alphaTest && o.enable(10), S.vertexColors && o.enable(11), S.vertexAlphas && o.enable(12), S.vertexUv1s && o.enable(13), S.vertexUv2s && o.enable(14), S.vertexUv3s && o.enable(15), S.vertexTangents && o.enable(16), S.anisotropy && o.enable(17), S.alphaHash && o.enable(18), S.batching && o.enable(19), S.dispersion && o.enable(20), S.batchingColor && o.enable(21), S.gradientMap && o.enable(22), M.push(o.mask), o.disableAll(), S.fog && o.enable(0), S.useFog && o.enable(1), S.flatShading && o.enable(2), S.logarithmicDepthBuffer && o.enable(3), S.reversedDepthBuffer && o.enable(4), S.skinning && o.enable(5), S.morphTargets && o.enable(6), S.morphNormals && o.enable(7), S.morphColors && o.enable(8), S.premultipliedAlpha && o.enable(9), S.shadowMapEnabled && o.enable(10), S.doubleSided && o.enable(11), S.flipSided && o.enable(12), S.useDepthPacking && o.enable(13), S.dithering && o.enable(14), S.transmission && o.enable(15), S.sheen && o.enable(16), S.opaque && o.enable(17), S.pointsUvs && o.enable(18), S.decodeVideoTexture && o.enable(19), S.decodeVideoTextureEmissive && o.enable(20), S.alphaToCoverage && o.enable(21), M.push(o.mask)
    }

    function E(M) {
        const S = x[M.type];
        let A;
        if (S) {
            const G = qe[S];
            A = th.clone(G.uniforms)
        } else A = M.uniforms;
        return A
    }

    function P(M, S) {
        let A;
        for (let G = 0, O = d.length; G < O; G++) {
            const N = d[G];
            if (N.cacheKey === S) {
                A = N, ++A.usedTimes;
                break
            }
        }
        return A === void 0 && (A = new Pp(i, S, M, r), d.push(A)), A
    }

    function R(M) {
        if (--M.usedTimes === 0) {
            const S = d.indexOf(M);
            d[S] = d[d.length - 1], d.pop(), M.destroy()
        }
    }

    function b(M) {
        c.remove(M)
    }

    function I() {
        c.dispose()
    }
    return {
        getParameters: u,
        getProgramCacheKey: h,
        getUniforms: E,
        acquireProgram: P,
        releaseProgram: R,
        releaseShaderCache: b,
        programs: d,
        dispose: I
    }
}

function Np() {
    let i = new WeakMap;

    function t(a) {
        return i.has(a)
    }

    function e(a) {
        let o = i.get(a);
        return o === void 0 && (o = {}, i.set(a, o)), o
    }

    function n(a) {
        i.delete(a)
    }

    function s(a, o, c) {
        i.get(a)[o] = c
    }

    function r() {
        i = new WeakMap
    }
    return {
        has: t,
        get: e,
        remove: n,
        update: s,
        dispose: r
    }
}

function Fp(i, t) {
    return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.material.id !== t.material.id ? i.material.id - t.material.id : i.z !== t.z ? i.z - t.z : i.id - t.id
}

function To(i, t) {
    return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.z !== t.z ? t.z - i.z : i.id - t.id
}

function bo() {
    const i = [];
    let t = 0;
    const e = [],
        n = [],
        s = [];

    function r() {
        t = 0, e.length = 0, n.length = 0, s.length = 0
    }

    function a(f, p, m, x, _, u) {
        let h = i[t];
        return h === void 0 ? (h = {
            id: f.id,
            object: f,
            geometry: p,
            material: m,
            groupOrder: x,
            renderOrder: f.renderOrder,
            z: _,
            group: u
        }, i[t] = h) : (h.id = f.id, h.object = f, h.geometry = p, h.material = m, h.groupOrder = x, h.renderOrder = f.renderOrder, h.z = _, h.group = u), t++, h
    }

    function o(f, p, m, x, _, u) {
        const h = a(f, p, m, x, _, u);
        m.transmission > 0 ? n.push(h) : m.transparent === !0 ? s.push(h) : e.push(h)
    }

    function c(f, p, m, x, _, u) {
        const h = a(f, p, m, x, _, u);
        m.transmission > 0 ? n.unshift(h) : m.transparent === !0 ? s.unshift(h) : e.unshift(h)
    }

    function l(f, p) {
        e.length > 1 && e.sort(f || Fp), n.length > 1 && n.sort(p || To), s.length > 1 && s.sort(p || To)
    }

    function d() {
        for (let f = t, p = i.length; f < p; f++) {
            const m = i[f];
            if (m.id === null) break;
            m.id = null, m.object = null, m.geometry = null, m.material = null, m.group = null
        }
    }
    return {
        opaque: e,
        transmissive: n,
        transparent: s,
        init: r,
        push: o,
        unshift: c,
        finish: d,
        sort: l
    }
}

function Op() {
    let i = new WeakMap;

    function t(n, s) {
        const r = i.get(n);
        let a;
        return r === void 0 ? (a = new bo, i.set(n, [a])) : s >= r.length ? (a = new bo, r.push(a)) : a = r[s], a
    }

    function e() {
        i = new WeakMap
    }
    return {
        get: t,
        dispose: e
    }
}

function Bp() {
    const i = {};
    return {
        get: function(t) {
            if (i[t.id] !== void 0) return i[t.id];
            let e;
            switch (t.type) {
                case "DirectionalLight":
                    e = {
                        direction: new F,
                        color: new Ht
                    };
                    break;
                case "SpotLight":
                    e = {
                        position: new F,
                        direction: new F,
                        color: new Ht,
                        distance: 0,
                        coneCos: 0,
                        penumbraCos: 0,
                        decay: 0
                    };
                    break;
                case "PointLight":
                    e = {
                        position: new F,
                        color: new Ht,
                        distance: 0,
                        decay: 0
                    };
                    break;
                case "HemisphereLight":
                    e = {
                        direction: new F,
                        skyColor: new Ht,
                        groundColor: new Ht
                    };
                    break;
                case "RectAreaLight":
                    e = {
                        color: new Ht,
                        position: new F,
                        halfWidth: new F,
                        halfHeight: new F
                    };
                    break
            }
            return i[t.id] = e, e
        }
    }
}

function zp() {
    const i = {};
    return {
        get: function(t) {
            if (i[t.id] !== void 0) return i[t.id];
            let e;
            switch (t.type) {
                case "DirectionalLight":
                    e = {
                        shadowIntensity: 1,
                        shadowBias: 0,
                        shadowNormalBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new Lt
                    };
                    break;
                case "SpotLight":
                    e = {
                        shadowIntensity: 1,
                        shadowBias: 0,
                        shadowNormalBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new Lt
                    };
                    break;
                case "PointLight":
                    e = {
                        shadowIntensity: 1,
                        shadowBias: 0,
                        shadowNormalBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new Lt,
                        shadowCameraNear: 1,
                        shadowCameraFar: 1e3
                    };
                    break
            }
            return i[t.id] = e, e
        }
    }
}
let Hp = 0;

function kp(i, t) {
    return (t.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (t.map ? 1 : 0) - (i.map ? 1 : 0)
}

function Gp(i) {
    const t = new Bp,
        e = zp(),
        n = {
            version: 0,
            hash: {
                directionalLength: -1,
                pointLength: -1,
                spotLength: -1,
                rectAreaLength: -1,
                hemiLength: -1,
                numDirectionalShadows: -1,
                numPointShadows: -1,
                numSpotShadows: -1,
                numSpotMaps: -1,
                numLightProbes: -1
            },
            ambient: [0, 0, 0],
            probe: [],
            directional: [],
            directionalShadow: [],
            directionalShadowMap: [],
            directionalShadowMatrix: [],
            spot: [],
            spotLightMap: [],
            spotShadow: [],
            spotShadowMap: [],
            spotLightMatrix: [],
            rectArea: [],
            rectAreaLTC1: null,
            rectAreaLTC2: null,
            point: [],
            pointShadow: [],
            pointShadowMap: [],
            pointShadowMatrix: [],
            hemi: [],
            numSpotLightShadowsWithMaps: 0,
            numLightProbes: 0
        };
    for (let l = 0; l < 9; l++) n.probe.push(new F);
    const s = new F,
        r = new le,
        a = new le;

    function o(l) {
        let d = 0,
            f = 0,
            p = 0;
        for (let M = 0; M < 9; M++) n.probe[M].set(0, 0, 0);
        let m = 0,
            x = 0,
            _ = 0,
            u = 0,
            h = 0,
            w = 0,
            T = 0,
            E = 0,
            P = 0,
            R = 0,
            b = 0;
        l.sort(kp);
        for (let M = 0, S = l.length; M < S; M++) {
            const A = l[M],
                G = A.color,
                O = A.intensity,
                N = A.distance,
                q = A.shadow && A.shadow.map ? A.shadow.map.texture : null;
            if (A.isAmbientLight) d += G.r * O, f += G.g * O, p += G.b * O;
            else if (A.isLightProbe) {
                for (let V = 0; V < 9; V++) n.probe[V].addScaledVector(A.sh.coefficients[V], O);
                b++
            } else if (A.isDirectionalLight) {
                const V = t.get(A);
                if (V.color.copy(A.color).multiplyScalar(A.intensity), A.castShadow) {
                    const K = A.shadow,
                        z = e.get(A);
                    z.shadowIntensity = K.intensity, z.shadowBias = K.bias, z.shadowNormalBias = K.normalBias, z.shadowRadius = K.radius, z.shadowMapSize = K.mapSize, n.directionalShadow[m] = z, n.directionalShadowMap[m] = q, n.directionalShadowMatrix[m] = A.shadow.matrix, w++
                }
                n.directional[m] = V, m++
            } else if (A.isSpotLight) {
                const V = t.get(A);
                V.position.setFromMatrixPosition(A.matrixWorld), V.color.copy(G).multiplyScalar(O), V.distance = N, V.coneCos = Math.cos(A.angle), V.penumbraCos = Math.cos(A.angle * (1 - A.penumbra)), V.decay = A.decay, n.spot[_] = V;
                const K = A.shadow;
                if (A.map && (n.spotLightMap[P] = A.map, P++, K.updateMatrices(A), A.castShadow && R++), n.spotLightMatrix[_] = K.matrix, A.castShadow) {
                    const z = e.get(A);
                    z.shadowIntensity = K.intensity, z.shadowBias = K.bias, z.shadowNormalBias = K.normalBias, z.shadowRadius = K.radius, z.shadowMapSize = K.mapSize, n.spotShadow[_] = z, n.spotShadowMap[_] = q, E++
                }
                _++
            } else if (A.isRectAreaLight) {
                const V = t.get(A);
                V.color.copy(G).multiplyScalar(O), V.halfWidth.set(A.width * .5, 0, 0), V.halfHeight.set(0, A.height * .5, 0), n.rectArea[u] = V, u++
            } else if (A.isPointLight) {
                const V = t.get(A);
                if (V.color.copy(A.color).multiplyScalar(A.intensity), V.distance = A.distance, V.decay = A.decay, A.castShadow) {
                    const K = A.shadow,
                        z = e.get(A);
                    z.shadowIntensity = K.intensity, z.shadowBias = K.bias, z.shadowNormalBias = K.normalBias, z.shadowRadius = K.radius, z.shadowMapSize = K.mapSize, z.shadowCameraNear = K.camera.near, z.shadowCameraFar = K.camera.far, n.pointShadow[x] = z, n.pointShadowMap[x] = q, n.pointShadowMatrix[x] = A.shadow.matrix, T++
                }
                n.point[x] = V, x++
            } else if (A.isHemisphereLight) {
                const V = t.get(A);
                V.skyColor.copy(A.color).multiplyScalar(O), V.groundColor.copy(A.groundColor).multiplyScalar(O), n.hemi[h] = V, h++
            }
        }
        u > 0 && (i.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = ot.LTC_FLOAT_1, n.rectAreaLTC2 = ot.LTC_FLOAT_2) : (n.rectAreaLTC1 = ot.LTC_HALF_1, n.rectAreaLTC2 = ot.LTC_HALF_2)), n.ambient[0] = d, n.ambient[1] = f, n.ambient[2] = p;
        const I = n.hash;
        (I.directionalLength !== m || I.pointLength !== x || I.spotLength !== _ || I.rectAreaLength !== u || I.hemiLength !== h || I.numDirectionalShadows !== w || I.numPointShadows !== T || I.numSpotShadows !== E || I.numSpotMaps !== P || I.numLightProbes !== b) && (n.directional.length = m, n.spot.length = _, n.rectArea.length = u, n.point.length = x, n.hemi.length = h, n.directionalShadow.length = w, n.directionalShadowMap.length = w, n.pointShadow.length = T, n.pointShadowMap.length = T, n.spotShadow.length = E, n.spotShadowMap.length = E, n.directionalShadowMatrix.length = w, n.pointShadowMatrix.length = T, n.spotLightMatrix.length = E + P - R, n.spotLightMap.length = P, n.numSpotLightShadowsWithMaps = R, n.numLightProbes = b, I.directionalLength = m, I.pointLength = x, I.spotLength = _, I.rectAreaLength = u, I.hemiLength = h, I.numDirectionalShadows = w, I.numPointShadows = T, I.numSpotShadows = E, I.numSpotMaps = P, I.numLightProbes = b, n.version = Hp++)
    }

    function c(l, d) {
        let f = 0,
            p = 0,
            m = 0,
            x = 0,
            _ = 0;
        const u = d.matrixWorldInverse;
        for (let h = 0, w = l.length; h < w; h++) {
            const T = l[h];
            if (T.isDirectionalLight) {
                const E = n.directional[f];
                E.direction.setFromMatrixPosition(T.matrixWorld), s.setFromMatrixPosition(T.target.matrixWorld), E.direction.sub(s), E.direction.transformDirection(u), f++
            } else if (T.isSpotLight) {
                const E = n.spot[m];
                E.position.setFromMatrixPosition(T.matrixWorld), E.position.applyMatrix4(u), E.direction.setFromMatrixPosition(T.matrixWorld), s.setFromMatrixPosition(T.target.matrixWorld), E.direction.sub(s), E.direction.transformDirection(u), m++
            } else if (T.isRectAreaLight) {
                const E = n.rectArea[x];
                E.position.setFromMatrixPosition(T.matrixWorld), E.position.applyMatrix4(u), a.identity(), r.copy(T.matrixWorld), r.premultiply(u), a.extractRotation(r), E.halfWidth.set(T.width * .5, 0, 0), E.halfHeight.set(0, T.height * .5, 0), E.halfWidth.applyMatrix4(a), E.halfHeight.applyMatrix4(a), x++
            } else if (T.isPointLight) {
                const E = n.point[p];
                E.position.setFromMatrixPosition(T.matrixWorld), E.position.applyMatrix4(u), p++
            } else if (T.isHemisphereLight) {
                const E = n.hemi[_];
                E.direction.setFromMatrixPosition(T.matrixWorld), E.direction.transformDirection(u), _++
            }
        }
    }
    return {
        setup: o,
        setupView: c,
        state: n
    }
}

function Ao(i) {
    const t = new Gp(i),
        e = [],
        n = [];

    function s(d) {
        l.camera = d, e.length = 0, n.length = 0
    }

    function r(d) {
        e.push(d)
    }

    function a(d) {
        n.push(d)
    }

    function o() {
        t.setup(e)
    }

    function c(d) {
        t.setupView(e, d)
    }
    const l = {
        lightsArray: e,
        shadowsArray: n,
        camera: null,
        lights: t,
        transmissionRenderTarget: {}
    };
    return {
        init: s,
        state: l,
        setupLights: o,
        setupLightsView: c,
        pushLight: r,
        pushShadow: a
    }
}

function Vp(i) {
    let t = new WeakMap;

    function e(s, r = 0) {
        const a = t.get(s);
        let o;
        return a === void 0 ? (o = new Ao(i), t.set(s, [o])) : r >= a.length ? (o = new Ao(i), a.push(o)) : o = a[r], o
    }

    function n() {
        t = new WeakMap
    }
    return {
        get: e,
        dispose: n
    }
}
const Wp = `void main() {
	gl_Position = vec4( position, 1.0 );
}`,
    Xp = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;

function qp(i, t, e) {
    let n = new la;
    const s = new Lt,
        r = new Lt,
        a = new he,
        o = new dh({
            depthPacking: yc
        }),
        c = new fh,
        l = {},
        d = e.maxTextureSize,
        f = {
            [En]: we,
            [we]: En,
            [Ye]: Ye
        },
        p = new yn({
            defines: {
                VSM_SAMPLES: 8
            },
            uniforms: {
                shadow_pass: {
                    value: null
                },
                resolution: {
                    value: new Lt
                },
                radius: {
                    value: 4
                }
            },
            vertexShader: Wp,
            fragmentShader: Xp
        }),
        m = p.clone();
    m.defines.HORIZONTAL_PASS = 1;
    const x = new un;
    x.setAttribute("position", new je(new Float32Array([-1, -1, .5, 3, -1, .5, -1, 3, .5]), 3));
    const _ = new ze(x, p),
        u = this;
    this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = Do;
    let h = this.type;
    this.render = function(R, b, I) {
        if (u.enabled === !1 || u.autoUpdate === !1 && u.needsUpdate === !1 || R.length === 0) return;
        const M = i.getRenderTarget(),
            S = i.getActiveCubeFace(),
            A = i.getActiveMipmapLevel(),
            G = i.state;
        G.setBlending(Mn), G.buffers.depth.getReversed() ? G.buffers.color.setClear(0, 0, 0, 0) : G.buffers.color.setClear(1, 1, 1, 1), G.buffers.depth.setTest(!0), G.setScissorTest(!1);
        const O = h !== on && this.type === on,
            N = h === on && this.type !== on;
        for (let q = 0, V = R.length; q < V; q++) {
            const K = R[q],
                z = K.shadow;
            if (z === void 0) {
                console.warn("THREE.WebGLShadowMap:", K, "has no shadow.");
                continue
            }
            if (z.autoUpdate === !1 && z.needsUpdate === !1) continue;
            s.copy(z.mapSize);
            const st = z.getFrameExtents();
            if (s.multiply(st), r.copy(z.mapSize), (s.x > d || s.y > d) && (s.x > d && (r.x = Math.floor(d / st.x), s.x = r.x * st.x, z.mapSize.x = r.x), s.y > d && (r.y = Math.floor(d / st.y), s.y = r.y * st.y, z.mapSize.y = r.y)), z.map === null || O === !0 || N === !0) {
                const ft = this.type !== on ? {
                    minFilter: We,
                    magFilter: We
                } : {};
                z.map !== null && z.map.dispose(), z.map = new Hn(s.x, s.y, ft), z.map.texture.name = K.name + ".shadowMap", z.camera.updateProjectionMatrix()
            }
            i.setRenderTarget(z.map), i.clear();
            const tt = z.getViewportCount();
            for (let ft = 0; ft < tt; ft++) {
                const Ut = z.getViewport(ft);
                a.set(r.x * Ut.x, r.y * Ut.y, r.x * Ut.z, r.y * Ut.w), G.viewport(a), z.updateMatrices(K, ft), n = z.getFrustum(), E(b, I, z.camera, K, this.type)
            }
            z.isPointLightShadow !== !0 && this.type === on && w(z, I), z.needsUpdate = !1
        }
        h = this.type, u.needsUpdate = !1, i.setRenderTarget(M, S, A)
    };

    function w(R, b) {
        const I = t.update(_);
        p.defines.VSM_SAMPLES !== R.blurSamples && (p.defines.VSM_SAMPLES = R.blurSamples, m.defines.VSM_SAMPLES = R.blurSamples, p.needsUpdate = !0, m.needsUpdate = !0), R.mapPass === null && (R.mapPass = new Hn(s.x, s.y)), p.uniforms.shadow_pass.value = R.map.texture, p.uniforms.resolution.value = R.mapSize, p.uniforms.radius.value = R.radius, i.setRenderTarget(R.mapPass), i.clear(), i.renderBufferDirect(b, null, I, p, _, null), m.uniforms.shadow_pass.value = R.mapPass.texture, m.uniforms.resolution.value = R.mapSize, m.uniforms.radius.value = R.radius, i.setRenderTarget(R.map), i.clear(), i.renderBufferDirect(b, null, I, m, _, null)
    }

    function T(R, b, I, M) {
        let S = null;
        const A = I.isPointLight === !0 ? R.customDistanceMaterial : R.customDepthMaterial;
        if (A !== void 0) S = A;
        else if (S = I.isPointLight === !0 ? c : o, i.localClippingEnabled && b.clipShadows === !0 && Array.isArray(b.clippingPlanes) && b.clippingPlanes.length !== 0 || b.displacementMap && b.displacementScale !== 0 || b.alphaMap && b.alphaTest > 0 || b.map && b.alphaTest > 0 || b.alphaToCoverage === !0) {
            const G = S.uuid,
                O = b.uuid;
            let N = l[G];
            N === void 0 && (N = {}, l[G] = N);
            let q = N[O];
            q === void 0 && (q = S.clone(), N[O] = q, b.addEventListener("dispose", P)), S = q
        }
        if (S.visible = b.visible, S.wireframe = b.wireframe, M === on ? S.side = b.shadowSide !== null ? b.shadowSide : b.side : S.side = b.shadowSide !== null ? b.shadowSide : f[b.side], S.alphaMap = b.alphaMap, S.alphaTest = b.alphaToCoverage === !0 ? .5 : b.alphaTest, S.map = b.map, S.clipShadows = b.clipShadows, S.clippingPlanes = b.clippingPlanes, S.clipIntersection = b.clipIntersection, S.displacementMap = b.displacementMap, S.displacementScale = b.displacementScale, S.displacementBias = b.displacementBias, S.wireframeLinewidth = b.wireframeLinewidth, S.linewidth = b.linewidth, I.isPointLight === !0 && S.isMeshDistanceMaterial === !0) {
            const G = i.properties.get(S);
            G.light = I
        }
        return S
    }

    function E(R, b, I, M, S) {
        if (R.visible === !1) return;
        if (R.layers.test(b.layers) && (R.isMesh || R.isLine || R.isPoints) && (R.castShadow || R.receiveShadow && S === on) && (!R.frustumCulled || n.intersectsObject(R))) {
            R.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse, R.matrixWorld);
            const O = t.update(R),
                N = R.material;
            if (Array.isArray(N)) {
                const q = O.groups;
                for (let V = 0, K = q.length; V < K; V++) {
                    const z = q[V],
                        st = N[z.materialIndex];
                    if (st && st.visible) {
                        const tt = T(R, st, M, S);
                        R.onBeforeShadow(i, R, b, I, O, tt, z), i.renderBufferDirect(I, null, O, tt, R, z), R.onAfterShadow(i, R, b, I, O, tt, z)
                    }
                }
            } else if (N.visible) {
                const q = T(R, N, M, S);
                R.onBeforeShadow(i, R, b, I, O, q, null), i.renderBufferDirect(I, null, O, q, R, null), R.onAfterShadow(i, R, b, I, O, q, null)
            }
        }
        const G = R.children;
        for (let O = 0, N = G.length; O < N; O++) E(G[O], b, I, M, S)
    }

    function P(R) {
        R.target.removeEventListener("dispose", P);
        for (const I in l) {
            const M = l[I],
                S = R.target.uuid;
            S in M && (M[S].dispose(), delete M[S])
        }
    }
}
const Yp = {
    [hr]: ur,
    [dr]: mr,
    [fr]: _r,
    [ci]: pr,
    [ur]: hr,
    [mr]: dr,
    [_r]: fr,
    [pr]: ci
};

function Kp(i, t) {
    function e() {
        let D = !1;
        const it = new he;
        let at = null;
        const mt = new he(0, 0, 0, 0);
        return {
            setMask: function(Q) {
                at !== Q && !D && (i.colorMask(Q, Q, Q, Q), at = Q)
            },
            setLocked: function(Q) {
                D = Q
            },
            setClear: function(Q, j, xt, It, ee) {
                ee === !0 && (Q *= It, j *= It, xt *= It), it.set(Q, j, xt, It), mt.equals(it) === !1 && (i.clearColor(Q, j, xt, It), mt.copy(it))
            },
            reset: function() {
                D = !1, at = null, mt.set(-1, 0, 0, 0)
            }
        }
    }

    function n() {
        let D = !1,
            it = !1,
            at = null,
            mt = null,
            Q = null;
        return {
            setReversed: function(j) {
                if (it !== j) {
                    const xt = t.get("EXT_clip_control");
                    j ? xt.clipControlEXT(xt.LOWER_LEFT_EXT, xt.ZERO_TO_ONE_EXT) : xt.clipControlEXT(xt.LOWER_LEFT_EXT, xt.NEGATIVE_ONE_TO_ONE_EXT), it = j;
                    const It = Q;
                    Q = null, this.setClear(It)
                }
            },
            getReversed: function() {
                return it
            },
            setTest: function(j) {
                j ? Z(i.DEPTH_TEST) : ut(i.DEPTH_TEST)
            },
            setMask: function(j) {
                at !== j && !D && (i.depthMask(j), at = j)
            },
            setFunc: function(j) {
                if (it && (j = Yp[j]), mt !== j) {
                    switch (j) {
                        case hr:
                            i.depthFunc(i.NEVER);
                            break;
                        case ur:
                            i.depthFunc(i.ALWAYS);
                            break;
                        case dr:
                            i.depthFunc(i.LESS);
                            break;
                        case ci:
                            i.depthFunc(i.LEQUAL);
                            break;
                        case fr:
                            i.depthFunc(i.EQUAL);
                            break;
                        case pr:
                            i.depthFunc(i.GEQUAL);
                            break;
                        case mr:
                            i.depthFunc(i.GREATER);
                            break;
                        case _r:
                            i.depthFunc(i.NOTEQUAL);
                            break;
                        default:
                            i.depthFunc(i.LEQUAL)
                    }
                    mt = j
                }
            },
            setLocked: function(j) {
                D = j
            },
            setClear: function(j) {
                Q !== j && (it && (j = 1 - j), i.clearDepth(j), Q = j)
            },
            reset: function() {
                D = !1, at = null, mt = null, Q = null, it = !1
            }
        }
    }

    function s() {
        let D = !1,
            it = null,
            at = null,
            mt = null,
            Q = null,
            j = null,
            xt = null,
            It = null,
            ee = null;
        return {
            setTest: function(Kt) {
                D || (Kt ? Z(i.STENCIL_TEST) : ut(i.STENCIL_TEST))
            },
            setMask: function(Kt) {
                it !== Kt && !D && (i.stencilMask(Kt), it = Kt)
            },
            setFunc: function(Kt, tn, Xe) {
                (at !== Kt || mt !== tn || Q !== Xe) && (i.stencilFunc(Kt, tn, Xe), at = Kt, mt = tn, Q = Xe)
            },
            setOp: function(Kt, tn, Xe) {
                (j !== Kt || xt !== tn || It !== Xe) && (i.stencilOp(Kt, tn, Xe), j = Kt, xt = tn, It = Xe)
            },
            setLocked: function(Kt) {
                D = Kt
            },
            setClear: function(Kt) {
                ee !== Kt && (i.clearStencil(Kt), ee = Kt)
            },
            reset: function() {
                D = !1, it = null, at = null, mt = null, Q = null, j = null, xt = null, It = null, ee = null
            }
        }
    }
    const r = new e,
        a = new n,
        o = new s,
        c = new WeakMap,
        l = new WeakMap;
    let d = {},
        f = {},
        p = new WeakMap,
        m = [],
        x = null,
        _ = !1,
        u = null,
        h = null,
        w = null,
        T = null,
        E = null,
        P = null,
        R = null,
        b = new Ht(0, 0, 0),
        I = 0,
        M = !1,
        S = null,
        A = null,
        G = null,
        O = null,
        N = null;
    const q = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    let V = !1,
        K = 0;
    const z = i.getParameter(i.VERSION);
    z.indexOf("WebGL") !== -1 ? (K = parseFloat(/^WebGL (\d)/.exec(z)[1]), V = K >= 1) : z.indexOf("OpenGL ES") !== -1 && (K = parseFloat(/^OpenGL ES (\d)/.exec(z)[1]), V = K >= 2);
    let st = null,
        tt = {};
    const ft = i.getParameter(i.SCISSOR_BOX),
        Ut = i.getParameter(i.VIEWPORT),
        $t = new he().fromArray(ft),
        Yt = new he().fromArray(Ut);

    function X(D, it, at, mt) {
        const Q = new Uint8Array(4),
            j = i.createTexture();
        i.bindTexture(D, j), i.texParameteri(D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(D, i.TEXTURE_MAG_FILTER, i.NEAREST);
        for (let xt = 0; xt < at; xt++) D === i.TEXTURE_3D || D === i.TEXTURE_2D_ARRAY ? i.texImage3D(it, 0, i.RGBA, 1, 1, mt, 0, i.RGBA, i.UNSIGNED_BYTE, Q) : i.texImage2D(it + xt, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, Q);
        return j
    }
    const $ = {};
    $[i.TEXTURE_2D] = X(i.TEXTURE_2D, i.TEXTURE_2D, 1), $[i.TEXTURE_CUBE_MAP] = X(i.TEXTURE_CUBE_MAP, i.TEXTURE_CUBE_MAP_POSITIVE_X, 6), $[i.TEXTURE_2D_ARRAY] = X(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1), $[i.TEXTURE_3D] = X(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1), r.setClear(0, 0, 0, 1), a.setClear(1), o.setClear(0), Z(i.DEPTH_TEST), a.setFunc(ci), Gt(!1), yt(Ma), Z(i.CULL_FACE), qt(Mn);

    function Z(D) {
        d[D] !== !0 && (i.enable(D), d[D] = !0)
    }

    function ut(D) {
        d[D] !== !1 && (i.disable(D), d[D] = !1)
    }

    function dt(D, it) {
        return f[D] !== it ? (i.bindFramebuffer(D, it), f[D] = it, D === i.DRAW_FRAMEBUFFER && (f[i.FRAMEBUFFER] = it), D === i.FRAMEBUFFER && (f[i.DRAW_FRAMEBUFFER] = it), !0) : !1
    }

    function wt(D, it) {
        let at = m,
            mt = !1;
        if (D) {
            at = p.get(it), at === void 0 && (at = [], p.set(it, at));
            const Q = D.textures;
            if (at.length !== Q.length || at[0] !== i.COLOR_ATTACHMENT0) {
                for (let j = 0, xt = Q.length; j < xt; j++) at[j] = i.COLOR_ATTACHMENT0 + j;
                at.length = Q.length, mt = !0
            }
        } else at[0] !== i.BACK && (at[0] = i.BACK, mt = !0);
        mt && i.drawBuffers(at)
    }

    function jt(D) {
        return x !== D ? (i.useProgram(D), x = D, !0) : !1
    }
    const Dt = {
        [In]: i.FUNC_ADD,
        [$l]: i.FUNC_SUBTRACT,
        [jl]: i.FUNC_REVERSE_SUBTRACT
    };
    Dt[Zl] = i.MIN, Dt[Jl] = i.MAX;
    const C = {
        [Ql]: i.ZERO,
        [tc]: i.ONE,
        [ec]: i.SRC_COLOR,
        [lr]: i.SRC_ALPHA,
        [oc]: i.SRC_ALPHA_SATURATE,
        [rc]: i.DST_COLOR,
        [ic]: i.DST_ALPHA,
        [nc]: i.ONE_MINUS_SRC_COLOR,
        [cr]: i.ONE_MINUS_SRC_ALPHA,
        [ac]: i.ONE_MINUS_DST_COLOR,
        [sc]: i.ONE_MINUS_DST_ALPHA,
        [lc]: i.CONSTANT_COLOR,
        [cc]: i.ONE_MINUS_CONSTANT_COLOR,
        [hc]: i.CONSTANT_ALPHA,
        [uc]: i.ONE_MINUS_CONSTANT_ALPHA
    };

    function qt(D, it, at, mt, Q, j, xt, It, ee, Kt) {
        if (D === Mn) {
            _ === !0 && (ut(i.BLEND), _ = !1);
            return
        }
        if (_ === !1 && (Z(i.BLEND), _ = !0), D !== Kl) {
            if (D !== u || Kt !== M) {
                if ((h !== In || E !== In) && (i.blendEquation(i.FUNC_ADD), h = In, E = In), Kt) switch (D) {
                    case ai:
                        i.blendFuncSeparate(i.ONE, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
                        break;
                    case Sa:
                        i.blendFunc(i.ONE, i.ONE);
                        break;
                    case Ea:
                        i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
                        break;
                    case ya:
                        i.blendFuncSeparate(i.DST_COLOR, i.ONE_MINUS_SRC_ALPHA, i.ZERO, i.ONE);
                        break;
                    default:
                        console.error("THREE.WebGLState: Invalid blending: ", D);
                        break
                } else switch (D) {
                    case ai:
                        i.blendFuncSeparate(i.SRC_ALPHA, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
                        break;
                    case Sa:
                        i.blendFuncSeparate(i.SRC_ALPHA, i.ONE, i.ONE, i.ONE);
                        break;
                    case Ea:
                        console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");
                        break;
                    case ya:
                        console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");
                        break;
                    default:
                        console.error("THREE.WebGLState: Invalid blending: ", D);
                        break
                }
                w = null, T = null, P = null, R = null, b.set(0, 0, 0), I = 0, u = D, M = Kt
            }
            return
        }
        Q = Q || it, j = j || at, xt = xt || mt, (it !== h || Q !== E) && (i.blendEquationSeparate(Dt[it], Dt[Q]), h = it, E = Q), (at !== w || mt !== T || j !== P || xt !== R) && (i.blendFuncSeparate(C[at], C[mt], C[j], C[xt]), w = at, T = mt, P = j, R = xt), (It.equals(b) === !1 || ee !== I) && (i.blendColor(It.r, It.g, It.b, ee), b.copy(It), I = ee), u = D, M = !1
    }

    function bt(D, it) {
        D.side === Ye ? ut(i.CULL_FACE) : Z(i.CULL_FACE);
        let at = D.side === we;
        it && (at = !at), Gt(at), D.blending === ai && D.transparent === !1 ? qt(Mn) : qt(D.blending, D.blendEquation, D.blendSrc, D.blendDst, D.blendEquationAlpha, D.blendSrcAlpha, D.blendDstAlpha, D.blendColor, D.blendAlpha, D.premultipliedAlpha), a.setFunc(D.depthFunc), a.setTest(D.depthTest), a.setMask(D.depthWrite), r.setMask(D.colorWrite);
        const mt = D.stencilWrite;
        o.setTest(mt), mt && (o.setMask(D.stencilWriteMask), o.setFunc(D.stencilFunc, D.stencilRef, D.stencilFuncMask), o.setOp(D.stencilFail, D.stencilZFail, D.stencilZPass)), _t(D.polygonOffset, D.polygonOffsetFactor, D.polygonOffsetUnits), D.alphaToCoverage === !0 ? Z(i.SAMPLE_ALPHA_TO_COVERAGE) : ut(i.SAMPLE_ALPHA_TO_COVERAGE)
    }

    function Gt(D) {
        S !== D && (D ? i.frontFace(i.CW) : i.frontFace(i.CCW), S = D)
    }

    function yt(D) {
        D !== ql ? (Z(i.CULL_FACE), D !== A && (D === Ma ? i.cullFace(i.BACK) : D === Yl ? i.cullFace(i.FRONT) : i.cullFace(i.FRONT_AND_BACK))) : ut(i.CULL_FACE), A = D
    }

    function ie(D) {
        D !== G && (V && i.lineWidth(D), G = D)
    }

    function _t(D, it, at) {
        D ? (Z(i.POLYGON_OFFSET_FILL), (O !== it || N !== at) && (i.polygonOffset(it, at), O = it, N = at)) : ut(i.POLYGON_OFFSET_FILL)
    }

    function Bt(D) {
        D ? Z(i.SCISSOR_TEST) : ut(i.SCISSOR_TEST)
    }

    function _e(D) {
        D === void 0 && (D = i.TEXTURE0 + q - 1), st !== D && (i.activeTexture(D), st = D)
    }

    function ue(D, it, at) {
        at === void 0 && (st === null ? at = i.TEXTURE0 + q - 1 : at = st);
        let mt = tt[at];
        mt === void 0 && (mt = {
            type: void 0,
            texture: void 0
        }, tt[at] = mt), (mt.type !== D || mt.texture !== it) && (st !== at && (i.activeTexture(at), st = at), i.bindTexture(D, it || $[D]), mt.type = D, mt.texture = it)
    }

    function y() {
        const D = tt[st];
        D !== void 0 && D.type !== void 0 && (i.bindTexture(D.type, null), D.type = void 0, D.texture = void 0)
    }

    function g() {
        try {
            i.compressedTexImage2D(...arguments)
        } catch (D) {
            console.error("THREE.WebGLState:", D)
        }
    }

    function B() {
        try {
            i.compressedTexImage3D(...arguments)
        } catch (D) {
            console.error("THREE.WebGLState:", D)
        }
    }

    function Y() {
        try {
            i.texSubImage2D(...arguments)
        } catch (D) {
            console.error("THREE.WebGLState:", D)
        }
    }

    function J() {
        try {
            i.texSubImage3D(...arguments)
        } catch (D) {
            console.error("THREE.WebGLState:", D)
        }
    }

    function W() {
        try {
            i.compressedTexSubImage2D(...arguments)
        } catch (D) {
            console.error("THREE.WebGLState:", D)
        }
    }

    function Et() {
        try {
            i.compressedTexSubImage3D(...arguments)
        } catch (D) {
            console.error("THREE.WebGLState:", D)
        }
    }

    function rt() {
        try {
            i.texStorage2D(...arguments)
        } catch (D) {
            console.error("THREE.WebGLState:", D)
        }
    }

    function vt() {
        try {
            i.texStorage3D(...arguments)
        } catch (D) {
            console.error("THREE.WebGLState:", D)
        }
    }

    function Mt() {
        try {
            i.texImage2D(...arguments)
        } catch (D) {
            console.error("THREE.WebGLState:", D)
        }
    }

    function nt() {
        try {
            i.texImage3D(...arguments)
        } catch (D) {
            console.error("THREE.WebGLState:", D)
        }
    }

    function ht(D) {
        $t.equals(D) === !1 && (i.scissor(D.x, D.y, D.z, D.w), $t.copy(D))
    }

    function Ct(D) {
        Yt.equals(D) === !1 && (i.viewport(D.x, D.y, D.z, D.w), Yt.copy(D))
    }

    function St(D, it) {
        let at = l.get(it);
        at === void 0 && (at = new WeakMap, l.set(it, at));
        let mt = at.get(D);
        mt === void 0 && (mt = i.getUniformBlockIndex(it, D.name), at.set(D, mt))
    }

    function lt(D, it) {
        const mt = l.get(it).get(D);
        c.get(it) !== mt && (i.uniformBlockBinding(it, mt, D.__bindingPointIndex), c.set(it, mt))
    }

    function Nt() {
        i.disable(i.BLEND), i.disable(i.CULL_FACE), i.disable(i.DEPTH_TEST), i.disable(i.POLYGON_OFFSET_FILL), i.disable(i.SCISSOR_TEST), i.disable(i.STENCIL_TEST), i.disable(i.SAMPLE_ALPHA_TO_COVERAGE), i.blendEquation(i.FUNC_ADD), i.blendFunc(i.ONE, i.ZERO), i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO), i.blendColor(0, 0, 0, 0), i.colorMask(!0, !0, !0, !0), i.clearColor(0, 0, 0, 0), i.depthMask(!0), i.depthFunc(i.LESS), a.setReversed(!1), i.clearDepth(1), i.stencilMask(4294967295), i.stencilFunc(i.ALWAYS, 0, 4294967295), i.stencilOp(i.KEEP, i.KEEP, i.KEEP), i.clearStencil(0), i.cullFace(i.BACK), i.frontFace(i.CCW), i.polygonOffset(0, 0), i.activeTexture(i.TEXTURE0), i.bindFramebuffer(i.FRAMEBUFFER, null), i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), i.bindFramebuffer(i.READ_FRAMEBUFFER, null), i.useProgram(null), i.lineWidth(1), i.scissor(0, 0, i.canvas.width, i.canvas.height), i.viewport(0, 0, i.canvas.width, i.canvas.height), d = {}, st = null, tt = {}, f = {}, p = new WeakMap, m = [], x = null, _ = !1, u = null, h = null, w = null, T = null, E = null, P = null, R = null, b = new Ht(0, 0, 0), I = 0, M = !1, S = null, A = null, G = null, O = null, N = null, $t.set(0, 0, i.canvas.width, i.canvas.height), Yt.set(0, 0, i.canvas.width, i.canvas.height), r.reset(), a.reset(), o.reset()
    }
    return {
        buffers: {
            color: r,
            depth: a,
            stencil: o
        },
        enable: Z,
        disable: ut,
        bindFramebuffer: dt,
        drawBuffers: wt,
        useProgram: jt,
        setBlending: qt,
        setMaterial: bt,
        setFlipSided: Gt,
        setCullFace: yt,
        setLineWidth: ie,
        setPolygonOffset: _t,
        setScissorTest: Bt,
        activeTexture: _e,
        bindTexture: ue,
        unbindTexture: y,
        compressedTexImage2D: g,
        compressedTexImage3D: B,
        texImage2D: Mt,
        texImage3D: nt,
        updateUBOMapping: St,
        uniformBlockBinding: lt,
        texStorage2D: rt,
        texStorage3D: vt,
        texSubImage2D: Y,
        texSubImage3D: J,
        compressedTexSubImage2D: W,
        compressedTexSubImage3D: Et,
        scissor: ht,
        viewport: Ct,
        reset: Nt
    }
}

function $p(i, t, e, n, s, r, a) {
    const o = t.has("WEBGL_multisampled_render_to_texture") ? t.get("WEBGL_multisampled_render_to_texture") : null,
        c = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent),
        l = new Lt,
        d = new WeakMap;
    let f;
    const p = new WeakMap;
    let m = !1;
    try {
        m = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null
    } catch {}

    function x(y, g) {
        return m ? new OffscreenCanvas(y, g) : vs("canvas")
    }

    function _(y, g, B) {
        let Y = 1;
        const J = ue(y);
        if ((J.width > B || J.height > B) && (Y = B / Math.max(J.width, J.height)), Y < 1)
            if (typeof HTMLImageElement < "u" && y instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && y instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && y instanceof ImageBitmap || typeof VideoFrame < "u" && y instanceof VideoFrame) {
                const W = Math.floor(Y * J.width),
                    Et = Math.floor(Y * J.height);
                f === void 0 && (f = x(W, Et));
                const rt = g ? x(W, Et) : f;
                return rt.width = W, rt.height = Et, rt.getContext("2d").drawImage(y, 0, 0, W, Et), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + J.width + "x" + J.height + ") to (" + W + "x" + Et + ")."), rt
            } else return "data" in y && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + J.width + "x" + J.height + ")."), y;
        return y
    }

    function u(y) {
        return y.generateMipmaps
    }

    function h(y) {
        i.generateMipmap(y)
    }

    function w(y) {
        return y.isWebGLCubeRenderTarget ? i.TEXTURE_CUBE_MAP : y.isWebGL3DRenderTarget ? i.TEXTURE_3D : y.isWebGLArrayRenderTarget || y.isCompressedArrayTexture ? i.TEXTURE_2D_ARRAY : i.TEXTURE_2D
    }

    function T(y, g, B, Y, J = !1) {
        if (y !== null) {
            if (i[y] !== void 0) return i[y];
            console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + y + "'")
        }
        let W = g;
        if (g === i.RED && (B === i.FLOAT && (W = i.R32F), B === i.HALF_FLOAT && (W = i.R16F), B === i.UNSIGNED_BYTE && (W = i.R8)), g === i.RED_INTEGER && (B === i.UNSIGNED_BYTE && (W = i.R8UI), B === i.UNSIGNED_SHORT && (W = i.R16UI), B === i.UNSIGNED_INT && (W = i.R32UI), B === i.BYTE && (W = i.R8I), B === i.SHORT && (W = i.R16I), B === i.INT && (W = i.R32I)), g === i.RG && (B === i.FLOAT && (W = i.RG32F), B === i.HALF_FLOAT && (W = i.RG16F), B === i.UNSIGNED_BYTE && (W = i.RG8)), g === i.RG_INTEGER && (B === i.UNSIGNED_BYTE && (W = i.RG8UI), B === i.UNSIGNED_SHORT && (W = i.RG16UI), B === i.UNSIGNED_INT && (W = i.RG32UI), B === i.BYTE && (W = i.RG8I), B === i.SHORT && (W = i.RG16I), B === i.INT && (W = i.RG32I)), g === i.RGB_INTEGER && (B === i.UNSIGNED_BYTE && (W = i.RGB8UI), B === i.UNSIGNED_SHORT && (W = i.RGB16UI), B === i.UNSIGNED_INT && (W = i.RGB32UI), B === i.BYTE && (W = i.RGB8I), B === i.SHORT && (W = i.RGB16I), B === i.INT && (W = i.RGB32I)), g === i.RGBA_INTEGER && (B === i.UNSIGNED_BYTE && (W = i.RGBA8UI), B === i.UNSIGNED_SHORT && (W = i.RGBA16UI), B === i.UNSIGNED_INT && (W = i.RGBA32UI), B === i.BYTE && (W = i.RGBA8I), B === i.SHORT && (W = i.RGBA16I), B === i.INT && (W = i.RGBA32I)), g === i.RGB && B === i.UNSIGNED_INT_5_9_9_9_REV && (W = i.RGB9_E5), g === i.RGBA) {
            const Et = J ? gs : Xt.getTransfer(Y);
            B === i.FLOAT && (W = i.RGBA32F), B === i.HALF_FLOAT && (W = i.RGBA16F), B === i.UNSIGNED_BYTE && (W = Et === Jt ? i.SRGB8_ALPHA8 : i.RGBA8), B === i.UNSIGNED_SHORT_4_4_4_4 && (W = i.RGBA4), B === i.UNSIGNED_SHORT_5_5_5_1 && (W = i.RGB5_A1)
        }
        return (W === i.R16F || W === i.R32F || W === i.RG16F || W === i.RG32F || W === i.RGBA16F || W === i.RGBA32F) && t.get("EXT_color_buffer_float"), W
    }

    function E(y, g) {
        let B;
        return y ? g === null || g === Bn || g === Ri ? B = i.DEPTH24_STENCIL8 : g === ln ? B = i.DEPTH32F_STENCIL8 : g === wi && (B = i.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : g === null || g === Bn || g === Ri ? B = i.DEPTH_COMPONENT24 : g === ln ? B = i.DEPTH_COMPONENT32F : g === wi && (B = i.DEPTH_COMPONENT16), B
    }

    function P(y, g) {
        return u(y) === !0 || y.isFramebufferTexture && y.minFilter !== We && y.minFilter !== Ke ? Math.log2(Math.max(g.width, g.height)) + 1 : y.mipmaps !== void 0 && y.mipmaps.length > 0 ? y.mipmaps.length : y.isCompressedTexture && Array.isArray(y.image) ? g.mipmaps.length : 1
    }

    function R(y) {
        const g = y.target;
        g.removeEventListener("dispose", R), I(g), g.isVideoTexture && d.delete(g)
    }

    function b(y) {
        const g = y.target;
        g.removeEventListener("dispose", b), S(g)
    }

    function I(y) {
        const g = n.get(y);
        if (g.__webglInit === void 0) return;
        const B = y.source,
            Y = p.get(B);
        if (Y) {
            const J = Y[g.__cacheKey];
            J.usedTimes--, J.usedTimes === 0 && M(y), Object.keys(Y).length === 0 && p.delete(B)
        }
        n.remove(y)
    }

    function M(y) {
        const g = n.get(y);
        i.deleteTexture(g.__webglTexture);
        const B = y.source,
            Y = p.get(B);
        delete Y[g.__cacheKey], a.memory.textures--
    }

    function S(y) {
        const g = n.get(y);
        if (y.depthTexture && (y.depthTexture.dispose(), n.remove(y.depthTexture)), y.isWebGLCubeRenderTarget)
            for (let Y = 0; Y < 6; Y++) {
                if (Array.isArray(g.__webglFramebuffer[Y]))
                    for (let J = 0; J < g.__webglFramebuffer[Y].length; J++) i.deleteFramebuffer(g.__webglFramebuffer[Y][J]);
                else i.deleteFramebuffer(g.__webglFramebuffer[Y]);
                g.__webglDepthbuffer && i.deleteRenderbuffer(g.__webglDepthbuffer[Y])
            } else {
                if (Array.isArray(g.__webglFramebuffer))
                    for (let Y = 0; Y < g.__webglFramebuffer.length; Y++) i.deleteFramebuffer(g.__webglFramebuffer[Y]);
                else i.deleteFramebuffer(g.__webglFramebuffer);
                if (g.__webglDepthbuffer && i.deleteRenderbuffer(g.__webglDepthbuffer), g.__webglMultisampledFramebuffer && i.deleteFramebuffer(g.__webglMultisampledFramebuffer), g.__webglColorRenderbuffer)
                    for (let Y = 0; Y < g.__webglColorRenderbuffer.length; Y++) g.__webglColorRenderbuffer[Y] && i.deleteRenderbuffer(g.__webglColorRenderbuffer[Y]);
                g.__webglDepthRenderbuffer && i.deleteRenderbuffer(g.__webglDepthRenderbuffer)
            }
        const B = y.textures;
        for (let Y = 0, J = B.length; Y < J; Y++) {
            const W = n.get(B[Y]);
            W.__webglTexture && (i.deleteTexture(W.__webglTexture), a.memory.textures--), n.remove(B[Y])
        }
        n.remove(y)
    }
    let A = 0;

    function G() {
        A = 0
    }

    function O() {
        const y = A;
        return y >= s.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + y + " texture units while this GPU supports only " + s.maxTextures), A += 1, y
    }

    function N(y) {
        const g = [];
        return g.push(y.wrapS), g.push(y.wrapT), g.push(y.wrapR || 0), g.push(y.magFilter), g.push(y.minFilter), g.push(y.anisotropy), g.push(y.internalFormat), g.push(y.format), g.push(y.type), g.push(y.generateMipmaps), g.push(y.premultiplyAlpha), g.push(y.flipY), g.push(y.unpackAlignment), g.push(y.colorSpace), g.join()
    }

    function q(y, g) {
        const B = n.get(y);
        if (y.isVideoTexture && Bt(y), y.isRenderTargetTexture === !1 && y.isExternalTexture !== !0 && y.version > 0 && B.__version !== y.version) {
            const Y = y.image;
            if (Y === null) console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
            else if (Y.complete === !1) console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
            else {
                $(B, y, g);
                return
            }
        } else y.isExternalTexture && (B.__webglTexture = y.sourceTexture ? y.sourceTexture : null);
        e.bindTexture(i.TEXTURE_2D, B.__webglTexture, i.TEXTURE0 + g)
    }

    function V(y, g) {
        const B = n.get(y);
        if (y.isRenderTargetTexture === !1 && y.version > 0 && B.__version !== y.version) {
            $(B, y, g);
            return
        }
        e.bindTexture(i.TEXTURE_2D_ARRAY, B.__webglTexture, i.TEXTURE0 + g)
    }

    function K(y, g) {
        const B = n.get(y);
        if (y.isRenderTargetTexture === !1 && y.version > 0 && B.__version !== y.version) {
            $(B, y, g);
            return
        }
        e.bindTexture(i.TEXTURE_3D, B.__webglTexture, i.TEXTURE0 + g)
    }

    function z(y, g) {
        const B = n.get(y);
        if (y.version > 0 && B.__version !== y.version) {
            Z(B, y, g);
            return
        }
        e.bindTexture(i.TEXTURE_CUBE_MAP, B.__webglTexture, i.TEXTURE0 + g)
    }
    const st = {
            [vr]: i.REPEAT,
            [Fn]: i.CLAMP_TO_EDGE,
            [Mr]: i.MIRRORED_REPEAT
        },
        tt = {
            [We]: i.NEAREST,
            [Sc]: i.NEAREST_MIPMAP_NEAREST,
            [Oi]: i.NEAREST_MIPMAP_LINEAR,
            [Ke]: i.LINEAR,
            [Rs]: i.LINEAR_MIPMAP_NEAREST,
            [On]: i.LINEAR_MIPMAP_LINEAR
        },
        ft = {
            [bc]: i.NEVER,
            [Dc]: i.ALWAYS,
            [Ac]: i.LESS,
            [Wo]: i.LEQUAL,
            [wc]: i.EQUAL,
            [Pc]: i.GEQUAL,
            [Rc]: i.GREATER,
            [Cc]: i.NOTEQUAL
        };

    function Ut(y, g) {
        if (g.type === ln && t.has("OES_texture_float_linear") === !1 && (g.magFilter === Ke || g.magFilter === Rs || g.magFilter === Oi || g.magFilter === On || g.minFilter === Ke || g.minFilter === Rs || g.minFilter === Oi || g.minFilter === On) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), i.texParameteri(y, i.TEXTURE_WRAP_S, st[g.wrapS]), i.texParameteri(y, i.TEXTURE_WRAP_T, st[g.wrapT]), (y === i.TEXTURE_3D || y === i.TEXTURE_2D_ARRAY) && i.texParameteri(y, i.TEXTURE_WRAP_R, st[g.wrapR]), i.texParameteri(y, i.TEXTURE_MAG_FILTER, tt[g.magFilter]), i.texParameteri(y, i.TEXTURE_MIN_FILTER, tt[g.minFilter]), g.compareFunction && (i.texParameteri(y, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE), i.texParameteri(y, i.TEXTURE_COMPARE_FUNC, ft[g.compareFunction])), t.has("EXT_texture_filter_anisotropic") === !0) {
            if (g.magFilter === We || g.minFilter !== Oi && g.minFilter !== On || g.type === ln && t.has("OES_texture_float_linear") === !1) return;
            if (g.anisotropy > 1 || n.get(g).__currentAnisotropy) {
                const B = t.get("EXT_texture_filter_anisotropic");
                i.texParameterf(y, B.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(g.anisotropy, s.getMaxAnisotropy())), n.get(g).__currentAnisotropy = g.anisotropy
            }
        }
    }

    function $t(y, g) {
        let B = !1;
        y.__webglInit === void 0 && (y.__webglInit = !0, g.addEventListener("dispose", R));
        const Y = g.source;
        let J = p.get(Y);
        J === void 0 && (J = {}, p.set(Y, J));
        const W = N(g);
        if (W !== y.__cacheKey) {
            J[W] === void 0 && (J[W] = {
                texture: i.createTexture(),
                usedTimes: 0
            }, a.memory.textures++, B = !0), J[W].usedTimes++;
            const Et = J[y.__cacheKey];
            Et !== void 0 && (J[y.__cacheKey].usedTimes--, Et.usedTimes === 0 && M(g)), y.__cacheKey = W, y.__webglTexture = J[W].texture
        }
        return B
    }

    function Yt(y, g, B) {
        return Math.floor(Math.floor(y / B) / g)
    }

    function X(y, g, B, Y) {
        const W = y.updateRanges;
        if (W.length === 0) e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, g.width, g.height, B, Y, g.data);
        else {
            W.sort((nt, ht) => nt.start - ht.start);
            let Et = 0;
            for (let nt = 1; nt < W.length; nt++) {
                const ht = W[Et],
                    Ct = W[nt],
                    St = ht.start + ht.count,
                    lt = Yt(Ct.start, g.width, 4),
                    Nt = Yt(ht.start, g.width, 4);
                Ct.start <= St + 1 && lt === Nt && Yt(Ct.start + Ct.count - 1, g.width, 4) === lt ? ht.count = Math.max(ht.count, Ct.start + Ct.count - ht.start) : (++Et, W[Et] = Ct)
            }
            W.length = Et + 1;
            const rt = i.getParameter(i.UNPACK_ROW_LENGTH),
                vt = i.getParameter(i.UNPACK_SKIP_PIXELS),
                Mt = i.getParameter(i.UNPACK_SKIP_ROWS);
            i.pixelStorei(i.UNPACK_ROW_LENGTH, g.width);
            for (let nt = 0, ht = W.length; nt < ht; nt++) {
                const Ct = W[nt],
                    St = Math.floor(Ct.start / 4),
                    lt = Math.ceil(Ct.count / 4),
                    Nt = St % g.width,
                    D = Math.floor(St / g.width),
                    it = lt,
                    at = 1;
                i.pixelStorei(i.UNPACK_SKIP_PIXELS, Nt), i.pixelStorei(i.UNPACK_SKIP_ROWS, D), e.texSubImage2D(i.TEXTURE_2D, 0, Nt, D, it, at, B, Y, g.data)
            }
            y.clearUpdateRanges(), i.pixelStorei(i.UNPACK_ROW_LENGTH, rt), i.pixelStorei(i.UNPACK_SKIP_PIXELS, vt), i.pixelStorei(i.UNPACK_SKIP_ROWS, Mt)
        }
    }

    function $(y, g, B) {
        let Y = i.TEXTURE_2D;
        (g.isDataArrayTexture || g.isCompressedArrayTexture) && (Y = i.TEXTURE_2D_ARRAY), g.isData3DTexture && (Y = i.TEXTURE_3D);
        const J = $t(y, g),
            W = g.source;
        e.bindTexture(Y, y.__webglTexture, i.TEXTURE0 + B);
        const Et = n.get(W);
        if (W.version !== Et.__version || J === !0) {
            e.activeTexture(i.TEXTURE0 + B);
            const rt = Xt.getPrimaries(Xt.workingColorSpace),
                vt = g.colorSpace === vn ? null : Xt.getPrimaries(g.colorSpace),
                Mt = g.colorSpace === vn || rt === vt ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
            i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, g.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, g.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, g.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, Mt);
            let nt = _(g.image, !1, s.maxTextureSize);
            nt = _e(g, nt);
            const ht = r.convert(g.format, g.colorSpace),
                Ct = r.convert(g.type);
            let St = T(g.internalFormat, ht, Ct, g.colorSpace, g.isVideoTexture);
            Ut(Y, g);
            let lt;
            const Nt = g.mipmaps,
                D = g.isVideoTexture !== !0,
                it = Et.__version === void 0 || J === !0,
                at = W.dataReady,
                mt = P(g, nt);
            if (g.isDepthTexture) St = E(g.format === Pi, g.type), it && (D ? e.texStorage2D(i.TEXTURE_2D, 1, St, nt.width, nt.height) : e.texImage2D(i.TEXTURE_2D, 0, St, nt.width, nt.height, 0, ht, Ct, null));
            else if (g.isDataTexture)
                if (Nt.length > 0) {
                    D && it && e.texStorage2D(i.TEXTURE_2D, mt, St, Nt[0].width, Nt[0].height);
                    for (let Q = 0, j = Nt.length; Q < j; Q++) lt = Nt[Q], D ? at && e.texSubImage2D(i.TEXTURE_2D, Q, 0, 0, lt.width, lt.height, ht, Ct, lt.data) : e.texImage2D(i.TEXTURE_2D, Q, St, lt.width, lt.height, 0, ht, Ct, lt.data);
                    g.generateMipmaps = !1
                } else D ? (it && e.texStorage2D(i.TEXTURE_2D, mt, St, nt.width, nt.height), at && X(g, nt, ht, Ct)) : e.texImage2D(i.TEXTURE_2D, 0, St, nt.width, nt.height, 0, ht, Ct, nt.data);
            else if (g.isCompressedTexture)
                if (g.isCompressedArrayTexture) {
                    D && it && e.texStorage3D(i.TEXTURE_2D_ARRAY, mt, St, Nt[0].width, Nt[0].height, nt.depth);
                    for (let Q = 0, j = Nt.length; Q < j; Q++)
                        if (lt = Nt[Q], g.format !== Ve)
                            if (ht !== null)
                                if (D) {
                                    if (at)
                                        if (g.layerUpdates.size > 0) {
                                            const xt = eo(lt.width, lt.height, g.format, g.type);
                                            for (const It of g.layerUpdates) {
                                                const ee = lt.data.subarray(It * xt / lt.data.BYTES_PER_ELEMENT, (It + 1) * xt / lt.data.BYTES_PER_ELEMENT);
                                                e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, Q, 0, 0, It, lt.width, lt.height, 1, ht, ee)
                                            }
                                            g.clearLayerUpdates()
                                        } else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, Q, 0, 0, 0, lt.width, lt.height, nt.depth, ht, lt.data)
                                } else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY, Q, St, lt.width, lt.height, nt.depth, 0, lt.data, 0, 0);
                    else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
                    else D ? at && e.texSubImage3D(i.TEXTURE_2D_ARRAY, Q, 0, 0, 0, lt.width, lt.height, nt.depth, ht, Ct, lt.data) : e.texImage3D(i.TEXTURE_2D_ARRAY, Q, St, lt.width, lt.height, nt.depth, 0, ht, Ct, lt.data)
                } else {
                    D && it && e.texStorage2D(i.TEXTURE_2D, mt, St, Nt[0].width, Nt[0].height);
                    for (let Q = 0, j = Nt.length; Q < j; Q++) lt = Nt[Q], g.format !== Ve ? ht !== null ? D ? at && e.compressedTexSubImage2D(i.TEXTURE_2D, Q, 0, 0, lt.width, lt.height, ht, lt.data) : e.compressedTexImage2D(i.TEXTURE_2D, Q, St, lt.width, lt.height, 0, lt.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : D ? at && e.texSubImage2D(i.TEXTURE_2D, Q, 0, 0, lt.width, lt.height, ht, Ct, lt.data) : e.texImage2D(i.TEXTURE_2D, Q, St, lt.width, lt.height, 0, ht, Ct, lt.data)
                }
            else if (g.isDataArrayTexture)
                if (D) {
                    if (it && e.texStorage3D(i.TEXTURE_2D_ARRAY, mt, St, nt.width, nt.height, nt.depth), at)
                        if (g.layerUpdates.size > 0) {
                            const Q = eo(nt.width, nt.height, g.format, g.type);
                            for (const j of g.layerUpdates) {
                                const xt = nt.data.subarray(j * Q / nt.data.BYTES_PER_ELEMENT, (j + 1) * Q / nt.data.BYTES_PER_ELEMENT);
                                e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, j, nt.width, nt.height, 1, ht, Ct, xt)
                            }
                            g.clearLayerUpdates()
                        } else e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, 0, nt.width, nt.height, nt.depth, ht, Ct, nt.data)
                } else e.texImage3D(i.TEXTURE_2D_ARRAY, 0, St, nt.width, nt.height, nt.depth, 0, ht, Ct, nt.data);
            else if (g.isData3DTexture) D ? (it && e.texStorage3D(i.TEXTURE_3D, mt, St, nt.width, nt.height, nt.depth), at && e.texSubImage3D(i.TEXTURE_3D, 0, 0, 0, 0, nt.width, nt.height, nt.depth, ht, Ct, nt.data)) : e.texImage3D(i.TEXTURE_3D, 0, St, nt.width, nt.height, nt.depth, 0, ht, Ct, nt.data);
            else if (g.isFramebufferTexture) {
                if (it)
                    if (D) e.texStorage2D(i.TEXTURE_2D, mt, St, nt.width, nt.height);
                    else {
                        let Q = nt.width,
                            j = nt.height;
                        for (let xt = 0; xt < mt; xt++) e.texImage2D(i.TEXTURE_2D, xt, St, Q, j, 0, ht, Ct, null), Q >>= 1, j >>= 1
                    }
            } else if (Nt.length > 0) {
                if (D && it) {
                    const Q = ue(Nt[0]);
                    e.texStorage2D(i.TEXTURE_2D, mt, St, Q.width, Q.height)
                }
                for (let Q = 0, j = Nt.length; Q < j; Q++) lt = Nt[Q], D ? at && e.texSubImage2D(i.TEXTURE_2D, Q, 0, 0, ht, Ct, lt) : e.texImage2D(i.TEXTURE_2D, Q, St, ht, Ct, lt);
                g.generateMipmaps = !1
            } else if (D) {
                if (it) {
                    const Q = ue(nt);
                    e.texStorage2D(i.TEXTURE_2D, mt, St, Q.width, Q.height)
                }
                at && e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, ht, Ct, nt)
            } else e.texImage2D(i.TEXTURE_2D, 0, St, ht, Ct, nt);
            u(g) && h(Y), Et.__version = W.version, g.onUpdate && g.onUpdate(g)
        }
        y.__version = g.version
    }

    function Z(y, g, B) {
        if (g.image.length !== 6) return;
        const Y = $t(y, g),
            J = g.source;
        e.bindTexture(i.TEXTURE_CUBE_MAP, y.__webglTexture, i.TEXTURE0 + B);
        const W = n.get(J);
        if (J.version !== W.__version || Y === !0) {
            e.activeTexture(i.TEXTURE0 + B);
            const Et = Xt.getPrimaries(Xt.workingColorSpace),
                rt = g.colorSpace === vn ? null : Xt.getPrimaries(g.colorSpace),
                vt = g.colorSpace === vn || Et === rt ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
            i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, g.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, g.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, g.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, vt);
            const Mt = g.isCompressedTexture || g.image[0].isCompressedTexture,
                nt = g.image[0] && g.image[0].isDataTexture,
                ht = [];
            for (let j = 0; j < 6; j++) !Mt && !nt ? ht[j] = _(g.image[j], !0, s.maxCubemapSize) : ht[j] = nt ? g.image[j].image : g.image[j], ht[j] = _e(g, ht[j]);
            const Ct = ht[0],
                St = r.convert(g.format, g.colorSpace),
                lt = r.convert(g.type),
                Nt = T(g.internalFormat, St, lt, g.colorSpace),
                D = g.isVideoTexture !== !0,
                it = W.__version === void 0 || Y === !0,
                at = J.dataReady;
            let mt = P(g, Ct);
            Ut(i.TEXTURE_CUBE_MAP, g);
            let Q;
            if (Mt) {
                D && it && e.texStorage2D(i.TEXTURE_CUBE_MAP, mt, Nt, Ct.width, Ct.height);
                for (let j = 0; j < 6; j++) {
                    Q = ht[j].mipmaps;
                    for (let xt = 0; xt < Q.length; xt++) {
                        const It = Q[xt];
                        g.format !== Ve ? St !== null ? D ? at && e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, xt, 0, 0, It.width, It.height, St, It.data) : e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, xt, Nt, It.width, It.height, 0, It.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : D ? at && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, xt, 0, 0, It.width, It.height, St, lt, It.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, xt, Nt, It.width, It.height, 0, St, lt, It.data)
                    }
                }
            } else {
                if (Q = g.mipmaps, D && it) {
                    Q.length > 0 && mt++;
                    const j = ue(ht[0]);
                    e.texStorage2D(i.TEXTURE_CUBE_MAP, mt, Nt, j.width, j.height)
                }
                for (let j = 0; j < 6; j++)
                    if (nt) {
                        D ? at && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, 0, 0, 0, ht[j].width, ht[j].height, St, lt, ht[j].data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, 0, Nt, ht[j].width, ht[j].height, 0, St, lt, ht[j].data);
                        for (let xt = 0; xt < Q.length; xt++) {
                            const ee = Q[xt].image[j].image;
                            D ? at && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, xt + 1, 0, 0, ee.width, ee.height, St, lt, ee.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, xt + 1, Nt, ee.width, ee.height, 0, St, lt, ee.data)
                        }
                    } else {
                        D ? at && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, 0, 0, 0, St, lt, ht[j]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, 0, Nt, St, lt, ht[j]);
                        for (let xt = 0; xt < Q.length; xt++) {
                            const It = Q[xt];
                            D ? at && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, xt + 1, 0, 0, St, lt, It.image[j]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, xt + 1, Nt, St, lt, It.image[j])
                        }
                    }
            }
            u(g) && h(i.TEXTURE_CUBE_MAP), W.__version = J.version, g.onUpdate && g.onUpdate(g)
        }
        y.__version = g.version
    }

    function ut(y, g, B, Y, J, W) {
        const Et = r.convert(B.format, B.colorSpace),
            rt = r.convert(B.type),
            vt = T(B.internalFormat, Et, rt, B.colorSpace),
            Mt = n.get(g),
            nt = n.get(B);
        if (nt.__renderTarget = g, !Mt.__hasExternalTextures) {
            const ht = Math.max(1, g.width >> W),
                Ct = Math.max(1, g.height >> W);
            J === i.TEXTURE_3D || J === i.TEXTURE_2D_ARRAY ? e.texImage3D(J, W, vt, ht, Ct, g.depth, 0, Et, rt, null) : e.texImage2D(J, W, vt, ht, Ct, 0, Et, rt, null)
        }
        e.bindFramebuffer(i.FRAMEBUFFER, y), _t(g) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, Y, J, nt.__webglTexture, 0, ie(g)) : (J === i.TEXTURE_2D || J >= i.TEXTURE_CUBE_MAP_POSITIVE_X && J <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z) && i.framebufferTexture2D(i.FRAMEBUFFER, Y, J, nt.__webglTexture, W), e.bindFramebuffer(i.FRAMEBUFFER, null)
    }

    function dt(y, g, B) {
        if (i.bindRenderbuffer(i.RENDERBUFFER, y), g.depthBuffer) {
            const Y = g.depthTexture,
                J = Y && Y.isDepthTexture ? Y.type : null,
                W = E(g.stencilBuffer, J),
                Et = g.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT,
                rt = ie(g);
            _t(g) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, rt, W, g.width, g.height) : B ? i.renderbufferStorageMultisample(i.RENDERBUFFER, rt, W, g.width, g.height) : i.renderbufferStorage(i.RENDERBUFFER, W, g.width, g.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, Et, i.RENDERBUFFER, y)
        } else {
            const Y = g.textures;
            for (let J = 0; J < Y.length; J++) {
                const W = Y[J],
                    Et = r.convert(W.format, W.colorSpace),
                    rt = r.convert(W.type),
                    vt = T(W.internalFormat, Et, rt, W.colorSpace),
                    Mt = ie(g);
                B && _t(g) === !1 ? i.renderbufferStorageMultisample(i.RENDERBUFFER, Mt, vt, g.width, g.height) : _t(g) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, Mt, vt, g.width, g.height) : i.renderbufferStorage(i.RENDERBUFFER, vt, g.width, g.height)
            }
        }
        i.bindRenderbuffer(i.RENDERBUFFER, null)
    }

    function wt(y, g) {
        if (g && g.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
        if (e.bindFramebuffer(i.FRAMEBUFFER, y), !(g.depthTexture && g.depthTexture.isDepthTexture)) throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
        const Y = n.get(g.depthTexture);
        Y.__renderTarget = g, (!Y.__webglTexture || g.depthTexture.image.width !== g.width || g.depthTexture.image.height !== g.height) && (g.depthTexture.image.width = g.width, g.depthTexture.image.height = g.height, g.depthTexture.needsUpdate = !0), q(g.depthTexture, 0);
        const J = Y.__webglTexture,
            W = ie(g);
        if (g.depthTexture.format === Ci) _t(g) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, J, 0, W) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, J, 0);
        else if (g.depthTexture.format === Pi) _t(g) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, J, 0, W) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, J, 0);
        else throw new Error("Unknown depthTexture format")
    }

    function jt(y) {
        const g = n.get(y),
            B = y.isWebGLCubeRenderTarget === !0;
        if (g.__boundDepthTexture !== y.depthTexture) {
            const Y = y.depthTexture;
            if (g.__depthDisposeCallback && g.__depthDisposeCallback(), Y) {
                const J = () => {
                    delete g.__boundDepthTexture, delete g.__depthDisposeCallback, Y.removeEventListener("dispose", J)
                };
                Y.addEventListener("dispose", J), g.__depthDisposeCallback = J
            }
            g.__boundDepthTexture = Y
        }
        if (y.depthTexture && !g.__autoAllocateDepthBuffer) {
            if (B) throw new Error("target.depthTexture not supported in Cube render targets");
            const Y = y.texture.mipmaps;
            Y && Y.length > 0 ? wt(g.__webglFramebuffer[0], y) : wt(g.__webglFramebuffer, y)
        } else if (B) {
            g.__webglDepthbuffer = [];
            for (let Y = 0; Y < 6; Y++)
                if (e.bindFramebuffer(i.FRAMEBUFFER, g.__webglFramebuffer[Y]), g.__webglDepthbuffer[Y] === void 0) g.__webglDepthbuffer[Y] = i.createRenderbuffer(), dt(g.__webglDepthbuffer[Y], y, !1);
                else {
                    const J = y.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT,
                        W = g.__webglDepthbuffer[Y];
                    i.bindRenderbuffer(i.RENDERBUFFER, W), i.framebufferRenderbuffer(i.FRAMEBUFFER, J, i.RENDERBUFFER, W)
                }
        } else {
            const Y = y.texture.mipmaps;
            if (Y && Y.length > 0 ? e.bindFramebuffer(i.FRAMEBUFFER, g.__webglFramebuffer[0]) : e.bindFramebuffer(i.FRAMEBUFFER, g.__webglFramebuffer), g.__webglDepthbuffer === void 0) g.__webglDepthbuffer = i.createRenderbuffer(), dt(g.__webglDepthbuffer, y, !1);
            else {
                const J = y.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT,
                    W = g.__webglDepthbuffer;
                i.bindRenderbuffer(i.RENDERBUFFER, W), i.framebufferRenderbuffer(i.FRAMEBUFFER, J, i.RENDERBUFFER, W)
            }
        }
        e.bindFramebuffer(i.FRAMEBUFFER, null)
    }

    function Dt(y, g, B) {
        const Y = n.get(y);
        g !== void 0 && ut(Y.__webglFramebuffer, y, y.texture, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, 0), B !== void 0 && jt(y)
    }

    function C(y) {
        const g = y.texture,
            B = n.get(y),
            Y = n.get(g);
        y.addEventListener("dispose", b);
        const J = y.textures,
            W = y.isWebGLCubeRenderTarget === !0,
            Et = J.length > 1;
        if (Et || (Y.__webglTexture === void 0 && (Y.__webglTexture = i.createTexture()), Y.__version = g.version, a.memory.textures++), W) {
            B.__webglFramebuffer = [];
            for (let rt = 0; rt < 6; rt++)
                if (g.mipmaps && g.mipmaps.length > 0) {
                    B.__webglFramebuffer[rt] = [];
                    for (let vt = 0; vt < g.mipmaps.length; vt++) B.__webglFramebuffer[rt][vt] = i.createFramebuffer()
                } else B.__webglFramebuffer[rt] = i.createFramebuffer()
        } else {
            if (g.mipmaps && g.mipmaps.length > 0) {
                B.__webglFramebuffer = [];
                for (let rt = 0; rt < g.mipmaps.length; rt++) B.__webglFramebuffer[rt] = i.createFramebuffer()
            } else B.__webglFramebuffer = i.createFramebuffer();
            if (Et)
                for (let rt = 0, vt = J.length; rt < vt; rt++) {
                    const Mt = n.get(J[rt]);
                    Mt.__webglTexture === void 0 && (Mt.__webglTexture = i.createTexture(), a.memory.textures++)
                }
            if (y.samples > 0 && _t(y) === !1) {
                B.__webglMultisampledFramebuffer = i.createFramebuffer(), B.__webglColorRenderbuffer = [], e.bindFramebuffer(i.FRAMEBUFFER, B.__webglMultisampledFramebuffer);
                for (let rt = 0; rt < J.length; rt++) {
                    const vt = J[rt];
                    B.__webglColorRenderbuffer[rt] = i.createRenderbuffer(), i.bindRenderbuffer(i.RENDERBUFFER, B.__webglColorRenderbuffer[rt]);
                    const Mt = r.convert(vt.format, vt.colorSpace),
                        nt = r.convert(vt.type),
                        ht = T(vt.internalFormat, Mt, nt, vt.colorSpace, y.isXRRenderTarget === !0),
                        Ct = ie(y);
                    i.renderbufferStorageMultisample(i.RENDERBUFFER, Ct, ht, y.width, y.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + rt, i.RENDERBUFFER, B.__webglColorRenderbuffer[rt])
                }
                i.bindRenderbuffer(i.RENDERBUFFER, null), y.depthBuffer && (B.__webglDepthRenderbuffer = i.createRenderbuffer(), dt(B.__webglDepthRenderbuffer, y, !0)), e.bindFramebuffer(i.FRAMEBUFFER, null)
            }
        }
        if (W) {
            e.bindTexture(i.TEXTURE_CUBE_MAP, Y.__webglTexture), Ut(i.TEXTURE_CUBE_MAP, g);
            for (let rt = 0; rt < 6; rt++)
                if (g.mipmaps && g.mipmaps.length > 0)
                    for (let vt = 0; vt < g.mipmaps.length; vt++) ut(B.__webglFramebuffer[rt][vt], y, g, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + rt, vt);
                else ut(B.__webglFramebuffer[rt], y, g, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + rt, 0);
            u(g) && h(i.TEXTURE_CUBE_MAP), e.unbindTexture()
        } else if (Et) {
            for (let rt = 0, vt = J.length; rt < vt; rt++) {
                const Mt = J[rt],
                    nt = n.get(Mt);
                let ht = i.TEXTURE_2D;
                (y.isWebGL3DRenderTarget || y.isWebGLArrayRenderTarget) && (ht = y.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), e.bindTexture(ht, nt.__webglTexture), Ut(ht, Mt), ut(B.__webglFramebuffer, y, Mt, i.COLOR_ATTACHMENT0 + rt, ht, 0), u(Mt) && h(ht)
            }
            e.unbindTexture()
        } else {
            let rt = i.TEXTURE_2D;
            if ((y.isWebGL3DRenderTarget || y.isWebGLArrayRenderTarget) && (rt = y.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), e.bindTexture(rt, Y.__webglTexture), Ut(rt, g), g.mipmaps && g.mipmaps.length > 0)
                for (let vt = 0; vt < g.mipmaps.length; vt++) ut(B.__webglFramebuffer[vt], y, g, i.COLOR_ATTACHMENT0, rt, vt);
            else ut(B.__webglFramebuffer, y, g, i.COLOR_ATTACHMENT0, rt, 0);
            u(g) && h(rt), e.unbindTexture()
        }
        y.depthBuffer && jt(y)
    }

    function qt(y) {
        const g = y.textures;
        for (let B = 0, Y = g.length; B < Y; B++) {
            const J = g[B];
            if (u(J)) {
                const W = w(y),
                    Et = n.get(J).__webglTexture;
                e.bindTexture(W, Et), h(W), e.unbindTexture()
            }
        }
    }
    const bt = [],
        Gt = [];

    function yt(y) {
        if (y.samples > 0) {
            if (_t(y) === !1) {
                const g = y.textures,
                    B = y.width,
                    Y = y.height;
                let J = i.COLOR_BUFFER_BIT;
                const W = y.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT,
                    Et = n.get(y),
                    rt = g.length > 1;
                if (rt)
                    for (let Mt = 0; Mt < g.length; Mt++) e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Mt, i.RENDERBUFFER, null), e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Mt, i.TEXTURE_2D, null, 0);
                e.bindFramebuffer(i.READ_FRAMEBUFFER, Et.__webglMultisampledFramebuffer);
                const vt = y.texture.mipmaps;
                vt && vt.length > 0 ? e.bindFramebuffer(i.DRAW_FRAMEBUFFER, Et.__webglFramebuffer[0]) : e.bindFramebuffer(i.DRAW_FRAMEBUFFER, Et.__webglFramebuffer);
                for (let Mt = 0; Mt < g.length; Mt++) {
                    if (y.resolveDepthBuffer && (y.depthBuffer && (J |= i.DEPTH_BUFFER_BIT), y.stencilBuffer && y.resolveStencilBuffer && (J |= i.STENCIL_BUFFER_BIT)), rt) {
                        i.framebufferRenderbuffer(i.READ_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.RENDERBUFFER, Et.__webglColorRenderbuffer[Mt]);
                        const nt = n.get(g[Mt]).__webglTexture;
                        i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, nt, 0)
                    }
                    i.blitFramebuffer(0, 0, B, Y, 0, 0, B, Y, J, i.NEAREST), c === !0 && (bt.length = 0, Gt.length = 0, bt.push(i.COLOR_ATTACHMENT0 + Mt), y.depthBuffer && y.resolveDepthBuffer === !1 && (bt.push(W), Gt.push(W), i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, Gt)), i.invalidateFramebuffer(i.READ_FRAMEBUFFER, bt))
                }
                if (e.bindFramebuffer(i.READ_FRAMEBUFFER, null), e.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), rt)
                    for (let Mt = 0; Mt < g.length; Mt++) {
                        e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Mt, i.RENDERBUFFER, Et.__webglColorRenderbuffer[Mt]);
                        const nt = n.get(g[Mt]).__webglTexture;
                        e.bindFramebuffer(i.FRAMEBUFFER, Et.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + Mt, i.TEXTURE_2D, nt, 0)
                    }
                e.bindFramebuffer(i.DRAW_FRAMEBUFFER, Et.__webglMultisampledFramebuffer)
            } else if (y.depthBuffer && y.resolveDepthBuffer === !1 && c) {
                const g = y.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT;
                i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [g])
            }
        }
    }

    function ie(y) {
        return Math.min(s.maxSamples, y.samples)
    }

    function _t(y) {
        const g = n.get(y);
        return y.samples > 0 && t.has("WEBGL_multisampled_render_to_texture") === !0 && g.__useRenderToTexture !== !1
    }

    function Bt(y) {
        const g = a.render.frame;
        d.get(y) !== g && (d.set(y, g), y.update())
    }

    function _e(y, g) {
        const B = y.colorSpace,
            Y = y.format,
            J = y.type;
        return y.isCompressedTexture === !0 || y.isVideoTexture === !0 || B !== di && B !== vn && (Xt.getTransfer(B) === Jt ? (Y !== Ve || J !== Je) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", B)), g
    }

    function ue(y) {
        return typeof HTMLImageElement < "u" && y instanceof HTMLImageElement ? (l.width = y.naturalWidth || y.width, l.height = y.naturalHeight || y.height) : typeof VideoFrame < "u" && y instanceof VideoFrame ? (l.width = y.displayWidth, l.height = y.displayHeight) : (l.width = y.width, l.height = y.height), l
    }
    this.allocateTextureUnit = O, this.resetTextureUnits = G, this.setTexture2D = q, this.setTexture2DArray = V, this.setTexture3D = K, this.setTextureCube = z, this.rebindTextures = Dt, this.setupRenderTarget = C, this.updateRenderTargetMipmap = qt, this.updateMultisampleRenderTarget = yt, this.setupDepthRenderbuffer = jt, this.setupFrameBufferTexture = ut, this.useMultisampledRTT = _t
}

function jp(i, t) {
    function e(n, s = vn) {
        let r;
        const a = Xt.getTransfer(s);
        if (n === Je) return i.UNSIGNED_BYTE;
        if (n === ea) return i.UNSIGNED_SHORT_4_4_4_4;
        if (n === na) return i.UNSIGNED_SHORT_5_5_5_1;
        if (n === Oo) return i.UNSIGNED_INT_5_9_9_9_REV;
        if (n === No) return i.BYTE;
        if (n === Fo) return i.SHORT;
        if (n === wi) return i.UNSIGNED_SHORT;
        if (n === ta) return i.INT;
        if (n === Bn) return i.UNSIGNED_INT;
        if (n === ln) return i.FLOAT;
        if (n === Di) return i.HALF_FLOAT;
        if (n === Bo) return i.ALPHA;
        if (n === zo) return i.RGB;
        if (n === Ve) return i.RGBA;
        if (n === Ci) return i.DEPTH_COMPONENT;
        if (n === Pi) return i.DEPTH_STENCIL;
        if (n === Ho) return i.RED;
        if (n === ia) return i.RED_INTEGER;
        if (n === ko) return i.RG;
        if (n === sa) return i.RG_INTEGER;
        if (n === ra) return i.RGBA_INTEGER;
        if (n === hs || n === us || n === ds || n === fs)
            if (a === Jt)
                if (r = t.get("WEBGL_compressed_texture_s3tc_srgb"), r !== null) {
                    if (n === hs) return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;
                    if (n === us) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
                    if (n === ds) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
                    if (n === fs) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT
                } else return null;
        else if (r = t.get("WEBGL_compressed_texture_s3tc"), r !== null) {
            if (n === hs) return r.COMPRESSED_RGB_S3TC_DXT1_EXT;
            if (n === us) return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;
            if (n === ds) return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;
            if (n === fs) return r.COMPRESSED_RGBA_S3TC_DXT5_EXT
        } else return null;
        if (n === Sr || n === Er || n === yr || n === Tr)
            if (r = t.get("WEBGL_compressed_texture_pvrtc"), r !== null) {
                if (n === Sr) return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
                if (n === Er) return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
                if (n === yr) return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
                if (n === Tr) return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
            } else return null;
        if (n === br || n === Ar || n === wr)
            if (r = t.get("WEBGL_compressed_texture_etc"), r !== null) {
                if (n === br || n === Ar) return a === Jt ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
                if (n === wr) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC
            } else return null;
        if (n === Rr || n === Cr || n === Pr || n === Dr || n === Lr || n === Ir || n === Ur || n === Nr || n === Fr || n === Or || n === Br || n === zr || n === Hr || n === kr)
            if (r = t.get("WEBGL_compressed_texture_astc"), r !== null) {
                if (n === Rr) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
                if (n === Cr) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
                if (n === Pr) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
                if (n === Dr) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
                if (n === Lr) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
                if (n === Ir) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
                if (n === Ur) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
                if (n === Nr) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
                if (n === Fr) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
                if (n === Or) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
                if (n === Br) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
                if (n === zr) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
                if (n === Hr) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
                if (n === kr) return a === Jt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR
            } else return null;
        if (n === ps || n === Gr || n === Vr)
            if (r = t.get("EXT_texture_compression_bptc"), r !== null) {
                if (n === ps) return a === Jt ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
                if (n === Gr) return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
                if (n === Vr) return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT
            } else return null;
        if (n === Go || n === Wr || n === Xr || n === qr)
            if (r = t.get("EXT_texture_compression_rgtc"), r !== null) {
                if (n === ps) return r.COMPRESSED_RED_RGTC1_EXT;
                if (n === Wr) return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;
                if (n === Xr) return r.COMPRESSED_RED_GREEN_RGTC2_EXT;
                if (n === qr) return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT
            } else return null;
        return n === Ri ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null
    }
    return {
        convert: e
    }
}
class ll extends Re {
    constructor(t = null) {
        super(), this.sourceTexture = t, this.isExternalTexture = !0
    }
}
const Zp = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`,
    Jp = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
class Qp {
    constructor() {
        this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0
    }
    init(t, e) {
        if (this.texture === null) {
            const n = new ll(t.texture);
            (t.depthNear !== e.depthNear || t.depthFar !== e.depthFar) && (this.depthNear = t.depthNear, this.depthFar = t.depthFar), this.texture = n
        }
    }
    getMesh(t) {
        if (this.texture !== null && this.mesh === null) {
            const e = t.cameras[0].viewport,
                n = new yn({
                    vertexShader: Zp,
                    fragmentShader: Jp,
                    uniforms: {
                        depthColor: {
                            value: this.texture
                        },
                        depthWidth: {
                            value: e.z
                        },
                        depthHeight: {
                            value: e.w
                        }
                    }
                });
            this.mesh = new ze(new Ui(20, 20), n)
        }
        return this.mesh
    }
    reset() {
        this.texture = null, this.mesh = null
    }
    getDepthTexture() {
        return this.texture
    }
}
class tm extends Gn {
    constructor(t, e) {
        super();
        const n = this;
        let s = null,
            r = 1,
            a = null,
            o = "local-floor",
            c = 1,
            l = null,
            d = null,
            f = null,
            p = null,
            m = null,
            x = null;
        const _ = new Qp,
            u = {},
            h = e.getContextAttributes();
        let w = null,
            T = null;
        const E = [],
            P = [],
            R = new Lt;
        let b = null;
        const I = new Oe;
        I.viewport = new he;
        const M = new Oe;
        M.viewport = new he;
        const S = [I, M],
            A = new xh;
        let G = null,
            O = null;
        this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(X) {
            let $ = E[X];
            return $ === void 0 && ($ = new js, E[X] = $), $.getTargetRaySpace()
        }, this.getControllerGrip = function(X) {
            let $ = E[X];
            return $ === void 0 && ($ = new js, E[X] = $), $.getGripSpace()
        }, this.getHand = function(X) {
            let $ = E[X];
            return $ === void 0 && ($ = new js, E[X] = $), $.getHandSpace()
        };

        function N(X) {
            const $ = P.indexOf(X.inputSource);
            if ($ === -1) return;
            const Z = E[$];
            Z !== void 0 && (Z.update(X.inputSource, X.frame, l || a), Z.dispatchEvent({
                type: X.type,
                data: X.inputSource
            }))
        }

        function q() {
            s.removeEventListener("select", N), s.removeEventListener("selectstart", N), s.removeEventListener("selectend", N), s.removeEventListener("squeeze", N), s.removeEventListener("squeezestart", N), s.removeEventListener("squeezeend", N), s.removeEventListener("end", q), s.removeEventListener("inputsourceschange", V);
            for (let X = 0; X < E.length; X++) {
                const $ = P[X];
                $ !== null && (P[X] = null, E[X].disconnect($))
            }
            G = null, O = null, _.reset();
            for (const X in u) delete u[X];
            t.setRenderTarget(w), m = null, p = null, f = null, s = null, T = null, Yt.stop(), n.isPresenting = !1, t.setPixelRatio(b), t.setSize(R.width, R.height, !1), n.dispatchEvent({
                type: "sessionend"
            })
        }
        this.setFramebufferScaleFactor = function(X) {
            r = X, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")
        }, this.setReferenceSpaceType = function(X) {
            o = X, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")
        }, this.getReferenceSpace = function() {
            return l || a
        }, this.setReferenceSpace = function(X) {
            l = X
        }, this.getBaseLayer = function() {
            return p !== null ? p : m
        }, this.getBinding = function() {
            return f
        }, this.getFrame = function() {
            return x
        }, this.getSession = function() {
            return s
        }, this.setSession = async function(X) {
            if (s = X, s !== null) {
                if (w = t.getRenderTarget(), s.addEventListener("select", N), s.addEventListener("selectstart", N), s.addEventListener("selectend", N), s.addEventListener("squeeze", N), s.addEventListener("squeezestart", N), s.addEventListener("squeezeend", N), s.addEventListener("end", q), s.addEventListener("inputsourceschange", V), h.xrCompatible !== !0 && await e.makeXRCompatible(), b = t.getPixelRatio(), t.getSize(R), typeof XRWebGLBinding < "u" && (f = new XRWebGLBinding(s, e)), f !== null && "createProjectionLayer" in XRWebGLBinding.prototype) {
                    let Z = null,
                        ut = null,
                        dt = null;
                    h.depth && (dt = h.stencil ? e.DEPTH24_STENCIL8 : e.DEPTH_COMPONENT24, Z = h.stencil ? Pi : Ci, ut = h.stencil ? Ri : Bn);
                    const wt = {
                        colorFormat: e.RGBA8,
                        depthFormat: dt,
                        scaleFactor: r
                    };
                    p = f.createProjectionLayer(wt), s.updateRenderState({
                        layers: [p]
                    }), t.setPixelRatio(1), t.setSize(p.textureWidth, p.textureHeight, !1), T = new Hn(p.textureWidth, p.textureHeight, {
                        format: Ve,
                        type: Je,
                        depthTexture: new tl(p.textureWidth, p.textureHeight, ut, void 0, void 0, void 0, void 0, void 0, void 0, Z),
                        stencilBuffer: h.stencil,
                        colorSpace: t.outputColorSpace,
                        samples: h.antialias ? 4 : 0,
                        resolveDepthBuffer: p.ignoreDepthValues === !1,
                        resolveStencilBuffer: p.ignoreDepthValues === !1
                    })
                } else {
                    const Z = {
                        antialias: h.antialias,
                        alpha: !0,
                        depth: h.depth,
                        stencil: h.stencil,
                        framebufferScaleFactor: r
                    };
                    m = new XRWebGLLayer(s, e, Z), s.updateRenderState({
                        baseLayer: m
                    }), t.setPixelRatio(1), t.setSize(m.framebufferWidth, m.framebufferHeight, !1), T = new Hn(m.framebufferWidth, m.framebufferHeight, {
                        format: Ve,
                        type: Je,
                        colorSpace: t.outputColorSpace,
                        stencilBuffer: h.stencil,
                        resolveDepthBuffer: m.ignoreDepthValues === !1,
                        resolveStencilBuffer: m.ignoreDepthValues === !1
                    })
                }
                T.isXRRenderTarget = !0, this.setFoveation(c), l = null, a = await s.requestReferenceSpace(o), Yt.setContext(s), Yt.start(), n.isPresenting = !0, n.dispatchEvent({
                    type: "sessionstart"
                })
            }
        }, this.getEnvironmentBlendMode = function() {
            if (s !== null) return s.environmentBlendMode
        }, this.getDepthTexture = function() {
            return _.getDepthTexture()
        };

        function V(X) {
            for (let $ = 0; $ < X.removed.length; $++) {
                const Z = X.removed[$],
                    ut = P.indexOf(Z);
                ut >= 0 && (P[ut] = null, E[ut].disconnect(Z))
            }
            for (let $ = 0; $ < X.added.length; $++) {
                const Z = X.added[$];
                let ut = P.indexOf(Z);
                if (ut === -1) {
                    for (let wt = 0; wt < E.length; wt++)
                        if (wt >= P.length) {
                            P.push(Z), ut = wt;
                            break
                        } else if (P[wt] === null) {
                        P[wt] = Z, ut = wt;
                        break
                    }
                    if (ut === -1) break
                }
                const dt = E[ut];
                dt && dt.connect(Z)
            }
        }
        const K = new F,
            z = new F;

        function st(X, $, Z) {
            K.setFromMatrixPosition($.matrixWorld), z.setFromMatrixPosition(Z.matrixWorld);
            const ut = K.distanceTo(z),
                dt = $.projectionMatrix.elements,
                wt = Z.projectionMatrix.elements,
                jt = dt[14] / (dt[10] - 1),
                Dt = dt[14] / (dt[10] + 1),
                C = (dt[9] + 1) / dt[5],
                qt = (dt[9] - 1) / dt[5],
                bt = (dt[8] - 1) / dt[0],
                Gt = (wt[8] + 1) / wt[0],
                yt = jt * bt,
                ie = jt * Gt,
                _t = ut / (-bt + Gt),
                Bt = _t * -bt;
            if ($.matrixWorld.decompose(X.position, X.quaternion, X.scale), X.translateX(Bt), X.translateZ(_t), X.matrixWorld.compose(X.position, X.quaternion, X.scale), X.matrixWorldInverse.copy(X.matrixWorld).invert(), dt[10] === -1) X.projectionMatrix.copy($.projectionMatrix), X.projectionMatrixInverse.copy($.projectionMatrixInverse);
            else {
                const _e = jt + _t,
                    ue = Dt + _t,
                    y = yt - Bt,
                    g = ie + (ut - Bt),
                    B = C * Dt / ue * _e,
                    Y = qt * Dt / ue * _e;
                X.projectionMatrix.makePerspective(y, g, B, Y, _e, ue), X.projectionMatrixInverse.copy(X.projectionMatrix).invert()
            }
        }

        function tt(X, $) {
            $ === null ? X.matrixWorld.copy(X.matrix) : X.matrixWorld.multiplyMatrices($.matrixWorld, X.matrix), X.matrixWorldInverse.copy(X.matrixWorld).invert()
        }
        this.updateCamera = function(X) {
            if (s === null) return;
            let $ = X.near,
                Z = X.far;
            _.texture !== null && (_.depthNear > 0 && ($ = _.depthNear), _.depthFar > 0 && (Z = _.depthFar)), A.near = M.near = I.near = $, A.far = M.far = I.far = Z, (G !== A.near || O !== A.far) && (s.updateRenderState({
                depthNear: A.near,
                depthFar: A.far
            }), G = A.near, O = A.far), A.layers.mask = X.layers.mask | 6, I.layers.mask = A.layers.mask & 3, M.layers.mask = A.layers.mask & 5;
            const ut = X.parent,
                dt = A.cameras;
            tt(A, ut);
            for (let wt = 0; wt < dt.length; wt++) tt(dt[wt], ut);
            dt.length === 2 ? st(A, I, M) : A.projectionMatrix.copy(I.projectionMatrix), ft(X, A, ut)
        };

        function ft(X, $, Z) {
            Z === null ? X.matrix.copy($.matrixWorld) : (X.matrix.copy(Z.matrixWorld), X.matrix.invert(), X.matrix.multiply($.matrixWorld)), X.matrix.decompose(X.position, X.quaternion, X.scale), X.updateMatrixWorld(!0), X.projectionMatrix.copy($.projectionMatrix), X.projectionMatrixInverse.copy($.projectionMatrixInverse), X.isPerspectiveCamera && (X.fov = Yr * 2 * Math.atan(1 / X.projectionMatrix.elements[5]), X.zoom = 1)
        }
        this.getCamera = function() {
            return A
        }, this.getFoveation = function() {
            if (!(p === null && m === null)) return c
        }, this.setFoveation = function(X) {
            c = X, p !== null && (p.fixedFoveation = X), m !== null && m.fixedFoveation !== void 0 && (m.fixedFoveation = X)
        }, this.hasDepthSensing = function() {
            return _.texture !== null
        }, this.getDepthSensingMesh = function() {
            return _.getMesh(A)
        }, this.getCameraTexture = function(X) {
            return u[X]
        };
        let Ut = null;

        function $t(X, $) {
            if (d = $.getViewerPose(l || a), x = $, d !== null) {
                const Z = d.views;
                m !== null && (t.setRenderTargetFramebuffer(T, m.framebuffer), t.setRenderTarget(T));
                let ut = !1;
                Z.length !== A.cameras.length && (A.cameras.length = 0, ut = !0);
                for (let Dt = 0; Dt < Z.length; Dt++) {
                    const C = Z[Dt];
                    let qt = null;
                    if (m !== null) qt = m.getViewport(C);
                    else {
                        const Gt = f.getViewSubImage(p, C);
                        qt = Gt.viewport, Dt === 0 && (t.setRenderTargetTextures(T, Gt.colorTexture, Gt.depthStencilTexture), t.setRenderTarget(T))
                    }
                    let bt = S[Dt];
                    bt === void 0 && (bt = new Oe, bt.layers.enable(Dt), bt.viewport = new he, S[Dt] = bt), bt.matrix.fromArray(C.transform.matrix), bt.matrix.decompose(bt.position, bt.quaternion, bt.scale), bt.projectionMatrix.fromArray(C.projectionMatrix), bt.projectionMatrixInverse.copy(bt.projectionMatrix).invert(), bt.viewport.set(qt.x, qt.y, qt.width, qt.height), Dt === 0 && (A.matrix.copy(bt.matrix), A.matrix.decompose(A.position, A.quaternion, A.scale)), ut === !0 && A.cameras.push(bt)
                }
                const dt = s.enabledFeatures;
                if (dt && dt.includes("depth-sensing") && s.depthUsage == "gpu-optimized" && f) {
                    const Dt = f.getDepthInformation(Z[0]);
                    Dt && Dt.isValid && Dt.texture && _.init(Dt, s.renderState)
                }
                if (dt && dt.includes("camera-access") && (t.state.unbindTexture(), f))
                    for (let Dt = 0; Dt < Z.length; Dt++) {
                        const C = Z[Dt].camera;
                        if (C) {
                            let qt = u[C];
                            qt || (qt = new ll, u[C] = qt);
                            const bt = f.getCameraImage(C);
                            qt.sourceTexture = bt
                        }
                    }
            }
            for (let Z = 0; Z < E.length; Z++) {
                const ut = P[Z],
                    dt = E[Z];
                ut !== null && dt !== void 0 && dt.update(ut, $, l || a)
            }
            Ut && Ut(X, $), $.detectedPlanes && n.dispatchEvent({
                type: "planesdetected",
                data: $
            }), x = null
        }
        const Yt = new il;
        Yt.setAnimationLoop($t), this.setAnimationLoop = function(X) {
            Ut = X
        }, this.dispose = function() {}
    }
}
const Dn = new Qe,
    em = new le;

function nm(i, t) {
    function e(u, h) {
        u.matrixAutoUpdate === !0 && u.updateMatrix(), h.value.copy(u.matrix)
    }

    function n(u, h) {
        h.color.getRGB(u.fogColor.value, Zo(i)), h.isFog ? (u.fogNear.value = h.near, u.fogFar.value = h.far) : h.isFogExp2 && (u.fogDensity.value = h.density)
    }

    function s(u, h, w, T, E) {
        h.isMeshBasicMaterial || h.isMeshLambertMaterial ? r(u, h) : h.isMeshToonMaterial ? (r(u, h), f(u, h)) : h.isMeshPhongMaterial ? (r(u, h), d(u, h)) : h.isMeshStandardMaterial ? (r(u, h), p(u, h), h.isMeshPhysicalMaterial && m(u, h, E)) : h.isMeshMatcapMaterial ? (r(u, h), x(u, h)) : h.isMeshDepthMaterial ? r(u, h) : h.isMeshDistanceMaterial ? (r(u, h), _(u, h)) : h.isMeshNormalMaterial ? r(u, h) : h.isLineBasicMaterial ? (a(u, h), h.isLineDashedMaterial && o(u, h)) : h.isPointsMaterial ? c(u, h, w, T) : h.isSpriteMaterial ? l(u, h) : h.isShadowMaterial ? (u.color.value.copy(h.color), u.opacity.value = h.opacity) : h.isShaderMaterial && (h.uniformsNeedUpdate = !1)
    }

    function r(u, h) {
        u.opacity.value = h.opacity, h.color && u.diffuse.value.copy(h.color), h.emissive && u.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity), h.map && (u.map.value = h.map, e(h.map, u.mapTransform)), h.alphaMap && (u.alphaMap.value = h.alphaMap, e(h.alphaMap, u.alphaMapTransform)), h.bumpMap && (u.bumpMap.value = h.bumpMap, e(h.bumpMap, u.bumpMapTransform), u.bumpScale.value = h.bumpScale, h.side === we && (u.bumpScale.value *= -1)), h.normalMap && (u.normalMap.value = h.normalMap, e(h.normalMap, u.normalMapTransform), u.normalScale.value.copy(h.normalScale), h.side === we && u.normalScale.value.negate()), h.displacementMap && (u.displacementMap.value = h.displacementMap, e(h.displacementMap, u.displacementMapTransform), u.displacementScale.value = h.displacementScale, u.displacementBias.value = h.displacementBias), h.emissiveMap && (u.emissiveMap.value = h.emissiveMap, e(h.emissiveMap, u.emissiveMapTransform)), h.specularMap && (u.specularMap.value = h.specularMap, e(h.specularMap, u.specularMapTransform)), h.alphaTest > 0 && (u.alphaTest.value = h.alphaTest);
        const w = t.get(h),
            T = w.envMap,
            E = w.envMapRotation;
        T && (u.envMap.value = T, Dn.copy(E), Dn.x *= -1, Dn.y *= -1, Dn.z *= -1, T.isCubeTexture && T.isRenderTargetTexture === !1 && (Dn.y *= -1, Dn.z *= -1), u.envMapRotation.value.setFromMatrix4(em.makeRotationFromEuler(Dn)), u.flipEnvMap.value = T.isCubeTexture && T.isRenderTargetTexture === !1 ? -1 : 1, u.reflectivity.value = h.reflectivity, u.ior.value = h.ior, u.refractionRatio.value = h.refractionRatio), h.lightMap && (u.lightMap.value = h.lightMap, u.lightMapIntensity.value = h.lightMapIntensity, e(h.lightMap, u.lightMapTransform)), h.aoMap && (u.aoMap.value = h.aoMap, u.aoMapIntensity.value = h.aoMapIntensity, e(h.aoMap, u.aoMapTransform))
    }

    function a(u, h) {
        u.diffuse.value.copy(h.color), u.opacity.value = h.opacity, h.map && (u.map.value = h.map, e(h.map, u.mapTransform))
    }

    function o(u, h) {
        u.dashSize.value = h.dashSize, u.totalSize.value = h.dashSize + h.gapSize, u.scale.value = h.scale
    }

    function c(u, h, w, T) {
        u.diffuse.value.copy(h.color), u.opacity.value = h.opacity, u.size.value = h.size * w, u.scale.value = T * .5, h.map && (u.map.value = h.map, e(h.map, u.uvTransform)), h.alphaMap && (u.alphaMap.value = h.alphaMap, e(h.alphaMap, u.alphaMapTransform)), h.alphaTest > 0 && (u.alphaTest.value = h.alphaTest)
    }

    function l(u, h) {
        u.diffuse.value.copy(h.color), u.opacity.value = h.opacity, u.rotation.value = h.rotation, h.map && (u.map.value = h.map, e(h.map, u.mapTransform)), h.alphaMap && (u.alphaMap.value = h.alphaMap, e(h.alphaMap, u.alphaMapTransform)), h.alphaTest > 0 && (u.alphaTest.value = h.alphaTest)
    }

    function d(u, h) {
        u.specular.value.copy(h.specular), u.shininess.value = Math.max(h.shininess, 1e-4)
    }

    function f(u, h) {
        h.gradientMap && (u.gradientMap.value = h.gradientMap)
    }

    function p(u, h) {
        u.metalness.value = h.metalness, h.metalnessMap && (u.metalnessMap.value = h.metalnessMap, e(h.metalnessMap, u.metalnessMapTransform)), u.roughness.value = h.roughness, h.roughnessMap && (u.roughnessMap.value = h.roughnessMap, e(h.roughnessMap, u.roughnessMapTransform)), h.envMap && (u.envMapIntensity.value = h.envMapIntensity)
    }

    function m(u, h, w) {
        u.ior.value = h.ior, h.sheen > 0 && (u.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen), u.sheenRoughness.value = h.sheenRoughness, h.sheenColorMap && (u.sheenColorMap.value = h.sheenColorMap, e(h.sheenColorMap, u.sheenColorMapTransform)), h.sheenRoughnessMap && (u.sheenRoughnessMap.value = h.sheenRoughnessMap, e(h.sheenRoughnessMap, u.sheenRoughnessMapTransform))), h.clearcoat > 0 && (u.clearcoat.value = h.clearcoat, u.clearcoatRoughness.value = h.clearcoatRoughness, h.clearcoatMap && (u.clearcoatMap.value = h.clearcoatMap, e(h.clearcoatMap, u.clearcoatMapTransform)), h.clearcoatRoughnessMap && (u.clearcoatRoughnessMap.value = h.clearcoatRoughnessMap, e(h.clearcoatRoughnessMap, u.clearcoatRoughnessMapTransform)), h.clearcoatNormalMap && (u.clearcoatNormalMap.value = h.clearcoatNormalMap, e(h.clearcoatNormalMap, u.clearcoatNormalMapTransform), u.clearcoatNormalScale.value.copy(h.clearcoatNormalScale), h.side === we && u.clearcoatNormalScale.value.negate())), h.dispersion > 0 && (u.dispersion.value = h.dispersion), h.iridescence > 0 && (u.iridescence.value = h.iridescence, u.iridescenceIOR.value = h.iridescenceIOR, u.iridescenceThicknessMinimum.value = h.iridescenceThicknessRange[0], u.iridescenceThicknessMaximum.value = h.iridescenceThicknessRange[1], h.iridescenceMap && (u.iridescenceMap.value = h.iridescenceMap, e(h.iridescenceMap, u.iridescenceMapTransform)), h.iridescenceThicknessMap && (u.iridescenceThicknessMap.value = h.iridescenceThicknessMap, e(h.iridescenceThicknessMap, u.iridescenceThicknessMapTransform))), h.transmission > 0 && (u.transmission.value = h.transmission, u.transmissionSamplerMap.value = w.texture, u.transmissionSamplerSize.value.set(w.width, w.height), h.transmissionMap && (u.transmissionMap.value = h.transmissionMap, e(h.transmissionMap, u.transmissionMapTransform)), u.thickness.value = h.thickness, h.thicknessMap && (u.thicknessMap.value = h.thicknessMap, e(h.thicknessMap, u.thicknessMapTransform)), u.attenuationDistance.value = h.attenuationDistance, u.attenuationColor.value.copy(h.attenuationColor)), h.anisotropy > 0 && (u.anisotropyVector.value.set(h.anisotropy * Math.cos(h.anisotropyRotation), h.anisotropy * Math.sin(h.anisotropyRotation)), h.anisotropyMap && (u.anisotropyMap.value = h.anisotropyMap, e(h.anisotropyMap, u.anisotropyMapTransform))), u.specularIntensity.value = h.specularIntensity, u.specularColor.value.copy(h.specularColor), h.specularColorMap && (u.specularColorMap.value = h.specularColorMap, e(h.specularColorMap, u.specularColorMapTransform)), h.specularIntensityMap && (u.specularIntensityMap.value = h.specularIntensityMap, e(h.specularIntensityMap, u.specularIntensityMapTransform))
    }

    function x(u, h) {
        h.matcap && (u.matcap.value = h.matcap)
    }

    function _(u, h) {
        const w = t.get(h).light;
        u.referencePosition.value.setFromMatrixPosition(w.matrixWorld), u.nearDistance.value = w.shadow.camera.near, u.farDistance.value = w.shadow.camera.far
    }
    return {
        refreshFogUniforms: n,
        refreshMaterialUniforms: s
    }
}

function im(i, t, e, n) {
    let s = {},
        r = {},
        a = [];
    const o = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);

    function c(w, T) {
        const E = T.program;
        n.uniformBlockBinding(w, E)
    }

    function l(w, T) {
        let E = s[w.id];
        E === void 0 && (x(w), E = d(w), s[w.id] = E, w.addEventListener("dispose", u));
        const P = T.program;
        n.updateUBOMapping(w, P);
        const R = t.render.frame;
        r[w.id] !== R && (p(w), r[w.id] = R)
    }

    function d(w) {
        const T = f();
        w.__bindingPointIndex = T;
        const E = i.createBuffer(),
            P = w.__size,
            R = w.usage;
        return i.bindBuffer(i.UNIFORM_BUFFER, E), i.bufferData(i.UNIFORM_BUFFER, P, R), i.bindBuffer(i.UNIFORM_BUFFER, null), i.bindBufferBase(i.UNIFORM_BUFFER, T, E), E
    }

    function f() {
        for (let w = 0; w < o; w++)
            if (a.indexOf(w) === -1) return a.push(w), w;
        return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0
    }

    function p(w) {
        const T = s[w.id],
            E = w.uniforms,
            P = w.__cache;
        i.bindBuffer(i.UNIFORM_BUFFER, T);
        for (let R = 0, b = E.length; R < b; R++) {
            const I = Array.isArray(E[R]) ? E[R] : [E[R]];
            for (let M = 0, S = I.length; M < S; M++) {
                const A = I[M];
                if (m(A, R, M, P) === !0) {
                    const G = A.__offset,
                        O = Array.isArray(A.value) ? A.value : [A.value];
                    let N = 0;
                    for (let q = 0; q < O.length; q++) {
                        const V = O[q],
                            K = _(V);
                        typeof V == "number" || typeof V == "boolean" ? (A.__data[0] = V, i.bufferSubData(i.UNIFORM_BUFFER, G + N, A.__data)) : V.isMatrix3 ? (A.__data[0] = V.elements[0], A.__data[1] = V.elements[1], A.__data[2] = V.elements[2], A.__data[3] = 0, A.__data[4] = V.elements[3], A.__data[5] = V.elements[4], A.__data[6] = V.elements[5], A.__data[7] = 0, A.__data[8] = V.elements[6], A.__data[9] = V.elements[7], A.__data[10] = V.elements[8], A.__data[11] = 0) : (V.toArray(A.__data, N), N += K.storage / Float32Array.BYTES_PER_ELEMENT)
                    }
                    i.bufferSubData(i.UNIFORM_BUFFER, G, A.__data)
                }
            }
        }
        i.bindBuffer(i.UNIFORM_BUFFER, null)
    }

    function m(w, T, E, P) {
        const R = w.value,
            b = T + "_" + E;
        if (P[b] === void 0) return typeof R == "number" || typeof R == "boolean" ? P[b] = R : P[b] = R.clone(), !0;
        {
            const I = P[b];
            if (typeof R == "number" || typeof R == "boolean") {
                if (I !== R) return P[b] = R, !0
            } else if (I.equals(R) === !1) return I.copy(R), !0
        }
        return !1
    }

    function x(w) {
        const T = w.uniforms;
        let E = 0;
        const P = 16;
        for (let b = 0, I = T.length; b < I; b++) {
            const M = Array.isArray(T[b]) ? T[b] : [T[b]];
            for (let S = 0, A = M.length; S < A; S++) {
                const G = M[S],
                    O = Array.isArray(G.value) ? G.value : [G.value];
                for (let N = 0, q = O.length; N < q; N++) {
                    const V = O[N],
                        K = _(V),
                        z = E % P,
                        st = z % K.boundary,
                        tt = z + st;
                    E += st, tt !== 0 && P - tt < K.storage && (E += P - tt), G.__data = new Float32Array(K.storage / Float32Array.BYTES_PER_ELEMENT), G.__offset = E, E += K.storage
                }
            }
        }
        const R = E % P;
        return R > 0 && (E += P - R), w.__size = E, w.__cache = {}, this
    }

    function _(w) {
        const T = {
            boundary: 0,
            storage: 0
        };
        return typeof w == "number" || typeof w == "boolean" ? (T.boundary = 4, T.storage = 4) : w.isVector2 ? (T.boundary = 8, T.storage = 8) : w.isVector3 || w.isColor ? (T.boundary = 16, T.storage = 12) : w.isVector4 ? (T.boundary = 16, T.storage = 16) : w.isMatrix3 ? (T.boundary = 48, T.storage = 48) : w.isMatrix4 ? (T.boundary = 64, T.storage = 64) : w.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", w), T
    }

    function u(w) {
        const T = w.target;
        T.removeEventListener("dispose", u);
        const E = a.indexOf(T.__bindingPointIndex);
        a.splice(E, 1), i.deleteBuffer(s[T.id]), delete s[T.id], delete r[T.id]
    }

    function h() {
        for (const w in s) i.deleteBuffer(s[w]);
        a = [], s = {}, r = {}
    }
    return {
        bind: c,
        update: l,
        dispose: h
    }
}
class sm {
    constructor(t = {}) {
        const {
            canvas: e = Uc(),
            context: n = null,
            depth: s = !0,
            stencil: r = !1,
            alpha: a = !1,
            antialias: o = !1,
            premultipliedAlpha: c = !0,
            preserveDrawingBuffer: l = !1,
            powerPreference: d = "default",
            failIfMajorPerformanceCaveat: f = !1,
            reversedDepthBuffer: p = !1
        } = t;
        this.isWebGLRenderer = !0;
        let m;
        if (n !== null) {
            if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext) throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
            m = n.getContextAttributes().alpha
        } else m = a;
        const x = new Uint32Array(4),
            _ = new Int32Array(4);
        let u = null,
            h = null;
        const w = [],
            T = [];
        this.domElement = e, this.debug = {
            checkShaderErrors: !0,
            onShaderError: null
        }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.toneMapping = Sn, this.toneMappingExposure = 1, this.transmissionResolutionScale = 1;
        const E = this;
        let P = !1;
        this._outputColorSpace = Ie;
        let R = 0,
            b = 0,
            I = null,
            M = -1,
            S = null;
        const A = new he,
            G = new he;
        let O = null;
        const N = new Ht(0);
        let q = 0,
            V = e.width,
            K = e.height,
            z = 1,
            st = null,
            tt = null;
        const ft = new he(0, 0, V, K),
            Ut = new he(0, 0, V, K);
        let $t = !1;
        const Yt = new la;
        let X = !1,
            $ = !1;
        const Z = new le,
            ut = new F,
            dt = new he,
            wt = {
                background: null,
                fog: null,
                environment: null,
                overrideMaterial: null,
                isScene: !0
            };
        let jt = !1;

        function Dt() {
            return I === null ? z : 1
        }
        let C = n;

        function qt(v, L) {
            return e.getContext(v, L)
        }
        try {
            const v = {
                alpha: !0,
                depth: s,
                stencil: r,
                antialias: o,
                premultipliedAlpha: c,
                preserveDrawingBuffer: l,
                powerPreference: d,
                failIfMajorPerformanceCaveat: f
            };
            if ("setAttribute" in e && e.setAttribute("data-engine", `three.js r${Qr}`), e.addEventListener("webglcontextlost", at, !1), e.addEventListener("webglcontextrestored", mt, !1), e.addEventListener("webglcontextcreationerror", Q, !1), C === null) {
                const L = "webgl2";
                if (C = qt(L, v), C === null) throw qt(L) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.")
            }
        } catch (v) {
            throw console.error("THREE.WebGLRenderer: " + v.message), v
        }
        let bt, Gt, yt, ie, _t, Bt, _e, ue, y, g, B, Y, J, W, Et, rt, vt, Mt, nt, ht, Ct, St, lt, Nt;

        function D() {
            bt = new pf(C), bt.init(), St = new jp(C, bt), Gt = new of(C, bt, t, St), yt = new Kp(C, bt), Gt.reversedDepthBuffer && p && yt.buffers.depth.setReversed(!0), ie = new gf(C), _t = new Np, Bt = new $p(C, bt, yt, _t, Gt, St, ie), _e = new cf(E), ue = new ff(E), y = new Eh(C), lt = new rf(C, y), g = new mf(C, y, ie, lt), B = new vf(C, g, y, ie), nt = new xf(C, Gt, Bt), rt = new lf(_t), Y = new Up(E, _e, ue, bt, Gt, lt, rt), J = new nm(E, _t), W = new Op, Et = new Vp(bt), Mt = new sf(E, _e, ue, yt, B, m, c), vt = new qp(E, B, Gt), Nt = new im(C, ie, Gt, yt), ht = new af(C, bt, ie), Ct = new _f(C, bt, ie), ie.programs = Y.programs, E.capabilities = Gt, E.extensions = bt, E.properties = _t, E.renderLists = W, E.shadowMap = vt, E.state = yt, E.info = ie
        }
        D();
        const it = new tm(E, C);
        this.xr = it, this.getContext = function() {
            return C
        }, this.getContextAttributes = function() {
            return C.getContextAttributes()
        }, this.forceContextLoss = function() {
            const v = bt.get("WEBGL_lose_context");
            v && v.loseContext()
        }, this.forceContextRestore = function() {
            const v = bt.get("WEBGL_lose_context");
            v && v.restoreContext()
        }, this.getPixelRatio = function() {
            return z
        }, this.setPixelRatio = function(v) {
            v !== void 0 && (z = v, this.setSize(V, K, !1))
        }, this.getSize = function(v) {
            return v.set(V, K)
        }, this.setSize = function(v, L, H = !0) {
            if (it.isPresenting) {
                console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
                return
            }
            V = v, K = L, e.width = Math.floor(v * z), e.height = Math.floor(L * z), H === !0 && (e.style.width = v + "px", e.style.height = L + "px"), this.setViewport(0, 0, v, L)
        }, this.getDrawingBufferSize = function(v) {
            return v.set(V * z, K * z).floor()
        }, this.setDrawingBufferSize = function(v, L, H) {
            V = v, K = L, z = H, e.width = Math.floor(v * H), e.height = Math.floor(L * H), this.setViewport(0, 0, v, L)
        }, this.getCurrentViewport = function(v) {
            return v.copy(A)
        }, this.getViewport = function(v) {
            return v.copy(ft)
        }, this.setViewport = function(v, L, H, k) {
            v.isVector4 ? ft.set(v.x, v.y, v.z, v.w) : ft.set(v, L, H, k), yt.viewport(A.copy(ft).multiplyScalar(z).round())
        }, this.getScissor = function(v) {
            return v.copy(Ut)
        }, this.setScissor = function(v, L, H, k) {
            v.isVector4 ? Ut.set(v.x, v.y, v.z, v.w) : Ut.set(v, L, H, k), yt.scissor(G.copy(Ut).multiplyScalar(z).round())
        }, this.getScissorTest = function() {
            return $t
        }, this.setScissorTest = function(v) {
            yt.setScissorTest($t = v)
        }, this.setOpaqueSort = function(v) {
            st = v
        }, this.setTransparentSort = function(v) {
            tt = v
        }, this.getClearColor = function(v) {
            return v.copy(Mt.getClearColor())
        }, this.setClearColor = function() {
            Mt.setClearColor(...arguments)
        }, this.getClearAlpha = function() {
            return Mt.getClearAlpha()
        }, this.setClearAlpha = function() {
            Mt.setClearAlpha(...arguments)
        }, this.clear = function(v = !0, L = !0, H = !0) {
            let k = 0;
            if (v) {
                let U = !1;
                if (I !== null) {
                    const et = I.texture.format;
                    U = et === ra || et === sa || et === ia
                }
                if (U) {
                    const et = I.texture.type,
                        ct = et === Je || et === Bn || et === wi || et === Ri || et === ea || et === na,
                        gt = Mt.getClearColor(),
                        pt = Mt.getClearAlpha(),
                        Rt = gt.r,
                        Pt = gt.g,
                        Tt = gt.b;
                    ct ? (x[0] = Rt, x[1] = Pt, x[2] = Tt, x[3] = pt, C.clearBufferuiv(C.COLOR, 0, x)) : (_[0] = Rt, _[1] = Pt, _[2] = Tt, _[3] = pt, C.clearBufferiv(C.COLOR, 0, _))
                } else k |= C.COLOR_BUFFER_BIT
            }
            L && (k |= C.DEPTH_BUFFER_BIT), H && (k |= C.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), C.clear(k)
        }, this.clearColor = function() {
            this.clear(!0, !1, !1)
        }, this.clearDepth = function() {
            this.clear(!1, !0, !1)
        }, this.clearStencil = function() {
            this.clear(!1, !1, !0)
        }, this.dispose = function() {
            e.removeEventListener("webglcontextlost", at, !1), e.removeEventListener("webglcontextrestored", mt, !1), e.removeEventListener("webglcontextcreationerror", Q, !1), Mt.dispose(), W.dispose(), Et.dispose(), _t.dispose(), _e.dispose(), ue.dispose(), B.dispose(), lt.dispose(), Nt.dispose(), Y.dispose(), it.dispose(), it.removeEventListener("sessionstart", Xe), it.removeEventListener("sessionend", ua), Tn.stop()
        };

        function at(v) {
            v.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), P = !0
        }

        function mt() {
            console.log("THREE.WebGLRenderer: Context Restored."), P = !1;
            const v = ie.autoReset,
                L = vt.enabled,
                H = vt.autoUpdate,
                k = vt.needsUpdate,
                U = vt.type;
            D(), ie.autoReset = v, vt.enabled = L, vt.autoUpdate = H, vt.needsUpdate = k, vt.type = U
        }

        function Q(v) {
            console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", v.statusMessage)
        }

        function j(v) {
            const L = v.target;
            L.removeEventListener("dispose", j), xt(L)
        }

        function xt(v) {
            It(v), _t.remove(v)
        }

        function It(v) {
            const L = _t.get(v).programs;
            L !== void 0 && (L.forEach(function(H) {
                Y.releaseProgram(H)
            }), v.isShaderMaterial && Y.releaseShaderCache(v))
        }
        this.renderBufferDirect = function(v, L, H, k, U, et) {
            L === null && (L = wt);
            const ct = U.isMesh && U.matrixWorld.determinant() < 0,
                gt = ul(v, L, H, k, U);
            yt.setMaterial(k, ct);
            let pt = H.index,
                Rt = 1;
            if (k.wireframe === !0) {
                if (pt = g.getWireframeAttribute(H), pt === void 0) return;
                Rt = 2
            }
            const Pt = H.drawRange,
                Tt = H.attributes.position;
            let kt = Pt.start * Rt,
                Zt = (Pt.start + Pt.count) * Rt;
            et !== null && (kt = Math.max(kt, et.start * Rt), Zt = Math.min(Zt, (et.start + et.count) * Rt)), pt !== null ? (kt = Math.max(kt, 0), Zt = Math.min(Zt, pt.count)) : Tt != null && (kt = Math.max(kt, 0), Zt = Math.min(Zt, Tt.count));
            const ce = Zt - kt;
            if (ce < 0 || ce === 1 / 0) return;
            lt.setup(U, k, gt, H, pt);
            let ne, te = ht;
            if (pt !== null && (ne = y.get(pt), te = Ct, te.setIndex(ne)), U.isMesh) k.wireframe === !0 ? (yt.setLineWidth(k.wireframeLinewidth * Dt()), te.setMode(C.LINES)) : te.setMode(C.TRIANGLES);
            else if (U.isLine) {
                let At = k.linewidth;
                At === void 0 && (At = 1), yt.setLineWidth(At * Dt()), U.isLineSegments ? te.setMode(C.LINES) : U.isLineLoop ? te.setMode(C.LINE_LOOP) : te.setMode(C.LINE_STRIP)
            } else U.isPoints ? te.setMode(C.POINTS) : U.isSprite && te.setMode(C.TRIANGLES);
            if (U.isBatchedMesh)
                if (U._multiDrawInstances !== null) oi("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."), te.renderMultiDrawInstances(U._multiDrawStarts, U._multiDrawCounts, U._multiDrawCount, U._multiDrawInstances);
                else if (bt.get("WEBGL_multi_draw")) te.renderMultiDraw(U._multiDrawStarts, U._multiDrawCounts, U._multiDrawCount);
            else {
                const At = U._multiDrawStarts,
                    ae = U._multiDrawCounts,
                    Wt = U._multiDrawCount,
                    Ce = pt ? y.get(pt).bytesPerElement : 1,
                    Vn = _t.get(k).currentProgram.getUniforms();
                for (let Pe = 0; Pe < Wt; Pe++) Vn.setValue(C, "_gl_DrawID", Pe), te.render(At[Pe] / Ce, ae[Pe])
            } else if (U.isInstancedMesh) te.renderInstances(kt, ce, U.count);
            else if (H.isInstancedBufferGeometry) {
                const At = H._maxInstanceCount !== void 0 ? H._maxInstanceCount : 1 / 0,
                    ae = Math.min(H.instanceCount, At);
                te.renderInstances(kt, ce, ae)
            } else te.render(kt, ce)
        };

        function ee(v, L, H) {
            v.transparent === !0 && v.side === Ye && v.forceSinglePass === !1 ? (v.side = we, v.needsUpdate = !0, Fi(v, L, H), v.side = En, v.needsUpdate = !0, Fi(v, L, H), v.side = Ye) : Fi(v, L, H)
        }
        this.compile = function(v, L, H = null) {
            H === null && (H = v), h = Et.get(H), h.init(L), T.push(h), H.traverseVisible(function(U) {
                U.isLight && U.layers.test(L.layers) && (h.pushLight(U), U.castShadow && h.pushShadow(U))
            }), v !== H && v.traverseVisible(function(U) {
                U.isLight && U.layers.test(L.layers) && (h.pushLight(U), U.castShadow && h.pushShadow(U))
            }), h.setupLights();
            const k = new Set;
            return v.traverse(function(U) {
                if (!(U.isMesh || U.isPoints || U.isLine || U.isSprite)) return;
                const et = U.material;
                if (et)
                    if (Array.isArray(et))
                        for (let ct = 0; ct < et.length; ct++) {
                            const gt = et[ct];
                            ee(gt, H, U), k.add(gt)
                        } else ee(et, H, U), k.add(et)
            }), h = T.pop(), k
        }, this.compileAsync = function(v, L, H = null) {
            const k = this.compile(v, L, H);
            return new Promise(U => {
                function et() {
                    if (k.forEach(function(ct) {
                            _t.get(ct).currentProgram.isReady() && k.delete(ct)
                        }), k.size === 0) {
                        U(v);
                        return
                    }
                    setTimeout(et, 10)
                }
                bt.get("KHR_parallel_shader_compile") !== null ? et() : setTimeout(et, 10)
            })
        };
        let Kt = null;

        function tn(v) {
            Kt && Kt(v)
        }

        function Xe() {
            Tn.stop()
        }

        function ua() {
            Tn.start()
        }
        const Tn = new il;
        Tn.setAnimationLoop(tn), typeof self < "u" && Tn.setContext(self), this.setAnimationLoop = function(v) {
            Kt = v, it.setAnimationLoop(v), v === null ? Tn.stop() : Tn.start()
        }, it.addEventListener("sessionstart", Xe), it.addEventListener("sessionend", ua), this.render = function(v, L) {
            if (L !== void 0 && L.isCamera !== !0) {
                console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
                return
            }
            if (P === !0) return;
            if (v.matrixWorldAutoUpdate === !0 && v.updateMatrixWorld(), L.parent === null && L.matrixWorldAutoUpdate === !0 && L.updateMatrixWorld(), it.enabled === !0 && it.isPresenting === !0 && (it.cameraAutoUpdate === !0 && it.updateCamera(L), L = it.getCamera()), v.isScene === !0 && v.onBeforeRender(E, v, L, I), h = Et.get(v, T.length), h.init(L), T.push(h), Z.multiplyMatrices(L.projectionMatrix, L.matrixWorldInverse), Yt.setFromProjectionMatrix(Z, $e, L.reversedDepth), $ = this.localClippingEnabled, X = rt.init(this.clippingPlanes, $), u = W.get(v, w.length), u.init(), w.push(u), it.enabled === !0 && it.isPresenting === !0) {
                const et = E.xr.getDepthSensingMesh();
                et !== null && As(et, L, -1 / 0, E.sortObjects)
            }
            As(v, L, 0, E.sortObjects), u.finish(), E.sortObjects === !0 && u.sort(st, tt), jt = it.enabled === !1 || it.isPresenting === !1 || it.hasDepthSensing() === !1, jt && Mt.addToRenderList(u, v), this.info.render.frame++, X === !0 && rt.beginShadows();
            const H = h.state.shadowsArray;
            vt.render(H, v, L), X === !0 && rt.endShadows(), this.info.autoReset === !0 && this.info.reset();
            const k = u.opaque,
                U = u.transmissive;
            if (h.setupLights(), L.isArrayCamera) {
                const et = L.cameras;
                if (U.length > 0)
                    for (let ct = 0, gt = et.length; ct < gt; ct++) {
                        const pt = et[ct];
                        fa(k, U, v, pt)
                    }
                jt && Mt.render(v);
                for (let ct = 0, gt = et.length; ct < gt; ct++) {
                    const pt = et[ct];
                    da(u, v, pt, pt.viewport)
                }
            } else U.length > 0 && fa(k, U, v, L), jt && Mt.render(v), da(u, v, L);
            I !== null && b === 0 && (Bt.updateMultisampleRenderTarget(I), Bt.updateRenderTargetMipmap(I)), v.isScene === !0 && v.onAfterRender(E, v, L), lt.resetDefaultState(), M = -1, S = null, T.pop(), T.length > 0 ? (h = T[T.length - 1], X === !0 && rt.setGlobalState(E.clippingPlanes, h.state.camera)) : h = null, w.pop(), w.length > 0 ? u = w[w.length - 1] : u = null
        };

        function As(v, L, H, k) {
            if (v.visible === !1) return;
            if (v.layers.test(L.layers)) {
                if (v.isGroup) H = v.renderOrder;
                else if (v.isLOD) v.autoUpdate === !0 && v.update(L);
                else if (v.isLight) h.pushLight(v), v.castShadow && h.pushShadow(v);
                else if (v.isSprite) {
                    if (!v.frustumCulled || Yt.intersectsSprite(v)) {
                        k && dt.setFromMatrixPosition(v.matrixWorld).applyMatrix4(Z);
                        const ct = B.update(v),
                            gt = v.material;
                        gt.visible && u.push(v, ct, gt, H, dt.z, null)
                    }
                } else if ((v.isMesh || v.isLine || v.isPoints) && (!v.frustumCulled || Yt.intersectsObject(v))) {
                    const ct = B.update(v),
                        gt = v.material;
                    if (k && (v.boundingSphere !== void 0 ? (v.boundingSphere === null && v.computeBoundingSphere(), dt.copy(v.boundingSphere.center)) : (ct.boundingSphere === null && ct.computeBoundingSphere(), dt.copy(ct.boundingSphere.center)), dt.applyMatrix4(v.matrixWorld).applyMatrix4(Z)), Array.isArray(gt)) {
                        const pt = ct.groups;
                        for (let Rt = 0, Pt = pt.length; Rt < Pt; Rt++) {
                            const Tt = pt[Rt],
                                kt = gt[Tt.materialIndex];
                            kt && kt.visible && u.push(v, ct, kt, H, dt.z, Tt)
                        }
                    } else gt.visible && u.push(v, ct, gt, H, dt.z, null)
                }
            }
            const et = v.children;
            for (let ct = 0, gt = et.length; ct < gt; ct++) As(et[ct], L, H, k)
        }

        function da(v, L, H, k) {
            const U = v.opaque,
                et = v.transmissive,
                ct = v.transparent;
            h.setupLightsView(H), X === !0 && rt.setGlobalState(E.clippingPlanes, H), k && yt.viewport(A.copy(k)), U.length > 0 && Ni(U, L, H), et.length > 0 && Ni(et, L, H), ct.length > 0 && Ni(ct, L, H), yt.buffers.depth.setTest(!0), yt.buffers.depth.setMask(!0), yt.buffers.color.setMask(!0), yt.setPolygonOffset(!1)
        }

        function fa(v, L, H, k) {
            if ((H.isScene === !0 ? H.overrideMaterial : null) !== null) return;
            h.state.transmissionRenderTarget[k.id] === void 0 && (h.state.transmissionRenderTarget[k.id] = new Hn(1, 1, {
                generateMipmaps: !0,
                type: bt.has("EXT_color_buffer_half_float") || bt.has("EXT_color_buffer_float") ? Di : Je,
                minFilter: On,
                samples: 4,
                stencilBuffer: r,
                resolveDepthBuffer: !1,
                resolveStencilBuffer: !1,
                colorSpace: Xt.workingColorSpace
            }));
            const et = h.state.transmissionRenderTarget[k.id],
                ct = k.viewport || A;
            et.setSize(ct.z * E.transmissionResolutionScale, ct.w * E.transmissionResolutionScale);
            const gt = E.getRenderTarget(),
                pt = E.getActiveCubeFace(),
                Rt = E.getActiveMipmapLevel();
            E.setRenderTarget(et), E.getClearColor(N), q = E.getClearAlpha(), q < 1 && E.setClearColor(16777215, .5), E.clear(), jt && Mt.render(H);
            const Pt = E.toneMapping;
            E.toneMapping = Sn;
            const Tt = k.viewport;
            if (k.viewport !== void 0 && (k.viewport = void 0), h.setupLightsView(k), X === !0 && rt.setGlobalState(E.clippingPlanes, k), Ni(v, H, k), Bt.updateMultisampleRenderTarget(et), Bt.updateRenderTargetMipmap(et), bt.has("WEBGL_multisampled_render_to_texture") === !1) {
                let kt = !1;
                for (let Zt = 0, ce = L.length; Zt < ce; Zt++) {
                    const ne = L[Zt],
                        te = ne.object,
                        At = ne.geometry,
                        ae = ne.material,
                        Wt = ne.group;
                    if (ae.side === Ye && te.layers.test(k.layers)) {
                        const Ce = ae.side;
                        ae.side = we, ae.needsUpdate = !0, pa(te, H, k, At, ae, Wt), ae.side = Ce, ae.needsUpdate = !0, kt = !0
                    }
                }
                kt === !0 && (Bt.updateMultisampleRenderTarget(et), Bt.updateRenderTargetMipmap(et))
            }
            E.setRenderTarget(gt, pt, Rt), E.setClearColor(N, q), Tt !== void 0 && (k.viewport = Tt), E.toneMapping = Pt
        }

        function Ni(v, L, H) {
            const k = L.isScene === !0 ? L.overrideMaterial : null;
            for (let U = 0, et = v.length; U < et; U++) {
                const ct = v[U],
                    gt = ct.object,
                    pt = ct.geometry,
                    Rt = ct.group;
                let Pt = ct.material;
                Pt.allowOverride === !0 && k !== null && (Pt = k), gt.layers.test(H.layers) && pa(gt, L, H, pt, Pt, Rt)
            }
        }

        function pa(v, L, H, k, U, et) {
            v.onBeforeRender(E, L, H, k, U, et), v.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse, v.matrixWorld), v.normalMatrix.getNormalMatrix(v.modelViewMatrix), U.onBeforeRender(E, L, H, k, v, et), U.transparent === !0 && U.side === Ye && U.forceSinglePass === !1 ? (U.side = we, U.needsUpdate = !0, E.renderBufferDirect(H, L, k, U, v, et), U.side = En, U.needsUpdate = !0, E.renderBufferDirect(H, L, k, U, v, et), U.side = Ye) : E.renderBufferDirect(H, L, k, U, v, et), v.onAfterRender(E, L, H, k, U, et)
        }

        function Fi(v, L, H) {
            L.isScene !== !0 && (L = wt);
            const k = _t.get(v),
                U = h.state.lights,
                et = h.state.shadowsArray,
                ct = U.state.version,
                gt = Y.getParameters(v, U.state, et, L, H),
                pt = Y.getProgramCacheKey(gt);
            let Rt = k.programs;
            k.environment = v.isMeshStandardMaterial ? L.environment : null, k.fog = L.fog, k.envMap = (v.isMeshStandardMaterial ? ue : _e).get(v.envMap || k.environment), k.envMapRotation = k.environment !== null && v.envMap === null ? L.environmentRotation : v.envMapRotation, Rt === void 0 && (v.addEventListener("dispose", j), Rt = new Map, k.programs = Rt);
            let Pt = Rt.get(pt);
            if (Pt !== void 0) {
                if (k.currentProgram === Pt && k.lightsStateVersion === ct) return _a(v, gt), Pt
            } else gt.uniforms = Y.getUniforms(v), v.onBeforeCompile(gt, E), Pt = Y.acquireProgram(gt, pt), Rt.set(pt, Pt), k.uniforms = gt.uniforms;
            const Tt = k.uniforms;
            return (!v.isShaderMaterial && !v.isRawShaderMaterial || v.clipping === !0) && (Tt.clippingPlanes = rt.uniform), _a(v, gt), k.needsLights = fl(v), k.lightsStateVersion = ct, k.needsLights && (Tt.ambientLightColor.value = U.state.ambient, Tt.lightProbe.value = U.state.probe, Tt.directionalLights.value = U.state.directional, Tt.directionalLightShadows.value = U.state.directionalShadow, Tt.spotLights.value = U.state.spot, Tt.spotLightShadows.value = U.state.spotShadow, Tt.rectAreaLights.value = U.state.rectArea, Tt.ltc_1.value = U.state.rectAreaLTC1, Tt.ltc_2.value = U.state.rectAreaLTC2, Tt.pointLights.value = U.state.point, Tt.pointLightShadows.value = U.state.pointShadow, Tt.hemisphereLights.value = U.state.hemi, Tt.directionalShadowMap.value = U.state.directionalShadowMap, Tt.directionalShadowMatrix.value = U.state.directionalShadowMatrix, Tt.spotShadowMap.value = U.state.spotShadowMap, Tt.spotLightMatrix.value = U.state.spotLightMatrix, Tt.spotLightMap.value = U.state.spotLightMap, Tt.pointShadowMap.value = U.state.pointShadowMap, Tt.pointShadowMatrix.value = U.state.pointShadowMatrix), k.currentProgram = Pt, k.uniformsList = null, Pt
        }

        function ma(v) {
            if (v.uniformsList === null) {
                const L = v.currentProgram.getUniforms();
                v.uniformsList = _s.seqWithValue(L.seq, v.uniforms)
            }
            return v.uniformsList
        }

        function _a(v, L) {
            const H = _t.get(v);
            H.outputColorSpace = L.outputColorSpace, H.batching = L.batching, H.batchingColor = L.batchingColor, H.instancing = L.instancing, H.instancingColor = L.instancingColor, H.instancingMorph = L.instancingMorph, H.skinning = L.skinning, H.morphTargets = L.morphTargets, H.morphNormals = L.morphNormals, H.morphColors = L.morphColors, H.morphTargetsCount = L.morphTargetsCount, H.numClippingPlanes = L.numClippingPlanes, H.numIntersection = L.numClipIntersection, H.vertexAlphas = L.vertexAlphas, H.vertexTangents = L.vertexTangents, H.toneMapping = L.toneMapping
        }

        function ul(v, L, H, k, U) {
            L.isScene !== !0 && (L = wt), Bt.resetTextureUnits();
            const et = L.fog,
                ct = k.isMeshStandardMaterial ? L.environment : null,
                gt = I === null ? E.outputColorSpace : I.isXRRenderTarget === !0 ? I.texture.colorSpace : di,
                pt = (k.isMeshStandardMaterial ? ue : _e).get(k.envMap || ct),
                Rt = k.vertexColors === !0 && !!H.attributes.color && H.attributes.color.itemSize === 4,
                Pt = !!H.attributes.tangent && (!!k.normalMap || k.anisotropy > 0),
                Tt = !!H.morphAttributes.position,
                kt = !!H.morphAttributes.normal,
                Zt = !!H.morphAttributes.color;
            let ce = Sn;
            k.toneMapped && (I === null || I.isXRRenderTarget === !0) && (ce = E.toneMapping);
            const ne = H.morphAttributes.position || H.morphAttributes.normal || H.morphAttributes.color,
                te = ne !== void 0 ? ne.length : 0,
                At = _t.get(k),
                ae = h.state.lights;
            if (X === !0 && ($ === !0 || v !== S)) {
                const Se = v === S && k.id === M;
                rt.setState(k, v, Se)
            }
            let Wt = !1;
            k.version === At.__version ? (At.needsLights && At.lightsStateVersion !== ae.state.version || At.outputColorSpace !== gt || U.isBatchedMesh && At.batching === !1 || !U.isBatchedMesh && At.batching === !0 || U.isBatchedMesh && At.batchingColor === !0 && U.colorTexture === null || U.isBatchedMesh && At.batchingColor === !1 && U.colorTexture !== null || U.isInstancedMesh && At.instancing === !1 || !U.isInstancedMesh && At.instancing === !0 || U.isSkinnedMesh && At.skinning === !1 || !U.isSkinnedMesh && At.skinning === !0 || U.isInstancedMesh && At.instancingColor === !0 && U.instanceColor === null || U.isInstancedMesh && At.instancingColor === !1 && U.instanceColor !== null || U.isInstancedMesh && At.instancingMorph === !0 && U.morphTexture === null || U.isInstancedMesh && At.instancingMorph === !1 && U.morphTexture !== null || At.envMap !== pt || k.fog === !0 && At.fog !== et || At.numClippingPlanes !== void 0 && (At.numClippingPlanes !== rt.numPlanes || At.numIntersection !== rt.numIntersection) || At.vertexAlphas !== Rt || At.vertexTangents !== Pt || At.morphTargets !== Tt || At.morphNormals !== kt || At.morphColors !== Zt || At.toneMapping !== ce || At.morphTargetsCount !== te) && (Wt = !0) : (Wt = !0, At.__version = k.version);
            let Ce = At.currentProgram;
            Wt === !0 && (Ce = Fi(k, L, U));
            let Vn = !1,
                Pe = !1,
                _i = !1;
            const oe = Ce.getUniforms(),
                Ue = At.uniforms;
            if (yt.useProgram(Ce.program) && (Vn = !0, Pe = !0, _i = !0), k.id !== M && (M = k.id, Pe = !0), Vn || S !== v) {
                yt.buffers.depth.getReversed() && v.reversedDepth !== !0 && (v._reversedDepth = !0, v.updateProjectionMatrix()), oe.setValue(C, "projectionMatrix", v.projectionMatrix), oe.setValue(C, "viewMatrix", v.matrixWorldInverse);
                const Te = oe.map.cameraPosition;
                Te !== void 0 && Te.setValue(C, ut.setFromMatrixPosition(v.matrixWorld)), Gt.logarithmicDepthBuffer && oe.setValue(C, "logDepthBufFC", 2 / (Math.log(v.far + 1) / Math.LN2)), (k.isMeshPhongMaterial || k.isMeshToonMaterial || k.isMeshLambertMaterial || k.isMeshBasicMaterial || k.isMeshStandardMaterial || k.isShaderMaterial) && oe.setValue(C, "isOrthographic", v.isOrthographicCamera === !0), S !== v && (S = v, Pe = !0, _i = !0)
            }
            if (U.isSkinnedMesh) {
                oe.setOptional(C, U, "bindMatrix"), oe.setOptional(C, U, "bindMatrixInverse");
                const Se = U.skeleton;
                Se && (Se.boneTexture === null && Se.computeBoneTexture(), oe.setValue(C, "boneTexture", Se.boneTexture, Bt))
            }
            U.isBatchedMesh && (oe.setOptional(C, U, "batchingTexture"), oe.setValue(C, "batchingTexture", U._matricesTexture, Bt), oe.setOptional(C, U, "batchingIdTexture"), oe.setValue(C, "batchingIdTexture", U._indirectTexture, Bt), oe.setOptional(C, U, "batchingColorTexture"), U._colorsTexture !== null && oe.setValue(C, "batchingColorTexture", U._colorsTexture, Bt));
            const Ne = H.morphAttributes;
            if ((Ne.position !== void 0 || Ne.normal !== void 0 || Ne.color !== void 0) && nt.update(U, H, Ce), (Pe || At.receiveShadow !== U.receiveShadow) && (At.receiveShadow = U.receiveShadow, oe.setValue(C, "receiveShadow", U.receiveShadow)), k.isMeshGouraudMaterial && k.envMap !== null && (Ue.envMap.value = pt, Ue.flipEnvMap.value = pt.isCubeTexture && pt.isRenderTargetTexture === !1 ? -1 : 1), k.isMeshStandardMaterial && k.envMap === null && L.environment !== null && (Ue.envMapIntensity.value = L.environmentIntensity), Pe && (oe.setValue(C, "toneMappingExposure", E.toneMappingExposure), At.needsLights && dl(Ue, _i), et && k.fog === !0 && J.refreshFogUniforms(Ue, et), J.refreshMaterialUniforms(Ue, k, z, K, h.state.transmissionRenderTarget[v.id]), _s.upload(C, ma(At), Ue, Bt)), k.isShaderMaterial && k.uniformsNeedUpdate === !0 && (_s.upload(C, ma(At), Ue, Bt), k.uniformsNeedUpdate = !1), k.isSpriteMaterial && oe.setValue(C, "center", U.center), oe.setValue(C, "modelViewMatrix", U.modelViewMatrix), oe.setValue(C, "normalMatrix", U.normalMatrix), oe.setValue(C, "modelMatrix", U.matrixWorld), k.isShaderMaterial || k.isRawShaderMaterial) {
                const Se = k.uniformsGroups;
                for (let Te = 0, ws = Se.length; Te < ws; Te++) {
                    const bn = Se[Te];
                    Nt.update(bn, Ce), Nt.bind(bn, Ce)
                }
            }
            return Ce
        }

        function dl(v, L) {
            v.ambientLightColor.needsUpdate = L, v.lightProbe.needsUpdate = L, v.directionalLights.needsUpdate = L, v.directionalLightShadows.needsUpdate = L, v.pointLights.needsUpdate = L, v.pointLightShadows.needsUpdate = L, v.spotLights.needsUpdate = L, v.spotLightShadows.needsUpdate = L, v.rectAreaLights.needsUpdate = L, v.hemisphereLights.needsUpdate = L
        }

        function fl(v) {
            return v.isMeshLambertMaterial || v.isMeshToonMaterial || v.isMeshPhongMaterial || v.isMeshStandardMaterial || v.isShadowMaterial || v.isShaderMaterial && v.lights === !0
        }
        this.getActiveCubeFace = function() {
            return R
        }, this.getActiveMipmapLevel = function() {
            return b
        }, this.getRenderTarget = function() {
            return I
        }, this.setRenderTargetTextures = function(v, L, H) {
            const k = _t.get(v);
            k.__autoAllocateDepthBuffer = v.resolveDepthBuffer === !1, k.__autoAllocateDepthBuffer === !1 && (k.__useRenderToTexture = !1), _t.get(v.texture).__webglTexture = L, _t.get(v.depthTexture).__webglTexture = k.__autoAllocateDepthBuffer ? void 0 : H, k.__hasExternalTextures = !0
        }, this.setRenderTargetFramebuffer = function(v, L) {
            const H = _t.get(v);
            H.__webglFramebuffer = L, H.__useDefaultFramebuffer = L === void 0
        };
        const pl = C.createFramebuffer();
        this.setRenderTarget = function(v, L = 0, H = 0) {
            I = v, R = L, b = H;
            let k = !0,
                U = null,
                et = !1,
                ct = !1;
            if (v) {
                const pt = _t.get(v);
                if (pt.__useDefaultFramebuffer !== void 0) yt.bindFramebuffer(C.FRAMEBUFFER, null), k = !1;
                else if (pt.__webglFramebuffer === void 0) Bt.setupRenderTarget(v);
                else if (pt.__hasExternalTextures) Bt.rebindTextures(v, _t.get(v.texture).__webglTexture, _t.get(v.depthTexture).__webglTexture);
                else if (v.depthBuffer) {
                    const Tt = v.depthTexture;
                    if (pt.__boundDepthTexture !== Tt) {
                        if (Tt !== null && _t.has(Tt) && (v.width !== Tt.image.width || v.height !== Tt.image.height)) throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
                        Bt.setupDepthRenderbuffer(v)
                    }
                }
                const Rt = v.texture;
                (Rt.isData3DTexture || Rt.isDataArrayTexture || Rt.isCompressedArrayTexture) && (ct = !0);
                const Pt = _t.get(v).__webglFramebuffer;
                v.isWebGLCubeRenderTarget ? (Array.isArray(Pt[L]) ? U = Pt[L][H] : U = Pt[L], et = !0) : v.samples > 0 && Bt.useMultisampledRTT(v) === !1 ? U = _t.get(v).__webglMultisampledFramebuffer : Array.isArray(Pt) ? U = Pt[H] : U = Pt, A.copy(v.viewport), G.copy(v.scissor), O = v.scissorTest
            } else A.copy(ft).multiplyScalar(z).floor(), G.copy(Ut).multiplyScalar(z).floor(), O = $t;
            if (H !== 0 && (U = pl), yt.bindFramebuffer(C.FRAMEBUFFER, U) && k && yt.drawBuffers(v, U), yt.viewport(A), yt.scissor(G), yt.setScissorTest(O), et) {
                const pt = _t.get(v.texture);
                C.framebufferTexture2D(C.FRAMEBUFFER, C.COLOR_ATTACHMENT0, C.TEXTURE_CUBE_MAP_POSITIVE_X + L, pt.__webglTexture, H)
            } else if (ct) {
                const pt = L;
                for (let Rt = 0; Rt < v.textures.length; Rt++) {
                    const Pt = _t.get(v.textures[Rt]);
                    C.framebufferTextureLayer(C.FRAMEBUFFER, C.COLOR_ATTACHMENT0 + Rt, Pt.__webglTexture, H, pt)
                }
            } else if (v !== null && H !== 0) {
                const pt = _t.get(v.texture);
                C.framebufferTexture2D(C.FRAMEBUFFER, C.COLOR_ATTACHMENT0, C.TEXTURE_2D, pt.__webglTexture, H)
            }
            M = -1
        }, this.readRenderTargetPixels = function(v, L, H, k, U, et, ct, gt = 0) {
            if (!(v && v.isWebGLRenderTarget)) {
                console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
                return
            }
            let pt = _t.get(v).__webglFramebuffer;
            if (v.isWebGLCubeRenderTarget && ct !== void 0 && (pt = pt[ct]), pt) {
                yt.bindFramebuffer(C.FRAMEBUFFER, pt);
                try {
                    const Rt = v.textures[gt],
                        Pt = Rt.format,
                        Tt = Rt.type;
                    if (!Gt.textureFormatReadable(Pt)) {
                        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
                        return
                    }
                    if (!Gt.textureTypeReadable(Tt)) {
                        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
                        return
                    }
                    L >= 0 && L <= v.width - k && H >= 0 && H <= v.height - U && (v.textures.length > 1 && C.readBuffer(C.COLOR_ATTACHMENT0 + gt), C.readPixels(L, H, k, U, St.convert(Pt), St.convert(Tt), et))
                } finally {
                    const Rt = I !== null ? _t.get(I).__webglFramebuffer : null;
                    yt.bindFramebuffer(C.FRAMEBUFFER, Rt)
                }
            }
        }, this.readRenderTargetPixelsAsync = async function(v, L, H, k, U, et, ct, gt = 0) {
            if (!(v && v.isWebGLRenderTarget)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
            let pt = _t.get(v).__webglFramebuffer;
            if (v.isWebGLCubeRenderTarget && ct !== void 0 && (pt = pt[ct]), pt)
                if (L >= 0 && L <= v.width - k && H >= 0 && H <= v.height - U) {
                    yt.bindFramebuffer(C.FRAMEBUFFER, pt);
                    const Rt = v.textures[gt],
                        Pt = Rt.format,
                        Tt = Rt.type;
                    if (!Gt.textureFormatReadable(Pt)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
                    if (!Gt.textureTypeReadable(Tt)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
                    const kt = C.createBuffer();
                    C.bindBuffer(C.PIXEL_PACK_BUFFER, kt), C.bufferData(C.PIXEL_PACK_BUFFER, et.byteLength, C.STREAM_READ), v.textures.length > 1 && C.readBuffer(C.COLOR_ATTACHMENT0 + gt), C.readPixels(L, H, k, U, St.convert(Pt), St.convert(Tt), 0);
                    const Zt = I !== null ? _t.get(I).__webglFramebuffer : null;
                    yt.bindFramebuffer(C.FRAMEBUFFER, Zt);
                    const ce = C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE, 0);
                    return C.flush(), await Nc(C, ce, 4), C.bindBuffer(C.PIXEL_PACK_BUFFER, kt), C.getBufferSubData(C.PIXEL_PACK_BUFFER, 0, et), C.deleteBuffer(kt), C.deleteSync(ce), et
                } else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")
        }, this.copyFramebufferToTexture = function(v, L = null, H = 0) {
            const k = Math.pow(2, -H),
                U = Math.floor(v.image.width * k),
                et = Math.floor(v.image.height * k),
                ct = L !== null ? L.x : 0,
                gt = L !== null ? L.y : 0;
            Bt.setTexture2D(v, 0), C.copyTexSubImage2D(C.TEXTURE_2D, H, 0, 0, ct, gt, U, et), yt.unbindTexture()
        };
        const ml = C.createFramebuffer(),
            _l = C.createFramebuffer();
        this.copyTextureToTexture = function(v, L, H = null, k = null, U = 0, et = null) {
            et === null && (U !== 0 ? (oi("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."), et = U, U = 0) : et = 0);
            let ct, gt, pt, Rt, Pt, Tt, kt, Zt, ce;
            const ne = v.isCompressedTexture ? v.mipmaps[et] : v.image;
            if (H !== null) ct = H.max.x - H.min.x, gt = H.max.y - H.min.y, pt = H.isBox3 ? H.max.z - H.min.z : 1, Rt = H.min.x, Pt = H.min.y, Tt = H.isBox3 ? H.min.z : 0;
            else {
                const Ne = Math.pow(2, -U);
                ct = Math.floor(ne.width * Ne), gt = Math.floor(ne.height * Ne), v.isDataArrayTexture ? pt = ne.depth : v.isData3DTexture ? pt = Math.floor(ne.depth * Ne) : pt = 1, Rt = 0, Pt = 0, Tt = 0
            }
            k !== null ? (kt = k.x, Zt = k.y, ce = k.z) : (kt = 0, Zt = 0, ce = 0);
            const te = St.convert(L.format),
                At = St.convert(L.type);
            let ae;
            L.isData3DTexture ? (Bt.setTexture3D(L, 0), ae = C.TEXTURE_3D) : L.isDataArrayTexture || L.isCompressedArrayTexture ? (Bt.setTexture2DArray(L, 0), ae = C.TEXTURE_2D_ARRAY) : (Bt.setTexture2D(L, 0), ae = C.TEXTURE_2D), C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL, L.flipY), C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL, L.premultiplyAlpha), C.pixelStorei(C.UNPACK_ALIGNMENT, L.unpackAlignment);
            const Wt = C.getParameter(C.UNPACK_ROW_LENGTH),
                Ce = C.getParameter(C.UNPACK_IMAGE_HEIGHT),
                Vn = C.getParameter(C.UNPACK_SKIP_PIXELS),
                Pe = C.getParameter(C.UNPACK_SKIP_ROWS),
                _i = C.getParameter(C.UNPACK_SKIP_IMAGES);
            C.pixelStorei(C.UNPACK_ROW_LENGTH, ne.width), C.pixelStorei(C.UNPACK_IMAGE_HEIGHT, ne.height), C.pixelStorei(C.UNPACK_SKIP_PIXELS, Rt), C.pixelStorei(C.UNPACK_SKIP_ROWS, Pt), C.pixelStorei(C.UNPACK_SKIP_IMAGES, Tt);
            const oe = v.isDataArrayTexture || v.isData3DTexture,
                Ue = L.isDataArrayTexture || L.isData3DTexture;
            if (v.isDepthTexture) {
                const Ne = _t.get(v),
                    Se = _t.get(L),
                    Te = _t.get(Ne.__renderTarget),
                    ws = _t.get(Se.__renderTarget);
                yt.bindFramebuffer(C.READ_FRAMEBUFFER, Te.__webglFramebuffer), yt.bindFramebuffer(C.DRAW_FRAMEBUFFER, ws.__webglFramebuffer);
                for (let bn = 0; bn < pt; bn++) oe && (C.framebufferTextureLayer(C.READ_FRAMEBUFFER, C.COLOR_ATTACHMENT0, _t.get(v).__webglTexture, U, Tt + bn), C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER, C.COLOR_ATTACHMENT0, _t.get(L).__webglTexture, et, ce + bn)), C.blitFramebuffer(Rt, Pt, ct, gt, kt, Zt, ct, gt, C.DEPTH_BUFFER_BIT, C.NEAREST);
                yt.bindFramebuffer(C.READ_FRAMEBUFFER, null), yt.bindFramebuffer(C.DRAW_FRAMEBUFFER, null)
            } else if (U !== 0 || v.isRenderTargetTexture || _t.has(v)) {
                const Ne = _t.get(v),
                    Se = _t.get(L);
                yt.bindFramebuffer(C.READ_FRAMEBUFFER, ml), yt.bindFramebuffer(C.DRAW_FRAMEBUFFER, _l);
                for (let Te = 0; Te < pt; Te++) oe ? C.framebufferTextureLayer(C.READ_FRAMEBUFFER, C.COLOR_ATTACHMENT0, Ne.__webglTexture, U, Tt + Te) : C.framebufferTexture2D(C.READ_FRAMEBUFFER, C.COLOR_ATTACHMENT0, C.TEXTURE_2D, Ne.__webglTexture, U), Ue ? C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER, C.COLOR_ATTACHMENT0, Se.__webglTexture, et, ce + Te) : C.framebufferTexture2D(C.DRAW_FRAMEBUFFER, C.COLOR_ATTACHMENT0, C.TEXTURE_2D, Se.__webglTexture, et), U !== 0 ? C.blitFramebuffer(Rt, Pt, ct, gt, kt, Zt, ct, gt, C.COLOR_BUFFER_BIT, C.NEAREST) : Ue ? C.copyTexSubImage3D(ae, et, kt, Zt, ce + Te, Rt, Pt, ct, gt) : C.copyTexSubImage2D(ae, et, kt, Zt, Rt, Pt, ct, gt);
                yt.bindFramebuffer(C.READ_FRAMEBUFFER, null), yt.bindFramebuffer(C.DRAW_FRAMEBUFFER, null)
            } else Ue ? v.isDataTexture || v.isData3DTexture ? C.texSubImage3D(ae, et, kt, Zt, ce, ct, gt, pt, te, At, ne.data) : L.isCompressedArrayTexture ? C.compressedTexSubImage3D(ae, et, kt, Zt, ce, ct, gt, pt, te, ne.data) : C.texSubImage3D(ae, et, kt, Zt, ce, ct, gt, pt, te, At, ne) : v.isDataTexture ? C.texSubImage2D(C.TEXTURE_2D, et, kt, Zt, ct, gt, te, At, ne.data) : v.isCompressedTexture ? C.compressedTexSubImage2D(C.TEXTURE_2D, et, kt, Zt, ne.width, ne.height, te, ne.data) : C.texSubImage2D(C.TEXTURE_2D, et, kt, Zt, ct, gt, te, At, ne);
            C.pixelStorei(C.UNPACK_ROW_LENGTH, Wt), C.pixelStorei(C.UNPACK_IMAGE_HEIGHT, Ce), C.pixelStorei(C.UNPACK_SKIP_PIXELS, Vn), C.pixelStorei(C.UNPACK_SKIP_ROWS, Pe), C.pixelStorei(C.UNPACK_SKIP_IMAGES, _i), et === 0 && L.generateMipmaps && C.generateMipmap(ae), yt.unbindTexture()
        }, this.copyTextureToTexture3D = function(v, L, H = null, k = null, U = 0) {
            return oi('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'), this.copyTextureToTexture(v, L, H, k, U)
        }, this.initRenderTarget = function(v) {
            _t.get(v).__webglFramebuffer === void 0 && Bt.setupRenderTarget(v)
        }, this.initTexture = function(v) {
            v.isCubeTexture ? Bt.setTextureCube(v, 0) : v.isData3DTexture ? Bt.setTexture3D(v, 0) : v.isDataArrayTexture || v.isCompressedArrayTexture ? Bt.setTexture2DArray(v, 0) : Bt.setTexture2D(v, 0), yt.unbindTexture()
        }, this.resetState = function() {
            R = 0, b = 0, I = null, yt.reset(), lt.reset()
        }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
            detail: this
        }))
    }
    get coordinateSystem() {
        return $e
    }
    get outputColorSpace() {
        return this._outputColorSpace
    }
    set outputColorSpace(t) {
        this._outputColorSpace = t;
        const e = this.getContext();
        e.drawingBufferColorSpace = Xt._getDrawingBufferColorSpace(t), e.unpackColorSpace = Xt._getUnpackColorSpace()
    }
}
const wo = {
        type: "change"
    },
    ha = {
        type: "start"
    },
    cl = {
        type: "end"
    },
    cs = new Ts,
    Ro = new xn,
    rm = Math.cos(70 * Ic.DEG2RAD),
    fe = new F,
    Ae = 2 * Math.PI,
    Qt = {
        NONE: -1,
        ROTATE: 0,
        DOLLY: 1,
        PAN: 2,
        TOUCH_ROTATE: 3,
        TOUCH_PAN: 4,
        TOUCH_DOLLY_PAN: 5,
        TOUCH_DOLLY_ROTATE: 6
    },
    or = 1e-6;
class am extends Mh {
    constructor(t, e = null) {
        super(t, e), this.state = Qt.NONE, this.target = new F, this.cursor = new F, this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = .05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = {
            LEFT: "ArrowLeft",
            UP: "ArrowUp",
            RIGHT: "ArrowRight",
            BOTTOM: "ArrowDown"
        }, this.mouseButtons = {
            LEFT: cn.ROTATE,
            MIDDLE: cn.DOLLY,
            RIGHT: cn.PAN
        }, this.touches = {
            ONE: si.ROTATE,
            TWO: si.DOLLY_PAN
        }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new F, this._lastQuaternion = new zn, this._lastTargetPosition = new F, this._quat = new zn().setFromUnitVectors(t.up, new F(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new to, this._sphericalDelta = new to, this._scale = 1, this._panOffset = new F, this._rotateStart = new Lt, this._rotateEnd = new Lt, this._rotateDelta = new Lt, this._panStart = new Lt, this._panEnd = new Lt, this._panDelta = new Lt, this._dollyStart = new Lt, this._dollyEnd = new Lt, this._dollyDelta = new Lt, this._dollyDirection = new F, this._mouse = new Lt, this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = lm.bind(this), this._onPointerDown = om.bind(this), this._onPointerUp = cm.bind(this), this._onContextMenu = _m.bind(this), this._onMouseWheel = dm.bind(this), this._onKeyDown = fm.bind(this), this._onTouchStart = pm.bind(this), this._onTouchMove = mm.bind(this), this._onMouseDown = hm.bind(this), this._onMouseMove = um.bind(this), this._interceptControlDown = gm.bind(this), this._interceptControlUp = xm.bind(this), this.domElement !== null && this.connect(this.domElement), this.update()
    }
    connect(t) {
        super.connect(t), this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointercancel", this._onPointerUp), this.domElement.addEventListener("contextmenu", this._onContextMenu), this.domElement.addEventListener("wheel", this._onMouseWheel, {
            passive: !1
        }), this.domElement.getRootNode().addEventListener("keydown", this._interceptControlDown, {
            passive: !0,
            capture: !0
        }), this.domElement.style.touchAction = "none"
    }
    disconnect() {
        this.domElement.removeEventListener("pointerdown", this._onPointerDown), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.domElement.removeEventListener("pointercancel", this._onPointerUp), this.domElement.removeEventListener("wheel", this._onMouseWheel), this.domElement.removeEventListener("contextmenu", this._onContextMenu), this.stopListenToKeyEvents(), this.domElement.getRootNode().removeEventListener("keydown", this._interceptControlDown, {
            capture: !0
        }), this.domElement.style.touchAction = "auto"
    }
    dispose() {
        this.disconnect()
    }
    getPolarAngle() {
        return this._spherical.phi
    }
    getAzimuthalAngle() {
        return this._spherical.theta
    }
    getDistance() {
        return this.object.position.distanceTo(this.target)
    }
    listenToKeyEvents(t) {
        t.addEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = t
    }
    stopListenToKeyEvents() {
        this._domElementKeyEvents !== null && (this._domElementKeyEvents.removeEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = null)
    }
    saveState() {
        this.target0.copy(this.target), this.position0.copy(this.object.position), this.zoom0 = this.object.zoom
    }
    reset() {
        this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(wo), this.update(), this.state = Qt.NONE
    }
    update(t = null) {
        const e = this.object.position;
        fe.copy(e).sub(this.target), fe.applyQuaternion(this._quat), this._spherical.setFromVector3(fe), this.autoRotate && this.state === Qt.NONE && this._rotateLeft(this._getAutoRotationAngle(t)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
        let n = this.minAzimuthAngle,
            s = this.maxAzimuthAngle;
        isFinite(n) && isFinite(s) && (n < -Math.PI ? n += Ae : n > Math.PI && (n -= Ae), s < -Math.PI ? s += Ae : s > Math.PI && (s -= Ae), n <= s ? this._spherical.theta = Math.max(n, Math.min(s, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + s) / 2 ? Math.max(n, this._spherical.theta) : Math.min(s, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
        let r = !1;
        if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) this._spherical.radius = this._clampDistance(this._spherical.radius);
        else {
            const a = this._spherical.radius;
            this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), r = a != this._spherical.radius
        }
        if (fe.setFromSpherical(this._spherical), fe.applyQuaternion(this._quatInverse), e.copy(this.target).add(fe), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
            let a = null;
            if (this.object.isPerspectiveCamera) {
                const o = fe.length();
                a = this._clampDistance(o * this._scale);
                const c = o - a;
                this.object.position.addScaledVector(this._dollyDirection, c), this.object.updateMatrixWorld(), r = !!c
            } else if (this.object.isOrthographicCamera) {
                const o = new F(this._mouse.x, this._mouse.y, 0);
                o.unproject(this.object);
                const c = this.object.zoom;
                this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), r = c !== this.object.zoom;
                const l = new F(this._mouse.x, this._mouse.y, 0);
                l.unproject(this.object), this.object.position.sub(l).add(o), this.object.updateMatrixWorld(), a = fe.length()
            } else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
            a !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position) : (cs.origin.copy(this.object.position), cs.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(cs.direction)) < rm ? this.object.lookAt(this.target) : (Ro.setFromNormalAndCoplanarPoint(this.object.up, this.target), cs.intersectPlane(Ro, this.target))))
        } else if (this.object.isOrthographicCamera) {
            const a = this.object.zoom;
            this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), a !== this.object.zoom && (this.object.updateProjectionMatrix(), r = !0)
        }
        return this._scale = 1, this._performCursorZoom = !1, r || this._lastPosition.distanceToSquared(this.object.position) > or || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > or || this._lastTargetPosition.distanceToSquared(this.target) > or ? (this.dispatchEvent(wo), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1
    }
    _getAutoRotationAngle(t) {
        return t !== null ? Ae / 60 * this.autoRotateSpeed * t : Ae / 60 / 60 * this.autoRotateSpeed
    }
    _getZoomScale(t) {
        const e = Math.abs(t * .01);
        return Math.pow(.95, this.zoomSpeed * e)
    }
    _rotateLeft(t) {
        this._sphericalDelta.theta -= t
    }
    _rotateUp(t) {
        this._sphericalDelta.phi -= t
    }
    _panLeft(t, e) {
        fe.setFromMatrixColumn(e, 0), fe.multiplyScalar(-t), this._panOffset.add(fe)
    }
    _panUp(t, e) {
        this.screenSpacePanning === !0 ? fe.setFromMatrixColumn(e, 1) : (fe.setFromMatrixColumn(e, 0), fe.crossVectors(this.object.up, fe)), fe.multiplyScalar(t), this._panOffset.add(fe)
    }
    _pan(t, e) {
        const n = this.domElement;
        if (this.object.isPerspectiveCamera) {
            const s = this.object.position;
            fe.copy(s).sub(this.target);
            let r = fe.length();
            r *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * t * r / n.clientHeight, this.object.matrix), this._panUp(2 * e * r / n.clientHeight, this.object.matrix)
        } else this.object.isOrthographicCamera ? (this._panLeft(t * (this.object.right - this.object.left) / this.object.zoom / n.clientWidth, this.object.matrix), this._panUp(e * (this.object.top - this.object.bottom) / this.object.zoom / n.clientHeight, this.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), this.enablePan = !1)
    }
    _dollyOut(t) {
        this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale /= t : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1)
    }
    _dollyIn(t) {
        this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale *= t : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1)
    }
    _updateZoomParameters(t, e) {
        if (!this.zoomToCursor) return;
        this._performCursorZoom = !0;
        const n = this.domElement.getBoundingClientRect(),
            s = t - n.left,
            r = e - n.top,
            a = n.width,
            o = n.height;
        this._mouse.x = s / a * 2 - 1, this._mouse.y = -(r / o) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize()
    }
    _clampDistance(t) {
        return Math.max(this.minDistance, Math.min(this.maxDistance, t))
    }
    _handleMouseDownRotate(t) {
        this._rotateStart.set(t.clientX, t.clientY)
    }
    _handleMouseDownDolly(t) {
        this._updateZoomParameters(t.clientX, t.clientX), this._dollyStart.set(t.clientX, t.clientY)
    }
    _handleMouseDownPan(t) {
        this._panStart.set(t.clientX, t.clientY)
    }
    _handleMouseMoveRotate(t) {
        this._rotateEnd.set(t.clientX, t.clientY), this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
        const e = this.domElement;
        this._rotateLeft(Ae * this._rotateDelta.x / e.clientHeight), this._rotateUp(Ae * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update()
    }
    _handleMouseMoveDolly(t) {
        this._dollyEnd.set(t.clientX, t.clientY), this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart), this._dollyDelta.y > 0 ? this._dollyOut(this._getZoomScale(this._dollyDelta.y)) : this._dollyDelta.y < 0 && this._dollyIn(this._getZoomScale(this._dollyDelta.y)), this._dollyStart.copy(this._dollyEnd), this.update()
    }
    _handleMouseMovePan(t) {
        this._panEnd.set(t.clientX, t.clientY), this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd), this.update()
    }
    _handleMouseWheel(t) {
        this._updateZoomParameters(t.clientX, t.clientY), t.deltaY < 0 ? this._dollyIn(this._getZoomScale(t.deltaY)) : t.deltaY > 0 && this._dollyOut(this._getZoomScale(t.deltaY)), this.update()
    }
    _handleKeyDown(t) {
        let e = !1;
        switch (t.code) {
            case this.keys.UP:
                t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateUp(Ae * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), e = !0;
                break;
            case this.keys.BOTTOM:
                t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateUp(-Ae * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), e = !0;
                break;
            case this.keys.LEFT:
                t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateLeft(Ae * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), e = !0;
                break;
            case this.keys.RIGHT:
                t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateLeft(-Ae * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), e = !0;
                break
        }
        e && (t.preventDefault(), this.update())
    }
    _handleTouchStartRotate(t) {
        if (this._pointers.length === 1) this._rotateStart.set(t.pageX, t.pageY);
        else {
            const e = this._getSecondPointerPosition(t),
                n = .5 * (t.pageX + e.x),
                s = .5 * (t.pageY + e.y);
            this._rotateStart.set(n, s)
        }
    }
    _handleTouchStartPan(t) {
        if (this._pointers.length === 1) this._panStart.set(t.pageX, t.pageY);
        else {
            const e = this._getSecondPointerPosition(t),
                n = .5 * (t.pageX + e.x),
                s = .5 * (t.pageY + e.y);
            this._panStart.set(n, s)
        }
    }
    _handleTouchStartDolly(t) {
        const e = this._getSecondPointerPosition(t),
            n = t.pageX - e.x,
            s = t.pageY - e.y,
            r = Math.sqrt(n * n + s * s);
        this._dollyStart.set(0, r)
    }
    _handleTouchStartDollyPan(t) {
        this.enableZoom && this._handleTouchStartDolly(t), this.enablePan && this._handleTouchStartPan(t)
    }
    _handleTouchStartDollyRotate(t) {
        this.enableZoom && this._handleTouchStartDolly(t), this.enableRotate && this._handleTouchStartRotate(t)
    }
    _handleTouchMoveRotate(t) {
        if (this._pointers.length == 1) this._rotateEnd.set(t.pageX, t.pageY);
        else {
            const n = this._getSecondPointerPosition(t),
                s = .5 * (t.pageX + n.x),
                r = .5 * (t.pageY + n.y);
            this._rotateEnd.set(s, r)
        }
        this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
        const e = this.domElement;
        this._rotateLeft(Ae * this._rotateDelta.x / e.clientHeight), this._rotateUp(Ae * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd)
    }
    _handleTouchMovePan(t) {
        if (this._pointers.length === 1) this._panEnd.set(t.pageX, t.pageY);
        else {
            const e = this._getSecondPointerPosition(t),
                n = .5 * (t.pageX + e.x),
                s = .5 * (t.pageY + e.y);
            this._panEnd.set(n, s)
        }
        this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd)
    }
    _handleTouchMoveDolly(t) {
        const e = this._getSecondPointerPosition(t),
            n = t.pageX - e.x,
            s = t.pageY - e.y,
            r = Math.sqrt(n * n + s * s);
        this._dollyEnd.set(0, r), this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed)), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd);
        const a = (t.pageX + e.x) * .5,
            o = (t.pageY + e.y) * .5;
        this._updateZoomParameters(a, o)
    }
    _handleTouchMoveDollyPan(t) {
        this.enableZoom && this._handleTouchMoveDolly(t), this.enablePan && this._handleTouchMovePan(t)
    }
    _handleTouchMoveDollyRotate(t) {
        this.enableZoom && this._handleTouchMoveDolly(t), this.enableRotate && this._handleTouchMoveRotate(t)
    }
    _addPointer(t) {
        this._pointers.push(t.pointerId)
    }
    _removePointer(t) {
        delete this._pointerPositions[t.pointerId];
        for (let e = 0; e < this._pointers.length; e++)
            if (this._pointers[e] == t.pointerId) {
                this._pointers.splice(e, 1);
                return
            }
    }
    _isTrackingPointer(t) {
        for (let e = 0; e < this._pointers.length; e++)
            if (this._pointers[e] == t.pointerId) return !0;
        return !1
    }
    _trackPointer(t) {
        let e = this._pointerPositions[t.pointerId];
        e === void 0 && (e = new Lt, this._pointerPositions[t.pointerId] = e), e.set(t.pageX, t.pageY)
    }
    _getSecondPointerPosition(t) {
        const e = t.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
        return this._pointerPositions[e]
    }
    _customWheelEvent(t) {
        const e = t.deltaMode,
            n = {
                clientX: t.clientX,
                clientY: t.clientY,
                deltaY: t.deltaY
            };
        switch (e) {
            case 1:
                n.deltaY *= 16;
                break;
            case 2:
                n.deltaY *= 100;
                break
        }
        return t.ctrlKey && !this._controlActive && (n.deltaY *= 10), n
    }
}

function om(i) {
    this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(i.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(i) && (this._addPointer(i), i.pointerType === "touch" ? this._onTouchStart(i) : this._onMouseDown(i)))
}

function lm(i) {
    this.enabled !== !1 && (i.pointerType === "touch" ? this._onTouchMove(i) : this._onMouseMove(i))
}

function cm(i) {
    switch (this._removePointer(i), this._pointers.length) {
        case 0:
            this.domElement.releasePointerCapture(i.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(cl), this.state = Qt.NONE;
            break;
        case 1:
            const t = this._pointers[0],
                e = this._pointerPositions[t];
            this._onTouchStart({
                pointerId: t,
                pageX: e.x,
                pageY: e.y
            });
            break
    }
}

function hm(i) {
    let t;
    switch (i.button) {
        case 0:
            t = this.mouseButtons.LEFT;
            break;
        case 1:
            t = this.mouseButtons.MIDDLE;
            break;
        case 2:
            t = this.mouseButtons.RIGHT;
            break;
        default:
            t = -1
    }
    switch (t) {
        case cn.DOLLY:
            if (this.enableZoom === !1) return;
            this._handleMouseDownDolly(i), this.state = Qt.DOLLY;
            break;
        case cn.ROTATE:
            if (i.ctrlKey || i.metaKey || i.shiftKey) {
                if (this.enablePan === !1) return;
                this._handleMouseDownPan(i), this.state = Qt.PAN
            } else {
                if (this.enableRotate === !1) return;
                this._handleMouseDownRotate(i), this.state = Qt.ROTATE
            }
            break;
        case cn.PAN:
            if (i.ctrlKey || i.metaKey || i.shiftKey) {
                if (this.enableRotate === !1) return;
                this._handleMouseDownRotate(i), this.state = Qt.ROTATE
            } else {
                if (this.enablePan === !1) return;
                this._handleMouseDownPan(i), this.state = Qt.PAN
            }
            break;
        default:
            this.state = Qt.NONE
    }
    this.state !== Qt.NONE && this.dispatchEvent(ha)
}

function um(i) {
    switch (this.state) {
        case Qt.ROTATE:
            if (this.enableRotate === !1) return;
            this._handleMouseMoveRotate(i);
            break;
        case Qt.DOLLY:
            if (this.enableZoom === !1) return;
            this._handleMouseMoveDolly(i);
            break;
        case Qt.PAN:
            if (this.enablePan === !1) return;
            this._handleMouseMovePan(i);
            break
    }
}

function dm(i) {
    this.enabled === !1 || this.enableZoom === !1 || this.state !== Qt.NONE || (i.preventDefault(), this.dispatchEvent(ha), this._handleMouseWheel(this._customWheelEvent(i)), this.dispatchEvent(cl))
}

function fm(i) {
    this.enabled !== !1 && this._handleKeyDown(i)
}

function pm(i) {
    switch (this._trackPointer(i), this._pointers.length) {
        case 1:
            switch (this.touches.ONE) {
                case si.ROTATE:
                    if (this.enableRotate === !1) return;
                    this._handleTouchStartRotate(i), this.state = Qt.TOUCH_ROTATE;
                    break;
                case si.PAN:
                    if (this.enablePan === !1) return;
                    this._handleTouchStartPan(i), this.state = Qt.TOUCH_PAN;
                    break;
                default:
                    this.state = Qt.NONE
            }
            break;
        case 2:
            switch (this.touches.TWO) {
                case si.DOLLY_PAN:
                    if (this.enableZoom === !1 && this.enablePan === !1) return;
                    this._handleTouchStartDollyPan(i), this.state = Qt.TOUCH_DOLLY_PAN;
                    break;
                case si.DOLLY_ROTATE:
                    if (this.enableZoom === !1 && this.enableRotate === !1) return;
                    this._handleTouchStartDollyRotate(i), this.state = Qt.TOUCH_DOLLY_ROTATE;
                    break;
                default:
                    this.state = Qt.NONE
            }
            break;
        default:
            this.state = Qt.NONE
    }
    this.state !== Qt.NONE && this.dispatchEvent(ha)
}

function mm(i) {
    switch (this._trackPointer(i), this.state) {
        case Qt.TOUCH_ROTATE:
            if (this.enableRotate === !1) return;
            this._handleTouchMoveRotate(i), this.update();
            break;
        case Qt.TOUCH_PAN:
            if (this.enablePan === !1) return;
            this._handleTouchMovePan(i), this.update();
            break;
        case Qt.TOUCH_DOLLY_PAN:
            if (this.enableZoom === !1 && this.enablePan === !1) return;
            this._handleTouchMoveDollyPan(i), this.update();
            break;
        case Qt.TOUCH_DOLLY_ROTATE:
            if (this.enableZoom === !1 && this.enableRotate === !1) return;
            this._handleTouchMoveDollyRotate(i), this.update();
            break;
        default:
            this.state = Qt.NONE
    }
}

function _m(i) {
    this.enabled !== !1 && i.preventDefault()
}

function gm(i) {
    i.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, {
        passive: !0,
        capture: !0
    }))
}

function xm(i) {
    i.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, {
        passive: !0,
        capture: !0
    }))
}
const Ee = .001,
    vm = 600;

function Co(i) {
    const t = i.dimensionsMm,
        e = i.originMm;
    return `<strong>${i.sku}</strong><br>${i.loadSequence?`装载顺序：第 ${i.loadSequence} 箱<br>`:""}实际尺寸：${t.length} × ${t.width} × ${t.height} mm<br>坐标：(${e.x}, ${e.y}, ${e.z}) mm<br>朝向：${i.orientation}`
}

function selectSceneItemsForRendering(i, t, e) {
    if (i.length <= e) return [...i];
    const n = Array.from({
            length: Math.max(1, t)
        }, () => []),
        s = [];
    for (const a of i) {
        const o = Number.isInteger(a.containerIndex) && a.containerIndex >= 0 && a.containerIndex < n.length ? a.containerIndex : 0;
        n[o].push(a)
    }
    let r = 0,
        a = !0;
    for (; s.length < e && a;) {
        a = !1;
        for (const o of n) {
            if (r >= o.length || s.length >= e) continue;
            s.push(o[r]), a = !0
        }
        r += 1
    }
    return s
}
class Mm {
    constructor(t) {
        this.host = t, this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)), this.renderer.outputColorSpace = Ie, this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = Lo, this.renderer.domElement.className = "cargo-canvas", this.host.append(this.renderer.domElement), this.tooltip = document.createElement("div"), this.tooltip.className = "cargo-tooltip hidden", this.selection = document.createElement("div"), this.selection.className = "cargo-selection hidden", this.host.append(this.tooltip, this.selection), this.scene.background = new Ht(16054266), this.scene.add(this.content), this.scene.add(new ph(16777215, 7042432, 2.2));
        const e = new gh(16777215, 3.2);
        e.position.set(7, 12, 9), e.castShadow = !0, e.shadow.mapSize.set(2048, 2048), this.scene.add(e), this.controls = new am(this.camera, this.renderer.domElement), this.controls.enableDamping = !0, this.controls.dampingFactor = .08, this.controls.screenSpacePanning = !0, this.controls.minDistance = 1, this.controls.maxDistance = 80, this.controls.mouseButtons = {
            LEFT: cn.ROTATE,
            MIDDLE: cn.DOLLY,
            RIGHT: cn.PAN
        }, this.renderer.domElement.addEventListener("pointermove", this.onPointerMove), this.renderer.domElement.addEventListener("pointerleave", this.onPointerLeave), this.renderer.domElement.addEventListener("click", this.onClick), this.renderer.domElement.addEventListener("contextmenu", n => n.preventDefault()), this.observer = new ResizeObserver(() => this.resize()), this.observer.observe(this.host), this.resize(), this.setView("3d"), this.animate()
    }
    host;
    scene = new ah;
    camera = new Oe(42, 1, .01, 200);
    renderer = new sm({
        antialias: !0,
        alpha: !0
    });
    controls;
    raycaster = new vh;
    pointer = new Lt;
    content = new yi;
    interactive = [];
    tooltip;
    selection;
    observer;
    selected = null;
    hovered = null;
    container = {
        l: 12032,
        w: 2352,
        h: 2698
    };
    containerCount = 1;
    frameHandle = 0;
    setData(t) {
        this.clearContent(), this.container = t.container, this.containerCount = Math.max(1, t.containerCount);
        const e = t.sceneItems ?? t.plan.placements.map((a, o) => Fl(a, t.products[a.pi] ?? {
                sku: "未知 SKU",
                color: "#8794a1"
            }, o)),
            n = t.sceneItems ? [] : t.plan.pallets.map(Bl),
            s = selectSceneItemsForRendering(e, this.containerCount, vm),
            r = [...n, ...s];
        for (let a = 0; a < this.containerCount; a += 1) this.addContainer(a);
        for (const a of r) this.addItem(a);
        return this.addGround(), this.setView("3d"), {
            rendered: s.length,
            total: e.length,
            limited: s.length < e.length,
            renderedByContainer: Array.from({ length: this.containerCount }, (_, a) => s.filter(o => o.containerIndex === a).length)
        }
    }
    setView(t) {
        const e = this.container.l * Ee,
            n = this.container.w * Ee,
            s = this.container.h * Ee,
            r = this.containerCount * n + Math.max(0, this.containerCount - 1) * .8,
            a = new F(e / 2, s / 2, r / 2 - n / 2);
        this.controls.target.copy(a), t === "top" ? this.camera.position.set(a.x, Math.max(e, r) * 1.25, a.z + .001) : t === "side" ? this.camera.position.set(a.x, a.y, a.z + Math.max(e, s) * 1.15) : this.camera.position.set(e * .72, Math.max(s * 2.4, 6), r + Math.max(n * 2.3, 5)), this.camera.near = .01, this.camera.far = 200, this.camera.updateProjectionMatrix(), this.controls.update()
    }
    addContainer(t) {
        const e = this.container.l * Ee,
            n = this.container.w * Ee,
            s = this.container.h * Ee,
            r = this.containerOffset(t),
            a = new kn(e, s, n),
            o = new ze(a, new uh({
                color: 9286349,
                transparent: !0,
                opacity: .075,
                roughness: .75,
                side: Ye,
                depthWrite: !1
            }));
        o.position.set(e / 2, s / 2, r + n / 2), this.content.add(o);
        const c = new Ka(new $a(a), new Kr({
            color: 4285565
        }));
        c.position.copy(o.position), this.content.add(c)
    }
    addItem(t) {
        const e = t.dimensionsMm,
            n = new kn(e.length * Ee, e.height * Ee, e.width * Ee),
            s = new ms({
                color: t.color,
                roughness: t.kind === "pallet" ? .9 : .62,
                metalness: .02
            }),
            r = new ze(n, s);
        r.position.set(t.centerMm.x * Ee, t.centerMm.z * Ee, this.containerOffset(t.containerIndex) + t.centerMm.y * Ee), r.castShadow = !0, r.receiveShadow = !0, r.userData.sceneItem = t, this.content.add(r), this.interactive.push(r);
        const a = new Ka(new $a(n), new Kr({
            color: t.kind === "pallet" ? 6374182 : 2504776,
            transparent: !0,
            opacity: .72
        }));
        a.position.copy(r.position), this.content.add(a)
    }
    addGround() {
        const t = this.container.l * Ee,
            e = this.container.w * Ee,
            n = this.containerCount * e + Math.max(0, this.containerCount - 1) * .8,
            s = new ze(new Ui(t + 2, n + 2), new ms({
                color: 14476264,
                roughness: 1
            }));
        s.rotation.x = -Math.PI / 2, s.position.set(t / 2, -.015, n / 2 - e / 2), s.receiveShadow = !0, this.content.add(s)
    }
    containerOffset(t) {
        return t * (this.container.w * Ee + .8)
    }
    pick(t) {
        const e = this.renderer.domElement.getBoundingClientRect();
        return this.pointer.set((t.clientX - e.left) / e.width * 2 - 1, -((t.clientY - e.top) / e.height) * 2 + 1), this.raycaster.setFromCamera(this.pointer, this.camera), this.raycaster.intersectObjects(this.interactive, !1)[0]?.object ?? null
    }
    onPointerMove = t => {
        const e = this.pick(t);
        if (e !== this.hovered && (this.setEmissive(this.hovered, 0), this.hovered = e, e !== this.selected && this.setEmissive(e, 2438727)), !e) {
            this.tooltip.classList.add("hidden");
            return
        }
        this.tooltip.innerHTML = Co(e.userData.sceneItem), this.tooltip.style.left = `${t.offsetX+14}px`, this.tooltip.style.top = `${t.offsetY+14}px`, this.tooltip.classList.remove("hidden")
    };
    onPointerLeave = () => {
        this.hovered !== this.selected && this.setEmissive(this.hovered, 0), this.hovered = null, this.tooltip.classList.add("hidden")
    };
    onClick = t => {
        if (this.selected && this.setEmissive(this.selected, 0), this.selected = this.pick(t), !this.selected) {
            this.selection.classList.add("hidden");
            return
        }
        this.setEmissive(this.selected, 6245655), this.selection.innerHTML = `<span>已选中</span>${Co(this.selected.userData.sceneItem)}`, this.selection.classList.remove("hidden")
    };
    setEmissive(t, e) {
        const n = t?.material;
        n instanceof ms && n.emissive.setHex(e)
    }
    clearContent() {
        this.selected = null, this.hovered = null, this.selection.classList.add("hidden"), this.tooltip.classList.add("hidden"), this.interactive.length = 0;
        for (const t of [...this.content.children]) {
            this.content.remove(t);
            const e = t;
            e.geometry?.dispose(), (Array.isArray(e.material) ? e.material : [e.material]).forEach(s => s?.dispose())
        }
    }
    resize() {
        const t = Math.max(1, this.host.clientWidth),
            e = Math.max(1, this.host.clientHeight);
        this.renderer.setSize(t, e, !1), this.camera.aspect = t / e, this.camera.updateProjectionMatrix()
    }
    animate = () => {
        this.frameHandle = requestAnimationFrame(this.animate), this.controls.update(), this.renderer.render(this.scene, this.camera)
    };
    dispose() {
        cancelAnimationFrame(this.frameHandle), this.observer.disconnect(), this.controls.dispose(), this.clearContent(), this.renderer.dispose()
    }
}
const hl = document.querySelector("#scene");
if (!hl) throw new Error("缺少 #scene 三维视图容器");
const Zr = new Mm(hl);
window.cargoViewer = {
    render: i => Zr.setData(i),
    setView: i => Zr.setView(i)
};
window.cargoSolver = {
    solve: Xl
};
document.querySelectorAll("[data-view]").forEach(i => {
    i.addEventListener("click", () => {
        document.querySelectorAll("[data-view]").forEach(t => t.classList.remove("active")), i.classList.add("active"), Zr.setView(i.dataset.view)
    })
});
