// Mises à jour Google confirmées (tableau de bord officiel : https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history)
// et changements qui déplacent les clics sans toucher aux positions. Sert à dater une chute dans l'export Search Console.
// Vérifié le 05/11/2026 — à revoir avant le 05/03/2027 (ajouter les nouvelles mises à jour, ne jamais deviner une date).
export const VERIFIED = '2026-11-05'
export const REVIEW_BY = '2027-03-05'

export const GOOGLE_UPDATES = [
  { id: 'core-2025-03', type: 'core', label: 'Core update de mars 2025', start: '2025-03-13', end: '2025-03-27' },
  { id: 'core-2025-06', type: 'core', label: 'Core update de juin 2025', start: '2025-06-30', end: '2025-07-17' },
  { id: 'spam-2025-08', type: 'spam', label: 'Spam update d’août 2025', start: '2025-08-26', end: '2025-09-22' },
  { id: 'core-2025-12', type: 'core', label: 'Core update de décembre 2025', start: '2025-12-11', end: '2025-12-29' },
  { id: 'discover-2026-02', type: 'discover', label: 'Core update Discover (Discover seulement)', start: '2026-02-05', end: '2026-02-27' },
  { id: 'spam-2026-03', type: 'spam', label: 'Spam update de mars 2026', start: '2026-03-24', end: '2026-03-25' },
  { id: 'core-2026-03', type: 'core', label: 'Core update de mars 2026', start: '2026-03-27', end: '2026-04-08' },
  { id: 'faq-2026-05', type: 'serp', label: 'Fin des résultats enrichis FAQ', start: '2026-05-07', end: '2026-05-07' },
  { id: 'core-2026-05', type: 'core', label: 'Core update de mai 2026', start: '2026-05-21', end: '2026-06-02' },
  { id: 'spam-2026-06', type: 'spam', label: 'Spam update de juin 2026', start: '2026-06-24', end: '2026-06-26' },
  { id: 'aio-fr-2026-07', type: 'ia', label: 'AI Overviews et AI Mode lancés en France', start: '2026-07-22', end: '2026-07-22' },
  { id: 'spam-2026-08', type: 'spam', label: 'Spam update d’août 2026', start: '2026-08-18', end: '2026-08-21' },
  { id: 'spam-2026-09', type: 'spam', label: 'Spam update de septembre 2026', start: '2026-09-24', end: '2026-10-08' },
]

export const SOURCES = [
  'https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history',
  'https://www.seroundtable.com/google-may-2026-core-update-done-41435.html',
  'https://www.searchenginejournal.com/google-september-2026-spam-update-complete/592283/',
  'https://www.relevantaudience.com/seo/google-august-2026-spam-update/',
  'https://www.searchenginejournal.com/google-drops-faq-rich-results/574429/',
  'https://www.solutions-numeriques.com/google-active-ai-overviews-et-ai-mode-en-france/',
]
