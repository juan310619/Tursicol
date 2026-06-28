const db = require('./backend/config/database');

const email = process.argv[2];

if (!email) {
    console.log('Uso: node promote_admin.js <email>');
    process.exit(1);
}

db.run(`UPDATE users SET role = 'admin' WHERE email = ?`, [email], function(err) {
    if (err) {
        console.error('Error al promover usuario:', err.message);
    } else if (this.changes === 0) {
        console.log('No se encontró ningún usuario con ese correo.');
    } else {
        console.log(`¡Éxito! El usuario ${email} ahora es administrador.`);
    }
    process.exit(0);
});
