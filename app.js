const dayButtons = document.querySelectorAll("[data-day]");
const taskList = document.querySelector("#taskList");
const nameInput = document.querySelector("#nameInput");
const weightInput = document.querySelector("#weightInput");
const wakeInput = document.querySelector("#wakeInput");
const bedInput = document.querySelector("#bedInput");
const waterTarget = document.querySelector("#waterTarget");
const waterCount = document.querySelector("#waterCount");
const plusWater = document.querySelector("#plusWater");
const minusWater = document.querySelector("#minusWater");
const progressPercent = document.querySelector("#progressPercent");
const progressFill = document.querySelector("#progressFill");
const doneCount = document.querySelector("#doneCount");
const remainingCount = document.querySelector("#remainingCount");
const currentTask = document.querySelector("#currentTask");
const nextStepBox = document.querySelector("#nextStepBox");
const foodInput = document.querySelector("#foodInput");
const buildPlate = document.querySelector("#buildPlate");
const mealPhotoButtons = document.querySelectorAll(".meal-photo-button");
const mealPhotoInputs = document.querySelectorAll("[data-meal][type='file']");
const mealPhotoPreviewMap = {
  breakfast: document.querySelector('[data-preview="breakfast"]'),
  lunch: document.querySelector('[data-preview="lunch"]'),
  dinner: document.querySelector('[data-preview="dinner"]'),
};
const plateResult = document.querySelector("#plateResult");
const notesInput = document.querySelector("#notesInput");
const drinksInput = document.querySelector("#drinksInput");
const greenJuiceDayInputs = {
  1: document.querySelector("#greenJuiceDay1"),
  2: document.querySelector("#greenJuiceDay2"),
  3: document.querySelector("#greenJuiceDay3"),
  4: document.querySelector("#greenJuiceDay4"),
  5: document.querySelector("#greenJuiceDay5"),
};
const greenJuiceExtraInput = document.querySelector("#greenJuiceExtraInput");
const extrasInput = document.querySelector("#extrasInput");
const energyInput = document.querySelector("#energyInput");
const sleepInput = document.querySelector("#sleepInput");
const reportBox = document.querySelector("#reportBox");
const copyReport = document.querySelector("#copyReport");
const downloadPdf = document.querySelector("#downloadPdf");
const resetDay = document.querySelector("#resetDay");

let state = loadState();

function getMealPhotoMap() {
  const source = state.mealPhotoMap || { breakfast: [], lunch: [], dinner: [] };
  return {
    breakfast: Array.isArray(source.breakfast) ? source.breakfast : [],
    lunch: Array.isArray(source.lunch) ? source.lunch : [],
    dinner: Array.isArray(source.dinner) ? source.dinner : [],
  };
}

function getAllMealPhotos() {
  const map = getMealPhotoMap();
  return [...map.breakfast, ...map.lunch, ...map.dinner];
}

function getMealPhotoSections() {
  const map = getMealPhotoMap();
  return [
    { key: "breakfast", title: "الفطور", photos: map.breakfast || [] },
    { key: "lunch", title: "الغداء", photos: map.lunch || [] },
    { key: "dinner", title: "العشاء", photos: map.dinner || [] },
  ];
}

function getGreenJuiceWeekSummary() {
  const days = [1, 2, 3, 4, 5];
  const entries = days
    .map((day) => {
      const value = state.greenJuiceWeek && state.greenJuiceWeek[day - 1];
      return value ? `اليوم ${day}: ${value}` : null;
    })
    .filter(Boolean);
  return entries.length ? entries.join(" | ") : "لم يتم تسجيل مشروب أخضر للأسبوع";
}

