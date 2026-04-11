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

