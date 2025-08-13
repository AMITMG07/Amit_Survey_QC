const scriptTodos = [
    "Ensure base conditions, terminations, and skip logic are correctly applied.",
    "Verify that recodes are added as per the questionnaire and question types match the requirements.",
    "Confirm randomization is implemented as per the questionnaire specifications."
];

const linkQCTodos = [
    "Verify that all question labels and types are accurate.",
    "Ensure base conditions, terminations, and skip logic work as expected.",
    "Check that formatting (bold, italic, underline, etc.) follows the questionnaire.",
    "Confirm that question text and response text exactly match the questionnaire."
];

const scriptList = document.getElementById("script-check-list");
const linkQCList = document.getElementById("link-qc-list");
const customList = document.getElementById("custom-todo-list");
const addBtn = document.getElementById("add-btn");
const customInput = document.getElementById("custom-input");

function createTodoElement(text, isCustom = false) {
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
    doneBtn.onclick = () => label.classList.add("done");

    const undoneBtn = document.createElement("button");
    undoneBtn.textContent = "Mark as Pending 🔄";
    undoneBtn.onclick = () => label.classList.remove("done");

    // If custom, add delete button to right side
    if (isCustom) {
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete ❌";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.onclick = () => {
            box.remove();
            checkScrollState();
        };
        actions.appendChild(doneBtn);
        actions.appendChild(undoneBtn);
        actions.appendChild(deleteBtn);
    } else {
        actions.appendChild(doneBtn);
        actions.appendChild(undoneBtn);
    }

    box.appendChild(actions);
    return box;
}

// Load default todos
scriptTodos.forEach(todo => {
    scriptList.appendChild(createTodoElement(todo, false));
});
linkQCTodos.forEach(todo => {
    linkQCList.appendChild(createTodoElement(todo, false));
});

// Add custom todo
addBtn.addEventListener("click", () => {
    const value = customInput.value.trim();
    if (value) {
        customList.appendChild(createTodoElement(value, true));
        customInput.value = "";
        checkScrollState();
    }
});

// Enable scroll only if needed
function checkScrollState() {
    if (document.body.scrollHeight > window.innerHeight) {
        document.body.classList.add("scrollable");
    } else {
        document.body.classList.remove("scrollable");
    }
}

checkScrollState();
