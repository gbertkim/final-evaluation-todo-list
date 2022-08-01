const form = document.querySelector('.form');


const postTask = (searchVal) => {
    fetch('http://localhost:3000/todos', {
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
    form.reset();
}

const deleteTask = (id) => {
    fetch(`http://localhost:3000/todos/${id}`, {     
        method: 'DELETE',
    })
}

const editTaskTitle = (id, h2Element, titleListenerCb, editElement, editListenerCb)=> {
    let editInput = document.createElement('input')
    editInput.setAttribute('type','text')
    editInput.setAttribute('for','editTask')
    editInput.setAttribute('id','editTask')
    editInput.required = true;
    h2Element.append(editInput)
    // console.log(taskTitle)
    h2Element.removeEventListener('click', titleListenerCb)
    editElement.removeEventListener('click', editListenerCb)
    

    
}

const editCompleted = (id,completedTask)=> {
    fetch(`http://localhost:3000/todos/${id}`, {     
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },      
        method: 'PATCH',
        body: JSON.stringify({
            completed: completedTask
        })
    })
}
form.addEventListener('submit', (e) => {
    e.preventDefault()
    let searchVal = document.querySelector('.form--input').value;
    postTask(searchVal);
})

const incompleteList = document.querySelector('.incomplete')
const completedList = document.querySelector('.completed')

const renderList = (todoList) => {
    todoList.forEach((task)=>{
        let taskCompleted = task.completed
        let li = document.createElement('li')
        li.classList.add('lists--li')
        // li.setAttribute('data-id', `${task.id}`)

        let h2 = document.createElement('h2')
        h2.classList.add('lists--li--h2')
        h2.setAttribute('data-id',`${task.id}`)
        taskCompleted === true ? h2.classList.add('strikeThrough') : h2.classList.remove('strikeThrough')
        h2.textContent = task.title
        function h2ListenerFunc (e){
            e.preventDefault()
            taskCompleted = !taskCompleted
            editCompleted(task.id, taskCompleted)
        }
        h2.addEventListener('click', h2ListenerFunc)

        let buttonWrapper = document.createElement('div')
        buttonWrapper.classList.add('lists--li--wrapper')
        
        let editButton = document.createElement('button')
        editButton.classList.add('editButton')
        editButton.textContent = 'Edit'

        function editListenerFunc(e){
            e.preventDefault()
            editTaskTitle(task.id, h2, h2ListenerFunc, editButton, editListenerFunc)
        }
        editButton.addEventListener('click', editListenerFunc)

        let deleteButton = document.createElement('button')
        deleteButton.classList.add('deleteButton')
        deleteButton.textContent = 'Delete'
        deleteButton.addEventListener('click', (e) => {
            e.preventDefault()
            deleteTask(task.id)
        })
        buttonWrapper.append(editButton)
        buttonWrapper.append(deleteButton)
        li.append(h2)
        li.append(buttonWrapper)
        taskCompleted === false ? incompleteList.append(li) : completedList.append(li)
    })
}

const getList = async () => {
    try {
        const todos = await fetch('http://localhost:3000/todos')
        const todosJson = await todos.json();
        return todosJson
    } catch (e) {

    }
}
const init = () => {
    const todoList = getList()
    todoList.then((data)=> {
        renderList(data)
    })
}
init();