import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  name: string;
  email: string;
  password: string;
}

interface PurchasedDomain {
  name: string;
  expires: string;
}

interface VdsServer {
  id: string;
  plan: string;
  ip: string;
  port: string;
  password: string;
  os: string;
  status: "running" | "stopped";
  cpu: number;
  disk: number;
}

type Page = "home" | "domains" | "vds" | "cabinet" | "support" | "vds-panel";

// ─── Data ─────────────────────────────────────────────────────────────────────
const EXTENSIONS = [
  { ext: ".ru", price: 169 },
  { ext: ".net", price: 149 },
  { ext: ".org", price: 189 },
  { ext: ".space", price: 159 },
  { ext: ".me", price: 149 },
  { ext: ".online", price: 229 },
  { ext: ".com", price: 199 },
  { ext: ".fun", price: 130 },
  { ext: ".pw", price: 299 },
  { ext: ".su", price: 500 },
];

const VDS_PLANS = [
  { id: "vds1", name: "Старт", price: 499, ram: "4 ГБ", disk: "128 ГБ", cpu: "AMD RYZEN 5", badge: "" },
  { id: "vds2", name: "Базовый", price: 799, ram: "8 ГБ", disk: "256 ГБ", cpu: "AMD RYZEN 5", badge: "Популярный" },
  { id: "vds3", name: "Продвинутый", price: 1299, ram: "32 ГБ", disk: "512 ГБ", cpu: "AMD RYZEN 5", badge: "Мощный" },
];

const OS_OPTIONS = [
  { id: "ubuntu22", label: "Ubuntu 22.04 LTS" },
  { id: "ubuntu20", label: "Ubuntu 20.04 LTS" },
  { id: "debian12", label: "Debian 12 Bookworm" },
  { id: "debian11", label: "Debian 11 Bullseye" },
];

const FAQ_ITEMS = [
  {
    q: "Как зарегистрировать домен?",
    a: "Введите желаемое имя в строку поиска, выберите подходящее расширение и нажмите «Приобрести». После оплаты домен станет вашим.",
  },
  {
    q: "Что входит в тариф VDS?",
    a: "Все тарифы включают выделенный процессор AMD RYZEN 5, SSD-диск, чистый IP-адрес и доступ к панели управления сервером.",
  },
  {
    q: "Можно ли сменить ОС после покупки?",
    a: "Да, в панели управления VDS вы можете переустановить операционную систему в любое время. Данные при этом будут удалены.",
  },
  {
    q: "Как связаться с поддержкой?",
    a: "Напишите нам через форму ниже или на почту support@spaceru.ru. Время ответа — до 2 часов в рабочее время.",
  },
];

