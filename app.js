"use strict";

const field = (id) => document.getElementById(id);
const form = field("trip-form");
const stays = field("stays");
const output = field("total");
const printButton = field("print-result");
const excelButton = field("save-excel");
const exportError = field("export-error");
const printHeading = printButton.closest(".results").querySelector(".print-heading");
const printTrip = field("print-trip");
const status = field("result-status");
const breakdown = field("breakdown");
const applied = field("applied");
const error = field("form-error");
const formatter = new Intl.NumberFormat("ko-KR");
const won = (value) => `${formatter.format(value)}원`;
const amount = (id) => Number(field(id).value);
const dayRate = 25000;
const lodgingCaps = { seoul: 100000, metro: 80000, other: 70000 };
const millisecondsPerDay = 86400000;
const defaultItems = ["운임", "일비", "숙박비", "식비"];
let currentResult = null;

function setGroup(id, visible) {
  const group = field(id);
  group.hidden = !visible;
  if (group instanceof HTMLFieldSetElement) {
    group.disabled = !visible;
    return;
  }
  for (const control of group.querySelectorAll("input, select, button")) {
    control.disabled = !visible;
  }
}

function tripType() {
  return form.elements.trip.value;
}

function refreshOptions() {
  const outside = tripType() === "outside";
  const actual = field("grade").value === "actual";
  setGroup("local-fields", !outside);
  setGroup("outside-fields", outside);
  setGroup("actual-fields", actual);
  setGroup("daily-options", !actual);
  setGroup("meal-options", !actual);
  setGroup("mileage-options", !actual);

  const partialHalf = !actual && !field("half-all").checked;
  const partialGroup = field("partial-half");
  for (const control of partialGroup.querySelectorAll("input")) {
    control.disabled = !partialHalf;
  }
  for (const stay of stays.children) {
    const exception = stay.querySelector('[data-field="exception"]');
    exception.closest("label").hidden = field("grade").value !== "2";
    exception.disabled = field("grade").value !== "2";
  }
}

function updateStayLabels() {
  for (const [index, stay] of [...stays.children].entries()) {
    stay.querySelector("legend").textContent = `숙박 ${index + 1}`;
    const remove = stay.querySelector(".remove-stay");
    remove.hidden = stays.children.length === 1;
    remove.setAttribute("aria-label", `숙박 ${index + 1} 삭제`);
  }
}

function addStay(focus = false) {
  const entry = field("stay-template").content.firstElementChild.cloneNode(true);
  entry.querySelector(".remove-stay").addEventListener("click", () => {
    entry.remove();
    updateStayLabels();
    field("add-stay").focus();
    invalidate();
  });
  stays.append(entry);
  updateStayLabels();
  refreshOptions();
  if (focus) entry.querySelector("select").focus();
}

function day(id) {
  const value = field(id).valueAsNumber;
  return Number.isFinite(value) ? value / millisecondsPerDay : null;
}

function tripRange() {
  return { start: day("departure"), end: day("return") };
}

function daysIn(range) {
  return range ? range.end - range.start + 1 : 0;
}

function updatePeriod() {
  const range = tripRange();
  const display = field("period");
  if (range.start === null || range.end === null) {
    display.textContent = "당일 출장은 같은 날짜를 입력하세요.";
  } else if (range.end < range.start) {
    display.textContent = "복귀일은 출장일과 같거나 이후여야 합니다.";
  } else {
    const days = daysIn(range);
    display.textContent = days === 1 ? "당일 출장 · 1일" : `출장일과 복귀일을 포함해 ${days}일`;
  }
}

function readOptionalRange(startId, endId, trip, label) {
  const start = day(startId);
  const end = day(endId);
  if (start === null && end === null) return null;
  if (start === null || end === null || start < trip.start || end > trip.end || start > end) {
    throw new Error(`${label}의 시작일과 종료일을 출장 기간 안에서 순서대로 입력하세요.`);
  }
  return { start, end };
}

function overlap(first, second) {
  if (!first || !second) return 0;
  return Math.max(0, Math.min(first.end, second.end) - Math.max(first.start, second.start) + 1);
}

function localResult(trip) {
  if (daysIn(trip) !== 1) throw new Error("근무지 내 출장은 출장일과 복귀일을 같게 입력하고 하루씩 계산하세요.");
  const full = field("duration").value === "long";
  const vehicle = field("local-vehicle").value;
  const base = full ? 20000 : 10000;
  const deduction = vehicle === "dedicated" ? base : vehicle === "reduced" ? 10000 : 0;
  const notes = [full ? "출장 여행시간 4시간 이상" : "출장 여행시간 4시간 미만"];
  if (vehicle === "dedicated") notes.push("전용 차량 배정자는 지급 대상에서 제외됩니다.");
  if (vehicle === "reduced") notes.push("공무용 차량 이용 등으로 10,000원 감액했습니다.");
  return { items: [["기준 출장여비", base], ["감액", -deduction]], notes };
}

