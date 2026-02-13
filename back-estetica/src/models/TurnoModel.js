import pool from "../config/db.js";
import Turno from "./Turno.js";

class TurnoModel {
  async getFromToday() {
    const query = `
      SELECT id, cliente, servicio, fecha, hora, creado_en
      FROM turnos
      WHERE fecha >= CURRENT_DATE
      ORDER BY fecha ASC, hora ASC;
    `;

    const { rows } = await pool.query(query);
    return rows.map((row) => Turno.fromDatabase(row));
  }

  async findByFechaHora(fecha, hora) {
    const query = `
      SELECT id, cliente, servicio, fecha, hora, creado_en
      FROM turnos
      WHERE fecha = $1 AND hora = $2
      LIMIT 1;
    `;

    const { rows } = await pool.query(query, [fecha, hora]);
    return rows[0] ? Turno.fromDatabase(rows[0]) : null;
  }

  async create(turno) {
    const query = `
      INSERT INTO turnos (cliente, servicio, fecha, hora)
      VALUES ($1, $2, $3, $4)
      RETURNING id, cliente, servicio, fecha, hora, creado_en;
    `;

    const values = [turno.cliente, turno.servicio, turno.fecha, turno.hora];
    const { rows } = await pool.query(query, values);
    return Turno.fromDatabase(rows[0]);
  }

  async deleteById(id) {
    const query = `
      DELETE FROM turnos
      WHERE id = $1
      RETURNING id;
    `;

    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  }
}

export default TurnoModel;
