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

// Page Navigation
function navigateTo(pageId) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
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
    saveTodos(listType);
  };

  const undoneBtn = document.createElement("button");
  undoneBtn.textContent = "Mark as Pending 🔄";
  undoneBtn.onclick = () => {
    label.classList.remove("done");
    saveTodos(listType);
  };

  actions.appendChild(doneBtn);
  actions.appendChild(undoneBtn);

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

// Save Todos to LocalStorage
function saveTodos(listType) {
  const todos = [];
  document.querySelectorAll(`#${listType}-list .todo-box`).forEach(box => {
    todos.push({
      text: box.querySelector(".todo-text").textContent,
      done: box.querySelector(".todo-text").classList.contains("done")
    });
  });
  localStorage.setItem(listType, JSON.stringify(todos));
}

// Load Todos from LocalStorage
function loadTodos(listType, defaultTodos, customInputId, addBtnId, customListId) {
  const list = document.getElementById(`${listType}-list`);
  const customList = document.getElementById(customListId);
  list.innerHTML = "";
  customList.innerHTML = "";

  const stored = JSON.parse(localStorage.getItem(listType)) || [];
  if (stored.length > 0) {
    stored.forEach(todo => {
      const el = createTodoElement(todo.text, false, listType);
      if (todo.done) el.querySelector(".todo-text").classList.add("done");
      list.appendChild(el);
    });
  } else {
    defaultTodos.forEach(todo => {
      list.appendChild(createTodoElement(todo, false, listType));
    });
  }

  document.getElementById(addBtnId).onclick = () => {
    const value = document.getElementById(customInputId).value.trim();
    if (value) {
      customList.appendChild(createTodoElement(value, true, listType));
      document.getElementById(customInputId).value = "";
      saveTodos(listType);
    }
  };
}

// Load Script & Link Todos
loadTodos("script-check", scriptTodos, "custom-script-input", "add-script-btn", "custom-script-list");
loadTodos("link-qc", linkQCTodos, "custom-link-input", "add-link-btn", "custom-link-list");

// ✅ Optimized PDF & Email Function
async function downloadAndEmailPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  for (let pageId of ["script-page", "link-page"]) {
    const element = document.getElementById(pageId);
    element.classList.add("active");

    // Faster rendering (reduced scale)
    const canvas = await html2canvas(element, {
      scale: 1, // reduced from 1.5 for speed
      backgroundColor: "#fff",
      useCORS: true
    });

    const imgData = canvas.toDataURL("image/png");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    if (pageId !== "link-page") pdf.addPage();

    element.classList.remove("active");
  }

  const pdfFileName = "Survey_QC.pdf";
  pdf.save(pdfFileName);

  // ✅ Use Outlook (not Gmail)
  const outlookUrl =
    "https://outlook.office.com/mail/deeplink/compose" +
    "?to=amitgadad@gmail.com" +
    "&subject=" + encodeURIComponent("Survey QC Report") +
    "&body=" + encodeURIComponent(
      "Hi,\n\nPlease find the attached Survey QC PDF.\n\n(Attachment: " + pdfFileName + ")"
    );

  // Try opening Outlook
  const win = window.open(outlookUrl, "_blank");

  // Fallback: mailto link
  if (!win) {
    window.location.href =
      "mailto:amitgadad@gmail.com" +
      "?subject=" + encodeURIComponent("Survey QC Report") +
      "&body=" + encodeURIComponent("Hi,\n\nPlease find the attached Survey QC PDF.\n\n");
  }
}
