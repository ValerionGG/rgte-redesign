// Mini-runtime autonome pour les artboards .dc.html (format du canvas Design) : gabarit {{trous}}, <sc-for>, <sc-if>, événements, état — rendu par Preact.
(function () {
  var P = window.preact, h = P.h, Fragment = P.Fragment;
  var VOID = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, source: 1, track: 1, wbr: 1 };
  var RAW = { style: 1, script: 1, textarea: 1, title: 1 };
  var ta = document.createElement('textarea');
  function dec(s) { if (s.indexOf('&') < 0) return s; ta.innerHTML = s; return ta.value; }

  var TAG = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s=\/>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g;
  var ATTR = /([^\s=\/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

  function parse(src) {
    var root = { tag: '#root', attrs: [], kids: [] }, stack = [root], last = 0, m;
    function top() { return stack[stack.length - 1]; }
    function text(s) { if (s) top().kids.push({ text: dec(s) }); }
    TAG.lastIndex = 0;
    while ((m = TAG.exec(src))) {
      text(src.slice(last, m.index));
      last = TAG.lastIndex;
      if (m[0].charAt(1) === '!') continue;
      if (m[1]) {
        var t = m[1].toLowerCase();
        for (var k = stack.length - 1; k > 0; k--) if (stack[k].tag.toLowerCase() === t) { stack.length = k; break; }
        continue;
      }
      var attrs = [], a; ATTR.lastIndex = 0;
      while ((a = ATTR.exec(m[3]))) attrs.push([a[1], a[2] != null ? dec(a[2]) : a[3] != null ? dec(a[3]) : a[4] != null ? dec(a[4]) : true]);
      var node = { tag: m[2], attrs: attrs, kids: [] }, lt = m[2].toLowerCase();
      top().kids.push(node);
      if (RAW[lt]) {
        var end = src.toLowerCase().indexOf('</' + lt, last);
        if (end < 0) end = src.length;
        node.kids.push({ text: src.slice(last, end), raw: true });
        last = TAG.lastIndex = Math.max(src.indexOf('>', end) + 1, end);
        continue;
      }
      if (!m[4] && !VOID[lt]) stack.push(node);
    }
    text(src.slice(last));
    return root;
  }

  var HOLE = /\{\{\s*([^}]*?)\s*\}\}/g, ONE = /^\{\{\s*([^}]*?)\s*\}\}$/;
  function look(e, sc) {
    if (e === 'true') return true; if (e === 'false') return false; if (e === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(e)) return +e;
    if (/^(['"]).*\1$/.test(e)) return e.slice(1, -1);
    var v = sc, ps = e.split('.');
    for (var i = 0; i < ps.length; i++) { if (v == null) return undefined; v = v[ps[i]]; }
    return v;
  }
  function str(v) { return v == null || v === false ? '' : String(v); }
  function interp(s, sc) {
    if (typeof s !== 'string' || s.indexOf('{{') < 0) return s;
    var one = ONE.exec(s);
    if (one) return look(one[1], sc);
    return s.replace(HOLE, function (_, e) { return str(look(e, sc)); });
  }
  function child(sc, o) { var c = Object.create(sc); for (var k in o) c[k] = o[k]; return c; }
  function attr(n, name) { for (var i = 0; i < n.attrs.length; i++) if (n.attrs[i][0] === name) return n.attrs[i][1]; }

  function kids(list, sc, out) {
    for (var i = 0; i < list.length; i++) build(list[i], sc, out);
    return out;
  }
  function build(n, sc, out) {
    if (n.text != null) { out.push(n.raw ? n.text : str(interp(n.text, sc))); return; }
    var lt = n.tag.toLowerCase();
    if (lt === 'helmet') return;
    if (lt === 'sc-for') {
      var xs = interp(attr(n, 'list'), sc) || [], as = attr(n, 'as') || 'item';
      for (var j = 0; j < xs.length; j++) { var o = { $index: j }; o[as] = xs[j]; kids(n.kids, child(sc, o), out); }
      return;
    }
    if (lt === 'sc-if') { if (interp(attr(n, 'value'), sc)) kids(n.kids, sc, out); return; }
    var props = {};
    for (var i = 0; i < n.attrs.length; i++) {
      var k = n.attrs[i][0];
      if (k.indexOf('hint-') === 0) continue;
      props[k] = interp(n.attrs[i][1], sc);
    }
    out.push(h.apply(null, [n.tag, props].concat(kids(n.kids, sc, []))));
  }

  var TREE = null;
  class DCLogic extends P.Component {
    render() { return h(Fragment, null, kids(TREE.kids, child(Object.create(null), this.renderVals ? this.renderVals() || {} : {}), [])); }
  }

  function boot() {
    TREE = parse(document.getElementById('dc-template').textContent);
    TREE.kids.forEach(function (n) {
      if (!n.tag || n.tag.toLowerCase() !== 'helmet') return;
      n.kids.forEach(function (c) {
        if (!c.tag) return;
        var el = document.createElement(c.tag);
        c.attrs.forEach(function (a) { el.setAttribute(a[0], a[1] === true ? '' : a[1]); });
        if (c.kids[0] && c.kids[0].text != null) el.textContent = c.kids[0].text;
        document.head.appendChild(el);
      });
    });
    var s = document.querySelector('script[data-dc-script]'), dp = {}, props = {};
    try { dp = JSON.parse(s.getAttribute('data-props') || '{}'); } catch (e) { /* props par défaut */ }
    Object.keys(dp).forEach(function (k) {
      if (k === '$preview') return;
      var d = dp[k]; props[k] = d && typeof d === 'object' && 'default' in d ? d.default : d;
    });
    var Comp = new Function('DCLogic', s.textContent + '\n;return Component;')(DCLogic);
    P.render(h(Comp, props), document.getElementById('dc-root'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
