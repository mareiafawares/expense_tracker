const API_URL = 'http://localhost:3000/api/expenses';

// Global State
let allExpenses = [];
let editModalInstance = null;

// DOM Elements
const expensesTableBody = document.getElementById('expensesTableBody');
const totalAmountEl = document.getElementById('totalAmount');
const totalCountEl = document.getElementById('totalCount');
const highestExpenseEl = document.getElementById('highestExpense');
const addExpenseForm = document.getElementById('addExpenseForm');
const editExpenseForm = document.getElementById('editExpenseForm');
const filterCategory = document.getElementById('filterCategory');
const searchInput = document.getElementById('searchInput');
const sortBySelect = document.getElementById('sortBy');
const exportBtn = document.getElementById('exportBtn');
const alertContainer = document.getElementById('alertContainer');
const loadingSpinner = document.getElementById('loadingSpinner');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  fetchExpenses();
  document.getElementById('date').value = new Date().toISOString().split('T')[0];
  editModalInstance = new bootstrap.Modal(document.getElementById('editExpenseModal'));
});

addExpenseForm.addEventListener('submit', handleAddExpense);
editExpenseForm.addEventListener('submit', handleEditExpense);
filterCategory.addEventListener('change', applyFiltersAndRender);
searchInput.addEventListener('input', applyFiltersAndRender);
sortBySelect.addEventListener('change', applyFiltersAndRender);
exportBtn.addEventListener('click', exportToCSV);

// Display Bootstrap Alerts
function showAlert(message, type = 'danger') {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

// Clear Alerts
function clearAlert() {
  alertContainer.innerHTML = '';
}

// Show/Hide Loading Spinner
function toggleSpinner(show) {
  if (show) {
    loadingSpinner.classList.remove('d-none');
    expensesTableBody.classList.add('d-none');
  } else {
    loadingSpinner.classList.add('d-none');
    expensesTableBody.classList.remove('d-none');
  }
}

// Fetch expenses from API (GET)
async function fetchExpenses() {
  clearAlert();
  toggleSpinner(true);
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to connect to the server');
    }

    allExpenses = await res.json();
    updateSummaryCards(allExpenses);
    applyFiltersAndRender();
  } catch (error) {
    console.error('Error fetching expenses:', error);
    showAlert('Unable to load expenses. Please check if the backend server is running.', 'danger');
  } finally {
    toggleSpinner(false);
  }
}

// Filter, Search, and Sort
function applyFiltersAndRender() {
  let result = [...allExpenses];

  // 1. Category Filter
  const selectedCategory = filterCategory.value;
  if (selectedCategory !== 'All') {
    result = result.filter(exp => exp.category === selectedCategory);
  }

  // 2. Search Filter
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm) {
    result = result.filter(exp => exp.title.toLowerCase().includes(searchTerm));
  }

  // 3. Sorting
  const sortOption = sortBySelect.value;
  result.sort((a, b) => {
    if (sortOption === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortOption === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortOption === 'amount-desc') return b.amount - a.amount;
    if (sortOption === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  renderTable(result);
}

// Export to CSV Function
function exportToCSV() {
  if (allExpenses.length === 0) {
    showAlert('No data available to export.', 'warning');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,ID,Title,Amount,Category,Date\n";
  allExpenses.forEach(exp => {
    csvContent += `${exp.id},"${exp.title}",${exp.amount},"${exp.category}",${exp.date}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "expenses_report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Add Expense (POST)
async function handleAddExpense(e) {
  e.preventDefault();
  clearAlert();

  const title = document.getElementById('title').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;

  if (!title || isNaN(amount) || amount <= 0 || !category || !date) {
    showAlert('Please fill in all fields with valid information.', 'warning');
    return;
  }

  const newExpense = { title, amount, category, date };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Error adding expense');
    }

    addExpenseForm.reset();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    await fetchExpenses();
    showAlert('Expense added successfully!', 'success');

  } catch (error) {
    console.error('Error adding expense:', error);
    showAlert(error.message || 'Server connection failed', 'danger');
  }
}

// Open Edit Modal
function openEditModal(id) {
  const expense = allExpenses.find(exp => exp.id === id);
  if (!expense) return;

  document.getElementById('editId').value = expense.id;
  document.getElementById('editTitle').value = expense.title;
  document.getElementById('editAmount').value = expense.amount;
  document.getElementById('editCategory').value = expense.category;
  
  const formattedDate = new Date(expense.date).toISOString().split('T')[0];
  document.getElementById('editDate').value = formattedDate;

  editModalInstance.show();
}

// Update Expense (PUT)
async function handleEditExpense(e) {
  e.preventDefault();
  clearAlert();

  const id = document.getElementById('editId').value;
  const title = document.getElementById('editTitle').value.trim();
  const amount = parseFloat(document.getElementById('editAmount').value);
  const category = document.getElementById('editCategory').value;
  const date = document.getElementById('editDate').value;

  if (!title || isNaN(amount) || amount <= 0 || !category || !date) {
    showAlert('Please fill in all fields with valid information.', 'warning');
    return;
  }

  const updatedExpense = { title, amount, category, date };

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedExpense)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Error updating expense');
    }

    editModalInstance.hide();
    await fetchExpenses();
    showAlert('Expense updated successfully!', 'success');

  } catch (error) {
    console.error('Error updating expense:', error);
    showAlert(error.message || 'Server connection failed', 'danger');
  }
}

// Delete Expense (DELETE)
async function handleDelete(id) {
  if (!confirm('Are you sure you want to delete this expense?')) return;
  clearAlert();

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Error deleting expense');
    }

    await fetchExpenses();
    showAlert('Expense deleted successfully!', 'info');

  } catch (error) {
    console.error('Error deleting expense:', error);
    showAlert(error.message || 'Server connection failed', 'danger');
  }
}

// Render Table Rows
function renderTable(expenses) {
  expensesTableBody.innerHTML = '';

  if (expenses.length === 0) {
    expensesTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted py-3">No expenses found</td>
      </tr>
    `;
    return;
  }

  expenses.forEach(exp => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${exp.title}</td>
      <td>$${Number(exp.amount).toFixed(2)}</td>
      <td><span class="badge ${getCategoryBadge(exp.category)}">${exp.category}</span></td>
      <td>${exp.date}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${exp.id})">Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick="handleDelete(${exp.id})">Delete</button>
      </td>
    `;
    expensesTableBody.appendChild(tr);
  });
}

// Update Summary Cards
function updateSummaryCards(expenses) {
  const totalCount = expenses.length;
  const totalAmount = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  
  let highest = 0;
  if (expenses.length > 0) {
    highest = Math.max(...expenses.map(item => Number(item.amount)));
  }

  totalCountEl.textContent = totalCount;
  totalAmountEl.textContent = `$${totalAmount.toFixed(2)}`;
  highestExpenseEl.textContent = `$${highest.toFixed(2)}`;
}

// Badge styling per category (Pastel Theme)
function getCategoryBadge(category) {
  switch (category) {
    case 'Food': return 'badge-food';
    case 'Transport': return 'badge-transport';
    case 'Bills': return 'badge-bills';
    case 'Entertainment': return 'badge-entertainment';
    default: return 'badge-other';
  }
}