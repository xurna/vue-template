<template>
  <div class="hello">
    <h2>User</h2>
  </div>
</template>

<script>
import HelloWord from 'cmp/Hello'
export default {
  name: 'User',
  data() {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  components: {
    HelloWord,
  },
  created(){
  },
  methods:{
    setMsg() {
      this.msg = 'hello world'
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
@import "~less/variables";
.hello{
  margin-top: 20px;
}
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
  a {
    color: #42b983;
  }
}
</style>
