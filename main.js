// DOM elements
const bookForm = document.getElementById("bookForm");
const titleInput = document.getElementById("bookFormTitle");
const authorInput = document.getElementById("bookFormAuthor");
const yearInput = document.getElementById("bookFormYear");
const publisherInput = document.getElementById("bookFormPublisher");
const isbnInput = document.getElementById("bookFormISBN");
const isCompleteInput = document.getElementById("bookFormIsComplete");
const submitBtn = document.getElementById("bookFormSubmit");

const searchInput = document.getElementById("searchBookTitle");

const incompleteList = document.getElementById("incompleteBookList");
const completeList = document.getElementById("completeBookList");

let books = [];
let editId = null;

// Local Storage Key
const STORAGE_KEY = "BOOKSHELF_APPS";

// Load data from HTML on first visit
function loadInitialBooks() {
  const existingBooks = [];
  
  // Load dari incomplete list
  const incompleteItems = incompleteList.querySelectorAll('[data-testid="bookItem"]');
  incompleteItems.forEach(item => {
    const book = {
      id: parseInt(item.dataset.bookid),
      title: item.querySelector('[data-testid="bookItemTitle"]').textContent,
      author: item.querySelector('[data-testid="bookItemAuthor"]').textContent.replace('Penulis: ', ''),
      year: parseInt(item.querySelector('[data-testid="bookItemYear"]').textContent.replace('Tahun: ', '')),
      publisher: item.querySelector('[data-testid="bookItemPublisher"]').textContent.replace('Penerbit: ', ''),
      isbn: item.querySelector('[data-testid="bookItemISBN"]').textContent.replace('ISBN: ', ''),
      isComplete: false
    };
    existingBooks.push(book);
  });
  
  // Load dari complete list
  const completeItems = completeList.querySelectorAll('[data-testid="bookItem"]');
  completeItems.forEach(item => {
    const book = {
      id: parseInt(item.dataset.bookid),
      title: item.querySelector('[data-testid="bookItemTitle"]').textContent,
      author: item.querySelector('[data-testid="bookItemAuthor"]').textContent.replace('Penulis: ', ''),
      year: parseInt(item.querySelector('[data-testid="bookItemYear"]').textContent.replace('Tahun: ', '')),
      publisher: item.querySelector('[data-testid="bookItemPublisher"]').textContent.replace('Penerbit: ', ''),
      isbn: item.querySelector('[data-testid="bookItemISBN"]').textContent.replace('ISBN: ', ''),
      isComplete: true
    };
    existingBooks.push(book);
  });
  
  return existingBooks;
}

// Simpan dari Local Storage
function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

// Load dari Local Storage
function loadFromLocalStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  
  if (data) {
    // Jika ada data di localStorage, gunakan itu
    books = JSON.parse(data);
  } else {
    // Jika belum ada, load dari HTML dan simpan ke localStorage
    books = loadInitialBooks();
    saveToLocalStorage();
  }
}

// Buat DOM element
function createBookElement(book) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("book-item");
  wrapper.dataset.bookid = book.id;
  wrapper.dataset.testid = "bookItem";

  wrapper.innerHTML = `
    <h3 data-testid="bookItemTitle">${book.title}</h3>
    <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
    <p data-testid="bookItemYear">Tahun: ${book.year}</p>
    <p data-testid="bookItemPublisher">Penerbit: ${book.publisher}</p>
    <p data-testid="bookItemISBN">ISBN: ${book.isbn}</p>

    <div>
      <button data-testid="bookItemIsCompleteButton">${book.isComplete ? "Belum selesai dibaca" : "Selesai dibaca"}</button>
      <button data-testid="bookItemDeleteButton">Hapus Buku</button>
      <button data-testid="bookItemEditButton">Edit Buku</button>
    </div>
  `;

  const [toggleBtn, deleteBtn, editBtn] = wrapper.querySelectorAll("button");

  toggleBtn.addEventListener("click", () => toggleBook(book.id));
  deleteBtn.addEventListener("click", () => deleteBook(book.id));
  editBtn.addEventListener("click", () => startEdit(book.id));

  // Delay class add → produces fade-in animation
  setTimeout(() => wrapper.classList.add("show", "glow"), 15);

  return wrapper;
}

// Render books
function render(filter = "") {
  incompleteList.innerHTML = "";
  completeList.innerHTML = "";

  const q = filter.toLowerCase();

  books
    .filter(b => b.title.toLowerCase().includes(q))
    .forEach(book => {
      const el = createBookElement(book);
      if (book.isComplete) completeList.appendChild(el);
      else incompleteList.appendChild(el);
    });
}

// Add book
function addBook(data) {
  books.push({ id: Date.now(), ...data });
  saveToLocalStorage();
  render(searchInput.value);
}

// Delete with fade-out animation
function deleteBook(id) {
  const bookEl = document.querySelector(`[data-bookid="${id}"]`);
  if (!bookEl) return;

  bookEl.classList.add("hide");

  setTimeout(() => {
    books = books.filter(b => b.id !== id);
    saveToLocalStorage();
    render(searchInput.value);
  }, 250);
}

// Toggle complete with smooth movement
function toggleBook(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  book.isComplete = !book.isComplete;
  saveToLocalStorage();
  render(searchInput.value);
}

// Edit
function startEdit(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  editId = id;

  titleInput.value = book.title;
  authorInput.value = book.author;
  yearInput.value = book.year;
  publisherInput.value = book.publisher;
  isbnInput.value = book.isbn;
  isCompleteInput.checked = book.isComplete;

  submitBtn.textContent = "Simpan Perubahan";
  
  // Scroll to form
  bookForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Save edit
function saveEdit() {
  const book = books.find(b => b.id === editId);
  if (!book) return;

  book.title = titleInput.value;
  book.author = authorInput.value;
  book.year = yearInput.value;
  book.publisher = publisherInput.value;
  book.isbn = isbnInput.value;
  book.isComplete = isCompleteInput.checked;

  editId = null;
  submitBtn.textContent = "Masukkan Buku ke Rak";
  saveToLocalStorage();
  render(searchInput.value);
}

// Form
bookForm.addEventListener("submit", e => {
  e.preventDefault();

  const data = {
    title: titleInput.value,
    author: authorInput.value,
    year: yearInput.value,
    publisher: publisherInput.value,
    isbn: isbnInput.value,
    isComplete: isCompleteInput.checked,
  };

  if (editId) {
    saveEdit();
  } else {
    addBook(data);
  }

  bookForm.reset();
});

// Search
searchInput.addEventListener("input", e => render(e.target.value));

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  loadFromLocalStorage();
  render();
});