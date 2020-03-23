<template>
  <div id="app">
    <div :class="css.header">
      <a :class="css.logo" href="https://create.tokylabs.com">
        <img src="static/media/toky.png" />
      </a>

      <!--      <div class="target" id="targetContain">-->
      <!--                Target:&nbsp-->
      <!--        <select id="targetSelect" class="option" onChange="targetSelect()">-->
      <!--          <option selected="selected" value="tokymaker">TokyMaker</option>-->
      <!--          <option value="ar">AR</option>-->
      <!--        </select>-->
      <!--      </div>-->
      <!--      <div class="googlelogo" id="driveIcon" title="Google Drive">-->
      <!--        <img src="static/media/googledriveicon.png" alt="Google Drive" />-->
      <!--      </div>-->

      <!-- <div class="hd_divider">&nbsp</div> -->

      <SwitchBtn />

      <div :class="css.menu">
        <a href="http://tokylabs.com/community" target="_blank">Community</a>
        <a href="http://tokylabs.com/learn" target="_blank">Learn</a>
        <a @click="showHelpView">Help</a>
        <!-- <a onclick="showTab(event)" class="nav-link vertical" id="v-pills-profile-tab" data-toggle="pill" href="#v-pills-profile" role="tab" aria-controls="v-pills-profile" aria-selected="false">Help</a>-->
        <a href="http://tokylabs.com/shop" style="color:#F00" target="_blank"
          >Shop</a
        >
        <!-- Reactive Google sign in button -->
      </div>
      <ConsoleView ref="consoleView" @onShow="onConosleViewShow" />
      <JavascriptView ref="javascriptView" @onShow="onJavascriptShow" />
      <HelpView ref="helpView" />
    </div>
  </div>
</template>

<script>
import HelpView from "./components/HelpView";
import SwitchBtn from "./components/SwitchBtn";
import ConsoleView from "./components/ConsoleView";
import JavascriptView from "./components/JavascriptView";

export default {
  name: "App",
  components: { JavascriptView, ConsoleView, SwitchBtn, HelpView },
  data() {
    return {};
  },
  methods: {
    showHelpView() {
      if (this.$refs.helpView.isShow) {
        this.$refs.helpView.hide();
      } else {
        this.$refs.helpView.show();
      }
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
}

@media all and (max-width: 750px) {
  .header {
    .menu {
      a {
        font-size: 12px;
        margin: 0 6px;
      }
    }
  }
}
</style>
