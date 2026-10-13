function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");

  if (savedTasks === null) {
    return [];
  }

  try {
    const loadedTasks = JSON.parse(savedTasks);
    if (Array.isArray(loadedTasks)) {
      return loadedTasks;
    }
  } catch (error) {
    return [];
  }

  return [];
}

const tasks = loadTasks();

const taskForm = document.querySelector("form");
const taskList = document.querySelector("#task-list");
const startDateInput = document.querySelector("#start-date");
const finalDateInput = document.querySelector("#final-date");
const finishTasksSection = document.querySelector(".finish-tasks-section");
const deleteAllButton = document.querySelector(".header-list button");
const deleteAllFinishedButton = document.querySelector(".delete-all-finished");
const taskModal = document.querySelector("#task-modal");
const modalCloseButton = document.querySelector("#modal-close");
const modalTaskTitle = document.querySelector("#modal-task-title");
const modalTaskPriority = document.querySelector("#modal-task-priority");
const modalTaskDescription = document.querySelector("#modal-task-description");
const modalTaskStartDate = document.querySelector("#modal-task-start-date");
const modalTaskFinalDate = document.querySelector("#modal-task-final-date");
const modalTaskStatus = document.querySelector("#modal-task-status");
const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
let previousBodyOverflow = "";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  if (date === "") {
    return "";
  }

  const parts = date.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function openModal(id) {
  let selectedTask = null;

  for (let i = 0; i < tasks.length; i++) {
    if (String(tasks[i].id) === id) {
      selectedTask = tasks[i];
      break;
    }
  }

  if (selectedTask === null) {
    return;
  }

  modalTaskTitle.textContent = selectedTask.title;
  modalTaskPriority.textContent = selectedTask.priority;
  modalTaskPriority.className = `task-modal-priority badge-${selectedTask.priority}`;
  modalTaskDescription.textContent = selectedTask.detail || "Tidak ada deskripsi";
  modalTaskStartDate.textContent = selectedTask.startDate === "" ? "-" : formatDate(selectedTask.startDate);
  modalTaskFinalDate.textContent = selectedTask.finalDate === "" ? "-" : formatDate(selectedTask.finalDate);

  if (selectedTask.isDone === true) {
    modalTaskStatus.textContent = `Finished on ${selectedTask.finishedDate}`;
  } else {
    modalTaskStatus.textContent = "Belum selesai";
  }

  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  taskModal.hidden = false;
}

function closeModal() {
  if (taskModal.hidden === true) {
    return;
  }

  taskModal.hidden = true;
  document.body.style.overflow = previousBodyOverflow;
}

function handleTaskCardClick(event) {
  if (event.target.closest("input, button")) {
    return;
  }

  const card = event.target.closest(".card-task, .card-final-task");
  if (card === null) {
    return;
  }

  openModal(card.dataset.id);
}

function renderHeaderDate() {
  const today = new Date();
  document.querySelector(".datetime-day").textContent = dayNames[today.getDay()];
  document.querySelector(".datetime-date").textContent = formatDate(getDateValue(today));
  document.querySelector(".datetime-date").dateTime = getDateValue(today);
}

function updateFinalDateMinimum() {
  if (startDateInput.value === "") {
    finalDateInput.removeAttribute("min");
    return;
  }

  finalDateInput.min = startDateInput.value;
}

