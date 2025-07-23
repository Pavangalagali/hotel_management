import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
    addCategory,
    addMenuItem,
    deleteMenuItem,
    getAllMenuItems,
    getAllCategories,
    getByAvailability,
    updateMenuItem
} from '../services/menuService';
import { AuthContext } from '../context/AuthContext';
import '../styles/menu.css';
import dishImage from './food-beautiful-close-up-image-ai-generated-free-photo.jpg'
import Alert from './Alert';

const Menu = () => {
    const { user } = useContext(AuthContext);
    const hasRole = role => user?.role === role;

    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filterAvailability, setFilterAvailability] = useState('ALL');
    const [viewMode, setViewMode] = useState('card');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    const [showAddCat, setShowAddCat] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    const [showAddItem, setShowAddItem] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', price: '', categoryId: '', available: true });

    const [toast, setToast] = useState({ message: '', type: '' });

    const closeAllModals = useCallback(() => {
        setShowAddCat(false);
        setShowAddItem(false);
        setEditingItem(null);
    }, []);

    useEffect(() => {
        async function load() {
            const cats = await getAllCategories();
            setCategories(cats.data);

            const items = (filterAvailability === 'ALL'
                ? await getAllMenuItems()
                : await getByAvailability(filterAvailability === 'AVAILABLE')
            ).data;

            setMenuItems(items);
        }
        load();
    }, [filterAvailability]);

    useEffect(() => {
        const handler = e => e.key === 'Escape' && closeAllModals();
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [closeAllModals]);

    useEffect(() => {
        if (toast.message) {
            const timeout = setTimeout(() => {
                setToast({ message: '', type: '' });
            }, 3000); // Auto-dismiss after 3 seconds

            return () => clearTimeout(timeout);
        }
    }, [toast]);


    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        await addCategory(newCategory.trim());
        closeAllModals();
        setNewCategory('');
        // Reload categories
        const cats = await getAllCategories();
        setCategories(cats.data);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        const cat = categories.find(c => c.categoryName === item.category);
        setFormData({
            name: item.name,
            price: item.price,
            categoryId: cat?.categoryId || '',
            available: item.available
        });
        setShowAddItem(true);
    };

    const handleAddOrUpdateItem = async () => {
        const payload = {
            name: formData.name,
            price: parseFloat(formData.price),
            categoryId: parseInt(formData.categoryId),
            available: formData.available
        };

        if (editingItem) {
            await updateMenuItem(editingItem.id, payload);
        } else {
            await addMenuItem(payload);
        }

        closeAllModals();
        setFormData({ name: '', price: '', categoryId: '', available: true });

        const items = (await getAllMenuItems()).data;
        setMenuItems(items);
    };

    const handleDelete = async id => {
        try {
            await deleteMenuItem(id);
            const items = (await getAllMenuItems()).data;
            setMenuItems(items);
            setToast({ message: 'Dish deleted successfully!', type: 'success' });
        } catch (error) {
            console.log(error);
            setToast({ message: 'Failed to delete Dish! Try again later.', type: 'error' });
        }

    };

    const toggleAvailability = async (item) => {
        const cat = categories.find(c => c.categoryName === item.category);
        const payload = {
            name: item.name,
            price: parseFloat(item.price),
            categoryId: cat?.categoryId,
            available: !item.available
        };
        await updateMenuItem(item.id, payload);
        const items = (await getAllMenuItems()).data;
        setMenuItems(items);
    };

    const filteredItems = menuItems.filter(item => {
        const catMatch = selectedCategoryId ? item.category === categories.find(c => c.categoryId === selectedCategoryId)?.categoryName : true;
        return catMatch;
    });

    return (
        <div className="menu-container">
            <aside className="sidebar">
                <h2 className="sidebar-title">Dishes Category</h2>
                <div
                    className={`category-item ${selectedCategoryId === null ? 'active' : ''}`}
                    onClick={() => setSelectedCategoryId(null)}
                >
                    🍽️ All Dishes ({menuItems.length})
                </div>
                {categories.map(cat => (
                    <div
                        key={cat.categoryId}
                        className={`category-item ${selectedCategoryId === cat.categoryId ? 'active' : ''}`}
                        onClick={() => setSelectedCategoryId(cat.categoryId)}
                    >
                        🏷️ {cat.categoryName} (
                        {menuItems.filter(i => i.category === cat.categoryName).length})
                    </div>
                ))}
                {(hasRole('ADMIN') || hasRole('MANAGER')) && (
                    <button className="add-category-btn" onClick={() => setShowAddCat(true)}>
                        ➕ Add New Category
                    </button>
                )}
            </aside>

            <main className="main-panel">
                <div className="top-row">
                    <div className="filters-row">
                        <select
                            value={filterAvailability}
                            onChange={(e) => setFilterAvailability(e.target.value)}
                        >
                            <option value="ALL">All</option>
                            <option value="AVAILABLE">✅ Available</option>
                            <option value="UNAVAILABLE">❌ Unavailable</option>
                        </select>
                        {(hasRole('ADMIN') || hasRole('MANAGER')) && (
                            <button className="add-dish-btn" onClick={() => setShowAddItem(true)}>
                                ➕ Add Dish
                            </button>
                        )}
                    </div>
                    <div className="view-toggle">
                        <button
                            className={viewMode === 'card' ? 'active' : ''}
                            onClick={() => setViewMode('card')}
                        >
                            📦
                        </button>
                        <button
                            className={viewMode === 'list' ? 'active' : ''}
                            onClick={() => setViewMode('list')}
                        >
                            📋
                        </button>
                    </div>
                </div>

                <div className={viewMode === 'card' ? 'dish-grid' : 'dish-list'}>
                    {filteredItems.map(item => (
                        <div key={item.id} className={`dish-card ${viewMode}`}>
                            {viewMode === 'card' && (
                                <img
                                    src={dishImage}
                                    alt={item.name}
                                    className="dish-img"
                                />
                            )}
                            <div className="dish-info">
                                <div className="dish-name">{item.name}</div>
                                <div className="dish-meta">
                                    <span>{item.category}</span>
                                    <span>₹{item.price}</span>
                                </div>
                                <label className="availability-label">
                                    <input
                                        type="checkbox"
                                        checked={item.available}
                                        onChange={() => toggleAvailability(item)}
                                    />
                                    {item.available ? '✅ Available' : '❌ Unavailable'}
                                </label>
                            </div>
                            {(hasRole('ADMIN') || hasRole('MANAGER')) && (
                                <div className="card-actions">
                                    <button onClick={() => openEdit(item)}>    ✏️</button>
                                    <button onClick={() => handleDelete(item.id)}>🗑️</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <Alert
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ message: '', type: '' })}
                />

                {(showAddCat || showAddItem) && (
                    <div className="modal-overlay" onClick={closeAllModals}>
                        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close-btn" onClick={closeAllModals}>✖️</button>
                            {showAddCat ? (
                                <>
                                    <h3>Add New Category</h3>
                                    <input
                                        placeholder="Category name"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                    <button onClick={handleAddCategory}>Add Category</button>
                                </>
                            ) : (
                                <>
                                    <h3>{editingItem ? 'Edit Dish' : 'Add New Dish'}</h3>
                                    <input
                                        placeholder="Name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                    />
                                    <input
                                        placeholder="Price"
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) =>
                                            setFormData({ ...formData, price: e.target.value })
                                        }
                                    />
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) =>
                                            setFormData({ ...formData, categoryId: e.target.value })
                                        }
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c) => (
                                            <option key={c.categoryId} value={c.categoryId}>
                                                {c.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.available}
                                            onChange={(e) =>
                                                setFormData({ ...formData, available: e.target.checked })
                                            }
                                        />
                                        Available
                                    </label>
                                    <button onClick={handleAddOrUpdateItem}>
                                        {editingItem ? 'Update Dish' : 'Add Dish'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Menu;
