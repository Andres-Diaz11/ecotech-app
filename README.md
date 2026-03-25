## 🔥 Tecnologías
- Firebase Authentication
- Firestore Database

## 📦 Colecciones

### users
- email
- role (admin / user)

### equipos
- nombre
- estado (disponible / prestado)
- creadoPor

### solicitudes
- equipoId
- nombreEquipo
- usuarioId
- estado (pendiente / aceptado / rechazado)

## 🔐 Reglas
- Usuarios autenticados pueden leer
- Usuarios pueden crear solicitudes
- Admin gestiona equipos y solicitudes

## 🔄 Flujo

1. Usuario inicia sesión
2. Usuario solicita equipo
3. Admin acepta/rechaza
4. Si acepta → equipo pasa a "prestado"

el codigo se ejecuta con npx expo start --tunnel por problemas que me generaba al utilizar el otro comando con "-c"
el proyecto como tal esta en app.js donde se encuentra las funciones del CRUD el estado las solicitudes etc 
en firebase.js esta la conexion al generar el app web
en los packages estan las dependencias ya sea para el expo go o el mismo visual
