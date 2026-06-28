// Importamos el módulo "express" el cual sirve para crear servidores web de manera muy sencilla.
const express = require('express');


const path = require('path');


const app = express();


app.use(express.static(__dirname));


const PORT = 3000;

const server = app.listen(PORT, () => {
    console.log(`✅ Servidor levantado exitosamente.`);
    console.log(`🌐 Haz Ctrl + clic en: http://localhost:${server.address().port}`);

});

server.on('error', (error) => {
    // Si el error detectado es "EADDRINUSE" el cual significa que el puerto 3000 ya está en uso.
    if (error.code === 'EADDRINUSE') {
        console.log(`\n⚠️  El puerto ${PORT} está ocupado por otra aplicación.`);
        console.log(`🔄 Buscando un puerto libre automáticamente...`);


        setTimeout(() => {
            server.close();


            app.listen(0, function () {

                console.log(`✅ Servidor levantado exitosamente en un puerto alternativo.`);
                console.log(`🌐 Haz Ctrl + clic en: http://localhost:${this.address().port}`);

            });
        }, 1000);
    } else {

        console.error("❌ Ocurrió un error inesperado al iniciar el servidor:", error);
    }
});
