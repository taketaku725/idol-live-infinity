// ====== 初期値 ======
let popularity = 0;
let stamina = 10;
let maxStamina = 10;
let money = 0;

let practiceLevel = 1;
let liveLevel = 1;
let adLevel = 0;
let sponsorLevel = 0;
let goodsLevel = 0;
let fanclubLevel = 0;
let streamLevel = 0;
let luckLevel = 0;
let staminaLevel = 0;

let passiveIncome = 0;
let practiceCount = 0;

let rebirthCount = 0;
let inflationTotal = 0;
let lastRebirthBonus = 0;

const MAX_LUCK = 10000;

// ====== 要素 ======
const popDisplay = document.getElementById("popularity");
const staDisplay = document.getElementById("stamina");
const moneyDisplay = document.getElementById("money");
const ipsDisplay = document.getElementById("ips");
const message = document.getElementById("message");
const eventMessage = document.getElementById("eventMessage");
const costDisplay = document.getElementById("costMessage");

const rebirthBtn = document.getElementById("rebirthBtn");
const rebirthCountDisplay = document.getElementById("rebirthCount");

const luckFill = document.getElementById("luckFill");
const luckLvDisplay = document.getElementById("luckLv");

const shopItems = {
  practice: document.getElementById("practiceItem"),
  live: document.getElementById("liveItem"),
  ad: document.getElementById("adItem"),
  sponsor: document.getElementById("sponsorItem"),
  goods: document.getElementById("goodsItem"),
  fanclub: document.getElementById("fanclubItem"),
  stream: document.getElementById("streamItem"),
  luck: document.getElementById("luckItem"),
  stamina: document.getElementById("staminaItem")
};

// ====== 共通関数 ======
function getPrice(base, level, mult = 1.3) {
  return Math.floor(base * Math.pow(mult, level));
}
function applyInflation(value) {
  return value * (1 + inflationTotal);
}
function formatNumber(num) {
  return Math.floor(num).toLocaleString();
}

// ====== メッセージ表示 ======
function setMessage(text) {
  message.classList.remove("flashMsg");
  void message.offsetWidth;
  message.textContent = text;
  message.classList.add("flashMsg");
}

// ====== 練習 ======
document.getElementById("practice").onclick = () => {
  const cost = Math.floor(1 + (practiceLevel - 1) * 0.2);
  if (stamina < cost) {
    setMessage("体力が足りないよ…");
    return;
  }
  const gainMoney = Math.floor(applyInflation(10 * practiceLevel));
  money += gainMoney;
  stamina -= cost;
  practiceCount++;
  setMessage(`練習して +${formatNumber(gainMoney)}円！（体力 -${cost}）`);

  if (practiceCount % 10 === 0) {
    maxStamina += 5;
    setMessage(`💪 練習で成長！最大体力 +5✨（今: ${maxStamina}）`);
  }
  update();
};

// ====== ライブ ======
document.getElementById("live").onclick = () => {
  const cost = Math.floor(20 + (liveLevel - 1) * 1.5);
  if (stamina < cost) {
    setMessage("体力がないとステージは無理だよ〜");
    return;
  }
  const sales = Math.floor(applyInflation((20 + popularity * 1.2) * liveLevel));
  const popGain = 10 * liveLevel;
  money += sales;
  popularity += popGain;
  stamina -= cost;
  setMessage(`ライブ成功！売上 +${formatNumber(sales)}円✨ 人気 +${formatNumber(popGain)}（体力 -${cost}）`);
  update();
};

// ====== 休憩 ======
document.getElementById("rest").onclick = () => {
  if (stamina >= maxStamina) {
    setMessage("もう元気いっぱいだよ！");
    return;
  }
  stamina = maxStamina;
  const lostPop = Math.min(2 + Math.floor(popularity / 100), popularity);
  const lostMoney = Math.min(5 + Math.floor(popularity / 50), money);
  popularity -= lostPop;
  money -= lostMoney;
  setMessage(`休憩して全回復！人気 -${formatNumber(lostPop)}・お金 -${formatNumber(lostMoney)}円`);
  update();
};

