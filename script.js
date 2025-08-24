// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, onValue } from "firebase/database";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDZjjEXgvna-_MH-2_u90jgx8LX9btYzSI",
  authDomain: "restaurant-menu-f4198.firebaseapp.com",
  databaseURL: "https://restaurant-menu-f4198-default-rtdb.firebaseio.com",
  projectId: "restaurant-menu-f4198",
  storageBucket: "restaurant-menu-f4198.appspot.com",
  messagingSenderId: "264892502366",
  appId: "1:264892502366:web:f696716e603f827bbbbfcf",
  measurementId: "G-NXL76W4G32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
// -------------------- Utility --------------------
function saveMenuToFirebase(menuData) {
  db.ref('menu').set(menuData);
}

function fetchMenuFromFirebase(callback) {
  db.ref('menu').on('value', snapshot => {
    const data = snapshot.val();
    callback(data ? data : []);
  });
}

// -------------------- Render Menu Page --------------------
const menuSection = document.getElementById('menu');
const tabsContainer = document.getElementById('categoryTabs');

function renderMenu(menuData, filterCategory = null) {
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
      renderMenu(menuData);
    };
    tabsContainer.appendChild(allBtn);

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.textContent = cat;
      btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMenu(menuData, cat);
      };
      tabsContainer.appendChild(btn);
    });
  }

  const itemsToShow = filterCategory ? menuData.filter(i => i.category === filterCategory) : menuData;

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
    setTimeout(() => itemDiv.classList.add('show'), 50);
  });
}

// -------------------- Employee Panel --------------------
const form = document.getElementById('foodForm');
const preview = document.getElementById('preview');
const foodList = document.getElementById('foodList');

let editIndex = null;
let menuData = [];

// Live image preview
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

// Render employee food list
function renderEmployeeList() {
  if (!foodList) return;
  foodList.innerHTML = '';
  menuData.forEach((food, index) => {
    const div = document.createElement('div');
    div.className = 'foodItem';
    div.innerHTML = `
      <div style="display:flex; align-items:center;">
        <img src="${food.image}" alt="${food.name}">
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

// Add / Update food
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
        menuData[editIndex] = newFood;
        editIndex = null;
      } else {
        menuData.push(newFood);
      }
      saveMenuToFirebase(menuData);
      form.reset();
      preview.style.display = 'none';
    };
    if (imageFile) reader.readAsDataURL(imageFile);
    else {
      // If editing without new image
      if (editIndex !== null) {
        menuData[editIndex].name = name;
        menuData[editIndex].category = category;
        menuData[editIndex].price = price;
        menuData[editIndex].description = description;
        saveMenuToFirebase(menuData);
        editIndex = null;
        form.reset();
      }
    }
  });
}

// Edit / Delete functions
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
    menuData.splice(index, 1);
    saveMenuToFirebase(menuData);
  }
};

// -------------------- Fetch menu from Firebase --------------------
fetchMenuFromFirebase(data => {
  menuData = data;
  renderMenu(menuData);
  renderEmployeeList();
});
