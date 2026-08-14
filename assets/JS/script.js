//Mudança de tema
const html = document.querySelector('html');
const checkbox = document.querySelector('input[name=theme]');

const getStyle = (element,style)=>{
    return window.getComputedStyle(element).getPropertyValue(style).trim();
}

//Pegando o estilo do CSS
const initialColors = {
    bg: getStyle(html,'--bg'),
    bgPanel: getStyle(html,'--bg-panel'),
    colorHeadings:getStyle(html, '--color-headings'),
    colorText: getStyle(html, '--color-text')
}

const darkMode = {
    bg: '#333333',
    bgPanel:'#434343',
    colorHeadings: '#3664FF',
    colorText:'#B5B585'
}

//Função para transformar mudar de maiúsculo para o "-$1". (em minúsculo)
const transformKey = key =>
"--" + key.replace(/([A-Z])/, "-$1").toLowerCase()

//Mudar a função padrão
const changeColors = (colors)=>{
    //Com a função, ele irá procurar a chave key
    Object.keys(colors).map(key => html.style.setProperty(transformKey(key), colors[key]))
}

//Salvando localmente às mudanças de tema
const isExistLocalStorage = (key) =>
  localStorage.getItem(key) != null

const createOrEditLocalStorage = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value))

const getValeuLocalStorage = (key) =>
  JSON.parse(localStorage.getItem(key))

checkbox.addEventListener("change", ({target}) => {
  if (target.checked) {
    changeColors(darkMode)
    createOrEditLocalStorage('modo','darkMode')
  } else {
    changeColors(initialColors)
    createOrEditLocalStorage('modo','initialColors')
  }
})

if(!isExistLocalStorage('modo'))
  createOrEditLocalStorage('modo', 'initialColors')


if (getValeuLocalStorage('modo') === "initialColors") {
  checkbox.removeAttribute('checked')
  changeColors(initialColors);
} else {
  checkbox.setAttribute('checked', "")
  changeColors(darkMode);
}

//----------------------
/*Área do Todo List
  
Seleção do DOM
*/

const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector('.filter-todo');

//Eventos executados
//----------------------------------------------------
//Esse evento é usado na adição local.
document.addEventListener('DOMContentLoaded',getTodos);
//----------------------------------------------------
todoButton.addEventListener('click', addTodo);
todoList.addEventListener('click', deleteCheck);
filterOption.addEventListener('change', filterTodo);

// Funções

// Cria o elemento visual de um todo a partir do objeto { id, text, completed }.
// Antes essa marcação era duplicada em addTodo() e getTodos(); agora as duas usam
// esta função. A estrutura também foi corrigida: o item da lista (<li>) fica
// diretamente dentro da <ul>, e um <div> interno agrupa só os botões de ação
// (antes o <li> ficava indevidamente dentro de uma <div class="todo">).
function createTodoElement(todo) {
    const todoLi = document.createElement('li');
    todoLi.classList.add('todo');
    todoLi.dataset.id = todo.id;
    if (todo.completed) {
        todoLi.classList.add('completed');
    }

    const todoText = document.createElement('span');
    todoText.innerText = todo.text;
    todoText.classList.add('todo-item');
    todoLi.appendChild(todoText);

    const todoActions = document.createElement('div');
    todoActions.classList.add('todo-actions');

    const completedButton = document.createElement('button');
    completedButton.innerHTML = '<i class="fas fa-check"></i>';
    completedButton.classList.add('complete-btn');
    completedButton.setAttribute('aria-label', 'Concluir tarefa');
    todoActions.appendChild(completedButton);

    const trashButton = document.createElement('button');
    trashButton.innerHTML = '<i class="fas fa-trash"></i>';
    trashButton.classList.add('trash-btn');
    trashButton.setAttribute('aria-label', 'Excluir tarefa');
    todoActions.appendChild(trashButton);

    todoLi.appendChild(todoActions);

    return todoLi;
}

function addTodo(event) {
    event.preventDefault();

    const todoText = todoInput.value.trim();
    if (todoText === '') return;

    const todoObj = {
        id: Date.now().toString(),
        text: todoText,
        completed: false
    };

    saveLocal(todoObj);

    const todoLi = createTodoElement(todoObj);
    todoList.appendChild(todoLi);

    todoInput.value = '';
}

//Função que vai servir para dizer que
//a tarefa foi feita e depois deletada.
function deleteCheck(e) {
    const item = e.target

    // A busca do <li> pai agora usa closest('.todo') em vez de parentElement,
    // porque os botões passaram a ficar dentro de um <div class="todo-actions">
    // dentro do <li>, e não mais como filhos diretos dele.
    const todo = item.closest('.todo')
    if (!todo) return

    if(item.classList[0] === 'trash-btn') {
        todo.classList.add('fall')
        //removeLocalTodos(todo);
        removeLocalStorage(todo);
        todo.addEventListener('transitionend', () => {
            todo.remove()

        })
    }

    if(item.classList[0] === 'complete-btn'){
        todo.classList.toggle('completed')
        updateLocalCompleted(todo.dataset.id, todo.classList.contains('completed'))
    }
}

function filterTodo(e) {
    const todos = todoList.children;

    Array.from(todos).forEach( (todo) => {

        switch(e.target.value) {
            case 'all':
                todo.style.display = 'flex'
                break;
            case "completed":
                if(todo.classList.contains('completed')) {
                    todo.style.display = 'flex';
                } else {
                    todo.style.display = 'none';
                }
                break;
            case "uncompleted":
                if(!todo.classList.contains('completed')) {
                    todo.style.display = 'flex';
                } else {
                    todo.style.display = 'none';
                }
                break;
        }
    } )
}

//Salvando localmente
function saveLocal(todo){

    let todos;

    if(localStorage.getItem('todos') === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
}

function getTodos(){
    let todos;

    if(localStorage.getItem('todos') === null){
        todos = [];
    } else{
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    todos.forEach(function(todo){
        const todoLi = createTodoElement(todo);
        todoList.appendChild(todoLi);
    })
} 

function removeLocalStorage(todo){
    const id = todo.dataset.id;
    let todos;

    if(localStorage.getItem('todos') === null){
        todos = [];
    } else{
        todos = JSON.parse(localStorage.getItem('todos'));
    }
    todos = todos.filter(t => t.id !== id);
    localStorage.setItem('todos', JSON.stringify(todos))

}

function updateLocalCompleted(id, completed) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    const idx = todos.findIndex(t => t.id === id);
    if (idx !== -1) {
        todos[idx].completed = completed;
        localStorage.setItem('todos', JSON.stringify(todos));
    }
}