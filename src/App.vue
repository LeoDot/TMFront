<template>
  <div id="app">
    <div :class="css.header">
      <a :class="css.logo" @click="handleClickLogo">
        <img src="static/media/toky.png" />
      </a>
      <SwitchBtn />
      <div :class="css.menu">
        <a href="http://community.tokylabs.com/" target="_blank">Community</a>
        <a href="http://tokylabs.com/learn" target="_blank">Learn</a>
        <a
          href="http://tokylabs.com/presentations/First_Steps_EN/index.html"
          target="_blank"
          >Help</a
        >
        <a href="http://tokylabs.com/shop" style="color:#F00" target="_blank"
          >Shop</a
        >
      </div>
      <div :class="css.menum" @click="handleClickMenum">
        <i v-show="!showMenu" class="lsharp-menu-icon"></i>
        <i v-show="showMenu" class="lsharp-delete-round"></i>
      </div>

      <ConsoleView ref="consoleView" @onShow="onConosleViewShow" />
      <JavascriptView ref="javascriptView" @onShow="onJavascriptShow" />
    </div>
    <MobileMenu ref="mobileMenu" />
  </div>
</template>

<script>
import SwitchBtn from "./components/SwitchBtn";
import ConsoleView from "./components/ConsoleView";
import JavascriptView from "./components/JavascriptView";
import MobileMenu from "./components/MobileMenu";

export default {
  name: "App",
  components: { MobileMenu, JavascriptView, ConsoleView, SwitchBtn },
  data() {
    return {
      showMenu: false
    };
  },
  methods: {
    handleClickMenum() {
      if (this.showMenu) {
        this.showMenu = false
        this.$refs.mobileMenu.hide();
      } else {
        this.showMenu = true
        this.$refs.mobileMenu.show();
      }
    },
    handleClickLogo() {
      // window.localStorage.removeItem("url");
      window.location.href = window.location.origin + "?clear=true";
    },
    onConosleViewShow() {
      this.$refs.javascriptView.hide();
    },
    onJavascriptShow() {
      this.$refs.consoleView.hide();
    }
  }
};
</script>

<style lang="css" src="../fonts/lsharp.css" />

<style lang="css">
ul,
li {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>

<style lang="scss" module="css">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: rgba(255, 255, 255, 0.6);
  width: 100%;
  height: 100%;
}

.header {
  background: #30197c;
  height: 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .logo {
    margin-left: 6px;

    img {
      height: 25px;
    }
  }

  .menu {
    margin-right: 12px;
    display: flex;

    a {
      color: #fff;
      text-decoration: none;
      margin: 0 12px;
      font-weight: bold;
      cursor: pointer;

      &:hover {
        color: #f80;
      }
    }
  }
  .menum {
    display: none;
  }
}

@media all and (max-width: 750px) {
  .header {
    .menu {
      display: none;
      /*a {*/
      /*  font-size: 12px;*/
      /*  margin: 0 6px;*/
      /*}*/
    }

    .menum {
      display: flex;
      justify-content: center;
      align-items: center;

      > i {
        color: #fff;
        font-size: 26px;
      }

      > i:first-child {
        margin-top: 6px;
      }
      > i:last-child {
      }
    }
  }
}
</style>