function lodgingResult(travelDays, capped) {
  let nights = 0;
  let paid = 0;
  let deducted = 0;
  let extra = 0;
  for (const [index, stay] of [...stays.children].entries()) {
    const get = (name) => stay.querySelector(`[data-field="${name}"]`);
    const count = Number(get("nights").value);
    const price = get("price").value;
    if ((count > 0 && price === "") || (count === 0 && Number(price) > 0)) {
      throw new Error(`숙박 ${index + 1}의 숙박 일수와 1박 실제 요금을 함께 입력하세요.`);
    }
    const cap = capped ? lodgingCaps[get("region").value] : Infinity;
    const standard = Math.min(Number(price), cap);
    const limit = capped && get("exception").checked ? cap * 1.3 : cap;
    const perNight = Math.min(Number(price), Math.round(limit));
    nights += count;
    paid += perNight * count;
    deducted += (Number(price) - perNight) * count;
    extra += (perNight - standard) * count;
  }
  if (nights >= travelDays) throw new Error("총 숙박 일수는 출장일수보다 적어야 합니다.");
  const notes = [];
  if (extra > 0) notes.push(`숙박비 상한 초과분 ${won(extra)}을 반영했습니다. 추가 지급 정산은 여행 종료 다음 날부터 1주 이내입니다.`);
  if (deducted > 0) notes.push(`숙박비 한도를 넘긴 ${won(deducted)}은 지급액에서 제외했습니다.`);
  return { paid, notes };
}

function dailyResult(trip) {
  const half = field("half-all").checked ? trip : readOptionalRange("half-start", "half-end", trip, "절반 지급 기간");
  const stay = readOptionalRange("long-start", "long-end", trip, "장기 체재 기간");
  const halfDays = daysIn(half);
  let daily = dayRate * (daysIn(trip) - halfDays / 2);
  let mileageEligibleDays = daysIn(trip) - halfDays;
  let combinedReduction = false;
  const notes = [];

  if (halfDays > 0) notes.push(`일비 절반 지급 ${halfDays}일`);
  if (stay) {
    const reductions = [
      { start: stay.start + 16, end: Math.min(stay.start + 30, stay.end), percent: 10 },
      { start: stay.start + 31, end: Math.min(stay.start + 60, stay.end), percent: 20 },
      { start: stay.start + 61, end: stay.end, percent: 30 },
    ];
    for (const bracket of reductions) {
      const count = overlap(trip, bracket);
      if (count === 0) continue;
      const alreadyHalved = overlap(half, bracket);
      combinedReduction ||= alreadyHalved > 0;
      daily -= dayRate * bracket.percent / 100 * (count - alreadyHalved / 2);
      mileageEligibleDays -= count - alreadyHalved;
      notes.push(`장기 체재 일비 ${bracket.percent}% 감액 ${count}일`);
    }
  }
  if (combinedReduction) notes.push("감액 사유가 겹친 날은 장기 체재로 감액한 일비의 절반을 적용했습니다.");
  return { daily, mileageEligibleDays, notes };
}

function outsideResult(trip) {
  const days = daysIn(trip);
  const grade = field("grade").value;
  const lodging = lodgingResult(days, grade === "2");
  const fare = amount("fare");
  if (grade === "actual") {
    return {
      items: [["운임", fare], ["일비", amount("actual-daily")], ["숙박비", lodging.paid], ["식비", amount("actual-meals")]],
      notes: ["일비·식비에 입력한 인정 실비를 적용했습니다.", ...lodging.notes],
    };
  }

  const excludedMeals = amount("excluded-meals");
  if (excludedMeals > days) throw new Error("식비 지급 제외 일수는 출장일수를 넘을 수 없습니다.");
  const { daily, mileageEligibleDays, notes } = dailyResult(trip);
  if (excludedMeals > 0) notes.push(`선박·항공 여행 식비 지급 제외 ${excludedMeals}일`);

  const savings = amount("mileage-savings");
  const mileageDays = amount("mileage-days");
  if ((savings > 0) !== (mileageDays > 0)) throw new Error("마일리지 절약액과 추가 일비 적용 일수를 함께 입력하세요.");
  if (mileageDays > mileageEligibleDays) throw new Error("마일리지 추가 일비 적용 일수는 감액 없이 정액 일비를 지급하는 일수를 넘을 수 없습니다.");
  const mileage = Math.min(savings, mileageDays * dayRate / 2);
  const items = [["운임", fare], ["일비", daily], ["숙박비", lodging.paid], ["식비", (days - excludedMeals) * dayRate]];
  if (mileage > 0) {
    items.splice(2, 0, ["마일리지 추가 일비", mileage]);
    notes.push(`공적 마일리지 운임 절약액 ${won(savings)} 한도 적용`);
  }
  return { items, notes: [...notes, ...lodging.notes] };
}

