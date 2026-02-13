class Turno {
  constructor({ id = null, cliente, servicio, fecha, hora, creado_en = null }) {
    this.id = id;
    this.cliente = cliente;
    this.servicio = servicio;
    this.fecha = fecha;
    this.hora = hora;
    this.creado_en = creado_en;
  }

  static fromDatabase(row) {
    return new Turno({
      id: row.id,
      cliente: row.cliente,
      servicio: row.servicio,
      fecha: row.fecha,
      hora: row.hora,
      creado_en: row.creado_en,
    });
  }

  toJSON() {
    return {
      id: this.id,
      cliente: this.cliente,
      servicio: this.servicio,
      fecha: this.fecha,
      hora: this.hora,
      creado_en: this.creado_en,
    };
  }
}

export default Turno;
