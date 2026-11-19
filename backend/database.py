import sqlite3
import os

# Nombre del archivo donde se guardará la base de datos SQLite
DB_NAME = "biblioteca.db"

# Ruta absoluta para asegurar que el archivo .db se cree siempre en la misma carpeta que este script
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), DB_NAME)


def get_db_connection():
    """
    Crea y devuelve una conexión a la base de datos SQLite.
    
    ¿Qué hace especial esta función?
    1. Activa las claves foráneas (PRAGMA foreign_keys = ON) porque SQLite por defecto
       las tiene desactivadas. Sin esto, SQLite no revisaría si el autor_id existe.
    2. Usa sqlite3.Row para que podamos acceder a los campos como si fueran diccionarios
       (ej: fila['titulo'] o fila['nombre']), lo cual facilita pasarlos a JSON.
    """
    conn = sqlite3.connect(DB_PATH)
    # Activamos la verificación de claves foráneas
    conn.execute("PRAGMA foreign_keys = ON;")
    # Configuramos para devolver las filas con nombres de columnas
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Crea las tablas 'autores' y 'libros' si no existen,
    y carga datos iniciales de prueba si la base de datos está vacía.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Creamos la tabla 'autores' (la entidad "1")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS autores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            nacionalidad TEXT NOT NULL
        );
    """)

    # 2. Creamos la tabla 'libros' (la entidad "N")
    # 'disponible' se almacena como INTEGER (1 = True, 0 = False) porque SQLite no tiene tipo booleano nativo.
    # 'autor_id' es la clave foránea que relaciona el libro con un autor específico.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS libros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            genero TEXT NOT NULL,
            anio_publicacion INTEGER NOT NULL,
            disponible INTEGER NOT NULL DEFAULT 1,
            autor_id INTEGER NOT NULL,
            FOREIGN KEY (autor_id) REFERENCES autores (id)
        );
    """)

    # 3. Verificamos si la base de datos ya tiene datos para no duplicarlos al reiniciar
    cursor.execute("SELECT COUNT(*) AS total FROM autores;")
    total_autores = cursor.fetchone()["total"]

    if total_autores == 0:
        print(">> Base de datos vacía. Insertando datos de prueba iniciales...")

        # Insertamos autores famosos de prueba
        autores_iniciales = [
            ("Gabriel García Márquez", "Colombiana"),
            ("Jorge Luis Borges", "Argentina"),
            ("J.K. Rowling", "Británica"),
            ("Antoine de Saint-Exupéry", "Francesa")
        ]
        cursor.executemany(
            "INSERT INTO autores (nombre, nacionalidad) VALUES (?, ?);",
            autores_iniciales
        )

        # Insertamos libros famosos vinculados a los autores anteriores por su ID (1, 2, 3, 4)
        # Campos: titulo, genero, anio_publicacion, disponible (1 o 0), autor_id
        libros_iniciales = [
            ("Cien años de soledad", "Novela", 1967, 1, 1),
            ("El amor en los tiempos del cólera", "Novela", 1985, 1, 1),
            ("Ficciones", "Cuentos", 1944, 1, 2),
            ("El Aleph", "Cuentos", 1949, 0, 2),
            ("Harry Potter y la piedra filosofal", "Fantasía", 1997, 1, 3),
            ("El Principito", "Fábula", 1943, 1, 4)
        ]
        cursor.executemany(
            """
            INSERT INTO libros (titulo, genero, anio_publicacion, disponible, autor_id)
            VALUES (?, ?, ?, ?, ?);
            """,
            libros_iniciales
        )

        # Guardamos los cambios
        conn.commit()
        print(">> Datos de prueba insertados exitosamente.")

    # Cerramos la conexión
    conn.close()
