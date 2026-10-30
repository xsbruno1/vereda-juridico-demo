
    (function() {
      function safe(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
      function cash(value){return Math.round(Number(value)*100)/100;}
      function profBalance(id){return Number(getProf(id).initialBalance||0)+state.sessions.filter(s=>s.profId===id&&getSessionFinancials(s).isSettled).reduce((n,s)=>n+getSessionFinancials(s).commission,0)-state.payouts.filter(p=>p.profId===id&&p.method!=="Acumular p/ Data Combinada").reduce((n,p)=>n+p.amount,0);}
      function overlaps(prof,suite,time,key){const start=Number(time.slice(0,2))*60+Number(time.slice(3));return state.sessions.some(s=>{if(!['Em Atendimento','Reservada'].includes(s.sessionStatus))return false;const other=Number(s.startTime.slice(0,2))*60+Number(s.startTime.slice(3));return (s.profId===prof||s.suiteId===suite)&&start<other+state.services[s.serviceKey].duration&&start+state.services[key].duration>other;});}
      // 1. Hero Carousel Data
      const heroSlides = [
        {
          title: "O refúgio onde o tempo desacelera e os sentidos despertam.",
          subtitle: "Suítes privativas climatizadas, iluminação intimista à meia-luz, rituais de relaxamento sob medida e atendimento reservado do agendamento ao encerramento.",
          tag: "Suíte Master & Hidro",
          caption: "Ambiência em mármore, velas e pétalas naturais preparadas antes de cada sessão.",
          img: "gemini-assets/0c1ebca551800569.jpg"
        },
        {
          title: "Arquitetura pensada para o conforto, o mistério e a privacidade.",
          subtitle: "Enxoval acetinado branco e carmesim, isolamento acústico e protocolo rigoroso de higienização entre cada atendimento.",
          tag: "Suítes Climatizadas",
          caption: "Cada sala só é liberada para o próximo atendimento após a saída física e limpeza concluída.",
          img: "gemini-assets/55a6133c6d55a5d0.jpg"
        },
        {
          title: "Lounge Bar integrado à sua suíte por QR Code exclusivo.",
          subtitle: "Peça espumantes, drinks autorais e conveniências sem interromper o clima da sessão. Tudo consolidado com discrição na sua comanda.",
          tag: "Cardápio Digital QR",
          caption: "Pedidos chegam diretamente à copa/bar e somam-se automaticamente ao atendimento ativo.",
          img: "gemini-assets/640e9e86d2d3b471.jpg"
        },
        {
          title: "Toque autoral, óleos aquecidos e experiências de 30 ou 60 minutos.",
          subtitle: "Na área restrita a clientes cadastrados, consulte os perfis disponíveis no turno e solicite seu horário com validação demonstrativa de suíte.",
          tag: "Rituais Sensoriais",
          caption: "Fotografias ilustrativas de direção de arte — o acervo final utilizará fotos reais autorizadas da Yankin.",
          img: "gemini-assets/13a6fb96e447abc3.jpg"
        }
      ];

      // 2. Central In-Memory Application State
      const state = {
        currentView: "vitrine",
        isVipAuthenticated: false,
        carouselIndex: 0,
        carouselPaused: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        selectedBarSessionId: "SES-101",

        // Confirmed Service Rules
        services: {
          "30": { duration: 30, label: "Sessão 30 min", price: 200, commission: 100 },
          "60": { duration: 60, label: "Sessão 60 min", price: 260, commission: 140 }
        },

        // Suites (Physical Status decoupled from Financial Queue)
        suites: [
          { id: "S1", name: "Suíte 01 • Carmesim Master", status: "Ocupada", currentSessionId: "SES-101" },
          { id: "S2", name: "Suíte 02 • Âmbar Hidro", status: "Em Limpeza", currentSessionId: null },
          { id: "S3", name: "Suíte 03 • Veludo Privê", status: "Livre", currentSessionId: null },
          { id: "S4", name: "Suíte 04 • Orquídea Imperial", status: "Livre", currentSessionId: null }
        ],

        // Professionals Roster (Illustrative)
        professionals: [
          {
            id: "P1",
            name: "Valentina (Ilustrativa)",
            specialty: "Massagem Sensorial & Relaxante",
            shiftHours: 6,
            shiftLabel: "14h às 20h",
            slots: ["14:00", "15:30", "17:00", "18:30"],
            visibility: "Restrita VIP",
            crop: "Enquadramento Editorial",
            published: true,
            initialBalance: 0,
            img: "gemini-assets/0c1ebca551800569.jpg"
          },
          {
            id: "P2",
            name: "Helena (Ilustrativa)",
            specialty: "Ritual Pedras Quentes & Aromas",
            shiftHours: 8,
            shiftLabel: "12h às 20h",
            slots: ["14:00", "16:00", "18:00", "20:00"],
            visibility: "Pública",
            crop: "Foco Superior",
            published: true,
            initialBalance: 100,
            img: "gemini-assets/55a6133c6d55a5d0.jpg"
          },
          {
            id: "P3",
            name: "Clara (Ilustrativa)",
            specialty: "Relaxamento Profundo & Toque Sutil",
            shiftHours: 6,
            shiftLabel: "14h às 20h",
            slots: ["15:00", "16:30", "18:00", "19:30"],
            visibility: "Restrita VIP",
            crop: "Zoom Suave 110%",
            published: true,
            initialBalance: 0,
            img: "gemini-assets/13a6fb96e447abc3.jpg"
          },
          {
            id: "P4",
            name: "Ísis (Ilustrativa)",
            specialty: "Experiência VIP & Ducha Aromática",
            shiftHours: 4,
            shiftLabel: "16h às 20h",
            slots: ["16:00", "17:30", "19:00"],
            visibility: "Restrita VIP",
            crop: "Enquadramento Editorial",
            published: true,
            initialBalance: 0,
            img: "gemini-assets/640e9e86d2d3b471.jpg"
          }
        ],

        // Bar Menu Items
        barMenu: [
          { id: "B1", name: "Taça Chandon Brut Rosé", category: "Espumantes", price: 65, available: true },
          { id: "B2", name: "Cocktail Carmesim Negroni", category: "Drinks Autorais", price: 48, available: true },
          { id: "B3", name: "Whisky Single Malt 12 Anos (Dose)", category: "Destilados", price: 55, available: true },
          { id: "B4", name: "Água Com Gás San Pellegrino 500ml", category: "Sem Álcool", price: 22, available: true },
          { id: "B5", name: "Espresso Duplo Gourmet & Trufa", category: "Cafeteria", price: 18, available: true },
          { id: "B6", name: "Kit Sensual Óleo Aromático Quente", category: "Conveniência Suíte", price: 40, available: true }
        ],

        // Bar Orders Queue
        barOrders: [
          { id: "ORD-1", sessionId: "SES-101", itemId: "B2", itemName: "Cocktail Carmesim Negroni", price: 48, status: "Entregue", time: "15:18" },
          { id: "ORD-2", sessionId: "SES-100", itemId: "B1", itemName: "Taça Chandon Brut Rosé", price: 65, status: "Entregue", time: "14:25" }
        ],

        // Unified Sessions & Financial Tabs
        sessions: [
          {
            id: "SES-100",
            clientName: "Cliente VIP #318 (Marcelo)",
            clientType: "Cadastrado",
            profId: "P2",
            suiteId: "S2",
            serviceKey: "60",
            startTime: "14:00",
            dateAtendimento: "30/10/2026",
            sessionStatus: "Encerrada (No Caixa)",
            timeAlert: false,
            discount: 0,
            payments: [
              { method: "Pix QR Local (Conferido no Banco)", amount: 150, operator: "Caixa Turno A • Pix #410", date: "30/10/2026 15:04" }
            ],
            dateRecebimento: null
          },
          {
            id: "SES-101",
            clientName: "Cliente VIP #402 (Alexandre)",
            clientType: "Cadastrado",
            profId: "P1",
            suiteId: "S1",
            serviceKey: "60",
            startTime: "15:00",
            dateAtendimento: "30/10/2026",
            sessionStatus: "Em Atendimento",
            timeAlert: false,
            discount: 0,
            payments: [],
            dateRecebimento: null
          },
          {
            id: "SES-099",
            clientName: "Cliente Avulso #14",
            clientType: "Avulso",
            profId: "P1",
            suiteId: "S3",
            serviceKey: "30",
            startTime: "13:00",
            dateAtendimento: "30/10/2026",
            sessionStatus: "Finalizada & Quitada",
            timeAlert: false,
            discount: 10,
            payments: [
              { method: "Dinheiro em Espécie", amount: 190, operator: "Caixa Turno A • Recibo #09", date: "30/10/2026 13:35" }
            ],
            dateRecebimento: "30/10/2026 13:35"
          }
        ],

        // Professional Commission Payouts (Repasses)
        payouts: [
          { id: "REP-1", profId: "P1", amount: 50, method: "Adiantamento Dinheiro", note: "Gestor Turno • Vale Parcial", date: "30/10/2026 14:10" }
        ]
      };

      // Helper: Format Currency
      function fmtBRL(val) {
        return "R$ " + Number(val || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      // Helper: Toast Notification (Never use alert/confirm/prompt)
      function showToast(msg, type) {
        const container = document.getElementById("toast-container");
        if (!container) return;
        const el = document.createElement("div");
        const bg = type === "error" ? "bg-red-900 border-red-400" : type === "warn" ? "bg-amber-900 border-amber-400" : "bg-[#180D10] border-[#C5A06E]";
        el.className = "pointer-events-auto px-4 py-3 rounded-xl border text-white text-xs shadow-xl transition duration-300 " + bg;
        el.innerHTML = "<div class='font-semibold text-[#F3D299] mb-0.5'>YK / Sistema Yankin</div><div>" + msg + "</div>";
        container.appendChild(el);
        setTimeout(function() {
          el.style.opacity = "0";
          setTimeout(function() { el.remove(); }, 300);
        }, 4200);
      }

      // Helper: Lookup helpers
      function getProf(profId) {
        return state.professionals.find(function(p) { return p.id === profId; }) || { name: "Profissional", shiftHours: 6, initialBalance: 0 };
      }
      function getSuite(suiteId) {
        return state.suites.find(function(s) { return s.id === suiteId; }) || { name: suiteId, status: "Livre" };
      }
      function getSessionBarTotal(sessionId) {
        return state.barOrders
          .filter(function(o) { return o.sessionId === sessionId && o.status !== "Cancelado"; })
          .reduce(function(acc, o) { return acc + o.price; }, 0);
      }
      function getSessionFinancials(ses) {
        const svc = state.services[ses.serviceKey] || state.services["60"];
        const barTotal = getSessionBarTotal(ses.id);
        const discount = Number(ses.discount || 0);
        const netTotal = Math.max(0, svc.price + barTotal - discount);
        const paidTotal = ses.payments.reduce(function(acc, p) { return acc + Number(p.amount || 0); }, 0);
        const remaining = Math.max(0, cash(netTotal - paidTotal));
        const isSettled = remaining === 0 && paidTotal >= netTotal && ses.sessionStatus !== "Em Atendimento";
        // Rule: Commission is ALWAYS 100% integral (R$100 or R$140), never reduced by house discount or card fees
        return {
          svcPrice: svc.price,
          svcLabel: svc.label,
          duration: svc.duration,
          commission: svc.commission,
          barTotal: barTotal,
          discount: discount,
          netTotal: netTotal,
          paidTotal: paidTotal,
          remaining: remaining,
          isSettled: isSettled
        };
      }

      // 3. View Navigation
      function switchView(viewName) {
        state.currentView = viewName;
        document.querySelectorAll(".app-view").forEach(function(el) {
          el.classList.add("hidden");
        });
        const target = document.getElementById("view-" + viewName);
        if (target) target.classList.remove("hidden");

        document.querySelectorAll(".nav-tab-btn").forEach(function(btn) {
          const isMatch = btn.getAttribute("data-view") === viewName;
          if (isMatch) {
            btn.className = "nav-tab-btn px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition bg-white text-[#841222] shadow";
          } else {
            btn.className = "nav-tab-btn px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition text-white/90 hover:text-white";
          }
        });

        const drawer = document.getElementById("mobile-nav-drawer");
        if (drawer) drawer.classList.add("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
        renderAll();
      }

      // 4. Hero Carousel Controller
      let carouselTimer = null;
      function renderCarousel() {
        const s = heroSlides[state.carouselIndex];
        const titleEl = document.getElementById("hero-slide-title");
        const subEl = document.getElementById("hero-slide-subtitle");
        const tagEl = document.getElementById("hero-slide-tag");
        const capEl = document.getElementById("hero-slide-caption");
        const imgEl = document.getElementById("hero-slide-img");
        const cntEl = document.getElementById("carousel-counter");

        if (titleEl) titleEl.textContent = s.title;
        if (subEl) subEl.textContent = s.subtitle;
        if (tagEl) tagEl.textContent = s.tag;
        if (capEl) capEl.textContent = s.caption;
        if (imgEl) imgEl.src = s.img;
        if (cntEl) cntEl.textContent = "0" + (state.carouselIndex + 1) + " / 0" + heroSlides.length;

        const iconEl = document.getElementById("carousel-pause-icon");
        const lblEl = document.getElementById("carousel-pause-label");
        if (iconEl) iconEl.textContent = state.carouselPaused ? "▶" : "⏸";
        if (lblEl) lblEl.textContent = state.carouselPaused ? "Retomar transição" : "Pausar transição";
      }

      function restartCarouselTimer() {
        if (carouselTimer) clearInterval(carouselTimer);
        if (!state.carouselPaused) {
          carouselTimer = setInterval(function() {
            state.carouselIndex = (state.carouselIndex + 1) % heroSlides.length;
            renderCarousel();
          }, 5500);
        }
      }

      // 5. Render VIP Clube Privê
      function renderVipClube() {
        const badge = document.getElementById("header-auth-badge");
        const gate = document.getElementById("vip-locked-gate");
        const content = document.getElementById("vip-unlocked-content");

        if (badge) {
          badge.textContent = state.isVipAuthenticated ? "Acesso VIP simulado" : "Visitante Público";
          badge.className = state.isVipAuthenticated
            ? "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C5A06E] text-[#1A0D10]"
            : "px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-white";
        }

        if (state.isVipAuthenticated) {
          if (gate) gate.classList.add("hidden");
          if (content) content.classList.remove("hidden");
        } else {
          if (gate) gate.classList.remove("hidden");
          if (content) content.classList.add("hidden");
        }

        const activeProfs = state.professionals.filter(function(p) { return p.published; });
        const countBadge = document.getElementById("roster-count-badge");
        if (countBadge) countBadge.textContent = activeProfs.length + " profissionais escaladas hoje";

        const grid = document.getElementById("vip-roster-grid");
        if (grid) {
          grid.innerHTML = activeProfs.map(function(p) {
            const slotPills = p.slots.map(function(t) {
              return "<span class='px-2 py-0.5 rounded bg-[#FAF0F2] text-[#841222] text-[11px] font-semibold'>" + t + "</span>";
            }).join(" ");
            return (
              "<article class='bg-white rounded-2xl overflow-hidden border border-[#841222]/20 shadow-sm flex flex-col justify-between'>" +
                "<div class='relative aspect-[4/3] bg-[#160B0D] overflow-hidden'>" +
                  "<img src='" + p.img + "' alt='" + p.name + "' class='w-full h-full object-cover max-w-full'>" +
                  "<div class='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30'></div>" +
                  "<span class='absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 text-[#F3D299] text-[10px] font-semibold uppercase'>Perfil Ilustrativo • " + p.visibility + "</span>" +
                  "<div class='absolute bottom-2.5 left-3 right-3 text-white'>" +
                    "<h4 class='font-serif-editorial text-2xl font-bold leading-tight'>" + p.name + "</h4>" +
                    "<p class='text-[11px] text-white/80'>" + p.specialty + "</p>" +
                  "</div>" +
                "</div>" +
                "<div class='p-4 space-y-3 text-xs'>" +
                  "<div class='flex items-center justify-between text-[11px] text-[#6E585C]'>" +
                    "<span>Turno: <strong>" + p.shiftLabel + "</strong></span>" +
                    "<span>" + p.crop + "</span>" +
                  "</div>" +
                  "<div>" +
                    "<span class='block text-[10px] uppercase tracking-wider text-[#6E585C] mb-1'>Horários Disponíveis Hoje:</span>" +
                    "<div class='flex flex-wrap gap-1.5'>" + slotPills + "</div>" +
                  "</div>" +
                  "<button type='button' data-pick-prof='" + p.id + "' class='btn-select-prof-card w-full py-2 rounded-full bg-[#841222]/10 hover:bg-[#841222] text-[#841222] hover:text-white font-bold uppercase tracking-wider text-[11px] transition'>" +
                    "Selecionar " + p.name.split(" ")[0] + " para Reserva" +
                  "</button>" +
                "</div>" +
              "</article>"
            );
          }).join("");
        }

        // Populate VIP Booking Form Selects
        const profSelect = document.getElementById("vip-select-prof");
        if (profSelect) {
          const currentVal = profSelect.value;
          profSelect.innerHTML = activeProfs.map(function(p) {
            return "<option value='" + p.id + "'>" + p.name + " (" + p.shiftLabel + ")</option>";
          }).join("");
          if (currentVal && activeProfs.some(function(p) { return p.id === currentVal; })) {
            profSelect.value = currentVal;
          }
        }

        const suiteSelect = document.getElementById("vip-select-suite");
        if (suiteSelect) {
          suiteSelect.innerHTML = state.suites.map(function(s) {
            return "<option value='" + s.id + "'>" + s.name + " (Status atual: " + s.status + ")</option>";
          }).join("");
        }

        updateVipSummaryPrice();
      }

      function updateVipSummaryPrice() {
        const svcSelect = document.getElementById("vip-select-service");
        const key = svcSelect ? svcSelect.value : "60";
        const svc = state.services[key] || state.services["60"];
        const priceEl = document.getElementById("vip-summary-price");
        const commEl = document.getElementById("vip-summary-comm");
        if (priceEl) priceEl.textContent = fmtBRL(svc.price);
        if (commEl) commEl.textContent = fmtBRL(svc.commission) + " (Integral sem descontos)";
      }

      // 6. Render Bar QR Code View
      function renderBarQrView() {
        const sesSelect = document.getElementById("bar-active-session-select");
        if (sesSelect) {
          sesSelect.innerHTML = state.sessions.map(function(s) {
            const prof = getProf(s.profId);
            const suite = getSuite(s.suiteId);
            return "<option value='" + s.id + "'>" + s.id + " • " + suite.name.split("•")[0] + " (" + prof.name.split(" ")[0] + ") — [" + s.sessionStatus + "]</option>";
          }).join("");
          if (state.selectedBarSessionId && state.sessions.some(function(s) { return s.id === state.selectedBarSessionId; })) {
            sesSelect.value = state.selectedBarSessionId;
          } else if (state.sessions.length > 0) {
            state.selectedBarSessionId = state.sessions[0].id;
            sesSelect.value = state.selectedBarSessionId;
          }
        }

        const menuGrid = document.getElementById("bar-menu-grid");
        if (menuGrid) {
          menuGrid.innerHTML = state.barMenu.map(function(item) {
            return (
              "<div class='bg-white rounded-xl p-4 border border-[#841222]/20 flex flex-col justify-between gap-3'>" +
                "<div>" +
                  "<div class='flex items-center justify-between'>" +
                    "<span class='text-[10px] font-bold uppercase tracking-wider text-[#841222]'>" + item.category + "</span>" +
                    "<span class='font-serif-editorial text-xl font-bold text-[#1E1618]'>" + fmtBRL(item.price) + "</span>" +
                  "</div>" +
                  "<h4 class='font-bold text-sm text-[#1E1618] mt-1'>" + item.name + "</h4>" +
                "</div>" +
                "<div class='flex items-center justify-between gap-2 pt-2 border-t border-gray-100'>" +
                  "<button type='button' data-toggle-stock='" + item.id + "' class='btn-toggle-stock text-[11px] underline " + (item.available ? "text-emerald-700" : "text-red-700 font-bold") + "'>" +
                    (item.available ? "✓ Em estoque (Suspender)" : "✕ Esgotado (Reativar)") +
                  "</button>" +
                  "<button type='button' data-order-item='" + item.id + "' " + (!item.available ? "disabled" : "") + " class='btn-order-bar px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition " +
                    (item.available ? "bg-[#841222] text-white hover:bg-[#660d19]" : "bg-gray-200 text-gray-400 cursor-not-allowed") + "'>" +
                    "+ Pedir na Suíte" +
                  "</button>" +
                "</div>" +
              "</div>"
            );
          }).join("");
        }

        // Current Session Tab Summary
        const activeSes = state.sessions.find(function(s) { return s.id === state.selectedBarSessionId; });
        const tabSummary = document.getElementById("bar-current-tab-summary");
        if (tabSummary && activeSes) {
          const fin = getSessionFinancials(activeSes);
          const prof = getProf(activeSes.profId);
          const suite = getSuite(activeSes.suiteId);
          const sesOrders = state.barOrders.filter(function(o) { return o.sessionId === activeSes.id; });
          const ordersHtml = sesOrders.length === 0
            ? "<p class='text-gray-400 italic'>Nenhum consumo de bar lançado nesta sessão.</p>"
            : sesOrders.map(function(o) {
                return "<div class='flex justify-between items-center py-1 border-b border-gray-100'>" +
                  "<span>" + o.itemName + " <em class='text-[10px] text-gray-500'>(" + o.status + ")</em></span>" +
                  "<strong>" + fmtBRL(o.price) + "</strong>" +
                "</div>";
              }).join("");

          tabSummary.innerHTML =
            "<div class='p-3 rounded-xl bg-[#FAF5F6] border border-[#841222]/15 space-y-1'>" +
              "<div class='flex justify-between'><span>Cliente:</span> <strong>" + activeSes.clientName + "</strong></div>" +
              "<div class='flex justify-between'><span>Profissional &amp; Suíte:</span> <strong>" + prof.name.split(" ")[0] + " • " + suite.name.split("•")[0] + "</strong></div>" +
              "<div class='flex justify-between'><span>Status da Sessão:</span> <strong class='text-[#841222]'>" + activeSes.sessionStatus + "</strong></div>" +
            "</div>" +
            "<div class='pt-2 space-y-1'>" +
              "<div class='font-bold text-[#841222] uppercase text-[10px] tracking-wider'>Itens do Bar na Comanda:</div>" +
              ordersHtml +
            "</div>" +
            "<div class='pt-2 border-t border-gray-200 flex justify-between text-sm font-bold'>" +
              "<span>Total Consolidado (Serviço + Bar):</span>" +
              "<span class='text-[#841222]'>" + fmtBRL(fin.netTotal) + "</span>" +
            "</div>";
        }

        // Bar Orders Queue
        const queueEl = document.getElementById("bar-orders-queue");
        if (queueEl) {
          if (state.barOrders.length === 0) {
            queueEl.innerHTML = "<p class='text-xs text-white/60'>Nenhum pedido na fila do bar.</p>";
          } else {
            queueEl.innerHTML = state.barOrders.map(function(ord) {
              return (
                "<div class='p-3 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs'>" +
                  "<div>" +
                    "<span class='text-[10px] text-[#F3D299] font-bold uppercase'>" + ord.sessionId + " • " + ord.time + "</span>" +
                    "<div class='font-semibold text-white'>" + ord.itemName + " (" + fmtBRL(ord.price) + ")</div>" +
                    "<span class='text-[11px] text-white/75'>Status: <strong>" + ord.status + "</strong></span>" +
                  "</div>" +
                  "<div class='flex items-center gap-1.5'>" +
                    "<button type='button' data-step-order='" + ord.id + "' class='btn-step-order px-2.5 py-1 rounded bg-[#C5A06E] text-[#1A0D10] font-bold text-[11px]'>" +
                      (ord.status === "Recebido" ? "Iniciar Preparo" : ord.status === "Em Preparo" ? "Marcar Entregue" : "✓ Entregue") +
                    "</button>" +
                    (ord.status !== "Cancelado" ? "<button type='button' data-cancel-order='" + ord.id + "' class='btn-cancel-order px-2 py-1 rounded bg-red-900/70 text-red-200 text-[11px]'>Cancelar</button>" : "") +
                  "</div>" +
                "</div>"
              );
            }).join("");
          }
        }
      }

      // 7. Render Recepção, Suítes & Estúdio de Fotos
      function renderRecepcaoView() {
        const suitesGrid = document.getElementById("suites-status-grid");
        if (suitesGrid) {
          suitesGrid.innerHTML = state.suites.map(function(s) {
            const badgeClass = s.status === "Livre"
              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
              : s.status === "Ocupada"
              ? "bg-red-100 text-[#841222] border-red-300"
              : "bg-amber-100 text-amber-800 border-amber-300";

            return (
              "<div class='bg-white rounded-2xl p-4 border border-[#841222]/20 shadow-sm flex flex-col justify-between gap-3'>" +
                "<div>" +
                  "<div class='flex items-center justify-between gap-2'>" +
                    "<span class='font-bold text-xs text-[#1E1618]'>" + s.name + "</span>" +
                    "<span class='px-2 py-0.5 rounded-full text-[10px] font-bold border " + badgeClass + "'>" + s.status + "</span>" +
                  "</div>" +
                  "<p class='text-[11px] text-[#6E585C] mt-2'>" +
                    (s.status === "Ocupada"
                      ? "Atendimento em curso (" + (s.currentSessionId || "") + "). O fim do cronômetro não libera a sala sozinho."
                      : s.status === "Em Limpeza"
                      ? "Cliente já saiu da suíte. Aguardando conclusão da higienização para liberar."
                      : "Higienizada, climatizada e pronta para check-in imediato.") +
                  "</p>" +
                "</div>" +
                "<div>" +
                  (s.status === "Em Limpeza"
                    ? "<button type='button' data-clean-suite='" + s.id + "' class='btn-clean-suite w-full py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold uppercase tracking-wider transition'>✓ Concluir Limpeza &amp; Liberar Suíte</button>"
                    : s.status === "Livre"
                    ? "<span class='block text-center py-1.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium'>Disponível na Agenda</span>"
                    : "<span class='block text-center py-1.5 rounded-full bg-[#FAF0F2] text-[#841222] text-[11px] font-semibold'>Em Sessão Ativa</span>") +
                "</div>" +
              "</div>"
            );
          }).join("");
        }

        // Populate Recepção Check-in Selects
        const recProf = document.getElementById("rec-select-prof");
        if (recProf) {
          const activeProfs = state.professionals.filter(function(p) { return p.published; });
          recProf.innerHTML = activeProfs.map(function(p) {
            return "<option value='" + p.id + "'>" + p.name + "</option>";
          }).join("");
        }
        const recSuite = document.getElementById("rec-select-suite");
        if (recSuite) {
          recSuite.innerHTML = state.suites.map(function(s) {
            return "<option value='" + s.id + "'>" + s.name + " [" + s.status + "]</option>";
          }).join("");
        }

        // Sessions Table in Recepção
        const tbody = document.getElementById("recepcao-sessions-tbody");
        if (tbody) {
          tbody.innerHTML = state.sessions.map(function(ses) {
            const prof = getProf(ses.profId);
            const suite = getSuite(ses.suiteId);
            const fin = getSessionFinancials(ses);
            return (
              "<tr class='hover:bg-[#FAF5F6]'>" +
                "<td class='py-2.5 px-2'>" +
                  "<strong>" + ses.id + "</strong> — " + ses.clientName +
                  "<div class='text-[10px] text-gray-500'> Perfil: " + ses.clientType + " • Início: " + ses.startTime + "</div>" +
                "</td>" +
                "<td class='py-2.5 px-2'>" +
                  "<strong>" + prof.name.split(" ")[0] + "</strong><br>" +
                  "<span class='text-[11px] text-gray-600'>" + suite.name + "</span>" +
                "</td>" +
                "<td class='py-2.5 px-2'>" +
                  fin.svcLabel + " (" + fmtBRL(fin.svcPrice) + ")<br>" +
                  "<span class='text-[11px] text-[#841222]'>+ Bar: " + fmtBRL(fin.barTotal) + " = <strong>" + fmtBRL(fin.netTotal) + "</strong></span>" +
                "</td>" +
                "<td class='py-2.5 px-2'>" +
                  "<span class='font-semibold text-[#841222]'>" + ses.sessionStatus + "</span>" +
                  (ses.timeAlert ? "<div class='mt-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]'>🔔 Aviso Discreto: Tempo Concluído</div>" : "") +
                "</td>" +
                "<td class='py-2.5 px-2 text-right space-x-1 whitespace-nowrap'>" +
                  (ses.sessionStatus === "Em Atendimento" || ses.sessionStatus === "Reservado (Site)"
                    ? "<button type='button' data-alert-session='" + ses.id + "' class='btn-alert-session px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-[11px]'>🔔 Aviso Tempo</button>" +
                      "<button type='button' data-end-session='" + ses.id + "' class='btn-end-session px-2.5 py-1 rounded bg-[#841222] hover:bg-[#660d19] text-white font-bold text-[11px]'>Encerrar &amp; Enviar ao Caixa</button>"
                    : "<span class='text-[11px] text-gray-500'>Enviada ao Caixa</span>") +
                "</td>" +
              "</tr>"
            );
          }).join("");
        }

        // Photo Studio Roster Table
        const studioTbody = document.getElementById("studio-roster-tbody");
        if (studioTbody) {
          studioTbody.innerHTML = state.professionals.map(function(p) {
            return (
              "<tr>" +
                "<td class='py-2 px-2 font-semibold'>" + p.name + "</td>" +
                "<td class='py-2 px-2'>" + p.shiftLabel + " (" + p.shiftHours + "h)</td>" +
                "<td class='py-2 px-2'>" + p.crop + " • <span class='font-semibold text-[#841222]'>" + p.visibility + "</span></td>" +
                "<td class='py-2 px-2'>" +
                  (p.published
                    ? "<span class='px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]'>Publicada no Dia</span>"
                    : "<span class='px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-bold text-[10px]'>Oculta / Pausada</span>") +
                "</td>" +
                "<td class='py-2 px-2 text-right space-x-1'>" +
                  "<button type='button' data-toggle-prof='" + p.id + "' class='btn-toggle-prof px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-[11px]'>" +
                    (p.published ? "Despublicar" : "Publicar") +
                  "</button>" +
                  "<button type='button' data-delete-prof='" + p.id + "' class='btn-delete-prof px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-[11px]'>Excluir</button>" +
                "</td>" +
              "</tr>"
            );
          }).join("");
        }
      }

      // 8. Render Caixa, Comissões, Repasses & Impressora 80mm
      function renderCaixaView() {
        let revServices = 0;
        let revBar = 0;
        let pendingTotal = 0;
        let commApurada = 0;
        let commLiberada = 0;
        let expectedCashInDrawer = 0;

        state.sessions.forEach(function(ses) {
          const fin = getSessionFinancials(ses);
          commApurada += fin.commission;
          if (fin.isSettled) {
            revServices += fin.svcPrice - fin.discount;
            revBar += fin.barTotal;
            commLiberada += fin.commission;
          } else {
            pendingTotal += fin.remaining;
          }
          ses.payments.forEach(function(p) {
            if (p.method.indexOf("Dinheiro") !== -1) {
              expectedCashInDrawer += Number(p.amount || 0);
            }
          });
        });

        const totalPayouts = state.payouts
          .filter(function(r) { return r.method !== "Acumular p/ Data Combinada"; })
          .reduce(function(acc, r) { return acc + Number(r.amount || 0); }, 0);

        state.payouts.forEach(function(r) {
          if (r.method.indexOf("Dinheiro") !== -1) {
            expectedCashInDrawer -= Number(r.amount || 0);
          }
        });

        const totalInitialBalances = state.professionals.reduce(function(acc, p) { return acc + Number(p.initialBalance || 0); }, 0);
        const commSaldoFinal = totalInitialBalances + commLiberada - totalPayouts;

        const elRevSvc = document.getElementById("kpi-rev-services");
        const elRevBar = document.getElementById("kpi-rev-bar");
        const elPend = document.getElementById("kpi-pending-tabs");
        const elApur = document.getElementById("kpi-comm-apurada");
        const elLib = document.getElementById("kpi-comm-liberada");
        const elSaldo = document.getElementById("kpi-comm-saldo");

        if (elRevSvc) elRevSvc.textContent = fmtBRL(revServices);
        if (elRevBar) elRevBar.textContent = fmtBRL(revBar);
        if (elPend) elPend.textContent = fmtBRL(pendingTotal);
        if (elApur) elApur.textContent = fmtBRL(commApurada);
        if (elLib) elLib.textContent = fmtBRL(commLiberada);
        if (elSaldo) elSaldo.textContent = fmtBRL(commSaldoFinal);

        // Tabs Table
        const tabsTbody = document.getElementById("caixa-tabs-tbody");
        if (tabsTbody) {
          tabsTbody.innerHTML = state.sessions.map(function(ses) {
            const prof = getProf(ses.profId);
            const fin = getSessionFinancials(ses);
            return (
              "<tr class='hover:bg-[#FAF5F6]'>" +
                "<td class='py-2.5 px-2'>" +
                  "<strong>" + ses.id + "</strong> — " + ses.clientName +
                  "<div class='text-[10px] text-gray-500'>Atend.: " + ses.dateAtendimento + " (" + ses.startTime + ")</div>" +
                "</td>" +
                "<td class='py-2.5 px-2'>" +
                  "<strong>" + prof.name.split(" ")[0] + "</strong><br>" +
                  "<span class='text-[10px] text-[#841222] font-bold'>Comissão Integral: " + fmtBRL(fin.commission) + "</span>" +
                "</td>" +
                "<td class='py-2.5 px-2 text-right'>" +
                  fmtBRL(fin.svcPrice) + " + " + fmtBRL(fin.barTotal) +
                  (fin.discount > 0 ? "<div class='text-[10px] text-amber-700'>Desc. Casa: −" + fmtBRL(fin.discount) + "</div>" : "") +
                  "<div class='font-bold text-[#1E1618]'>Total: " + fmtBRL(fin.netTotal) + "</div>" +
                "</td>" +
                "<td class='py-2.5 px-2 text-right'>" +
                  "<span class='text-emerald-700 font-semibold'>Pago: " + fmtBRL(fin.paidTotal) + "</span><br>" +
                  "<span class='font-bold " + (fin.remaining > 0 ? "text-amber-700" : "text-gray-400") + "'>Falta: " + fmtBRL(fin.remaining) + "</span>" +
                "</td>" +
                "<td class='py-2.5 px-2 text-right'>" +
                  (fin.isSettled
                    ? "<span class='px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]'>✓ Quitado • Comissão Liberada</span>" +
                      "<div class='text-[10px] text-gray-500 mt-0.5'>Rec.: " + (ses.dateRecebimento || "Hoje") + "</div>"
                    : "<span class='px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]'>⏳ Pendente na Fila</span>") +
                "</td>" +
              "</tr>"
            );
          }).join("");
        }

        // Populate Payment Select
        const paySelect = document.getElementById("pay-select-tab");
        if (paySelect) {
          paySelect.innerHTML = state.sessions.map(function(ses) {
            const fin = getSessionFinancials(ses);
            return "<option value='" + ses.id + "'>" + ses.id + " (" + ses.clientName + ") — Falta: " + fmtBRL(fin.remaining) + "</option>";
          }).join("");
        }

        // Professional Commissions & Occupancy Table
        const commTbody = document.getElementById("caixa-commissions-tbody");
        if (commTbody) {
          commTbody.innerHTML = state.professionals.map(function(p) {
            const profSessions = state.sessions.filter(function(s) { return s.profId === p.id; });
            let count = profSessions.length;
            let totalMinutes = 0;
            let apuradaPend = 0;
            let liberadaQuit = 0;

            profSessions.forEach(function(s) {
              const fin = getSessionFinancials(s);
              totalMinutes += fin.duration;
              if (fin.isSettled) {
                liberadaQuit += fin.commission;
              } else {
                apuradaPend += fin.commission;
              }
            });

            const paidRepasses = state.payouts
              .filter(function(r) { return r.profId === p.id && r.method !== "Acumular p/ Data Combinada"; })
              .reduce(function(acc, r) { return acc + Number(r.amount || 0); }, 0);

            const saldoFinal = Number(p.initialBalance || 0) + liberadaQuit - paidRepasses;
            const availMinutes = (p.shiftHours || 6) * 60;
            const occPct = Math.min(100, Math.round((totalMinutes / availMinutes) * 100));

            return (
              "<tr class='hover:bg-[#FAF5F6]'>" +
                "<td class='py-2.5 px-2 font-bold text-[#1E1618]'>" + p.name + "</td>" +
                "<td class='py-2.5 px-2'>" +
                  count + " atend. (" + totalMinutes + " min)<br>" +
                  "<span class='text-[10px] text-[#6E585C]'>Ocupação na escala (" + p.shiftHours + "h): <strong>" + occPct + "%</strong></span>" +
                "</td>" +
                "<td class='py-2.5 px-2 text-right'>" + fmtBRL(p.initialBalance) + "</td>" +
                "<td class='py-2.5 px-2 text-right text-amber-700 font-semibold'>" + fmtBRL(apuradaPend) + "</td>" +
                "<td class='py-2.5 px-2 text-right text-emerald-700 font-bold'>" + fmtBRL(liberadaQuit) + "</td>" +
                "<td class='py-2.5 px-2 text-right text-gray-700'>" + fmtBRL(paidRepasses) + "</td>" +
                "<td class='py-2.5 px-2 text-right font-bold text-[#841222]'>" + fmtBRL(saldoFinal) + "</td>" +
              "</tr>"
            );
          }).join("");
        }

        // Populate Payout Prof Select
        const payoutProf = document.getElementById("payout-prof");
        if (payoutProf) {
          payoutProf.innerHTML = state.professionals.map(function(p) {
            return "<option value='" + p.id + "'>" + p.name + "</option>";
          }).join("");
        }

        // Physical Cash Drawer Comparison
        const expEl = document.getElementById("cash-expected-val");
        const physInput = document.getElementById("cash-physical-input");
        const diffEl = document.getElementById("cash-diff-val");
        if (expEl) expEl.textContent = fmtBRL(expectedCashInDrawer);
        if (physInput && diffEl) {
          const physVal = Number(physInput.value || 0);
          const diff = physVal - expectedCashInDrawer;
          if (Math.abs(diff) < 0.01) {
            diffEl.textContent = "R$ 0,00 (Caixa Exato)";
            diffEl.className = "text-emerald-400 font-bold";
          } else if (diff > 0) {
            diffEl.textContent = "+" + fmtBRL(diff) + " (Sobra Física)";
            diffEl.className = "text-amber-300 font-bold";
          } else {
            diffEl.textContent = fmtBRL(diff) + " (Quebra / Diferença)";
            diffEl.className = "text-red-400 font-bold";
          }
        }

        // Populate Thermal 80mm Receipt Preview
        const receiptEl = document.getElementById("thermal-receipt-preview");
        if (receiptEl) {
          const lines = [];
          lines.push("========================================");
          lines.push("      YK / YANKIN RELAX & LOUNGE        ");
          lines.push("   RESUMO OPERACIONAL & COMANDAS 80MM   ");
          lines.push("   Data: 30/10/2026 - Controle Interno  ");
          lines.push("========================================");
          state.sessions.forEach(function(ses) {
            const fin = getSessionFinancials(ses);
            const prof = getProf(ses.profId);
            lines.push(ses.id + " | " + ses.suiteId + " | " + prof.name.split(" ")[0]);
            lines.push("  " + fin.svcLabel + ": " + fmtBRL(fin.svcPrice) + " | Bar: " + fmtBRL(fin.barTotal));
            if (fin.discount > 0) lines.push("  Desconto Casa: -" + fmtBRL(fin.discount));
            lines.push("  Total: " + fmtBRL(fin.netTotal) + " | Pago: " + fmtBRL(fin.paidTotal));
            lines.push("  Comissao Integral Prof.: " + fmtBRL(fin.commission));
            lines.push("----------------------------------------");
          });
          lines.push("RECEITA SERVICOS QUITADA: " + fmtBRL(revServices));
          lines.push("RECEITA BAR QUITADA:      " + fmtBRL(revBar));
          lines.push("COMISSOES LIBERADAS:      " + fmtBRL(commLiberada));
          lines.push("REPASSES EFETUADOS:       " + fmtBRL(totalPayouts));
          lines.push("SALDO A REPASSAR:         " + fmtBRL(commSaldoFinal));
          lines.push("========================================");
          lines.push("   NAO E DOCUMENTO FISCAL - USO INTERNO ");
          receiptEl.innerHTML = "<pre class='whitespace-pre-wrap'>" + lines.join("\n") + "</pre>";
        }
      }

      function renderAll() {
        renderCarousel();
        renderVipClube();
        renderBarQrView();
        renderRecepcaoView();
        renderCaixaView();
      }

      window.YankinDemo={state,getSessionFinancials,profBalance,overlaps};
      // ===================================================================
      // EVENT LISTENERS & INTERACTIVE HANDLERS
      // ===================================================================
      window.addEventListener("DOMContentLoaded", function() {
        // Navigation Tabs
        document.querySelectorAll(".nav-tab-btn").forEach(function(btn) {
          btn.addEventListener("click", function() {
            switchView(btn.getAttribute("data-view"));
          });
        });

        // Brand Home
        const brandHome = document.getElementById("nav-brand-home");
        if (brandHome) brandHome.addEventListener("click", function() { switchView("vitrine"); });

        // Mobile Drawer Toggle
        const mobileBtn = document.getElementById("btn-mobile-menu");
        if (mobileBtn) {
          mobileBtn.addEventListener("click", function() {
            const dr = document.getElementById("mobile-nav-drawer");
            if (dr) dr.classList.toggle("hidden");
          });
        }

        // Quick View Links
        document.querySelectorAll(".quick-view-link").forEach(function(btn) {
          btn.addEventListener("click", function() {
            switchView(btn.getAttribute("data-goto-view"));
          });
        });

        // Hero CTA buttons
        const btnHeroClube = document.getElementById("btn-hero-go-clube");
        if (btnHeroClube) {
          btnHeroClube.addEventListener("click", function() {
            switchView("clube");
          });
        }
        const btnHeroSuites = document.getElementById("btn-hero-go-suites");
        if (btnHeroSuites) {
          btnHeroSuites.addEventListener("click", function() {
            const sec = document.getElementById("sec-suites");
            if (sec) sec.scrollIntoView({ behavior: "smooth" });
          });
        }

        // Pick Service Buttons (30 min / 60 min)
        document.querySelectorAll(".btn-pick-service").forEach(function(btn) {
          btn.addEventListener("click", function() {
            const svcKey = btn.getAttribute("data-select-service");
            state.isVipAuthenticated = true;
            switchView("clube");
            const svcSelect = document.getElementById("vip-select-service");
            if (svcSelect && svcKey) {
              svcSelect.value = svcKey;
              updateVipSummaryPrice();
            }
            showToast("Modalidade de " + svcKey + " minutos selecionada no Clube Privê.", "info");
          });
        });

        // Carousel Controls
        const btnPrev = document.getElementById("btn-carousel-prev");
        const btnNext = document.getElementById("btn-carousel-next");
        const btnPause = document.getElementById("btn-carousel-pause");
        if (btnPrev) {
          btnPrev.addEventListener("click", function() {
            state.carouselIndex = (state.carouselIndex - 1 + heroSlides.length) % heroSlides.length;
            renderCarousel();
          });
        }
        if (btnNext) {
          btnNext.addEventListener("click", function() {
            state.carouselIndex = (state.carouselIndex + 1) % heroSlides.length;
            renderCarousel();
          });
        }
        if (btnPause) {
          btnPause.addEventListener("click", function() {
            state.carouselPaused = !state.carouselPaused;
            renderCarousel();
            restartCarouselTimer();
          });
        }

        // VIP Auth Toggles
        function toggleVipAuth() {
          state.isVipAuthenticated = !state.isVipAuthenticated;
          renderAll();
          showToast(
            state.isVipAuthenticated
              ? "Acesso Cliente VIP ativado: escala do dia e reserva liberadas."
              : "Modo Visitante Público ativado: perfis do dia ocultados por privacidade.",
            "info"
          );
        }
        const btnQuickVip = document.getElementById("btn-quick-vip-toggle");
        const btnOpenVipModal = document.getElementById("btn-open-vip-modal");
        const btnClubeAuth = document.getElementById("btn-clube-toggle-auth");
        const btnGateUnlock = document.getElementById("btn-gate-unlock");

        if (btnQuickVip) btnQuickVip.addEventListener("click", toggleVipAuth);
        if (btnClubeAuth) btnClubeAuth.addEventListener("click", toggleVipAuth);
        if (btnOpenVipModal) {
          btnOpenVipModal.addEventListener("click", function() {
            state.isVipAuthenticated = true;
            switchView("clube");
            showToast("Bem-vindo ao Clube Privê Yankin (Área Cadastrada).", "info");
          });
        }
        if (btnGateUnlock) {
          btnGateUnlock.addEventListener("click", function() {
            state.isVipAuthenticated = true;
            renderAll();
            showToast("Login VIP simulado com sucesso. Escolha a profissional e o horário.", "info");
          });
        }

        // VIP Service Price Update
        const vipSvcSelect = document.getElementById("vip-select-service");
        if (vipSvcSelect) {
          vipSvcSelect.addEventListener("change", updateVipSummaryPrice);
        }

        // VIP Booking Form Submit (Connected to Central Schedule + Conflict Detection)
        const vipForm = document.getElementById("vip-booking-form");
        if (vipForm) {
          vipForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const alias = safe(document.getElementById("vip-client-alias").value.trim()) || "Cliente VIP";
            const profId = document.getElementById("vip-select-prof").value;
            const serviceKey = document.getElementById("vip-select-service").value;
            const timeVal = document.getElementById("vip-select-time").value;
            const suiteId = document.getElementById("vip-select-suite").value;

            // Check conflict of professional or suite at same time
            const conflict = state.sessions.find(function(s) {
              return false;
            });
            if (overlaps(profId,suiteId,timeVal,serviceKey)) {
              showToast("Conflito detectado: Profissional ou Suíte já possui reserva/sessão às " + timeVal + ". Escolha outro horário ou suíte.", "error");
              return;
            }

            const newId = "SES-" + (100 + state.sessions.length + 1);
            state.sessions.unshift({
              id: newId,
              clientName: alias,
              clientType: "Cadastrado (Site)",
              profId: profId,
              suiteId: suiteId,
              serviceKey: serviceKey,
              startTime: timeVal,
              dateAtendimento: "30/10/2026",
              sessionStatus: "Reservada",
              timeAlert: false,
              discount: 0,
              payments: [],
              dateRecebimento: null
            });

            const suiteObj = getSuite(suiteId);
            // Reserva não ocupa fisicamente a sala.

            state.selectedBarSessionId = newId;

            renderAll();
            showToast("Reserva " + newId + " de exemplo registrada. O início presencial será feito na recepção.", "info");
          });
        }

        // Bar Active Session Switcher
        const barSesSelect = document.getElementById("bar-active-session-select");
        if (barSesSelect) {
          barSesSelect.addEventListener("change", function() {
            state.selectedBarSessionId = barSesSelect.value;
            renderBarQrView();
          });
        }

        // Recepção Walk-in Check-in Form
        const recForm = document.getElementById("recepcao-checkin-form");
        if (recForm) {
          recForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const clientName = safe(document.getElementById("rec-client-name").value.trim()) || "Cliente Avulso";
            const profId = document.getElementById("rec-select-prof").value;
            const serviceKey = document.getElementById("rec-select-service").value;
            const suiteId = document.getElementById("rec-select-suite").value;
            const startTime = document.getElementById("rec-start-time").value || "16:00";

            const suiteObj = getSuite(suiteId);
            if (suiteObj.status !== "Livre") {
              showToast("Impedido: A " + suiteObj.name + " está '" + suiteObj.status + "'. Conclua a limpeza ou escolha uma suíte Livre.", "error");
              return;
            }

            if(state.sessions.some(s=>s.profId===profId&&s.sessionStatus==="Em Atendimento")||overlaps(profId,suiteId,startTime,serviceKey)){showToast("Profissional ou sala com conflito.","error");return;}
            const newId = "SES-" + (100 + state.sessions.length + 1);
            state.sessions.unshift({
              id: newId,
              clientName: clientName,
              clientType: "Avulso / Balcão",
              profId: profId,
              suiteId: suiteId,
              serviceKey: serviceKey,
              startTime: startTime,
              dateAtendimento: "30/10/2026",
              sessionStatus: "Em Atendimento",
              timeAlert: false,
              discount: 0,
              payments: [],
              dateRecebimento: null
            });

            suiteObj.status = "Ocupada";
            suiteObj.currentSessionId = newId;
            state.selectedBarSessionId = newId;

            renderAll();
            showToast("Atendimento presencial " + newId + " iniciado na " + suiteObj.name + ".", "info");
          });
        }

        // Photo Studio Form
        const studioForm = document.getElementById("photo-studio-form");
        if (studioForm) {
          studioForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const nameVal = safe(document.getElementById("studio-prof-name").value.trim());
            const shiftHours = Number(document.getElementById("studio-prof-shift").value || 6);
            const visVal = document.getElementById("studio-visibility").value;
            const cropVal = document.getElementById("studio-crop-focus").value;

            const newProfId = "P" + (state.professionals.length + 1);
            state.professionals.push({
              id: newProfId,
              name: nameVal.indexOf("Ilustrativa") === -1 ? nameVal + " (Ilustrativa)" : nameVal,
              specialty: "Ritual Sensorial & Relaxamento",
              shiftHours: shiftHours,
              shiftLabel: shiftHours + "h na escala",
              slots: ["15:00", "16:30", "18:00", "19:30"],
              visibility: visVal,
              crop: cropVal,
              published: true,
              initialBalance: 0,
              img: "gemini-assets/55a6133c6d55a5d0.jpg"
            });

            document.getElementById("studio-prof-name").value = "";
            renderAll();
            showToast("Perfil fictício publicado nesta aba. Nenhuma foto foi enviada e nenhum termo foi validado.", "info");
          });
        }

        // Caixa Payment Form
        const payForm = document.getElementById("caixa-payment-form");
        if (payForm) {
          payForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const tabId = document.getElementById("pay-select-tab").value;
            const method = document.getElementById("pay-method").value;
            const amount = Number(document.getElementById("pay-amount").value || 0);
            const discount = Number(document.getElementById("pay-discount").value || 0);
            const operator = safe(document.getElementById("pay-operator").value.trim()) || "Operador Caixa";

            const ses = state.sessions.find(function(s) { return s.id === tabId; });
            if (!ses) return;

            if(ses.sessionStatus==='Em Atendimento'||ses.sessionStatus==='Reservada'){showToast('Encerre o atendimento antes de cobrar.','error');return;}
            const prev=getSessionFinancials(ses);
            if(!Number.isFinite(amount)||amount<=0||!Number.isFinite(discount)||discount<0||discount>prev.svcPrice+prev.barTotal||cash(amount)>cash(prev.svcPrice+prev.barTotal-discount-prev.paidTotal)){showToast('Valor inválido ou superior ao saldo.','error');return;}
            ses.discount=discount;
            if (discount > 0) {
              ses.discount = discount;
            }
            ses.payments.push({
              method: method,
              amount: amount,
              operator: operator,
              date: "30/10/2026 16:40"
            });

            const fin = getSessionFinancials(ses);
            if (fin.remaining === 0) {
              ses.sessionStatus = "Finalizada & Quitada";
              ses.dateRecebimento = "30/10/2026 16:40";
              showToast("Comanda " + ses.id + " 100% quitada! Cliente liberado e comissão integral de " + fmtBRL(fin.commission) + " liberada para a profissional.", "info");
            } else {
              showToast("Parcela de " + fmtBRL(amount) + " registrada (" + method + "). Saldo pendente na fila: " + fmtBRL(fin.remaining) + ".", "warn");
            }
            renderAll();
          });
        }

        // Caixa Payout Form
        const payoutForm = document.getElementById("caixa-payout-form");
        if (payoutForm) {
          payoutForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const profId = document.getElementById("payout-prof").value;
            const method = document.getElementById("payout-method").value;
            const amount = Number(document.getElementById("payout-amount").value || 0);
            const note = safe(document.getElementById("payout-note").value.trim());

            if(!Number.isFinite(amount)||amount<=0||amount>profBalance(profId)){showToast('Repasse inválido ou superior ao saldo liberado.','error');return;}
            // Check duplicate identical payout
            const dup = state.payouts.find(function(r) {
              return r.profId === profId && r.amount === amount && r.note === note && r.method === method;
            });
            if (dup) {
              showToast("Trava contra duplicidade: Este exato repasse já foi registrado para a profissional.", "error");
              return;
            }

            state.payouts.push({
              id: "REP-" + (state.payouts.length + 1),
              profId: profId,
              amount: amount,
              method: method,
              note: note,
              date: "30/10/2026 18:00"
            });

            renderAll();
            showToast("Repasse registrado (" + method + ": " + fmtBRL(amount) + "). Saldo atualizado.", "info");
          });
        }

        // Simulate Rule R$ 1.240 (4x30m + 6x60m)
        const btnRegra1240 = document.getElementById("btn-simular-regra-1240");
        if (btnRegra1240) {
          btnRegra1240.addEventListener("click", function() {
            const targetProfId = "P1";
            // Remove previous simulation entries if any
            state.sessions = state.sessions.filter(function(s) { return s.id.indexOf("SIM-") !== 0; });

            for (let i = 1; i <= 4; i++) {
              state.sessions.push({
                id: "SIM-30M-" + i,
                clientName: "Simulação 30m #" + i,
                clientType: "Cadastrado",
                profId: targetProfId,
                suiteId: "S3",
                serviceKey: "30",
                startTime: "1" + i + ":00",
                dateAtendimento: "30/10/2026",
                sessionStatus: "Finalizada & Quitada",
                timeAlert: false,
                discount: 0,
                payments: [{ method: "Pix QR Local", amount: 200, operator: "Simulador", date: "30/10/2026" }],
                dateRecebimento: "30/10/2026"
              });
            }
            for (let j = 1; j <= 6; j++) {
              state.sessions.push({
                id: "SIM-60M-" + j,
                clientName: "Simulação 60m #" + j,
                clientType: "Cadastrado",
                profId: targetProfId,
                suiteId: "S4",
                serviceKey: "60",
                startTime: "1" + j + ":30",
                dateAtendimento: "30/10/2026",
                sessionStatus: "Finalizada & Quitada",
                timeAlert: false,
                discount: 0,
                payments: [{ method: "Cartão Crédito", amount: 260, operator: "Simulador", date: "30/10/2026" }],
                dateRecebimento: "30/10/2026"
              });
            }
            renderAll();
            showToast("Simulação carregada: 4 sessões de 30 min (R$ 400) + 6 de 60 min (R$ 840) = R$ 1.240,00 líquidos apurados!", "info");
          });
        }

        // Physical Cash Input Live Change
        const cashPhysInput = document.getElementById("cash-physical-input");
        if (cashPhysInput) {
          cashPhysInput.addEventListener("input", renderCaixaView);
        }

        // Print Modal Controls
        const printModal = document.getElementById("print-modal");
        const btnOpenPrint = document.getElementById("btn-open-print-modal");
        const btnClosePrint = document.getElementById("btn-close-print-modal");
        const btnTriggerPrint = document.getElementById("btn-trigger-browser-print");

        if (btnOpenPrint && printModal) {
          btnOpenPrint.addEventListener("click", function() {
            renderCaixaView();
            printModal.classList.remove("hidden");
          });
        }
        if (btnClosePrint && printModal) {
          btnClosePrint.addEventListener("click", function() {
            printModal.classList.add("hidden");
          });
        }
        if (btnTriggerPrint) {
          btnTriggerPrint.addEventListener("click", function() {
            window.print();
          });
        }

        // Delegated Click Listeners for Dynamic Lists
        document.body.addEventListener("click", function(e) {
          const btnProfCard = e.target.closest(".btn-select-prof-card");
          if (btnProfCard) {
            const pid = btnProfCard.getAttribute("data-pick-prof");
            const sel = document.getElementById("vip-select-prof");
            if (sel && pid) sel.value = pid;
            const formEl = document.getElementById("vip-booking-form");
            if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
            showToast("Profissional selecionada no formulário de reserva ao lado.", "info");
            return;
          }

          const btnToggleStock = e.target.closest(".btn-toggle-stock");
          if (btnToggleStock) {
            const itemId = btnToggleStock.getAttribute("data-toggle-stock");
            const item = state.barMenu.find(function(i) { return i.id === itemId; });
            if (item) {
              item.available = !item.available;
              renderBarQrView();
              showToast("Item '" + item.name + "' " + (item.available ? "reativado no cardápio." : "suspenso temporariamente."), "info");
            }
            return;
          }

          const btnOrderBar = e.target.closest(".btn-order-bar");
          if (btnOrderBar) {
            const itemId = btnOrderBar.getAttribute("data-order-item");
            const item = state.barMenu.find(function(i) { return i.id === itemId; });
            const ses = state.sessions.find(function(s) { return s.id === state.selectedBarSessionId; });
            if (!item || !ses) return;
            if(!item.available){showToast("Item indisponível.","error");return;}

            if (ses.sessionStatus !== "Em Atendimento") {
              showToast("Bloqueado: A sessão " + ses.id + " já foi encerrada e não aceita novos pedidos de QR Code.", "error");
              return;
            }

            // Prevent duplicate unserved order of same item in same session
            const dupOrder = state.barOrders.find(function(o) {
              return o.sessionId === ses.id && o.itemId === item.id && o.status === "Recebido";
            });
            if (dupOrder) {
              showToast("Pedido duplicado evitado: Já existe um '" + item.name + "' recém-solicitado para " + ses.id + ". Avance o status na fila do bar primeiro.", "warn");
              return;
            }

            state.barOrders.unshift({
              id: "ORD-" + (state.barOrders.length + 1),
              sessionId: ses.id,
              itemId: item.id,
              itemName: item.name,
              price: item.price,
              status: "Recebido",
              time: "Agora"
            });
            renderAll();
            showToast(item.name + " adicionado à comanda da sessão " + ses.id + "!", "info");
            return;
          }

          const btnStepOrder = e.target.closest(".btn-step-order");
          if (btnStepOrder) {
            const ordId = btnStepOrder.getAttribute("data-step-order");
            const ord = state.barOrders.find(function(o) { return o.id === ordId; });
            if (ord) {
              if (ord.status === "Recebido") ord.status = "Em Preparo";
              else if (ord.status === "Em Preparo") ord.status = "Entregue";
              renderAll();
            }
            return;
          }

          const btnCancelOrder = e.target.closest(".btn-cancel-order");
          if (btnCancelOrder) {
            const ordId = btnCancelOrder.getAttribute("data-cancel-order");
            const ord = state.barOrders.find(function(o) { return o.id === ordId; });
            if (ord) {
              if(getSessionFinancials(state.sessions.find(s=>s.id===ord.sessionId)).isSettled){showToast('Comanda quitada não pode ser alterada.','error');return;}
              ord.status = "Cancelado";
              renderAll();
              showToast("Pedido " + ord.id + " cancelado e estornado da comanda.", "warn");
            }
            return;
          }

          const btnCleanSuite = e.target.closest(".btn-clean-suite");
          if (btnCleanSuite) {
            const sid = btnCleanSuite.getAttribute("data-clean-suite");
            const suite = getSuite(sid);
            suite.status = "Livre";
            suite.currentSessionId = null;
            renderAll();
            showToast(suite.name + " higienizada e liberada para o próximo atendimento!", "info");
            return;
          }

          const btnAlertSes = e.target.closest(".btn-alert-session");
          if (btnAlertSes) {
            const sesId = btnAlertSes.getAttribute("data-alert-session");
            const ses = state.sessions.find(function(s) { return s.id === sesId; });
            if (ses) {
              ses.timeAlert = true;
              renderAll();
              showToast("Aviso de término simulado no painel da suíte (" + ses.id + "). A sala permanece ocupada até a saída física.", "warn");
            }
            return;
          }

          const btnEndSes = e.target.closest(".btn-end-session");
          if (btnEndSes) {
            const sesId = btnEndSes.getAttribute("data-end-session");
            const ses = state.sessions.find(function(s) { return s.id === sesId; });
            if (ses) {
              ses.sessionStatus = "Encerrada (No Caixa)";
              const suite = getSuite(ses.suiteId);
              suite.status = "Em Limpeza";
              suite.currentSessionId = null;
              const paySelect = document.getElementById("pay-select-tab");
              if (paySelect) paySelect.value = ses.id;
              renderAll();
              showToast("Sessão " + ses.id + " encerrada: comanda enviada à fila do Caixa e " + suite.name + " encaminhada para Limpeza.", "info");
            }
            return;
          }

          const btnToggleProf = e.target.closest(".btn-toggle-prof");
          if (btnToggleProf) {
            const pid = btnToggleProf.getAttribute("data-toggle-prof");
            const prof = state.professionals.find(function(p) { return p.id === pid; });
            if (prof) {
              prof.published = !prof.published;
              renderAll();
              showToast(prof.name + " foi " + (prof.published ? "publicada na escala do dia." : "retirada da escala pública."), "info");
            }
            return;
          }

          const btnDeleteProf = e.target.closest(".btn-delete-prof");
          if (btnDeleteProf) {
            const pid = btnDeleteProf.getAttribute("data-delete-prof");
            if (state.professionals.length <= 1) {
              showToast("Mantenha ao menos 1 perfil ilustrativo cadastrado para demonstração.", "warn");
              return;
            }
            if(state.sessions.some(s=>s.profId===pid)||state.payouts.some(p=>p.profId===pid)){getProf(pid).published=false;renderAll();showToast('Perfil arquivado; histórico preservado.','info');return;}
            state.professionals = state.professionals.filter(function(p) { return p.id !== pid; });
            renderAll();
            showToast("Perfil removido da galeria demonstrativa.", "info");
            return;
          }
        });

        const reservations=document.createElement('div');reservations.id='reservation-reception';document.getElementById('view-recepcao').append(reservations);
        const originalRender=renderAll;
        renderAll=function(){originalRender();reservations.replaceChildren();state.sessions.filter(s=>s.sessionStatus==='Reservada').forEach(s=>{const button=document.createElement('button');button.className='px-4 py-2 m-2 bg-red-900 text-white rounded';button.textContent='Iniciar reserva '+s.id+' / '+getProf(s.profId).name;button.onclick=()=>{const room=getSuite(s.suiteId);if(room.status!=='Livre'||state.sessions.some(a=>a.profId===s.profId&&a.sessionStatus==='Em Atendimento')){showToast('Sala ou profissional indisponível.','error');return;}s.sessionStatus='Em Atendimento';room.status='Ocupada';room.currentSessionId=s.id;renderAll();};reservations.append(button);});};
        // Initial Render & Start Carousel
        renderAll();
        restartCarouselTimer();
      });
    })();
  