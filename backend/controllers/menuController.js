import db from '../config/db.js';

// ==========================================
// 1. TOGGLE OUT OF STOCK (Owner Feature)
// ==========================================
export const toggleOutOfStock = async (req, res) => {
    const { menuId } = req.body;

    if (!menuId) {
        return res.status(400).json({ success: false, message: 'Menu ID is required.' });
    }

    try {
        const [rows] = await db.query(
            'SELECT is_out_of_stock, dish_name FROM daily_menus WHERE menu_id = ?', 
            [menuId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Dish not found in today\'s menu.' });
        }

        const currentStatus = rows[0].is_out_of_stock;
        const newStatus = !currentStatus;
        const dishName = rows[0].dish_name;

        await db.query(
            'UPDATE daily_menus SET is_out_of_stock = ? WHERE menu_id = ?',
            [newStatus, menuId]
        );

        res.json({ 
            success: true, 
            message: `⚠️ "${dishName}" marked as ${newStatus ? 'Sold Out' : 'Available'}!`,
            is_out_of_stock: newStatus
        });

    } catch (error) {
        console.error('Error toggling stock status:', error);
        res.status(500).json({ success: false, message: 'Server error while updating stock status.' });
    }
};

// ==========================================
// 2. GET DAILY MENU (Categorized by Meal)
// ==========================================
export const getDailyMenu = async (req, res) => {
    const { messId } = req.params;
    
    // Get the current day of the week (0 = Sunday, 1 = Monday, etc.)
    const today = new Date().getDay(); 

    try {
        const [menuItems] = await db.query(
            `SELECT menu_id, dish_name, meal_type, is_out_of_stock 
             FROM daily_menus 
             WHERE mess_id = ? AND day_of_week = ?`, 
            [messId, today]
        );

        // Group the items by meal type for easier frontend rendering
        const categorizedMenu = {
            Breakfast: menuItems.filter(item => item.meal_type === 'Breakfast'),
            Lunch: menuItems.filter(item => item.meal_type === 'Lunch'),
            Dinner: menuItems.filter(item => item.meal_type === 'Dinner')
        };

        res.json({ success: true, menu: categorizedMenu });

    } catch (error) {
        console.error("Error fetching menu:", error);
        res.status(500).json({ success: false, message: "Failed to fetch menu" });
    }
};

// ==========================================
// 3. ADD NEW DISH TO MENU (Owner Feature)
// ==========================================
export const addMenuItem = async (req, res) => {
    // NEW: We added dietaryTag to the incoming request
    const { messId, dishName, mealType, dietaryTag } = req.body; 
    
    const today = new Date().getDay(); 
    const serveDate = new Date().toISOString().split('T')[0];

    // Default to 'Veg' if the owner forgets to send a tag
    const finalDietaryTag = dietaryTag || 'Veg';

    if (!dishName || !mealType) {
        return res.status(400).json({ success: false, message: 'Dish name and meal type are required.' });
    }

    try {
        // NEW: Added dietary_tag to the INSERT query
        await db.query(
            'INSERT INTO daily_menus (mess_id, dish_name, meal_type, day_of_week, is_out_of_stock, serve_date, dietary_tag) VALUES (?, ?, ?, ?, 0, ?, ?)',
            [messId, dishName, mealType, today, serveDate, finalDietaryTag]
        );

        res.json({ success: true, message: `Successfully added ${dishName} (${finalDietaryTag}) to ${mealType}!` });
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ success: false, message: 'Server error while adding menu item.' });
    }
};

// ==========================================
// 4. TOGGLE "OUT OF STOCK" STATUS (Owner Feature)
// ==========================================
export const toggleStockStatus = async (req, res) => {
    const { menuId } = req.params;
    const { is_out_of_stock } = req.body; // Expecting a boolean (true/false)

    try {
        // Convert the boolean back into a tinyint (1 or 0) for MySQL
        const stockValue = is_out_of_stock ? 1 : 0;

        await db.query(
            'UPDATE daily_menus SET is_out_of_stock = ? WHERE menu_id = ?',
            [stockValue, menuId]
        );

        res.json({ 
            success: true, 
            message: `Dish marked as ${is_out_of_stock ? 'Out of Stock' : 'In Stock'}` 
        });
    } catch (error) {
        console.error('Error toggling stock status:', error);
        res.status(500).json({ success: false, message: 'Server error while updating stock status.' });
    }
};