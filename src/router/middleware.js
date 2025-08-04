import { get_auth_user } from "@/stores/auth";

export default class {
    #router;

    constructor(router) {
        this.#router = router;
        this.checkAuthRoutes();
    }

    checkAuthRoutes() {
        this.#router.beforeEach((to, from, next) => {
            const requiresAuth = to.matched.some(record => record.path.startsWith('/admin'));
            const isAdminPage = to.matched.some(record => record.path.startsWith('/admin'));
            const isAuthenticated = !!get_auth_user.value;

            if (requiresAuth && !isAuthenticated) {
                next({
                    path: '/login',
                    query: { redirect: to.fullPath } 
                });
            }
            else if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
                next({ name: 'admin-dashboard' });
            }
            else {
                next();
            }
        });
    }
}