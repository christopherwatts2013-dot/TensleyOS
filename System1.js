/* ============================================================
   System1.js — Tensley OS 3 Override + Steam Virtual Installer
   ============================================================ */

/* ===========================
   1. Virtual Filesystem
   =========================== */

window.System1FS = {
  root: {
    Desktop: {},
    Documents: {},
    Downloads: {},
    Programs: {},
    Music: {},
    Pictures: {},
    Videos: {}
  },

  save() {
    localStorage.setItem("system1_fs", JSON.stringify(this.root));
  },

  load() {
    const raw = localStorage.getItem("system1_fs");
    if (raw) {
      try { this.root = JSON.parse(raw); }
      catch { this.save(); }
    } else {
      this.save();
    }
  },

  folder(path) {
    const parts = path.split("/");
    let cur = this.root;
    for (const p of parts) {
      if (!cur[p]) return null;
      cur = cur[p];
    }
    return cur;
  },

  list(path) {
    const f = this.folder(path);
    if (!f) return [];
    return Object.keys(f).map(name => ({ name, ...f[name] }));
  },

  create(path, name, type = "file", content = "") {
    const f = this.folder(path);
    if (!f) return false;
    f[name] = { type, content };
    this.save();
    return true;
  },

  write(path, name, content) {
    const f = this.folder(path);
    if (!f || !f[name]) return false;
    f[name].content = content;
    this.save();
    return true;
  },

  read(path, name) {
    const f = this.folder(path);
    if (!f || !f[name]) return null;
    return f[name].content;
  },

  delete(path, name) {
    const f = this.folder(path);
    if (!f || !f[name]) return false;
    delete f[name];
    this.save();
    return true;
  }
};

System1FS.load();

/* AUTO-IMPORT STEAM INSTALLER INTO VIRTUAL DOWNLOADS */
(function() {
  if (!System1FS.root.Downloads["SteamSetup.exe"]) {
    System1FS.root.Downloads["SteamSetup.exe"] = {
      type: "file",
      content: "steam-installer"
    };
    System1FS.save();
    console.log("System1: SteamSetup.exe imported into virtual Downloads.");
  }
})();

/* ===========================
   2. Notifications Override
   =========================== */

window.notify = function(text) {
  const box = document.createElement("div");
  box.style.position = "absolute";
  box.style.right = "20px";
  box.style.bottom = "20px";
  box.style.background = "#333";
  box.style.color = "#eee";
  box.style.padding = "10px 14px";
  box.style.borderRadius = "6px";
  box.style.boxShadow = "0 0 10px #000";
  box.style.opacity = "0";
  box.style.transition = "opacity .3s";
  box.textContent = text;

  document.body.appendChild(box);

  setTimeout(() => box.style.opacity = "1", 10);
  setTimeout(() => {
    box.style.opacity = "0";
    setTimeout(() => box.remove(), 300);
  }, 3000);
};

/* ===========================
   3. Taskbar Override
   =========================== */

window.addEventListener("DOMContentLoaded", () => {
  const bar = document.getElementById("taskbar");
  if (!bar) return;

  bar.innerHTML = "";

  const wifi = document.createElement("div");
  wifi.textContent = "📶";
  wifi.style.marginRight = "10px";

  const battery = document.createElement("div");
  battery.textContent = "🔋";
  battery.style.marginRight = "10px";

  const volume = document.createElement("div");
  volume.textContent = "🔊";
  volume.style.marginRight = "10px";

  const clock = document.createElement("div");
  clock.style.marginLeft = "auto";
  clock.style.opacity = "0.8";

  bar.appendChild(wifi);
  bar.appendChild(battery);
  bar.appendChild(volume);
  bar.appendChild(clock);

  setInterval(() => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, 1000);
});

/* ===========================
   4. App Registry
   =========================== */

window.System1Apps = {
  list: {},

  register(id, name, icon, launcher) {
    this.list[id] = { id, name, icon, launcher };
  },

  launch(id) {
    const app = this.list[id];
    if (!app) {
      notify("App not found: " + id);
      return;
    }
    app.launcher();
  }
};

/* ===========================
   5. Desktop Override
   =========================== */

window.addEventListener("DOMContentLoaded", () => {
  const desktop = document.getElementById("desktop");
  if (!desktop) return;

  desktop.innerHTML = "";

  addSystem1Icon("🧮", "Calculator", () => System1Apps.launch("calculator"));
  addSystem1Icon("📝", "Notes", () => System1Apps.launch("notes"));
  addSystem1Icon("⌨️", "Terminal", () => System1Apps.launch("terminal"));
  addSystem1Icon("📁", "File Explorer", () => System1Apps.launch("file_explorer"));
  addSystem1Icon("🐍", "Snake", () => System1Apps.launch("snake"));
  addSystem1Icon("🌐", "Browser", () => System1Apps.launch("browser"));
  addSystem1Icon("🎵", "Music", () => System1Apps.launch("music"));
  addSystem1Icon("🛒", "App Store", () => System1Apps.launch("app_store"));
  addSystem1Icon("🎮", "Steam", () => System1Apps.launch("steam"));
});

