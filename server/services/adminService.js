const { queryDatabase } = require('../config/bd')

const getAllUsers = async () => {
	const query = `SELECT 
            Requests.RequestID,
            Users.Name AS UserName,
            Masters.Name AS MasterName,
            Requests.ProblemDescription,
            Requests.Address,
            Requests.ApartmentNumber,
            Requests.CreationDate,
            Requests.CompletionDate,
            RequestStatuses.StatusName
        FROM 
            Requests
        LEFT JOIN 
            Users ON Requests.UserID = Users.UserID
        LEFT JOIN 
            Masters ON Requests.MasterID = Masters.MasterID
        LEFT JOIN 
            RequestStatuses ON Requests.StatusID = RequestStatuses.StatusIDч;`
	const result = await queryDatabase(query, [])
	return result
}

module.exports = { getAllUsers }
