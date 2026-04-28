import db from '../config/db.js';

export const getAnalytics = async (req, res) => {
    const { startDate, endDate, messId } = req.query;

    try {
        let dateFilter = '';
        let messFilter = '';
        const params = [];

        if (startDate && endDate) {
            dateFilter = 'AND r.date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        if (messId) {
            messFilter = 'AND m.mess_id = ?';
            params.push(messId);
        }

        // Overall Statistics
        const [overview] = await db.query(`
            SELECT 
                COUNT(DISTINCT m.mess_id) as total_messes,
                COUNT(DISTINCT r.user_id) as total_users,
                COUNT(r.rating_id) as total_ratings,
                COALESCE(AVG(r.rating_value), 0) as overall_avg_rating
            FROM messes m
            LEFT JOIN ratings r ON m.mess_id = r.mess_id
            WHERE m.is_active = TRUE ${dateFilter.replace('AND', '')}
        `, params.slice(0, 2));

        // Top Rated Messes
        const [topMesses] = await db.query(`
            SELECT 
                m.mess_id,
                m.name,
                m.location,
                COUNT(r.rating_id) as rating_count,
                COALESCE(AVG(r.rating_value), 0) as avg_rating
            FROM messes m
            LEFT JOIN ratings r ON m.mess_id = r.mess_id
            WHERE m.is_active = TRUE ${dateFilter} ${messFilter}
            GROUP BY m.mess_id
            HAVING rating_count > 0
            ORDER BY avg_rating DESC, rating_count DESC
            LIMIT 5
        `, params);

        // Rating Distribution
        const [distribution] = await db.query(`
            SELECT 
                rating_value,
                COUNT(*) as count
            FROM ratings r
            JOIN messes m ON r.mess_id = m.mess_id
            WHERE m.is_active = TRUE ${dateFilter} ${messFilter}
            GROUP BY rating_value
            ORDER BY rating_value DESC
        `, params);

        // Recent Ratings
        const [recentRatings] = await db.query(`
            SELECT 
                r.rating_id,
                r.rating_value,
                r.feedback,
                r.date,
                u.name as user_name,
                m.name as mess_name
            FROM ratings r
            JOIN users u ON r.user_id = u.user_id
            JOIN messes m ON r.mess_id = m.mess_id
            WHERE m.is_active = TRUE ${dateFilter} ${messFilter}
            ORDER BY r.date DESC
            LIMIT 10
        `, params);

        // Trend Data (Last 7 days)
        const [trends] = await db.query(`
            SELECT 
                DATE(r.date) as date,
                COUNT(r.rating_id) as count,
                AVG(r.rating_value) as avg_rating
            FROM ratings r
            JOIN messes m ON r.mess_id = m.mess_id
            WHERE m.is_active = TRUE
            AND r.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            ${messFilter}
            GROUP BY DATE(r.date)
            ORDER BY date ASC
        `, messId ? [messId] : []);

        res.json({
            success: true,
            data: {
                overview: overview[0],
                topMesses,
                distribution,
                recentRatings,
                trends
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: error.message
        });
    }
};

export const exportCSV = async (req, res) => {
    try {
        const [data] = await db.query(`
            SELECT 
                m.name as Mess_Name,
                m.location as Location,
                COUNT(r.rating_id) as Total_Ratings,
                COALESCE(AVG(r.rating_value), 0) as Average_Rating,
                SUM(CASE WHEN r.rating_value = 5 THEN 1 ELSE 0 END) as Five_Star,
                SUM(CASE WHEN r.rating_value = 4 THEN 1 ELSE 0 END) as Four_Star,
                SUM(CASE WHEN r.rating_value = 3 THEN 1 ELSE 0 END) as Three_Star,
                SUM(CASE WHEN r.rating_value = 2 THEN 1 ELSE 0 END) as Two_Star,
                SUM(CASE WHEN r.rating_value = 1 THEN 1 ELSE 0 END) as One_Star
            FROM messes m
            LEFT JOIN ratings r ON m.mess_id = r.mess_id
            WHERE m.is_active = TRUE
            GROUP BY m.mess_id
            ORDER BY Average_Rating DESC
        `);

        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No data to export'
            });
        }

        // Generate CSV
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=mess-ratings-${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to export data',
            error: error.message
        });
    }
};

export const getOwnerAnalytics = async (req, res) => {
    const { messId } = req.params;

    try {
        // 1. Get Overall Mess Stats (including NLP Sentiments)
        const [overallStats] = await db.query(
            `SELECT 
                COUNT(*) as total_reviews, 
                COALESCE(AVG(rating_value), 0) as avg_rating,
                SUM(CASE WHEN sentiment = 'Positive' THEN 1 ELSE 0 END) as positive_count,
                SUM(CASE WHEN sentiment = 'Negative' THEN 1 ELSE 0 END) as negative_count
             FROM ratings 
             WHERE mess_id = ?`,
            [messId]
        );

        // 2. Get Dish Performance (Top Rated Dishes & NLP)
        const [dishStats] = await db.query(
            `SELECT 
                dm.dish_name, 
                COALESCE(AVG(dr.rating_value), 0) as avg_rating, 
                COUNT(dr.rating_id) as total_ratings,
                SUM(CASE WHEN dr.sentiment = 'Positive' THEN 1 ELSE 0 END) as positive_reviews,
                SUM(CASE WHEN dr.sentiment = 'Negative' THEN 1 ELSE 0 END) as negative_reviews
             FROM daily_menus dm
             LEFT JOIN dish_ratings dr ON dm.menu_id = dr.menu_id
             WHERE dm.mess_id = ?
             GROUP BY dm.menu_id, dm.dish_name
             HAVING total_ratings > 0
             ORDER BY avg_rating DESC
             LIMIT 5`,
            [messId]
        );

        // 3. Get Poll Engagement
        const [pollStats] = await db.query(
            `SELECT COUNT(uv.vote_id) as total_votes_cast
             FROM polls p
             JOIN user_votes uv ON p.poll_id = uv.poll_id
             WHERE p.mess_id = ?`,
            [messId]
        );

        res.json({
            success: true,
            data: {
                overview: overallStats[0],
                topDishes: dishStats,
                engagement: {
                    totalPollVotes: pollStats[0]?.total_votes_cast || 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching owner analytics:', error);
        res.status(500).json({ success: false, message: 'Server error fetching analytics' });
    }
};