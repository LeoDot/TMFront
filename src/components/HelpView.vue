<template>
  <div :class="css.page">
    <div :class="css.view + (isShow ? ' ' + css.active : '')">
      <!--      <div :class="css.closeBtn" @click="handleClose">-->
      <!--        <i class="lsharp-delete" />-->
      <!--      </div>-->
      <div :class="css.wrap">
        <ul
          :class="css.list"
          :style="{
            transform: 'translate(-' + this.current * (100 / length) + '%,0'
          }"
        >
          <li v-for="img in imgList" :key="img">
            <img :src="img" />
          </li>
        </ul>
      </div>
      <div :class="css.btnBox">
        <i :class="css.leftBtn + ' lsharp-larrow'" @click="prev" />
        <div :class="css.info">{{ current + 1 }}/{{ length }}</div>
        <i :class="css.rightBtn + ' lsharp-larrow'" @click="next" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HelpView",
  data() {
    return {
      isShow: false,
      length: 10,
      imgList: [],
      current: 0
    };
  },
  created() {
    for (let i = 0; i < this.length; i++) {
      this.imgList.push(null);
    }
    this.fillData(0);
  },
  methods: {
    fillData(n) {
      if (!this.imgList[n]) {
        this.imgList[n] = "/static/media/walk/" + (n + 1) + ".gif";
      }
    },
    show() {
      this.isShow = true;
      this.fillData(1);
    },
    hide() {
      this.isShow = false;
    },
    handleClose() {
      this.hide();
    },
    next() {
      if (this.current < this.length - 1) {
        this.current++;
        if (this.current < this.length - 1) {
          this.fillData(this.current + 1);
        }
      }
    },
    prev() {
      if (this.current > 0) {
        this.current--;
      }
    }
  }
};
</script>

<style lang="scss" module="css">
.page {
  overflow: hidden;
  position: absolute;
  top: 36px;
  right: 0;
  width: 300px;
  height: 300px;
}
.view {
  /*border:1px solid #ccc;*/
  /*box-shadow: -1px 1px 1px 1px #ccc;*/
  position: absolute;
  background: #ccc;
  width: 300px;
  height: 300px;
  top: 0;
  right: 0;
  /*display: flex;*/
  /*justify-content: center;*/
  /*align-items: center;*/
  transition: all 0.3s ease-out;
  transform: translate(0, -100%);
  z-index: 21;

  .btnBox {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s ease-out;

    .info {
      height: 24px;
      padding: 0 10px;
      background: #ccc;
      opacity: 0.9;
      border-radius: 12px;
      display: flex;
      align-items: center;
      font-size: 12px;
    }

    .leftBtn,
    .rightBtn {
      font-size: 30px;
      display: block;
      /*position: absolute;*/
      /*bottom: 5px;*/
      transition: all 0.2s ease-out;
      color: #888;

      &:hover {
        color: #f88;
      }
    }

    .leftBtn {
      left: 6px;
      transform: translate(50%, 0);
    }

    .rightBtn {
      right: 6px;
      transform: scale(-1, 1) translate(50%, 0);
    }
  }

  &:hover {
    .btnBox {
      opacity: 0.8;
      pointer-events: all;

      .leftBtn {
        transform: translate(0, 0);
      }

      .rightBtn {
        transform: scale(-1, 1) translate(0, 0);
      }
    }
  }

  .closeBtn {
    position: absolute;
    top: 0;
    left: -30px;
    width: 30px;
    height: 30px;
    background: #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.6s ease-in;
    transform: translate(100%, 0);
    /*opacity: 0;*/
    /*pointer-events: none;*/

    i {
      display: block;
      font-size: 20px;
      color: #888;
      line-height: 30px;
    }

    &:hover {
      i {
        transition: all 0.2s ease-out;
        color: #f88;
      }
    }
  }

  &.active {
    /*z-index: 21;*/
    transform: translate(0, 0);

    .closeBtn {
      transform: translate(0, 0);
    }
  }

  .wrap {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .list {
      position: absolute;
      background: #ddd;
      /*width: 100%;*/
      height: 100%;
      display: flex;
      transition: all 0.2s ease-out;

      li {
        width: 300px;
        height: 300px;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
        }
      }
    }
  }
}
</style>
