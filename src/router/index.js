import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import BlogsView from "../views/BlogsView.vue";
import RegisterView from "../views/RegisterView.vue";
import ForgetPassword from "../views/ForgetPassword.vue";
import LoginView from "../views/LoginView.vue";
import waitView from "../views/waitView.vue";
import CreatePost from "../views/CreatePost.vue";
import BlogPreview from "../views/BlogPreview.vue";
import ViewBlog from "../views/ViewBlog.vue";
import EditBlog from "../views/EditBlog.vue";
import UsersView from "../views/UsersView.vue";
import Profilepatient from "../views/patient/profilePatient.vue";
import IAVetgavalView from "../views/IAVetgavalView.vue";
//import firebase from "firebase/app";
import { getAuth } from "firebase/auth";
import ChatAdmin from "../views/patient/chatAdmin.vue";
import AdminChat from "../views/admin/adminchatView.vue"; 
import adminpageView from "../views/admin/adminpageView.vue";

const routes = [
  {
    path: "/adminpageView",
    name: "adminpageView",
    component: adminpageView,
    props: true,
    meta: { requiresAuth: true }, // Optional: if you want to enforce authentication

  }, 
    
    
  {
    path: "/admin-chat/:userId",
    name: "adminchatView",
    component: AdminChat,
    props: true,
    meta: { requiresAuth: true }, // Optional: if you want to enforce authentication

  },

  {
    path: "/chat/:userId", // Dynamic path parameter
    name: "chat",
    component: ChatAdmin,
    meta: { requiresAuth: true }, // Optional: if you want to enforce authentication
  },
  {
    path: "/",
    name: "HomeView",
    component: HomeView,
    meta: {
      title: "Home",
      requiresAuth: false,
    },
  },
  {
    path: "/UsersView",
    name: "UsersView",
    component: UsersView,
    meta: {
      title: "UsersView",
      //  requiresAdmin: true,
      requiresAuth: true,
    },
  },
  {
    path: "/RegisterView",
    name: "RegisterView",
    component: RegisterView,
    meta: {
      title: "RegisterView",
    },
  },
  {
    path: "/blogsView",
    name: "BlogsView",
    component: BlogsView,
    meta: {
      title: "BlogsView",
      requiresAuth: false,
    },
  },
  {
    path: "/PostPreview",
    name: "BlogPreview",
    component: BlogPreview,
    meta: {
      title: "BlogPreview",
      // requiresAdmin: true,
      requiresAuth: true,
    },
  },
  {
    path: "/view-blog/:blogId",
    name: "ViewBlog",
    component: ViewBlog,
    meta: {
      title: "ViewBlog",
      requiresAuth: false,
    },
  },

  {
    path: "/forgetPassword",
    name: "ForgetPassword",
    component: ForgetPassword,
    meta: {
      title: "ForgetPassword",
      requiresAuth: false,
    },
  },
  {
    path: "/createPost",
    name: "CreatePost",
    component: CreatePost,
    meta: {
      title: "CreatePost",
      // requiresAdmin: true,
      requiresAuth: true,
    },
  },
  {
    path: "/EditBlog/:blogId",
    name: "EditBlog",
    component: EditBlog,
    meta: {
      title: "EditBlog",
      //requiresAdmin: true,
      requiresAuth: false,
    },
  },
  {
    path: "/forgetPassword",
    name: "ForgetPassword",
    component: ForgetPassword,
    meta: {
      title: "ForgetPassword",
      requiresAuth: false,
    },
  },
  {
    path: "/waitView",
    name: "waitView",
    component: waitView,
    meta: {
      title: "waitView",
      requiresAuth: false,
    },
  },
  

  {
    path: "/IAVetgavalView",
    name: "IAVetgavalView",
    component: IAVetgavalView,
    meta: {
      title: "IAVetgavalView",
      //requiresAdmin: true,
      requiresAuth: true,
    },
  },
  {
    path: "/profilepatient",
    name: "Profilepatient",
    component: Profilepatient,
    meta: {
      title: "Profilepatient",
      //requiresAdmin: true,
      requiresAuth: true,
    },
  },

  
  {
    path: "/LoginView",
    name: "LoginView",
    component: LoginView,
    meta: {
      title: "LoginView",
      requiresAuth: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  // Update document title
  document.title = `IA | ${to.meta.title || "IA"} `;

  // Initialize Firebase Auth
  const auth = getAuth();
  const user = auth.currentUser;

  let admin = null;
  if (user) {
    const token = await user.getIdTokenResult();
    admin = !!token.claims.admin;
  }

  // Check if the route requires authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (user) {
      // Check if admin access is required
      if (to.matched.some((record) => record.meta.requiresAdmin)) {
        if (admin) {
          return next();
        } else {
          return next({ name: "Home" }); // Redirect to Home if not admin
        }
      }
      return next();
    }
    return next({ name: "Login" }); // Redirect to Login if not authenticated
  }

  next(); // Allow navigation
});

export default router;
