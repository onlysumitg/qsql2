<template>
  <div class="h-100">
    <table class="i-table table table-striped table-bordered table-sm table-hover">
      <thead>
        <tr>
          <th>Type</th>
          <th>Lib</th>
          <th>Text</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(lib,i) in libl" :key="i">
          <td>{{lib.type.trim()}}</td>
          <td>{{lib.lib.trim()}}</td>
          <td>{{lib.text.trim()}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  data: function() {
    return {
      processing: false,
      libl: {}
    };
  },
  mounted() {
    this.loadLibl();
  },

  methods: {
    initialize() {
      this.loadLibl();
    },
    loadLibl() {
      var vm = this;
      this.runWebService(
        "s/libl",
        {
          id: vm.$session.get("currentserver")
        },

        function() {
          vm.processing = true;
        },
        function(respons) {
          console.log(respons);
          vm.processing = false;
          if (respons.data.status == "s") {
            vm.libl = respons.data.libl;
          }
        },
        function(error) {
          vm.processing = false;
        }
      );
    }
  }
};
</script>




<style>
.i-table {
  white-space: nowrap;
  overflow: visible;
}
.checkbox-custom {
  display: none;
}

.checkbox-custom-label {
  display: inline-block;
  position: relative;
  vertical-align: middle;
  margin: 5px;
  cursor: pointer;
}

.checkbox-custom + .checkbox-custom-label:before {
  content: "";
  background: #fff;
  border-radius: 5px;
  border: 1px solid #ddd;
  display: inline-block;
  vertical-align: middle;

  width: 24px;
  height: 24px;
  padding: 2px;
  margin-right: 10px;
}

.checkbox-custom:checked + .checkbox-custom-label:after {
  content: "";
  padding: 2px;
  position: absolute;
  width: 12px;
  height: 25px;
  border: solid #53bafc;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
  top: -6px;
  left: 10px;
}

.content-container {
  padding: 8px 10px;
  display: flex;
}
</style>
