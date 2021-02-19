const Modal = {
    open() {
        // Abrir Modal
        // Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
    },
    close() {
        // Fechar o modal
        // Remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
        
        Form.clearFields()
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    edit(index) {
        Form.setValues(index, Transaction.all[index])
        Modal.open()
    },

    update(index, transaction) {
        Transaction.all.forEach( (value, key) => {
            if (key == index) {
                value.description = transaction.description
                value.amount = transaction.amount
                value.date = transaction.date
            }
        })
    },

    incomes() {
        //somar entradas
        let income = 0

        Transaction.all.forEach( transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })

        return income
    },

    expenses() {
        //somar as saídas
        let expense = 0

        Transaction.all.forEach( transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })

        return expense
    },

    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innetHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innetHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${Utils.formatCurrency(transaction.amount)}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" title="Remover">
                <img onclick="Transaction.edit(${index})" src="./assets/edit.svg" alt="Editar transação" title="Editar">
            </td>
        `

        return html
    },
    
    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())

    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        return Number(value) * 100        
    },
    formatDate(value) {
        const splittedDate = value.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")
        
        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    index: null,
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    setValues(index, transaction) {
        Form.index = index
        Form.description.value = transaction.description
        Form.amount.value = transaction.amount / 100
        
        const splittedDate = transaction.date.split("/")
        Form.date.value = `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`
    },

    formatValues() {
        let {description, amount, date} = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.index = null
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    validateFields() {
        const {description, amount, date} = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!")
        }
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()

            if (Form.index === null) {
                Transaction.add(transaction)
            } else {
                Transaction.update(Form.index, transaction)
            }

            Form.clearFields();
            Modal.close();
            App.reload();
            
        } catch (error) {
            alert(error.message)
        }

    }    
}

const App = {
    init() {

        Transaction.all.forEach( (value, index) => {
            if (value.description.toLowerCase().indexOf(pesquisar.value.toLowerCase()) >= 0) {
                DOM.addTransaction(value, index)
            }
        })
        
        //Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
        
    },
    reload() {
        DOM.clearTransactions()

        App.init()
    },

    filter() {
        DOM.clearTransactions();

        const pesquisar = document.querySelector('input#pesquisar')

        Transaction.all.forEach( (value, index) => {
            if (value.description.toLowerCase().indexOf(pesquisar.value.toLowerCase()) >= 0) {
                DOM.addTransaction(value, index)
            }
        })
        
        DOM.updateBalance()
    }
}

App.init()

// Transaction.add({
//     description: 'Salário 2',
//     amount: 500000,
//     date: '23/01/2021'
// })

// Transaction.remove(0)