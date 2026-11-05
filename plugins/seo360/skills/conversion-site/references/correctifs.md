# Correctifs prêts à coller (conversion)

À lire quand on livre les corrections de la section 3. Remplacer les crochets. Tester sur un téléphone avant de publier. Sur WordPress, Wix ou Shopify, coller le HTML dans un bloc « HTML personnalisé » et le CSS dans le CSS additionnel du thème.

## 1. Lien téléphone cliquable

```html
<a href="tel:+33612345678" class="btn-appel">06 12 34 56 78</a>
```

Format international dans `href` (+33, sans le 0) ; format lisible dans le texte. Utiliser le même numéro que sur la fiche Google.

## 2. Bouton fixe en bas d'écran (mobile)

```html
<div class="barre-contact" role="region" aria-label="Contact rapide">
  <a href="tel:+33612345678" class="barre-contact__btn">📞 Appeler</a>
  <a href="/devis" class="barre-contact__btn barre-contact__btn--plein">Devis gratuit</a>
</div>
<style>
  .barre-contact { display: none; }
  @media (max-width: 768px) {
    .barre-contact { display: flex; gap: 8px; position: fixed; left: 0; right: 0; bottom: 0; z-index: 50;
      padding: 8px 12px calc(8px + env(safe-area-inset-bottom)); background: #fff; box-shadow: 0 -2px 8px rgba(0,0,0,.12); }
    .barre-contact__btn { flex: 1; text-align: center; padding: 12px; border-radius: 8px; border: 2px solid #0b5; color: #075; font-weight: 700; text-decoration: none; }
    .barre-contact__btn--plein { background: #0b5; color: #fff; }
    body { padding-bottom: 72px; } /* le contenu n'est pas caché par la barre */
  }
</style>
```

Vérifier le contraste des couleurs de la marque (au moins 4,5:1 pour le texte).

## 3. Formulaire court

```html
<form action="[adresse d'envoi]" method="post" id="form-devis">
  <label>Nom <input name="nom" autocomplete="name" required></label>
  <label>Téléphone ou e-mail <input name="contact" autocomplete="tel" required></label>
  <label>Votre besoin
    <select name="besoin" required>
      <option value="">Choisir…</option>
      <option>[Dépannage]</option><option>[Installation]</option><option>[Autre]</option>
    </select>
  </label>
  <label>Code postal <input name="cp" inputmode="numeric" autocomplete="postal-code" maxlength="5"></label>
  <label>Message (facultatif) <textarea name="message" rows="3"></textarea></label>
  <button type="submit">Recevoir mon devis sous 24 h</button>
  <p class="mention">Vos données servent uniquement à répondre à votre demande. <a href="/confidentialite">Politique de confidentialité</a>.</p>
</form>
```

Après l'envoi, afficher une page ou un message de confirmation, avec le délai réel de réponse et le numéro pour les urgences.

## 4. Événements GA4 (gtag.js déjà installé, Consent Mode v2 actif)

```html
<script>
  // Formulaire envoyé : événement recommandé par GA4
  document.getElementById('form-devis')?.addEventListener('submit', function () {
    gtag('event', 'generate_lead', { form_id: 'form-devis' });
  });
  // Clic sur un lien téléphone (une intention d'appel, pas un appel abouti)
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href^="tel:"]');
    if (a) gtag('event', 'clic_telephone', { link_url: a.getAttribute('href') });
  });
</script>
```

Ensuite, dans GA4 (Admin, Événements), marquer `generate_lead` et `clic_telephone` comme **événements clés**. Si une pub tourne, les importer dans Google Ads comme conversions.

## 5. Variante Google Tag Manager

- Déclencheur « Clic, liens uniquement » : l'URL du clic commence par `tel:`, puis une balise d'événement GA4 `clic_telephone`.
- Déclencheur « Envoi de formulaire » sur `#form-devis`, puis une balise d'événement GA4 `generate_lead`.
- Vérifier dans l'aperçu de GTM que rien ne part avant le consentement (Consent Mode v2 configuré dans la CMP).

## 6. Bloc « objections » (à adapter, sans promesse impossible)

```html
<section aria-labelledby="questions-devis">
  <h2 id="questions-devis">Prix, délais, garanties</h2>
  <h3>Combien coûte [une intervention] ?</h3>
  <p>[À partir de 89 € TTC le déplacement à Villeurbanne et Lyon 3e ; devis gratuit avant travaux.]</p>
  <h3>Sous quel délai intervenez-vous ?</h3>
  <p>[Le jour même pour une fuite, sous 48 h pour une installation, du lundi au samedi.]</p>
  <h3>Êtes-vous assuré ?</h3>
  <p>[Garantie décennale [assureur], attestation sur demande.]</p>
</section>
```

Chaque chiffre affiché doit être vrai et prouvable, et les prix affichés TTC pour les particuliers.
