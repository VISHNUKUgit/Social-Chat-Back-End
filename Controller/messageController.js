const messages = require("../DataBase/Model/messageModel");

exports.getUsersMessages = async (req, res) => {
    console.log("inside get Users Messages controller");
    
    const sender = req.query.sender;
    const recipient = req.query.recipient;

    try {
       
        const allMessages= await messages.find({ $or: [{ sender, recipient }, { sender: recipient, recipient: sender }] });
// console.log(allMessages);
// const sortedMessages = allMessages.sort((a, b) => a.timestamp - b.timestamp);
// const limitedMessages = sortedMessages.slice(0, limit); // Adjust 'limit' as needed

        if (allMessages.length > 0) {
            
            res.status(200).json(allMessages);

            await messages.updateMany(
                { sender:recipient, recipient: sender, read: false },
                { $set: { read: true } }
            );
    
        } else {
            
            res.status(404).json([]);
        }
    } catch (error) {
        
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};