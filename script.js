let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let dragIndex = null;

// Load dark mode
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function render() {
  const list = document.getElementById("list");
  const search = document.getElementById("search").value.toLowerCase();
  list.innerHTML = "";

  let completed = 0;

  if (tasks.length === 0) {
    list.innerHTML = "<p>No tasks yet</p>";
  }

  tasks
    .filter(t => t.text.toLowerCase().includes(search))
    .forEach((t, i) => {

      if (t.completed) completed++;

      const li = document.createElement("li");
      li.className = t.priority + (t.completed ? " completed" : "");
      li.draggable = true;

      const today = new Date().toISOString().split("T")[0];
      if (t.dueDate && t.dueDate < today && !t.completed) {
        li.style.background = "#ffcccc";
      }

      li.innerHTML = `
        <span onclick="toggle(${i})">
          ${t.text}
          <div class="small">${t.dueDate || ""}</div>
        </span>
        <div>
          <button class="edit-btn" onclick="edit(${i})">✏️</button>
          <button class="delete-btn" onclick="del(${i})">X</button>
        </div>
      `;

      li.addEventListener("dragstart", () => dragIndex = i);
      li.addEventListener("dragover", e => e.preventDefault());
      li.addEventListener("drop", () => {
        const temp = tasks[dragIndex];
        tasks[dragIndex] = tasks[i];
        tasks[i] = temp;
        save();
        render();
      });

      list.appendChild(li);
    });

  const percent = tasks.length ? (completed / tasks.length) * 100 : 0;
  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("progressText").innerText = Math.round(percent) + "% completed";

  document.getElementById("taskCount").innerText =
    `${tasks.length} tasks total`;
}

function addTask() {
  const text = document.getElementById("taskInput").value.trim();
  const priority = document.getElementById("priority").value;
  const dueDate = document.getElementById("dueDate").value;

  if (!text) return;

  tasks.push({
    id: Date.now(),
    text,
    priority,
    dueDate,
    completed: false
  });

  save();
  render();

  document.getElementById("taskInput").value = "";
}

function toggle(i) {
  tasks[i].completed = !tasks[i].completed;
  save();
  render();
}

function del(i) {
  tasks.splice(i, 1);
  save();
  render();
}

function edit(i) {
  const newText = prompt("Edit task:", tasks[i].text);
  if (newText && newText.trim()) {
    tasks[i].text = newText;
    save();
    render();
  }
}

function clearAll() {
  if (confirm("Delete all tasks?")) {
    tasks = [];
    save();
    render();
  }
}

function toggleDark() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode",
    document.body.classList.contains("dark"));
}

document.getElementById("search").addEventListener("input", render);

document.getElementById("taskInput")
  .addEventListener("keypress", e => {
    if (e.key === "Enter") addTask();
  });

render();