function addSystem1Icon(icon, name, launch) {
  const desktop = document.getElementById("desktop");
  const div = document.createElement("div");
  div.className = "icon";
  div.innerHTML = `
    <div class="icon-box">${icon}</div>
    ${name}
  `;
  div.addEventListener("dblclick", launch);
  desktop.appendChild(div);
}

/* ===========================
   6. Window Helper
   =========================== */

function createSystem1Window(title, width = 600, height = 400) {
  const layer = document.getElementById("window-layer") || document.body;
  const win = document.createElement("div");
  win.className = "system1-window";
  win.style.position = "absolute";
  win.style.left = "50px";
  win.style.top = "50px";
  win.style.width = width + "px";
  win.style.height = height + "px";
  win.style.background = "#111";
  win.style.color = "#eee";
  win.style.border = "1px solid #444";
  win.style.boxShadow = "0 0 10px #000";
  win.style.display = "flex";
  win.style.flexDirection = "column";

  const titleBar = document.createElement("div");
  titleBar.style.background = "#222";
  titleBar.style.padding = "6px 10px";
  titleBar.style.display = "flex";
  titleBar.style.alignItems = "center";

  const titleSpan = document.createElement("div");
  titleSpan.textContent = title;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.style.marginLeft = "auto";
  closeBtn.style.background = "#400";
  closeBtn.style.color = "#fff";
  closeBtn.style.border = "none";
  closeBtn.style.cursor = "pointer";
  closeBtn.addEventListener("click", () => win.remove());

  titleBar.appendChild(titleSpan);
  titleBar.appendChild(closeBtn);

  const content = document.createElement("div");
  content.style.flex = "1";
  content.style.background = "#111";
  content.style.padding = "8px";
  content.style.overflow = "auto";

  win.appendChild(titleBar);
  win.appendChild(content);
  layer.appendChild(win);

  return content;
}

/* ===========================
   7. File Explorer Override
   =========================== */

System1Apps.register("file_explorer", "File Explorer", "📁", () => {
  const content = createSystem1Window("System1 File Explorer", 700, 450);

  let currentPath = "Desktop";

  const pathBar = document.createElement("div");
  pathBar.style.marginBottom = "8px";
  const pathInput = document.createElement("input");
  pathInput.value = currentPath;
  pathInput.style.width = "60%";
  const goBtn = document.createElement("button");
  goBtn.textContent = "Go";

  pathBar.appendChild(pathInput);
  pathBar.appendChild(goBtn);
  content.appendChild(pathBar);

  const listArea = document.createElement("div");
  content.appendChild(listArea);

  function render() {
    listArea.innerHTML = "";
    const items = System1FS.list(currentPath);
    if (!items.length) {
      listArea.textContent = "(empty)";
      return;
    }
    items.forEach(item => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.padding = "4px 0";
      row.style.borderBottom = "1px solid #333";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = item.name + (item.type === "folder" ? "/" : "");

      const actions = document.createElement("div");

      const openBtn = document.createElement("button");
      openBtn.textContent = "Open";
      openBtn.addEventListener("click", () => handleOpen(item));

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        System1FS.delete(currentPath, item.name);
        render();
      });

      actions.appendChild(openBtn);
      actions.appendChild(delBtn);

      row.appendChild(nameSpan);
      row.appendChild(actions);
      listArea.appendChild(row);
    });
  }

  function handleOpen(item) {
    if (item.type === "folder") {
      currentPath = currentPath + "/" + item.name;
      pathInput.value = currentPath;
      render();
      return;
    }

    if (item.name.toLowerCase() === "steamsetup.exe") {
      runSteamInstaller();
      return;
    }

    const ext = item.name.split(".").pop().toLowerCase();
    if (ext === "txt") {
      System1Apps.launch("notes");
      notify("Opening " + item.name + " in Notes");
    } else if (ext === "mp3") {
      System1Apps.launch("music");
      notify("Playing " + item.name + " in Music");
    } else {
      notify("No handler for " + item.name);
    }
  }

  goBtn.addEventListener("click", () => {
    currentPath = pathInput.value;
    render();
  });

  render();
});

/* ===========================
   8. Steam Virtual Installer
   =========================== */

