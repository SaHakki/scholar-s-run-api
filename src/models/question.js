module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Question',
    {
      question_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      session_id: { type: DataTypes.INTEGER, allowNull: false },
      location_id: { type: DataTypes.INTEGER, allowNull: false },
      question_text: { type: DataTypes.TEXT, allowNull: false },
      choice_a: { type: DataTypes.TEXT, allowNull: false },
      choice_b: { type: DataTypes.TEXT, allowNull: false },
      choice_c: { type: DataTypes.TEXT, allowNull: false },
      choice_d: { type: DataTypes.TEXT, allowNull: false },
      correct_choice: { type: DataTypes.CHAR(1), allowNull: false },
    },
    { tableName: 'questions', timestamps: false }
  );