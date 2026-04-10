const routes = {
  '#dashboard': 'dashboard-view',
  '#exercises': 'exercises-view',
  '#routines': 'routines-view',
  '#sessions': 'sessions-view',
};
const shell = document.querySelector('app-shell');
function getRoute() {
  return routes[window.location.hash] || 'dashboard-view';
}
function renderRoute() {
  const outlet = shell?.querySelector('[data-outlet]');
  if (!outlet) {
    return;
  }
  const routeName = getRoute();
  const view = document.createElement(routeName);
  outlet.replaceChildren(view);
  shell.setActiveRoute(window.location.hash || '#dashboard');
}
window.addEventListener('hashchange', renderRoute);
window.addEventListener('DOMContentLoaded', () => {
  if (!window.location.hash) {
    window.location.hash = '#dashboard';
  }
  renderRoute();
});
