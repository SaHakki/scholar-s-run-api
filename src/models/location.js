module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Location',
    {
      location_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT },
      energy_reward: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { tableName: 'locations', timestamps: false }
  );