from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection, init_db

# ==============================================================================
# CONFIGURACIÓN INICIAL DE FLASK Y CORS
# ==============================================================================
app = Flask(__name__)

# Configuramos CORS (Cross-Origin Resource Sharing).
# Esto permite que el futuro frontend en Angular (que corre en http://localhost:4200)
# pueda comunicarse con esta API de Flask (en http://127.0.0.1:5000) sin ser bloqueado
# por las políticas de seguridad del navegador.
CORS(app, origins=["http://localhost:4200", "http://127.0.0.1:4200"], supports_credentials=True)

# Inicializamos la base de datos (crea tablas y datos iniciales si no existen)
init_db()


# Ruta de bienvenida simple para verificar que el servidor está corriendo
@app.route("/", methods=["GET"])
def inicio():
    return jsonify({
        "mensaje": "¡Bienvenido a la API de la Biblioteca!",
        "version": "1.0",
        "endpoints_disponibles": [
            "/autores",
            "/autores/<id>",
            "/libros",
            "/libros/<id>"
        ]
    }), 200


# ==============================================================================
# CRUD: ENTIDAD PRINCIPAL (AUTORES)
# ==============================================================================

# 1. LISTAR TODOS LOS AUTORES
@app.route("/autores", methods=["GET"])
def obtener_autores():
    """Devuelve la lista completa de autores registrados."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nombre, nacionalidad FROM autores;")
    autores = cursor.fetchall()
    conn.close()

    # Convertimos cada fila de SQLite (Row) en un diccionario normal de Python
    resultado = []
    for autor in autores:
        resultado.append({
            "id": autor["id"],
            "nombre": autor["nombre"],
            "nacionalidad": autor["nacionalidad"]
        })

    return jsonify(resultado), 200


# 2. OBTENER UN AUTOR POR ID
@app.route("/autores/<int:autor_id>", methods=["GET"])
def obtener_autor_por_id(autor_id):
    """Devuelve un solo autor según su ID o error 404 si no existe."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nombre, nacionalidad FROM autores WHERE id = ?;", (autor_id,))
    autor = cursor.fetchone()
    conn.close()

    if autor is None:
        return jsonify({"error": f"No se encontró ningún autor con el ID {autor_id}"}), 404

    return jsonify({
        "id": autor["id"],
        "nombre": autor["nombre"],
        "nacionalidad": autor["nacionalidad"]
    }), 200


# 3. CREAR UN NUEVO AUTOR
@app.route("/autores", methods=["POST"])
def crear_autor():
    """
    Crea un nuevo autor en la base de datos.
    Requiere en el cuerpo JSON: 'nombre' y 'nacionalidad'.
    """
    datos = request.get_json()

    # Validación 1: Verificar que se envió un cuerpo JSON válido
    if not datos:
        return jsonify({"error": "Debe enviar los datos en formato JSON"}), 400

    nombre = datos.get("nombre")
    nacionalidad = datos.get("nacionalidad")

    # Validación 2: Verificar campos obligatorios y que no vengan vacíos
    if not nombre or not isinstance(nombre, str) or not nombre.strip():
        return jsonify({"error": "El campo 'nombre' es obligatorio y debe ser texto no vacío"}), 400

    if not nacionalidad or not isinstance(nacionalidad, str) or not nacionalidad.strip():
        return jsonify({"error": "El campo 'nacionalidad' es obligatorio y debe ser texto no vacío"}), 400

    # Inserción en la base de datos
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO autores (nombre, nacionalidad) VALUES (?, ?);",
        (nombre.strip(), nacionalidad.strip())
    )
    conn.commit()
    nuevo_id = cursor.lastrowid
    conn.close()

    # Retornamos el recurso creado con código HTTP 201 (Created)
    return jsonify({
        "mensaje": "Autor creado exitosamente",
        "autor": {
            "id": nuevo_id,
            "nombre": nombre.strip(),
            "nacionalidad": nacionalidad.strip()
        }
    }), 201