function generateIp() {
  return `${Math.floor(Math.random() * 200 + 20)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254 + 1)}`;
}
function generatePort() {
  return String(Math.floor(Math.random() * 50000 + 10000));
}
function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage, user }: {
  page: Page;
  setPage: (p: Page) => void;
  user: User | null;
}) {
  const navLinks: { label: string; p: Page }[] = [
    { label: "Главная", p: "home" },
    { label: "Домены", p: "domains" },
    { label: "VDS", p: "vds" },
    { label: "Поддержка", p: "support" },
  ];
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[hsl(var(--border))]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => setPage("home")}
          className="flex items-center gap-2 font-bold text-xl text-[hsl(var(--primary))] tracking-tight"
        >
          <span style={{ color: "hsl(var(--accent))" }}>✦</span> SpaceRu
        </button>
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <button
              key={l.p}
              onClick={() => setPage(l.p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                page === l.p
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => setPage("cabinet")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Icon name="User" size={16} />
          <span className="hidden sm:inline">{user ? user.name : "Войти"}</span>
        </button>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSearch({ onSearch, setPage }: { onSearch: (q: string) => void; setPage: (p: Page) => void }) {
  const [query, setQuery] = useState("");
  const handle = () => {
    if (query.trim()) {
      onSearch(query.trim().toLowerCase().replace(/\s+/g, ""));
      setPage("domains");
    }
  };
  return (
    <section className="hero-gradient text-white py-24 px-4">
      <div className="max-w-3xl mx-auto text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium mb-6 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
          Регистрация доменов и VDS-хостинг
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight">
          Ваш адрес<br />
          <span style={{ color: "hsl(210 100% 65%)" }}>в интернете</span>
        </h1>
        <p className="text-white/60 text-lg mb-10">
          Найдите идеальное доменное имя и разместите сайт на мощном сервере
        </p>
        <div className="flex items-center bg-white rounded-2xl overflow-hidden shadow-2xl max-w-xl mx-auto">
          <Icon name="Globe" size={20} className="ml-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Введите домен или слово"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handle()}
            className="flex-1 px-3 py-4 text-gray-800 outline-none text-base bg-transparent font-medium"
          />
          <button
            onClick={handle}
            className="px-6 py-4 font-semibold text-white text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          >
            Подобрать
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {[".ru", ".com", ".net", ".space", ".online"].map((ext) => (
            <span key={ext} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70 font-mono-code">
              {ext}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Domains Page ─────────────────────────────────────────────────────────────
function DomainsPage({ query, setQuery, user, setPage, purchasedDomains, buyDomain }: {
  query: string;
  setQuery: (q: string) => void;
  user: User | null;
  setPage: (p: Page) => void;
  purchasedDomains: PurchasedDomain[];
  buyDomain: (name: string, price: number) => void;
}) {
  const [input, setInput] = useState(query);
  const [searched, setSearched] = useState(!!query);

  useEffect(() => { setInput(query); setSearched(!!query); }, [query]);

  const handle = () => {
    const q = input.trim().toLowerCase().replace(/\s+/g, "");
    if (q) { setQuery(q); setSearched(true); }
  };

  const ownedNames = purchasedDomains.map((d) => d.name);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-black text-[hsl(var(--primary))] mb-2">Поиск домена</h2>
      <p className="text-[hsl(var(--muted-foreground))] mb-8">Введите имя и мы подберём все доступные расширения</p>

      <div className="flex items-center bg-white rounded-2xl overflow-hidden border border-[hsl(var(--border))] shadow-sm mb-10">
        <Icon name="Globe" size={20} className="ml-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Введите домен или слово"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handle()}
          className="flex-1 px-3 py-4 outline-none text-base text-gray-800 bg-transparent font-medium"
        />
        <button
          onClick={handle}
          className="px-6 py-4 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "hsl(var(--primary))" }}
        >
          Подобрать
        </button>
      </div>

      {searched && query && (
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden shadow-sm animate-fade-in">
          <div className="px-6 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Результаты для</span>
            <span className="ml-2 font-mono-code font-bold text-[hsl(var(--primary))] text-base">«{query}»</span>
          </div>
          {EXTENSIONS.map((item, i) => {
            const fullName = `${query}${item.ext}`;
            const owned = ownedNames.includes(fullName);
            return (
              <div key={item.ext} className="domain-row flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  <span className="font-mono-code font-bold text-[hsl(var(--primary))] text-lg">{fullName}</span>
                  <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">свободен</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-[hsl(var(--foreground))] text-lg">{item.price} ₽/год</span>
                  {owned ? (
                    <span className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500 text-sm font-medium">Куплен</span>
                  ) : (
                    <button
                      onClick={() => { if (!user) { setPage("cabinet"); return; } buyDomain(fullName, item.price); }}
                      className="px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "hsl(var(--accent))" }}
                    >
                      Приобрести
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!searched && (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <Icon name="Search" size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Введите имя для поиска доменов</p>
        </div>
      )}
    </div>
  );
}

// ─── Auth Modal for VDS ───────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = () => {
    const stored = localStorage.getItem("spaceru_user");
    if (!stored) { setError("Аккаунт не найден. Зарегистрируйтесь."); return; }
    const u: User = JSON.parse(stored);
    if (u.email === form.email && u.password === form.password) { onSuccess(); }
    else setError("Неверный email или пароль");
  };

  const handleRegister = () => {
    if (!form.name || !form.email || !form.password) { setError("Заполните все поля"); return; }
    if (form.password.length < 6) { setError("Пароль минимум 6 символов"); return; }
    const u: User = { name: form.name, email: form.email, password: form.password };
    localStorage.setItem("spaceru_user", JSON.stringify(u));
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-8 shadow-2xl w-full max-w-sm mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-[hsl(var(--primary))]">Для покупки VDS войдите в аккаунт</h3>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <Icon name="X" size={20} />
          </button>
        </div>
        <div className="flex bg-[hsl(var(--muted))] rounded-xl p-1 mb-4">
          {(["login", "register"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? "bg-white text-[hsl(var(--primary))] shadow-sm" : "text-[hsl(var(--muted-foreground))]"}`}>
              {t === "login" ? "Войти" : "Регистрация"}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {tab === "register" && (
            <input type="text" placeholder="Ваше имя" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] outline-none text-sm" />
          )}
          <input type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] outline-none text-sm" />
          <input type="password" placeholder="Пароль" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && (tab === "login" ? handleLogin() : handleRegister())}
            className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] outline-none text-sm" />
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button onClick={tab === "login" ? handleLogin : handleRegister}
          className="w-full mt-4 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "hsl(var(--primary))" }}>
          {tab === "login" ? "Войти и купить" : "Создать аккаунт и купить"}
        </button>
      </div>
    </div>
  );
}

// ─── VDS Page ─────────────────────────────────────────────────────────────────
function VdsPage({ user, setUser, setPage, buyVds, purchasedVds }: {
  user: User | null;
  setUser: (u: User) => void;
  setPage: (p: Page) => void;
  buyVds: (plan: typeof VDS_PLANS[0]) => void;
  purchasedVds: VdsServer[];
}) {
  const [authModal, setAuthModal] = useState<typeof VDS_PLANS[0] | null>(null);

  const handleBuy = (plan: typeof VDS_PLANS[0]) => {
    if (!user) { setAuthModal(plan); return; }
    buyVds(plan);
  };

  const handleAuthSuccess = () => {
    const stored = localStorage.getItem("spaceru_user");
    if (stored && authModal) {
      setUser(JSON.parse(stored));
      localStorage.setItem("spaceru_loggedin", "1");
      setAuthModal(null);
      buyVds(authModal);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {authModal && <AuthModal onClose={() => setAuthModal(null)} onSuccess={handleAuthSuccess} />}
      <h2 className="text-3xl font-black text-[hsl(var(--primary))] mb-2">Виртуальные серверы VDS</h2>
      <p className="text-[hsl(var(--muted-foreground))] mb-10">Мощные серверы с процессором AMD RYZEN 5 и SSD-дисками</p>
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {VDS_PLANS.map((plan, i) => {
          const bought = purchasedVds.find((v) => v.plan === plan.id);
          return (
            <div key={plan.id}
              className={`card-hover bg-white rounded-2xl border p-6 flex flex-col stagger-${i + 1} animate-fade-in ${
                plan.badge === "Популярный" ? "border-blue-300 accent-glow" : "border-[hsl(var(--border))]"
              }`}
            >
              {plan.badge && (
                <div className="mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: "hsl(var(--accent))" }}>
                    {plan.badge}
                  </span>
                </div>
              )}
              <h3 className="text-xl font-black text-[hsl(var(--primary))] mb-1">{plan.name}</h3>
              <div className="text-3xl font-black text-[hsl(var(--foreground))] mb-1">
                {plan.price} ₽<span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">/мес</span>
              </div>
              <div className="border-t border-[hsl(var(--border))] my-4"></div>
              <ul className="space-y-3 mb-6 flex-1">
                <li className="flex items-center gap-2 text-sm"><Icon name="Cpu" size={16} className="text-blue-500 shrink-0" /><span className="font-medium">{plan.cpu}</span></li>
                <li className="flex items-center gap-2 text-sm"><Icon name="MemoryStick" size={16} className="text-blue-500 shrink-0" /><span className="font-medium">ОЗУ: {plan.ram}</span></li>
                <li className="flex items-center gap-2 text-sm"><Icon name="HardDrive" size={16} className="text-blue-500 shrink-0" /><span className="font-medium">Диск: {plan.disk}</span></li>
              </ul>
              {bought ? (
                <button onClick={() => setPage("cabinet")} className="w-full py-3 rounded-xl bg-green-50 text-green-700 font-bold text-sm border border-green-200 hover:bg-green-100 transition-colors">
                  ✓ Купленный VDS
                </button>
              ) : (
                <button onClick={() => handleBuy(plan)}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "hsl(var(--primary))" }}>
                  Подключить за {plan.price} ₽/мес
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="hero-gradient rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-black mb-1">Нужна помощь с выбором?</h3>
          <p className="text-white/70 text-sm">Наши специалисты подберут оптимальный тариф</p>
        </div>
        <button onClick={() => setPage("support")} className="px-6 py-3 bg-white text-[hsl(var(--primary))] rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shrink-0">
          Связаться с нами
        </button>
      </div>
    </div>
  );
}

// ─── Sparkline Chart ──────────────────────────────────────────────────────────
function SparkLine({ data, color = "#3b82f6", maxVal, unit, tooltip }: {
  data: number[];
  color?: string;
  maxVal: number;
  unit: string;
  tooltip?: { time: string; value: number } | null;
}) {
  const W = 600; const H = 80; const PAD = 4;
  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (v / maxVal) * (H - PAD * 2);
    return `${x},${y}`;
  }).join(" ");
  const area = `M${PAD},${H - PAD} ` + data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (v / maxVal) * (H - PAD * 2);
    return `L${x},${y}`;
  }).join(" ") + ` L${W - PAD},${H - PAD} Z`;

  const lastVal = data[data.length - 1];

  return (
    <div className="relative">
      <div className="flex items-end justify-between mb-1">
        <span className="text-xs text-[hsl(var(--muted-foreground))]">{maxVal} {unit}</span>
        <span className="text-xs font-mono-code font-bold" style={{ color }}>{lastVal.toFixed(1)} {unit}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grad-${color.replace("#","")})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {tooltip && (
          <g>
            <circle
              cx={PAD + ((data.length - 1) / (data.length - 1)) * (W - PAD * 2)}
              cy={H - PAD - (tooltip.value / maxVal) * (H - PAD * 2)}
              r="3" fill={color}
            />
          </g>
        )}
      </svg>
      <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))] mt-1 font-mono-code">
        <span>-24ч</span><span>-12ч</span><span>сейчас</span>
      </div>
    </div>
  );
}

// ─── VDS Panel ────────────────────────────────────────────────────────────────
function VdsPanel({ server, onBack, onReinstall }: {
  server: VdsServer;
  onBack: () => void;
  onReinstall: (os: string) => void;
}) {
  const [showPass, setShowPass] = useState(false);
  const [selectedOs, setSelectedOs] = useState(server.os);
  const [confirmReinstall, setConfirmReinstall] = useState(false);
  const [status, setStatus] = useState(server.status);
  const [activeTab, setActiveTab] = useState<"stats" | "ip" | "history" | "config">("stats");
  const planInfo = VDS_PLANS.find((p) => p.id === server.plan);

  const genHistory = (base: number, noise: number, len = 60) =>
    Array.from({ length: len }, (_, i) => {
      const spike = (i === 38 || i === 55) ? base * 3 : 0;
      return Math.max(0, base + (Math.random() - 0.5) * noise + spike);
    });

  const [cpuData, setCpuData] = useState(() => genHistory(4, 6));
  const [ramData, setRamData] = useState(() => genHistory(15, 8));
  const [diskData, setDiskData] = useState(() => genHistory(8, 15));
  const [netInData, setNetInData] = useState(() => genHistory(12, 20));
  const [netOutData, setNetOutData] = useState(() => genHistory(6, 10));
  const [iopsData, setIopsData] = useState(() => genHistory(30, 80));

  const ramTotal = planInfo?.ram === "4 ГБ" ? 4 : planInfo?.ram === "8 ГБ" ? 8 : 32;
  const diskTotal = planInfo?.disk === "128 ГБ" ? 128 : planInfo?.disk === "256 ГБ" ? 256 : 512;

  useEffect(() => {
    const interval = setInterval(() => {
      const push = (arr: number[], base: number, noise: number) =>
        [...arr.slice(1), Math.max(0, base + (Math.random() - 0.5) * noise)];
      setCpuData((d) => push(d, 4, 6));
      setRamData((d) => push(d, 15, 8));
      setDiskData((d) => push(d, 8, 15));
      setNetInData((d) => push(d, 12, 20));
      setNetOutData((d) => push(d, 6, 10));
      setIopsData((d) => push(d, 30, 80));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRestart = () => {
    setStatus("stopped");
    setTimeout(() => setStatus("running"), 2500);
  };

  const historyEvents = [
    { date: "04.05.2025 07:00", event: "Пиковая нагрузка CPU — 87%" },
    { date: "03.05.2025 18:30", event: "Перезагрузка сервера" },
    { date: "02.05.2025 12:10", event: "Сервер запущен" },
    { date: "01.05.2025 09:00", event: "Покупка VDS — тариф " + planInfo?.name },
  ];

  const tabs = [
    { id: "stats", label: "Статистика", icon: "BarChart2" },
    { id: "ip", label: "IP-адреса", icon: "Monitor" },
    { id: "history", label: "История", icon: "Clock" },
    { id: "config", label: "ОС/Конфигурация", icon: "Settings" },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6 transition-colors text-sm font-medium">
        <Icon name="ArrowLeft" size={16} /> Назад
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "hsl(var(--primary))" }}>
          <Icon name="Server" size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-[hsl(var(--primary))]">VDS — {planInfo?.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${status === "running" ? "bg-green-400" : "bg-orange-400 animate-pulse"}`}></span>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">{status === "running" ? "Работает" : "Перезагрузка..."}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleRestart} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors">
            <Icon name="RotateCcw" size={13} /> Рестарт
          </button>
          <button onClick={handleRestart} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors">
            <Icon name="RefreshCw" size={13} /> Перезагрузить
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[hsl(var(--muted))] rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === t.id ? "bg-white text-[hsl(var(--primary))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}>
            <Icon name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Stats Tab ── */}
      {activeTab === "stats" && (
        <div className="space-y-0 bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
          {/* vCPU */}
          <div className="px-6 py-5 border-b border-[hsl(var(--border))]">
            <div className="flex items-baseline gap-3 mb-3">
              <h3 className="font-bold text-[hsl(var(--foreground))]">vCPU</h3>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">100%</span>
            </div>
            <SparkLine data={cpuData} color="#3b82f6" maxVal={100} unit="%" />
          </div>
          {/* RAM */}
          <div className="px-6 py-5 border-b border-[hsl(var(--border))]">
            <div className="flex items-baseline gap-3 mb-3">
              <h3 className="font-bold text-[hsl(var(--foreground))]">RAM</h3>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{ramTotal} ГБ</span>
            </div>
            <SparkLine data={ramData} color="#8b5cf6" maxVal={100} unit="%" />
          </div>
          {/* Storage */}
          <div className="px-6 py-5 border-b border-[hsl(var(--border))]">
            <div className="flex items-baseline gap-3 mb-3">
              <h3 className="font-bold text-[hsl(var(--foreground))]">Storage</h3>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{diskTotal} ГБ</span>
            </div>
            <SparkLine data={diskData} color="#10b981" maxVal={100} unit="%" />
          </div>
          {/* Network */}
          <div className="px-6 py-5 border-b border-[hsl(var(--border))]">
            <div className="flex items-baseline gap-3 mb-3">
              <h3 className="font-bold text-[hsl(var(--foreground))]">Сеть — входящий</h3>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Мбит/с</span>
            </div>
            <SparkLine data={netInData} color="#f59e0b" maxVal={100} unit="Мбит/с" />
          </div>
          <div className="px-6 py-5 border-b border-[hsl(var(--border))]">
            <div className="flex items-baseline gap-3 mb-3">
              <h3 className="font-bold text-[hsl(var(--foreground))]">Сеть — исходящий</h3>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Мбит/с</span>
            </div>
            <SparkLine data={netOutData} color="#06b6d4" maxVal={100} unit="Мбит/с" />
          </div>
          {/* IOPS */}
          <div className="px-6 py-5">
            <div className="flex items-baseline gap-3 mb-3">
              <h3 className="font-bold text-[hsl(var(--foreground))]">Операции ввода-вывода</h3>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">246 IOPS</span>
            </div>
            <SparkLine data={iopsData} color="#ef4444" maxVal={500} unit="IOPS" />
          </div>
        </div>
      )}

      {/* ── IP Tab ── */}
      {activeTab === "ip" && (
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
          <div className="px-6 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 flex items-center gap-2">
            <Icon name="Monitor" size={16} className="text-blue-500" />
            <h3 className="font-black text-[hsl(var(--primary))]">IP-адреса</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[hsl(var(--muted))]/40 rounded-xl">
              <div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">IPv4 (основной)</div>
                <div className="font-mono-code font-bold text-[hsl(var(--primary))] text-lg">{server.ip}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">SSH порт: {server.port}</div>
              </div>
              <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Активен
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[hsl(var(--muted))]/40 rounded-xl">
              <div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">IPv6</div>
                <div className="font-mono-code font-bold text-[hsl(var(--primary))] text-sm">2a02:6b8:c0e::{server.ip.split(".").pop()}:1</div>
              </div>
              <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Активен
              </span>
            </div>
            <div className="border-t border-[hsl(var(--border))] pt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">Пароль root</div>
              <div className="flex items-center gap-2 bg-[hsl(var(--muted))] rounded-xl px-4 py-3">
                <span className="font-mono-code text-sm flex-1 text-[hsl(var(--foreground))] break-all">
                  {showPass ? server.password : "••••••••••••••••"}
                </span>
                <button onClick={() => setShowPass(!showPass)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] shrink-0">
                  <Icon name={showPass ? "EyeOff" : "Eye"} size={16} />
                </button>
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">Пользователь: root</div>
            </div>
          </div>
        </div>
      )}

      {/* ── History Tab ── */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
          <div className="px-6 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 flex items-center gap-2">
            <Icon name="Clock" size={16} className="text-blue-500" />
            <h3 className="font-black text-[hsl(var(--primary))]">История событий</h3>
          </div>
          <div className="divide-y divide-[hsl(var(--border))]">
            {historyEvents.map((ev, i) => (
              <div key={i} className="flex items-start gap-4 px-6 py-4">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                <div>
                  <div className="font-medium text-[hsl(var(--foreground))] text-sm">{ev.event}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] font-mono-code mt-0.5">{ev.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Config Tab ── */}
      {activeTab === "config" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6">
            <h3 className="font-black text-[hsl(var(--primary))] mb-4">Конфигурация</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Процессор", val: planInfo?.cpu || "AMD RYZEN 5", icon: "Cpu" },
                { label: "ОЗУ", val: planInfo?.ram || "—", icon: "MemoryStick" },
                { label: "Диск", val: planInfo?.disk || "—", icon: "HardDrive" },
                { label: "Сеть", val: "1 Гбит/с", icon: "Wifi" },
                { label: "Тариф", val: planInfo?.name || "—", icon: "Package" },
                { label: "Дата создания", val: "01.05.2025", icon: "Calendar" },
              ].map((item) => (
                <div key={item.label} className="bg-[hsl(var(--muted))]/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name={item.icon} size={14} className="text-blue-500" />
                    <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{item.label}</span>
                  </div>
                  <div className="font-bold text-[hsl(var(--primary))] text-sm">{item.val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6">
            <h3 className="font-black text-[hsl(var(--primary))] mb-4">Переустановка ОС</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {OS_OPTIONS.map((os) => (
                <button key={os.id} onClick={() => setSelectedOs(os.id)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-colors text-left ${
                    selectedOs === os.id ? "border-blue-400 bg-blue-50 text-[hsl(var(--primary))]" : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                  }`}>
                  <div className="text-lg mb-1">🐧</div>
                  <div className="text-xs leading-tight">{os.label}</div>
                </button>
              ))}
            </div>
            {!confirmReinstall ? (
              <button onClick={() => setConfirmReinstall(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors">
                <Icon name="Trash2" size={14} /> Переустановить систему
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-red-600 font-medium">Все данные будут удалены. Продолжить?</span>
                <button onClick={() => { onReinstall(selectedOs); setConfirmReinstall(false); }}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:opacity-90">
                  Да, переустановить
                </button>
                <button onClick={() => setConfirmReinstall(false)}
                  className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))]">
                  Отмена
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Cabinet ──────────────────────────────────────────────────────────────────
function CabinetPage({ user, setUser, setPage, purchasedDomains, purchasedVds, setActiveVds }: {
  user: User | null;
  setUser: (u: User | null) => void;
  setPage: (p: Page) => void;
  purchasedDomains: PurchasedDomain[];
  purchasedVds: VdsServer[];
  setActiveVds: (v: VdsServer) => void;
}) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = () => {
    const stored = localStorage.getItem("spaceru_user");
    if (!stored) { setError("Аккаунт не найден. Зарегистрируйтесь."); return; }
    const u: User = JSON.parse(stored);
    if (u.email === form.email && u.password === form.password) { setUser(u); setError(""); }
    else setError("Неверный email или пароль");
  };

  const handleRegister = () => {
    if (!form.name || !form.email || !form.password) { setError("Заполните все поля"); return; }
    if (form.password.length < 6) { setError("Пароль минимум 6 символов"); return; }
    const u: User = { name: form.name, email: form.email, password: form.password };
    localStorage.setItem("spaceru_user", JSON.stringify(u));
    setUser(u);
    setError("");
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-8 shadow-sm animate-scale-in">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "hsl(var(--primary))" }}>
              <Icon name="User" size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-[hsl(var(--primary))]">
              {tab === "login" ? "Войти в аккаунт" : "Создать аккаунт"}
            </h2>
          </div>
          <div className="flex bg-[hsl(var(--muted))] rounded-xl p-1 mb-6">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  tab === t ? "bg-white text-[hsl(var(--primary))] shadow-sm" : "text-[hsl(var(--muted-foreground))]"
                }`}
              >
                {t === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {tab === "register" && (
              <input type="text" placeholder="Ваше имя" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] outline-none text-sm"
              />
            )}
            <input type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] outline-none text-sm"
            />
            <input type="password" placeholder="Пароль" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && (tab === "login" ? handleLogin() : handleRegister())}
              className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] outline-none text-sm"
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          <button
            onClick={tab === "login" ? handleLogin : handleRegister}
            className="w-full mt-5 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          >
            {tab === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-[hsl(var(--primary))]">Личный кабинет</h2>
          <p className="text-[hsl(var(--muted-foreground))]">{user.email}</p>
        </div>
        <button
          onClick={() => { setUser(null); localStorage.removeItem("spaceru_loggedin"); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
        >
          <Icon name="LogOut" size={14} />
          Выйти
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5 text-center">
          <div className="text-3xl font-black text-[hsl(var(--primary))]">{purchasedDomains.length}</div>
          <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Доменов</div>
        </div>
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5 text-center">
          <div className="text-3xl font-black text-[hsl(var(--primary))]">{purchasedVds.length}</div>
          <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">VDS серверов</div>
        </div>
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5 text-center">
          <div className="text-3xl font-black text-green-500">Активен</div>
          <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Статус аккаунта</div>
        </div>
      </div>

      {purchasedDomains.length > 0 && (
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
            <h3 className="font-black text-[hsl(var(--primary))]">Мои домены</h3>
          </div>
          {purchasedDomains.map((d) => (
            <div key={d.name} className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]/50 last:border-0">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                <span className="font-mono-code font-bold text-[hsl(var(--primary))]">{d.name}</span>
              </div>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">до {d.expires}</span>
            </div>
          ))}
        </div>
      )}

      {purchasedVds.length > 0 && (
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
          <div className="px-6 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
            <h3 className="font-black text-[hsl(var(--primary))]">Мои серверы VDS</h3>
          </div>
          {purchasedVds.map((vds) => {
            const plan = VDS_PLANS.find((p) => p.id === vds.plan);
            return (
              <div key={vds.id} className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(var(--primary))" }}>
                    <Icon name="Server" size={14} className="text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-[hsl(var(--primary))] text-sm">VDS {plan?.name}</div>
                    <div className="font-mono-code text-xs text-[hsl(var(--muted-foreground))]">{vds.ip}:{vds.port}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setActiveVds(vds); setPage("vds-panel"); }}
                  className="px-4 py-2 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "hsl(var(--accent))" }}
                >
                  Купленный VDS
                </button>
              </div>
            );
          })}
        </div>
      )}

      {purchasedDomains.length === 0 && purchasedVds.length === 0 && (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <Icon name="ShoppingBag" size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium mb-4">У вас пока нет покупок</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setPage("domains")} className="px-4 py-2 text-white rounded-xl text-sm font-medium hover:opacity-90" style={{ backgroundColor: "hsl(var(--primary))" }}>
              Найти домен
            </button>
            <button onClick={() => setPage("vds")} className="px-4 py-2 border border-[hsl(var(--border))] rounded-xl text-sm font-medium hover:bg-[hsl(var(--muted))]">
              Выбрать VDS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Support ──────────────────────────────────────────────────────────────────
function SupportPage() {
  const [open, setOpen] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-black text-[hsl(var(--primary))] mb-2">Поддержка</h2>
      <p className="text-[hsl(var(--muted-foreground))] mb-10">Мы всегда готовы помочь</p>
      <div className="bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden mb-10">
        <div className="px-6 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
          <h3 className="font-black text-[hsl(var(--primary))]">Часто задаваемые вопросы</h3>
        </div>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="border-b border-[hsl(var(--border))]/50 last:border-0">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[hsl(var(--muted))]/40 transition-colors"
            >
              <span className="font-semibold text-[hsl(var(--foreground))] text-sm">{item.q}</span>
              <Icon name={open === i ? "ChevronUp" : "ChevronDown"} size={16} className="shrink-0 text-[hsl(var(--muted-foreground))]" />
            </button>
            {open === i && (
              <div className="px-6 pb-4 text-sm text-[hsl(var(--muted-foreground))] animate-fade-in">{item.a}</div>
            )}
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6">
        <h3 className="font-black text-[hsl(var(--primary))] mb-4">Написать в поддержку</h3>
        {sent ? (
          <div className="text-center py-8 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <Icon name="CheckCircle" size={24} className="text-green-500" />
            </div>
            <p className="font-bold text-[hsl(var(--foreground))]">Сообщение отправлено!</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Мы ответим в течение 2 часов</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Ваше имя" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="px-4 py-3 rounded-xl border border-[hsl(var(--border))] outline-none text-sm"
              />
              <input type="email" placeholder="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="px-4 py-3 rounded-xl border border-[hsl(var(--border))] outline-none text-sm"
              />
            </div>
            <textarea placeholder="Опишите вашу проблему..." value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] outline-none text-sm resize-none"
            />
            <button
              onClick={() => { if (form.message) setSent(true); }}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "hsl(var(--primary))" }}
            >
              Отправить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-[hsl(var(--primary))] mb-8 text-center">Почему выбирают SpaceRu</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "Zap", title: "Мгновенная активация", desc: "Домен активируется в течение нескольких минут после оплаты" },
            { icon: "Shield", title: "Надёжная защита", desc: "SSL-сертификаты и защита от DDoS для всех тарифов" },
            { icon: "Headphones", title: "Поддержка 24/7", desc: "Наша команда всегда готова помочь с любыми вопросами" },
          ].map((f, i) => (
            <div key={i} className={`card-hover bg-white rounded-2xl border border-[hsl(var(--border))] p-6 animate-fade-in stagger-${i + 1}`}>
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: "hsl(var(--accent))" }}>
                <Icon name={f.icon} size={20} className="text-white" />
              </div>
              <h3 className="font-black text-[hsl(var(--primary))] mb-2">{f.title}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[hsl(var(--muted))]/50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-black text-[hsl(var(--primary))] mb-2 text-center">Популярные расширения</h2>
          <p className="text-center text-[hsl(var(--muted-foreground))] mb-8 text-sm">Зарегистрируйте домен уже сегодня</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {EXTENSIONS.map((e, i) => (
              <button key={e.ext} onClick={() => setPage("domains")}
                className={`card-hover bg-white rounded-2xl border border-[hsl(var(--border))] p-4 text-center animate-fade-in stagger-${i + 1}`}
              >
                <div className="font-mono-code font-black text-xl text-[hsl(var(--primary))] mb-1">{e.ext}</div>
                <div className="text-[hsl(var(--muted-foreground))] text-sm">от {e.price} ₽/год</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="hero-gradient rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-black mb-3">Готовы начать?</h2>
          <p className="text-white/70 mb-6">Зарегистрируйте домен и запустите сервер за 5 минут</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <button onClick={() => setPage("domains")} className="px-6 py-3 bg-white text-[hsl(var(--primary))] rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
              Найти домен
            </button>
            <button onClick={() => setPage("vds")} className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors border border-white/20">
              Выбрать VDS
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-xl text-[hsl(var(--primary))]">
            <span style={{ color: "hsl(var(--accent))" }}>✦</span> SpaceRu
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
            {([["Домены", "domains"], ["VDS", "vds"], ["Поддержка", "support"]] as [string, Page][]).map(([label, p]) => (
              <button key={p} onClick={() => setPage(p)} className="hover:text-[hsl(var(--foreground))] transition-colors">{label}</button>
            ))}
          </div>
          <div className="text-sm text-[hsl(var(--muted-foreground))]">© 2025 SpaceRu. Все права защищены.</div>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [domainQuery, setDomainQuery] = useState("");
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("spaceru_user");
      const loggedIn = localStorage.getItem("spaceru_loggedin");
      if (stored && loggedIn) return JSON.parse(stored);
    } catch (e) { console.error(e); }
    return null;
  });
  const [purchasedDomains, setPurchasedDomains] = useState<PurchasedDomain[]>(() => {
    try { return JSON.parse(localStorage.getItem("spaceru_domains") || "[]"); } catch { return []; }
  });
  const [purchasedVds, setPurchasedVds] = useState<VdsServer[]>(() => {
    try { return JSON.parse(localStorage.getItem("spaceru_vds") || "[]"); } catch { return []; }
  });
  const [activeVds, setActiveVds] = useState<VdsServer | null>(null);

  const handleSetUser = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem("spaceru_loggedin", "1");
    else localStorage.removeItem("spaceru_loggedin");
  };

  const buyDomain = (name: string, _price: number) => {
    const expYear = new Date().getFullYear() + 1;
    const d: PurchasedDomain = { name, expires: `01.01.${expYear}` };
    const next = [...purchasedDomains, d];
    setPurchasedDomains(next);
    localStorage.setItem("spaceru_domains", JSON.stringify(next));
  };

  const buyVds = (plan: typeof VDS_PLANS[0]) => {
    const vds: VdsServer = {
      id: Date.now().toString(),
      plan: plan.id,
      ip: generateIp(),
      port: generatePort(),
      password: generatePassword(),
      os: "ubuntu22",
      status: "running",
      cpu: Math.floor(Math.random() * 30 + 5),
      disk: Math.floor(Math.random() * 40 + 10),
    };
    const next = [...purchasedVds, vds];
    setPurchasedVds(next);
    localStorage.setItem("spaceru_vds", JSON.stringify(next));
    setPage("cabinet");
  };

  const handleReinstall = (os: string) => {
    if (!activeVds) return;
    const updated = purchasedVds.map((v) => v.id === activeVds.id ? { ...v, os } : v);
    setPurchasedVds(updated);
    localStorage.setItem("spaceru_vds", JSON.stringify(updated));
    setActiveVds({ ...activeVds, os });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <Navbar page={page} setPage={setPage} user={user} />

      {page === "home" && (
        <>
          <HeroSearch onSearch={(q) => { setDomainQuery(q); }} setPage={setPage} />
          <HomePage setPage={setPage} />
        </>
      )}
      {page === "domains" && (
        <DomainsPage
          query={domainQuery}
          setQuery={setDomainQuery}
          user={user}
          setPage={setPage}
          purchasedDomains={purchasedDomains}
          buyDomain={buyDomain}
        />
      )}
      {page === "vds" && (
        <VdsPage user={user} setUser={(u) => handleSetUser(u)} setPage={setPage} buyVds={buyVds} purchasedVds={purchasedVds} />
      )}
      {page === "vds-panel" && activeVds && (
        <VdsPanel server={activeVds} onBack={() => setPage("cabinet")} onReinstall={handleReinstall} />
      )}
      {page === "cabinet" && (
        <CabinetPage
          user={user}
          setUser={handleSetUser}
          setPage={setPage}
          purchasedDomains={purchasedDomains}
          purchasedVds={purchasedVds}
          setActiveVds={setActiveVds}
        />
      )}
      {page === "support" && <SupportPage />}

      <Footer setPage={setPage} />
    </div>
  );
}