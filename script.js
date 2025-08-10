const defaultTodos = [
    "Verify that question labels and types are correct.",
    "Ensure base conditions are applied correctly.",
    "Check if the question text and response text match with the questionnaire.",
    "Confirm proper termination or skip logic is in place.",
    "Ensure recodes match with the questionnaire."
];

const todoList = document.getElementById("todo-list");
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
    doneBtn.onclick = () => {
        label.classList.add("done");
    };

    const undoneBtn = document.createElement("button");
    undoneBtn.textContent = "Mark as Pending 🔄";
    undoneBtn.onclick = () => {
        label.classList.remove("done");
    };

    actions.appendChild(doneBtn);
    actions.appendChild(undoneBtn);
    box.appendChild(actions);

    // Delete button in same place as Add
    if (isCustom) {
        const deleteContainer = document.createElement("div");
        deleteContainer.classList.add("add-section");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete ❌";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.onclick = () => {
            box.remove();
        };

        deleteContainer.appendChild(deleteBtn);
        box.appendChild(deleteContainer);
    }

    return box;
}

// Load default todos
defaultTodos.forEach(todo => {
    todoList.appendChild(createTodoElement(todo, false));
});

// Add custom todo
addBtn.addEventListener("click", () => {
    const value = customInput.value.trim();
    if (value) {
        customList.appendChild(createTodoElement(value, true));
        customInput.value = "";
    }
});
