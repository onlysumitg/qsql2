<template>
  <div class="h-100" style="padding:10px">
    <h5 style="color:#448aff">Library list</h5>

    <form novalidate>
      <div v-for="(lib,index) in selectedServer.libl" :key="lib+''+index">
        {{index+1}}.
        <input
          type="text"
          class="localField"
          v-model.lazy="selectedServer.libl[index]"
          :id="lib+''+index"
        >
      </div>
    </form>
  </div>
</template>
<script>
export default {
  props: {
    selectedServer: {
      type: Object,
      required: false
    }
  },
  //------------------------------------------
  data: function() {
    return {};
  }
  //---------------------------------
};
</script>
<style scoped>
input:focus {
  border-bottom: 2px solid #448aff;
}

.localField {
  margin-top: 6px;
  padding-top: 4px;
  min-height: 12px;
  max-width: 90%;
  width: 100%;
  border: none;
  border-bottom: 1px solid black;
}
</style>

