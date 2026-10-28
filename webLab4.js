"use strict";
class TodoStore {
    constructor(onChange) {
        this.todos = [];
        this.nextId = 1;
        this.onChange = onChange;
    }
    get remaining() {
        return this.todos.filter(t => !t.done).length;
    }
    list(filter) {
        if (filter === "active")
            return this.todos.filter(t => !t.done);
        if (filter === "completed")
            return this.todos.filter(t => t.done);
        return this.todos;
    }
    add(text) {
        this.todos = [...this.todos, { id: this.nextId++, text, done: false }]; 
        this.onChange();
    }
    toggle(id) {
        this.todos = this.todos.map(t => (t.id === id ? { ...t, done: !t.done } : t));
        this.onChange();
    }
    edit(id, text) {
        if (text.trim() === "")
            return this.remove(id); 
        this.todos = this.todos.map(t => (t.id === id ? { ...t, text: text.trim() } : t));
        this.onChange();
    }
    remove(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.onChange();
    }
    clearCompleted() {
        this.todos = this.todos.filter(t => !t.done);
        this.onChange();
    }
    clearAll() {
        this.todos = [];
        this.onChange();
    }
}

class TodoApp {
    constructor() {
        this.filter = "all";
        
        this.input = document.getElementById("todo-input");
        this.addBtn = document.getElementById("add-btn");
        this.list = document.getElementById("todo-list");
        this.count = document.getElementById("count");
        this.filters = document.getElementById("filters");
        this.clearDoneBtn = document.getElementById("clear-completed");
        this.clearAllBtn = document.getElementById("clear-all");
        this.store = new TodoStore(() => this.render()); // arrow function as callback
        this.listen();
        this.store.add("See Lecture");
        this.store.add("Solve assignment");
    }
    
    listen() {
        this.addBtn.addEventListener("click", () => this.addTodo());
        this.input.addEventListener("keydown", e => {
            if (e.key === "Enter")
                this.addTodo();
        });
        this.filters.addEventListener("click", e => {
            const btn = e.target.closest("button");
            if (!btn)
                return;
            this.filter = btn.dataset.filter;
            this.render();
        });
        this.clearDoneBtn.addEventListener("click", () => this.store.clearCompleted());
        this.clearAllBtn.addEventListener("click", () => this.store.clearAll());
        
        this.list.addEventListener("click", e => {
            const target = e.target;
            const li = target.closest("li");
            if (!li)
                return;
            const id = Number(li.dataset.id);
            if (target.matches(".delete"))
                this.store.remove(id);
            if (target.matches("input[type=checkbox]"))
                this.store.toggle(id);
        });
        this.list.addEventListener("dblclick", e => {
            const target = e.target;
            const li = target.closest("li");
            if (li && target.matches(".text"))
                this.startEdit(li, Number(li.dataset.id));
        });
    }
    
    addTodo() {
        const text = this.input.value.trim();
        if (text === "")
            return;
        this.store.add(text);
        this.input.value = "";
    }
    startEdit(li, id) {
        const span = li.querySelector(".text");
        const box = document.createElement("input");
        box.className = "edit";
        box.value = span.textContent ?? "";
        span.replaceWith(box);
        box.focus();
        let finished = false;
        const finish = (save) => {
            if (finished)
                return;
            finished = true;
            if (save)
                this.store.edit(id, box.value);
            else
                this.render();
        };
        box.addEventListener("keydown", e => {
            if (e.key === "Enter")
                finish(true);
            if (e.key === "Escape")
                finish(false);
        });
        box.addEventListener("blur", () => finish(true));
    }
    render() {
        
        this.list.innerHTML = this.store
            .list(this.filter)
            .map(({ id, text, done }) => `
        <li data-id="${id}" class="${done ? "done" : ""}">
          <input type="checkbox" ${done ? "checked" : ""}>
          <span class="text">${escapeHtml(text)}</span>
          <button class="delete" title="Delete">🗑</button>
        </li>`)
            .join("");
        const n = this.store.remaining;
        this.count.textContent = `${n} item${n === 1 ? "" : "s"} left`;
        this.filters.querySelectorAll("button").forEach(b => {
            b.classList.toggle("active", b.dataset.filter === this.filter);
        });
    }
}
function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
new TodoApp();