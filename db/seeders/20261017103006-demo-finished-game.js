'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const joinCode = '583104';

    // 1. Find the demo host.
    const [hosts] = await queryInterface.sequelize.query(
      "SELECT user_id FROM users WHERE school_id = '2099-1001'"
    );

    if (hosts.length === 0) {
      throw new Error('Demo host not found. Run the demo-users seeder first.');
    }

    // 2. Find the session, or create it if it doesn't exist.
    let [sessions] = await queryInterface.sequelize.query(
      'SELECT session_id, started_at FROM game_sessions WHERE join_code = :joinCode',
      { replacements: { joinCode } }
    );

    if (sessions.length === 0) {
      const now = new Date();
      const startedAt = new Date(now.getTime() - 15 * 60 * 1000);
      const endsAt = new Date(startedAt.getTime() + 10 * 60 * 1000);

      await queryInterface.bulkInsert('game_sessions', [{
        join_code: joinCode,
        host_id: hosts[0].user_id,
        status: 'FINISHED',
        duration_seconds: 600,
        started_at: startedAt,
        ends_at: endsAt,
        created_at: startedAt
      }]);

      [sessions] = await queryInterface.sequelize.query(
        'SELECT session_id, started_at FROM game_sessions WHERE join_code = :joinCode',
        { replacements: { joinCode } }
      );
    }

    if (sessions.length === 0) {
      throw new Error('Could not retrieve the demo game session.');
    }

    const sessionId = sessions[0].session_id;
    const startedAt = sessions[0].started_at;

    // 3. Find the four demo player accounts.
    const [players] = await queryInterface.sequelize.query(
      "SELECT user_id, school_id, full_name FROM users " +
      "WHERE school_id IN ('2099-1002', '2099-1003', '2099-1004', '2099-1005') " +
      "ORDER BY school_id"
    );

    if (players.length !== 4) {
      throw new Error('Expected four demo player accounts.');
    }

    // 4. Create only the seats that are missing.
    const [existingSeats] = await queryInterface.sequelize.query(
      'SELECT user_id FROM seats WHERE session_id = :sessionId',
      { replacements: { sessionId } }
    );

    const seatedUserIds = new Set(
      existingSeats.map((seat) => Number(seat.user_id))
    );

    const newSeats = players
      .filter((player) => !seatedUserIds.has(Number(player.user_id)))
      .map((player) => ({
        session_id: sessionId,
        user_id: player.user_id,
        nickname: player.full_name,
        joined_at: startedAt
      }));

    if (newSeats.length > 0) {
      await queryInterface.bulkInsert('seats', newSeats);
    }

    // 5. Create one run for each player.
    const [seats] = await queryInterface.sequelize.query(
      `SELECT s.seat_id, u.school_id
       FROM seats s
       JOIN users u ON u.user_id = s.user_id
       WHERE s.session_id = :sessionId
       ORDER BY u.school_id`,
      { replacements: { sessionId } }
    );

    const runResults = {
      '2099-1002': { energy: 3, points: 380, status: 'FINISHED' },
      '2099-1003': { energy: 3, points: 360, status: 'FINISHED' },
      '2099-1004': { energy: 2, points: 320, status: 'FINISHED' },
      '2099-1005': { energy: 0, points: 280, status: 'ELIMINATED' }
    };

    const [existingRuns] = await queryInterface.sequelize.query(
      `SELECT r.seat_id
       FROM runs r
       JOIN seats s ON s.seat_id = r.seat_id
       WHERE s.session_id = :sessionId`,
      { replacements: { sessionId } }
    );

    const existingRunSeats = new Set(
      existingRuns.map((run) => Number(run.seat_id))
    );

    const endedAt = new Date(
      new Date(startedAt).getTime() + 10 * 60 * 1000
    );

    const newRuns = seats
      .filter((seat) => !existingRunSeats.has(Number(seat.seat_id)))
      .map((seat) => {
        const result = runResults[seat.school_id];

        if (!result) {
          throw new Error(
            `Missing demo run results for ${seat.school_id}.`
          );
        }

        const finalScore = result.status === 'ELIMINATED'
          ? result.points
          : result.points * (1 + result.energy / 10);

        return {
          seat_id: seat.seat_id,
          status: result.status,
          energy: result.energy,
          accumulated_points: result.points,
          final_score: finalScore,
          started_at: startedAt,
          ended_at: endedAt
        };
      });

    if (newRuns.length > 0) {
      await queryInterface.bulkInsert('runs', newRuns);
    }

    // 6. Seed connected campus routes in both directions.
    const [locations] = await queryInterface.sequelize.query(
      'SELECT location_id, name FROM locations'
    );

    const locationIds = new Map(
      locations.map((location) => [location.name, location.location_id])
    );

    const connections = [
      ['Admin Building', 'The Clinic'],
      ['Admin Building', 'ICT Building'],
      ['Admin Building', 'Manggahan'],
      ['The Clinic', 'The Library'],
      ['The Clinic', 'The Social Hall'],
      ['The Clinic', 'ICT Building'],
      ['ICT Building', 'CICT Building'],
      ['ICT Building', 'BME Building'],
      ['ICT Building', 'The Social Hall'],
      ['BME Building', 'Manggahan'],
      ['BME Building', 'CICT Building'],
      ['CICT Building', 'The Library'],
      ['CICT Building', 'The Social Hall'],
      ['The Library', 'The Social Hall']
    ];

    const routeNames = connections.flatMap(([from, to]) => [
      [from, to],
      [to, from]
    ]);

    const [existingRoutes] = await queryInterface.sequelize.query(
      'SELECT from_location_id, to_location_id FROM location_routes'
    );

    const existingRouteKeys = new Set(
      existingRoutes.map(
        (route) => `${route.from_location_id}-${route.to_location_id}`
      )
    );

    const newRoutes = routeNames.map(([from, to]) => {
      if (!locationIds.has(from) || !locationIds.has(to)) {
        throw new Error(`Campus location missing for route: ${from} -> ${to}`);
      }

      return {
        from_location_id: locationIds.get(from),
        to_location_id: locationIds.get(to)
      };
    }).filter((route) => {
      const key = `${route.from_location_id}-${route.to_location_id}`;
      return !existingRouteKeys.has(key);
    });

    if (newRoutes.length > 0) {
      await queryInterface.bulkInsert('location_routes', newRoutes);
    }

    // 7. Seed one demo question for each campus location.
    const demoQuestions = [
      {
        location: 'Admin Building',
        question_text: 'Which quality is most important in responsible leadership?',
        choice_a: 'Accountability',
        choice_b: 'Favoritism',
        choice_c: 'Dishonesty',
        choice_d: 'Neglect',
        correct_choice: 'A'
      },
      {
        location: 'Manggahan',
        question_text: 'Which fruit is commonly associated with the Philippines?',
        choice_a: 'Blueberry',
        choice_b: 'Mango',
        choice_c: 'Cranberry',
        choice_d: 'Raspberry',
        correct_choice: 'B'
      },
      {
        location: 'The Clinic',
        question_text: 'Which action helps prevent the spread of infection?',
        choice_a: 'Sharing used tissues',
        choice_b: 'Ignoring hand hygiene',
        choice_c: 'Washing hands properly',
        choice_d: 'Reusing disposable gloves',
        correct_choice: 'C'
      },
      {
        location: 'The Library',
        question_text: 'Which source is generally best for checking a research claim?',
        choice_a: 'An anonymous rumor',
        choice_b: 'An unverified social post',
        choice_c: 'An unrelated advertisement',
        choice_d: 'A credible, relevant source',
        correct_choice: 'D'
      },
      {
        location: 'The Social Hall',
        question_text: 'What is a key benefit of teamwork?',
        choice_a: 'Combining different strengths',
        choice_b: 'Preventing communication',
        choice_c: 'Avoiding shared responsibility',
        choice_d: 'Discouraging cooperation',
        correct_choice: 'A'
      },
      {
        location: 'ICT Building',
        question_text: 'Which component executes program instructions?',
        choice_a: 'Monitor',
        choice_b: 'CPU',
        choice_c: 'Keyboard',
        choice_d: 'Printer',
        correct_choice: 'B'
      },
      {
        location: 'BME Building',
        question_text: 'What does a business budget help an organization do?',
        choice_a: 'Eliminate every business risk',
        choice_b: 'Guarantee a profit',
        choice_c: 'Plan income and expenses',
        choice_d: 'Avoid tracking spending',
        correct_choice: 'C'
      },
      {
        location: 'CICT Building',
        question_text: 'Which practice helps protect an online account?',
        choice_a: 'Reusing one weak password everywhere',
        choice_b: 'Sharing passwords publicly',
        choice_c: 'Disabling every security measure',
        choice_d: 'Using a strong, unique password',
        correct_choice: 'D'
      }
    ];

    const [existingQuestions] = await queryInterface.sequelize.query(
      'SELECT location_id FROM questions WHERE session_id = :sessionId',
      { replacements: { sessionId } }
    );

    const locationsWithQuestions = new Set(
      existingQuestions.map((question) => Number(question.location_id))
    );

    const questionRows = demoQuestions.map((question) => {
      const locationId = locationIds.get(question.location);

      if (!locationId) {
        throw new Error(
          `Campus location missing for question: ${question.location}`
        );
      }

      return {
        session_id: sessionId,
        location_id: locationId,
        question_text: question.question_text,
        choice_a: question.choice_a,
        choice_b: question.choice_b,
        choice_c: question.choice_c,
        choice_d: question.choice_d,
        correct_choice: question.correct_choice
      };
    }).filter(
      (question) => !locationsWithQuestions.has(Number(question.location_id))
    );

    if (questionRows.length > 0) {
      await queryInterface.bulkInsert('questions', questionRows);
    }

    // 8. Seed one completed, non-perfect ICT Building visit per run.
    const [ictLocationRows] = await queryInterface.sequelize.query(
      "SELECT location_id FROM locations WHERE name = 'ICT Building'"
    );

    if (ictLocationRows.length === 0) {
      throw new Error('ICT Building location was not found.');
    }

    const ictLocationId = Number(ictLocationRows[0].location_id);

    const [existingVisits] = await queryInterface.sequelize.query(
      'SELECT run_id, location_id FROM location_visits'
    );

    const existingVisitKeys = new Set(
      existingVisits.map(
        (visit) => `${visit.run_id}-${visit.location_id}`
      )
    );

    const [allRuns] = await queryInterface.sequelize.query(
      `SELECT r.run_id
       FROM runs r
       JOIN seats s ON s.seat_id = r.seat_id
       WHERE s.session_id = :sessionId`,
      { replacements: { sessionId } }
    );

    const newVisits = allRuns
      .filter(
        (run) =>
          !existingVisitKeys.has(`${run.run_id}-${ictLocationId}`)
      )
      .map((run) => ({
        run_id: run.run_id,
        location_id: ictLocationId,
        visit_number: 1,
        is_perfect: false,
        entered_at: new Date(startedAt.getTime() + 60 * 1000),
        completed_at: new Date(startedAt.getTime() + 90 * 1000)
      }));

    if (newVisits.length > 0) {
      await queryInterface.bulkInsert('location_visits', newVisits);
    }
    
    // Add a perfect Clinic visit for the first demo player.
    const [firstPlayerRuns] = await queryInterface.sequelize.query(
      `SELECT r.run_id
       FROM runs r
       JOIN seats s ON s.seat_id = r.seat_id
       JOIN users u ON u.user_id = s.user_id
       WHERE s.session_id = :sessionId
         AND u.school_id = '2099-1002'`,
      { replacements: { sessionId } }
    );

    if (firstPlayerRuns.length === 0) {
      throw new Error('First demo player run was not found.');
    }

    const clinicRunId = Number(firstPlayerRuns[0].run_id);

    const [clinicVisits] = await queryInterface.sequelize.query(
      `SELECT location_visit_id
       FROM location_visits
       WHERE run_id = :runId
         AND location_id = :locationId`,
      {
        replacements: {
          runId: clinicRunId,
          locationId: locationIds.get('The Clinic')
        }
      }
    );

    if (clinicVisits.length === 0) {
      await queryInterface.bulkInsert('location_visits', [{
        run_id: clinicRunId,
        location_id: locationIds.get('The Clinic'),
        visit_number: 2,
        is_perfect: true,
        entered_at: new Date(startedAt.getTime() + 100 * 1000),
        completed_at: new Date(startedAt.getTime() + 120 * 1000)
      }]);
    }

    // 9. Seed answer attempts that match each demo run's score and Energy.
    const [ictQuestionRows] = await queryInterface.sequelize.query(
      `SELECT question_id, correct_choice
       FROM questions
       WHERE session_id = :sessionId
         AND location_id = :locationId
       LIMIT 1`,
      {
        replacements: {
          sessionId,
          locationId: ictLocationId
        }
      }
    );

    if (ictQuestionRows.length === 0) {
      throw new Error('Demo ICT Building question was not found.');
    }

    const ictQuestion = ictQuestionRows[0];

    const [ictVisitRows] = await queryInterface.sequelize.query(
      `SELECT lv.location_visit_id, lv.run_id
       FROM location_visits lv
       JOIN runs r ON r.run_id = lv.run_id
       JOIN seats s ON s.seat_id = r.seat_id
       WHERE lv.location_id = :locationId
         AND s.session_id = :sessionId`,
      {
        replacements: {
          locationId: ictLocationId,
          sessionId
        }
      }
    );

    const visitByRunId = new Map(
      ictVisitRows.map((visit) => [
        Number(visit.run_id),
        Number(visit.location_visit_id)
      ])
    );

    const [demoRuns] = await queryInterface.sequelize.query(
      `SELECT r.run_id, r.accumulated_points, r.energy, u.school_id
       FROM runs r
       JOIN seats s ON s.seat_id = r.seat_id
       JOIN users u ON u.user_id = s.user_id
       WHERE s.session_id = :sessionId`,
      { replacements: { sessionId } }
    );

    const [existingAttempts] = await queryInterface.sequelize.query(
      `SELECT qa.location_visit_id, qa.question_id
       FROM question_attempts qa
       JOIN location_visits lv
         ON lv.location_visit_id = qa.location_visit_id
       JOIN runs r ON r.run_id = lv.run_id
       JOIN seats s ON s.seat_id = r.seat_id
       WHERE s.session_id = :sessionId`,
      { replacements: { sessionId } }
    );

    const runsWithAttempts = new Set(
      existingAttempts.map(
        (attempt) =>
          `${attempt.location_visit_id}-${attempt.question_id}`
      )
    );

    const wrongChoice =
      ictQuestion.correct_choice === 'A' ? 'B' : 'A';

    const attemptRows = [];

    for (const run of demoRuns) {
      const locationVisitId = visitByRunId.get(Number(run.run_id));

      if (!locationVisitId) {
        throw new Error(
          `No ICT Building visit found for run ${run.run_id}.`
        );
      }

      const attemptKey = `${locationVisitId}-${ictQuestion.question_id}`;

      if (runsWithAttempts.has(attemptKey)) {
        continue;
      }

      const correctCount = Number(run.accumulated_points) / 20;
      const wrongCount = 5 - Number(run.energy);

      if (
        !Number.isInteger(correctCount) ||
        correctCount < 0 ||
        !Number.isInteger(wrongCount) ||
        wrongCount < 0
      ) {
        throw new Error(
          `Invalid demo score or Energy for run ${run.run_id}.`
        );
      }

      const totalAttempts = correctCount + wrongCount;

      for (let i = 0; i < totalAttempts; i++) {
        const isCorrect = i < correctCount;

        attemptRows.push({
          location_visit_id: locationVisitId,
          question_id: ictQuestion.question_id,
          selected_choice: isCorrect
            ? ictQuestion.correct_choice
            : wrongChoice,
          is_correct: isCorrect,
          points_awarded: isCorrect ? 20 : 0,
          energy_delta: isCorrect ? 0 : -1,
          answered_at: new Date(
            startedAt.getTime() + (61 + i) * 1000
          )
        });
      }
    }

    if (attemptRows.length > 0) {
      await queryInterface.bulkInsert('question_attempts', attemptRows);
    }
  
    // 10. Record the perfect Clinic visit, answer, and Energy reward.
    const clinicLocationId = Number(locationIds.get('The Clinic'));

    const [clinicVisitRows] = await queryInterface.sequelize.query(
      `SELECT location_visit_id
       FROM location_visits
       WHERE run_id = :runId
         AND location_id = :locationId`,
      {
        replacements: {
          runId: clinicRunId,
          locationId: clinicLocationId
        }
      }
    );

    if (clinicVisitRows.length === 0) {
      throw new Error('The first demo player Clinic visit was not found.');
    }

    const clinicVisitId = Number(
      clinicVisitRows[0].location_visit_id
    );

    const [clinicQuestionRows] = await queryInterface.sequelize.query(
      `SELECT question_id, correct_choice
       FROM questions
       WHERE session_id = :sessionId
         AND location_id = :locationId
       LIMIT 1`,
      {
        replacements: {
          sessionId,
          locationId: clinicLocationId
        }
      }
    );

    if (clinicQuestionRows.length === 0) {
      throw new Error('The Clinic question was not found.');
    }

    const clinicQuestion = clinicQuestionRows[0];

    const [existingClinicAttempts] =
      await queryInterface.sequelize.query(
        `SELECT location_visit_id
         FROM question_attempts
         WHERE location_visit_id = :visitId
           AND question_id = :questionId`,
        {
          replacements: {
            visitId: clinicVisitId,
            questionId: clinicQuestion.question_id
          }
        }
      );

    if (existingClinicAttempts.length === 0) {
      await queryInterface.bulkInsert('question_attempts', [{
        location_visit_id: clinicVisitId,
        question_id: clinicQuestion.question_id,
        selected_choice: clinicQuestion.correct_choice,
        is_correct: true,
        points_awarded: 20,
        energy_delta: 0,
        answered_at: new Date(startedAt.getTime() + 110 * 1000)
      }]);
    }

    const [existingClinicClaims] =
      await queryInterface.sequelize.query(
        `SELECT reward_claim_id
         FROM location_rewards_claimed
         WHERE run_id = :runId
           AND location_id = :locationId`,
        {
          replacements: {
            runId: clinicRunId,
            locationId: clinicLocationId
          }
        }
      );

    if (existingClinicClaims.length === 0) {
      await queryInterface.bulkInsert('location_rewards_claimed', [{
        run_id: clinicRunId,
        location_id: clinicLocationId,
        energy_awarded: 1,
        claimed_at: new Date(startedAt.getTime() + 120 * 1000)
      }]);
    }

    // 380 ICT points + 20 Clinic points; 3 Energy + 1 reward.
    await queryInterface.bulkUpdate(
      'runs',
      {
        energy: 4,
        accumulated_points: 400,
        final_score: 560
      },
      { run_id: clinicRunId }
    );

    console.log(
      `Demo session ${joinCode}: created ${newSeats.length} seats, ${newRuns.length} runs, and ${newRoutes.length} routes.`
    );
  },

  async down(queryInterface, Sequelize) {
    const [sessions] = await queryInterface.sequelize.query(
      "SELECT session_id FROM game_sessions WHERE join_code = '583104'"
    );

    if (sessions.length > 0) {
      await queryInterface.bulkDelete(
        'game_sessions',
        { session_id: sessions[0].session_id }
      );
    }
  }
};


