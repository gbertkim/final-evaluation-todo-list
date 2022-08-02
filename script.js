
// GLOBAL VARIABLES
const form = document.querySelector('.form');
const incompleteList = document.querySelector('.incomplete')
const completedList = document.querySelector('.completed')

//State
class State {
    constructor(){
        this._todos = []
    }
    get todos() {
        return this._todos;
    }
    set todos(newTodos) {
        this._todos = newTodos
        renderList(this._todos)
        console.log(this._todos)
    }
}
let state = new State()

// FORM EVENT LISTENER
const addFormListener = () => {
    form.addEventListener('submit', (e) => {
        e.preventDefault()    
        let searchVal = document.querySelector('.form--input').value;
        postTask(searchVal);
        form.reset();
    })
}

// GET POST PATCH DELETE
// GET
const getList = async () => {
    try {
        const todos = await fetch('http://localhost:3000/todos')
        const todosJson = await todos.json();
        state.todos = todosJson
    } catch (e) {
        console.log(e)
    }
}
// POST
const postTask = async (searchVal) => {
    try {
        const response = await fetch('http://localhost:3000/todos', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },      
            method: 'POST',
            body: JSON.stringify({
                title: searchVal,
                completed: false
            })
        })
        getList()
    } catch (e) {
        console.log(e)
    }
}
// DELETE
const deleteTask = async (id) => {
    try {
        let response = fetch(`http://localhost:3000/todos/${id}`, {     
            method: 'DELETE',
        })
        state.todos = state.todos.filter((task) => {
            return task.id !== id;
        })
    } catch (e) {
        console.log(e)
    }
}
// PATCH
const patchTask = async (id, newTitle) => {
    try {
        let response = fetch(`http://localhost:3000/todos/${id}`, {     
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },      
            method: 'PATCH',
            body: JSON.stringify({
                title: newTitle
            })
        })
        state.todos.find(task => {
            return task.id === id
        }).title = newTitle
        state.todos = state.todos
    } catch (e) {
        console.log(e)
    }
}
// PATCH Completed
const editCompleted = async (id,completedTask)=> {
    try {
        let response = fetch(`http://localhost:3000/todos/${id}`, {     
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },      
            method: 'PATCH',
            body: JSON.stringify({
                completed: completedTask
            })
        })
        state.todos.find(task => {
            return task.id === id
        }).completed = completedTask
        state.todos = state.todos
    } catch (e) {
        console.log(e)
    }
}
// EDIT FUNCTION 
const createEditInput = (title) => {
    let editInput = document.createElement('input')
    editInput.setAttribute('type','text')
    editInput.setAttribute('for','editTask')
    editInput.setAttribute('id','editTask')
    editInput.setAttribute('value', title)
    return editInput
}
const editFirstClickFunc = (id, h2Element, titleListenerCb, editElement, editListenerCb, title) => {
    let editInput = createEditInput(title)
    h2Element.append(editInput)
    h2Element.removeEventListener('click', titleListenerCb)
    editElement.removeEventListener('click', editListenerCb)
    editElement.addEventListener('click', () => {
        let inputValue = editInput.value
        h2Element.removeChild(editInput)
        h2Element.addEventListener('click', titleListenerCb)
        editElement.addEventListener('click', editListenerCb)
        patchTask(id, inputValue)
    })
}

// RENDER PAGE
const clearLists = () => {
    incompleteList.innerHTML = ``
    completedList.innerHTML = ``
}
const createListEl = () => {
    let li = document.createElement('li')
    li.classList.add('lists--li')
    return li
}
const createTitleElwithEvent = (task, taskCompleted, titleListenerFunc) => {
    let h2 = document.createElement('h2')
    h2.classList.add('lists--li--h2')
    h2.setAttribute('data-id',`${task.id}`)
    taskCompleted === true ? h2.classList.add('strikeThrough') : h2.classList.remove('strikeThrough')
    h2.textContent = task.title
    h2.addEventListener('click', titleListenerFunc)
    return h2
}
const createButtonWrapper = () => {
    let container = document.createElement('div')
    container.classList.add('lists--li--wrapper')
    return container
}
const createEditWithEvent = (id, h2, titleListenerFunc, title) => {
    let button = document.createElement('button')
    button.classList.add('editButton')
    button.textContent = 'Edit'
    function editListenerFunc(e){
        e.preventDefault()
        editFirstClickFunc(id, h2, titleListenerFunc, button, editListenerFunc, title)
    }
    button.addEventListener('click', editListenerFunc)
    return button
}
const createDeleteWithEvent = (id) => {
    let deleteButton = document.createElement('button')
    deleteButton.classList.add('deleteButton')
    deleteButton.textContent = 'Delete'
    deleteButton.addEventListener('click', (e) => {
        e.preventDefault()
        deleteTask(id)
    })
    return deleteButton
}
const appendElements = (editButton, deleteButton, title, buttonWrapper, li, taskCompleted) => {
    buttonWrapper.append(editButton)
    buttonWrapper.append(deleteButton)
    li.append(title)
    li.append(buttonWrapper)
    taskCompleted === false ? incompleteList.append(li) : completedList.append(li)
}

// MAIN RENDER FUNCTION
const renderList = (todoList) => {
    clearLists()
    todoList.forEach((task)=>{
        let taskCompleted = task.completed
        let li = createListEl(task)
        function titleListenerFunc (e){
            e.preventDefault()
            taskCompleted = !taskCompleted
            editCompleted(task.id, taskCompleted)
        }
        let title = createTitleElwithEvent(task, taskCompleted, titleListenerFunc)
        let buttonWrapper = createButtonWrapper()
        let editButton = createEditWithEvent(task.id, title, titleListenerFunc, task.title)
        let deleteButton = createDeleteWithEvent(task.id)
        appendElements(editButton, deleteButton, title, buttonWrapper, li, taskCompleted)
    })
    if (incompleteList.childNodes.length === 0) {
        incompleteList.innerHTML = `<span class='noActiveList'>no active task</span>`
    }
}

// INITIALIZE
const init = () => {
    addFormListener();
    getList()
}
init();