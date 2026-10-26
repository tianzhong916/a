(() => {
  const $ = (id) => document.getElementById(id);
  let service = "youtube";
  let danmakuOn = true;
  let deferredInstallPrompt = null;
  let sampleTimer = null;
  const samples = [
    "ｗｗｗｗｗｗｗ", "ナイス！", "888888888888", "それは草", "きたああああ",
    "いいね！", "うおおおお", "助かる", "👏👏👏", "今のうまい！",
    "わかる", "ないすー！", "草ｗｗｗ", "盛り上がってきた！"
  ];

  const serviceButtons = [...document.querySelectorAll(".service")];
  function setService(next) {
    service = next;
    serviceButtons.forEach(b => b.classList.toggle("active", b.dataset.service === service));
    $("currentService").textContent = service === "youtube" ? "YouTube Live" : "Twitch";
    $("streamLabel").textContent = service === "youtube" ? "YouTube動画ID または URL" : "Twitchチャンネル名 または URL";
    $("streamInput").placeholder = service === "youtube" ? "例：動画URLまたは動画ID" : "例：チャンネル名";
    $("inputHint").textContent = service === "youtube"
      ? "ライブ配信のURL、または動画IDを入力するのじゃ。"
      : "Twitchのチャンネル名、またはチャンネルURLを入力するのじゃ。";
    $("playerPlaceholder").querySelector("span").textContent = service === "youtube"
      ? "上の欄にYouTubeの動画URL / IDを入力"
      : "上の欄にTwitchのチャンネル名を入力";
  }
  serviceButtons.forEach(b => b.addEventListener("click", () => setService(b.dataset.service)));

  function getYouTubeId(value) {
    const v = value.trim();
    if (/^[\w-]{11}$/.test(v)) return v;
    try {
      const u = new URL(v);
      if (u.hostname.includes("youtu.be")) return u.pathname.split("/").filter(Boolean)[0] || "";
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const parts = u.pathname.split("/").filter(Boolean);
      const liveIndex = parts.findIndex(p => p === "live" || p === "embed" || p === "shorts");
      if (liveIndex >= 0) return parts[liveIndex + 1] || "";
    } catch (_) {}
    return "";
  }
  function getTwitchChannel(value) {
    let v = value.trim().replace(/^@/, "");
    try {
      if (v.includes("://")) {
        const u = new URL(v);
        const parts = u.pathname.split("/").filter(Boolean);
        v = parts[0] || "";
      }
    } catch (_) {}
    return /^[a-zA-Z0-9_]{1,25}$/.test(v) ? v : "";
  }

  function openStream() {
    const raw = $("streamInput").value.trim();
    $("playerShell").classList.toggle("twitch-mode", service === "twitch");
    if (!raw) {
      $("statusText").textContent = "配信URLまたはIDを入力してください";
      return;
    }
    const mount = $("playerMount");
    mount.innerHTML = "";
    let iframe = document.createElement("iframe");
    iframe.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    if (service === "youtube") {
      const id = getYouTubeId(raw);
      if (!id) {
        $("statusText").textContent = "YouTubeのURLまたは11文字の動画IDを確認してください";
        $("playerPlaceholder").style.display = "flex";
        return;
      }
      iframe.title = "YouTube Live player";
      iframe.src = "https://www.youtube.com/embed/" + encodeURIComponent(id) + "?playsinline=1&rel=0";
      $("statusText").textContent = "YouTubeプレイヤーを読み込み中";
    } else {
      const channel = getTwitchChannel(raw);
      if (!channel) {
        $("statusText").textContent = "Twitchのチャンネル名を確認してください";
        $("playerPlaceholder").style.display = "flex";
        return;
      }
      const parent = location.hostname;
      if (!parent || location.protocol === "file:") {
        $("statusText").textContent = "Twitch埋め込みはローカルファイルから開けません。GitHub Pagesの公開URLをChromeで直接開いてください。";
        $("playerPlaceholder").style.display = "flex";
        return;
      }
      iframe.title = "Twitch player";
      const twitchUrl = new URL("https://player.twitch.tv/");
      twitchUrl.searchParams.set("channel", channel);
      twitchUrl.searchParams.set("parent", parent);
      twitchUrl.searchParams.set("muted", "false");
      iframe.src = twitchUrl.toString();
      $("statusText").textContent = "Twitch埋め込み先: " + parent + "（このドメインをparentに指定しています）";
    }
    mount.appendChild(iframe);
    $("playerPlaceholder").style.display = "none";
    $("overlayLabel").textContent = "サンプル弾幕 · ライブコメント未接続";
    clearInterval(sampleTimer);
    startSamples();
  }

  function spawnComment(text) {
    if (!danmakuOn || !text.trim()) return;
    const layer = $("danmakuLayer");
    const el = document.createElement("div");
    el.className = "danmaku";
    el.textContent = text.slice(0, 80);
    const maxTop = Math.max(24, layer.clientHeight - 30);
    const density = Number($("density").value);
    const top = 12 + Math.random() * Math.max(10, maxTop - 20);
    const speed = Number($("speed").value);
    const font = Number($("fontSize").value);
    const opacity = Number($("opacity").value) / 100;
    const duration = Math.max(5, 22 - speed);
    el.style.top = top + "px";
    el.style.fontSize = font + "px";
    el.style.opacity = opacity;
    el.style.animationDuration = duration + "s";
    layer.appendChild(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
    // Keep the prototype light on low-memory phones.
    while (layer.children.length > 35) layer.firstElementChild.remove();
    return density;
  }

  function startSamples() {
    clearInterval(sampleTimer);
    sampleTimer = setInterval(() => {
      const count = Number($("density").value);
      for (let i = 0; i < count; i++) {
        setTimeout(() => spawnComment(samples[Math.floor(Math.random() * samples.length)]), i * 350);
      }
    }, 1800);
  }

  $("openBtn").addEventListener("click", openStream);
  $("streamInput").addEventListener("keydown", e => { if (e.key === "Enter") openStream(); });
  $("sampleBtn").addEventListener("click", () => {
    const count = Number($("density").value);
    for (let i = 0; i < count + 2; i++) {
      setTimeout(() => spawnComment(samples[Math.floor(Math.random() * samples.length)]), i * 260);
    }
    $("statusText").textContent = "サンプル弾幕を再生中";
  });
  $("toggleDanmaku").addEventListener("click", () => {
    danmakuOn = !danmakuOn;
    $("toggleDanmaku").textContent = danmakuOn ? "弾幕 ON" : "弾幕 OFF";
    $("danmakuLayer").style.display = danmakuOn ? "block" : "none";
    if (danmakuOn) $("danmakuLayer").style.display = "block";
  });
  $("sendBtn").addEventListener("click", () => {
    const value = $("commentInput").value.trim();
    if (!value) return;
    spawnComment(value);
    $("commentInput").value = "";
    $("statusText").textContent = "プレビューコメントを流しました";
  });
  $("commentInput").addEventListener("keydown", e => { if (e.key === "Enter") $("sendBtn").click(); });

  const ranges = [
    ["speed", "speedOut", v => v < 9 ? "ゆっくり" : v > 14 ? "高速" : "標準"],
    ["fontSize", "fontOut", v => v < 19 ? "小" : v > 25 ? "大" : "中"],
    ["opacity", "opacityOut", v => v + "%"],
    ["density", "densityOut", v => ["", "少なめ", "やや少なめ", "標準", "多め", "最大"][v]]
  ];
  ranges.forEach(([id, out, fmt]) => {
    $(id).addEventListener("input", () => $(out).textContent = fmt(Number($(id).value)));
  });

  $("fullscreenBtn").addEventListener("click", async () => {
    const target = $("playerShell");
    try {
      if (!document.fullscreenElement) await target.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) { $("statusText").textContent = "このブラウザでは全画面表示を開始できませんでした"; }
  });

  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredInstallPrompt = e;
    $("installBtn").hidden = false;
  });
  $("installBtn").addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    $("installBtn").hidden = true;
  });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
  startSamples();
})();