# 4. EDITAR UN AUTOR EXISTENTE
@app.route("/autores/<int:autor_id>", methods=["PUT"])
def actualizar_autor(autor_id):
    """
    Actualiza los datos de un autor por su ID.
    Requiere en el JSON: 'nombre' y 'nacionalidad'.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Verificamos primero si el autor existe
    cursor.execute("SELECT id FROM autores WHERE id = ?;", (autor_id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({"error": f"No se encontró ningún autor con el ID {autor_id} para actualizar"}), 404

    datos = request.get_json()
    if not datos:
        conn.close()
        return jsonify({"error": "Debe enviar los datos a actualizar en formato JSON"}), 400

    nombre = datos.get("nombre")
    nacionalidad = datos.get("nacionalidad")

    # Validamos que los campos obligatorios vengan y sean válidos
    if not nombre or not isinstance(nombre, str) or not nombre.strip():
        conn.close()
        return jsonify({"error": "El campo 'nombre' es obligatorio y debe ser texto no vacío"}), 400

    if not nacionalidad or not isinstance(nacionalidad, str) or not nacionalidad.strip():
        conn.close()
        return jsonify({"error": "El campo 'nacionalidad' es obligatorio y debe ser texto no vacío"}), 400

    # Actualizamos el registro
    cursor.execute(
        "UPDATE autores SET nombre = ?, nacionalidad = ? WHERE id = ?;",
        (nombre.strip(), nacionalidad.strip(), autor_id)
    )
    conn.commit()
    conn.close()

    return jsonify({
        "mensaje": "Autor actualizado exitosamente",
        "autor": {
            "id": autor_id,
            "nombre": nombre.strip(),
            "nacionalidad": nacionalidad.strip()
        }
    }), 200


# 5. BORRAR UN AUTOR
@app.route("/autores/<int:autor_id>", methods=["DELETE"])
def eliminar_autor(autor_id):
    """
    Elimina un autor por su ID.
    
    REGLA DE INTEGRIDAD REFERENCIAL:
    Si el autor tiene libros asociados, NO permitimos su eliminación y retornamos error 400.
    
    ¿Por qué esta opción es más segura que borrar en cascada (CASCADE)?
    En una biblioteca real, si un usuario borra sin querer un autor y el sistema borra
    automáticamente todos sus libros en cascada, se perdería el inventario físico, préstamos
    históricos y registros de libros valiosos. Impedir el borrado protege los datos y obliga
    al usuario a reasignar o eliminar los libros conscientemente antes de remover al autor.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Verificamos si el autor existe
    cursor.execute("SELECT id, nombre FROM autores WHERE id = ?;", (autor_id,))
    autor = cursor.fetchone()
    if autor is None:
        conn.close()
        return jsonify({"error": f"No se encontró ningún autor con el ID {autor_id} para eliminar"}), 404

    # 2. Verificamos si tiene libros asociados
    cursor.execute("SELECT COUNT(*) AS total_libros FROM libros WHERE autor_id = ?;", (autor_id,))
    total_libros = cursor.fetchone()["total_libros"]

    if total_libros > 0:
        conn.close()
        return jsonify({
            "error": f"No se puede borrar el autor porque tiene {total_libros} libro(s) asociado(s). Elimine o reasigne los libros primero."
        }), 400

    # 3. Si no tiene libros, procedemos a borrarlo
    cursor.execute("DELETE FROM autores WHERE id = ?;", (autor_id,))
    conn.commit()
    conn.close()

    return jsonify({
        "mensaje": f"El autor '{autor['nombre']}' fue eliminado correctamente"
    }), 200


# ==============================================================================
# CRUD: ENTIDAD RELACIONADA (LIBROS)
# ==============================================================================

# 1. LISTAR LIBROS (CON FILTROS Y JOIN CON AUTORES)
@app.route("/libros", methods=["GET"])
def obtener_libros():
    """
    Devuelve la lista de libros con el nombre del autor incluido (vía JOIN).
    Permite dos filtros opcionales por URL Query Params:
    - ?autor_id=1 -> Filtra libros de un autor en particular
    - ?busqueda=principito -> Busca texto dentro del título o género
    """
    autor_id = request.args.get("autor_id")
    busqueda = request.args.get("busqueda")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Consulta base con JOIN para traer los datos del libro y el nombre de su autor
    sql = """
        SELECT 
            libros.id,
            libros.titulo,
            libros.genero,
            libros.anio_publicacion,
            libros.disponible,
            libros.autor_id,
            autores.nombre AS autor_nombre
        FROM libros
        INNER JOIN autores ON libros.autor_id = autores.id
    """

    # Construimos las condiciones WHERE dinámicamente según los parámetros recibidos
    condiciones = []
    parametros = []

    # Filtro por autor_id
    if autor_id:
        condiciones.append("libros.autor_id = ?")
        parametros.append(autor_id)

    # Filtro de búsqueda por texto en título o género
    if busqueda:
        condiciones.append("(libros.titulo LIKE ? OR libros.genero LIKE ?)")
        texto_busqueda = f"%{busqueda.strip()}%"
        parametros.append(texto_busqueda)
        parametros.append(texto_busqueda)

    if condiciones:
        sql += " WHERE " + " AND ".join(condiciones)

    sql += " ORDER BY libros.id ASC;"

    cursor.execute(sql, parametros)
    libros = cursor.fetchall()
    conn.close()

    resultado = []
    for libro in libros:
        resultado.append({
            "id": libro["id"],
            "titulo": libro["titulo"],
            "genero": libro["genero"],
            "anio_publicacion": libro["anio_publicacion"],
            "disponible": bool(libro["disponible"]),  # 1 -> True, 0 -> False
            "autor_id": libro["autor_id"],
            "autor_nombre": libro["autor_nombre"]
        })

    return jsonify(resultado), 200


