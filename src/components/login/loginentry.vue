<template>
  <div class="text-center">
    <form class="form-signin" @submit.prevent="validateUser">
      <img class="mb-4" src="/static/avatar.png" alt width="72" height="72">
      <h1 class="h3 mb-3 font-weight-normal">Please sign in</h1>
      <label for="inputEmail" class="sr-only">Email address</label>
      <input
        type="text"
        id="inputEmail"
        class="form-control"
        placeholder="User ID"
        required
        autofocus
        v-model="user"
      >
      <label for="inputPassword" class="sr-only">Password</label>
      <input
        type="password"
        id="inputPassword"
        class="form-control"
        placeholder="Password"
        required
        v-model="password"
      >
      <div class="checkbox mb-3">
        <label>
          <input type="checkbox" value="remember-me"> Remember me
        </label>
      </div>
      <button class="btn btn-lg btn-primary btn-block" type="submit" @click="checkLogin">Sign in</button>
      <p class="mt-5 mb-3 text-muted">&copy; 2017-2018</p>
      <div v-if="showError" class="alert alert-danger" role="alert">{{errorMessage}}</div>
    </form>
  </div>
</template>
<script>
export default {
  data: function() {
    return {
      user: "",
      password: "",
      showError: false,
      errorMessage: ""
    };
  },
  methods: {
    validateUser() {
      if (this.user.trim().length <= 0 || this.password.trim().length <= 0) {
        this.showError = true;
        this.errorMessage = "User name and password required.";
        return false;
      }

      return true;
    },
    checkLogin() {
      if (!this.validateUser()) {
        return;
      }
      this.showError = false;
      this.errorMessage = "";
      var vm = this;
      this.runWebService(
        "/a/gettoken",
        {
          user: vm.user,
          password: vm.password
        },
        function() {},
        function(responce) {
          // console.log("responce")
          // console.log(responce)
          //window.$cookies.set("QSQL_TOKEN", responce.data.token);

          vm.$session.set("QSQL_TOKEN", responce.data.token);
          if (responce.data.token.length >= 0) {
            vm.$router.push({
              path: "/servers"
            });
          } else {
            vm.showError = true;
            vm.errorMessage = responce.data.message;
          }
        },
        function(error) {
          vm.showError = true;
          vm.errorMessage = "" + error;
        }
      );
    }
  }
};
</script>
<style scoped>
html,
body {
  height: 100%;
}

body {
  display: -ms-flexbox;
  display: -webkit-box;
  display: flex;
  -ms-flex-align: center;
  -ms-flex-pack: center;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  padding-top: 40px;
  padding-bottom: 40px;
  background-color: #f5f5f5;
}

.form-signin {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: 0 auto;
}
.form-signin .checkbox {
  font-weight: 400;
}
.form-signin .form-control {
  position: relative;
  box-sizing: border-box;
  height: auto;
  padding: 10px;
  font-size: 16px;
}
.form-signin .form-control:focus {
  z-index: 2;
}
.form-signin input[type="text"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