function renderItems(items) {
  breakdown.replaceChildren(...items.map(([label, value]) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    term.textContent = label;
    detail.textContent = value === null ? "—" : won(value);
    row.append(term, detail);
    return row;
  }));
}

function clearResult(message) {
  currentResult = null;
  printButton.disabled = true;
  excelButton.disabled = true;
  exportError.hidden = true;
  printHeading.hidden = true;
  printTrip.textContent = "";
  output.value = "—";
  status.textContent = message;
  renderItems(defaultItems.map((label) => [label, null]));
  applied.replaceChildren();
  applied.hidden = true;
}

function invalidate() {
  error.hidden = true;
  if (currentResult) clearResult("입력값이 변경되었습니다. 다시 계산해 주세요.");
}

form.addEventListener("invalid", (event) => {
  const details = event.target.closest("details");
  if (details) details.open = true;
}, true);

form.addEventListener("input", () => {
  refreshOptions();
  updatePeriod();
  invalidate();
});

field("add-stay").addEventListener("click", () => addStay(true));
field("open-criteria").addEventListener("click", () => {
  const local = tripType() === "local";
  const type = local ? "근무지 내 국내 출장" : "근무지 외 국내 출장";
  const context = [type];
  if (currentResult) context.push(`${currentResult.days}일`, currentResult.grade);
  else if (!local) context.push(field("grade").selectedOptions[0].textContent.trim());

  field("criteria-context").textContent = context.filter(Boolean).join(" · ");
  field("criteria-local").hidden = !local;
  field("criteria-outside").hidden = local;
  field("criteria-applied").hidden = !currentResult?.notes.length;
  field("criteria-applied-notes").replaceChildren(...Array.from(applied.children, (item) => item.cloneNode(true)));
  const dialog = field("criteria-dialog");
  dialog.showModal();
  dialog.scrollTop = 0;
});
printButton.addEventListener("click", () => {
  if (currentResult) window.print();
});
excelButton.addEventListener("click", async () => {
  const result = currentResult;
  if (!result) return;
  excelButton.disabled = true;
  exportError.hidden = true;
  try {
    const file = await createTravelWorkbook(result);
    if (currentResult !== result) return;
    const link = document.createElement("a");
    const url = URL.createObjectURL(file);
    const period = result.departure === result.returnDate
      ? result.departure
      : `${result.departure}_${result.returnDate}`;
    link.href = url;
    link.download = `출장여비_${period}.xlsx`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    if (currentResult === result) exportError.hidden = false;
  } finally {
    if (currentResult === result) excelButton.disabled = false;
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const trip = tripRange();
  error.hidden = true;
  try {
    if (trip.start === null || trip.end === null || trip.end < trip.start) {
      throw new Error("복귀일은 출장일과 같거나 이후여야 합니다.");
    }
    const local = tripType() === "local";
    const { items, notes } = local ? localResult(trip) : outsideResult(trip);
    const total = items.reduce((sum, [, price]) => sum + price, 0);
    if (!Number.isSafeInteger(total)) throw new Error("계산된 금액이 너무 큽니다. 출장 기간과 금액을 확인하세요.");
    const departureDate = field("departure").value;
    const returnDate = field("return").value;
    const period = departureDate === returnDate ? departureDate : `${departureDate} ~ ${returnDate}`;
    const grades = { "1": "제1호", "2": "제2호", actual: "대통령·국무총리 (일비·식비 실비)" };
    const grade = local ? "" : grades[field("grade").value];
    const type = `${local ? "근무지 내" : "근무지 외"} 국내 출장`;
    const days = daysIn(trip);
    currentResult = { departure: departureDate, returnDate, days, type, grade, items, notes, total };
    printButton.disabled = false;
    excelButton.disabled = false;
    exportError.hidden = true;
    printHeading.hidden = false;
    printTrip.textContent = grade ? `${period} · ${grade}` : period;
    output.value = won(total);
    status.textContent = `${type} · ${days}일`;
    renderItems(items);
    applied.replaceChildren(...notes.map((note) => {
      const item = document.createElement("li");
      item.textContent = note;
      return item;
    }));
    applied.hidden = notes.length === 0;
    output.focus();
  } catch (problem) {
    clearResult("입력 내용을 확인해 주세요.");
    error.textContent = problem.message;
    error.hidden = false;
  }
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    stays.replaceChildren();
    addStay();
    for (const details of form.querySelectorAll("details")) details.open = false;
    updatePeriod();
    error.hidden = true;
    clearResult("출장 정보를 입력하고 계산해 주세요.");
  }, 0);
});

addStay();
updatePeriod();