const taskTemplates = [
  {
    id: "wake",
    offset: 0,
    title: "بداية اليوم",
    detail: "ادخلي الوزن، جهزي الماء، واكتبي الأكل الموجود عندك حتى أرتب لك الوجبات.",
  },
  {
    id: "coconut",
    offset: 15,
    title: "زيت جوز الهند",
    detail: "ملعقة كبيرة صباحا على الريق حسب الخطة.",
  },
  {
    id: "breakfast",
    offset: 60,
    title: "فطور صديق",
    detail: "اختاري فطورك من الاقتراح: نصف بروتين، ربع مخمر/مخلل، ربع دهون أو مرق أو أفوكادو.",
  },
  {
    id: "sun",
    offset: 150,
    title: "تعرض للشمس",
    detail: "اختاري وقتا مناسبا وآمنا لك.",
  },
  {
    id: "greenJuice",
    offset: 240,
    title: "العصير الأخضر",
    detail: "خيار، كرفس، سبانخ/بروكلي، زنجبيل اختياري، ربع تفاحة خضراء، نصف ليمونة.",
  },
  {
    id: "lunch",
    offset: 390,
    title: "غداء صديق",
    detail: "اختاري الغداء من الاقتراح، وحاولي يكون فيه بروتين واضح ومخمر أو مخلل.",
  },
  {
    id: "grounding",
    offset: 570,
    title: "مشي حافية أو تنفس عميق",
    detail: "مشي على تراب/عشب إن أمكن، أو جلسة تنفس عميق.",
  },
  {
    id: "lastMeal",
    offset: 690,
    title: "العشاء / آخر وجبة",
    detail: "اختاري عشاء خفيف من الاقتراح، ويفضل أن يكون بين المغرب والعشاء كحد أقصى.",
  },
  {
    id: "feetBath",
    beforeBed: 120,
    title: "نقع القدمين",
    detail: "30 دقيقة، يوميا أو 3 مرات أسبوعيا حسب قدرتك.",
  },
  {
    id: "wifiOff",
    beforeBed: 120,
    title: "إيقاف الواي فاي والأجهزة",
    detail: "قبل النوم بساعتين للمساعدة على نوم أعمق.",
  },
  {
    id: "oliveOil",
    beforeBed: 30,
    title: "زيت الزيتون مساء",
    detail: "ملعقة كبيرة قبل النوم حسب الخطة.",
  },
  {
    id: "sleep",
    beforeBed: 0,
    title: "النوم",
    detail: "حسب موعد النوم الذي تكتبينه.",
  },
];

const friendlyFoods = {
  protein: ["بيض", "دجاج", "سمك", "سردين", "جمبري", "لحم", "لحمة", "كبدة", "قلب", "أرنب", "ارنب"],
  fermented: ["مخلل", "مخللات", "مخمّر", "مخمر", "ملفوف", "زيتون", "كبيس"],
  fats: ["افوكادو", "أفوكادو", "زيت زيتون", "زيت جوز", "زيت جوز الهند", "سمنة", "دهن", "مرق"],
  vegetables: ["خيار", "خس", "جرجير", "كرفس", "بروكلي", "كوسا", "فليفلة", "جزر", "مشروم", "فطر", "قرع", "ملفوف"],
  greenJuice: ["خيار", "كرفس", "سبانخ", "بروكلي", "زنجبيل", "تفاح", "ليمون"],
};

const enemyFoods = ["أرز", "ارز", "خبز", "كيك", "معجنات", "حلويات", "بطاطا", "بطاطس", "بقوليات", "حليب", "لبن", "جبنة", "سكر", "نشا", "جلوتين", "كازيين"];

function loadState() {
  const saved = localStorage.getItem("safaChallenge");
  if (saved) {
    const parsed = JSON.parse(saved);
    return {
      name: "صفا",
      bed: "22:00",
      ...parsed,
      greenJuiceWeek: Array.isArray(parsed.greenJuiceWeek) ? parsed.greenJuiceWeek : ["", "", "", "", ""],
      mealPhotoMap: parsed.mealPhotoMap || { breakfast: [], lunch: [], dinner: [] },
      mealPhotos: Array.isArray(parsed.mealPhotos) ? parsed.mealPhotos : [],
    };
  }
  return {
    name: "صفا",
    day: 1,
    weight: "",
    wake: "07:00",
    bed: "22:00",
    water: 0,
    food: "",
    drinks: "",
    greenJuiceExtra: "",
    greenJuiceWeek: ["", "", "", "", ""],
    extras: "",
    mealPhotoMap: { breakfast: [], lunch: [], dinner: [] },
    mealPhotos: [],
    notes: "",
    energy: "جيدة",
    sleep: "جيد",
    done: {},
  };
}

function saveState() {
  localStorage.setItem("safaChallenge", JSON.stringify(state));
}

function dayKey() {
  return `day${state.day}`;
}

function getDoneMap() {
  if (!state.done[dayKey()]) state.done[dayKey()] = {};
  return state.done[dayKey()];
}