// ====== 必要体力表示 ======
document.getElementById("practice").onmouseenter = () => {
  const cost = Math.floor(1 + (practiceLevel - 1) * 0.2);
  costDisplay.textContent = `必要体力：${cost}`;
};
document.getElementById("live").onmouseenter = () => {
  const cost = Math.floor(20 + (liveLevel - 1) * 1.5);
  costDisplay.textContent = `必要体力：${cost}`;
};
["practice", "live", "rest"].forEach(id => {
  document.getElementById(id).onmouseleave = () => costDisplay.textContent = "　";
});

// ====== 運ゲージ更新 ======
function updateLuckBar() {
  const ratio = Math.min(1, luckLevel / MAX_LUCK);
  luckFill.style.width = `${ratio * 100}%`;
  luckLvDisplay.textContent = luckLevel;
}

// ====== ショップ購入 ======
function buyUpgrade(type, baseCost, level) {
  const cost = getPrice(baseCost, level);
  if (money < cost) {
    setMessage(`お金が足りない…（必要：${formatNumber(cost)}円）`);
    return;
  }
  if (type === "luck" && luckLevel >= MAX_LUCK) {
    setMessage("🍀 これ以上は天運の極み！");
    return;
  }

  money -= cost;
  switch (type) {
    case "practice": practiceLevel++; setMessage(`練習Lv${practiceLevel}にアップ！`); break;
    case "live": liveLevel++; setMessage(`ライブLv${liveLevel}にアップ！`); break;
    case "stream": streamLevel++; passiveIncome += Math.floor(applyInflation(80 + streamLevel * 10)); break;
    case "goods": goodsLevel++; passiveIncome += Math.floor(applyInflation(150 + goodsLevel * 20)); break;
    case "fanclub": fanclubLevel++; passiveIncome += Math.floor(applyInflation(500 + fanclubLevel * 40)); break;
    case "ad": adLevel++; passiveIncome += Math.floor(applyInflation(1500 + adLevel * 100)); break;
    case "sponsor": sponsorLevel++; passiveIncome += Math.floor(applyInflation(6000 + sponsorLevel * 250)); break;
    case "luck":
      luckLevel++;
      if (luckLevel > MAX_LUCK) luckLevel = MAX_LUCK;
      setMessage(`運Lv${luckLevel}🍀 上昇！`);
      updateLuckBar();
      break;
    case "stamina":
      staminaLevel++;
      const gain = 10 + staminaLevel * 2;
      maxStamina += gain;
      setMessage(`体力Lv${staminaLevel}💪 最大体力 +${gain}`);
      break;
  }
  update();
}

// ====== ショップ更新（リアルタイム反映） ======
function updatePrices() {
  const list = [
    ["practice", 500, practiceLevel],
    ["live", 1000, liveLevel],
    ["stream", 1000, streamLevel],
    ["goods", 3000, goodsLevel],
    ["fanclub", 8000, fanclubLevel],
    ["ad", 20000, adLevel],
    ["sponsor", 80000, sponsorLevel],
    ["luck", 1200, luckLevel],
    ["stamina", 1500, staminaLevel]
  ];

  list.forEach(([key, base, lv]) => {
    const item = shopItems[key];
    if (!item || item.style.display === "none") return;
    const price = getPrice(base, lv);
    const btn = item.querySelector("button");
    let priceTag = item.querySelector(".priceTag");
    let lvTag = item.querySelector(".lvTag");
    if (!priceTag) {
      priceTag = document.createElement("span");
      priceTag.className = "priceTag";
      item.appendChild(priceTag);
    }
    if (!lvTag) {
      lvTag = document.createElement("span");
      lvTag.className = "lvTag";
      item.appendChild(lvTag);
    }
    priceTag.textContent = `${formatNumber(price)}円`;
    lvTag.textContent = `Lv.${lv}`;

    const maxed = key === "luck" && luckLevel >= MAX_LUCK;
    const cantBuy = money < price || maxed;

    btn.style.filter = cantBuy ? "brightness(0.7)" : "brightness(1)";
    btn.style.cursor = cantBuy ? "not-allowed" : "pointer";

    btn.onclick = () => {
      if (cantBuy) {
        if (maxed) setMessage("🍀 これ以上は天運の極み！");
        else setMessage("お金が足りないよ…！");
        return;
      }
      buyUpgrade(key, base, lv);
    };
  });
}

