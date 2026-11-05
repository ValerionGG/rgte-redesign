# Formats d'export : CSV et .ics

C'est le format que produit `node seo/cli.mjs calendrier <année> --secteur <id> --sortie <dossier>`. Le relire pour ajouter des actions à la main (événements locaux, opérations propres au client) sans casser l'import. Dire au dirigeant où chaque fichier sera créé avant de l'écrire.

## CSV (tableur, outil de planification)

UTF-8 avec BOM pour qu'Excel affiche les accents, séparateur `;`, une ligne par action (et pas par temps fort), dates au format `AAAA-MM-JJ`.

```csv
date;temps_fort;action;canal;responsable;statut;notes
2027-04-30;Fête des mères (30 mai);Page « idées cadeaux fête des mères » en ligne;site;Vous;à faire;J-30
2027-05-16;Fête des mères (30 mai);Lancer la campagne locale;Google Ads;Vous;à faire;J-14, budget-publicite
2027-05-23;Fête des mères (30 mai);Série de 3 posts + Stories;Instagram;Vous;à faire;J-7, contenus-reseaux-video
2027-04-29;Ascension et pont (6-7 mai);Horaires exceptionnels;Fiche Google;Vous;à faire;J-7
```

Valeurs de `canal` : `site`, `Google Ads`, `Meta`, `Instagram`, `Facebook`, `TikTok`, `LinkedIn`, `YouTube`, `Pinterest`, `Fiche Google`, `e-mail`, `magasin`, `application`.
Valeurs de `statut` : `à faire`, `en cours`, `fait`.

## .ics (agenda Google, Outlook, Apple)

Un événement « journée entière » par action. Lignes terminées par CRLF, `UID` unique et stable (le même pour la même action d'une année sur l'autre évite les doublons quand on réimporte), `DTEND` = lendemain de `DTSTART` pour une journée entière.

```text
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SEO 360//Calendrier marketing//FR
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:2027-fete-des-meres-page@calendrier-seo360
DTSTAMP:20270101T090000Z
DTSTART;VALUE=DATE:20270430
DTEND;VALUE=DATE:20270501
SUMMARY:J-30 Fête des mères : page cadeaux en ligne
DESCRIPTION:Mettre à jour la page saisonnière (même URL que l'an dernier).
END:VEVENT
END:VCALENDAR
```

Échapper les virgules, points-virgules et retours à la ligne dans `SUMMARY` et `DESCRIPTION` (`\,` `\;` `\n`). Pour un rappel, ajouter dans le `VEVENT` un bloc `BEGIN:VALARM` / `TRIGGER:-P1D` / `ACTION:DISPLAY` / `DESCRIPTION:Rappel` / `END:VALARM`.

## Contrôle avant de livrer

- Les dates du CSV et du .ics sont les mêmes que celles du tableau.
- Les dates « à vérifier » (soldes du département, vacances scolaires, événements locaux) portent la mention `à vérifier` dans `notes` ou `DESCRIPTION`.
