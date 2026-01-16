
    (function () {
      const $ = (sel, root = document) => root.querySelector(sel);
      const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

      // Year
      const yearEl = $("#year");
      if (yearEl) yearEl.textContent = new Date().getFullYear();

      // Mobile menu
      const menuBtn = $("#menuBtn");
      const mobileMenu = $("#mobileMenu");
      if (menuBtn && mobileMenu) {
        menuBtn.addEventListener("click", () => {
          const isOpen = !mobileMenu.classList.contains("hidden");
          mobileMenu.classList.toggle("hidden");
          menuBtn.setAttribute("aria-expanded", String(!isOpen));
        });
        // Close menu when link clicked
        $$("#mobileMenu a").forEach(a => a.addEventListener("click", () => {
          mobileMenu.classList.add("hidden");
          menuBtn.setAttribute("aria-expanded", "false");
        }));
      }

      // Modal helpers
      function openModal(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      }
      function closeModal(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add("hidden");
        document.body.style.overflow = "";
      }

      $$("[data-open]").forEach(btn => btn.addEventListener("click", () => openModal(btn.getAttribute("data-open"))));
      $$("[data-close]").forEach(btn => btn.addEventListener("click", () => closeModal(btn.getAttribute("data-close"))));

      // Close on ESC
      document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        ["cartModal", "privacyModal", "cookieModal"].forEach(closeModal);
      });

      // Close on backdrop click (safer than matching class string)
      ["cartModal", "privacyModal", "cookieModal"].forEach(id => {
        const modal = document.getElementById(id);
        if (!modal) return;
        const backdrop = modal.firstElementChild; // first child is the dark overlay
        modal.addEventListener("click", (e) => {
          if (e.target === backdrop) closeModal(id);
        });
      });

      // ================= CART =================
      const CART_KEY = "fb_cart_v1";
      const cartBadge = $("#cartBadge");
      const cartBadgeMobile = $("#cartBadgeMobile");
      const cartItemsEl = $("#cartItems");
      const cartTotalEl = $("#cartTotal");

      function readCart() {
        try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
        catch { return []; }
      }
      function writeCart(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); }
      function cartCount(items) { return items.reduce((sum, it) => sum + (it.qty || 1), 0); }
      function cartTotal(items) { return items.reduce((sum, it) => sum + (it.price * (it.qty || 1)), 0); }
      function formatGHS(n) { return "₵" + Number(n).toFixed(2); }

      function renderCart() {
        const items = readCart();
        const count = cartCount(items);

        if (cartBadge) cartBadge.textContent = count;
        if (cartBadgeMobile) cartBadgeMobile.textContent = count;

        if (!cartItemsEl || !cartTotalEl) return;

        cartItemsEl.innerHTML = "";
        if (!items.length) {
          cartItemsEl.innerHTML = `
            <div class="p-4 rounded-2xl border border-black/5 text-sm text-black/70">
              Your cart is empty. Add a bouquet to get started.
            </div>
          `;
          cartTotalEl.textContent = formatGHS(0);
          return;
        }

        items.forEach((it) => {
          const row = document.createElement("div");
          row.className = "p-4 rounded-2xl border border-black/5 flex items-center justify-between gap-4 hover:shadow-soft transition";

          row.innerHTML = `
            <div>
              <p class="font-extrabold text-fb.ink">${it.name}</p>
              <p class="text-xs text-black/60 mt-1">${formatGHS(it.price)} • Qty: ${it.qty}</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="w-10 h-10 rounded-xl border border-black/10 hover:border-fb.primary/30 hover:shadow-soft transition" aria-label="Decrease quantity">-</button>
              <button class="w-10 h-10 rounded-xl border border-black/10 hover:border-fb.primary/30 hover:shadow-soft transition" aria-label="Increase quantity">+</button>
              <button class="w-10 h-10 rounded-xl border border-black/10 hover:border-red-400/50 hover:shadow-soft transition" aria-label="Remove item">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          `;

          const [decBtn, incBtn, rmBtn] = row.querySelectorAll("button");

          decBtn.addEventListener("click", () => {
            const cart = readCart();
            const idx = cart.findIndex(x => x.id === it.id);
            if (idx > -1) {
              cart[idx].qty = Math.max(1, (cart[idx].qty || 1) - 1);
              writeCart(cart);
              renderCart();
            }
          });

          incBtn.addEventListener("click", () => {
            const cart = readCart();
            const idx = cart.findIndex(x => x.id === it.id);
            if (idx > -1) {
              cart[idx].qty = (cart[idx].qty || 1) + 1;
              writeCart(cart);
              renderCart();
            }
          });

          rmBtn.addEventListener("click", () => {
            const cart = readCart().filter(x => x.id !== it.id);
            writeCart(cart);
            renderCart();
          });

          cartItemsEl.appendChild(row);
        });

        cartTotalEl.textContent = formatGHS(cartTotal(items));
      }

      // Add-to-cart
      $$("[data-add-to-cart]").forEach(btn => {
        btn.addEventListener("click", () => {
          const data = JSON.parse(btn.getAttribute("data-add-to-cart"));
          const cart = readCart();
          const existing = cart.find(x => x.id === data.id);
          if (existing) existing.qty = (existing.qty || 1) + 1;
          else cart.push({ ...data, qty: 1 });
          writeCart(cart);
          renderCart();

          // micro feedback
          btn.classList.add("scale-[0.99]");
          setTimeout(() => btn.classList.remove("scale-[0.99]"), 150);
        });
      });

      function openCart() { openModal("cartModal"); renderCart(); }
      $("#cartBtn")?.addEventListener("click", openCart);
      $("#cartBtnMobile")?.addEventListener("click", openCart);

      $("#clearCartBtn")?.addEventListener("click", () => { writeCart([]); renderCart(); });

      // ================= PAYMENT METHOD TOGGLE =================
      const momoFields = $("#momoFields");
      const momoNumberEl = $("#momoNumber");
      const momoProviderEl = $("#momoProvider");

      function selectedPaymentMethod() {
        const checked = document.querySelector('input[name="paymentMethod"]:checked');
        return checked ? checked.value : "momo";
      }

      function syncMomoVisibility() {
        if (!momoFields) return;
        momoFields.style.display = selectedPaymentMethod() === "momo" ? "block" : "none";
      }

      $$('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener("change", syncMomoVisibility);
      });

      syncMomoVisibility();

      // Checkout: WhatsApp (functional for both modes)
      $("#checkoutBtn")?.addEventListener("click", () => {
        const phone = "233204738137";
        const items = readCart();
        const total = cartTotal(items);
        if (!items.length) return;

        const method = selectedPaymentMethod();

        const lines = items.map(it => `• ${it.name} x${it.qty} — ${formatGHS(it.price * it.qty)}`);

        let message = `Hello Flower Bar,\n\nI would like to order:\n${lines.join("\n")}\n\nEstimated total: ${formatGHS(total)}\nDelivery area: (type here)\nName: (type here)`;

        if (method === "momo") {
          const momoNumber = (momoNumberEl?.value || "").trim();
          const momoProvider = (momoProviderEl?.value || "").trim();

          if (!momoNumber) {
            alert("Please enter your Mobile Money number to proceed.");
            momoNumberEl?.focus();
            return;
          }

          message += `\n\nPayment method: Mobile Money\nMoMo Provider: ${momoProvider}\nMoMo Number: ${momoNumber}\n\nPlease send payment instructions.`;
        } else {
          message += `\n\nPayment method: WhatsApp Order (Pay on Delivery)`;
        }

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank", "noopener");
      });

      // ================= CONTACT FORM =================
      $("#contactForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = $("#name")?.value.trim();
        const email = $("#email")?.value.trim();
        const message = $("#message")?.value.trim();
        if (!name || !email || !message) {
          alert("Please complete all required fields (Name, Email, Message).");
          return;
        }
        alert("Thank you. Your message has been received. We will respond shortly.");
        e.target.reset();
      });

      // ================= COOKIE CONSENT =================
      const CONSENT_KEY = "fb_cookie_consent_v1";
      const cookieBanner = $("#cookieBanner");
      const analyticsToggle = $("#analyticsToggle");
      const analyticsTrack = $("#analyticsTrack");
      const analyticsKnob = $("#analyticsKnob");

      function readConsent() {
        try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); }
        catch { return null; }
      }
      function writeConsent(consent) { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); }

      function setAnalyticsToggleUI(on) {
        if (!analyticsToggle || !analyticsTrack || !analyticsKnob) return;
        analyticsToggle.checked = !!on;
        analyticsTrack.classList.toggle("bg-fb.primary", !!on);
        analyticsTrack.classList.toggle("bg-black/10", !on);
        analyticsKnob.style.transform = on ? "translateX(20px)" : "translateX(0px)";
      }

      function showBannerIfNeeded() {
        const consent = readConsent();
        if (!consent && cookieBanner) cookieBanner.classList.remove("hidden");
      }

      $("#cookieAccept")?.addEventListener("click", () => {
        writeConsent({ choice: "accept", analytics: true });
        cookieBanner?.classList.add("hidden");
        setAnalyticsToggleUI(true);
      });

      $("#cookieReject")?.addEventListener("click", () => {
        writeConsent({ choice: "reject", analytics: false });
        cookieBanner?.classList.add("hidden");
        setAnalyticsToggleUI(false);
      });

      $("#cookieSettings")?.addEventListener("click", () => openModal("cookieModal"));

      $("#saveCookiePrefs")?.addEventListener("click", () => {
        const analytics = !!analyticsToggle?.checked;
        writeConsent({ choice: "custom", analytics });
        closeModal("cookieModal");
        cookieBanner?.classList.add("hidden");
      });

      document.addEventListener("click", (e) => {
        const btn = e.target.closest('[data-open="cookieModal"]');
        if (!btn) return;
        const consent = readConsent();
        setAnalyticsToggleUI(consent?.analytics ?? false);
      });

      analyticsToggle?.addEventListener("change", () => setAnalyticsToggleUI(analyticsToggle.checked));

      // Init
      renderCart();
      const consent = readConsent();
      setAnalyticsToggleUI(consent?.analytics ?? false);
      showBannerIfNeeded();
    })();
  