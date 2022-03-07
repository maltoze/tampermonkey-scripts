// ==UserScript==
// @name         hipda-avatar
// @namespace    https://github.com/maltoze/tampermonkey-scripts
// @version      0.1
// @description  在帖子列表显示头像
// @author       maltoze
// @match        https://www.hi-pda.com/forum/forumdisplay.php?fid=*
// @require      https://cdn.jsdelivr.net/npm/lozad/dist/lozad.min.js
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  const AVATAR_BASE = "000000000";
  const FORUM_SERVER_SSL = "https://www.hi-pda.com";
  const BASE_URL = FORUM_SERVER_SSL + "/forum/";
  const SIZE = 24;
  const DEFAULT_AVATAR_PREFIX = `https://ui-avatars.com/api/?background=9287AE&color=fff&size=${SIZE}`;

  async function getAvatarUrl(uid) {
    const avatarBaseUrl = BASE_URL + "uc_server/data/avatar/";
    const fullUid =
      new Array(AVATAR_BASE.length - uid.toString().length + 1).join("0") + uid;
    const str = [
      fullUid.substring(0, 3),
      fullUid.substring(3, 5),
      fullUid.substring(5, 7),
      fullUid.substring(7, 9),
    ].join("/");
    const avatarUrl = avatarBaseUrl + str + "_avatar_small.jpg";
    try {
      const resp = await fetch(avatarUrl, { method: "HEAD" });
      if (resp.ok) {
        return avatarUrl;
      }
    } catch (error) {
      return null;
    }
  }

  async function renderAvatar(imgNode, uid, name) {
    const avatarUrl = await getAvatarUrl(uid);
    if (avatarUrl) {
      imgNode.setAttribute("data-src", avatarUrl);
    } else {
      imgNode.setAttribute(
        "data-src",
        `${DEFAULT_AVATAR_PREFIX}&name=${encodeURIComponent(name)}`
      );
    }
  }

  async function main() {
    const tbodyNodes = document.getElementsByTagName("tbody");
    const promises = [];

    for (const tbodyNode of tbodyNodes) {
      const imgNode = tbodyNode.querySelector("tr > td.folder > a > img");
      const authorNode = tbodyNode.querySelector("tr > td.author > cite > a");
      if (!authorNode || !imgNode) continue;

      imgNode.classList.add("lozad");

      const uidMatch = authorNode.href.match(/uid=(\d+)/);
      if (uidMatch) {
        promises.push(renderAvatar(imgNode, uidMatch[1], authorNode.text));
      }
    }

    promises.length > 0 && (await Promise.all(promises));
    // eslint-disable-next-line no-undef
    const observer = lozad(".lozad", {
      load: function (el) {
        el.src = el.getAttribute("data-src");
        el.width = SIZE;
        el.style.borderRadius = "0.25rem";
      },
    });
    observer.observe();
  }

  main();
})();