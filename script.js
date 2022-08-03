
// GLOBAL VARIABLES
const form = document.querySelector('.form');
const incompleteList = document.querySelector('.incomplete')
const completedList = document.querySelector('.completed')
const BASE_URL = 'http://localhost:3000'
const PATH = 'todos'
// 

// 


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


const setEventForIncompleteButton = () => {
    const incompleteButton = document.querySelector('.incompleteFilterButton')
    let toggle = 0
    incompleteButton.addEventListener('click', () => {
        if (!toggle) {
            completedList.classList.add('hidden')
            toggle = !toggle
        }  else {
            completedList.classList.remove('hidden')
            toggle = !toggle
        }
    })
}


function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }

const setEventForFindInput = () => {
    const findTaskByLetters = document.querySelector('#find')
        findTaskByLetters.addEventListener('input', debounce((e) => {
            state.todos.forEach(task => {
                task.title.toLowerCase().includes(e.target.value.toLowerCase()) ? task.visible = 'show' : task.visible = 'hide' 
            })
            state.todos = state.todos
        }))
}


// Debouncing / 


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
        const todos = await fetch([BASE_URL, PATH].join('/'))
        const todosJson = await todos.json();
        state.todos = todosJson
    } catch (e) {
        console.log(e)
    }
}
// POST
const postTask = async (searchVal) => {
    try {
        const response = await fetch([BASE_URL, PATH].join('/'), {
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
        let response = fetch([BASE_URL, PATH, id].join('/'), {     
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
        let response = fetch([BASE_URL, PATH, id].join('/'), {     
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
        let response = fetch([BASE_URL, PATH, id].join('/'), {     
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

// EDIT FUNCTIONS
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

// RENDER ELEMENTS
const clearLists = () => {
    incompleteList.innerHTML = ``
    completedList.innerHTML = ``
}
const createListEl = () => {
    let li = document.createElement('li')
    li.classList.add('lists--li')
    return li
}
const createTitleElwithEvent = (task, taskCompleted) => {
    let h2 = document.createElement('h2')
    h2.classList.add('lists--li--h2')
    h2.setAttribute('data-id',`${task.id}`)
    taskCompleted === true ? h2.classList.add('strikeThrough') : h2.classList.remove('strikeThrough')
    h2.textContent = task.title
    return h2
}
const createButtonWrapper = () => {
    let container = document.createElement('div')
    container.classList.add('lists--li--wrapper')
    return container
}
const createEditButton = () => {
    let button = document.createElement('button')
    button.classList.add('editButton')
    button.innerHTML = `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="EditIcon" aria-label="fontSize small"><path fill="#ffffff" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>`
    return button
}
const createDeleteWithEvent = (id) => {
    let deleteButton = document.createElement('button')
    deleteButton.classList.add('deleteButton')
    deleteButton.innerHTML = `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DeleteIcon" aria-label="fontSize small"><path fill="#ffffff" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>`
    deleteButton.addEventListener('click', (e) => {
        deleteTask(id)
    })
    return deleteButton
}

// EVENT HANDLERS
const setEditEvent = (id, h2, titleListenerFunc, title, button) => {
    function editListenerFunc(e){
        editFirstClickFunc(id, h2, titleListenerFunc, button, editListenerFunc, title)
    }
    button.addEventListener('click', editListenerFunc)
}
const setTitleEvent = (title, taskCompleted, task) => {
    function titleListenerFunc (e){
        taskCompleted = !taskCompleted
        editCompleted(task.id, taskCompleted)
    }
    title.addEventListener('click', titleListenerFunc)
    return titleListenerFunc
}

// APPEND ELEMENTS 
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
        if(task.visible === 'show'){
            li.classList.remove('hidden')
        } else if (task.visible === 'hide'){
            li.classList.add('hidden')
        }
        let title = createTitleElwithEvent(task, taskCompleted)
        let titleListenerFunc = setTitleEvent(title, taskCompleted, task)
        let buttonWrapper = createButtonWrapper()
        let editButton = createEditButton()
        setEditEvent(task.id, title, titleListenerFunc, task.title, editButton);
        let deleteButton = createDeleteWithEvent(task.id)
        appendElements(editButton, deleteButton, title, buttonWrapper, li, taskCompleted)
    })
    if (incompleteList.childNodes.length === 0) {
        incompleteList.innerHTML = `<span class='noActiveList'>no active task</span>`
    }
}

// INITIALIZE
const init = () => {
    addFormListener()
    setEventForIncompleteButton()
    setEventForFindInput()
    getList()
}
init();