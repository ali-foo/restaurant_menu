// Initialize Firebase
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

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let menuData = [];
let editIndex = null;

const form = document.getElementById('foodForm');
const preview = document.getElementById('preview');
const foodList = document.getElementById('foodList');

// -------------------- Fetch Menu --------------------
function fetchMenuFromFirebase(callback) {
  database.ref('menu').on('value', snapshot => {
    const data = snapshot.val();
    if (data) {
      // Convert object to array if it's an object
      menuData = Array.isArray(data) ? data : Object.values(data);
    } else {
      menuData = [];
    }
    callback(menuData);
  });
}

// -------------------- Save Menu --------------------
function saveMenuToFirebase(menuData) {
  database.ref('menu').set(menuData);
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
        <img src="${food.image}" alt="${food.name}" width="50">
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

// -------------------- Form Submit --------------------
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

// -------------------- Edit / Delete --------------------
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

// -------------------- Image Preview --------------------
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

// -------------------- Initialize --------------------
fetchMenuFromFirebase(renderEmployeeList);
