<template>
 
   <div class="md-layout md-gutter">
    <div class="md-layout-item">
       <serverlist  @selectedserver="selectedServer = $event"></serverlist>
    </div>
    <div class="md-layout-item">
       <serveredit :selectedServer="selectedServer"></serveredit>
    </div>
    <div class="md-layout-item">
      <serverlibl :selectedServer="selectedServer"></serverlibl>
    </div>
  </div>

</template>
<script>
import serverlist from "./serverlist";
import serveredit from "./serveredit";
import serverlibl from "./serverlibl";
export default {
  components: {
    serverlist,
    serveredit,
    serverlibl
  },

  watch: {
    selectedServer: {
      handler: function(after, before) {
        if (before.id == 0 && after.id > 0) {
          //alert("assign")
        } else {
          // alert("okkcc")

          after.modified = true;
        }
      },
      deep: true
    }
  },

  data: function() {
    return {
      selectedServer: {
        id: 0,
        serverName: "",
        serverIP: "",
        userName: "",
        password: "",
        ssl: false,
        libl: new Array(20),
        modified: false
      }
    };
  }
};
</script>
<style>
.fill {
  min-height: 100%;
  height: 100%;
}

.allowscroll {
  overflow-y: scroll;
}
</style>
