import db from '../config/db.js';

export const getAllMesses = async (req, res) => {
    try {
        const [messes] = await db.query(`
            SELECT 
                m.mess_id,
                m.name,
                m.location,
                m.description,
                m.is_active,
                COUNT(r.rating_id) as total_ratings,
                COALESCE(AVG(r.rating_value), 0) as avg_rating
            FROM messes m
            LEFT JOIN ratings r ON m.mess_id = r.mess_id
            WHERE m.is_active = TRUE
            GROUP BY m.mess_id
            ORDER BY avg_rating DESC, total_ratings DESC
        `);

        res.json({
            success: true,
            data: messes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messes',
            error: error.message
        });
    }
};

export const getMessById = async (req, res) => {
    const { id } = req.params;

    try {
        const [messes] = await db.query(`
            SELECT 
                m.*,
                COUNT(r.rating_id) as total_ratings,
                COALESCE(AVG(r.rating_value), 0) as avg_rating
            FROM messes m
            LEFT JOIN ratings r ON m.mess_id = r.mess_id
            WHERE m.mess_id = ?
            GROUP BY m.mess_id
        `, [id]);

        if (messes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mess not found'
            });
        }

        res.json({
            success: true,
            data: messes[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch mess details',
            error: error.message
        });
    }
};

export const createMess = async (req, res) => {
    const { name, location, description } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO messes (name, location, description) VALUES (?, ?, ?)',
            [name, location, description]
        );

        res.status(201).json({
            success: true,
            message: 'Mess created successfully',
            data: {
                mess_id: result.insertId,
                name,
                location,
                description
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create mess',
            error: error.message
        });
    }
};

export const updateMess = async (req, res) => {
    const { id } = req.params;
    const { name, location, description, is_active } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE messes SET name = ?, location = ?, description = ?, is_active = ? WHERE mess_id = ?',
            [name, location, description, is_active, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mess not found'
            });
        }

        res.json({
            success: true,
            message: 'Mess updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update mess',
            error: error.message
        });
    }
};

export const deleteMess = async (req, res) => {
    const { id } = req.params;

    try {
        // Soft delete
        const [result] = await db.query(
            'UPDATE messes SET is_active = FALSE WHERE mess_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mess not found'
            });
        }

        res.json({
            success: true,
            message: 'Mess deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete mess',
            error: error.message
        });
    }
};