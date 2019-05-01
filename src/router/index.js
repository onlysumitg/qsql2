/* eslint-disable */
import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import login from "@/components/login/login.vue";
import loginentry from "@/components/login/loginentry.vue";
import forgotpassword from "@/components/login/forgotpassword.vue";

import servers from "@/components/servers/servers.vue";

import libList from "@/components/servers/joblibl.vue";


import sql from "@/components/sql/sql.vue";
import results2multiRecord from "@/components/sql/results2multiRecord.vue";

import createTable from "@/components/create/table.vue";
import results2 from "@/components/sql/results2.vue";

import dbdoc from "@/components/dbdoc/dbdoc.vue";

Vue.use(Router)

export default new Router({
  routes: [
    //{ path: "", component: Home },

    {
      path: "/login",
      component: login,
      name: "Login",
      children: [{
          path: "",
          component: loginentry
        },
        {
          path: "reset",
          component: forgotpassword
        }
      ]
    },

    {
      path: "/servers",
      component: servers,
      name: "servers"
    },

    //----------------------------- start of /sql and children element
    {
      path: "/sql",
      component: sql,
      name: "sql",

      children: [{
          path: '',
          component: results2,
          name: "basesql"
        },
        // libl
        {
          path: "liblist",
          component: libList,
          name: "libList"
        },
        // libl
        {
          path: "createtable",
          component: createTable,
          name: "createtable"
        },
        {
          path: "servers",
          component: servers,
          name: "servers2"
        },


        {
          path: "dbdoc",
          component: dbdoc,
          name: "dbdoc",
          children: [{
            path: '',
            component: results2,
            name: "dbdocbase"
          }]
        },
      ]
    },
    //----------------------------- end of /sql
    {
      path: "/sqldata",
      component: results2multiRecord,
      name: "multidatasql"
    },

    //----------------------------- common redirect >> /redirect-me will go to user
    {
      path: "/redirect-me2",
      redirect: {
        name: "Login"
      }
    },

    // --------- everything else to to home
    {
      path: "/*",
      redirect: "/login"
    }
  ]
})
