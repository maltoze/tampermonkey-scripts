// ==UserScript==
// @name         hipda-img-paster
// @namespace    https://github.com/maltoze/tampermonkey-scripts
// @version      0.1.0
// @description  支持在输入框粘贴图片
// @author       maltoze
// @match        https://www.hi-pda.com/forum/*
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  const BASE_URL = 'https://www.hi-pda.com/forum/';
  const IMG_UPLOAD_URL = `${BASE_URL}misc.php?action=swfupload&operation=upload&simple=1&type=image`;
  const postTime = new Date().getTime() / 1000;
  const IMG_LIST_URL = `${BASE_URL}ajax.php?action=imagelist&pid=NaN&posttime=${postTime.toFixed()}&inajax=1&ajaxtarget=imgattachlist`;
  const COMMON_OPTIONS = { credentials: 'same-origin' };

  function uploadImg(imgFile) {
    const userSpaceEl = document.querySelector('#umenu > cite > a');
    if (!userSpaceEl) return;

    const uidMatch = userSpaceEl.href.match(/uid=(\d+)/);
    if (!uidMatch) return;

    const hashInputEl = document.querySelector('input[name=hash]');
    if (!hashInputEl) return;

    const formData = new FormData();
    formData.append('uid', uidMatch[1]);
    formData.append('hash', hashInputEl.value);
    formData.append('Filedata', imgFile, 'image.png');
    console.log(formData);

    return fetch(IMG_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      ...COMMON_OPTIONS,
    });
  }

  async function getImgUrl(imgId) {
    const resp = await fetch(IMG_LIST_URL, COMMON_OPTIONS);
    const respText = await resp.text();
    const urlMatch = respText.match(
      new RegExp(String.raw`<img.*src="([\w\/\.]+)".*id="image_${imgId}"`),
    );
    if (urlMatch) return urlMatch[1];
  }

  async function handleOnPaste(event) {
    const clipboardItems = event.clipboardData.items;
    const items = [].slice.call(clipboardItems).filter(function (item) {
      // Filter the image items only
      return item.type.indexOf('image') !== -1;
    });
    if (items.length === 0) {
      return;
    }

    event.preventDefault();
    const bodyEl = document.querySelector('#e_iframe').contentDocument.body;
    const tmpEl = document.createElement('span');
    tmpEl.innerText = '上传中...';
    bodyEl.append(tmpEl);

    const item = items[0];
    const resp = await uploadImg(item.getAsFile());
    const respText = await resp.text();
    // DISCUZUPLOAD|0|123456|0
    const imgId = respText.split('|')[2];
    const imgUrl = await getImgUrl(imgId);

    tmpEl.remove();

    const imgEl = document.createElement('img');
    imgEl.src = `${BASE_URL}${imgUrl}`;
    bodyEl.append(imgEl);
  }

  function main() {
    const iframeEl = document.getElementById('e_iframe');
    if (iframeEl) {
      iframeEl.contentDocument.body.addEventListener('paste', handleOnPaste);
    }
  }

  main();
})();