# 2. OBTENER UN LIBRO POR ID
@app.route("/libros/<int:libro_id>", methods=["GET"])
def obtener_libro_por_id(libro_id):
    """Devuelve un libro específico por su ID con el nombre del autor incluido."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            libros.id,
            libros.titulo,
            libros.genero,
            libros.anio_publicacion,
            libros.disponible,
            libros.autor_id,
            autores.nombre AS autor_nombre
        FROM libros
        INNER JOIN autores ON libros.autor_id = autores.id
        WHERE libros.id = ?;
    """, (libro_id,))

    libro = cursor.fetchone()
    conn.close()

    if libro is None:
        return jsonify({"error": f"No se encontró ningún libro con el ID {libro_id}"}), 404

    return jsonify({
        "id": libro["id"],
        "titulo": libro["titulo"],
        "genero": libro["genero"],
        "anio_publicacion": libro["anio_publicacion"],
        "disponible": bool(libro["disponible"]),
        "autor_id": libro["autor_id"],
        "autor_nombre": libro["autor_nombre"]
    }), 200


# 3. CREAR UN NUEVO LIBRO
@app.route("/libros", methods=["POST"])
def crear_libro():
    """
    Crea un nuevo libro asociado a un autor existente.
    Campos obligatorios en JSON: 'titulo', 'genero', 'anio_publicacion', 'autor_id'.
    Campo opcional: 'disponible' (por defecto True).
    """
    datos = request.get_json()

    if not datos:
        return jsonify({"error": "Debe enviar los datos en formato JSON"}), 400

    titulo = datos.get("titulo")
    genero = datos.get("genero")
    anio_publicacion = datos.get("anio_publicacion")
    disponible = datos.get("disponible", True)  # True por defecto si no lo envían
    autor_id = datos.get("autor_id")

    # Validación 1: Campos de texto obligatorios
    if not titulo or not isinstance(titulo, str) or not titulo.strip():
        return jsonify({"error": "El campo 'titulo' es obligatorio y debe ser texto no vacío"}), 400

    if not genero or not isinstance(genero, str) or not genero.strip():
        return jsonify({"error": "El campo 'genero' es obligatorio y debe ser texto no vacío"}), 400

    # Validación 2: Año de publicación debe ser un número entero válido
    try:
        anio_publicacion = int(anio_publicacion)
    except (ValueError, TypeError):
        return jsonify({"error": "El campo 'anio_publicacion' debe ser un número entero válido (ej: 2020)"}), 400

    # Validación 3: autor_id debe ser un entero
    try:
        autor_id = int(autor_id)
    except (ValueError, TypeError):
        return jsonify({"error": "El campo 'autor_id' debe ser un número entero válido"}), 400

    # Validación 4: Verificar que el autor_id exista en la tabla autores
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nombre FROM autores WHERE id = ?;", (autor_id,))
    autor = cursor.fetchone()

    if autor is None:
        conn.close()
        return jsonify({"error": f"El autor_id {autor_id} no existe en la base de datos"}), 400

    # Convertimos disponible a 1 o 0 para SQLite
    disponible_int = 1 if disponible else 0

    # Inserción del libro
    cursor.execute("""
        INSERT INTO libros (titulo, genero, anio_publicacion, disponible, autor_id)
        VALUES (?, ?, ?, ?, ?);
    """, (titulo.strip(), genero.strip(), anio_publicacion, disponible_int, autor_id))

    conn.commit()
    nuevo_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "mensaje": "Libro creado exitosamente",
        "libro": {
            "id": nuevo_id,
            "titulo": titulo.strip(),
            "genero": genero.strip(),
            "anio_publicacion": anio_publicacion,
            "disponible": bool(disponible_int),
            "autor_id": autor_id,
            "autor_nombre": autor["nombre"]
        }
    }), 201


