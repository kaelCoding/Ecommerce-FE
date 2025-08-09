import { get_auth_user } from "@/stores/auth";

export default class {
    #router;

    constructor(router) {
        this.#router = router;
        this.checkAuthRoutes();
    }

    checkAuthRoutes() {
        this.#router.beforeEach((to, from, next) => {
            const isAdminPage = to.matched.some(record => record.path.startsWith('/admin'));
            const isAuthenticated = !!get_auth_user.value;
            const user = get_auth_user.value;
            const isAdmin = user && user.admin;

            if (isAdminPage && !isAuthenticated) {
                next({
                    path: '/login',
                    query: { redirect: to.fullPath } 
                });
            }
            else if (isAdminPage && isAuthenticated && !isAdmin) {
                next({ path: '/' });
            }
            else if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
                if (isAdmin) {
                    next({ path: '/admin' });
                } else {
                    next({ path: '/' });
                }
            } 
            else {
                next();
            }
        });
    }
}