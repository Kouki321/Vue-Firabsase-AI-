<template>
    <div class="post-view">
      <div class="container quillWrapper">
        <h2>{{ this.blogTitle }}</h2>
        <img :src="blogCoverPhoto" alt="" />
        <div class="post-content ql-editor" v-html="blogHTML"></div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "PostPreview",
    computed: {
      blogTitle() {
        return this.$store.state.blogTitle;
      },
      blogCoverPhoto() {
        return this.$store.state.blogPhotoFileURL;
      },
      blogHTML() {
        return this.$store.state.blogHTML;
      },
    },
  };
  </script>
  <style lang="scss" scoped>
  .post-view {
    min-height: 100%;
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
      max-width: 80%;  // Set a maximum width for images
      height: auto;    // Maintain the aspect ratio
      display: block;  // Ensure the image is displayed as a block element
      margin: 0 auto 32px; // Center the image and add bottom margin
    }
  }
  </style>
  