function waterGoal() {
  const weight = Number(state.weight);
  if (!weight) return 0;
  return Math.max(1, Math.ceil(weight / 7));
}

function timeToMinutes(time) {
  const [hours, minutes] = String(time || "00:00").split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(total) {
  const minutesInDay = 24 * 60;
  const normalized = ((total % minutesInDay) + minutesInDay) % minutesInDay;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getTasks() {
  const wakeMinutes = timeToMinutes(state.wake || "07:00");
  const bedMinutes = timeToMinutes(state.bed || "22:00");
  return taskTemplates
    .map((task) => {
      const taskMinutes = task.beforeBed === undefined ? wakeMinutes + task.offset : bedMinutes - task.beforeBed;
      return { ...task, time: minutesToTime(taskMinutes), sortMinutes: taskMinutes };
    })
    .sort((a, b) => a.sortMinutes - b.sortMinutes);
}

function getTaskTime(id) {
  return getTasks().find((task) => task.id === id)?.time || "--:--";
}

function render() {
  dayButtons.forEach((button) => button.classList.toggle("active", Number(button.dataset.day) === state.day));
  nameInput.value = state.name || "صفا";
  weightInput.value = state.weight;
  wakeInput.value = state.wake || "07:00";
  bedInput.value = state.bed || "22:00";
  foodInput.value = state.food;
  drinksInput.value = state.drinks || "";
  greenJuiceExtraInput.value = state.greenJuiceExtra || "";
  extrasInput.value = state.extras || "";
  notesInput.value = state.notes;
  energyInput.value = state.energy;
  sleepInput.value = state.sleep;
  Object.entries(greenJuiceDayInputs).forEach(([day, input]) => {
    if (input) input.value = (state.greenJuiceWeek && state.greenJuiceWeek[Number(day) - 1]) || "";
  });
  renderMealPhotos();
  waterCount.textContent = state.water;
  const goal = waterGoal();
  waterTarget.textContent = goal ? `${goal} كوب تقريبا` : "ادخلي وزنك";
  renderTasks();
  renderProgress();
  saveState();
}

function renderTasks() {
  const done = getDoneMap();
  const nowTaskId = getCurrentTaskId();
  const tasks = getTasks();
  taskList.innerHTML = "";
  tasks.forEach((task) => {
    const row = document.createElement("label");
    row.className = `task ${done[task.id] ? "done" : ""} ${task.id === nowTaskId ? "now" : ""}`;
    row.innerHTML = `
      <span class="time">${task.time}</span>
      <input class="check" type="checkbox" ${done[task.id] ? "checked" : ""} />
      <span>
        <span class="task-title">${task.title}</span>
        <span class="task-detail">${task.detail}</span>
      </span>
      ${task.id === nowTaskId ? '<span class="badge">مطلوب الآن</span>' : ""}
    `;
    row.querySelector("input").addEventListener("change", (event) => {
      done[task.id] = event.target.checked;
      render();
    });
    taskList.appendChild(row);
  });
}

function renderProgress() {
  const done = getDoneMap();
  const tasks = getTasks();
  const completed = tasks.filter((task) => done[task.id]).length;
  const goal = waterGoal();
  const waterDone = goal && state.water >= goal ? 1 : 0;
  const total = tasks.length + (goal ? 1 : 0);
  const allDone = completed + waterDone;
  const percent = total ? Math.round((allDone / total) * 100) : 0;
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
  doneCount.textContent = allDone;
  remainingCount.textContent = Math.max(0, total - allDone);
  const next = tasks.find((task) => !done[task.id]);
  currentTask.textContent = next ? next.title : "خلصتي اليوم";
  renderNextStep(next, done);
}

function renderMealPhotos() {
  Object.entries(mealPhotoPreviewMap).forEach(([meal, previewEl]) => {
    if (!previewEl) return;
    previewEl.innerHTML = "";
    const photos = getMealPhotoMap()[meal] || [];

    if (!photos.length) {
      previewEl.innerHTML = '<span class="meal-photo-empty">لا توجد صور بعد</span>';
      return;
    }

    photos.forEach((src, index) => {
      const item = document.createElement("div");
      item.className = "meal-photo-item";
      item.innerHTML = `
        <img src="${src}" alt="صورة ${meal} ${index + 1}" />
        <button type="button" class="remove-photo" data-meal="${meal}" data-index="${index}">حذف</button>
      `;
      item.querySelector(".remove-photo").addEventListener("click", () => {
        const map = getMealPhotoMap();
        map[meal].splice(index, 1);
        state.mealPhotoMap = map;
        state.mealPhotos = getAllMealPhotos();
        saveState();
        renderMealPhotos();
      });
      previewEl.appendChild(item);
    });
  });
}

function getCurrentTaskId() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const tasks = getTasks();
  let selected = tasks[0].id;
  tasks.forEach((task) => {
    const [h, m] = task.time.split(":").map(Number);
    if (h * 60 + m <= currentMinutes) selected = task.id;
  });
  return selected;
}

function renderNextStep(next, done) {
  const tasks = getTasks();
  const currentByClock = tasks.find((task) => task.id === getCurrentTaskId());
  const upcoming = tasks.filter((task) => !done[task.id]).slice(0, 3);
  if (!next) {
    nextStepBox.innerHTML = "<strong>ممتاز.</strong><span>خلصتي كل خطوات اليوم. اعملي التقرير واحفظي ملاحظاتك.</span>";
    return;
  }
  nextStepBox.innerHTML = `
    <strong>الخطوة القادمة بالترتيب: ${next.time} - ${next.title}</strong>
    <span>${next.detail}</span>
    <small>حسب الساعة الآن: ${currentByClock.time} - ${currentByClock.title}</small>
    <ol>
      ${upcoming.map((task) => `<li>${task.time} - ${task.title}</li>`).join("")}
    </ol>
  `;
}

function unique(items) {
  return [...new Set(items)];
}

function normalize(text) {
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[،,.;\n]/g, " ")
    .toLowerCase();
}

