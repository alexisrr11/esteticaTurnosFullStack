import TurnoService from "../services/TurnoService.js";

class TurnoController {
  constructor() {
    this.turnoService = new TurnoService();
  }

  getTurnos = async (req, res, next) => {
    try {
      const turnos = await this.turnoService.getTurnosDesdeHoy();
      return res.status(200).json(turnos);
    } catch (error) {
      return next(error);
    }
  };

  createTurno = async (req, res, next) => {
    try {
      const turno = await this.turnoService.createTurno(req.body);
      return res.status(201).json(turno);
    } catch (error) {
      return next(error);
    }
  };

  deleteTurno = async (req, res, next) => {
    try {
      await this.turnoService.deleteTurno(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}

export default TurnoController;
