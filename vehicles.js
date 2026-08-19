/* ============================================================
   VEHICLE PRICE BOOK
   ------------------------------------------------------------
   This is the only place vehicle pricing lives.

   TO UPDATE A PRICE
     Change `exShowroom` below and refresh the page. Nothing else
     in the application needs to be touched.

   TO ADD A VEHICLE
     Add an entry to `vehicles`. The controls, result cards,
     charts and tables all build themselves from this list, so a
     new car appears everywhere automatically. Give it a unique
     `key` and an `accent` colour that exists in styles.css.

   Prices are ex-showroom, in rupees, and are shown read-only in
   the interface. Set `allowPriceEdit: true` if you ever want
   users to type over them.
   ============================================================ */

'use strict';

const PRICE_BOOK = {

  currency: 'INR',
  priceLabel: 'Ex-showroom',
  updated: 'August 2026',

  // Prices are fixed in the UI. Flip to true to make them editable.
  allowPriceEdit: false,

  vehicles: [
    {
      key: 'm9',
      name: 'MG M9',
      short: 'M9',
      accent: 'var(--m9)',

      exShowroom: 7994800,

      // Expected resale value as a % of the original price, years 1-5.
      resaleLadder: [80, 70, 60, 45, 35],

      // Tax rate this car's original spreadsheet used, kept only so the
      // "different rate per car" option can reproduce those old numbers.
      sourceTaxRate: 30
    },
    {
      key: 'cyb',
      name: 'MG Cyberster',
      short: 'Cyberster',
      accent: 'var(--cyb)',

      exShowroom: 8249800,

      resaleLadder: [80, 70, 60, 45, 35],

      sourceTaxRate: 34
    }
  ]
};
