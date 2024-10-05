<template>
  <div class="post-view" v-if="currentBlog">
    <div class="container quillwrapper">
      <h2>{{ this.currentBlog?.blogTitle }}</h2>
     <h4>Posted on: {{ new Date(currentBlog.blogDate).toLocaleString("en-us", { dateStyle: "long" }) }}</h4>
    <img :src="this.currentBlog?.blogCoverPhoto" alt="Blog Cover Photo" />
      <div class="post-content ql-editor" v-html="this.currentBlog?.blogHTML"></div>
   
    </div>
  </div>
</template>

<script>
export default {
  name: "ViewBlog",
  data() {
    return {
      currentBlog: null,
    };
  },
 async mounted() {
    this.currentBlog = await this.$store.state.blogPosts.find((post) => post.blogID === this.$route.params.blogId);
  }
};
</script>

<style lang="scss" scoped>
.post-view {
  h4 {
    font-weight: 400;
    font-size: 14px;
    margin-bottom: 24px;
  }
  .container {
    min-width: 100%;
    padding: 60px 25px;
  }
  .ql-editor {
    padding: 0;
  }
  h2 {
    margin-bottom: 16px;
    font-weight: 300;
    font-size: 32px;
  }
  img {
    width: 100%;
    margin-bottom: 32px;
  }
}
</style>