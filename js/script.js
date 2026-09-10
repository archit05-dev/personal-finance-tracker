const form = document.getElementById("transactionForm");
const submitBtn = document.getElementById("submitBtn");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const transactionList = document.getElementById("transactionList");

const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

const searchInput = document.getElementById("search");
const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");
const sort = document.getElementById("sort");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editId = null;

function renderTransactions(transactionArray = transactions) {

    transactionList.innerHTML = "";

    if (transactionArray.length === 0) {
        transactionList.innerHTML =
            '<div class="empty-state">No transactions yet.</div>';
        return;
    }


    transactionArray.forEach(function(transaction) {

        const transactionCard = document.createElement("div");
        transactionCard.className = "transaction-card";

        transactionCard.innerHTML = `
            <h3>${transaction.title}</h3>

            <h2 class="transaction-amount">
                ₹${transaction.amount.toLocaleString()}
            </h2>

            <div class="transaction-meta">

                <span class="${transaction.type.toLowerCase()}">
                ${transaction.type}
                </span>

                <span>
                    ${transaction.category}
                </span>

            </div>

            <div class="transaction-footer">

                <p class="transaction-date">
                    ${transaction.date}
                </p>

                <div class="actions">

                    <button onclick="editTransaction(${transaction.id})">
                        Edit
                    </button>

                    <button onclick="deleteTransaction(${transaction.id})">
                    Delete
                    </button>

                </div>
            </div>
        `;

        transactionList.appendChild(transactionCard);

    });

}

function updateSummary() {

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(function(transaction){

        if(transaction.type === "Income"){
            totalIncome += transaction.amount;
        }
        else{
            totalExpense += transaction.amount;
        }

    });

    const totalBalance = totalIncome - totalExpense;

    balance.textContent = `₹${totalBalance.toLocaleString()}`;
    income.textContent = `₹${totalIncome.toLocaleString()}`;
    expense.textContent = `₹${totalExpense.toLocaleString()}`;

}

form.addEventListener("submit", function(event) {

    event.preventDefault();

    if (
        titleInput.value.trim() === "" ||
        amountInput.value === "" ||
        Number(amountInput.value) <= 0 ||
        typeInput.value === "Select Type" ||
        categoryInput.value === "Select Category" ||
        dateInput.value === ""
    ) {
        alert("Please fill in all fields.");
        return;
    }

    const transaction = {
     id: Date.now(),
     title: titleInput.value,
     amount: Number(amountInput.value),
     type: typeInput.value,
     category: categoryInput.value,
     date: dateInput.value
    };
    if (editId === null) {
        transactions.push(transaction);
    }
    else {
        const index = transactions.findIndex(function(transaction) {
            return transaction.id === editId;
        });

        transaction.id = editId;

        transactions[index] = transaction;

        editId = null;

        submitBtn.textContent = "Add Transaction";
    }

    applyFilters();
    updateSummary();
    saveTransactions();
    form.reset();

});

function deleteTransaction(id){

    if (!confirm("Are you sure you want to delete this transaction?")) {
        return
    }

    if (editId === id) {
        editId = null;
        form.reset();
        submitBtn.textContent = "Add Transaction";
    }

    transactions = transactions.filter(function(transaction){

        return transaction.id !== id;

    });

    applyFilters();
    updateSummary();
    saveTransactions();

}

function editTransaction(id){

    const transaction = transactions.find(function(transaction){
        return transaction.id === id;
    });

    titleInput.value = transaction.title;
    amountInput.value = transaction.amount;
    typeInput.value = transaction.type;
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;

    editId = id;

    submitBtn.textContent = "Update Transaction";

}

function saveTransactions(){

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}

function applyFilters() {

    let filteredTransactions = [...transactions];

    const searchText = searchInput.value.toLowerCase();

    filteredTransactions = filteredTransactions.filter(function(transaction) {

        return transaction.title.toLowerCase().includes(searchText);

    });

    if (filterType.value !== "All Types") {

        filteredTransactions = filteredTransactions.filter(function(transaction) {
            return transaction.type === filterType.value;
        });
    }

    if (filterCategory.value !== "All Categories") {

        filteredTransactions = filteredTransactions.filter(function(transaction) {
            return transaction.category === filterCategory.value;
        });
    }

    if (sort.value === "Newest First") {

        filteredTransactions.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });
    }
    else {

         filteredTransactions.sort(function(a, b) {
            return new Date(a.date) - new Date(b.date);
         });
    }

    renderTransactions(filteredTransactions);

}

searchInput.addEventListener("input", applyFilters);

filterType.addEventListener("change", applyFilters);

filterCategory.addEventListener("change", applyFilters);

sort.addEventListener("change", applyFilters);

applyFilters();
updateSummary();