// ====== 解放条件（転生ボタン追加） ======
function checkUnlocks() {
  if (popularity >= 1000 && shopItems.stream.style.display === "none") {
    shopItems.stream.style.display = "flex";
    shopItems.luck.style.display = "flex";
    setMessage("🎥 配信活動・運アップが解放された！");
  }
  if (popularity >= 3000 && shopItems.goods.style.display === "none") {
    shopItems.goods.style.display = "flex";
    setMessage("🛍 グッズ販売が解放された！");
  }
  if (popularity >= 10000 && shopItems.fanclub.style.display === "none") {
    shopItems.fanclub.style.display = "flex";
    setMessage("💌 ファンクラブが解放された！");
  }
  if (popularity >= 30000 && shopItems.ad.style.display === "none") {
    shopItems.ad.style.display = "flex";
    setMessage("🪧 広告契約が解放された！");
  }
  if (popularity >= 100000 && shopItems.sponsor.style.display === "none") {
    shopItems.sponsor.style.display = "flex";
    setMessage("🤝 スポンサー契約が解放された！");
  }

  // 🌟 転生ボタン解放
  if (popularity >= 10000) {
    rebirthBtn.style.display = "inline-block";
  } else {
    rebirthBtn.style.display = "none";
  }
}

// ====== ランダムイベント（運依存） ======
function tryRandomEvent() {
  const baseChance = 1 / (30000 - (luckLevel / MAX_LUCK) * (30000 - 300));
  if (Math.random() < baseChance) {
    const rewardType = Math.random();
    if (rewardType < 0.5) {
      const gain = Math.floor(applyInflation(500 + Math.random() * 500));
      money += gain;
      eventMessage.textContent = `💸 ラッキー！臨時収入 +${formatNumber(gain)}円✨`;
    } else {
      const gain = Math.floor(30 + Math.random() * 70);
      popularity += gain;
      eventMessage.textContent = `🎉 話題沸騰！人気 +${formatNumber(gain)}✨`;
    }
    setTimeout(() => (eventMessage.textContent = ""), 5000);
    update();
  }
}

// ====== 転生 ======
function calcRebirthBonus(pop) { return Math.max(0.10, Number((pop / 100000).toFixed(2))); }
function doRebirth() {
  if (popularity < 10000) return;
  if (!confirm("本当に転生しますか？")) return;
  const bonus = calcRebirthBonus(popularity);
  const add = Math.max(bonus, lastRebirthBonus);
  inflationTotal += add;
  lastRebirthBonus = add;
  rebirthCount++;

  popularity = 0; money = 0; stamina = 10; maxStamina = 10;
  practiceLevel = liveLevel = 1;
  adLevel = sponsorLevel = goodsLevel = fanclubLevel = streamLevel = luckLevel = staminaLevel = 0;
  passiveIncome = 0; practiceCount = 0;

  Object.values(shopItems).forEach(i => {
    if (i.id !== "practiceItem" && i.id !== "liveItem" && i.id !== "staminaItem") i.style.display = "none";
  });

  setMessage(`🔁転生完了！倍率 +${add.toFixed(2)}（累計 ×${(1 + inflationTotal).toFixed(2)}）`);
  update();
}
rebirthBtn.onclick = doRebirth;

// ====== UI更新 ======
function update() {
  popDisplay.textContent = formatNumber(popularity);
  staDisplay.textContent = `${stamina}/${maxStamina}`;
  moneyDisplay.textContent = formatNumber(money);
  ipsDisplay.textContent = formatNumber(passiveIncome);
  rebirthCountDisplay.textContent = rebirthCount;
  updateLuckBar();
  updatePrices();
  checkUnlocks();
}

// ====== メインループ ======
let last = performance.now();
function loop(t) {
  const dt = (t - last) / 1000;
  last = t;
  money += passiveIncome * dt;
  if (Math.random() < 0.002) tryRandomEvent();
  update();
  requestAnimationFrame(loop);
}
update();
requestAnimationFrame(loop);