function runSteamInstaller() {
  const content = createSystem1Window("Steam Installer (System1)", 500, 300);

  const msg = document.createElement("div");
  msg.textContent = "Install Steam inside Tensley OS 3?";
  msg.style.marginBottom = "12px";

  const installBtn = document.createElement("button");
  installBtn.textContent = "Install Steam";
  installBtn.style.marginRight = "10px";

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";

  content.appendChild(msg);
  content.appendChild(installBtn);
  content.appendChild(cancelBtn);

  installBtn.addEventListener("click", () => {
    if (!System1FS.folder("Programs")) System1FS.root.Programs = {};
    System1FS.create("Programs", "Steam", "folder", "");
    System1FS.create("Programs/Steam", "steam.json", "file", JSON.stringify({
      name: "Steam",
      version: "System1-virtual",
      type: "virtual-client"
    }));

    notify("Steam installed inside Tensley OS 3");
    System1Apps.register("steam", "Steam", "🎮", launchSteamClient);
    content.parentElement.remove();
  });

  cancelBtn.addEventListener("click", () => {
    content.parentElement.remove();
  });
}

/* ===========================
   9. Steam Client (Web-style)
   =========================== */

function launchSteamClient() {
  const content = createSystem1Window("Steam (System1 Virtual Client)", 900, 600);

  const info = document.createElement("div");
  info.textContent = "This is a virtual Steam client inside Tensley OS 3.";
  info.style.marginBottom = "8px";

  const iframe = document.createElement("iframe");
  iframe.src = "https://store.steampowered.com/";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";

  content.appendChild(info);
  content.appendChild(iframe);
}

/* ===========================
   10. App Store Override (with Steam)
   =========================== */

System1Apps.register("app_store", "App Store", "🛒", () => {
  const content = createSystem1Window("System1 App Store", 700, 450);

  content.innerHTML = `
    <h2 style="margin-bottom:10px;">System1 App Store</h2>

    <div class="app-entry" style="padding:10px; border-bottom:1px solid #333;">
      <strong>Steam</strong><br>
      <span style="opacity:0.7;">Virtual Steam Client</span><br><br>
      <button id="install-steam-btn">Install</button>
    </div>

    <div class="app-entry" style="padding:10px; border-bottom:1px solid #333;">
      <strong>Browser</strong><br>
      <span style="opacity:0.7;">System1 Web Browser</span><br><br>
      <button id="open-browser-btn">Open</button>
    </div>

    <div class="app-entry" style="padding:10px; border-bottom:1px solid #333;">
      <strong>Notes</strong><br>
      <span style="opacity:0.7;">Simple text notes</span><br><br>
      <button id="open-notes-btn">Open</button>
    </div>
  `;

  const installSteamBtn = document.getElementById("install-steam-btn");
  if (installSteamBtn) {
    installSteamBtn.addEventListener("click", () => {
      runSteamInstaller();
    });
  }

  const openBrowserBtn = document.getElementById("open-browser-btn");
  if (openBrowserBtn) {
    openBrowserBtn.addEventListener("click", () => {
      System1Apps.launch("browser");
    });
  }

  const openNotesBtn = document.getElementById("open-notes-btn");
  if (openNotesBtn) {
    openNotesBtn.addEventListener("click", () => {
      System1Apps.launch("notes");
    });
  }
});

/* ===========================
   11. Other App Placeholders
   =========================== */

System1Apps.register("calculator", "Calculator", "🧮", () => {
  const content = createSystem1Window("Calculator", 300, 300);
  content.textContent = "Calculator (System1 placeholder)";
});

System1Apps.register("notes", "Notes", "📝", () => {
  const content = createSystem1Window("Notes", 500, 400);
  const textarea = document.createElement("textarea");
  textarea.style.width = "100%";
  textarea.style.height = "100%";
  content.appendChild(textarea);
});

System1Apps.register("terminal", "Terminal", "⌨️", () => {
  const content = createSystem1Window("Terminal", 600, 400);
  content.textContent = "Terminal (System1 placeholder)";
});

System1Apps.register("snake", "Snake", "🐍", () => {
  const content = createSystem1Window("Snake", 400, 400);
  content.textContent = "Snake (System1 placeholder)";
});

System1Apps.register("browser", "Browser", "🌐", () => {
  const content = createSystem1Window("Browser", 900, 600);
  const iframe = document.createElement("iframe");
  iframe.src = "https://www.google.com/";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  content.appendChild(iframe);
});

System1Apps.register("music", "Music", "🎵", () => {
  const content = createSystem1Window("Music", 500, 400);
  content.textContent = "Music Player (System1 placeholder)";
});

/* ===========================
   System1.js END
   =========================== */
