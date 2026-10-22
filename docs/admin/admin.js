// Back-office RGTE : demandes reçues par les formulaires, contenus du site, pages légales, comptes.
// Aucune dépendance ; tout le contenu dynamique passe par textContent (jamais innerHTML).
(function () {
  'use strict'
  var API = new URL('../api/', location.href).href
  var app = document.getElementById('app')
  var ME = null, TYPES = {}, STATUSES = {}, NEW_COUNT = 0

  // ── Outils ────────────────────────────────────────────────────────────
  function el(tag, attrs) {
    var n = document.createElement(tag)
    if (attrs) for (var k in attrs) {
      var v = attrs[k]
      if (v == null || v === false) continue
      if (k === 'class') n.className = v
      else if (k === 'text') n.textContent = v
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v)
      else if (k === 'value') n.value = v
      else n.setAttribute(k, v === true ? '' : v)
    }
    for (var i = 2; i < arguments.length; i++) add(n, arguments[i])
    return n
  }
  function add(n, c) {
    if (c == null || c === false) return
    if (Array.isArray(c)) c.forEach(function (x) { add(n, x) })
    else n.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)))
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); return n }
  function fmtDate(iso, withTime) {
    var d = new Date(iso)
    var o = { day: '2-digit', month: '2-digit', year: 'numeric' }
    if (withTime !== false) { o.hour = '2-digit'; o.minute = '2-digit' }
    return d.toLocaleString('fr-FR', o)
  }
  function ago(iso) {
    var s = (Date.now() - new Date(iso)) / 1000
    if (s < 60) return 'à l’instant'
    if (s < 3600) return 'il y a ' + Math.floor(s / 60) + ' min'
    if (s < 86400) return 'il y a ' + Math.floor(s / 3600) + ' h'
    if (s < 86400 * 7) return 'il y a ' + Math.floor(s / 86400) + ' j'
    return fmtDate(iso, false)
  }
  var toastTimer
  function toast(msg, err) {
    var t = document.querySelector('.toast') || document.body.appendChild(el('div', { class: 'toast', role: 'status' }))
    t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.remove() }, 3500)
  }

  function api(path, opts) {
    opts = opts || {}
    var init = { method: opts.method || 'GET', credentials: 'same-origin', headers: { 'X-RGTE': '1', Accept: 'application/json' } }
    if (opts.body !== undefined) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(opts.body) }
    return fetch(API + 'admin/' + path, init).then(function (r) {
      var json = /json/.test(r.headers.get('content-type') || '')
      if (!json) { var e = new Error('nojson'); e.status = r.status; e.noServer = true; throw e }
      return r.json().then(function (d) {
        if (r.status === 401 && path !== 'login' && path !== 'me') { ME = null; renderLogin('Votre session a expiré, reconnectez-vous.'); throw new Error(d.error) }
        if (!r.ok) { var e2 = new Error(d.error || 'Erreur ' + r.status); e2.status = r.status; throw e2 }
        return d
      })
    })
  }
  function fail(e) { if (e && e.message && !/session/i.test(e.message)) toast(e.message === 'Failed to fetch' ? 'Serveur injoignable' : e.message, true) }

  // ── Écrans hors session ───────────────────────────────────────────────
  function brand() { return el('a', { class: 'brand', href: '#/' }, el('b', { text: 'RGTE' }), el('span', { text: 'R.G. Technologies' })) }

  function renderNoServer() {
    clear(app).appendChild(el('div', { class: 'center' }, el('div', { class: 'panel' },
      brand(), el('h1', { text: 'Back-office' }),
      el('p', { text: 'Cette copie du site est statique (GitHub Pages) : le back-office a besoin du serveur RGTE pour enregistrer les demandes et les contenus.' }),
      el('p', { text: 'Lancez le serveur (npm start) ou ouvrez l’adresse où il est hébergé, puis revenez sur /admin/.' }),
      el('a', { class: 'btn', href: '../v3/' }, 'Voir le site')
    )))
  }

  function renderLogin(msg) {
    var err = el('p', { class: 'error' + (msg ? '' : ' hidden'), role: 'alert', text: msg || '' })
    var email = el('input', { class: 'input', id: 'email', type: 'email', autocomplete: 'username', required: true })
    var pw = el('input', { class: 'input', id: 'pw', type: 'password', autocomplete: 'current-password', required: true })
    var btn = el('button', { class: 'btn primary', type: 'submit', text: 'Se connecter' })
    var form = el('form', { class: 'panel', onsubmit: function (e) {
      e.preventDefault(); btn.disabled = true; err.classList.add('hidden')
      api('login', { method: 'POST', body: { email: email.value, password: pw.value } })
        .then(boot)
        .catch(function (e) { err.textContent = e.noServer ? 'Serveur RGTE introuvable.' : e.message; err.classList.remove('hidden'); btn.disabled = false; pw.select() })
    } },
      brand(), el('h1', { text: 'Back-office' }), err,
      el('div', { class: 'field' }, el('label', { for: 'email', text: 'Email' }), email),
      el('div', { class: 'field' }, el('label', { for: 'pw', text: 'Mot de passe' }), pw),
      btn)
    clear(app).appendChild(el('div', { class: 'center' }, form))
    email.focus()
  }

  // ── Coquille ──────────────────────────────────────────────────────────
  var NAV = [
    ['', 'Tableau de bord'], ['demandes', 'Demandes'], null,
    ['infos', 'Informations à compléter'], ['textes', 'Textes du site'], ['legal', 'Pages légales'], null,
    ['utilisateurs', 'Utilisateurs'], ['compte', 'Mon compte'],
  ]
  var side, main
  function shell() {
    side = el('aside', { class: 'side' })
    main = el('main', { class: 'main', id: 'main' })
    clear(app).appendChild(el('div', { class: 'shell' }, side, main))
    side.addEventListener('click', function (e) { if (e.target.closest('a')) side.classList.remove('open') })
  }
  function renderSide(route) {
    clear(side)
    add(side, brand())
    add(side, el('nav', { class: 'nav', 'aria-label': 'Sections' }, NAV.map(function (it) {
      if (!it) return el('div', { class: 'nav-sep' })
      var on = route === it[0] || (it[0] && route.indexOf(it[0] + '/') === 0)
      return el('a', { href: '#/' + it[0], class: on ? 'on' : null, 'aria-current': on ? 'page' : null }, it[1],
        it[0] === 'demandes' && NEW_COUNT ? el('span', { class: 'count', text: NEW_COUNT, 'aria-label': NEW_COUNT + ' nouvelles' }) : null)
    })))
    add(side, el('div', { class: 'side-foot' },
      el('span', { text: ME.name || ME.email }), el('span', { class: 'small', text: ME.email }),
      el('a', { href: '../v3/', target: '_blank', rel: 'noopener', text: 'Voir le site ↗' }),
      el('a', { href: '#', onclick: function (e) { e.preventDefault(); api('logout', { method: 'POST' }).then(function () { ME = null; renderLogin() }).catch(fail) }, text: 'Se déconnecter' })))
  }
  function top(title, sub, actions) {
    return el('div', { class: 'top' },
      el('div', { class: 'row' },
        el('button', { class: 'btn menu-btn', type: 'button', 'aria-label': 'Menu', onclick: function () { side.classList.toggle('open') } }, '☰'),
        el('div', null, el('h1', { text: title }), sub ? el('p', { class: 'sub', text: sub }) : null)),
      actions ? el('div', { class: 'row' }, actions) : null)
  }
  function pill(cls, text) { return el('span', { class: 'pill ' + cls, text: text }) }

  function refreshCount() {
    return api('stats').then(function (s) { NEW_COUNT = s.byStatus.nouvelle || 0; return s })
  }

  // ── Tableau de bord ───────────────────────────────────────────────────
  function viewDashboard() {
    return refreshCount().then(function (s) {
      var by = function (obj, labels) {
        var keys = Object.keys(labels), max = Math.max.apply(null, keys.map(function (k) { return obj[k] || 0 }).concat([1]))
        return el('div', { class: 'bars' }, keys.map(function (k) {
          var n = obj[k] || 0, fill = el('div', { class: 'fill' }); fill.style.width = (n / max * 100) + '%'
          return el('div', { class: 'bar' }, el('span', { text: labels[k] }), el('div', { class: 'track' }, fill), el('span', { class: 'n', text: n }))
        }))
      }
      var days = {}; s.days.forEach(function (d) { days[d.d] = d.n })
      var spark = el('div', { class: 'spark', role: 'img', 'aria-label': 'Demandes par jour sur 30 jours' })
      var dmax = Math.max.apply(null, s.days.map(function (d) { return d.n }).concat([1]))
      for (var i = 29; i >= 0; i--) {
        var key = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), n = days[key] || 0
        var b = el('i', { class: n ? null : 'zero', title: key.split('-').reverse().join('/') + ' : ' + n })
        b.style.height = Math.max(4, n / dmax * 100) + '%'; spark.appendChild(b)
      }
      return [
        top('Tableau de bord', 'Demandes reçues par les formulaires du site et contenus à compléter.'),
        el('div', { class: 'grid' },
          kpi(s.byStatus.nouvelle || 0, 'Nouvelles demandes à traiter', true),
          kpi((s.byStatus.en_cours || 0) + (s.byStatus.devis_envoye || 0), 'En cours ou devis envoyé'),
          kpi(s.last30, 'Demandes sur 30 jours'),
          kpi(s.markers.filled + ' / ' + s.markers.total, 'Informations complétées')),
        el('div', { class: 'grid-2' },
          el('section', { class: 'card' }, el('h2', { text: 'Dernières demandes' }),
            s.latest.length ? el('div', { class: 'stack' }, s.latest.map(function (l) {
              return el('a', { href: '#/demandes/' + l.id, class: 'row spread plain' },
                el('div', null, el('div', { class: 'who', text: l.nom }), el('div', { class: 'small muted', text: l.typeLabel + ' · ' + ago(l.created_at) })),
                pill(l.status, l.statusLabel))
            })) : el('p', { class: 'empty', text: 'Aucune demande pour le moment. Elles arrivent ici dès qu’un visiteur envoie un formulaire du site.' })),
          el('div', { class: 'stack' },
            el('section', { class: 'card' }, el('h2', { text: '30 derniers jours' }), spark),
            el('section', { class: 'card' }, el('h2', { text: 'Par type' }), by(s.byType, TYPES)),
            el('section', { class: 'card' }, el('h2', { text: 'Par statut' }), by(s.byStatus, STATUSES))))
      ]
    })
  }
  function kpi(v, l, accent) { return el('div', { class: 'card kpi' + (accent ? ' accent' : '') }, el('span', { class: 'v', text: v }), el('span', { class: 'l', text: l })) }

  // ── Demandes ──────────────────────────────────────────────────────────
  var filters = { q: '', status: '', type: '' }
  function viewLeads() {
    var body = el('div')
    function load() {
      var qs = new URLSearchParams()
      if (filters.q) qs.set('q', filters.q)
      if (filters.status) qs.set('status', filters.status)
      if (filters.type) qs.set('type', filters.type)
      return api('leads?' + qs).then(function (rows) {
        clear(body)
        if (!rows.length) return add(body, el('p', { class: 'empty', text: filters.q || filters.status || filters.type ? 'Aucune demande ne correspond à ces filtres.' : 'Aucune demande pour le moment.' }))
        add(body, el('div', { class: 'table-wrap' }, el('table', null,
          el('thead', null, el('tr', null, ['N°', 'Reçue', 'Contact', 'Type', 'Projet', 'Statut'].map(function (h) { return el('th', { scope: 'col', text: h }) }))),
          el('tbody', null, rows.map(function (l) {
            var open = function () { location.hash = '#/demandes/' + l.id }
            var summary = l.message || Object.keys(l.details).map(function (k) { var v = l.details[k]; return k + ' : ' + (Array.isArray(v) ? v.join(', ') : v) }).join(' · ')
            return el('tr', { class: l.status === 'nouvelle' ? 'new' : null, tabindex: '0', onclick: open, onkeydown: function (e) { if (e.key === 'Enter') open() } },
              el('td', { class: 'nowrap muted', text: '#' + l.id }),
              el('td', { class: 'nowrap', title: fmtDate(l.created_at) , text: ago(l.created_at) }),
              el('td', null, el('div', { class: 'who', text: l.nom }), el('div', { class: 'sub', text: [l.societe, l.ville].filter(Boolean).join(' · ') || l.email || l.telephone })),
              el('td', null, pill('type', l.typeLabel)),
              el('td', null, el('div', { class: 'clip', text: summary })),
              el('td', null, pill(l.status, l.statusLabel)))
          })))))
      }).catch(fail)
    }
    var q = el('input', { class: 'input', id: 'f-q', type: 'search', placeholder: 'Nom, email, ville, message…', value: filters.q })
    var t
    q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { filters.q = q.value.trim(); load() }, 250) })
    var sel = function (id, key, labels, all) {
      var s = el('select', { class: 'input', id: id, onchange: function () { filters[key] = s.value; load() } },
        el('option', { value: '', text: all }), Object.keys(labels).map(function (k) { return el('option', { value: k, text: labels[k] }) }))
      s.value = filters[key]; return s
    }
    load()
    return [
      top('Demandes', 'Devis, plans 3D, demandes d’informations et projets envoyés depuis le site.',
        el('a', { class: 'btn', href: API + 'admin/leads.csv', onclick: function (e) { e.preventDefault(); download() } }, 'Exporter (CSV)')),
      el('section', { class: 'card stack' },
        el('div', { class: 'filters' },
          el('div', { class: 'field q' }, el('label', { for: 'f-q', text: 'Rechercher' }), q),
          el('div', { class: 'field' }, el('label', { for: 'f-st', text: 'Statut' }), sel('f-st', 'status', STATUSES, 'Tous (hors archivées)')),
          el('div', { class: 'field' }, el('label', { for: 'f-ty', text: 'Type' }), sel('f-ty', 'type', TYPES, 'Tous les types'))),
        body)
    ]
  }
  // Le CSV exige l'en-tête X-RGTE : téléchargement via fetch puis lien blob.
  function download() {
    fetch(API + 'admin/leads.csv', { credentials: 'same-origin', headers: { 'X-RGTE': '1' } })
      .then(function (r) { if (!r.ok) throw new Error('Export impossible'); return r.blob() })
      .then(function (b) {
        var a = el('a', { href: URL.createObjectURL(b), download: 'rgte-demandes-' + new Date().toISOString().slice(0, 10) + '.csv' })
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href) }, 1000)
      }).catch(fail)
  }

  function viewLead(id) {
    return api('leads/' + id).then(function (l) {
      var dl = function (pairs) {
        return el('dl', { class: 'dl' }, pairs.filter(function (p) { return p[1] !== '' && p[1] != null }).map(function (p) { return [el('dt', { text: p[0] }), el('dd', null, p[1])] }))
      }
      var status = el('select', { class: 'input', id: 'l-status' }, Object.keys(STATUSES).map(function (k) { return el('option', { value: k, text: STATUSES[k] }) }))
      status.value = l.status
      var note = el('textarea', { class: 'input', id: 'l-note', placeholder: 'Appel passé, devis n°…, rendez-vous showroom…' })
      var save = el('button', { class: 'btn primary', type: 'submit', text: 'Enregistrer' })
      var detailPairs = Object.keys(l.details).map(function (k) { var v = l.details[k]; return [k, Array.isArray(v) ? el('div', null, v.map(function (x) { return el('div', { text: '• ' + x }) })) : v] })
      return [
        top(l.nom, l.typeLabel + ' · reçue le ' + fmtDate(l.created_at) + ' · n°' + l.id,
          [el('a', { class: 'btn', href: '#/demandes', text: '← Toutes les demandes' }),
            el('button', { class: 'btn danger', type: 'button', text: 'Supprimer', onclick: function () {
              if (!confirm('Supprimer définitivement la demande de ' + l.nom + ' ? (droit à l’effacement RGPD)')) return
              api('leads/' + l.id, { method: 'DELETE' }).then(function () { toast('Demande supprimée'); location.hash = '#/demandes' }).catch(fail)
            } })]),
        el('div', { class: 'grid-2' },
          el('div', { class: 'stack' },
            el('section', { class: 'card' }, el('h2', { text: 'Contact' }), dl([
              ['Nom', l.nom], ['Société', l.societe],
              ['Téléphone', l.telephone ? el('a', { href: 'tel:' + l.telephone.replace(/[^\d+]/g, ''), text: l.telephone }) : ''],
              ['Email', l.email ? el('a', { href: 'mailto:' + l.email + '?subject=' + encodeURIComponent('Votre demande RGTE (n°' + l.id + ')'), text: l.email }) : ''],
              ['Secteur', l.secteur], ['Code postal', l.code_postal], ['Ville', l.ville]])),
            l.message ? el('section', { class: 'card' }, el('h2', { text: 'Message' }), el('div', { class: 'msg', text: l.message })) : null,
            detailPairs.length ? el('section', { class: 'card' }, el('h2', { text: 'Détails du projet' }), dl(detailPairs)) : null,
            el('p', { class: 'small muted', text: 'Envoyée depuis : ' + (l.page || '—') })),
          el('div', { class: 'stack' },
            el('form', { class: 'card stack', onsubmit: function (e) {
              e.preventDefault(); save.disabled = true
              api('leads/' + l.id, { method: 'PATCH', body: { status: status.value, note: note.value } })
                .then(function () { toast('Demande mise à jour'); return refreshCount() }).then(route).catch(function (e) { save.disabled = false; fail(e) })
            } },
              el('h2', { text: 'Suivi' }),
              el('div', { class: 'field' }, el('label', { for: 'l-status', text: 'Statut' }), status),
              el('div', { class: 'field' }, el('label', { for: 'l-note', text: 'Ajouter une note' }), note),
              el('div', null, save)),
            el('section', { class: 'card' }, el('h2', { text: 'Historique' }),
              l.events.length ? el('div', { class: 'timeline' }, l.events.slice().reverse().map(function (ev) {
                return el('div', { class: 'ev ' + ev.kind }, el('span', { class: 'meta', text: fmtDate(ev.at) + ' · ' + ev.user_name + (ev.kind === 'status' ? ' · statut' : '') }), el('span', { class: 'txt', text: ev.text }))
              })) : el('p', { class: 'muted small', text: 'Aucune action pour l’instant.' }))))
      ]
    })
  }

  // ── Contenus ──────────────────────────────────────────────────────────
  var CONTENT = null
  function loadContent() { return api('content').then(function (c) { CONTENT = c; return c }) }
  function saveContent(patch, btn) {
    if (btn) btn.disabled = true
    return api('content', { method: 'PUT', body: patch }).then(function () { toast('Enregistré — visible sur le site au prochain chargement des pages'); return loadContent() })
      .catch(fail).then(function () { if (btn) btn.disabled = false })
  }

  function viewMarkers() {
    return loadContent().then(function (c) {
      var inputs = {}
      var rows = c.markerList.map(function (m) {
        var id = 'm-' + m.marker.replace(/[^A-Za-z0-9]/g, '') + '-' + m.count
        var inp = el('input', { class: 'input', id: id, value: c.markers[m.marker] || '', placeholder: 'Laisser vide pour garder le marqueur' })
        inputs[m.marker] = inp
        return el('div', { class: 'marker' + (c.markers[m.marker] ? ' filled' : '') },
          el('div', null, el('code', { text: m.marker }), el('p', { class: 'small muted', text: m.count + ' occurrence' + (m.count > 1 ? 's' : '') + ' sur ' + m.pages.length + ' page' + (m.pages.length > 1 ? 's' : '') })),
          el('div', { class: 'field' },
            el('label', { for: id, class: 'label', text: 'Remplacer partout par' }), inp,
            el('div', { class: 'ctx' }, el('span', { text: 'Exemples sur le site :' }), m.contexts.slice(0, 3).map(function (x) { return el('span', { text: '« ' + x + ' »' }) }))))
      })
      var btn = el('button', { class: 'btn primary', type: 'submit', text: 'Enregistrer' })
      var phone = el('input', { class: 'input', id: 'c-phone', value: c.phone })
      return [
        top('Informations à compléter', 'Les maquettes affichent des marqueurs entre crochets là où une information manque. Renseignez-les ici : ils sont remplacés sur toutes les pages.'),
        el('form', { class: 'stack', onsubmit: function (e) {
          e.preventDefault()
          var markers = {}; Object.keys(inputs).forEach(function (k) { if (inputs[k].value.trim()) markers[k] = inputs[k].value.trim() })
          saveContent({ markers: markers, phone: phone.value.trim() }, btn).then(route)
        } },
          el('section', { class: 'card stack' },
            el('h2', { text: 'Coordonnées' }),
            el('div', { class: 'field' }, el('label', { for: 'c-phone', text: 'Numéro affiché dans les messages d’erreur d’envoi' }), phone)),
          el('p', { class: 'hint', text: 'Un même marqueur peut avoir plusieurs sens selon la page (par ex. [À PRÉCISER]) : lisez les exemples avant de le remplacer partout. Pour un remplacement ciblé, utilisez « Textes du site ».' }),
          el('section', { class: 'card' }, rows.length ? rows : el('p', { class: 'empty', text: 'Aucun marqueur trouvé. Lancez « npm run build » pour relever les marqueurs des pages.' })),
          el('div', { class: 'sticky-save' }, btn))
      ]
    })
  }

  function viewTexts() {
    return loadContent().then(function (c) {
      var list = el('div', { class: 'stack' })
      var addRow = function (r) {
        var from = el('textarea', { class: 'input', 'aria-label': 'Texte actuel', placeholder: 'Texte actuel, exactement comme sur le site', value: r.from || '' })
        var to = el('textarea', { class: 'input', 'aria-label': 'Nouveau texte', placeholder: 'Nouveau texte', value: r.to || '' })
        var row = el('div', { class: 'rep' }, from, to, el('button', { class: 'btn ghost danger', type: 'button', 'aria-label': 'Retirer', text: 'Retirer', onclick: function () { row.remove() } }))
        row._get = function () { return { from: from.value, to: to.value } }
        list.appendChild(row)
      }
      c.replacements.forEach(addRow)
      if (!c.replacements.length) addRow({})
      var btn = el('button', { class: 'btn primary', type: 'submit', text: 'Enregistrer' })
      return [
        top('Textes du site', 'Remplacez n’importe quel texte des pages (prix, coordonnées, formulations…). Le remplacement s’applique à toutes les pages où le texte apparaît à l’identique.'),
        el('form', { class: 'stack', onsubmit: function (e) {
          e.preventDefault()
          var reps = Array.prototype.map.call(list.children, function (r) { return r._get() }).filter(function (r) { return r.from.trim() })
          saveContent({ replacements: reps }, btn).then(route)
        } },
          el('section', { class: 'card stack' },
            el('div', { class: 'rep label' }, el('span', { text: 'Texte actuel' }), el('span', { text: 'Nouveau texte' }), el('span')),
            list,
            el('div', null, el('button', { class: 'btn', type: 'button', text: '+ Ajouter un remplacement', onclick: function () { addRow({}) } }))),
          el('p', { class: 'hint', text: 'Exemple : « 5 800,00 € HT » → « 5 950,00 € HT ». Le texte actuel doit faire au moins 3 caractères et correspondre exactement (espaces, apostrophes ’ et majuscules compris).' }),
          el('div', { class: 'sticky-save' }, btn))
      ]
    })
  }

  var legalSlug = 'mentions-legales'
  function viewLegal() {
    return loadContent().then(function (c) {
      var defs = c.legalDefaults, cur = function (s) { return c.legal[s] || defs[s] }
      var title = el('input', { class: 'input', id: 'lg-title', value: cur(legalSlug).title })
      var body = el('textarea', { class: 'input tall', id: 'lg-body', value: cur(legalSlug).body })
      var btn = el('button', { class: 'btn primary', type: 'submit', text: 'Enregistrer' })
      return [
        top('Pages légales', 'Liées dans le pied de page de toutes les pages du site.',
          el('a', { class: 'btn', href: '../legal.html?p=' + legalSlug, target: '_blank', rel: 'noopener', text: 'Voir la page ↗' })),
        el('div', { class: 'tabs', role: 'tablist' }, Object.keys(defs).map(function (s) {
          return el('button', { class: 'tab' + (s === legalSlug ? ' on' : ''), type: 'button', role: 'tab', 'aria-selected': String(s === legalSlug), text: cur(s).title, onclick: function () { legalSlug = s; route() } })
        })),
        el('form', { class: 'card stack', onsubmit: function (e) {
          e.preventDefault()
          var legal = JSON.parse(JSON.stringify(c.legal)); legal[legalSlug] = { title: title.value, body: body.value }
          saveContent({ legal: legal }, btn).then(route)
        } },
          el('div', { class: 'field' }, el('label', { for: 'lg-title', text: 'Titre' }), title),
          el('div', { class: 'field' }, el('label', { for: 'lg-body', text: 'Contenu' }), body),
          el('p', { class: 'small muted', text: 'Mise en forme : une ligne vide sépare les paragraphes, « ## » en début de ligne crée un intertitre, « - » une puce.' + (legalSlug === 'plan-du-site' ? ' La liste des pages est ajoutée automatiquement sous ce texte.' : '') }),
          el('div', { class: 'row' }, btn,
            el('button', { class: 'btn ghost', type: 'button', text: 'Revenir au texte par défaut', onclick: function () { title.value = defs[legalSlug].title; body.value = defs[legalSlug].body } })))
      ]
    })
  }

  // ── Comptes ───────────────────────────────────────────────────────────
  function viewUsers() {
    return api('users').then(function (users) {
      var email = el('input', { class: 'input', id: 'u-email', type: 'email', required: true, autocomplete: 'off' })
      var name = el('input', { class: 'input', id: 'u-name' })
      var pw = el('input', { class: 'input', id: 'u-pw', type: 'text', required: true, minlength: '10', autocomplete: 'new-password' })
      var btn = el('button', { class: 'btn primary', type: 'submit', text: 'Créer le compte' })
      return [
        top('Utilisateurs', 'Personnes ayant accès au back-office.'),
        el('div', { class: 'grid-2' },
          el('section', { class: 'card' }, el('h2', { text: users.length + ' compte' + (users.length > 1 ? 's' : '') }),
            el('div', { class: 'stack' }, users.map(function (u) {
              return el('div', { class: 'row spread' },
                el('div', null, el('div', { class: 'who', text: (u.name || u.email) + (u.id === ME.id ? ' (vous)' : '') }),
                  el('div', { class: 'small muted', text: u.email + ' · ' + (u.last_login ? 'dernière connexion ' + ago(u.last_login) : 'jamais connecté') })),
                u.id === ME.id ? null : el('button', { class: 'btn danger', type: 'button', text: 'Retirer', onclick: function () {
                  if (confirm('Retirer l’accès de ' + u.email + ' ?')) api('users/' + u.id, { method: 'DELETE' }).then(function () { toast('Accès retiré'); route() }).catch(fail)
                } }))
            }))),
          el('form', { class: 'card stack', onsubmit: function (e) {
            e.preventDefault(); btn.disabled = true
            api('users', { method: 'POST', body: { email: email.value, name: name.value, password: pw.value } })
              .then(function () { toast('Compte créé — transmettez le mot de passe à la personne'); route() })
              .catch(function (e) { btn.disabled = false; fail(e) })
          } },
            el('h2', { text: 'Ajouter un utilisateur' }),
            el('div', { class: 'field' }, el('label', { for: 'u-email', text: 'Email' }), email),
            el('div', { class: 'field' }, el('label', { for: 'u-name', text: 'Nom' }), name),
            el('div', { class: 'field' }, el('label', { for: 'u-pw', text: 'Mot de passe provisoire (10 caractères minimum)' }), pw),
            el('div', null, btn)))
      ]
    })
  }

  function viewAccount() {
    var cur = el('input', { class: 'input', id: 'a-cur', type: 'password', required: true, autocomplete: 'current-password' })
    var next = el('input', { class: 'input', id: 'a-next', type: 'password', required: true, minlength: '10', autocomplete: 'new-password' })
    var conf = el('input', { class: 'input', id: 'a-conf', type: 'password', required: true, autocomplete: 'new-password' })
    var btn = el('button', { class: 'btn primary', type: 'submit', text: 'Changer le mot de passe' })
    return Promise.resolve([
      top('Mon compte', ME.email),
      el('form', { class: 'card stack', onsubmit: function (e) {
        e.preventDefault()
        if (next.value !== conf.value) return toast('Les deux mots de passe ne correspondent pas', true)
        btn.disabled = true
        api('password', { method: 'POST', body: { current: cur.value, next: next.value } })
          .then(function () { toast('Mot de passe changé — vos autres sessions sont fermées'); cur.value = next.value = conf.value = '' })
          .catch(fail).then(function () { btn.disabled = false })
      } },
        el('h2', { text: 'Mot de passe' }),
        el('div', { class: 'field' }, el('label', { for: 'a-cur', text: 'Mot de passe actuel' }), cur),
        el('div', { class: 'field' }, el('label', { for: 'a-next', text: 'Nouveau mot de passe (10 caractères minimum)' }), next),
        el('div', { class: 'field' }, el('label', { for: 'a-conf', text: 'Confirmer' }), conf),
        el('div', null, btn))
    ])
  }

  // ── Routage ───────────────────────────────────────────────────────────
  function route() {
    if (!ME) return
    var r = location.hash.replace(/^#\/?/, ''), m
    var view = r === '' ? viewDashboard()
      : r === 'demandes' ? Promise.resolve(viewLeads())
      : (m = r.match(/^demandes\/(\d+)$/)) ? viewLead(m[1])
      : r === 'infos' ? viewMarkers()
      : r === 'textes' ? viewTexts()
      : r === 'legal' ? viewLegal()
      : r === 'utilisateurs' ? viewUsers()
      : r === 'compte' ? viewAccount()
      : Promise.resolve([top('Page introuvable'), el('a', { class: 'btn', href: '#/', text: 'Tableau de bord' })])
    return view.then(function (nodes) {
      renderSide(r); clear(main); add(main, nodes); window.scrollTo(0, 0)
      document.title = (main.querySelector('h1') ? main.querySelector('h1').textContent + ' — ' : '') + 'RGTE back-office'
    }).catch(function (e) {
      if (e && e.status === 404) { renderSide(r); clear(main); add(main, [top('Introuvable', e.message), el('a', { class: 'btn', href: '#/demandes', text: '← Demandes' })]) } else fail(e)
    })
  }

  function boot() {
    return api('me').then(function (d) {
      ME = d.user; TYPES = d.types; STATUSES = d.statuses
      shell()
      return refreshCount().catch(function () {}).then(route)
    }).catch(function (e) {
      if (e.noServer) renderNoServer()
      else if (e.status === 401) renderLogin()
      else renderLogin('Serveur injoignable.')
    })
  }

  window.addEventListener('hashchange', route)
  // Rafraîchit le compteur des nouvelles demandes toutes les 2 minutes.
  setInterval(function () { if (ME) refreshCount().then(function () { renderSide(location.hash.replace(/^#\/?/, '')) }).catch(function () {}) }, 120000)
  boot()
})()
