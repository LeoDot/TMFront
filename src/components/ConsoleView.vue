<template>
  <div :class="css.page" v-if="isEnable">
    <div :class="css.view + (isShow ? ' ' + css.active : '')">
      <div :class="css.btn" @click="handleClick">
        Console <i class="lsharp-right2"></i>
      </div>
      <div :class="css.wrap">
        <textarea
          ref="text"
          :class="css.output"
          disabled="disabled"
          v-model="msg"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ConsoleView",
  data() {
    return {
      isEnable: true,
      isShow: false,
      msg: ">data from Tokymaker"
    };
  },
  created() {
    window.consoleView = {};
    window.consoleView.appendMsg = this.appendMsg;
    window.consoleView.setMsg = this.setMsg;
    window.consoleView.enable = this.enable;
    window.consoleView.disable = this.disable;
  },
  methods: {
    enable() {
      this.isEnable = true;
    },
    disable() {
      this.isEnable = false;
    },
    show() {
      this.isShow = true;
      this.$emit("onShow");
    },
    hide() {
      this.isShow = false;
      this.$emit("onHide");
      // window.msgViewHide && window.msgViewHide();
    },
    setMsg(msg) {
      this.msg = msg || "";
    },
    appendMsg(msg, scroll) {
      this.msg += msg;
      if (scroll) {
        this.$refs.text.scrollTop = this.$refs.text.scrollHeight;
      }
    },
    handleClick() {
      if (this.isShow) {
        this.hide();
      } else {
        this.show();
      }
    }
  }
};
</script>

<style lang="scss" module="css">
.page {
  position: absolute;
  top: 78px;
  right: 0;
  height: calc(100% - 78px);
  width: 260px+28px;
  overflow: hidden;
  /*padding-top: 78px;*/
}

.view {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 260px;
  /*overflow: hidden;*/
  z-index: 21;
  transition: all 0.2s ease-out;
  transform: translate(100%, 0);
  background: #eef;
  border: 1px solid #aaa;

  .btn {
    width: 100px;
    height: 28px;
    transform: rotate(90deg);
    position: absolute;
    top: 160px;
    left: -64px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease-out;
    color: #fff;
    background: #4895e4;

    &:hover {
      background: #55a0ff;
    }

    > i {
      transition: all 0.2s ease-out;
      transform: rotate(90deg);
      margin-top: 4px;
    }
  }

  &.active {
    transform: translate(0, 0);

    .btn {
      > i {
        transform: rotate(90deg) scale(-1, 1);
      }
    }
  }

  .wrap {
    position: absolute;
    top: 0;
    right: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;

    padding: 2px;

    .output {
      background: #efefef;
      width: 100%;
      height: 100%;
      resize: none;
      border: none;

      cursor: auto;
      font-family: Courier, sans-serif;
      font-size: 16px;
      overflow-y: scroll;
    }
  }
}
@media all and (max-width: 512px) {
  .page {
    height: calc(100% - 78px);
    width: calc(76% + 28px);
  }

  .view {
    width: calc(100% - 32px);
  }
}
</style>
