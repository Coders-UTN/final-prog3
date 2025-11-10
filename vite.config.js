import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // 1. el index es el home de productos
        main: resolve(__dirname, 'src/pages/store/home/home.html'), 

        // auth
        login: resolve(__dirname, 'src/pages/auth/login/login.html'),
        register: resolve(__dirname, 'src/pages/auth/register/register.html'),
        
        //home y cart
        home: resolve(__dirname, 'src/pages/store/home/home.html'),
        cart: resolve(__dirname, 'src/pages/store/cart/cart.html'),

        productDetail: resolve(__dirname, 'src/pages/store/productDetail/productDetail.html'),
        //paginas de cliente
        orders: resolve(__dirname, 'src/pages/client/orders/orders.html'),
        profile: resolve(__dirname, 'src/pages/client/profile/profile.html'),
        //rutas de administrador
        adminProducts: resolve(__dirname, 'src/pages/admin/products/products.html'),
        adminCategories: resolve(__dirname, 'src/pages/admin/categories/categories.html'),
        adminOrders: resolve(__dirname, 'src/pages/admin/orders/orders.html')
       
      },
    },
  },
});