function inventory() {
  const text = normalize(state.food);
  const find = (items) => unique(items.filter((item) => text.includes(normalize(item))));
  return {
    protein: find(friendlyFoods.protein),
    fermented: find(friendlyFoods.fermented),
    fats: find(friendlyFoods.fats),
    vegetables: find(friendlyFoods.vegetables),
    greenJuice: find(friendlyFoods.greenJuice),
    enemies: find(enemyFoods),
  };
}

function pickForMeal(items, index, fallback) {
  if (!items.length) return fallback;
  return items[index % items.length];
}

function mealCard(name, time, inv, index) {
  const protein = pickForMeal(inv.protein, index, "ناقص بروتين: بيض أو دجاج أو سمك أو لحم");
  const fermented = pickForMeal(inv.fermented, index, "ناقص مخمر/مخلل: مخلل أو ملفوف مخمر");
  const fat = pickForMeal(inv.fats, index, "ناقص دهون/مرق: زيت زيتون أو أفوكادو أو مرق");
  const vegA = pickForMeal(inv.vegetables, index, "خضار مسموحة إن وجدت");
  const vegB = pickForMeal(inv.vegetables, index + 1, vegA);
  return `
    <section class="meal-row">
      <header>
        <strong>${name}</strong>
        <span>${time}</span>
      </header>
      <ul>
        <li><strong>نصف الصحن:</strong> ${protein}</li>
        <li><strong>ربع الصحن:</strong> ${fermented}</li>
        <li><strong>ربع الصحن:</strong> ${fat}</li>
        <li><strong>إضافة مسموحة:</strong> ${vegA}${vegB !== vegA ? ` + ${vegB}` : ""}</li>
      </ul>
    </section>
  `;
}

function buildSuggestedPlate() {
  const inv = inventory();
  const missing = [];
  if (!inv.protein.length) missing.push("بروتين");
  if (!inv.fermented.length) missing.push("مخلل أو مخمر");
  if (!inv.fats.length) missing.push("دهون صحية أو مرق");
  const juiceMissing = friendlyFoods.greenJuice.filter((item) => !inv.greenJuice.includes(item));

  plateResult.innerHTML = `
    <div class="meal-plan">
      ${mealCard("الفطور", getTaskTime("breakfast"), inv, 0)}
      ${mealCard("الغداء", getTaskTime("lunch"), inv, 1)}
      ${mealCard("العشاء / آخر وجبة", getTaskTime("lastMeal"), inv, 2)}
    </div>
    <div class="guidance">
      <strong>العصير الأخضر:</strong>
      الموجود عندك: ${inv.greenJuice.length ? inv.greenJuice.join("، ") : "لم يظهر من القائمة"}.
      ${juiceMissing.length ? `الناقص لو بدك الوصفة كاملة: ${juiceMissing.join("، ")}.` : "مكونات العصير كاملة تقريبا."}
    </div>
    <div class="guidance ${missing.length ? "warning" : "ok"}">
      ${missing.length ? `حتى يكون الصحن أدق، ناقصك: ${missing.join("، ")}.` : "قائمتك فيها أساس الصحن المطلوب."}
    </div>
    ${
      inv.enemies.length
        ? `<div class="guidance danger"><strong>انتبهي:</strong> ظهر في قائمتك أكل من قائمة العدو: ${inv.enemies.join("، ")}.</div>`
        : ""
    }
  `;
}

