const from = document.getElementById("from");
const to = document.getElementById("to");
const convertBtn = document.getElementById("convert");
const result = document.getElementById("result");
const chartCanvas = document.getElementById("trendChart");
let chart;

const currencyCodes = ["USD", "INR", "EUR", "GBP", "JPY", "AUD", "CAD", "CNY", "CHF", "RUB", "AED", "BRL", "SGD", "ZAR", "KRW", "TRY", "MXN", "SEK", "NOK", "NZD"];

currencyCodes.forEach(code => {
  const opt1 = new Option(code, code);
  const opt2 = new Option(code, code);
  from.appendChild(opt1);
  to.appendChild(opt2);
});

from.value = "INR";
to.value = "USD";

function getCountryCode(currencyCode) {
  const map = {
    USD: "US", INR: "IN", EUR: "EU", GBP: "GB", JPY: "JP", AUD: "AU",
    CAD: "CA", CNY: "CN", CHF: "CH", RUB: "RU", AED: "AE", BRL: "BR",
    SGD: "SG", ZAR: "ZA", KRW: "KR", TRY: "TR", MXN: "MX", SEK: "SE",
    NOK: "NO", NZD: "NZ"
  };
  return map[currencyCode] || "US";
}

function updateFlags() {
  document.getElementById("from-flag").src = `https://flagsapi.com/${getCountryCode(from.value)}/flat/64.png`;
  document.getElementById("to-flag").src = `https://flagsapi.com/${getCountryCode(to.value)}/flat/64.png`;
}
from.addEventListener("change", updateFlags);
to.addEventListener("change", updateFlags);
updateFlags();

async function getTrendData(base, target) {
  const end = new Date().toISOString().split('T')[0];
  const start = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
  const res = await fetch(`https://api.exchangerate.host/timeseries?start_date=${start}&end_date=${end}&base=${base}&symbols=${target}`);
  const data = await res.json();
  const labels = Object.keys(data.rates);
  const values = labels.map(date => data.rates[date][target]);
  return { labels, values };
}

convertBtn.addEventListener("click", async () => {
  const amount = parseFloat(document.getElementById("amount").value);
  if (!amount || amount <= 0) {
    result.innerText = "Please enter a valid amount.";
    return;
  }

  result.innerText = "Converting...";

  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from.value}`);
    const data = await res.json();
    const rate = data.rates[to.value];
    const converted = (amount * rate).toFixed(2);

    result.innerText = `${amount} ${from.value} = ${converted} ${to.value}`;

    // 🎉 Confetti
    confetti();

    // 🔔 Sound
    new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_8b83985f06.mp3?filename=success-1-6297.mp3").play();

    // 📉 Chart
    const trend = await getTrendData(from.value, to.value);
    if (chart) chart.destroy();
    chart = new Chart(chartCanvas, {
      type: "line",
      data: {
        labels: trend.labels,
        datasets: [{
          label: `${from.value} to ${to.value}`,
          data: trend.values,
          borderColor: "#00bfff",
          fill: false
        }]
      }
    });

  } catch (err) {
    result.innerText = "Conversion failed.";
    console.error(err);
  }
});

// 🌗 Dark mode toggle
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// 🌐 Language toggle
const translations = {
  en: {
    title: "Currency Converter",
    button: "Convert",
    amount: "Enter amount",
    bg: "🎨 Choose Background"
  },
  hi: {
    title: "मुद्रा परिवर्तक",
    button: "परिवर्तित करें",
    amount: "राशि दर्ज करें",
    bg: "🎨 पृष्ठभूमि चुनें"
  }
};

let lang = localStorage.getItem("lang") || "en";
const langToggle = document.getElementById("langToggle");

function setLanguage(l) {
  document.getElementById("title").innerText = translations[l].title;
  convertBtn.innerText = translations[l].button;
  document.getElementById("amount").placeholder = translations[l].amount;
  document.getElementById("bgLabel").innerText = translations[l].bg;
  localStorage.setItem("lang", l);
}
langToggle.addEventListener("click", () => {
  lang = lang === "en" ? "hi" : "en";
  setLanguage(lang);
});
setLanguage(lang);

// 🌄 Background theme
const backgroundMap = {
  1: "url('https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1920&q=80')",
  2: "url('https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1920&q=80')",
  3: "url('https://images.unsplash.com/photo-1496309732348-3627f3f040ee?auto=format&fit=crop&w=1920&q=80')",
  4: "url('https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?auto=format&fit=crop&w=1920&q=80')",
  5: "linear-gradient(135deg, #2b5876, #4e4376)"
};

const savedBg = localStorage.getItem("bgImage");
if (savedBg) {
  const bg = backgroundMap[savedBg] || `url(${savedBg})`;
  document.body.style.background = bg;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundAttachment = "fixed";
}

document.querySelectorAll(".bg-thumb").forEach(thumb => {
  thumb.addEventListener("click", () => {
    const bgID = thumb.getAttribute("data-bg");
    const bg = backgroundMap[bgID];
    document.body.style.background = bg;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "fixed";
    localStorage.setItem("bgImage", bgID);
  });
});

document.getElementById("bgUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    const imgURL = event.target.result;
    document.body.style.background = `url(${imgURL}) no-repeat center center fixed`;
    document.body.style.backgroundSize = "cover";
    localStorage.setItem("bgImage", imgURL);
  };
  reader.readAsDataURL(file);
});
