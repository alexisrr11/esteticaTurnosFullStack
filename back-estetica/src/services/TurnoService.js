import Turno from "../models/Turno.js";
import TurnoModel from "../models/TurnoModel.js";
import AppError from "../middlewares/AppError.js";

class TurnoService {
  constructor() {
    this.turnoModel = new TurnoModel();
  }

  async getTurnosDesdeHoy() {
    const turnos = await this.turnoModel.getFromToday();
    return turnos.map((turno) => turno.toJSON());
  }

  async createTurno(payload) {
    const { cliente, servicio, fecha, hora } = payload;

    if (!cliente || !servicio || !fecha || !hora) {
      throw new AppError("Faltan datos obligatorios", 400);
    }

    this.#validateFechaNoPasada(fecha);

    const turnoExistente = await this.turnoModel.findByFechaHora(fecha, hora);
    if (turnoExistente) {
      throw new AppError("Ya existe un turno para la fecha y hora indicadas", 409);
    }

    const nuevoTurno = new Turno({ cliente, servicio, fecha, hora });
    const turnoCreado = await this.turnoModel.create(nuevoTurno);

    return turnoCreado.toJSON();
  }

  async deleteTurno(id) {
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      throw new AppError("El id debe ser un entero positivo", 400);
    }

    const deleted = await this.turnoModel.deleteById(Number(id));

    if (!deleted) {
      throw new AppError("Turno no encontrado", 404);
    }
  }

  #validateFechaNoPasada(fecha) {
    const turnoDate = new Date(`${fecha}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(turnoDate.getTime())) {
      throw new AppError("Formato de fecha inválido", 400);
    }

    if (turnoDate < today) {
      throw new AppError("No se pueden crear turnos en fechas pasadas", 400);
    }
  }
}

export default TurnoService;
