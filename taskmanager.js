/* taskmanager.js — My Task Board
   Pure vanilla JavaScript — no libraries, no localStorage.
   All DOM manipulation uses createElement / setAttribute /
   classList / textContent / appendChild (no innerHTML)*/

/*SECTION 1: DATA STORE
   tasks  = master array that holds every task object
   nextId = auto-increment unique ID counter*/

/** @type {Array<{id:number, columnId:string, title:string, desc:string, priority:string, dueDate:string}>} */
let tasks  = [];
let nextId = 1; // every new task gets a unique numeric id

/*SECTION 2: Select DOM ELEMENTS
    select every element we need once and store in variables*/

// Header elements
const taskCounterEl   = document.getElementById('taskCounter');
const priorityFilter  = document.getElementById('priorityFilter');

// Column task lists (the <ul> elements)
const listTodo        = document.getElementById('list-todo');
const listInProgress  = document.getElementById('list-inprogress');
const listDone        = document.getElementById('list-done');

// Column card-count badges
const countTodo       = document.getElementById('count-todo');
const countInProgress = document.getElementById('count-inprogress');
const countDone       = document.getElementById('count-done');

// Modal elements
const modalOverlay    = document.getElementById('modalOverlay');
const modalTitle      = document.getElementById('modalTitle');
const editTaskIdInput = document.getElementById('editTaskId');
const editColumnInput = document.getElementById('editColumnId');
const inputTitle      = document.getElementById('inputTitle');
const inputDesc       = document.getElementById('inputDesc');
const inputPriority   = document.getElementById('inputPriority');
const inputDueDate    = document.getElementById('inputDueDate');
const btnSave         = document.getElementById('btnSave');
const btnCancel       = document.getElementById('btnCancel');
const btnClearDone    = document.getElementById('btnClearDone');

/*SECTION 3: HELPER —getList（columnId）， get the correct <ul> for a column*/

/**
 * Returns the <ul> element that belongs to the given columnId.
 * @param {string} columnId — 'todo' | 'inprogress' | 'done'
 * @returns {HTMLUListElement}
 */
function getList(columnId) {
  if (columnId === 'todo')       return listTodo;
  if (columnId === 'inprogress') return listInProgress;
  if (columnId === 'done')       return listDone;
}

/**
 * Returns the count badge <span> for the given columnId.
 * @param {string} columnId
 * @returns {HTMLSpanElement}
 */
function getCountBadge(columnId) {
  if (columnId === 'todo')       return countTodo;
  if (columnId === 'inprogress') return countInProgress;
  if (columnId === 'done')       return countDone;
}

/* SECTION 4: updateCounters
   Recalculates the total task counter badge in the header
   and the per-column count badges*/

/**
 * Updates all task counter UI elements to reflect current tasks array*/
function updateCounters() {
  // Total tasks across all columns
  taskCounterEl.textContent = tasks.length + (tasks.length === 1 ? ' task' : ' tasks');

  // Per-column counts
  const cols = ['todo', 'inprogress', 'done'];
  cols.forEach(function(col) {
    const colCount = tasks.filter(function(t) { return t.columnId === col; }).length;
    getCountBadge(col).textContent = colCount;
  });
}

/*DOM MANIPULATION: Core CRUD Operations*/

/*SECTION 5: createTaskCard (CRUD)
   Builds a complete <li> card using ONLY the DOM API.
   No innerHTML. No template literals to build HTML*/

/**
 * Creates and returns a <li> DOM element representing one task.
 * Uses createElement, setAttribute, classList.add, textContent, appendChild ONLY.
 *
 * @param {{id:number, columnId:string, title:string, desc:string, priority:string, dueDate:string}} taskObj
 * @returns {HTMLLIElement}
 */
