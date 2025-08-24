// -------------------- Data --------------------
let menuData = JSON.parse(localStorage.getItem('menuData')) || [];

// -------------------- Utility --------------------
function saveData() {
  localStorage.setItem('menuData', JSON.stringify(menuData));
}

// -------------------- Render Menu Page --------------------
const menuSection = document.getElementById('menu');
const tabsContainer = document.getElementById('categoryTabs');

function renderMenu(filterCategory = null) {
  if (!menuSection) return;

  menuSection.innerHTML = '';
  const categories = [...new Set(menuData.map(item => item.category))];

  // Render category tabs
  if (tabsContainer) {
    tabsContainer.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.className = 'tab-btn active';
    allBtn.textContent = 'All';
    allBtn.onclick = () => {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      allBtn.classList.add('active');
      renderMenu();
    };
    tabsContainer.appendChild(allBtn);

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.textContent = cat;
      btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMenu(cat);
      };
      tabsContainer.appendChild(btn);
    });
  }

  const itemsToShow = filterCategory ? menuData.filter(i => i.category === filterCategory) : menuData;

  // Render menu items with animation
  itemsToShow.forEach(food => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.innerHTML = `
      <img src="${food.image}" alt="${food.name}">
      <h3>${food.name}</h3>
      <p>${food.description}</p>
      <span class="price">$${food.price}</span>
    `;
    menuSection.appendChild(itemDiv);
    setTimeout(() => itemDiv.classList.add('show'), 50); // fade-in + slide-up animation
  });
}

// Initial menu render
renderMenu();

// -------------------- Employee Panel --------------------
const form = document.getElementById('foodForm');
const preview = document.getElementById('preview');
const foodList = document.getElementById('foodList');

let editIndex = null;

// Live image preview for add form
if (document.getElementById('image')) {
  document.getElementById('image').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        preview.src = reader.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else preview.style.display = 'none';
  });
}

// -------------------- Render Employee List --------------------
function renderEmployeeList() {
  if (!foodList) return;
  foodList.innerHTML = '';
  menuData.forEach((food, index) => {
    const div = document.createElement('div');
    div.className = 'foodItem';
    div.innerHTML = `
      <div style="display:flex; align-items:center;">
        <img src="${food.image}" alt="${food.name}" style="width:50px; height:50px; object-fit:cover; margin-right:10px;">
        <span>${food.name} (${food.category}) - $${food.price}</span>
      </div>
      <div>
        <button onclick="editItem(${index})">Edit</button>
        <button onclick="deleteItem(${index})">Delete</button>
      </div>
    `;
    foodList.appendChild(div);
  });
}

// -------------------- Add / Update Food --------------------
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;
    const imageFile = document.getElementById('image').files[0];

    const reader = new FileReader();
    reader.onload = () => {
      const imageSrc = reader.result;
      const newFood = { name, category, price, description, image: imageSrc };
      if (editIndex !== null) {
        menuData[editIndex] = newFood; // update
        editIndex = null;
      } else {
        menuData.push(newFood); // add new
      }
      saveData();
      renderEmployeeList();
      renderMenu();
      form.reset();
      preview.style.display = 'none';
    };

    if (imageFile) reader.readAsDataURL(imageFile);
    else {
      if (editIndex !== null) { // edit without changing image
        menuData[editIndex].name = name;
        menuData[editIndex].category = category;
        menuData[editIndex].price = price;
        menuData[editIndex].description = description;
        saveData();
        renderEmployeeList();
        renderMenu();
        form.reset();
        editIndex = null;
      } else {
        alert('Please select an image!');
      }
    }
  });
}

// -------------------- Edit / Delete Functions --------------------
window.editItem = function(index) {
  const food = menuData[index];
  document.getElementById('name').value = food.name;
  document.getElementById('category').value = food.category;
  document.getElementById('price').value = food.price;
  document.getElementById('description').value = food.description;
  preview.src = food.image;
  preview.style.display = 'block';
  editIndex = index;
};

window.deleteItem = function(index) {
  if (confirm('Delete this item?')) {
    menuData.splice(index,1);
    saveData();
    renderEmployeeList();
    renderMenu();
  }
};

// Initial render of employee panel
renderEmployeeList();
