// ==UserScript==
// @name         MouseHunt - TEM Catch Stats
// @author       Tran Situ (tsitu)
// @namespace    https://greasyfork.org/en/users/232363-tsitu
// @version      1.8
// @description  Adds catch/crown statistics next to mouse names on the TEM
// @match        http://www.mousehuntgame.com/*
// @match        https://www.mousehuntgame.com/*
// ==/UserScript==

(function () {
  // Observers are attached to a *specific* element (will DC if removed from DOM)
  const observerTarget = document.querySelector(
    ".mousehuntHud-page-tabContentContainer"
  );
  if (observerTarget) {
    MutationObserver =
      window.MutationObserver ||
      window.WebKitMutationObserver ||
      window.MozMutationObserver;

    const observer = new MutationObserver(function () {
      // Callback
      const labels = document.getElementsByClassName(
        "campPage-trap-trapEffectiveness-difficultyGroup-label"
      );

      // Render if difficulty labels are in DOM
      if (labels.length > 0) {
        // Disconnect and reconnect later to prevent infinite mutation loop
        observer.disconnect();

        // Clear out old elements
        // Uses static collection instead of live one from getElementsByClassName
        document
          .querySelectorAll(".tsitu-tem-catches")
          .forEach(el => el.remove());

        render();

        observer.observe(observerTarget, {
          childList: true,
          subtree: true
        });
      }
    });

    observer.observe(observerTarget, {
      childList: true,
      subtree: true
    });
  }

  function postReq(form) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://www.mousehuntgame.com/managers/ajax/users/profiletabs.php?action=badges&snuid=${user.sn_user_id}`,
        true
      );
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          resolve(this);
        }
      };
      xhr.onerror = function () {
        reject(this);
      };
      xhr.send(form);
    });
  }

  function render() {
    // Expand container height so that overflow scrollbars don't impact the crown count formatting
    const blueprintContainer = document.querySelector('.campPage-trap-blueprintContainer');
    blueprintContainer.style.height = "100%";
    
    // Track crown counts
    let mouseCount = 0;
    const crownYes = {
      bronze: [0, "#b75935"],
      silver: [0, "#778aa2"],
      gold: [0, "#df7113"],
      platinum: [0, "#3f4682"],
      diamond: [0, "#79aebd"]
    };
    const crownNo = {
      bronze: [0, "#b75935"],
      silver: [0, "#778aa2"],
      gold: [0, "#df7113"],
      platinum: [0, "#3f4682"],
      diamond: [0, "#79aebd"]
    };

    // Render crown image and catch number next to mouse name
    const rawStore = localStorage.getItem("mh-catch-stats");
    if (rawStore) {
      const stored = JSON.parse(rawStore);

      // Clean up ' Mouse' affixes
      const newStored = {};
      const storedKeys = Object.keys(stored);
      storedKeys.forEach(key => {
        if (key.indexOf(" Mouse") >= 0) {
          const newKey = key.split(" Mouse")[0];
          newStored[newKey] = stored[key];
        } else {
          newStored[key] = stored[key];
        }
      });

      const rows = document.querySelectorAll(
        ".campPage-trap-trapEffectiveness-mouse-name"
      );

      if (rows) {
        // Initial auto container height
        document
          .querySelectorAll(".campPage-trap-trapEffectiveness-mouse")
          .forEach(el => {
            el.style.height = "auto";
          });

        rows.forEach(row => {
          const name = row.textContent;
          const catches = newStored[name];

          const span = document.createElement("span");
          span.className = "tsitu-tem-catches";

          const outer = document.createElement("span");
          outer.className = "mousebox";
          outer.style.width = "auto";
          outer.style.height = "auto";
          outer.style.margin = "0px";
          outer.style.paddingRight = "8px";
          outer.style.float = "none";

          const crownImg = document.createElement("img");
          crownImg.style.width = "20px";
          crownImg.style.height = "20px";
          crownImg.style.top = "5px";
          crownImg.style.right = "-5px";
          crownImg.style.position = "relative";

          function getCrownSrc(type) {
            return `https://www.mousehuntgame.com/images/ui/crowns/crown_${type}.png`;
          }

          if (!catches || catches < 10) {
            crownImg.src = getCrownSrc("none");
            crownNo.bronze[0] += 1;
            crownNo.silver[0] += 1;
            crownNo.gold[0] += 1;
            crownNo.platinum[0] += 1;
            crownNo.diamond[0] += 1;
          } else if (catches >= 10 && catches < 100) {
            crownImg.src = getCrownSrc("bronze");
            crownYes.bronze[0] += 1;
            crownNo.silver[0] += 1;
            crownNo.gold[0] += 1;
            crownNo.platinum[0] += 1;
            crownNo.diamond[0] += 1;
          } else if (catches >= 100 && catches < 500) {
            crownImg.src = getCrownSrc("silver");
            crownYes.bronze[0] += 1;
            crownYes.silver[0] += 1;
            crownNo.gold[0] += 1;
            crownNo.platinum[0] += 1;
            crownNo.diamond[0] += 1;
          } else if (catches >= 500 && catches < 1000) {
            crownImg.src = getCrownSrc("gold");
            crownYes.bronze[0] += 1;
            crownYes.silver[0] += 1;
            crownYes.gold[0] += 1;
            crownNo.platinum[0] += 1;
            crownNo.diamond[0] += 1;
          } else if (catches >= 1000 && catches < 2500) {
            crownImg.src = getCrownSrc("platinum");
            crownYes.bronze[0] += 1;
            crownYes.silver[0] += 1;
            crownYes.gold[0] += 1;
            crownYes.platinum[0] += 1;
            crownNo.diamond[0] += 1;
          } else if (catches >= 2500) {
            crownImg.src = getCrownSrc("diamond");
            crownYes.bronze[0] += 1;
            crownYes.silver[0] += 1;
            crownYes.gold[0] += 1;
            crownYes.platinum[0] += 1;
            crownYes.diamond[0] += 1;
          }

          mouseCount += 1;
          outer.innerText = catches || 0;
          outer.appendChild(crownImg);
          span.appendChild(document.createElement("br"));
          span.appendChild(outer);
          row.appendChild(span);
        });

        // Readjust heights after the fact
        document
          .querySelectorAll(".campPage-trap-trapEffectiveness-mouse")
          .forEach(el => {
            el.style.height = `${el.offsetHeight + 2}px`;
          });
      }
    }

    const bottomDiv = document.createElement("div");
    bottomDiv.className = "tsitu-tem-catches";
    bottomDiv.style.textAlign = "center";

    // Render 2 crown count rows of icons
    const userStatWrapper = document.createElement("table");
    userStatWrapper.className = "mousehuntHud-userStat tsitu-tem-catches";
    userStatWrapper.style.borderCollapse = "separate";
    userStatWrapper.style.borderSpacing = "0 1em";
    userStatWrapper.style.marginRight = "3.8em";

    function generateIcons(obj, row, isYes) {
      const descTd = document.createElement("td");
      descTd.style.paddingRight = "6px";
      descTd.style.fontSize = "13px";
      if (isYes) {
        descTd.innerText = "✔️";
      } else {
        descTd.innerText = "❌";
      }
      row.append(descTd);

      Object.keys(obj).forEach(key => {
        const el = obj[key];
        const td = document.createElement("td");
        td.style.paddingRight = "6px";

        const span = document.createElement("div");
        span.className = "notification active";
        span.style.position = "initial";
        span.style.background = el[1];
        span.style.width = "14px";
        span.style.padding = "3px";
        span.style.fontSize = "11px";
        span.style.fontWeight = "bold";
        span.innerText = el[0];

        if (isYes) {
          span.title = `${el[0]}/${mouseCount} ${key} crowns earned in this TEM configuration`;
        } else {
          span.title = `${el[0]}/${mouseCount} ${key} crowns missing in this TEM configuration`;
        }

        span.onclick = function (event) {
          event.stopPropagation(); // Prevent bubbling up
          alert(span.title);
          return false;
        };

        td.appendChild(span);
        row.append(td);
      });
    }

    const yesRow = document.createElement("tr");
    const noRow = document.createElement("tr");
    generateIcons(crownYes, yesRow, true);
    generateIcons(crownNo, noRow, false);
    userStatWrapper.appendChild(yesRow);
    userStatWrapper.appendChild(noRow);
    bottomDiv.appendChild(userStatWrapper);
    bottomDiv.appendChild(document.createElement("br"));
    bottomDiv.appendChild(document.createElement("br"));

    // Render 'Refresh Data' button
    const refreshButton = document.createElement("button");
    refreshButton.id = "tem-catches-refresh-button";
    refreshButton.innerText = "Refresh Crown Data";
    refreshButton.addEventListener("click", function () {
      postReq("sn=Hitgrab&hg_is_ajax=1").then(res => {
        parseData(res);
      });
    });
    bottomDiv.appendChild(refreshButton);

    const timeRaw = localStorage.getItem("mh-catch-stats-timestamp");
    if (timeRaw) {
      const timeSpan = document.createElement("span");
      timeSpan.style.fontSize = "14px";
      timeSpan.innerText = `(Last refreshed: ${new Date(
        parseInt(timeRaw)
      ).toLocaleString()})`;
      bottomDiv.appendChild(document.createElement("br"));
      bottomDiv.appendChild(document.createElement("br"));
      bottomDiv.appendChild(timeSpan);
    }

    const container = document.getElementsByClassName(
      "campPage-trap-trapEffectiveness-content"
    )[0];
    if (container) container.appendChild(bottomDiv);
  }

  /**
   * Parse badge endpoint response and write to localStorage
   * @param {string} res
   */
  function parseData(res) {
    let response = null;
    try {
      if (res) {
        response = JSON.parse(res.responseText);
        const badgeData = response["mouse_data"];
        const remainData = response["remaining_mice"];
        const catchData = {};

        for (let key of Object.keys(badgeData)) {
          catchData[badgeData[key]["name"]] = badgeData[key]["num_catches"];
        }

        for (let el of remainData) {
          const split = el["name"].split(" (");
          catchData[split[0]] = parseInt(split[1][0]);
        }

        localStorage.setItem("mh-catch-stats", JSON.stringify(catchData));
        localStorage.setItem("mh-catch-stats-timestamp", Date.now());

        // Close and reopen to update badges (prevents infinite render loop)
        app.pages.CampPage.closeBlueprintDrawer();
        app.pages.CampPage.toggleTrapEffectiveness(true);
      }
    } catch (error) {
      console.log("Error while processing POST response");
      console.error(error.stack);
    }
  }
})();
