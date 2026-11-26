# devisCyril

Factures de Cyril Aubourg (DOJOGYM'S Academy, cours de judo adapté).
Une facture = destinataire, lieu, prestation, période, séances x tarif ; l'app calcule le total et produit le PDF
au design DOJOGYM'S (fond `src/assets/fond-dojogyms.jpg`).

Dérivée de Chiffr (La Netscouade), allégée pour un seul utilisateur : pas de compte, pas de base de données.
Les données sont enregistrées dans le navigateur (localStorage, clé `devis-cyril`). Sauvegarde et restauration
en fichier JSON depuis **Paramètres**.

```bash
npm install
npm run dev     # http://localhost:5173
```

Vérifications : `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

- Pages : `src/pages/` (Factures, fiche facture avec aperçu, Indicateurs, Destinataires, Paramètres). Calculs des indicateurs : `src/lib/indicateurs.ts`.
- Données : `src/lib/store.ts` (Zustand persisté), calculs et formats : `src/lib/factures.ts`.
- PDF : `src/lib/pdf/facturePdf.ts` (positions relevées sur la facture n°044).