function makeReport() {
  const done = getDoneMap();
  const tasks = getTasks();
  const completedTasks = tasks.filter((task) => done[task.id]).map((task) => `✓ ${task.time} - ${task.title}`);
  const missedTasks = tasks.filter((task) => !done[task.id]).map((task) => `• ${task.time} - ${task.title}`);
  const goal = waterGoal();
  const inv = inventory();
  const stats = reportStats();
  const allPhotos = getAllMealPhotos();
  const mealPhotosText = allPhotos.length
    ? `صور الوجبات (${allPhotos.length}): مرفقة في صفحة منفصلة داخل ملف PDF`
    : "صور الوجبات: لا توجد صور مرفقة";

  const mealSection = [
    `الفطور: ${pickForMeal(inv.protein, 0, "ناقص بروتين")} + ${pickForMeal(inv.fermented, 0, "ناقص مخمر/مخلل")} + ${pickForMeal(inv.fats, 0, "ناقص دهون/مرق")}`,
    `الغداء: ${pickForMeal(inv.protein, 1, "ناقص بروتين")} + ${pickForMeal(inv.fermented, 1, "ناقص مخمر/مخلل")} + ${pickForMeal(inv.fats, 1, "ناقص دهون/مرق")}`,
    `العشاء: ${pickForMeal(inv.protein, 2, "ناقص بروتين")} + ${pickForMeal(inv.fermented, 2, "ناقص مخمر/مخلل")} + ${pickForMeal(inv.fats, 2, "ناقص دهون/مرق")}`,
  ].join("\n");

  return `تقرير ${state.name || "صفا"} - اليوم ${state.day} من تحدي 5 أيام

التاريخ: ${new Date().toLocaleDateString("ar")}

تم الإنجاز:
${completedTasks.length ? completedTasks.join("\n") : "لا يوجد مهام محددة كمنجزة بعد"}

لم يتم:
${missedTasks.length ? missedTasks.join("\n") : "لا يوجد، خلصتي مهام اليوم"}`;
}

