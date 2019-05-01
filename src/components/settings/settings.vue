<template>
  <div>
    <ul class="list-group">
      <router-link
        class="list-group-item"
        :to="{ name: 'servers2'}"
        tag="li"
        active-class="active"
        exact
      >Servers</router-link>
      <router-link
        class="list-group-item"
        :to="{ name: 'libList'}"
        tag="li"
        active-class="active"
        exact
      >Lib List</router-link>
      <router-link
        class="list-group-item"
        :to="{ name: 'createtable'}"
        tag="li"
        active-class="active"
        exact
      >Create Table</router-link>

      <router-link
        class="list-group-item"
        :to="{ name: 'dbdocbase'}"
        tag="li"
        active-class="active"
        exact
      >DB Doc</router-link>
    </ul>
  </div>
</template>

<script>
export default {
  name: "system_settings",

  methods: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
li {
  display: list-item;
}
.active {
  background-color: blue;
}
</style>
