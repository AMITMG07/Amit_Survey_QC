// ✅ Clear LocalStorage when page is closed, refreshed, or tab is closed
window.addEventListener("beforeunload", function () {
  localStorage.clear();
});

// Default Todos
const scriptTodos = [
  "Ensure base conditions are correctly applied.",
  "Ensure termination conditions are correctly applied.",
  "Ensure skip logic is correctly implemented.",
  "Verify that recodes are added as per the questionnaire.",
  "Verify that question types match the requirements.",
  "Confirm that randomization is implemented as per the questionnaire specifications."
];

const linkQCTodos = [
  "Verify that all question labels and types are accurate.",
  "Ensure base conditions work as expected.",
  "Ensure termination conditions work as expected.",
  "Ensure skip logic works as expected.",
  "Check that formatting (bold, italic, underline, etc.) follows the questionnaire.",
  "Confirm that question text and response text exactly match the questionnaire."
];

// ---- Current question & storage key helper ----
let currentQuestion = null;
function storageKey(listType) {
  return currentQuestion ? `${currentQuestion}__${listType}` : listType;
}

// ✅ Maintain insertion order of questions
function saveQuestionOrder(q) {
  let order = JSON.parse(localStorage.getItem("questionOrder") || "[]");
  if (!order.includes(q)) {
    order.push(q);
    localStorage.setItem("questionOrder", JSON.stringify(order));
  }
}

function getOrderedQuestionIds() {
  let order = JSON.parse(localStorage.getItem("questionOrder") || "[]");
  // keep only still-existing questions
  return order.filter(q =>
    localStorage.getItem(`${q}__script-check`) ||
    localStorage.getItem(`${q}__link-qc`)
  );
}

// Page Navigation
function navigateTo(pageId) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

// ---- Start Script & Link Check for a question ----
function startCheck() {
  const q = (document.getElementById("question-number-input").value || "").trim();
  if (!q) {
    alert("Please enter a Question Number (e.g., Q1).");
    return;
  }
  currentQuestion = q;
  saveQuestionOrder(q); // ✅ Save order when new Q starts

  const sLbl = document.getElementById("script-q-label");
  const lLbl = document.getElementById("link-q-label");
  if (sLbl) sLbl.textContent = `for ${q}`;
  if (lLbl) lLbl.textContent = `for ${q}`;

  loadTodos("script-check", scriptTodos, "custom-script-input", "add-script-btn", "custom-script-list");
  loadTodos("link-qc", linkQCTodos, "custom-link-input", "add-link-btn", "custom-link-list");

  navigateTo("script-page");
}

// Create To-do Element
function createTodoElement(text, isCustom, listType) {
  const box = document.createElement("div");
  box.classList.add("todo-box");

  const label = document.createElement("div");
  label.classList.add("todo-text");
  label.textContent = text;
  box.appendChild(label);

  const actions = document.createElement("div");
  actions.classList.add("todo-actions");

  const doneBtn = document.createElement("button");
  doneBtn.textContent = isCustom ? "Logic Checked ✅" : "QC Passed ✅";
  doneBtn.onclick = () => {
    label.classList.add("done");
    label.classList.remove("not-applicable");
    saveTodos(listType);
  };

  const undoneBtn = document.createElement("button");
  undoneBtn.textContent = "Mark as Pending 🔄";
  undoneBtn.onclick = () => {
    label.classList.remove("done");
    label.classList.remove("not-applicable");
    saveTodos(listType);
  };

  actions.appendChild(doneBtn);
  actions.appendChild(undoneBtn);

  if (!isCustom) {
    const naBtn = document.createElement("button");
    naBtn.textContent = "Not Applicable 🚫";
    naBtn.onclick = () => {
      label.classList.toggle("not-applicable");
      label.classList.remove("done");
      saveTodos(listType);
    };
    actions.appendChild(naBtn);
  }

  if (isCustom) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete ❌";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = () => {
      box.remove();
      saveTodos(listType);
    };
    actions.appendChild(deleteBtn);
  }

  box.appendChild(actions);
  return box;
}

// Save Todos
function saveTodos(listType) {
  const todos = [];
  document.querySelectorAll(
    `#${listType}-list .todo-box, #${listType === 'script-check' ? 'custom-script-list' : 'custom-link-list'} .todo-box`
  ).forEach(box => {
    const txtEl = box.querySelector(".todo-text");
    todos.push({
      text: txtEl.textContent,
      done: txtEl.classList.contains("done"),
      na: txtEl.classList.contains("not-applicable")
    });
  });
  localStorage.setItem(storageKey(listType), JSON.stringify(todos));
}

// Load Todos
function loadTodos(listType, defaultTodos, customInputId, addBtnId, customListId) {
  const list = document.getElementById(`${listType}-list`);
  const customList = document.getElementById(customListId);
  if (!list || !customList) return;

  list.innerHTML = "";
  customList.innerHTML = "";

  const stored = JSON.parse(localStorage.getItem(storageKey(listType))) || [];
  if (stored.length > 0) {
    stored.forEach(todo => {
      const isCustom = !defaultTodos.includes(todo.text);
      const el = createTodoElement(todo.text, isCustom, listType);
      const txt = el.querySelector(".todo-text");
      if (todo.done) txt.classList.add("done");
      if (todo.na) txt.classList.add("not-applicable");
      (isCustom ? customList : list).appendChild(el);
    });
  } else {
    defaultTodos.forEach(todo => {
      list.appendChild(createTodoElement(todo, false, listType));
    });
  }

  const addBtn = document.getElementById(addBtnId);
  const input = document.getElementById(customInputId);
  if (addBtn && input) {
    addBtn.onclick = () => {
      const value = input.value.trim();
      if (value) {
        customList.appendChild(createTodoElement(value, true, listType));
        input.value = "";
        saveTodos(listType);
      }
    };
  }
}

