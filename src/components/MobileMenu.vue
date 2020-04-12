<template>
  <div :class="css.page + (isShow ? ' ' + css.active : '')">
    <div :class="css.view">
      <div :class="css.wrap">
        <ul>
          <li>
            <a href="http://community.tokylabs.com/" target="_blank"
              >Community</a
            >
          </li>
          <li>
            <a href="http://tokylabs.com/learn" target="_blank">Learn</a>
          </li>
          <li>
            <a
              href="http://tokylabs.com/presentations/First_Steps_EN/index.html"
              target="_blank"
              >Help</a
            >
          </li>
          <li>
            <a
              href="http://tokylabs.com/shop"
              style="color:#ED2D58"
              target="_blank"
              >Shop</a
            >
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MobileMenu",
  data() {
    return {
      isShow: false
    };
  },
  methods: {
    show() {
      this.isShow = true;
    },
    hide() {
      this.isShow = false;
    }
  }
};
</script>

<style lang="scss" module="css">
.page {
  display: none;
}
@media all and (max-width: 750px) {
  .page {
    display: block;
    position: absolute;
    top: 36px;
    right: 0;
    left: 0;
    bottom: 0;
    overflow: hidden;
    /*padding-top: 78px;*/
    z-index: 100000;
    /*display: none;*/
    pointer-events: none;
    opacity: 0;
    transition: all 0.3s ease-out;

    .view {
      position: absolute;
      top: 0;
      right: 0;
      /*width: 100px;*/
      z-index: 21;
      transition: all 0.3s ease-out;
      transform: translate(0, -100%);
      padding: 2px 4px;
      font-size: 18pt;
      background: rgb(33, 118, 187);

      .wrap {
        ul {
          li {
            padding: 0 12px;

            &:not(:last-child) {
              border-bottom: 1px solid #aaa;
            }

            a {
              color:antiquewhite;
            }
          }
        }
      }
    }

    &.active {
      display: block;
      opacity: 1;
      pointer-events: all;

      .view {
        transform: translate(0, 0);
      }
    }
  }
}
</style>
