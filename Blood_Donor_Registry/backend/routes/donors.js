// ROUTES: the four REST operations (Create, Read, Update, Delete) for donors.
const express = require('express');
const { pool } = require('../db');

const router = express.Router();

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Columns returned to the client (snake_case in DB -> camelCase in JSON).
const COLUMNS = `id, full_name AS "fullName", age, blood_type AS "bloodType",
  contact_number AS "contactNumber", address, last_donation_date AS "lastDonationDate"`;

// VALIDATION: checks incoming data and returns a list of problems (empty list = OK).
function validateDonor(body) {
  const errors = [];
  const { fullName, age, bloodType, contactNumber, lastDonationDate } = body || {};

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2)
    errors.push('Full name is required (at least 2 characters).');

  const ageNum = Number(age);
  if (!Number.isInteger(ageNum) || ageNum < 16 || ageNum > 65)
    errors.push('Age must be a whole number between 16 and 65.');

  if (!BLOOD_TYPES.includes(bloodType))
    errors.push(`Blood type must be one of: ${BLOOD_TYPES.join(', ')}.`);

  if (!contactNumber || !/^[0-9+\-\s]{7,15}$/.test(contactNumber))
    errors.push('Contact number is required (7-15 digits, may include + or -).');

  if (lastDonationDate) {
    const d = new Date(lastDonationDate);
    if (isNaN(d.getTime())) errors.push('Last donation date is not a valid date.');
    else if (d > new Date()) errors.push('Last donation date cannot be in the future.');
  }
  return errors;
}

// Turns the request body into the list of values for the SQL query.
function toValues(b) {
  return [
    b.fullName.trim(),
    Number(b.age),
    b.bloodType,
    b.contactNumber.trim(),
    (b.address || '').trim(),
    b.lastDonationDate || null,
  ];
}

// Rejects bad ids with 400 instead of crashing the query.
function checkId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1 || id > 2147483647)
    return res.status(400).json({ error: 'Invalid donor id.' });
  next();
}

// CREATE -> POST /api/donors   (201 Created)
router.post('/', async (req, res, next) => {
  try {
    const errors = validateDonor(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(' ') });
    const { rows } = await pool.query(
      `INSERT INTO donors (full_name, age, blood_type, contact_number, address, last_donation_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING ${COLUMNS}`,
      toValues(req.body)
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// READ ALL -> GET /api/donors   (200 OK, newest first)
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM donors ORDER BY id DESC`);
    res.json(rows);
  } catch (err) { next(err); }
});

// READ ONE -> GET /api/donors/:id   (404 if not found)
router.get('/:id', checkId, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM donors WHERE id = $1`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Donor not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// UPDATE -> PUT /api/donors/:id   (404 if not found)
router.put('/:id', checkId, async (req, res, next) => {
  try {
    const errors = validateDonor(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(' ') });
    const { rows } = await pool.query(
      `UPDATE donors
       SET full_name=$1, age=$2, blood_type=$3, contact_number=$4, address=$5, last_donation_date=$6
       WHERE id=$7 RETURNING ${COLUMNS}`,
      [...toValues(req.body), req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Donor not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE -> DELETE /api/donors/:id   (404 if not found)
router.delete('/:id', checkId, async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM donors WHERE id = $1 RETURNING id', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Donor not found.' });
    res.json({ message: 'Donor deleted.', id: rows[0].id });
  } catch (err) { next(err); }
});

module.exports = router;
