import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import "./FoodOrder.css";

export default function FoodOrder({ onFoodSelect }) {
  const [foodItems, setFoodItems] = useState([]);
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await API.get("/movies/food/");
        setFoodItems(res.data.results || res.data);
      } catch (err) {
        console.error("Failed to load food items", err);
      }
    };
    fetchFood();
  }, []);

  const updateCart = (item, delta) => {
    setCart(prev => {
      const current = prev[item.id]?.qty || 0;
      const newQty = Math.max(0, current + delta);
      const newCart = { ...prev };
      if (newQty === 0) {
        delete newCart[item.id];
      } else {
        newCart[item.id] = { ...item, qty: newQty };
      }
      // Notify parent
      const foodOrders = Object.values(newCart).map(f => ({
        id: f.id, name: f.name, qty: f.qty, price: f.price
      }));
      onFoodSelect(foodOrders);
      return newCart;
    });
  };

  const categories = ["all", "snacks", "drinks", "combos"];

  const filteredItems = activeCategory === "all"
    ? foodItems
    : foodItems.filter(f => f.category === activeCategory);

  const totalFoodPrice = Object.values(cart).reduce(
    (sum, item) => sum + (item.price * item.qty), 0
  );

  if (foodItems.length === 0) return null;

  return (
    <div className="food-order">
      <h4>🍿 Add Food & Drinks</h4>

      {/* CATEGORY TABS */}
      <div className="food-categories">
        {categories.map(cat => (
          <button
            key={cat}
            className={`food-cat-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === "all" ? "🍽️ All" : cat === "snacks" ? "🍟 Snacks" : cat === "drinks" ? "🥤 Drinks" : "🎁 Combos"}
          </button>
        ))}
      </div>

      {/* FOOD ITEMS */}
      <div className="food-items-grid">
        {filteredItems.map(item => {
          const qty = cart[item.id]?.qty || 0;
          const imageUrl = item.image
            ? (item.image.startsWith("http") ? item.image : `http://127.0.0.1:8000${item.image}`)
            : null;

          return (
            <div key={item.id} className="food-item">
              {imageUrl ? (
                <img src={imageUrl} alt={item.name} className="food-item-img" />
              ) : (
                <div className="food-item-emoji">
                  {item.category === "drinks" ? "🥤" : item.category === "combos" ? "🎁" : "🍿"}
                </div>
              )}
              <div className="food-item-info">
                <p className="food-item-name">{item.name}</p>
                <p className="food-item-desc">{item.description}</p>
                <p className="food-item-price">₹{item.price}</p>
              </div>
              <div className="food-item-controls">
                {qty === 0 ? (
                  <button className="food-add-btn" onClick={() => updateCart(item, 1)}>
                    + Add
                  </button>
                ) : (
                  <div className="food-qty-controls">
                    <button onClick={() => updateCart(item, -1)}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => updateCart(item, 1)}>+</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CART SUMMARY */}
      {totalFoodPrice > 0 && (
        <div className="food-cart-summary">
          <span>🛒 {Object.values(cart).reduce((s, i) => s + i.qty, 0)} items</span>
          <span className="food-cart-total">₹{parseFloat(totalFoodPrice).toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}