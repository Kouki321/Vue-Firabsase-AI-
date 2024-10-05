<template>
  <div class="create-post">
    <BlogCoverPreview v-show="this.$store.state.blogPhotoPreview"></BlogCoverPreview>
    <Loading v-show="loading"></Loading>
    <div class="container">
      <div :class="{ invisible: !error }" class="err-message">
        <p><span>Error:</span> {{ errorMsg }}</p>
      </div>
      <div class="blog-info">
        <input type="text" placeholder="Enter Blog Title" v-model="blogTitle" />
        <div class="upload-file">
          <label for="blog-photo">Upload Cover Photo</label>
          <input
            type="file"
            ref="blogPhoto"
            name=""
            id="blog-photo"
            accept=".png, .jpg, .jpeg"
            @change="fileChange"
          />
          <button
            class="preview"
            :class="{ 'button-inactive': !this.$store.state.blogPhotoFileURL }"
            @click="openPreview"
          >
            Preview your Photo
          </button>
          <span>File chosen: {{ this.$store.state.blogPhotoName }}</span>
        </div>
      </div>
      <div class="editor">
        <div ref="quillEditorContainer"></div>
      </div>
      <div class="blog-actions">
        <button @click="uploadBlog">Publish Blog</button>
        <router-link class="router-button" :to="{ name: 'BlogPreview' }">Post Preview</router-link>
      </div>
    </div>
  </div>
</template>



<script>
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, storage } from "../firebase/firebaseInit";
import Quill from 'quill';
import BlogCoverPreview from "../components/BlogCoverPreview.vue";
import Loading from "../components/LoadingView.vue";

export default {
  name: "CreatePost",
  components: {
    BlogCoverPreview,
    Loading,
  },
  data() {
    return {
      error: null,
      errorMsg: null,
      file: null,
       quill: null,
      loading: false,
    };
  },
  methods: {
    async imageHandler(file, Editor, cursorLocation, resetUploader) {
      try {
        const storageReference = storageRef(storage, `documents/blogCoverPostPhotos/${this.file.name}`);
        const uploadTask = uploadBytesResumable(storageReference, this.file);
        uploadTask.on('state_changed', 
          (snapshot) => {
            console.error(snapshot);
           },
          (error) => {
             console.error("Error uploading image:", error);
          }, 
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            Editor.insertEmbed(cursorLocation, "image", downloadURL);
            resetUploader();
          }
        );
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    },
    openPreview() {
      console.log(this.blogHTML);
      this.$store.commit("openPhotoPreview");
    },
    fileChange() {
      this.file = this.$refs.blogPhoto.files[0];
      const fileName = this.file.name;
      this.$store.commit("fileNameChange", fileName);
      this.$store.commit("createFileURL", URL.createObjectURL(this.file));
    },
    async uploadBlog() {
    if (this.blogTitle.length !== 0 && this.blogHTML.length !== 0) {
      if (this.file) {
        this.loading = true;
        const blogRef = doc(collection(db, "blogPosts"));
        const storageReference = storageRef(storage, `documents/BlogCoverPhotos/${blogRef.id}`);
        const uploadTask = uploadBytesResumable(storageReference, this.file);

        uploadTask.on('state_changed',
          (snapshot) => {
            console.log("snapshot", snapshot);
          },
          (err) => {
            console.log("err", err);
            this.loading = false;
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const timestamp = Date.now();

            console.log("Uploading blog with data:", {
              blogID: blogRef.id,
              blogHTML: this.blogHTML,
              blogCoverPhoto: downloadURL,
              blogCoverPhotoName: this.blogPhotoName,
              blogTitle: this.blogTitle,
              profileId: this.profileId,
              date: timestamp,
            });

            await setDoc(blogRef, {
              blogID: blogRef.id,
              blogHTML: this.blogHTML || "",
              blogCoverPhoto: downloadURL || "",
              blogCoverPhotoName: this.blogPhotoName || "",
              blogTitle: this.blogTitle || "",
              profileId: this.profileId || "",
              date: timestamp,
            });
     
            await this.$store.dispatch("getPost");
            this.loading = false;
            
            this.$router.push({
            name: 'ViewBlog',
            params: { blogId: blogRef.id } // Ensure `blogId` matches the route param
          });
          }
        );
        return;
      }
      this.error = true;
      this.errorMsg = "Please ensure you uploaded a cover photo!";
      setTimeout(() => {
        this.error = false;
      }, 4000);
      return;
    }
    this.error = true;
    this.errorMsg = "Please ensure Blog Title & Blog Post have been filled!";
    setTimeout(() => {
      this.error = false;
    }, 4000);
    return;
  },
    getEditorContent() {
      const content = this.quill.getText();
      console.log("cint",content);
    },
  },
  mounted() {  
    this.quill = new Quill(this.$refs.quillEditorContainer, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['image', 'code-block'],
        ],
      },
      placeholder: "write here",
    });
    this.quill.on('text-change', () => {
      this.blogHTML = this.quill.root.innerHTML;
    });
  },
  computed: {
    profileId() {
      return this.$store.state.profileId;
    },
    blogPhotoName() {
      return this.$store.state.blogPhotoName;
    },
    blogTitle: {
      get() {
        return this.$store.state.blogTitle;
      },
      set(payload) {
        this.$store.commit("updateBlogTitle", payload);
      }
    },
    blogHTML: {
      get() {
        return this.$store.state.blogHTML;
      },
      set(payload) {
        this.$store.commit("newBlogPost", payload);
      }
    }
  },
};
</script>



<style lang="scss" scoped>
.create-post {
  position: relative;
  height: 100%;
  button {
    margin-top: 0;
  }
  .router-button {
    text-decoration: none;
    color: #fff;
  }
  label,
  button,
  .router-button {
    transition: 0.5s ease-in-out all;
    align-self: center;
    font-size: 14px;
    cursor: pointer;
    border-radius: 20px;
    padding: 12px 24px;
    color: #fff;
    background-color: #16c536;
    text-decoration: none;

    &:hover {
      background:green
    }
  }
  .container {
    position: relative;
    height: 100%;
    padding: 10px 25px 60px;
  }
  .invisible {
    opacity: 0 !important;
  }
  .err-message {
    width: 100%;
    padding: 12px;
    color: #fff;
    border-radius: 8px;
    margin-bottom: 10px;
    background: #303030;
    opacity: 1;
    transition: 0.5s ease all;
    p {
      font-size: 14px;
    }
    span {
      font-weight: 600;
    }
  }
  .blog-info {
    display: flex;
    margin-bottom: 32px;

    input {
      transition: 0.5s ease-in-out all;
      padding: 10px 4px;
      border: none;
      border-bottom: 1px solid #303030;
      &:nth-child(1) {
        min-width: 300px;
      }
      &:focus {
        outline: none;
        box-shadow: 0 1px 0 0 #303030;
      }
    }
    .upload-file {
      flex: 1;
      margin-left: 16px;
      position: relative;
      display: flex;
      label {
        margin-right: 16px;
      }
      input {
        display: none;
      }
      .preview {
        margin-right: 16px;
        text-transform: initial;
      }
      span {
        font-size: 12px;
        margin-left: 16px;
        align-self: center;
      }
    }
  }
  .blog-actions {
    button {
      margin-right: 20px;
    }
  }
  .editor {
    height: 40vh;
    display: flex;
    flex-direction: column;
    margin-bottom: 78px;
    .quillWrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      .ql-editor {
        padding: 20px 16px 30px;
      }
    }
  }
}
</style>