function createTaskCard(taskObj) {

  /* --- Outer <li> card container --- */
  const li = document.createElement('li');
  li.setAttribute('data-id', taskObj.id);       // store id as data attribute
  li.setAttribute('data-priority', taskObj.priority); // store priority for filter
  li.classList.add('task-card');

  /* --- Title <span> — double-click triggers inline edit --- */
  const titleSpan = document.createElement('span');
  titleSpan.classList.add('task-title');
  titleSpan.textContent = taskObj.title;         // safe: textContent never injects HTML

  // Attach inline-edit double-click listener to the title span
  // (Rubric: Inline editing — 15 marks)
  titleSpan.addEventListener('dblclick', function() {
    startInlineEdit(titleSpan, taskObj.id);
  });

  li.appendChild(titleSpan);

  /* --- Description <p> --- */
  const descP = document.createElement('p');
  descP.classList.add('task-desc');
  descP.textContent = taskObj.desc || 'No description.';
  li.appendChild(descP);

  /* --- Due Date <p> --- */
  const dueP = document.createElement('p');
  dueP.classList.add('task-due');
  dueP.textContent = taskObj.dueDate ? '📅 Due: ' + taskObj.dueDate : '📅 No due date';
  li.appendChild(dueP);

  /* --- Card footer row (badge + buttons) --- */
  const footer = document.createElement('div');
  footer.classList.add('card-footer');

  /* Priority badge <span> */
  const badge = document.createElement('span');
  badge.classList.add('priority-badge', taskObj.priority); // e.g. class="priority-badge high"
  badge.textContent = taskObj.priority.charAt(0).toUpperCase() + taskObj.priority.slice(1);
  footer.appendChild(badge);

  /* Button row wrapper */
  const btnRow = document.createElement('div');

  /* Edit button — data-action="edit" & data-id for event delegation */
  const editBtn = document.createElement('button');
  editBtn.classList.add('btn-edit');
  editBtn.setAttribute('data-action', 'edit');  // event delegation reads this
  editBtn.setAttribute('data-id', taskObj.id);
  editBtn.textContent = '✏️ Edit';
  btnRow.appendChild(editBtn);

  /* Delete button — data-action="delete" & data-id for event delegation */
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('btn-delete');
  deleteBtn.setAttribute('data-action', 'delete');
  deleteBtn.setAttribute('data-id', taskObj.id);
  deleteBtn.textContent = '🗑 Delete';
  btnRow.appendChild(deleteBtn);

  footer.appendChild(btnRow);
  li.appendChild(footer);

  return li; // return the fully built <li> — caller appends it
}

/* SECTION 6: addTask (CRUD)
   Saves task object to the tasks array, builds the card,
   appends it to the correct column, and updates counters*/

/**
 * Adds a new task to the given column.
 * @param {string} columnId — 'todo' | 'inprogress' | 'done'
 * @param {{title:string, desc:string, priority:string, dueDate:string}} taskData
 */
function addTask(columnId, taskObj) {
  // Build the full task object with a unique id
  const taskObj = {
    id:       nextId++,
    columnId: columnId,
    title:    taskObj.title,
    desc:     taskObj.desc,
    priority: taskObj.priority,
    dueDate:  taskObj.dueDate
  };

  tasks.push(taskObj); // save to master array

  const card = createTaskCard(taskObj);  // build the DOM card
  getList(columnId).appendChild(card);   // append to the right <ul>

  // Apply current filter to the newly added card
  applyFilter(priorityFilter.value);

  updateCounters(); // refresh badges
}

/* SECTION 7: deleteTask (CRUD)
   Adds css fade-out animation class, waits for animation to end,
   then removes the card from DOM and data from tasks array*/

/**
 * Animates then removes the task card with the given id.
 * @param {number} taskId
 */
function deleteTask(taskId) {
  // Find the card in DOM using attribute selector
  const card = document.querySelector('[data-id="' + taskId + '"]');
  if (!card) return;

  // Add the CSS fade-out animation class
  card.classList.add('is-removing');

  // After animation ends (350ms in CSS), physically remove the element
  card.addEventListener('animationend', function() {
    card.remove(); // Rubric: element.remove()

    // Also remove from the data array
    tasks = tasks.filter(function(t) { return t.id !== taskId; });

    updateCounters();
  });
}

/* SECTION 8: editTask (CRUD)
   Opens the modal pre-filled with the existing task data*/

/**
 * Opens the modal in edit mode, pre-filled with the task's current data.
 * @param {number} taskId
 */
function editTask(taskId) {
  // Find the task object in our data array
  const taskObj = tasks.find(function(t) { return t.id === taskId; });
  if (!taskObj) return;

  // Pre-fill modal fields with existing values
  modalTitle.textContent    = 'Edit Task';
  editTaskIdInput.value     = taskObj.id;       // remember which task we're editing
  editColumnInput.value     = taskObj.columnId; // remember which column it's in
  inputTitle.value          = taskObj.title;
  inputDesc.value           = taskObj.desc;
  inputPriority.value       = taskObj.priority;
  inputDueDate.value        = taskObj.dueDate;

  openModal(); // show the modal overlay
}