// Initial load
loadTodos("script-check", scriptTodos, "custom-script-input", "add-script-btn", "custom-script-list");
loadTodos("link-qc", linkQCTodos, "custom-link-input", "add-link-btn", "custom-link-list");

// ✅ Done button handler
function finishCheck() {
  saveTodos("script-check");
  saveTodos("link-qc");

  document.querySelectorAll(".todo-box").forEach(el => el.remove());
  document.querySelectorAll("input[type='text']").forEach(inp => (inp.value = ""));

  const sLbl = document.getElementById("script-q-label");
  const lLbl = document.getElementById("link-q-label");
  if (sLbl) sLbl.textContent = "";
  if (lLbl) lLbl.textContent = "";

  currentQuestion = null;
  navigateTo("home-page");
}

// ✅ Function to open Outlook
function openOutlookMail(pdfFileName) {
  const mailtoUrl =
    "mailto:amitgadad@gmail.com" +
    "?subject=" + encodeURIComponent("Survey QC Report") +
    "&body=" + encodeURIComponent("Hi,\n\nPlease find the attached Survey QC PDF.\n\n(Attachment: " + pdfFileName + ")");
  const outlookWebUrl =
    "https://outlook.office.com/mail/deeplink/compose" +
    "?to=amitgadad@gmail.com" +
    "&subject=" + encodeURIComponent("Survey QC Report") +
    "&body=" + encodeURIComponent("Hi,\n\nPlease find the attached Survey QC PDF.");

  const isDesktop = /Win|Mac|Linux/i.test(navigator.platform);
  if (isDesktop) {
    const tempLink = document.createElement("a");
    tempLink.href = mailtoUrl;
    tempLink.style.display = "none";
    document.body.appendChild(tempLink);
    tempLink.click();
    setTimeout(() => window.open(outlookWebUrl, "_blank"), 800);
  } else {
    window.open(outlookWebUrl, "_blank");
  }
}

// ✅ PDF generation with correct order & screenshot
async function downloadAndEmailPDF() {
  const { jsPDF } = window.jspdf;
  let pdf = new jsPDF("p", "mm", "a4");
  let wroteSomething = false;

  const questions = getOrderedQuestionIds(); // ✅ Ordered list

  if (questions.length > 0) {
    let first = true;

    for (const q of questions) {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "800px";
      container.style.background = "#fff";
      container.style.padding = "20px";
      container.style.fontFamily = "Segoe UI, Arial, sans-serif";
      container.style.boxSizing = "border-box";

      container.innerHTML = `
        <h2 style="text-align:center;margin-bottom:20px;font-size:20px;">
          Survey QC Report – ${q}
        </h2>
        <div style="margin-bottom:25px;">
          <h3 style="margin:10px 0;font-size:16px;font-weight:600;">📋 Script QC</h3>
          ${renderListFromStorage(q, "script-check")}
        </div>
        <div>
          <h3 style="margin:10px 0;font-size:16px;font-weight:600;">🔗 Link QC</h3>
          ${renderListFromStorage(q, "link-qc")}
        </div>
      `;

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight
      });

      const imgData = canvas.toDataURL("image/png");

      if (!first) pdf.addPage();
      first = false;
      wroteSomething = true;

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      container.remove();
    }
  }

  if (!wroteSomething) {
    pdf.text("No QC Data Found", 10, 18);
  }

  const pdfFileName = "Survey_QC_Summary_SNO.pdf";
  pdf.save(pdfFileName);
  openOutlookMail(pdfFileName);
}

// ---- Helper to render a single item badge (kept identical look)
function renderStatusBadge(item) {
  let statusLabel = "Pending ⏳", statusColor = "#f97316";
  if (item.done) { statusLabel = "QC Passed ✅"; statusColor = "#22c55e"; }
  if (item.na) { statusLabel = "Not Applicable 🚫"; statusColor = "#ef4444"; }
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;
                border:1px solid #ddd;border-radius:6px;padding:8px 12px;
                margin-bottom:8px;">
      <span style="flex:1;font-size:14px;">${item.text}</span>
      <span style="background:${statusColor};color:#fff;
                   padding:3px 8px;border-radius:4px;font-size:12px;">
        ${statusLabel}
      </span>
    </div>
  `;
}

// ---- Helper to resolve default list for a given type
function getDefaultsFor(listType) {
  return listType === "script-check" ? scriptTodos : linkQCTodos;
}

// ---- UPDATED: render list with "Custom PN check" section when custom items exist
function renderListFromStorage(q, listType) {
  const data = JSON.parse(localStorage.getItem(`${q}__${listType}`) || "[]");
  const defaults = getDefaultsFor(listType);

  if (data.length === 0) {
    return `<p style="color:#888;">- No items saved.</p>`;
  }

  // Split into default vs custom based on your default arrays
  const defaultItems = [];
  const customItems = [];
  for (const item of data) {
    if (defaults.includes(item.text)) {
      defaultItems.push(item);
    } else {
      customItems.push(item);
    }
  }

  // Build HTML
  let html = "";

  // 1) Default items (original section)
  if (defaultItems.length > 0) {
    html += defaultItems.map(renderStatusBadge).join("");
  } else {
    html += `<p style="color:#888;">- No default checks saved.</p>`;
  }

  // 2) Custom items under the new heading "Custom PN check"
  if (customItems.length > 0) {
    html += `
      <h4 style="margin:14px 0 8px 0;font-size:14px;text-align:left;">Custom PN check</h4>
      ${customItems.map(renderStatusBadge).join("")}
    `;
  }

  return html;
}
