// ==UserScript==
// @name         hipda-crate
// @namespace    https://github.com/maltoze/tampermonkey-scripts
// @version      0.1.0
// @description  Popup Discord widgets for HiPDA
// @author       maltoze
// @match        https://www.hi-pda.com/forum/*
// ==/UserScript==

(function () {
  'use strict';
  const crateScript = document.createElement('script');
  crateScript.defer = true;
  crateScript.async = true;
  crateScript.src = 'https://cdn.jsdelivr.net/npm/@widgetbot/crate@3';
  crateScript.text = `
    new Crate({
      server: '808167219858243594',
      channel: '808183308121800745'
    })
  `;
  document.head.appendChild(crateScript);
})();