function reportStats() {
  const done = getDoneMap();
  const tasks = getTasks();
  const goal = waterGoal();
  const taskDone = tasks.filter((task) => done[task.id]).length;
  const waterDone = goal && state.water >= goal ? 1 : 0;
  const total = tasks.length + (goal ? 1 : 0);
  const completed = taskDone + waterDone;
  return {
    done: completed,
    total,
    percent: total ? Math.round((completed / total) * 100) : 0,
    taskDone,
    taskTotal: tasks.length,
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function listItems(items, emptyText) {
  if (!items.length) return `<li>${escapeHtml(emptyText)}</li>`;
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function mealSummary(inv, index) {
  return `${pickForMeal(inv.protein, index, "ناقص بروتين")} + ${pickForMeal(inv.fermented, index, "ناقص مخمر/مخلل")} + ${pickForMeal(inv.fats, index, "ناقص دهون/مرق")}`;
}

function openPdfReport() {
  if (!window.jspdf || !window.html2canvas) {
    window.print();
    return;
  }

  const done = getDoneMap();
  const tasks = getTasks();
  const completedTasks = tasks.filter((task) => done[task.id]).map((task) => `${task.time} - ${task.title}`);
  const missedTasks = tasks.filter((task) => !done[task.id]).map((task) => `${task.time} - ${task.title}`);
  const goal = waterGoal();
  const stats = reportStats();
  const inv = inventory();
  const today = new Date().toLocaleDateString("ar");
  const allPhotos = getAllMealPhotos();
  const mealSections = getMealPhotoSections();
  const mealSummaryText = [
    `الفطور: ${escapeHtml(mealSummary(inv, 0))}`,
    `الغداء: ${escapeHtml(mealSummary(inv, 1))}`,
    `العشاء: ${escapeHtml(mealSummary(inv, 2))}`,
  ].join("<br>");

  const reportPage = document.createElement("div");
  reportPage.style.width = "700px";
  reportPage.style.padding = "28px";
  reportPage.style.fontFamily = "Tahoma, Arial, sans-serif";
  reportPage.style.color = "#22252a";
  reportPage.style.lineHeight = "1.8";
  reportPage.style.background = "#fff";
  reportPage.style.direction = "rtl";
  reportPage.innerHTML = `
    <div style="background:#f7faf6; border:1px solid #dfeae2; border-radius:14px; padding:18px 18px 10px; margin-bottom:14px;">
      <h1 style="font-size:28px; margin:0 0 6px; color:#1c3f2d;">تقرير ${escapeHtml(state.name || "صفا")} - اليوم ${state.day}</h1>
      <p style="margin:0; color:#68706c;">التاريخ: ${escapeHtml(today)}</p>
    </div>

    <div style="display:grid; gap:12px; margin-bottom:14px;">
      <div style="border:1px solid #b6dcc8; border-radius:10px; padding:14px; background:#f3faf5;">
        <h2 style="font-size:20px; margin:0 0 8px; color:#2e7d5b;">تم الإنجاز</h2>
        <ul style="margin:0; padding-inline-start:22px; line-height:1.8;">${listItems(completedTasks, "لا يوجد مهام محددة كمنجزة بعد")}</ul>
      </div>

      <div style="border:1px solid #dfc58f; border-radius:10px; padding:14px; background:#fff8e8;">
        <h2 style="font-size:20px; margin:0 0 8px; color:#2e7d5b;">لم يتم</h2>
        <ul style="margin:0; padding-inline-start:22px; line-height:1.8;">${listItems(missedTasks, "لا يوجد، خلصت مهام اليوم")}</ul>
      </div>
    </div>
  `;

  const photoPage = document.createElement("div");
  photoPage.style.width = "700px";
  photoPage.style.padding = "28px";
  photoPage.style.fontFamily = "Tahoma, Arial, sans-serif";
  photoPage.style.color = "#22252a";
  photoPage.style.lineHeight = "1.8";
  photoPage.style.background = "#fff";
  photoPage.style.direction = "rtl";
  const photoSectionsHtml = mealSections
    .filter((section) => section.photos.length)
    .map((section) => `
      <div style="margin-bottom:26px;">
        <h2 style="font-size:24px; margin:0 0 12px; color:#1c3f2d;">${section.title}</h2>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:18px;">
          ${section.photos.map((src) => `
            <div style="border:1px solid #dfeae2; border-radius:14px; padding:10px; background:#f8faf7;">
              <img src="${src}" alt="صورة ${section.title}" style="display:block; width:100%; height:260px; object-fit:cover; border-radius:10px; border:1px solid #ded8cd; box-shadow:0 10px 22px rgba(0,0,0,0.08);" />
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");

  photoPage.innerHTML = `
    <div style="background:#f7faf6; border:1px solid #dfeae2; border-radius:14px; padding:18px; margin-bottom:18px;">
      <h1 style="font-size:28px; margin:0; color:#1c3f2d;">صور الوجبات</h1>
    </div>
    ${photoSectionsHtml || "<p style='margin:0; color:#68706c;'>لا توجد صور مرفقة.</p>"}
  `;

  document.body.appendChild(reportPage);
  if (allPhotos.length) document.body.appendChild(photoPage);

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const addElementToPdf = async (element, pdfDoc) => {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pageWidth = pdfDoc.internal.pageSize.getWidth();
    const pageHeight = pdfDoc.internal.pageSize.getHeight();
    const imgProps = pdfDoc.getImageProperties(imgData);
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const imageHeight = (imgProps.height * usableWidth) / imgProps.width;
    let heightLeft = imageHeight;
    let position = margin;

    pdfDoc.addImage(imgData, "PNG", margin, position, usableWidth, imageHeight, undefined, "FAST");
    heightLeft -= (pageHeight - margin * 2);

    while (heightLeft > 0) {
      pdfDoc.addPage();
      position = margin - (pageHeight - margin * 2) + (heightLeft - imageHeight) * -1;
      pdfDoc.addImage(imgData, "PNG", margin, position, usableWidth, imageHeight, undefined, "FAST");
      heightLeft -= (pageHeight - margin * 2);
    }
  };

  addElementToPdf(reportPage, pdf)
    .then(() => {
      if (allPhotos.length) {
        return addElementToPdf(photoPage, pdf);
      }
      return null;
    })
    .then(() => {
      pdf.save(`تقرير-${state.name || "صفا"}-اليوم-${state.day}.pdf`);
      reportPage.remove();
      if (photoPage && photoPage.parentNode) photoPage.remove();
    })
    .catch(() => {
      reportPage.remove();
      if (photoPage && photoPage.parentNode) photoPage.remove();
      window.print();
    });
}

dayButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.day = Number(button.dataset.day);
    render();
  });
});

