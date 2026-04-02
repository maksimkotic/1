(() => {
  const app = window.__app;
  if (!app) return;

  const q = (sel) => document.querySelector(sel);
  const modal = q("[data-auth-modal]");
  const openBtn = q("[data-auth-open]");
  const logoutBtn = q("[data-auth-logout]");
  const userEl = q("[data-auth-user]");

  const tabLogin = q("[data-auth-tab='login']");
  const tabRegister = q("[data-auth-tab='register']");
  const panelLogin = q("[data-auth-panel='login']");
  const panelRegister = q("[data-auth-panel='register']");

  const alertEl = q("[data-auth-alert]");
  const closeBtn = q("[data-auth-close]");

  let memToken = "";
  const token = () => memToken;
  const setToken = (t) => {
    memToken = String(t || "");
  };
  const clearToken = () => {
    memToken = "";
  };

  try {
    localStorage.removeItem("jwt");
    localStorage.removeItem("JWT");
    localStorage.removeItem("geoeco_token");
  } catch {}

  function setAlert(msg) {
    if (!alertEl) return;
    alertEl.textContent = msg || "";
  }

  function showModal() {
    if (!modal) return;
    modal.hidden = false;
    setAlert("");
    document.body.style.overflow = "hidden";
  }

  function hideModal() {
    if (!modal) return;
    modal.hidden = true;
    setAlert("");
    document.body.style.overflow = "";
  }

  function selectTab(which) {
    const isLogin = which === "login";
    if (tabLogin) tabLogin.setAttribute("aria-selected", String(isLogin));
    if (tabRegister) tabRegister.setAttribute("aria-selected", String(!isLogin));
    if (panelLogin) panelLogin.hidden = !isLogin;
    if (panelRegister) panelRegister.hidden = isLogin;
    setAlert("");
  }

  async function api(path, opts = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    };
    const t = token();
    if (t) headers.Authorization = `Bearer ${t}`;

    const res = await fetch(path, { ...opts, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const code = data?.error || "REQUEST_FAILED";
      throw new Error(code);
    }
    return data;
  }

  function setAuthedUI(user) {
    if (userEl) {
      userEl.hidden = !user;
      userEl.textContent = user ? user.name || user.email : "";
    }
    if (openBtn) openBtn.hidden = !!user;
    if (logoutBtn) logoutBtn.hidden = !user;
  }

  async function refreshMe() {
    const t = token();
    if (!t) {
      setAuthedUI(null);
      return;
    }
    try {
      const data = await api("/api/auth/me", { method: "GET" });
      setAuthedUI(data.user);
    } catch {
      clearToken();
      setAuthedUI(null);
    }
  }

  function wireForm(formSel, endpoint, mapBody) {
    const form = q(formSel);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setAlert("");

      try {
        const body = mapBody(new FormData(form));
        const data = await api(endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        });
        if (data?.token) setToken(data.token);
        await refreshMe();
        hideModal();
        form.reset();
      } catch (err) {
        const code = String(err?.message || "REQUEST_FAILED");
        const map = {
          BAD_REQUEST: "Заполни все поля.",
          PASSWORD_TOO_SHORT: "Пароль должен быть минимум 6 символов.",
          EMAIL_TAKEN: "Этот email уже зарегистрирован.",
          INVALID_CREDENTIALS: "Неверный email или пароль.",
          REQUEST_FAILED: "Не удалось выполнить запрос.",
        };
        setAlert(map[code] || "Ошибка. Проверь данные и повтори.");
      }
    });
  }

  if (openBtn) openBtn.addEventListener("click", (e) => (e.preventDefault(), showModal()));
  if (logoutBtn)
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      clearToken();
      setAuthedUI(null);
    });

  if (closeBtn) closeBtn.addEventListener("click", hideModal);
  if (modal)
    modal.addEventListener("click", (e) => {
      if (e.target === modal) hideModal();
    });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideModal();
  });

  if (tabLogin) tabLogin.addEventListener("click", () => selectTab("login"));
  if (tabRegister) tabRegister.addEventListener("click", () => selectTab("register"));

  wireForm("[data-auth-form='login']", "/api/auth/login", (fd) => ({
    email: String(fd.get("email") || ""),
    password: String(fd.get("password") || ""),
  }));
  wireForm("[data-auth-form='register']", "/api/auth/register", (fd) => ({
    name: String(fd.get("name") || ""),
    email: String(fd.get("email") || ""),
    password: String(fd.get("password") || ""),
  }));

  selectTab("login");
  refreshMe();
})();

