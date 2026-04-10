-- ================================================================
-- STEP 1: Create Event (teamSize=1, status=REGISTRATION_OPEN)
-- ================================================================
INSERT INTO events (
    id, short_code, name, description, theme, contact_email,
    start_date, end_date, registration_start_date, registration_end_date,
    judging, is_virtual, team_size, status, organizer_id
) VALUES (
    'evt-solo-2026-001',
    'SOLO26',
    'Solo Hack 2026',
    'A solo hackathon where each participant competes individually.',
    'Innovation & Technology',
    'organizer@ehub.dev',
    '2026-05-01 09:00:00',
    '2026-05-02 18:00:00',
    '2026-04-09 00:00:00',
    '2026-04-30 23:59:59',
    true,
    true,
    1,
    'REGISTRATION_OPEN',
    '2cb938fd-263f-44aa-aa14-1be848cad688'
);

-- ================================================================
-- STEP 2: Add Two Problem Statements
-- ================================================================
INSERT INTO problem_statements (id, statement_id, name, statement, requirements, event_id) VALUES
(
    'ps-solo-001',
    'SPS001',
    'Smart Traffic Management',
    'Design an AI-powered traffic management system that reduces urban congestion by analysing real-time traffic data and dynamically adjusting signal timings.',
    'Must use real-time data streams; must reduce average wait time by 30%; must include a dashboard.',
    'evt-solo-2026-001'
),
(
    'ps-solo-002',
    'SPS002',
    'Mental Health Companion Bot',
    'Build a conversational AI chatbot that provides mental health support, mood tracking, and connects users to professional resources when needed.',
    'Must support 3+ languages; must detect crisis situations and escalate; must include mood analytics.',
    'evt-solo-2026-001'
);

-- ================================================================
-- STEP 3: Register User 1 (manju2763) for the event
-- ================================================================
INSERT INTO event_registrations (id, event_id, user_id, username, user_email, status, registration_time)
VALUES (
    'reg-solo-user1',
    'evt-solo-2026-001',
    '305aac58-a2ae-4019-8837-136f18144270',
    'manju2763',
    'umanjunath2763@gmail.com',
    'APPROVED',
    NOW()
);

-- ================================================================
-- STEP 4: Register User 2 (manju) for the event
-- ================================================================
INSERT INTO event_registrations (id, event_id, user_id, username, user_email, status, registration_time)
VALUES (
    'reg-solo-user2',
    'evt-solo-2026-001',
    '4b4b388c-b604-4bec-b34b-5a5a526572bf',
    'manju',
    'ulthimanjunath1@gmail.com',
    'APPROVED',
    NOW()
);

-- ================================================================
-- STEP 5: Create Team for User 1 (manju2763) — selects PS1
-- ================================================================
INSERT INTO teams (id, short_code, name, event_id, leader_id, problem_statement_id)
VALUES (
    'team-solo-user1',
    'TM-U1-S26',
    'Team Manju2763',
    'evt-solo-2026-001',
    '305aac58-a2ae-4019-8837-136f18144270',
    'ps-solo-001'
);

INSERT INTO team_members (id, team_id, user_id, username, user_email, role, status)
VALUES (
    'tm-member-user1',
    'team-solo-user1',
    '305aac58-a2ae-4019-8837-136f18144270',
    'manju2763',
    'umanjunath2763@gmail.com',
    'LEADER',
    'ACCEPTED'
);

-- ================================================================
-- STEP 6: Create Team for User 2 (manju) — selects PS2
-- ================================================================
INSERT INTO teams (id, short_code, name, event_id, leader_id, problem_statement_id)
VALUES (
    'team-solo-user2',
    'TM-U2-S26',
    'Team Manju',
    'evt-solo-2026-001',
    '4b4b388c-b604-4bec-b34b-5a5a526572bf',
    'ps-solo-002'
);

INSERT INTO team_members (id, team_id, user_id, username, user_email, role, status)
VALUES (
    'tm-member-user2',
    'team-solo-user2',
    '4b4b388c-b604-4bec-b34b-5a5a526572bf',
    'manju',
    'ulthimanjunath1@gmail.com',
    'LEADER',
    'ACCEPTED'
);

-- ================================================================
-- VERIFICATION
-- ================================================================
SELECT '=== EVENT ===' AS section;
SELECT id, name, team_size, status, organizer_id FROM events WHERE id = 'evt-solo-2026-001';

SELECT '=== PROBLEM STATEMENTS ===' AS section;
SELECT id, statement_id, name FROM problem_statements WHERE event_id = 'evt-solo-2026-001';

SELECT '=== REGISTRATIONS ===' AS section;
SELECT id, user_id, username, status FROM event_registrations WHERE event_id = 'evt-solo-2026-001';

SELECT '=== TEAMS ===' AS section;
SELECT t.id, t.name, t.leader_id, t.problem_statement_id, ps.name AS problem_name
FROM teams t
JOIN problem_statements ps ON ps.id = t.problem_statement_id
WHERE t.event_id = 'evt-solo-2026-001';

SELECT '=== TEAM MEMBERS ===' AS section;
SELECT tm.id, tm.user_id, tm.username, tm.role, tm.status, t.name AS team_name
FROM team_members tm
JOIN teams t ON t.id = tm.team_id
WHERE t.event_id = 'evt-solo-2026-001';
