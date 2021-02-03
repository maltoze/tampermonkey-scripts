// ==UserScript==
// @name         hipda-emoji
// @namespace    https://github.com/maltoze
// @version      0.2.0
// @description  HiPDA emoji support
// @author       maltoze
// @match        https://www.hi-pda.com/forum/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const needDecodeEntity = '&amp;';
  Array.from(document.getElementsByClassName('t_msgfont')).forEach((elem) => {
    if (elem.innerHTML.includes(needDecodeEntity)) {
      elem.innerHTML = elem.innerHTML.replaceAll(needDecodeEntity, '&');
    }
  });

  const fastPostSmiliesElem = document.querySelector('#fastpostsmilies');
  const cmdBeforeElem = document.querySelector('#e_cmd_custom1_rm');
  if (!fastPostSmiliesElem && !cmdBeforeElem) {
    return;
  }

  function insertEmojiTrigger(elem, style) {
    elem.insertAdjacentHTML(
      'afterend',
      `<a id="emoji-trigger" style="${style}">😀</a>`,
    );
  }

  fastPostSmiliesElem &&
    insertEmojiTrigger(
      fastPostSmiliesElem,
      'text-indent: 0; background: none; text-decoration: none',
    );
  cmdBeforeElem &&
    insertEmojiTrigger(cmdBeforeElem, 'text-indent: 0; text-align: center');

  const emojiSize = 24;
  function loadEmojiButton() {
    const emojiScript = document.createElement('script');
    emojiScript.type = 'module';
    emojiScript.text = `
      import { EmojiButton } from 'https://cdn.jsdelivr.net/npm/@joeattardi/emoji-button@4.6.0/dist/index.min.js';

      const picker = new EmojiButton({
        style: 'twemoji',
        twemojiOptions: {
          base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@13.0.1/assets/',
        },
      });
      const trigger = document.querySelector('#emoji-trigger');
      const fastPostMessageElem = document.querySelector('#fastpostmessage');
      const postBoxIframe = document.querySelector('#postbox #e_iframe');
      const postBoxBodyElem =
        postBoxIframe && postBoxIframe.contentWindow.document.querySelector('body');

      picker.on('emoji', (selection) => {
        const imgUrl = selection.url;
        if (fastPostMessageElem) {
          fastPostMessageElem.value +=
            '[img=${emojiSize},${emojiSize}]' + imgUrl + '[/img]';
        }
        if (postBoxBodyElem) {
          postBoxBodyElem.innerHTML +=
            '<img width="${emojiSize}" height="${emojiSize}" src=' + imgUrl + ' />';
        }
      });

      trigger.addEventListener('click', () => picker.togglePicker(trigger));
    `;
    document.body.appendChild(emojiScript);
  }

  loadEmojiButton();
})();
