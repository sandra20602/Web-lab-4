
type Filter = "all" | "active" | "completed";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}


class TodoStore {
  private todos: Todo[] = [];
  private nextId: number = 1;
  private onChange: () => void; 

  constructor(onChange: () => void) {
    this.onChange = onChange;
  }

  get remaining(): number {
    return this.todos.filter(t => !t.done).length;
  }

  list(filter: Filter): Todo[] {
    if (filter === "active") return this.todos.filter(t => !t.done);
    if (filter === "completed") return this.todos.filter(t => t.done);
    return this.todos;
  }

  add(text: string): void {
    this.todos = [...this.todos, { id: this.nextId++, text, done: false }]; // spread
    this.onChange();
  }

  toggle(id: number): void {
    this.todos = this.todos.map(t => (t.id === id ? { ...t, done: !t.done } : t));
    this.onChange();
  }

  edit(id: number, text: string): void {
    if (text.trim() === "") return this.remove(id); // empty text = delete
    this.todos = this.todos.map(t => (t.id === id ? { ...t, text: text.trim() } : t));
    this.onChange();
  }

  remove(id: number): void {
    this.todos = this.todos.filter(t => t.id !== id);
    this.onChange();
  }

  clearCompleted(): void {
    this.todos = this.todos.filter(t => !t.done);
    this.onChange();
  }

  clearAll(): void {
    this.todos = [];
    this.onChange();
  }
}

class TodoApp {
  private store: TodoStore;
  private filter: Filter = "all";

  private input = document.getElementById("todo-input") as HTMLInputElement;
  private addBtn = document.getElementById("add-btn") as HTMLButtonElement;
  private list = document.getElementById("todo-list") as HTMLUListElement;
  private count = document.getElementById("count") as HTMLSpanElement;
  private filters = document.getElementById("filters") as HTMLDivElement;
  private clearDoneBtn = document.getElementById("clear-completed") as HTMLButtonElement;
  private clearAllBtn = document.getElementById("clear-all") as HTMLButtonElement;

  constructor() {
    this.store = new TodoStore(() => this.render()); // arrow function as callback
    this.listen();
    this.store.add("See Lecture");
    this.store.add("Solve assignment");
  }

  private listen(): void {
    this.addBtn.addEventListener("click", () => this.addTodo());
    this.input.addEventListener("keydown", e => {
      if (e.key === "Enter") this.addTodo();
    });

    this.filters.addEventListener("click", e => {
      const btn = (e.target as HTMLElement).closest("button");
      if (!btn) return;
      this.filter = btn.dataset.filter as Filter;
      this.render();
    });

    this.clearDoneBtn.addEventListener("click", () => this.store.clearCompleted());
    this.clearAllBtn.addEventListener("click", () => this.store.clearAll());

    this.list.addEventListener("click", e => {
      const target = e.target as HTMLElement;
      const li = target.closest("li");
      if (!li) return;
      const id = Number(li.dataset.id);
      if (target.matches(".delete")) this.store.remove(id);
      if (target.matches("input[type=checkbox]")) this.store.toggle(id);
    });

    this.list.addEventListener("dblclick", e => {
      const target = e.target as HTMLElement;
      const li = target.closest("li");
      if (li && target.matches(".text")) this.startEdit(li, Number(li.dataset.id));
    });
  }

  private addTodo(): void {
    const text = this.input.value.trim();
    if (text === "") return;
    this.store.add(text);
    this.input.value = "";
  }

  private startEdit(li: HTMLElement, id: number): void {
    const span = li.querySelector(".text") as HTMLSpanElement;
    const box = document.createElement("input");
    box.className = "edit";
    box.value = span.textContent ?? "";
    span.replaceWith(box);
    box.focus();

    let finished = false;
    const finish = (save: boolean): void => {
      if (finished) return;
      finished = true;
      if (save) this.store.edit(id, box.value);
      else this.render();
    };

    box.addEventListener("keydown", e => {
      if (e.key === "Enter") finish(true);
      if (e.key === "Escape") finish(false);
    });
    box.addEventListener("blur", () => finish(true));
  }

  private render(): void {
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

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

new TodoApp();

export {};