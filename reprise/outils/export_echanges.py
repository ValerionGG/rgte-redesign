"""Exporte la conversation (messages de Nadir, réponses de Claude, résumés automatiques) en Markdown lisible.
Usage : python3 -I export_echanges.py sortie.md transcript1.jsonl [transcript2.jsonl …]
Écarte : résultats d'outils, rappels système, comptes rendus de sous-agents, corps de skills, adresse e-mail.
"""
import json, re, sys

out, files = sys.argv[1], sys.argv[2:]
EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
SYS = re.compile(r"<system-reminder[^>]*>.*?</system-reminder[^>]*>", re.S)
SKIP_USER = ("Base directory for this skill", "Another Claude session sent a message", "Stop hook feedback",
             "This session's worker process was restarted", "[SYSTEM NOTIFICATION", "<task-notification",
             "## Page contract", "<local-command", "Caveat:", "[Request interrupted")

def text_of(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        for c in content:
            if isinstance(c, dict) and c.get("type") == "tool_result":
                cc = c.get("content")
                s = cc if isinstance(cc, str) else " ".join(y.get("text", "") for y in (cc or []) if isinstance(y, dict))
                if "questions have been answered" in s:
                    # Réponse de Nadir à une question de Claude : ce sont des décisions
                    pairs = re.findall(r'"(.+?)"="(.+?)"', s, re.S)
                    return "\x00REPONSE" + "\n".join(f"**Question :** {q.strip()}\n**Réponse :** {r.strip()}" for q, r in pairs)
                return None
        return "\n".join(c.get("text", "") for c in content if isinstance(c, dict) and c.get("type") == "text")
    return None

seen, items = set(), []
for f in files:
    with open(f, encoding="utf-8") as fh:
        for line in fh:
            try:
                j = json.loads(line)
            except Exception:
                continue
            if j.get("type") not in ("user", "assistant") or not j.get("message"):
                continue
            uid = j.get("uuid") or (j.get("timestamp"), j.get("type"))
            if uid in seen:
                continue
            seen.add(uid)
            t = text_of(j["message"].get("content"))
            if not t:
                continue
            t = SYS.sub("", t).strip()
            if not t:
                continue
            kind = j["type"]
            if t.startswith("\x00REPONSE"):
                kind, t = "reponse", t[len("\x00REPONSE"):]
            if kind == "user":
                if j.get("isMeta") or t.startswith(SKIP_USER) or t.startswith("<command-"):
                    continue
                if t.startswith("This session is being continued from a previous conversation"):
                    kind = "resume"
                    t = t.split("Summary:", 1)[-1].strip()
                if t.startswith("[Image:") and len(t) < 160:
                    t = "*(capture d’écran envoyée)*"
            items.append((j.get("timestamp", ""), kind, EMAIL.sub("[e-mail retiré]", t)))

items.sort(key=lambda x: x[0])
L = ["# Nos échanges — SEO 360 et RGTE (export intégral)", "",
     "Export de la session Claude Code « Plateforme SEO avec hashtags et benchmarking » (du 03/11/2026 au 21/11/2026).",
     "Contenu : chaque message de Nadir, chaque réponse de Claude (y compris les points d’étape écrits pendant le travail), et les résumés automatiques faits quand la conversation devenait trop longue.",
     "Écarté : le détail des commandes et des résultats d’outils, les rappels internes, les comptes rendus bruts des sous-agents.", ""]
day = None
for ts, kind, t in items:
    d = ts[:10]
    if d != day:
        day = d
        L += ["", f"## {d[8:10]}/{d[5:7]}/{d[:4]}", ""]
    hm = ts[11:16]
    if kind == "user":
        q = "\n".join("> " + x for x in t.splitlines())
        L += [f"### 🧑 Nadir — {hm}", "", q, ""]
    elif kind == "reponse":
        L += [f"### 🧑 Nadir répond — {hm}", "", t, ""]
    elif kind == "resume":
        L += [f"<details><summary>📋 Résumé automatique du contexte ({hm})</summary>", "", t, "", "</details>", ""]
    else:
        L += [f"**🤖 Claude — {hm}**", "", t, ""]
open(out, "w", encoding="utf-8").write("\n".join(L) + "\n")
print(len(items), "messages,", sum(1 for i in items if i[1] == "user"), "de Nadir,", sum(1 for i in items if i[1] == "reponse"), "réponses à des questions,", sum(1 for i in items if i[1] == "resume"), "résumés")
