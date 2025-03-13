const { queryDatabase } = require('../config/bd')

const checkMasterAvailability = async (masterID, date, time) => {
  try {
    const startTime = new Date(`${date} ${time}`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); 



    const requestQuery = `
  SELECT * FROM Requests 
WHERE MasterID = ? AND (
  (CreationDate >= CAST(? AS DATETIME) AND CreationDate < CAST(? AS DATETIME)) OR
  (DATEADD(HOUR, 1, CreationDate) > CAST(? AS DATETIME) AND DATEADD(HOUR, 1, CreationDate) <= CAST(? AS DATETIME))
) AND StatusID IN (1, 2)
    `;
    
    const requestResult = await queryDatabase(requestQuery, [
      masterID,
      startTime,
      endTime,
      startTime,
      endTime,
    ]);

    return requestResult.length === 0;
  } catch (err) {
    console.error('Ошибка при проверке доступности мастера', err);
    throw err;
  }
};

const getBookedTimes = async (masterID, date) => {
  try {
    const requestQuery = `
      SELECT CreationDate 
      FROM Requests 
      WHERE MasterID = ? AND CAST(CreationDate AS DATE) = ? AND StatusID IN (1, 2)
    `;
    const requestResult = await queryDatabase(requestQuery, [masterID, date]);

    const bookedTimes = requestResult.map(row => ({
      start: row.CreationDate.slice(11, 16),
      end: new Date(new Date(row.CreationDate).getTime() + 60 * 60 * 1000).toISOString().slice(11, 16),
    }));

    return bookedTimes;
  } catch (err) {
    console.error('Ошибка при получении занятых времен:', err);
    throw err;
  }
};

const getMasters = async () => {
	try {
		const query = `
					SELECT MasterID, Name 
					FROM Masters
			`
		const result = await queryDatabase(query)
		return result
	} catch (err) {
		console.error('Ошибка при получении списка мастеров:', err)
		throw err
	}
}

const createStatement = async (
  userID,
  masterID,
  problemDescription,
  date,
  time,
  apartmentNumber,
  address
) => {
  try {
    const creationDate = new Date(`${date} ${time}`)

    const isAvailable = await checkMasterAvailability(masterID, date, time);
    if (!isAvailable) {
      throw new Error('Мастер занят в выбранное время');
    }

    const query = `
      INSERT INTO Requests (UserID, MasterID, ProblemDescription, Address, ApartmentNumber, CreationDate, StatusID)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const statusID = 1; 
    await queryDatabase(query, [
      userID,
      masterID,
      problemDescription,
      address,
      apartmentNumber,
      creationDate,
      statusID,
    ]);
  } catch (err) {
    console.error('Ошибка при создании заявки', err);
    throw err;
  }
};

module.exports = {
	checkMasterAvailability,
	createStatement,
	getBookedTimes,
	getMasters,
}