nameInput.addEventListener("input", (event) => {
  state.name = event.target.value || "صفا";
  render();
});

weightInput.addEventListener("input", (event) => {
  state.weight = event.target.value;
  render();
});

wakeInput.addEventListener("input", (event) => {
  state.wake = event.target.value;
  render();
});

bedInput.addEventListener("input", (event) => {
  state.bed = event.target.value;
  render();
});

foodInput.addEventListener("input", (event) => {
  state.food = event.target.value;
  saveState();
});

notesInput.addEventListener("input", (event) => {
  state.notes = event.target.value;
  saveState();
});

drinksInput.addEventListener("input", (event) => {
  state.drinks = event.target.value;
  saveState();
});

Object.entries(greenJuiceDayInputs).forEach(([day, input]) => {
  if (!input) return;
  input.addEventListener("input", (event) => {
    state.greenJuiceWeek[Number(day) - 1] = event.target.value;
    saveState();
  });
});

greenJuiceExtraInput.addEventListener("input", (event) => {
  state.greenJuiceExtra = event.target.value;
  saveState();
});

extrasInput.addEventListener("input", (event) => {
  state.extras = event.target.value;
  saveState();
});

energyInput.addEventListener("change", (event) => {
  state.energy = event.target.value;
  saveState();
});

sleepInput.addEventListener("change", (event) => {
  state.sleep = event.target.value;
  saveState();
});

plusWater.addEventListener("click", () => {
  state.water += 1;
  render();
});

minusWater.addEventListener("click", () => {
  state.water = Math.max(0, state.water - 1);
  render();
});

buildPlate.addEventListener("click", () => {
  state.food = foodInput.value;
  buildSuggestedPlate();
  saveState();
});

copyReport.addEventListener("click", async () => {
  const report = makeReport();
  reportBox.textContent = report;
  try {
    await navigator.clipboard.writeText(report);
    copyReport.textContent = "تم نسخ التقرير";
    setTimeout(() => (copyReport.textContent = "تقرير آخر اليوم"), 1600);
  } catch {
    copyReport.textContent = "ظهر التقرير";
  }
});

mealPhotoButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const meal = button.dataset.meal;
    const input = document.querySelector(`input[data-meal="${meal}"]`);
    if (input) input.click();
  });
});

mealPhotoInputs.forEach((input) => {
  input.addEventListener("change", (event) => {
    const meal = input.dataset.meal;
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const readers = files.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }));

    Promise.all(readers)
      .then((images) => {
        const map = getMealPhotoMap();
        map[meal] = [...(map[meal] || []), ...images];
        state.mealPhotoMap = map;
        state.mealPhotos = getAllMealPhotos();
        saveState();
        renderMealPhotos();
        input.value = "";
      })
      .catch(() => {
        input.value = "";
      });
  });
});

downloadPdf.addEventListener("click", () => {
  state.food = foodInput.value;
  state.drinks = drinksInput.value;
  state.greenJuiceExtra = greenJuiceExtraInput.value;
  state.extras = extrasInput.value;
  state.notes = notesInput.value;
  saveState();
  openPdfReport();
});

resetDay.addEventListener("click", () => {
  state.water = 0;
  state.notes = "";
  state.food = "";
  state.drinks = "";
  state.greenJuiceExtra = "";
  state.greenJuiceWeek = ["", "", "", "", ""];
  state.extras = "";
  state.mealPhotoMap = { breakfast: [], lunch: [], dinner: [] };
  state.mealPhotos = [];
  state.done[dayKey()] = {};
  plateResult.textContent = "";
  reportBox.textContent = "";
  render();
});

render();
