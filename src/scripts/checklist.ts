const storageKey = "bg3-wayfarers-ledger-v1";
const cards = [...document.querySelectorAll<HTMLElement>(".item-card")];
const checkboxes = [...document.querySelectorAll<HTMLInputElement>(".item-card__check input")];
const filterButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-filter-act]")];
const searchInput = document.querySelector<HTMLInputElement>("#search");
const emptyState = document.querySelector<HTMLElement>("#empty-state");
const progressBar = document.querySelector<HTMLElement>(".progress-track");
const progressFill = document.querySelector<HTMLElement>("#progress-fill");
const collectedCount = document.querySelector<HTMLElement>("#collected-count");
const resetButton = document.querySelector<HTMLButtonElement>("#reset-progress");

if (!searchInput || !emptyState || !progressBar || !progressFill || !collectedCount || !resetButton) {
  throw new Error("Checklist controls are missing");
}

const loadCollected = () => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
  } catch {
    return new Set<string>();
  }
};

let collected = loadCollected();
let activeAct = "all";

const updateProgress = () => {
  const count = collected.size;
  collectedCount.textContent = String(count);
  progressFill.style.width = `${(count / cards.length) * 100}%`;
  progressBar.setAttribute("aria-valuenow", String(count));
};

const applyFilters = () => {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCards = 0;

  document.querySelectorAll<HTMLElement>(".act-section").forEach((section) => {
    const isActiveAct = activeAct === "all" || section.dataset.sectionAct === activeAct;
    let visibleInSection = 0;

    section.querySelectorAll<HTMLElement>(".item-card").forEach((card) => {
      const matchesSearch = !query || card.dataset.search?.includes(query);
      card.hidden = !(isActiveAct && matchesSearch);
      if (!card.hidden) visibleInSection += 1;
    });

    section.hidden = visibleInSection === 0;
    visibleCards += visibleInSection;
  });

  emptyState.hidden = visibleCards !== 0;
};

checkboxes.forEach((checkbox) => {
  const itemId = checkbox.dataset.itemId;
  if (!itemId) return;

  checkbox.checked = collected.has(itemId);
  checkbox.closest(".item-card")?.classList.toggle("is-collected", checkbox.checked);
  checkbox.addEventListener("change", () => {
    checkbox.checked ? collected.add(itemId) : collected.delete(itemId);
    checkbox.closest(".item-card")?.classList.toggle("is-collected", checkbox.checked);
    localStorage.setItem(storageKey, JSON.stringify([...collected]));
    updateProgress();
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeAct = button.dataset.filterAct ?? "all";
    filterButtons.forEach((candidate) => {
      const isActive = candidate === button;
      candidate.classList.toggle("is-active", isActive);
      candidate.setAttribute("aria-pressed", String(isActive));
    });
    applyFilters();
  });
});

searchInput.addEventListener("input", applyFilters);
resetButton.addEventListener("click", () => {
  if (collected.size === 0 || !window.confirm("Clear every collected check?")) return;

  collected = new Set();
  localStorage.removeItem(storageKey);
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.closest(".item-card")?.classList.remove("is-collected");
  });
  updateProgress();
});

updateProgress();