function renderTasks() {
  taskList.textContent = "";
  const oldFinishedCards = finishTasksSection.querySelectorAll(".card-final-task");

  for (let i = 0; i < oldFinishedCards.length; i++) {
    oldFinishedCards[i].remove();
  }

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    if (task.isDone === false) {
      const card = document.createElement("div");
      card.className = "card-task";
      card.dataset.id = task.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.addEventListener("change", function () {
        task.isDone = true;
        task.finishedDate = formatDate(getDateValue(new Date()));
        saveTasks();
        renderTasks();
      });

      const info = document.createElement("div");
      info.className = "info-task";

      const header = document.createElement("div");
      header.className = "header-info-task";

      const title = document.createElement("h2");
      title.textContent = task.title;

      const priority = document.createElement("span");
      priority.textContent = task.priority;
      priority.className = `badge-${task.priority}`;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      const deleteIcon = document.createElement("img");
      deleteIcon.src = "./images/delete.png";
      deleteIcon.alt = "delete icon";
      deleteButton.appendChild(deleteIcon);
      deleteButton.addEventListener("click", function () {
        for (let j = 0; j < tasks.length; j++) {
          if (tasks[j].id === task.id) {
            tasks.splice(j, 1);
            break;
          }
        }

        saveTasks();
        renderTasks();
      });

      const detail = document.createElement("p");
      detail.textContent = task.detail;

      const dates = document.createElement("span");
      dates.textContent = `${formatDate(task.startDate)} - ${formatDate(task.finalDate)}`;

      header.appendChild(title);
      header.appendChild(priority);
      header.appendChild(deleteButton);
      info.appendChild(header);
      info.appendChild(detail);
      info.appendChild(dates);
      card.appendChild(checkbox);
      card.appendChild(info);
      taskList.appendChild(card);
    } else {
      const card = document.createElement("div");
      card.className = "card-final-task";
      card.dataset.id = task.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.addEventListener("change", function () {
        if (checkbox.checked === false) {
          task.isDone = false;
          task.finishedDate = "";
          saveTasks();
          renderTasks();
        }
      });

      const info = document.createElement("div");
      info.className = "finished-info";

      const title = document.createElement("h2");
      title.textContent = task.title;

      const finishedDate = document.createElement("span");
      finishedDate.textContent = `Finished on ${task.finishedDate}`;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      const deleteIcon = document.createElement("img");
      deleteIcon.src = "./images/delete.png";
      deleteIcon.alt = "delete icon";
      deleteButton.appendChild(deleteIcon);
      deleteButton.addEventListener("click", function () {
        for (let j = 0; j < tasks.length; j++) {
          if (tasks[j].id === task.id) {
            tasks.splice(j, 1);
            break;
          }
        }

        saveTasks();
        renderTasks();
      });

      info.appendChild(title);
      info.appendChild(finishedDate);
      card.appendChild(checkbox);
      card.appendChild(info);
      card.appendChild(deleteButton);
      finishTasksSection.appendChild(card);
    }
  }
}

taskList.addEventListener("click", handleTaskCardClick);
finishTasksSection.addEventListener("click", handleTaskCardClick);
modalCloseButton.addEventListener("click", closeModal);
taskModal.addEventListener("click", function (event) {
  if (event.target === taskModal) {
    closeModal();
  }
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

startDateInput.addEventListener("input", updateFinalDateMinimum);
startDateInput.addEventListener("change", updateFinalDateMinimum);

deleteAllButton.addEventListener("click", function () {
  let hasTodoTasks = false;

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].isDone === false) {
      hasTodoTasks = true;
      break;
    }
  }

  if (hasTodoTasks === false) {
    alert("Tidak ada task di TODO List.");
    return;
  }

  if (confirm("Hapus semua task di TODO List?")) {
    for (let i = tasks.length - 1; i >= 0; i--) {
      if (tasks[i].isDone === false) {
        tasks.splice(i, 1);
      }
    }

    saveTasks();
    renderTasks();
  }
});

deleteAllFinishedButton.addEventListener("click", function () {
  let hasFinishedTasks = false;

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].isDone === true) {
      hasFinishedTasks = true;
      break;
    }
  }

  if (hasFinishedTasks === false) {
    alert("Tidak ada task selesai.");
    return;
  }

  if (confirm("Hapus semua task di Finish Tasks?")) {
    for (let i = tasks.length - 1; i >= 0; i--) {
      if (tasks[i].isDone === true) {
        tasks.splice(i, 1);
      }
    }

    saveTasks();
    renderTasks();
  }
});

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = document.querySelector("#title-task").value.trim();
  const detail = document.querySelector("#detail-task").value;
  const startDate = startDateInput.value;
  const finalDate = finalDateInput.value;
  const selectedPriority = document.querySelector('input[name="priority"]:checked');

  if (title === "" || selectedPriority === null) {
    alert("Please enter a task name and select a priority.");
    return;
  }

  if (startDate !== "" && finalDate !== "" && finalDate < startDate) {
    alert("Final Date tidak boleh lebih awal dari Start Date.");
    return;
  }

  const task = {
    id: Date.now(),
    title: title,
    detail: detail,
    startDate: startDate,
    finalDate: finalDate,
    priority: selectedPriority.value,
    isDone: false
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  taskForm.reset();
  updateFinalDateMinimum();
});

renderHeaderDate();
renderTasks();
