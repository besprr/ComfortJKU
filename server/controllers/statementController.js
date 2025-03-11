const { createStatement, checkMasterAvailability } = require('../services/statementService');

const createStatementHandler = async (req, res) => {
    const { MasterID, ProblemDescription, Address, ApartmentNumber, Date, Time } = req.body;
    const UserID = req.user.userId;

    if (!MasterID || !ProblemDescription || !Date || !Time || !ApartmentNumber|| !Address) {
        return res.status(400).json({ error: 'Все поля должны быть заполнены' });
    }

    try {
        const isAvailable = await checkMasterAvailability(MasterID, Date, Time);
        if (!isAvailable) {
            return res.status(400).json({ error: 'Мастер занят в выбранное время' });
        }

        

        await createStatement(UserID, MasterID, ProblemDescription, Date, Time, ApartmentNumber, Address);

        res.status(201).json({ message: 'Заявка успешно создана' });
    } catch (error) {
        console.error('Ошибка при создании заявки:', error);
        res.status(500).json({ error: 'Ошибка при создании заявки', details: error.message });
    }
};



module.exports = { createStatementHandler };