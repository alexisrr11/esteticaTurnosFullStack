import { Router } from "express";
import TurnoController from "../controllers/TurnoController.js";

const router = Router();
const turnoController = new TurnoController();

router.get("/turnos", turnoController.getTurnos);
router.post("/turnos", turnoController.createTurno);
router.delete("/turnos/:id", turnoController.deleteTurno);

export default router;
