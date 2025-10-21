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

// ====== ショップ購入・更新など ======
// ...（ここは前回のものと同じなので省略）...

// ====== ランダムイベント（履歴付き・スクロール可能） ======
function tryRandomEvent() {
  // 発生確率：運Lv0で5分に1回、Lv最大で5秒に1回
  const baseChance = 1 / (60 * (300 - (luckLevel / MAX_LUCK) * (300 - 5)));
  if (Math.random() < baseChance) {
    const rewardType = Math.random();
    let msg;
    if (rewardType < 0.5) {
      const gain = Math.floor(applyInflation(500 + Math.random() * 500));
      money += gain;
      msg = `💸 ラッキー！臨時収入 +${formatNumber(gain)}円✨`;
    } else {
      const gain = Math.floor(30 + Math.random() * 70);
      popularity += gain;
      msg = `🎉 話題沸騰！人気 +${formatNumber(gain)}✨`;
    }

    // 履歴の先頭に追加
    const log = document.createElement("div");
    log.textContent = msg;
    log.className = "eventLog";
    eventMessage.prepend(log);

    // 古い履歴を一定数で削除（多すぎ防止）
    if (eventMessage.children.length > 100) {
      eventMessage.removeChild(eventMessage.lastChild);
    }

    update();
  }
}

// ====== 転生など他の関数はすべて同じ ======

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
