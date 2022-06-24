module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define(
		"users",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			username: {
				type: Sequelize.STRING,
				null: true,
			},
			name: {
				type: Sequelize.STRING,
			},
			picture: {
				type: Sequelize.STRING,
				null: true,
			},
			email: {
				type: Sequelize.STRING,
			},
			password: {
				type: Sequelize.STRING,
				null: true,
			},
		},
		{ underscored: true }
	);

	return User;
};
