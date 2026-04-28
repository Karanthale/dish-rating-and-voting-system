import db from '../config/db.js';

// 1. Get all active polls for a specific mess
// Fetch active poll for a mess (AND calculate percentages AND check if user voted)
export const getActivePoll = async (req, res) => {
    const { messId } = req.params;
    
    // BULLETPROOF USER ID CHECK: Looks for every possible name your auth middleware might use
    const userId = req.user?.id || req.user?.userId || req.user?.user_id || req.userId; 

    // Debugging log so you can see this in your backend terminal!
    console.log("Checking Active Poll... Extracted User ID:", userId);

    try {
        const [polls] = await db.query(
            'SELECT * FROM polls WHERE mess_id = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1', 
            [messId]
        );

        if (polls.length === 0) return res.json({ success: true, data: null }); 
        const poll = polls[0];

        // Check if this specific user has already voted
        let hasVoted = false;
        let votedOptionId = null;

        if (userId) {
            const [votes] = await db.query('SELECT option_id FROM user_votes WHERE poll_id = ? AND user_id = ?', [poll.poll_id, userId]);
            if (votes.length > 0) {
                hasVoted = true;
                votedOptionId = votes[0].option_id;
            }
        }

        // Get options AND count the votes for each option
        const [options] = await db.query(`
            SELECT po.option_id, po.dish_name, COUNT(uv.vote_id) as vote_count
            FROM poll_options po
            LEFT JOIN user_votes uv ON po.option_id = uv.option_id
            WHERE po.poll_id = ?
            GROUP BY po.option_id
        `, [poll.poll_id]);

        // Calculate total votes and percentage per option
        const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);
        const optionsWithPercentages = options.map(opt => ({
            ...opt,
            percentage: totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0
        }));

        res.json({ 
            success: true, 
            data: {
                ...poll,
                total_votes: totalVotes,
                options: optionsWithPercentages,
                hasVoted: hasVoted,
                votedOptionId: votedOptionId 
            }
        });

    } catch (error) {
        console.error("Error fetching poll:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
// 2. Submit a vote (Gamification included!)
export const submitVote = async (req, res) => {
    const poll_id = req.body.pollId || req.body.poll_id;
    const option_id = req.body.optionId || req.body.option_id;
    
    // BULLETPROOF USER ID CHECK
    const userId = req.user?.id || req.user?.userId || req.user?.user_id || req.userId;

    // Debugging log to see exactly what React sent to the backend
    console.log("Vote Attempt -> Poll:", poll_id, "Option:", option_id, "User ID:", userId);

    if (!poll_id || !option_id || !userId) {
        return res.status(400).json({ 
            success: false, 
            message: `Missing Data! Poll: ${poll_id}, Option: ${option_id}, User: ${userId}` 
        });
    }

    try {
        const [existing] = await db.query('SELECT * FROM user_votes WHERE poll_id = ? AND user_id = ?', [poll_id, userId]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "User has already voted" });
        }

        await db.query('INSERT INTO user_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)', [poll_id, option_id, userId]);
        res.json({ success: true, message: "Vote successfully recorded!" });
    } catch (error) {
        console.error("Error saving vote:", error);
        res.status(500).json({ success: false, message: "Database error while saving vote" });
    }
};

// 3. Create a new poll (Owner Only)
export const createPoll = async (req, res) => {
    const { messId, question, options, expiresDays } = req.body;
    // Note: In a production app, you would verify req.user.role === 'owner' here!

    if (!messId || !question || !options || options.length < 2) {
        return res.status(400).json({ success: false, message: 'Please provide a question and at least 2 options.' });
    }

    // Get a database connection so we can run a transaction (all or nothing)
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // A. Insert the main poll record
        const [pollResult] = await connection.query(
            `INSERT INTO polls (mess_id, question, expires_at, is_active) 
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), TRUE)`,
            [messId, question, expiresDays || 1]
        );
        
        const newPollId = pollResult.insertId;

        // B. Insert all the dish options linked to this new poll
        for (const dishName of options) {
            await connection.query(
                'INSERT INTO poll_options (poll_id, dish_name, vote_count) VALUES (?, ?, 0)',
                [newPollId, dishName]
            );
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Poll published successfully!' });

    } catch (error) {
        await connection.rollback();
        console.error('Error creating poll:', error);
        res.status(500).json({ success: false, message: 'Server error while creating poll' });
    } finally {
        connection.release();
    }
};