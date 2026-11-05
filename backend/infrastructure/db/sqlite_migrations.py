"""Ajustes de esquema para bases SQLite creadas antes de que los modelos
declararan AUTOINCREMENT y el índice único de horarios.

Base.metadata.create_all() solo crea tablas que no existen: no modifica las
que ya están creadas, así que una base de datos antigua se queda con el
esquema viejo. Este módulo corrige eso de forma idempotente al arrancar.

Por qué importa AUTOINCREMENT: sin él, SQLite reutiliza el id más alto que
se haya borrado. Si el usuario eliminaba su última mascota (id=5) y creaba
otra, la nueva recibía también id=5 y "heredaba" las vacunas, diagnósticos
y citas que hubieran quedado apuntando a ese id.
"""

import logging

from sqlalchemy.engine import Engine
from sqlalchemy.schema import CreateIndex, CreateTable

logger = logging.getLogger(__name__)

# Tablas cuyos ids se referencian desde otras (pet_id, appointment.id...).
_AUTOINCREMENT_TABLES = ("pets", "vaccinations", "diagnosis_records", "appointments")


def _table_sql(cursor, name: str) -> str | None:
    row = cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (name,)).fetchone()
    return row[0] if row else None


def _rebuild_with_autoincrement(cursor, engine: Engine, table) -> None:
    """Procedimiento recomendado por SQLite para alterar una tabla: crear la
    nueva, copiar los datos, borrar la vieja y renombrar."""
    tmp = f"{table.name}__new"
    ddl = str(CreateTable(table).compile(engine)).strip()
    ddl = ddl.replace(f"CREATE TABLE {table.name} ", f"CREATE TABLE {tmp} ", 1)

    old_cols = {row[1] for row in cursor.execute(f"PRAGMA table_info({table.name})")}
    cols = ", ".join(c.name for c in table.columns if c.name in old_cols)

    cursor.execute(ddl)
    # Nombres de tabla/columna salen de los modelos (Base.metadata), no de datos del usuario.
    cursor.execute(f"INSERT INTO {tmp} ({cols}) SELECT {cols} FROM {table.name}")  # noqa: S608
    cursor.execute(f"DROP TABLE {table.name}")
    cursor.execute(f"ALTER TABLE {tmp} RENAME TO {table.name}")
    for index in table.indexes:
        if not index.unique:  # los únicos se crean al final, tolerando duplicados
            cursor.execute(_create_index_sql(index, engine))


def _create_index_sql(index, engine: Engine) -> str:
    return str(CreateIndex(index).compile(engine)).replace("INDEX ", "INDEX IF NOT EXISTS ", 1)


def _add_missing_columns(cursor, engine: Engine, table) -> None:
    """Columnas nuevas de los modelos que una base existente aún no tiene.
    Solo se agregan columnas opcionales (nullable): SQLite no puede añadir
    una NOT NULL sin valor por defecto a una tabla con filas."""
    existing = {row[1] for row in cursor.execute(f"PRAGMA table_info({table.name})")}
    for col in table.columns:
        if col.name not in existing and col.nullable:
            col_type = col.type.compile(engine.dialect)
            cursor.execute(f"ALTER TABLE {table.name} ADD COLUMN {col.name} {col_type}")


def _backfill_appointment_pet_names(cursor) -> None:
    """Citas creadas antes de guardar el nombre de la mascota en la cita."""
    cursor.execute(
        "UPDATE appointments SET pet_nombre = "
        "(SELECT nombre FROM pets WHERE pets.id = appointments.pet_id) "
        "WHERE pet_nombre IS NULL AND pet_id IS NOT NULL"
    )


def _delete_orphans(cursor) -> None:
    """Registros clínicos que apuntan a mascotas que ya no existen (restos de
    borrados hechos antes de activar las foreign keys)."""
    cursor.execute("DELETE FROM vaccinations WHERE pet_id NOT IN (SELECT id FROM pets)")
    cursor.execute("DELETE FROM diagnosis_records WHERE pet_id NOT IN (SELECT id FROM pets)")
    cursor.execute(
        "UPDATE appointments SET pet_id = NULL WHERE pet_id IS NOT NULL AND pet_id NOT IN (SELECT id FROM pets)"
    )


def run_sqlite_migrations(engine: Engine) -> None:
    if engine.dialect.name != "sqlite":
        return
    from models import Base

    raw = engine.raw_connection()
    try:
        conn = raw.driver_connection
        conn.isolation_level = None  # control manual de la transacción
        cursor = conn.cursor()
        # Con las FK activas, DROP TABLE pets borraría en cascada las vacunas.
        cursor.execute("PRAGMA foreign_keys=OFF")
        cursor.execute("PRAGMA legacy_alter_table=ON")
        cursor.execute("BEGIN")
        try:
            for name in _AUTOINCREMENT_TABLES:
                sql = _table_sql(cursor, name)
                if sql and "AUTOINCREMENT" not in sql.upper():
                    _rebuild_with_autoincrement(cursor, engine, Base.metadata.tables[name])
            for table in Base.metadata.sorted_tables:
                if _table_sql(cursor, table.name):
                    _add_missing_columns(cursor, engine, table)
            _backfill_appointment_pet_names(cursor)
            _delete_orphans(cursor)
            cursor.execute("COMMIT")
        except Exception:
            cursor.execute("ROLLBACK")
            raise

        # Índice único parcial: dos citas activas no pueden compartir horario.
        # Va aparte porque una base antigua podría ya tener duplicados; en ese
        # caso la validación del servicio sigue protegiendo los nuevos.
        for index in Base.metadata.tables["appointments"].indexes:
            try:
                cursor.execute(_create_index_sql(index, engine))
            except Exception as e:
                logger.warning("No se pudo crear el índice %s: %s", index.name, e)
        cursor.execute("PRAGMA legacy_alter_table=OFF")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
    finally:
        raw.close()
