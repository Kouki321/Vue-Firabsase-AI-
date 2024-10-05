<template>
  <footer>
    <div class="container">
      <div class="left">
        <div class="col-1">
          <router-link class="link" :to="{ name: 'HomeView' }"
            >Medical Center</router-link
          >
        </div>
        <div class="col-2">
          <ul>
            <li>
              <a href="https://www.instagram.com/amine.kouk/"
                ><img
                  src="../assets/Icons/iconsa/instagram.svg"
                  class="svg-icon"
              /></a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/mohamed-amine-kouki-587a6a1aa/"
                ><img
                  src="../assets/Icons/iconsa/linkedin.svg"
                  class="svg-icon"
              /></a>
            </li>
            <li>
              <a href="https://www.facebook.com/ochi.amine/"
                ><img
                  src="../assets/Icons/iconsa/facebook.svg"
                  class="svg-icon"
              /></a>
            </li>
          </ul>
        </div>
      </div>
      <div class="center">
        <p>Kouki Mohamed Amine</p>
      </div>
      <div class="right">
        <p>Copyright 2022 All Rights Reserved</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "footer-vue",

  computed: {
    user() {
      return this.$store.state.user;
    },
    admin() {
      return this.$store.state.profileAdmin;
    },
  },
};
</script>

<style lang="scss" scoped>
footer {
  margin-top: auto;
  padding: 60px 20px; // Adjust padding for a balanced appearance
  background: linear-gradient(87deg, #03b84f,green);
  color: #fff;

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;

    @media (min-width: 800px) {
      flex-direction: row;
      justify-content: space-between; // Spread left and right sections
    }
  }

  .left {
    display: flex;
    flex: 1;
    flex-direction: row;
    gap: 30px;
    align-items: center;
    justify-content: center; // Center the content of the left section

    @media (min-width: 800px) {
      justify-content: center; // Center align on larger screens as well
    }

    .col-1 {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .link {
        font-size: 24px;
        font-weight: bold;
        color: #fff;
        text-decoration: none;
        transition: color 0.3s;

        &:hover {
          color: #d3d3d3; // Subtle hover effect
        }
      }
    }

    .col-2 {
      display: flex;
      align-items: center;

      ul {
        display: flex;
        gap: 16px; // Consistent spacing between icons
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .svg-icon {
        width: 24px;
        height: auto;
        fill: #fff; // Ensure icons are white
        transition: transform 0.3s;

        &:hover {
          transform: scale(1.1); // Hover effect for icons
        }
      }
    }
  }

  .right {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-end; // Align content to the right
    justify-content: center;
    text-align: right;
    font-size: 14px;
    opacity: 0.8;

    @media (max-width: 800px) {
      align-items: center; // Center align on smaller screens
      text-align: center;
    }

    p {
      margin: 0;
    }
  }
}

</style>
