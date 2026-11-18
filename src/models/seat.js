module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Seat',
    {
      seat_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      session_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      nickname: { type: DataTypes.STRING(50), allowNull: false },
    },
    { tableName: 'seats', timestamps: true, createdAt: 'joined_at', updatedAt: false }
  );