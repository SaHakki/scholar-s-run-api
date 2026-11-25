// ONE Sequelize instance (one connection pool) for the whole API.
// Every other file imports it from here - nobody opens a second one.
const { Sequelize, DataTypes } = require('sequelize');
const env = require('../config/env');
const dbConfig = require('../config/database')[env.nodeEnv];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const User = require('./user')(sequelize, DataTypes);
const Location = require('./location')(sequelize, DataTypes);
const GameSession = require('./game-session')(sequelize, DataTypes);
const Seat = require('./seat')(sequelize, DataTypes);
const Question = require('./question')(sequelize, DataTypes);

// Associations = the relationship lines of the ERD, read in both directions.
User.hasMany(GameSession, { foreignKey: 'host_id' });
GameSession.belongsTo(User, { foreignKey: 'host_id', as: 'host' });

GameSession.hasMany(Seat, { foreignKey: 'session_id' });
Seat.belongsTo(GameSession, { foreignKey: 'session_id' });

User.hasMany(Seat, { foreignKey: 'user_id' });
Seat.belongsTo(User, { foreignKey: 'user_id' });

GameSession.hasMany(Question, { foreignKey: 'session_id' });
Question.belongsTo(GameSession, { foreignKey: 'session_id' });

Location.hasMany(Question, { foreignKey: 'location_id' });
Question.belongsTo(Location, { foreignKey: 'location_id' });

module.exports = {
  sequelize,
  Sequelize,
  DataTypes,
  User,
  Location,
  GameSession,
  Seat,
  Question,
};
