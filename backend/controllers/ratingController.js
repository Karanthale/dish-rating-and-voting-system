import db from '../config/db.js';

export const createOrUpdateRating = async (req, res) => {
    const { mess_id, rating_value, feedback } = req.body;
    const user_id = req.user.userId;

    try {
        // Check if rating exists
        const [existing] = await db.query(
            'SELECT rating_id FROM ratings WHERE user_id = ? AND mess_id = ?',
            [user_id, mess_id]
        );

        if (existing.length > 0) {
            // Update existing rating
            await db.query(
                'UPDATE ratings SET rating_value = ?, feedback = ?, date = CURRENT_TIMESTAMP WHERE rating_id = ?',
                [rating_value, feedback, existing[0].rating_id]
            );

            return res.json({
                success: true,
                message: 'Rating updated successfully'
            });
        }

        // Create new rating
        const [result] = await db.query(
            'INSERT INTO ratings (user_id, mess_id, rating_value, feedback) VALUES (?, ?, ?, ?)',
            [user_id, mess_id, rating_value, feedback]
        );

        res.status(201).json({
            success: true,
            message: 'Rating submitted successfully',
            data: {
                rating_id: result.insertId
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to submit rating',
            error: error.message
        });
    }
};

export const getRatingsByMess = async (req, res) => {
    const { messId } = req.params;
    const { sort = 'date', order = 'DESC' } = req.query;

    const allowedSorts = ['date', 'rating_value'];
    const sortColumn = allowedSorts.includes(sort) ? sort : 'date';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    try {
        const [ratings] = await db.query(`
            SELECT 
                r.rating_id,
                r.rating_value,
                r.feedback,
                r.date,
                u.name as user_name,
                u.user_id
            FROM ratings r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.mess_id = ?
            ORDER BY ${sortColumn} ${sortOrder}
        `, [messId]);

        res.json({
            success: true,
            data: ratings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch ratings',
            error: error.message
        });
    }
};

export const getUserRatings = async (req, res) => {
    const user_id = req.user.userId;

    try {
        const [ratings] = await db.query(`
            SELECT 
                r.rating_id,
                r.rating_value,
                r.feedback,
                r.date,
                m.name as mess_name,
                m.mess_id,
                m.location
            FROM ratings r
            JOIN messes m ON r.mess_id = m.mess_id
            WHERE r.user_id = ?
            ORDER BY r.date DESC
        `, [user_id]);

        res.json({
            success: true,
            data: ratings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user ratings',
            error: error.message
        });
    }
};

export const deleteRating = async (req, res) => {
    const { ratingId } = req.params;
    const user_id = req.user.userId;

    try {
        const [result] = await db.query(
            'DELETE FROM ratings WHERE rating_id = ? AND user_id = ?',
            [ratingId, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Rating deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete rating',
            error: error.message
        });
    }
};

export const compareMesses = async (req, res) => {
    const { messIds } = req.query; // Comma-separated IDs

    if (!messIds) {
        return res.status(400).json({
            success: false,
            message: 'Mess IDs required'
        });
    }

    const ids = messIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

    if (ids.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'At least 2 messes required for comparison'
        });
    }

    try {
        const placeholders = ids.map(() => '?').join(',');
        const [comparison] = await db.query(`
            SELECT 
                m.mess_id,
                m.name,
                m.location,
                COUNT(r.rating_id) as total_ratings,
                COALESCE(AVG(r.rating_value), 0) as avg_rating,
                SUM(CASE WHEN r.rating_value = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN r.rating_value = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN r.rating_value = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN r.rating_value = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN r.rating_value = 1 THEN 1 ELSE 0 END) as one_star
            FROM messes m
            LEFT JOIN ratings r ON m.mess_id = r.mess_id
            WHERE m.mess_id IN (${placeholders})
            GROUP BY m.mess_id
        `, ids);

        res.json({
            success: true,
            data: comparison
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to compare messes',
            error: error.message
        });
    }
};