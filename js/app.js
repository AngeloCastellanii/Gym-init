/**
 * ============================================================
 *  Gym-Init — Punto de Entrada Principal
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await GymDB.init();
    await seedDatabase();  // Inserta ejercicios/rutinas solo si la DB está vacía
    console.log('Base de Datos (Gym-Init) Lista');
    appRouter.init();
  } catch (err) {
    console.error('Error durante el arranque:', err);
    const outlet = document.getElementById('app-outlet');
    if (outlet) {
      outlet.innerHTML = `
        <div style="padding:100px 20px; text-align:center;">
          <h2 style="color:var(--danger);">Error al iniciar la aplicación</h2>
          <p style="color:var(--text-muted); margin-top:10px;">${err.message}</p>
        </div>
      `;
    }
  }
});