# 4. EDITAR UN LIBRO EXISTENTE
@app.route("/libros/<int:libro_id>", methods=["PUT"])
def actualizar_libro(libro_id):
    """
    Actualiza los datos de un libro existente por su ID.
    Permite modificar titulo, genero, anio_publicacion, disponible y autor_id.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Verificamos si el libro existe
    cursor.execute("SELECT id FROM libros WHERE id = ?;", (libro_id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({"error": f"No se encontró ningún libro con el ID {libro_id} para actualizar"}), 404

    datos = request.get_json()
    if not datos:
        conn.close()
        return jsonify({"error": "Debe enviar los datos en formato JSON"}), 400

    titulo = datos.get("titulo")
    genero = datos.get("genero")
    anio_publicacion = datos.get("anio_publicacion")
    disponible = datos.get("disponible")
    autor_id = datos.get("autor_id")

    # Validamos campos obligatorios
    if not titulo or not isinstance(titulo, str) or not titulo.strip():
        conn.close()
        return jsonify({"error": "El campo 'titulo' es obligatorio y debe ser texto no vacío"}), 400

    if not genero or not isinstance(genero, str) or not genero.strip():
        conn.close()
        return jsonify({"error": "El campo 'genero' es obligatorio y debe ser texto no vacío"}), 400

    try:
        anio_publicacion = int(anio_publicacion)
    except (ValueError, TypeError):
        conn.close()
        return jsonify({"error": "El campo 'anio_publicacion' debe ser un número entero válido"}), 400

    try:
        autor_id = int(autor_id)
    except (ValueError, TypeError):
        conn.close()
        return jsonify({"error": "El campo 'autor_id' debe ser un número entero válido"}), 400

    # Verificamos si el autor_id existe
    cursor.execute("SELECT id, nombre FROM autores WHERE id = ?;", (autor_id,))
    autor = cursor.fetchone()
    if autor is None:
        conn.close()
        return jsonify({"error": f"El autor_id {autor_id} no existe en la base de datos"}), 400

    disponible_int = 1 if disponible else 0

    cursor.execute("""
        UPDATE libros
        SET titulo = ?, genero = ?, anio_publicacion = ?, disponible = ?, autor_id = ?
        WHERE id = ?;
    """, (titulo.strip(), genero.strip(), anio_publicacion, disponible_int, autor_id, libro_id))

    conn.commit()
    conn.close()

    return jsonify({
        "mensaje": "Libro actualizado exitosamente",
        "libro": {
            "id": libro_id,
            "titulo": titulo.strip(),
            "genero": genero.strip(),
            "anio_publicacion": anio_publicacion,
            "disponible": bool(disponible_int),
            "autor_id": autor_id,
            "autor_nombre": autor["nombre"]
        }
    }), 200


# 5. BORRAR UN LIBRO
@app.route("/libros/<int:libro_id>", methods=["DELETE"])
def eliminar_libro(libro_id):
    """Elimina un libro por su ID."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, titulo FROM libros WHERE id = ?;", (libro_id,))
    libro = cursor.fetchone()

    if libro is None:
        conn.close()
        return jsonify({"error": f"No se encontró ningún libro con el ID {libro_id} para eliminar"}), 404

    cursor.execute("DELETE FROM libros WHERE id = ?;", (libro_id,))
    conn.commit()
    conn.close()

    return jsonify({
        "mensaje": f"El libro '{libro['titulo']}' fue eliminado correctamente"
    }), 200


# ==============================================================================
# MANEJADOR GLOBAL DE ERRORES 404 Y 500
# ==============================================================================
@app.errorhandler(404)
def recurso_no_encontrado(error):
    return jsonify({"error": "La ruta o recurso solicitado no existe"}), 404


@app.errorhandler(500)
def error_del_servidor(error):
    return jsonify({"error": "Ocurrió un error interno en el servidor"}), 500


# ==============================================================================
# EJECUCIÓN DEL SERVIDOR
# ==============================================================================
if __name__ == "__main__":
    # debug=True reinicia automáticamente el servidor al hacer cambios en el código
    # y muestra errores detallados en la consola mientras desarrollamos.
    print(">> Servidor Flask de la Biblioteca iniciado en http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
