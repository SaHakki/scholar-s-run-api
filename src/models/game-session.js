module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'GameSession',
    {
      session_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      join_code: { type: DataTypes.STRING(6), allowNull: false, unique: true },
      host_id: { type: DataTypes.INTEGER, allowNull: false },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'WAITING' },
      duration_seconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 720 },
      started_at: { type: DataTypes.DATE },
      ends_at: { type: DataTypes.DATE },
    },
    { tableName: 'game_sessions', timestamps: true, createdAt: 'created_at', updatedAt: false }
  );